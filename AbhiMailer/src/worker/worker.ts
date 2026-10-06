import type { Store } from '../db/store.js';
import { env } from '../config/env.js';
import { configFromAccount, getTransport } from '../email/sender.js';
import { backoffMs, classifyFailure } from '../email/retry.js';

export interface WorkerOptions {
  pollMs?: number;
  maxIterations?: number; // for tests: bound the loop
  onEvent?: (line: string) => void;
}

function ts(): string {
  return new Date().toTimeString().slice(0, 8);
}

// Single worker step: claim one message, enforce campaign/account/suppression/
// rate-limit gates, send via SMTP, record result + event. Returns true if work
// was done (or attempted), false if idle.
export async function workerStep(store: Store, opts: WorkerOptions = {}): Promise<boolean> {
  await store.resetStuckSending(5 * 60 * 1000).catch(() => 0);
  const msg = await store.claimNext();
  if (!msg) return false;

  const log = (s: string) => opts.onEvent?.(`${ts()}  ${s}`);
  const campaign = await store.getCampaign(msg.campaign_id);
  if (!campaign) {
    await store.updateMessage(msg.id, { status: 'FAILED', last_error: 'campaign not found', locked_at: null });
    return true;
  }
  if (campaign.status !== 'RUNNING') {
    // Campaign not running -> release claim back to QUEUED (unless terminal).
    await store.updateMessage(msg.id, { status: 'QUEUED', locked_at: null, next_attempt_at: new Date(Date.now() + 500).toISOString() });
    return false;
  }
  const account = msg.account_id ? await store.getAccount(msg.account_id) : null;
  if (!account) {
    await store.updateMessage(msg.id, { status: 'FAILED', last_error: 'sender account missing', locked_at: null });
    await store.addEvent({ campaign_id: campaign.id, message_id: msg.id, lead_id: msg.lead_id, type: 'failed', detail: { error: 'sender account missing' } });
    await maybeComplete(store, campaign.id);
    return true;
  }

  // Suppression gate (checked before EVERY send).
  if (await store.isSuppressed(msg.recipient)) {
    await store.updateMessage(msg.id, { status: 'SUPPRESSED', last_error: 'suppressed recipient', locked_at: null });
    await store.addEvent({ campaign_id: campaign.id, message_id: msg.id, lead_id: msg.lead_id, type: 'suppressed', detail: { recipient: msg.recipient } });
    await maybeComplete(store, campaign.id);
    return true;
  }

  // Daily-limit gate.
  const dailyLimit = campaign.daily_limit ?? account.daily_limit;
  const sentToday = await store.sentToday(account.id);
  if (sentToday >= dailyLimit) {
    await store.updateMessage(msg.id, { status: 'QUEUED', locked_at: null, next_attempt_at: nextDayStart() });
    await store.updateCampaign(campaign.id, { status: 'PAUSED' });
    await store.addEvent({ campaign_id: campaign.id, message_id: null, lead_id: null, type: 'paused_limit', detail: { sentToday, dailyLimit } });
    log(`Paused → daily limit reached (${sentToday}/${dailyLimit})`);
    return true;
  }

  // Delay gate.
  const delaySec = campaign.delay_seconds ?? account.delay_seconds;
  const lastSent = await store.lastSentAt(account.id);
  if (lastSent) {
    const waitMs = delaySec * 1000 - (Date.now() - Date.parse(lastSent));
    if (waitMs > 0) {
      if (!opts.maxIterations) await sleep(Math.min(waitMs, 5000));
      // Re-check: release and retry later if still within delay window.
      const fresh = Date.now() - Date.parse(lastSent);
      if (fresh < delaySec * 1000) {
        await store.updateMessage(msg.id, { status: 'QUEUED', locked_at: null, next_attempt_at: new Date(Date.parse(lastSent) + delaySec * 1000).toISOString() });
        return true;
      }
    }
  }

  log(`Sending → ${msg.recipient}`);
  const attempt = (msg.attempt_count ?? 0) + 1;
  try {
    const cfg = configFromAccount(account);
    const transport = getTransport(cfg);
    let info: { messageId?: string; response?: string };
    try {
      info = await transport.sendMail({
        from: account.email,
        to: msg.recipient,
        subject: msg.rendered_subject ?? '(no subject)',
        text: msg.rendered_text ?? undefined,
        html: msg.rendered_html ?? undefined,
        replyTo: campaign.reply_to ?? undefined,
      });
    } finally {
      try { transport.close(); } catch { /* ignore */ }
    }
    // SENT only on real SMTP acceptance.
    await store.updateMessage(msg.id, {
      status: 'SENT', attempt_count: attempt, locked_at: null,
      sent_at: new Date().toISOString(),
      smtp_message_id: String(info.messageId ?? ''),
      last_error: null,
    });
    await store.addEvent({ campaign_id: campaign.id, message_id: msg.id, lead_id: msg.lead_id, type: 'sent', detail: { recipient: msg.recipient, smtpId: String(info.messageId ?? '') } });
    log(`Sent → ${msg.recipient}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const kind = classifyFailure(err);
    // Uncertain acceptance (e.g. timeout after DATA) -> DELIVERY_UNKNOWN, no blind resend.
    if (/uncertain|timeout after|duplicate/i.test(message) && attempt >= 1 && /timeout|uncertain/i.test(message)) {
      await store.updateMessage(msg.id, { status: 'DELIVERY_UNKNOWN', attempt_count: attempt, last_error: message, locked_at: null });
      await store.addEvent({ campaign_id: campaign.id, message_id: msg.id, lead_id: msg.lead_id, type: 'delivery_unknown', detail: { error: message } });
      log(`Uncertain → ${msg.recipient} (${message})`);
    } else if (kind === 'transient' && attempt <= (msg.max_retries ?? env.maxRetries)) {
      await store.updateMessage(msg.id, {
        status: 'RETRYING', attempt_count: attempt, last_error: message, locked_at: null,
        next_attempt_at: new Date(Date.now() + backoffMs(attempt)).toISOString(),
      });
      await store.addEvent({ campaign_id: campaign.id, message_id: msg.id, lead_id: msg.lead_id, type: 'retry', detail: { error: message, attempt } });
      log(`Retry ${attempt} → ${msg.recipient} (${message})`);
    } else {
      await store.updateMessage(msg.id, { status: 'FAILED', attempt_count: attempt, last_error: message, locked_at: null });
      await store.addEvent({ campaign_id: campaign.id, message_id: msg.id, lead_id: msg.lead_id, type: 'failed', detail: { error: message } });
      log(`Failed → ${msg.recipient} (${message})`);
      // Permanent bounce-ish failures auto-suppress as BOUNCED? Only for mailbox errors.
      if (/mailbox|user unknown|no such user|invalid recipient|550|553/i.test(message)) {
        await store.addSuppression({ email: msg.recipient, reason: 'BOUNCED', note: message.slice(0, 300) }).catch(() => undefined);
      }
    }
  }
  await maybeComplete(store, campaign.id);
  return true;
}

async function maybeComplete(store: Store, campaignId: string): Promise<void> {
  const counts = await store.countByStatus(campaignId);
  const pending = (counts.QUEUED ?? 0) + (counts.SENDING ?? 0) + (counts.RETRYING ?? 0);
  if (pending === 0) {
    const c = await store.getCampaign(campaignId);
    if (c && c.status === 'RUNNING') {
      await store.updateCampaign(campaignId, { status: 'COMPLETED', completed_at: new Date().toISOString() });
      await store.addEvent({ campaign_id: campaignId, message_id: null, lead_id: null, type: 'completed', detail: { counts } });
    }
  }
}

function nextDayStart(): string {
  const d = new Date(); d.setHours(24, 0, 0, 0);
  return d.toISOString();
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function runWorker(store: Store, opts: WorkerOptions = {}): Promise<void> {
  const pollMs = opts.pollMs ?? env.workerPollMs;
  let iters = 0;
  for (;;) {
    if (opts.maxIterations !== undefined && iters >= opts.maxIterations) return;
    iters++;
    try {
      const worked = await workerStep(store, opts);
      if (!worked) await sleep(pollMs);
    } catch (e) {
      opts.onEvent?.(`${ts()}  worker error: ${e instanceof Error ? e.message : String(e)}`);
      await sleep(pollMs);
    }
  }
}
