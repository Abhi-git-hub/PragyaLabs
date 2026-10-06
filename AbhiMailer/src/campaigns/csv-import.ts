import type { Store } from '../db/store.js';
import type { Campaign } from '../db/types.js';
import {
  analyzeCampaignCsv, buildImportLead, discoverFields, parseCsv,
  CSV_SUBJECT_KEY, CSV_BODY_KEY,
  type CampaignImportAnalysis, type ColumnRole, type ImportRow, type FieldConfidence,
} from '../leads/csv.js';
import { buildLeadContext, findMissing, renderStrict, sanitizeSubject, normalizeVarName } from '../email/template.js';
import { runPreflight, type PreflightResult } from './preflight.js';
import { buildQueue } from '../queue/queue.js';

export const MAX_CSV_BYTES = 5_000_000;
export const MAX_CSV_ROWS = 20_000;

export interface RenderedPreview {
  to: string;
  subject: string;
  text: string;
  html: string | null;
  missing: string[];
}

export interface CsvPreviewResult {
  headers: string[];
  roles: Record<string, ColumnRole>;
  fieldConfidence: Record<string, FieldConfidence>;
  emailCandidates: string[];
  needsChoice: boolean;
  emailHeader: string | null;
  subjectHeader: string | null;
  bodyHeader: string | null;
  customFields: string[];
  total: number;
  valid: number;
  missingEmail: number;
  invalidEmail: number;
  duplicates: number;
  missingContent: number;
  suppressed: number;
  sendable: number;
  suggestedMode: 'row' | 'template';
  /** first N rows with per-row status (never the whole file for large CSVs) */
  sample: ImportRow[];
  rejectedSample: { email: string; reason: string }[];
  previews: RenderedPreview[];
  templateMissing: { variable: string; affected: number }[];
}

export interface CsvImportResult {
  campaign: Campaign;
  mode: 'row' | 'template';
  total: number;
  valid: number;
  missingEmail: number;
  invalidEmail: number;
  duplicates: number;
  missingContent: number;
  suppressed: number;
  imported: number;
  queued: number;
  skipped: number;
  rejected: { email: string; reason: string; row: Record<string, string> }[];
  preflight: PreflightResult | null;
}

function failTooLarge(text: string): void {
  if (text.length > MAX_CSV_BYTES) {
    throw Object.assign(new Error(`CSV too large (max ${MAX_CSV_BYTES / 1_000_000}MB)`), { status: 413 });
  }
}

export function getAnalysis(
  text: string,
  opts?: { emailHeader?: string; roles?: Record<string, ColumnRole>; subject?: string; bodyText?: string; mode?: 'row' | 'template' },
): {
  analysis: CampaignImportAnalysis; roles: Record<string, ColumnRole>;
  mode: 'row' | 'template'; subject: string; bodyText: string;
  fieldConfidence: Record<string, FieldConfidence>; emailCandidates: string[]; needsChoice: boolean;
} {
  failTooLarge(text);
  const { headers, records } = parseCsv(text);
  if (records.length > MAX_CSV_ROWS) {
    throw Object.assign(new Error(`Too many rows (max ${MAX_CSV_ROWS})`), { status: 413 });
  }
  // Deterministic discovery: header aliases + value-shape analysis.
  const discovery = discoverFields(headers, records);
  const roles: Record<string, ColumnRole> = { ...discovery.roles, ...(opts?.roles ?? {}) };
  // Explicit choice (UI) wins, then the merged role map, then discovery.
  const emailHeader = opts?.emailHeader
    ?? Object.entries(roles).find(([, r]) => r === 'email')?.[0]
    ?? discovery.emailHeader ?? headers[0] ?? 'email';
  const subjectHeader = Object.entries(roles).find(([, r]) => r === 'subject')?.[0] ?? discovery.subjectHeader;
  const bodyHeader = Object.entries(roles).find(([, r]) => r === 'body')?.[0] ?? discovery.bodyHeader;
  const mode = opts?.mode ?? (subjectHeader && bodyHeader ? 'row' : 'template');
  const analysis = analyzeCampaignCsv(text, { emailHeader, subjectHeader, bodyHeader, mode });
  // Mode B templates (or explicit overrides): default to per-row content when present.
  const subject = opts?.subject ?? (subjectHeader ? `{{${CSV_SUBJECT_KEY}}}` : '');
  const bodyText = opts?.bodyText ?? (bodyHeader ? `{{${CSV_BODY_KEY}}}` : '');
  return {
    analysis, roles, mode, subject, bodyText,
    fieldConfidence: discovery.confidence,
    emailCandidates: discovery.emailCandidates,
    needsChoice: discovery.needsChoice && !opts?.emailHeader,
  };
}

function rowContext(values: Record<string, string>, roles: Record<string, ColumnRole>): Record<string, unknown> {
  const lead = buildImportLead(values, roles);
  if (!lead) return { email: '' };
  return buildLeadContext({ ...lead, raw_data: lead.raw_data });
}

// Server-side preview: NO database writes. Renders the first rows with the
// production template engine + sanitizer (same path as preview/send).
export async function previewCsvCampaign(
  store: Store,
  text: string,
  opts?: { emailHeader?: string; roles?: Record<string, ColumnRole>; subject?: string; bodyText?: string; mode?: 'row' | 'template'; sampleSize?: number },
): Promise<CsvPreviewResult> {
  const { analysis, roles, mode, subject, bodyText, fieldConfidence, emailCandidates, needsChoice } = getAnalysis(text, opts);
  const validRows = analysis.rows.filter((r) => r.status === 'valid');
  let suppressed = 0;
  for (const r of validRows) {
    if (await store.isSuppressed(r.email)) suppressed++;
  }
  // Missing template variables across sendable rows (production engine).
  const templates = [subject, bodyText].filter(Boolean);
  const templateMissing = (() => {
    const counts = new Map<string, number>();
    for (const r of validRows) {
      const ctx = rowContext(r.values, roles);
      const miss = new Set<string>();
      for (const t of templates) for (const m of findMissing(t, ctx)) miss.add(m);
      for (const m of miss) counts.set(m, (counts.get(m) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, n]) => n > 0)
      .map(([variable, affected]) => ({ variable, affected }))
      .sort((a, b) => a.variable.localeCompare(b.variable));
  })();
  const sampleSize = Math.min(opts?.sampleSize ?? 10, 25);
  const previews: RenderedPreview[] = validRows.slice(0, sampleSize).map((r) => {
    const ctx = rowContext(r.values, roles);
    try {
      const subj = subject ? sanitizeSubject(renderStrict(subject, ctx)) : '(no subject — row content mode)';
      const textOut = bodyText ? renderStrict(bodyText, ctx) : String((ctx[CSV_BODY_KEY] ?? ctx.body ?? ''));
      const html = null;
      return { to: r.email, subject: subj, text: textOut, html, missing: [] };
    } catch {
      const miss = new Set<string>();
      for (const t of templates) for (const m of findMissing(t, ctx)) miss.add(m);
      return { to: r.email, subject: '', text: '', html: null, missing: [...miss] };
    }
  });
  return {
    headers: analysis.headers,
    roles,
    fieldConfidence,
    emailCandidates,
    needsChoice,
    emailHeader: analysis.detection.emailHeader,
    subjectHeader: analysis.detection.subjectHeader,
    bodyHeader: analysis.detection.bodyHeader,
    customFields: analysis.detection.customFields,
    total: analysis.total, valid: analysis.valid,
    missingEmail: analysis.missingEmail, invalidEmail: analysis.invalidEmail,
    duplicates: analysis.duplicates, missingContent: analysis.missingContent,
    suppressed,
    sendable: Math.max(0, analysis.valid - suppressed),
    suggestedMode: mode,
    sample: analysis.rows.slice(0, sampleSize),
    rejectedSample: analysis.rows.filter((r) => r.status !== 'valid').slice(0, 25).map((r) => ({ email: r.email || '(empty)', reason: r.reason ?? 'rejected' })),
    previews,
    templateMissing,
  };
}

// "Exclude affected leads": drop recipients lacking a template variable and
// park their pending messages as SKIPPED. SENT / DELIVERY_UNKNOWN / FAILED
// rows are never touched (send history is immutable).
export async function excludeMissingRecipients(
  store: Store,
  campaignId: string,
  variable: string,
): Promise<{ variable: string; removed: number; remaining: number }> {
  const campaign = await store.getCampaign(campaignId);
  if (!campaign) throw Object.assign(new Error('Campaign not found'), { status: 404 });
  if (['RUNNING', 'COMPLETED'].includes(campaign.status)) {
    throw Object.assign(new Error(`Cannot exclude recipients while ${campaign.status}`), { status: 409 });
  }
  const name = normalizeVarName(variable);
  if (!name) throw Object.assign(new Error('Invalid variable'), { status: 400 });
  const template = `{{${name}}}`;
  const excluded: string[] = [];
  for (const lid of await store.getCampaignLeadIds(campaignId)) {
    const lead = await store.getLead(lid);
    if (!lead) { excluded.push(lid); continue; }
    const ctx = buildLeadContext(lead as unknown as Record<string, never>);
    if (findMissing(template, ctx).length > 0) excluded.push(lid);
  }
  await store.removeCampaignRecipients(campaignId, excluded);
  for (const m of await store.listMessages(campaignId)) {
    if (m.lead_id && excluded.includes(m.lead_id) && ['QUEUED', 'SENDING', 'RETRYING'].includes(m.status)) {
      await store.updateMessage(m.id, { status: 'SKIPPED', last_error: `excluded: missing {{${name}}}`, locked_at: null, next_attempt_at: null });
    }
  }
  await store.addEvent({
    campaign_id: campaignId, message_id: null, lead_id: null,
    type: 'recipients_excluded', detail: { variable: name, removed: excluded.length },
  });
  return { variable: name, removed: excluded.length, remaining: (await store.getCampaignLeadIds(campaignId)).length };
}

// Import: creates leads + DRAFT campaign + recipients through the existing
// Store abstraction. Never sends. If an account is supplied, the persistent
// queue is ALSO materialized now via the existing buildQueue (idempotent —
// start re-runs it safely). Suppressed addresses never become recipients.
export async function importCsvCampaign(
  store: Store,
  text: string,
  opts: {
    name: string;
    accountId?: string | null;
    emailHeader?: string;
    roles?: Record<string, ColumnRole>;
    subject?: string;
    bodyText?: string;
    mode?: 'row' | 'template';
    source?: string;
  },
): Promise<CsvImportResult> {
  const { analysis, roles, mode, subject, bodyText } = getAnalysis(text, {
    emailHeader: opts.emailHeader, roles: opts.roles, subject: opts.subject, bodyText: opts.bodyText, mode: opts.mode,
  });
  if (mode === 'template' && (!subject.trim() || !bodyText.trim())) {
    throw Object.assign(new Error('Subject and body templates are required when the CSV has no content columns'), { status: 400 });
  }
  const finalSubject = mode === 'row' ? `{{${CSV_SUBJECT_KEY}}}` : subject;
  const finalBody = mode === 'row' ? `{{${CSV_BODY_KEY}}}` : bodyText;

  const rejected: CsvImportResult['rejected'] = [];
  const leadIds: string[] = [];
  let suppressed = 0, imported = 0;
  for (const row of analysis.rows) {
    if (row.status !== 'valid') {
      rejected.push({ email: row.email || '(empty)', reason: row.reason ?? 'rejected', row: row.values });
      continue;
    }
    if (await store.isSuppressed(row.email)) {
      suppressed++;
      rejected.push({ email: row.email, reason: 'Suppressed recipient', row: row.values });
      continue;
    }
    const built = buildImportLead(row.values, roles);
    if (!built) {
      rejected.push({ email: row.email, reason: 'Unmappable row', row: row.values });
      continue;
    }
    const { lead } = await store.upsertLead({
      email: built.email, first_name: built.first_name, last_name: built.last_name,
      company: built.company, website: built.website, industry: built.industry,
      source: opts.source ?? 'csv-campaign',
      raw_data: built.raw_data as Record<string, unknown>,
    });
    if (!leadIds.includes(lead.id)) leadIds.push(lead.id);
    imported++;
  }

  const campaign = await store.createCampaign({
    name: opts.name, account_id: opts.accountId ?? null,
    subject_template: finalSubject, body_text_template: finalBody,
    body_html_template: null, reply_to: null, unsubscribe_footer: true,
    daily_limit: null, delay_seconds: null,
    status: 'DRAFT', start_at: null, end_at: null,
    started_at: null, completed_at: null, preflight: null,
  });
  await store.setCampaignRecipients(campaign.id, leadIds);
  await store.addEvent({
    campaign_id: campaign.id, message_id: null, lead_id: null,
    type: 'campaign_imported', detail: { mode, total: analysis.total, imported, rejected: rejected.length },
  });

  // Persist the rejected-row report on the draft for later download (no schema change).
  const rejectedReport = rejected.slice(0, 2000).map((r) => ({ email: r.email, reason: r.reason, row: r.row }));
  await store.updateCampaign(campaign.id, {
    preflight: { csvImport: { mode, total: analysis.total, imported, rejected: rejectedReport } } as Record<string, unknown>,
  });

  let queued = 0, skipped = 0, preflight: PreflightResult | null = null;
  if (opts.accountId) {
    const withAccount = (await store.getCampaign(campaign.id)) ?? campaign;
    try {
      const q = await buildQueue(store, { ...withAccount, account_id: opts.accountId });
      queued = q.queued; skipped = q.skipped;
    } catch {
      // e.g. unknown account — queue materializes at start; import still succeeds.
    }
    preflight = await runPreflight(store, { ...(await store.getCampaign(campaign.id))!, account_id: opts.accountId });
  }

  const fresh = (await store.getCampaign(campaign.id))!;
  return {
    campaign: fresh, mode, total: analysis.total, valid: analysis.valid,
    missingEmail: analysis.missingEmail, invalidEmail: analysis.invalidEmail,
    duplicates: analysis.duplicates, missingContent: analysis.missingContent,
    suppressed, imported, queued, skipped, rejected, preflight,
  };
}
