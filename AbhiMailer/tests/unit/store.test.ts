import { describe, it, expect } from 'vitest';
import { MemoryStore } from '../../src/db/store.js';
import { runPreflight } from '../../src/campaigns/preflight.js';
import { buildQueue } from '../../src/queue/queue.js';
import { env } from '../../src/config/env.js';

async function seedStore() {
  const s = new MemoryStore();
  const acc = await s.createAccount({
    display_name: 'Test', email: 'sender@example.com', smtp_host: '127.0.0.1',
    smtp_port: 2525, security: 'NONE', username: 'u', password_enc: 'v0:eA==',
    daily_limit: 50, delay_seconds: 0, last_test_at: null, last_test_status: null,
  });
  const l1 = await s.upsertLead({ email: 'a@example.com', first_name: 'A', company: 'Acme', source: 'csv', raw_data: {} });
  const l2 = await s.upsertLead({ email: 'b@example.com', first_name: 'B', source: 'csv', raw_data: {} }); // missing company
  return { s, acc, l1: l1.lead, l2: l2.lead };
}

describe('store invariants', () => {
  it('dedupes leads by email (case-insensitive)', async () => {
    const s = new MemoryStore();
    const a = await s.upsertLead({ email: 'A@Example.com', source: 'csv', raw_data: {} });
    const b = await s.upsertLead({ email: 'a@example.com', source: 'csv', raw_data: {} });
    expect(a.created).toBe(true);
    expect(b.created).toBe(false);
    expect(a.lead.id).toBe(b.lead.id);
  });
  it('SENT is terminal (idempotency)', async () => {
    const s = new MemoryStore();
    const c = await s.createCampaign({ name: 'c', account_id: null, subject_template: 's', body_text_template: 'b', body_html_template: null, reply_to: null, unsubscribe_footer: false, daily_limit: null, delay_seconds: null, status: 'RUNNING', start_at: null, end_at: null, started_at: null, completed_at: null, preflight: null });
    const [m] = await s.enqueueMessages([{ campaign_id: c.id, lead_id: null, account_id: null, recipient: 'x@y.z', rendered_subject: 's', rendered_text: 't', rendered_html: null, status: 'QUEUED', attempt_count: 0, max_retries: 2, last_error: null, smtp_message_id: null, sent_at: null, next_attempt_at: null, locked_at: null }]);
    await s.updateMessage(m!.id, { status: 'SENT', sent_at: new Date().toISOString() });
    const again = await s.updateMessage(m!.id, { status: 'SENDING' });
    expect(again!.status).toBe('SENT');
  });
  it('duplicate campaign+lead queue entries are reused', async () => {
    const { s, acc, l1 } = await seedStore();
    const c = await s.createCampaign({ name: 'c', account_id: acc.id, subject_template: 'Hi', body_text_template: 'b', body_html_template: null, reply_to: null, unsubscribe_footer: false, daily_limit: null, delay_seconds: null, status: 'READY', start_at: null, end_at: null, started_at: null, completed_at: null, preflight: null });
    await s.setCampaignRecipients(c.id, [l1.id]);
    const q1 = await buildQueue(s, c);
    const q2 = await buildQueue(s, c);
    expect(q1.queued).toBe(1);
    expect(q2.queued).toBe(0); // idempotent
    expect(await s.messageExists(c.id, l1.id)).toBe(true);
  });
});

describe('preflight + state transitions', () => {
  it('detects missing variables and blocks ready=0', async () => {
    const { s, acc, l1, l2 } = await seedStore();
    const c = await s.createCampaign({ name: 'c', account_id: acc.id, subject_template: 'Hi {{company}}', body_text_template: 'Hello {{first_name}}', body_html_template: null, reply_to: null, unsubscribe_footer: false, daily_limit: null, delay_seconds: null, status: 'DRAFT', start_at: null, end_at: null, started_at: null, completed_at: null, preflight: null });
    await s.setCampaignRecipients(c.id, [l1.id, l2.id]);
    const p = await runPreflight(s, c);
    expect(p.ok).toBe(false);
    expect(p.missingVariables.find((m) => m.variable === 'company')?.affected).toBe(1);
    expect(p.ready).toBe(0);
  });
  it('suppression excludes recipients', async () => {
    const { s, acc, l1 } = await seedStore();
    await s.addSuppression({ email: l1.email, reason: 'MANUAL', note: null });
    const c = await s.createCampaign({ name: 'c', account_id: acc.id, subject_template: 'Hi', body_text_template: 'Hey {{first_name}}', body_html_template: null, reply_to: null, unsubscribe_footer: false, daily_limit: null, delay_seconds: null, status: 'DRAFT', start_at: null, end_at: null, started_at: null, completed_at: null, preflight: null });
    await s.setCampaignRecipients(c.id, [l1.id]);
    const p = await runPreflight(s, c);
    expect(p.suppressed).toBe(1);
    expect(p.ready).toBe(0);
  });
  it('campaign status transitions validate', async () => {
    const s = new MemoryStore();
    const c = await s.createCampaign({ name: 'c', account_id: null, subject_template: 's', body_text_template: 'b', body_html_template: null, reply_to: null, unsubscribe_footer: false, daily_limit: null, delay_seconds: null, status: 'DRAFT', start_at: null, end_at: null, started_at: null, completed_at: null, preflight: null });
    expect(c.status).toBe('DRAFT');
    await s.updateCampaign(c.id, { status: 'RUNNING' });
    expect((await s.getCampaign(c.id))!.status).toBe('RUNNING');
    void env;
  });
});
