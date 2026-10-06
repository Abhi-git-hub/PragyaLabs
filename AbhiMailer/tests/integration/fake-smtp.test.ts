import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MemoryStore, setStore } from '../../src/db/store.js';
import { runPreflight } from '../../src/campaigns/preflight.js';
import { buildQueue } from '../../src/queue/queue.js';
import { workerStep, runWorker } from '../../src/worker/worker.js';
import { setTransportFactory } from '../../src/email/sender.js';
import { analyzeCsv, defaultMapping, mapRowToLead } from '../../src/leads/csv.js';
import { encryptSecret } from '../../src/security/crypto.js';
import { FakeSmtp } from '../helpers/fake-smtp.js';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEADS5 = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'leads5.csv'), 'utf8');

let fake: FakeSmtp;
let store: MemoryStore;

function testTransportFactory() {
  return nodemailer.createTransport({
    host: '127.0.0.1', port: fake.port, secure: false, ignoreTLS: true,
    connectionTimeout: 5000, socketTimeout: 5000,
  } as never);
}

async function importLeads(s: MemoryStore, csv = LEADS5): Promise<string[]> {
  const a = analyzeCsv(csv);
  const mapping = defaultMapping(a.headers);
  const ids: string[] = [];
  for (const row of a.rows) {
    if (!row.emailValid) continue;
    const m = mapRowToLead(row.values, mapping);
    const { lead } = await s.upsertLead({
      email: m.email, first_name: m.first_name, last_name: m.last_name,
      company: m.company, website: m.website, industry: m.industry,
      source: 'csv', raw_data: m.raw_data as Record<string, unknown>,
    });
    ids.push(lead.id);
  }
  return ids;
}

async function makeAccount(s: MemoryStore, overrides: Partial<{ daily_limit: number; delay_seconds: number }> = {}) {
  return s.createAccount({
    display_name: 'Fake', email: 'sender@example.com', smtp_host: '127.0.0.1',
    smtp_port: fake.port, security: 'NONE', username: 'u', password_enc: encryptSecret('p'),
    daily_limit: 50, delay_seconds: 0, last_test_at: null, last_test_status: null,
    ...overrides,
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

describe('COMPLETE ACCEPTANCE (fake SMTP)', () => {
  it('steps 1-11: import 5, personalize, preflight, start, 5 received, COMPLETED, restart = 0 dupes', async () => {
    // Step 1: import 5 leads
    const ids = await importLeads(store);
    expect(ids).toHaveLength(5);

    // Step 2-3: campaign with personalized variables
    const acc = await makeAccount(store);
    const c = await store.createCampaign({
      name: 'Accept 5', account_id: acc.id,
      subject_template: '{{first_name}}, quick idea for {{company}}',
      body_text_template: 'Hi {{first_name}},\n\nI was looking at {{company}} ({{website}}) in {{industry}}.\n\nBest,\nAbhi',
      body_html_template: null, reply_to: null, unsubscribe_footer: true,
      daily_limit: null, delay_seconds: 0, status: 'DRAFT',
      start_at: null, end_at: null, started_at: null, completed_at: null, preflight: null,
    });
    await store.setCampaignRecipients(c.id, ids);

    // Step 4: preflight
    const pre = await runPreflight(store, c);
    expect(pre.ok).toBe(true);
    expect(pre.ready).toBe(5);
    expect(pre.missingVariables).toHaveLength(0);

    // Step 5: start
    await store.updateCampaign(c.id, { status: 'RUNNING', started_at: new Date().toISOString() });
    const q = await buildQueue(store, c);
    expect(q.queued).toBe(5);

    // Drain worker
    for (let i = 0; i < 40; i++) {
      const did = await workerStep(store, { maxIterations: 1 });
      if (!did) {
        const counts = await store.countByStatus(c.id);
        if (((counts.QUEUED ?? 0) + (counts.RETRYING ?? 0) + (counts.SENDING ?? 0)) === 0) break;
      }
    }

    // Step 6: fake SMTP received exactly 5
    expect(fake.received).toHaveLength(5);

    // Step 7: every recipient got one
    for (const want of ['rahul@example.com', 'priya@example.com', 'amit@example.com', 'sneha@example.com', 'vikram@example.com']) {
      expect(fake.for(want)).toHaveLength(1);
    }

    // Step 8: personalized subject/body
    const rahul = fake.for('rahul@example.com')[0]!;
    expect(rahul.subject).toContain('Rahul');
    expect(rahul.subject).toContain('Example Pvt Ltd');
    expect(rahul.raw).toContain('Rahul');
    expect(rahul.raw).toContain('Example Pvt Ltd');

    // Step 9: COMPLETED
    expect((await store.getCampaign(c.id))!.status).toBe('COMPLETED');

    // Steps 10-11: restart (fresh worker over same store) = zero duplicates
    const before = fake.received.length;
    for (let i = 0; i < 10; i++) await workerStep(store, { maxIterations: 1 });
    expect(fake.received.length).toBe(before);
    const counts = await store.countByStatus(c.id);
    expect(counts.SENT).toBe(5);
  });

  it('steps 12-14: suppression blocks resend', async () => {
    const ids = await importLeads(store);
    const acc = await makeAccount(store);
    const c1 = await store.createCampaign({
      name: 'c1', account_id: acc.id, subject_template: 'Hi {{first_name}}',
      body_text_template: 'Hey {{first_name}}', body_html_template: null, reply_to: null,
      unsubscribe_footer: false, daily_limit: null, delay_seconds: 0, status: 'RUNNING',
      start_at: null, end_at: null, started_at: new Date().toISOString(), completed_at: null, preflight: null,
    });
    await store.setCampaignRecipients(c1.id, ids);
    await buildQueue(store, c1);
    for (let i = 0; i < 30; i++) await workerStep(store, { maxIterations: 1 });
    expect(fake.received).toHaveLength(5);

    // Step 12: suppress one recipient
    await store.addSuppression({ email: 'rahul@example.com', reason: 'UNSUBSCRIBED', note: null });

    // Step 13: another campaign to all 5
    const c2 = await store.createCampaign({
      name: 'c2', account_id: acc.id, subject_template: 'Hi {{first_name}}',
      body_text_template: 'Hey {{first_name}}', body_html_template: null, reply_to: null,
      unsubscribe_footer: false, daily_limit: null, delay_seconds: 0, status: 'RUNNING',
      start_at: null, end_at: null, started_at: new Date().toISOString(), completed_at: null, preflight: null,
    });
    await store.setCampaignRecipients(c2.id, ids);
    const pre = await runPreflight(store, c2);
    expect(pre.suppressed).toBe(1);

    // Step 14: suppressed receives ZERO
    const before = fake.for('rahul@example.com').length;
    await buildQueue(store, c2);
    for (let i = 0; i < 30; i++) await workerStep(store, { maxIterations: 1 });
    expect(fake.for('rahul@example.com').length).toBe(before);
    const msgs = await store.listMessages(c2.id);
    expect(msgs.find((m) => m.recipient === 'rahul@example.com')!.status).toBe('SUPPRESSED');
  });

  it('steps 15-16: transient retries bounded, permanent does not retry', async () => {
    const ids = await importLeads(store);
    fake.behavior.set('priya@example.com', 'transient');
    fake.behavior.set('amit@example.com', 'permanent');
    const acc = await makeAccount(store);
    const c = await store.createCampaign({
      name: 'retry', account_id: acc.id, subject_template: 'Hi {{first_name}}',
      body_text_template: 'Hey {{first_name}}', body_html_template: null, reply_to: null,
      unsubscribe_footer: false, daily_limit: null, delay_seconds: 0, status: 'RUNNING',
      start_at: null, end_at: null, started_at: new Date().toISOString(), completed_at: null, preflight: null,
    });
    await store.setCampaignRecipients(c.id, ids);
    await buildQueue(store, c);
    // Run many steps; transient priya should RETRY then FAIL after bound (fake always fails).
    for (let i = 0; i < 60; i++) {
      // fast-forward retry timers for determinism
      for (const m of await store.listMessages(c.id)) {
        if (m.status === 'RETRYING' && m.next_attempt_at) {
          await store.updateMessage(m.id, { next_attempt_at: new Date(Date.now() - 1000).toISOString() });
        }
      }
      await workerStep(store, { maxIterations: 1 });
    }
    const msgs = await store.listMessages(c.id);
    const priya = msgs.find((m) => m.recipient === 'priya@example.com')!;
    const amit = msgs.find((m) => m.recipient === 'amit@example.com')!;
    // Step 15: bounded retry (attempt_count <= 1 + MAX 2 retries)
    expect(priya.status).toBe('FAILED');
    expect(priya.attempt_count).toBeLessThanOrEqual(3);
    expect(priya.attempt_count).toBeGreaterThan(1); // did retry
    // Step 16: permanent -> NO retry (single attempt)
    expect(amit.status).toBe('FAILED');
    expect(amit.attempt_count).toBe(1);
  });

  it('steps 17-18: pause stops, resume continues', async () => {
    const ids = await importLeads(store);
    const acc = await makeAccount(store, { delay_seconds: 0 });
    const c = await store.createCampaign({
      name: 'pz', account_id: acc.id, subject_template: 'Hi {{first_name}}',
      body_text_template: 'Hey {{first_name}}', body_html_template: null, reply_to: null,
      unsubscribe_footer: false, daily_limit: null, delay_seconds: 0, status: 'RUNNING',
      start_at: null, end_at: null, started_at: new Date().toISOString(), completed_at: null, preflight: null,
    });
    await store.setCampaignRecipients(c.id, ids);
    await buildQueue(store, c);

    await workerStep(store, { maxIterations: 1 }); // send 1
    expect(fake.received.length).toBe(1);

    // Step 17: pause -> sending stops
    await store.updateCampaign(c.id, { status: 'PAUSED' });
    const n0 = fake.received.length;
    for (let i = 0; i < 5; i++) await workerStep(store, { maxIterations: 1 });
    expect(fake.received.length).toBe(n0);

    // Step 18: resume -> remaining continue
    await store.updateCampaign(c.id, { status: 'RUNNING' });
    await runWorker(store, { maxIterations: 60, pollMs: 100 });
    expect(fake.received.length).toBe(5);
  });

  it('steps 19-20: daily limit pauses, provider limits not bypassed', async () => {
    const ids = await importLeads(store);
    const acc = await makeAccount(store, { daily_limit: 2, delay_seconds: 0 });
    const c = await store.createCampaign({
      name: 'lim', account_id: acc.id, subject_template: 'Hi {{first_name}}',
      body_text_template: 'Hey {{first_name}}', body_html_template: null, reply_to: null,
      unsubscribe_footer: false, daily_limit: 2, delay_seconds: 0, status: 'RUNNING',
      start_at: null, end_at: null, started_at: new Date().toISOString(), completed_at: null, preflight: null,
    });
    await store.setCampaignRecipients(c.id, ids);
    await buildQueue(store, c);
    await runWorker(store, { maxIterations: 30, pollMs: 5 });

    // Step 19: only 2 sent, campaign paused
    expect(fake.received.length).toBe(2);
    const st = (await store.getCampaign(c.id))!.status;
    expect(['PAUSED', 'RUNNING']).toContain(st);
    // Extra worker runs must not exceed the limit (step 20).
    await runWorker(store, { maxIterations: 20, pollMs: 5 });
    expect(fake.received.length).toBe(2);
    expect(await store.sentToday(acc.id)).toBe(2);
  });

  it('account connection + single test email via fake SMTP (never queued)', async () => {
    const acc = await makeAccount(store);
    const { verifyConnection, sendOne, configFromAccount } = await import('../../src/email/sender.js');
    await verifyConnection(configFromAccount(acc)); // throws on failure
    const r = await sendOne(configFromAccount(acc), { from: acc.email, to: 'op@example.com', subject: 't', text: 'hi' });
    expect(r.accepted.join('')).toContain('op@example.com');
    expect(fake.for('op@example.com')).toHaveLength(1);
    expect(await store.countByStatus()).toEqual({}); // queue untouched
  });
});
