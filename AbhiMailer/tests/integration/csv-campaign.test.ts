import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryStore, setStore } from '../../src/db/store.js';
import { previewCsvCampaign, importCsvCampaign } from '../../src/campaigns/csv-import.js';
import { runPreflight } from '../../src/campaigns/preflight.js';
import { runWorker } from '../../src/worker/worker.js';
import { setTransportFactory } from '../../src/email/sender.js';
import { encryptSecret } from '../../src/security/crypto.js';
import { FakeSmtp } from '../helpers/fake-smtp.js';
import nodemailer from 'nodemailer';

// campaign.csv → Import → mapping → template → sender → preflight →
// started → worker → SMTP accepts → SENT → COMPLETED. Fake SMTP only.
const MODE_A_CSV = `company_name,email,first_name,industry,email_subject,email_body
Acme Dental,owner@acme.com,John,Dental,Quick idea for Acme Dental,"Hi John, I came across Acme Dental and noticed something interesting. Best, Abhi"
Bright Smiles,hello@bright.example,Priya,Dental,Quick idea for Bright Smiles,"Hi Priya, quick idea for Bright Smiles. Best, Abhi"
Evil Co,evil@example.com,Evil,Dental,Hello Evil,"<script>alert(1)</script>Hi Evil"
Bad Row,not-an-email,Bad,Dental,S,B
Dup Row,owner@acme.com,Johnny,Dental,S2,B2
Gone Co,gone@example.com,Gone,Dental,S3,B3`;

const MODE_B_CSV = `Email Address,First Name,Company Name,Industry
ana@example.com,Ana,Ana Salon,Salon
bob@example.com,Bob,Bob Dental,Dental`;

let fake: FakeSmtp;
let store: MemoryStore;

function testTransportFactory() {
  return nodemailer.createTransport({
    host: '127.0.0.1', port: fake.port, secure: false, ignoreTLS: true,
    connectionTimeout: 5000, socketTimeout: 5000,
  } as never);
}

async function makeAccount() {
  return store.createAccount({
    display_name: 'Fake', email: 'sender@example.com', smtp_host: '127.0.0.1',
    smtp_port: fake.port, security: 'NONE', username: 'u', password_enc: encryptSecret('p'),
    daily_limit: 50, delay_seconds: 0, last_test_at: null, last_test_status: null,
  });
}

beforeEach(async () => {
  fake = new FakeSmtp();
  await fake.start();
  store = new MemoryStore();
  setStore(store);
  setTransportFactory(() => testTransportFactory());
});

afterEach(async () => {
  setTransportFactory(null);
  setStore(null);
  await fake.stop();
});

describe('CSV CAMPAIGN ACCEPTANCE (fake SMTP)', () => {
  it('Mode A: csv with content → draft → preflight → launch → SENT → COMPLETED, no dupes', async () => {
    await store.addSuppression({ email: 'gone@example.com', reason: 'UNSUBSCRIBED', note: null });

    // Import: 6 rows detected
    const preview = await previewCsvCampaign(store, MODE_A_CSV);
    expect(preview.total).toBe(6);
    expect(preview.valid).toBe(4); // owner, hello, evil, gone
    expect(preview.invalidEmail).toBe(1);
    expect(preview.duplicates).toBe(1);
    expect(preview.suppressed).toBe(1);
    expect(preview.sendable).toBe(3);
    expect(preview.suggestedMode).toBe('row');
    // Per-row preview rendering from the CSV content columns:
    expect(preview.previews[0]?.subject).toBe('Quick idea for Acme Dental');
    expect(preview.previews[0]?.text).toContain('Hi John');
    // No secrets leak into preview payloads:
    expect(JSON.stringify(preview)).not.toContain('password_enc');
    expect(JSON.stringify(preview)).not.toContain('SERVICE_ROLE');

    const acc = await makeAccount();
    const result = await importCsvCampaign(store, MODE_A_CSV, { name: 'Outreach A', accountId: acc.id });
    expect(result.mode).toBe('row');
    expect(result.total).toBe(6);
    expect(result.imported).toBe(3);
    expect(result.suppressed).toBe(1);
    expect(result.rejected).toHaveLength(3);
    expect(result.campaign.status).toBe('DRAFT'); // never auto-sends on import
    expect(fake.received).toHaveLength(0);
    expect(result.campaign.subject_template).toBe('{{_csv_subject}}');

    // Sender selected → preflight passes
    const pre = await runPreflight(store, (await store.getCampaign(result.campaign.id))!);
    expect(pre.ok).toBe(true);
    expect(pre.ready).toBe(3);
    expect(pre.missingVariables).toHaveLength(0);

    // Explicit launch → worker → SMTP accepts → SENT → COMPLETED
    await store.updateCampaign(result.campaign.id, { status: 'RUNNING', started_at: new Date().toISOString() });
    await runWorker(store, { maxIterations: 60, pollMs: 5 });
    expect(fake.received).toHaveLength(3);
    expect(fake.for('owner@acme.com')).toHaveLength(1);
    expect(fake.for('owner@acme.com')[0]?.subject).toContain('Acme Dental');
    expect(fake.for('hello@bright.example')[0]?.subject).toContain('Bright Smiles');
    expect(fake.for('gone@example.com')).toHaveLength(0); // suppressed: zero emails
    expect((await store.getCampaign(result.campaign.id))!.status).toBe('COMPLETED');

    // Restart recovery: zero duplicates
    const before = fake.received.length;
    await runWorker(store, { maxIterations: 20, pollMs: 5 });
    expect(fake.received).toHaveLength(before);
  });

  it('Mode B: lead-data csv + templates → unknown variable blocks launch until fixed', async () => {
    const acc = await makeAccount();
    const preview = await previewCsvCampaign(store, MODE_B_CSV);
    expect(preview.suggestedMode).toBe('template');
    // Alias detection: Email Address / First Name / Company Name
    expect(preview.sendable).toBe(2);

    // Broken template: references a column the CSV does not contain
    const bad = await importCsvCampaign(store, MODE_B_CSV, {
      name: 'Outreach B bad', accountId: acc.id, mode: 'template',
      subject: 'Quick idea for {{company_name}}', bodyText: 'Hi {{nope}}, welcome',
    });
    const preBad = await runPreflight(store, (await store.getCampaign(bad.campaign.id))!);
    expect(preBad.ok).toBe(false);
    expect(preBad.missingVariables.map((m) => m.variable)).toContain('nope');
    expect(preBad.ready).toBe(0);

    // Fixed template: full journey to COMPLETED
    const good = await importCsvCampaign(store, MODE_B_CSV, {
      name: 'Outreach B', accountId: acc.id, mode: 'template',
      subject: 'Quick idea for {{company_name}}', bodyText: 'Hi {{first_name}}, I came across {{company_name}} ({{industry}}). Best, Abhi',
    });
    const pre = await runPreflight(store, (await store.getCampaign(good.campaign.id))!);
    expect(pre.ok).toBe(true);
    expect(pre.ready).toBe(2);
    await store.updateCampaign(good.campaign.id, { status: 'RUNNING', started_at: new Date().toISOString() });
    await runWorker(store, { maxIterations: 60, pollMs: 5 });
    expect(fake.received).toHaveLength(2);
    expect(fake.for('ana@example.com')[0]?.subject).toBe('Quick idea for Ana Salon');
    expect(fake.for('ana@example.com')[0]?.raw).toContain('Hi Ana');
    expect((await store.getCampaign(good.campaign.id))!.status).toBe('COMPLETED');
  });

  it('template mode requires subject+body (no silent broken campaign)', async () => {
    await expect(importCsvCampaign(store, MODE_B_CSV, { name: 'x', mode: 'template' }))
      .rejects.toThrow(/Subject and body/);
  });

  it('exclude-affected-leads: rows lacking a variable can be dropped, then preflight passes', async () => {
    const { excludeMissingRecipients } = await import('../../src/campaigns/csv-import.js');
    const { buildQueue } = await import('../../src/queue/queue.js');
    const acc = await makeAccount();
    const camp = await store.createCampaign({
      name: 'Excl', account_id: acc.id, subject_template: 'Hi {{first_name}}',
      body_text_template: 'Work at {{company}}?', body_html_template: null, reply_to: null,
      unsubscribe_footer: false, daily_limit: null, delay_seconds: 0, status: 'DRAFT',
      start_at: null, end_at: null, started_at: null, completed_at: null, preflight: null,
    });
    // ana has a company; bob has no company anywhere (sparse row)
    const ids: string[] = [];
    for (const [em, co] of [['ana-x@example.com', 'Ana Co'], ['bob-x@example.com', '']] as const) {
      const { lead } = await store.upsertLead({
        email: em, first_name: em.split('-')[0], company: co || undefined,
        source: 'csv', raw_data: co ? { company: co } : {},
      });
      ids.push(lead.id);
    }
    await store.setCampaignRecipients(camp.id, ids);
    await buildQueue(store, (await store.getCampaign(camp.id))!);
    const blocked = await runPreflight(store, (await store.getCampaign(camp.id))!);
    expect(blocked.ok).toBe(false); // company genuinely missing for bob
    const out = await excludeMissingRecipients(store, camp.id, 'company');
    expect(out).toMatchObject({ variable: 'company', removed: 1, remaining: 1 });
    const msgs = await store.listMessages(camp.id);
    expect(msgs.find((m) => m.recipient === 'bob-x@example.com')?.status).toBe('SKIPPED');
    expect(msgs.find((m) => m.recipient === 'ana-x@example.com')?.status).toBe('QUEUED');
    const after = await runPreflight(store, (await store.getCampaign(camp.id))!);
    expect(after.ok).toBe(true);
    expect(after.ready).toBe(1);
  });

  it('manual-path regression: one-row Mode-A CSV → lead → campaign_lead → preflight passes', async () => {
    // Mirrors Leads-page import + Campaigns-page create + Detail validate.
    // Before the mapping fix this yielded 0 recipients → "No ready recipients".
    const ONE_ROW = `company_name,email,email_subject,message\nTest Company,recipient@example.test,Quick idea for Test Company,"Hi, this is a test email."`;
    const { analyzeCsv, defaultMapping, mapRowToLead } = await import('../../src/leads/csv.js');
    const { isValidEmail } = await import('../../src/email/validation.js');
    const analysis = analyzeCsv(ONE_ROW);
    expect(analysis.valid).toBe(1);
    const mapping = defaultMapping(analysis.headers);
    const leadIds: string[] = [];
    for (const row of analysis.rows) {
      if (!row.emailValid) continue;
      const m = mapRowToLead(row.values, mapping);
      if (!isValidEmail(m.email)) continue;
      const { lead } = await store.upsertLead({
        email: m.email, first_name: m.first_name, last_name: m.last_name,
        company: m.company, website: m.website, industry: m.industry,
        source: 'csv', raw_data: m.raw_data as Record<string, unknown>,
      });
      leadIds.push(lead.id);
    }
    expect(leadIds).toHaveLength(1); // the row must survive import
    const acc = await makeAccount();
    const campaign = await store.createCampaign({
      name: 'Manual One-Row', account_id: acc.id,
      subject_template: 'Quick idea for {{company}}', body_text_template: 'Hi, a test for {{company}} ({{email}})',
      body_html_template: null, reply_to: null, unsubscribe_footer: true,
      daily_limit: null, delay_seconds: null, status: 'DRAFT',
      start_at: null, end_at: null, started_at: null, completed_at: null, preflight: null,
    });
    await store.setCampaignRecipients(campaign.id, leadIds);
    expect(await store.getCampaignLeadIds(campaign.id)).toHaveLength(1);
    const pre = await runPreflight(store, (await store.getCampaign(campaign.id))!);
    expect(pre.ok).toBe(true);
    expect(pre.ready).toBe(1);
    expect(pre.checks.find((c) => c.name === 'recipients')?.passed).toBe(true);
  });
});
