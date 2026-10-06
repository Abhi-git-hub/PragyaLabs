import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { env } from '../config/env.js';
import { getStore } from '../db/store.js';
import { encryptSecret, isEncryptionEnabled } from '../security/crypto.js';
import { accountSchema, campaignSchema, csvCampaignImportSchema, csvCampaignPreviewSchema, leadImportSchema, suppressionSchema, testEmailSchema } from './schemas.js';
import { analyzeCsv, csvCell, defaultMapping, mapRowToLead } from '../leads/csv.js';
import { isValidEmail } from '../email/validation.js';
import { runPreflight } from '../campaigns/preflight.js';
import { importCsvCampaign, previewCsvCampaign, excludeMissingRecipients, MAX_CSV_BYTES } from '../campaigns/csv-import.js';
import { buildQueue } from '../queue/queue.js';
import { configFromAccount, verifyConnection, sendOne, classifySmtpStatus } from '../email/sender.js';
import { sanitizeEmailHtml, htmlToText } from '../email/sanitize.js';
import { renderStrict, buildLeadContext, sanitizeSubject } from '../email/template.js';
import { runWorker } from '../worker/worker.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '8mb' }));

// Never log secrets.
app.use((req, _res, next) => {
  const q = { ...req.body } as Record<string, unknown>;
  for (const k of Object.keys(q)) if (/password|secret|token/i.test(k)) q[k] = '[REDACTED]';
  next();
});

function sanitizeAccount<T extends { password_enc?: unknown }>(a: T): Omit<T, 'password_enc'> {
  const { password_enc: _drop, ...rest } = a;
  void _drop;
  return rest;
}

// CSV upload handling: multipart/form-data `file` (.csv, ≤5MB) or JSON {csv}.
// Never trusts arbitrary content: type, size and row counts enforced server-side.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CSV_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (/\.csv$/i.test(file.originalname)) cb(null, true);
    else cb(new Error('Only .csv files are accepted'));
  },
});

function parseUpload(req: express.Request): Promise<{ text: string; fields: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    upload.single('file')(req, undefined as unknown as express.Response, (err: unknown) => {
      if (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const status = /too large|LIMIT_FILE_SIZE/i.test(msg) ? 413 : 400;
        reject(Object.assign(new Error(msg), { status }));
        return;
      }
      const file = (req as express.Request & { file?: { buffer: Buffer } }).file;
      const fields = (req.body ?? {}) as Record<string, unknown>;
      if (file) {
        // Multipart text fields arrive as strings; `roles` may be JSON-encoded.
        if (typeof fields.roles === 'string' && fields.roles.trim()) {
          try { fields.roles = JSON.parse(fields.roles) as unknown; }
          catch { reject(Object.assign(new Error('Invalid roles mapping'), { status: 400 })); return; }
        }
        resolve({ text: file.buffer.toString('utf8'), fields });
      } else {
        resolve({ text: typeof fields.csv === 'string' ? fields.csv : '', fields });
      }
    });
  });
}

function importHttpError(res: express.Response, e: unknown): void {
  const status = (e as { status?: number })?.status ?? 400;
  const message = e instanceof Error ? e.message : String(e);
  res.status(status).json({ error: message });
}

// Live SMTP probe for preflight: real verification with a short timeout.
// Only deterministic AUTH failures block; network outcomes warn.
function liveSmtpProbe(store: ReturnType<typeof getStore>, accountId: string | null) {
  if (!accountId) return undefined;
  return async () => {
    const acc = await store.getAccount(accountId);
    if (!acc) return { ok: false, code: 'UNKNOWN', message: 'Sender account no longer exists' };
    try {
      await verifyConnection(configFromAccount(acc), { timeoutMs: 8000 });
      await store.updateAccount(acc.id, { last_test_at: new Date().toISOString(), last_test_status: 'CONNECTED' });
      return { ok: true, code: 'CONNECTED', message: `SMTP connected (${acc.smtp_host}:${acc.smtp_port})` };
    } catch (e) {
      const s = classifySmtpStatus(e);
      await store.updateAccount(acc.id, { last_test_at: new Date().toISOString(), last_test_status: `FAILED: ${s.code}` });
      return { ok: false, code: s.code, message: `${s.message} ${s.fix}` };
    }
  };
}

// The CSV rejected-row report lives on the draft's preflight payload; keep it
// across validate/start overwrites (no schema change).
function keepCsvImportReport<T extends object>(
  campaign: { preflight?: Record<string, unknown> | null },
  preflight: T,
): T & { csvImport?: unknown } {
  const prev = campaign.preflight as { csvImport?: unknown } | null | undefined;
  if (prev?.csvImport) return { ...preflight, csvImport: prev.csvImport };
  return preflight;
}

// ---------- ACCOUNTS ----------
app.get('/api/accounts', async (_req, res) => {
  const store = getStore();
  const list = await store.listAccounts();
  res.json({ accounts: list.map(sanitizeAccount), encryption: isEncryptionEnabled() ? 'aes-256-gcm' : 'obscured-only' });
});

app.post('/api/accounts', async (req, res) => {
  const parsed = accountSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const v = parsed.data;
  const store = getStore();
  const row = await store.createAccount({
    display_name: v.display_name, email: v.email, smtp_host: v.smtp_host,
    smtp_port: v.smtp_port, security: v.security, username: v.username,
    password_enc: encryptSecret(v.password),
    daily_limit: v.daily_limit, delay_seconds: v.delay_seconds,
    last_test_at: null, last_test_status: null,
  });
  await store.addEvent({ campaign_id: null, message_id: null, lead_id: null, type: 'account_created', detail: { account: row.id } });
  res.status(201).json({ account: sanitizeAccount(row) });
});

app.post('/api/accounts/:id/test-connection', async (req, res) => {
  const store = getStore();
  const acc = await store.getAccount(req.params.id as string);
  if (!acc) return res.status(404).json({ error: 'account not found' });
  try {
    await verifyConnection(configFromAccount(acc)); // real SMTP verify, no mail sent
    await store.updateAccount(acc.id, { last_test_at: new Date().toISOString(), last_test_status: 'CONNECTED' });
    res.json({ status: 'CONNECTED', code: 'CONNECTED' });
  } catch (e) {
    // Granular outcome (CONNECTED / AUTH_FAILED / TIMEOUT / REJECTED / UNKNOWN)
    // plus a fix hint — never a bare failure.
    const s = classifySmtpStatus(e);
    await store.updateAccount(acc.id, { last_test_at: new Date().toISOString(), last_test_status: `FAILED: ${s.code}` });
    res.status(502).json({ status: 'FAILED', code: s.code, error: s.message, fix: s.fix });
  }
});

app.post('/api/accounts/:id/send-test', async (req, res) => {
  const parsed = testEmailSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const store = getStore();
  const acc = await store.getAccount(req.params.id as string);
  if (!acc) return res.status(404).json({ error: 'account not found' });
  try {
    // Exactly ONE direct send — never enters the campaign queue.
    const result = await sendOne(configFromAccount(acc), {
      from: acc.email, to: parsed.data.to, subject: sanitizeSubject(`[TEST EMAIL] ${parsed.data.subject}`),
      text: parsed.data.text, html: parsed.data.html ? sanitizeEmailHtml(parsed.data.html) : undefined,
    });
    await store.addEvent({ campaign_id: null, message_id: null, lead_id: null, type: 'test_email', detail: { to: parsed.data.to, smtpId: result.messageId } });
    res.json({ sent: true, test: true, smtpId: result.messageId });
  } catch (e) {
    res.status(502).json({ sent: false, error: e instanceof Error ? e.message : String(e) });
  }
});

// ---------- LEADS ----------
app.post('/api/leads/preview', async (req, res) => {
  const parsed = z.object({ csv: z.string().min(1).max(5_000_000), emailColumn: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const store = getStore();
  const existing = new Set((await store.listLeads(10000)).map((l) => l.email.trim().toLowerCase()));
  // Suppressed lookup
  const analysis = analyzeCsv(parsed.data.csv, { emailColumn: parsed.data.emailColumn, existingEmails: existing });
  const supp = await store.listSuppressions();
  const suppSet = new Set(supp.map((s) => s.email.trim().toLowerCase()));
  const suppressed = analysis.rows.filter((r) => r.emailValid && suppSet.has(r.email.trim().toLowerCase())).length;
  res.json({
    headers: analysis.headers, emailColumn: analysis.emailColumn,
    total: analysis.total, valid: analysis.valid, invalid: analysis.invalid,
    duplicates: analysis.duplicates, suppressed,
    ready: Math.max(0, analysis.valid - suppressed),
    mapping: defaultMapping(analysis.headers),
    rows: analysis.rows.slice(0, 50),
  });
});

app.post('/api/leads/import', async (req, res) => {
  const parsed = leadImportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const store = getStore();
  const existing = new Set((await store.listLeads(10000)).map((l) => l.email.trim().toLowerCase()));
  const analysis = analyzeCsv(parsed.data.csv, { emailColumn: parsed.data.emailColumn, existingEmails: existing });
  const mapping = parsed.data.mapping ?? defaultMapping(analysis.headers);
  const source = parsed.data.source ?? 'csv';
  let imported = 0, skippedInvalid = 0, skippedDup = 0, suppressed = 0;
  for (const row of analysis.rows) {
    if (!row.emailValid) { if (row.duplicate) skippedDup++; else skippedInvalid++; continue; }
    if (await store.isSuppressed(row.email)) { suppressed++; continue; }
    const mapped = mapRowToLead(row.values, mapping);
    if (!isValidEmail(mapped.email)) { skippedInvalid++; continue; }
    await store.upsertLead({
      email: mapped.email, first_name: mapped.first_name, last_name: mapped.last_name,
      company: mapped.company, website: mapped.website, industry: mapped.industry,
      source, raw_data: mapped.raw_data as Record<string, unknown>,
    });
    imported++;
  }
  res.status(201).json({
    total: analysis.total, valid: analysis.valid, invalid: analysis.invalid,
    duplicates: analysis.duplicates, suppressed, imported, skippedInvalid, skippedDup,
  });
});

app.get('/api/leads', async (req, res) => {
  const store = getStore();
  const leads = await store.listLeads(Number(req.query.limit ?? 200), String(req.query.search ?? ''));
  res.json({ leads, total: await store.countLeads() });
});

// ---------- CAMPAIGNS ----------
app.post('/api/campaigns', async (req, res) => {
  const parsed = campaignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const v = parsed.data;
  const store = getStore();
  const row = await store.createCampaign({
    name: v.name, account_id: v.account_id ?? null,
    subject_template: v.subject, body_text_template: v.body_text ?? null,
    body_html_template: v.body_html ? sanitizeEmailHtml(v.body_html) : null,
    reply_to: v.reply_to ?? null, unsubscribe_footer: v.unsubscribe_footer,
    daily_limit: v.daily_limit ?? null, delay_seconds: v.delay_seconds ?? null,
    status: 'DRAFT', start_at: v.start_at ?? null, end_at: v.end_at ?? null,
    started_at: null, completed_at: null, preflight: null,
  });
  if (v.lead_ids && v.lead_ids.length > 0) await store.setCampaignRecipients(row.id, v.lead_ids);
  await store.addEvent({ campaign_id: row.id, message_id: null, lead_id: null, type: 'campaign_created', detail: { name: v.name } });
  res.status(201).json({ campaign: row }); // creation never sends
});

app.get('/api/campaigns', async (_req, res) => {
  const store = getStore();
  const list = await store.listCampaigns();
  const out = [];
  for (const c of list) {
    const counts = await store.countByStatus(c.id);
    out.push({ ...c, counts });
  }
  res.json({ campaigns: out });
});

app.get('/api/campaigns/:id', async (req, res) => {
  const store = getStore();
  const c = await store.getCampaign(req.params.id as string);
  if (!c) return res.status(404).json({ error: 'not found' });
  const counts = await store.countByStatus(c.id);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const sent = counts.SENT ?? 0;
  res.json({ campaign: c, counts, progress: total ? sent / total : 0 });
});

app.post('/api/campaigns/:id/validate', async (req, res) => {
  const store = getStore();
  const c = await store.getCampaign(req.params.id as string);
  if (!c) return res.status(404).json({ error: 'not found' });
  await store.updateCampaign(c.id, { status: 'VALIDATING' });
  const preflight = await runPreflight(store, c, {
    probeSmtp: liveSmtpProbe(store, c.account_id),
    worker: 'embedded',
  });
  const mergedPreflight = keepCsvImportReport(c, preflight);
  await store.updateCampaign(c.id, {
    status: preflight.ok ? 'READY' : 'DRAFT',
    preflight: mergedPreflight as unknown as Record<string, unknown>,
  });
  await store.addEvent({ campaign_id: c.id, message_id: null, lead_id: null, type: 'preflight', detail: { ok: preflight.ok } });
  res.json({ preflight: mergedPreflight });
});

app.post('/api/campaigns/:id/start', async (req, res) => {
  const store = getStore();
  const c = await store.getCampaign(req.params.id as string);
  if (!c) return res.status(404).json({ error: 'not found' });
  if (!['READY', 'PAUSED', 'DRAFT'].includes(c.status)) return res.status(409).json({ error: `cannot start from ${c.status}` });
  // Enforce preflight: must be fresh and passing.
  const preflight = await runPreflight(store, c, {
    probeSmtp: liveSmtpProbe(store, c.account_id),
    worker: 'embedded',
  });
  if (!preflight.ok) {
    await store.updateCampaign(c.id, { preflight: keepCsvImportReport(c, preflight) as unknown as Record<string, unknown> });
    return res.status(409).json({ error: 'preflight failed', preflight });
  }
  const q = await buildQueue(store, c); // idempotent queue build
  const mergedPreflight = keepCsvImportReport(c, preflight);
  await store.updateCampaign(c.id, {
    status: 'RUNNING', started_at: c.started_at ?? new Date().toISOString(),
    preflight: mergedPreflight as unknown as Record<string, unknown>,
  });
  await store.addEvent({ campaign_id: c.id, message_id: null, lead_id: null, type: 'started', detail: { ...q } });
  res.json({ started: true, queue: q, preflight: mergedPreflight });
});

for (const [route, to] of [['pause', 'PAUSED'], ['resume', 'RUNNING'], ['stop', 'STOPPED']] as const) {
  app.post(`/api/campaigns/:id/${route}`, async (req, res) => {
    const store = getStore();
    const c = await store.getCampaign(req.params.id as string);
    if (!c) return res.status(404).json({ error: 'not found' });
    if (route === 'resume' && c.status !== 'PAUSED') return res.status(409).json({ error: `cannot resume from ${c.status}` });
    if (route === 'pause' && c.status !== 'RUNNING') return res.status(409).json({ error: `cannot pause from ${c.status}` });
    if (route === 'stop' && ['COMPLETED', 'STOPPED'].includes(c.status)) return res.status(409).json({ error: `already ${c.status}` });
    const patch: Partial<typeof c> = { status: to };
    if (to === 'STOPPED') patch.completed_at = new Date().toISOString();
    await store.updateCampaign(c.id, patch);
    await store.addEvent({ campaign_id: c.id, message_id: null, lead_id: null, type: route, detail: {} });
    res.json({ status: to });
  });
}

app.get('/api/campaigns/:id/messages', async (req, res) => {
  const store = getStore();
  res.json({ messages: await store.listMessages(req.params.id as string) });
});

app.get('/api/campaigns/:id/events', async (req, res) => {
  const store = getStore();
  res.json({ events: await store.listEvents(req.params.id as string, 300) });
});

app.get('/api/campaigns/:id/preview', async (req, res) => {
  // Exact production rendering engine for a single lead.
  const store = getStore();
  const c = await store.getCampaign(req.params.id as string);
  if (!c) return res.status(404).json({ error: 'not found' });
  const lead = await store.getLead(String(req.query.lead_id ?? ''));
  if (!lead) return res.status(404).json({ error: 'lead not found' });
  const ctx = buildLeadContext(lead as unknown as Record<string, never>);
  try {
    const subject = sanitizeSubject(renderStrict(c.subject_template, ctx));
    const text = c.body_text_template ? renderStrict(c.body_text_template, ctx) : (c.body_html_template ? htmlToText(renderStrict(c.body_html_template, ctx)) : '');
    const html = c.body_html_template ? sanitizeEmailHtml(renderStrict(c.body_html_template, ctx)) : null;
    const acc = c.account_id ? await store.getAccount(c.account_id) : null;
    res.json({ from: acc?.email ?? '(no sender)', to: lead.email, subject, text, html, missing: [] });
  } catch (e) {
    res.status(409).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// ---------- ONE-CLICK CSV CAMPAIGN IMPORT ----------
// Step 1: server-side preview — parses + maps + renders, ZERO database writes.
app.post('/api/campaigns/import-csv/preview', async (req, res) => {
  try {
    const { text, fields } = await parseUpload(req);
    const parsed = csvCampaignPreviewSchema.safeParse(fields);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (!text) return res.status(400).json({ error: 'No CSV content received' });
    const store = getStore();
    const preview = await previewCsvCampaign(store, text, {
      emailHeader: parsed.data.emailHeader,
      roles: parsed.data.roles as Record<string, import('../leads/csv.js').ColumnRole> | undefined,
      subject: parsed.data.subject, bodyText: parsed.data.bodyText, mode: parsed.data.mode,
    });
    res.json({ preview });
  } catch (e) { importHttpError(res, e); }
});

// Step 2: import — creates leads + DRAFT campaign + recipients via the Store.
// Never sends. Queue materializes now if a sender is given (idempotent),
// otherwise at start through the existing buildQueue.
app.post('/api/campaigns/import-csv', async (req, res) => {
  try {
    const { text, fields } = await parseUpload(req);
    const parsed = csvCampaignImportSchema.safeParse(fields);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (!text) return res.status(400).json({ error: 'No CSV content received' });
    const store = getStore();
    const result = await importCsvCampaign(store, text, {
      name: parsed.data.name,
      accountId: parsed.data.accountId ?? null,
      emailHeader: parsed.data.emailHeader,
      roles: parsed.data.roles as Record<string, import('../leads/csv.js').ColumnRole> | undefined,
      subject: parsed.data.subject, bodyText: parsed.data.bodyText, mode: parsed.data.mode,
      source: parsed.data.source,
    });
    res.status(201).json(result);
  } catch (e) { importHttpError(res, e); }
});

// Campaign results export: email, company, status, sent_at, failure_reason.
app.get('/api/campaigns/:id/export.csv', async (req, res) => {
  const store = getStore();
  const c = await store.getCampaign(req.params.id as string);
  if (!c) return res.status(404).json({ error: 'not found' });
  const messages = await store.listMessages(c.id);
  const lines = ['email,company_name,first_name,status,sent_at,failure_reason'];
  for (const m of messages) {
    const lead = m.lead_id ? await store.getLead(m.lead_id) : null;
    const raw = (lead?.raw_data ?? {}) as Record<string, unknown>;
    const company = lead?.company ?? raw.company_name ?? raw.company ?? '';
    lines.push([
      csvCell(m.recipient), csvCell(company), csvCell(lead?.first_name ?? ''),
      csvCell(m.status), csvCell(m.sent_at ?? ''), csvCell(m.last_error ?? ''),
    ].join(','));
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="campaign-${c.id}-results.csv"`);
  res.send(`\uFEFF${lines.join('\r\n')}\r\n`);
});

// Exclude recipients lacking a template variable ("Exclude affected leads").
// Excluded rows never send; their pending messages park as SKIPPED.
app.post('/api/campaigns/:id/recipients/exclude-missing', async (req, res) => {
  const parsed = z.object({
    variable: z.string().min(1).max(120).regex(/^[A-Za-z0-9_ .|\-]+$/),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.json(await excludeMissingRecipients(getStore(), req.params.id as string, parsed.data.variable));
  } catch (e) { importHttpError(res, e); }
});

// ---------- SUPPRESSIONS ----------
app.get('/api/suppressions', async (req, res) => {
  const store = getStore();
  res.json({ suppressions: await store.listSuppressions(String(req.query.search ?? '')) });
});
app.post('/api/suppressions', async (req, res) => {
  const parsed = suppressionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const store = getStore();
  const row = await store.addSuppression({ email: parsed.data.email, reason: parsed.data.reason, note: parsed.data.note ?? null });
  res.status(201).json({ suppression: row });
});
app.delete('/api/suppressions/:id', async (req, res) => {
  const store = getStore();
  res.json({ removed: await store.removeSuppression(req.params.id as string) });
});

// ---------- DASHBOARD / MISC ----------
app.get('/api/dashboard', async (_req, res) => {
  const store = getStore();
  const campaigns = await store.listCampaigns();
  const counts = await store.countByStatus();
  const accounts = await store.listAccounts();
  let today = 0;
  for (const a of accounts) today += await store.sentToday(a.id);
  res.json({
    totals: {
      campaigns: campaigns.length,
      running: campaigns.filter((c) => c.status === 'RUNNING').length,
      completed: campaigns.filter((c) => c.status === 'COMPLETED').length,
      sent: counts.SENT ?? 0, queued: (counts.QUEUED ?? 0) + (counts.RETRYING ?? 0),
      failed: counts.FAILED ?? 0, suppressed: counts.SUPPRESSED ?? 0, today,
    },
    recent: campaigns.slice(0, 8),
  });
});

app.get('/api/activity', async (_req, res) => {
  const store = getStore();
  res.json({ events: await store.listEvents(undefined, 200) });
});

app.get('/api/health', async (_req, res) => {
  const store = getStore();
  res.json({ ok: true, store: store.kind, time: new Date().toISOString(), supabase: Boolean(env.supabaseUrl) });
});

// Serve frontend build if present (works from tsx dev and compiled dist).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uiCandidates = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../../../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
];
const uiDir = uiCandidates.find((d) => fs.existsSync(d));
if (uiDir) {
  app.use(express.static(uiDir));
  app.get('*', (_req, res) => res.sendFile(path.join(uiDir, 'index.html')));
}

export default app;

export function startServer(): void {
  const port = env.port;
  const host = env.host;
  app.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`Mail Mania API on http://${host}:${port} (store=${getStore().kind})`);
  });
  // Embedded worker loop (independent of HTTP request lifecycle).
  void runWorker(getStore(), {
    onEvent: (line) => { if (process.env.WORKER_LOG === '1') console.log(line); },
  });
}
