import type { Store } from '../db/store.js';
import type { Campaign } from '../db/types.js';
import { buildLeadContext, renderStrict, sanitizeSubject } from '../email/template.js';
import { sanitizeEmailHtml, htmlToText } from '../email/sanitize.js';
import { env } from '../config/env.js';

export const UNSUB_FOOTER_TEXT = `\n\n---\nIf you don't want to receive further emails from me, reply with "unsubscribe".`;

// Build the persistent queue for a campaign. Idempotent: existing
// (campaign_id, lead_id) rows are reused, never duplicated.
export async function buildQueue(store: Store, campaign: Campaign): Promise<{ queued: number; skipped: number; suppressed: number }> {
  const account = campaign.account_id ? await store.getAccount(campaign.account_id) : null;
  if (!account) throw new Error('Campaign has no sender account');
  const leadIds = await store.getCampaignLeadIds(campaign.id);
  let queued = 0, skipped = 0, suppressed = 0;
  const batch: Parameters<Store['enqueueMessages']>[0] = [];
  for (const lid of leadIds) {
    const lead = await store.getLead(lid);
    if (!lead) { skipped++; continue; }
    if (await store.isSuppressed(lead.email)) {
      suppressed++;
      // Record SUPPRESSED message row if not already present (idempotent).
      if (lead.id && !(await store.messageExists(campaign.id, lead.id))) {
        batch.push({
          campaign_id: campaign.id, lead_id: lead.id, account_id: account.id,
          recipient: lead.email, rendered_subject: null, rendered_text: null, rendered_html: null,
          status: 'SUPPRESSED', attempt_count: 0, max_retries: env.maxRetries,
          last_error: 'suppressed recipient', smtp_message_id: null,
          sent_at: null, next_attempt_at: null, locked_at: null,
        });
      }
      continue;
    }
    if (await store.messageExists(campaign.id, lead.id)) continue; // idempotent reuse
    const ctx = buildLeadContext(lead as unknown as Record<string, never>);
    let subject: string, text: string | undefined, html: string | undefined;
    try {
      subject = sanitizeSubject(renderStrict(campaign.subject_template, ctx));
      const footer = campaign.unsubscribe_footer ? UNSUB_FOOTER_TEXT : '';
      if (campaign.body_text_template) {
        text = renderStrict(campaign.body_text_template, ctx) + footer;
      }
      if (campaign.body_html_template) {
        const rendered = renderStrict(campaign.body_html_template, ctx);
        html = sanitizeEmailHtml(rendered) + (campaign.unsubscribe_footer ? '<p><small>If you don\'t want to receive further emails from me, reply with "unsubscribe".</small></p>' : '');
        if (!text) text = htmlToText(sanitizeEmailHtml(rendered)) + footer;
      }
      if (!text && !html) throw new Error('Empty body');
    } catch (e) {
      // Missing variable or render failure -> SKIPPED, never silently send broken mail.
      batch.push({
        campaign_id: campaign.id, lead_id: lead.id, account_id: account.id,
        recipient: lead.email, rendered_subject: null, rendered_text: null, rendered_html: null,
        status: 'SKIPPED', attempt_count: 0, max_retries: env.maxRetries,
        last_error: e instanceof Error ? e.message : String(e), smtp_message_id: null,
        sent_at: null, next_attempt_at: null, locked_at: null,
      });
      skipped++;
      continue;
    }
    batch.push({
      campaign_id: campaign.id, lead_id: lead.id, account_id: account.id,
      recipient: lead.email, rendered_subject: subject, rendered_text: text ?? null,
      rendered_html: html ?? null, status: 'QUEUED', attempt_count: 0,
      max_retries: env.maxRetries, last_error: null, smtp_message_id: null,
      sent_at: null, next_attempt_at: null, locked_at: null,
    });
    queued++;
  }
  if (batch.length > 0) await store.enqueueMessages(batch);
  return { queued, skipped, suppressed };
}
