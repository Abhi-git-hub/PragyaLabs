import type { Store } from '../db/store.js';
import type { Campaign, Lead } from '../db/types.js';
import { isValidEmail } from '../email/validation.js';
import { buildLeadContext, extractVariables, findMissing } from '../email/template.js';

export interface PreflightCheck {
  name: string;
  passed: boolean;
  /** blocking:false = informational/warning; never affects `ok`. */
  blocking: boolean;
  message: string;
}

export interface PreflightResult {
  campaign: string;
  sender: string;
  recipients: number;
  valid: number;
  invalid: number;
  duplicates: number;
  suppressed: number;
  ready: number;
  dailyLimit: number;
  delaySeconds: number;
  missingVariables: { variable: string; affected: number }[];
  invalidEmails: string[];
  estimatedDuration: string;
  ok: boolean;
  errors: string[];
  /** Structured per-check reasons. Only blocking failures feed `errors`/`ok`. */
  checks: PreflightCheck[];
}

function fmtDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `~${totalSeconds}s`;
  const m = Math.round(totalSeconds / 60);
  if (m < 60) return `~${m} min`;
  return `~${Math.floor(m / 60)}h ${m % 60}m`;
}

export interface SmtpProbeResult {
  ok: boolean;
  code: string;
  message: string;
}

export interface PreflightOptions {
  /** Live SMTP verification closure. Absent → deterministic checks only (no I/O). */
  probeSmtp?: () => Promise<SmtpProbeResult>;
  /** Worker availability note (route-provided, informational). */
  worker?: string | null;
}

export async function runPreflight(store: Store, campaign: Campaign, opts?: PreflightOptions): Promise<PreflightResult> {
  const errors: string[] = [];
  const account = campaign.account_id ? await store.getAccount(campaign.account_id) : null;
  if (!account) errors.push('No sender account selected');

  const leadIds = await store.getCampaignLeadIds(campaign.id);
  const seen = new Set<string>();
  let valid = 0, invalid = 0, duplicates = 0, suppressed = 0;
  const invalidEmails: string[] = [];
  const leads: Lead[] = [];
  for (const id of leadIds) {
    const lead = await store.getLead(id);
    if (!lead) continue;
    const norm = lead.email.trim().toLowerCase();
    if (!isValidEmail(lead.email)) { invalid++; invalidEmails.push(lead.email); continue; }
    if (seen.has(norm)) { duplicates++; continue; }
    seen.add(norm);
    if (await store.isSuppressed(lead.email)) { suppressed++; continue; }
    valid++;
    leads.push(lead);
  }

  // Missing-variable detection across subject + bodies (production engine).
  const templates = [
    campaign.subject_template,
    campaign.body_text_template ?? '',
    campaign.body_html_template ?? '',
  ].filter(Boolean);
  const allVars = new Set<string>();
  for (const t of templates) for (const v of extractVariables(t)) allVars.add(v);
  const missingVariables: { variable: string; affected: number }[] = [];
  for (const v of [...allVars].sort()) {
    let affected = 0;
    for (const lead of leads) {
      const ctx = buildLeadContext(lead as unknown as Record<string, never>);
      const miss = findMissing(`{{${v}}}`, ctx);
      if (miss.length > 0) affected++;
      else {
        // Also check nested paths: findMissing on full templates
        for (const t of templates) {
          if (t.includes(`{{${v}`) && findMissing(t, ctx).includes(v)) { affected++; break; }
        }
      }
    }
    // Deduplicate overcount: recompute cleanly per lead across all templates
    if (affected > 0) missingVariables.push({ variable: v, affected: Math.min(affected, leads.length) });
  }
  // Recompute affected precisely (one count per lead that misses in ANY template)
  const precise = new Map<string, number>();
  for (const v of allVars) precise.set(v, 0);
  for (const lead of leads) {
    const ctx = buildLeadContext(lead as unknown as Record<string, never>);
    const missSet = new Set<string>();
    for (const t of templates) for (const m of findMissing(t, ctx)) missSet.add(m);
    for (const m of missSet) precise.set(m, (precise.get(m) ?? 0) + 1);
  }
  const missing2 = [...precise.entries()].filter(([, n]) => n > 0)
    .map(([variable, affected]) => ({ variable, affected }))
    .sort((a, b) => a.variable.localeCompare(b.variable));

  // Fallback default is provider-scale (Gmail: 500/day), never an app-level cap.
  // Configured account/campaign limits always win.
  const dailyLimit = campaign.daily_limit ?? account?.daily_limit ?? 500;
  const delaySeconds = campaign.delay_seconds ?? account?.delay_seconds ?? 30;
  if (!account) errors.push('Select a sender account before starting');
  if (valid === 0) errors.push('No ready recipients');
  if (missing2.length > 0) errors.push(`${missing2.length} variable(s) missing for some leads — fix data or exclude affected leads`);
  if (!campaign.subject_template?.trim()) errors.push('Subject is required');
  if (!campaign.body_text_template && !campaign.body_html_template) errors.push('Body is required');

  const ready = missing2.length > 0 ? 0 : valid;
  const estimatedDuration = fmtDuration(Math.max(0, (ready - 1)) * delaySeconds);
  // Message materialization state (informational: the manual flow builds the
  // queue at launch, so 0 messages here is normal and never blocks).
  const msgCounts = await store.countByStatus(campaign.id);
  const materialized = Object.values(msgCounts).reduce((a, b) => a + b, 0);
  const verified = (account?.last_test_status ?? '').startsWith('CONNECTED');
  const checks: PreflightCheck[] = [
    { name: 'sender', passed: Boolean(account), blocking: true, message: account ? `SMTP account configured (${account.display_name} <${account.email}>)` : 'No sender account selected' },
    { name: 'messages', passed: materialized > 0, blocking: false, message: materialized > 0 ? `${materialized} campaign message(s) materialized` : 'Campaign has 0 queued messages (queue builds at launch)' },
    { name: 'recipients', passed: valid > 0, blocking: true, message: valid > 0 ? `${valid} ready recipient(s) · ${invalid} invalid · ${duplicates} duplicate(s)` : 'Campaign has 0 ready recipients' },
    { name: 'suppression', passed: true, blocking: false, message: `${suppressed} suppressed recipient(s) excluded — never queued` },
    { name: 'subject', passed: Boolean(campaign.subject_template?.trim()), blocking: true, message: campaign.subject_template?.trim() ? 'Subject present' : 'Subject is required' },
    { name: 'body', passed: Boolean(campaign.body_text_template || campaign.body_html_template), blocking: true, message: (campaign.body_text_template || campaign.body_html_template) ? 'Body present' : 'Body is required' },
    { name: 'templates', passed: missing2.length === 0, blocking: true, message: missing2.length === 0 ? 'Templates valid' : `Unknown variables: ${missing2.map((m) => `{{${m.variable}}} (${m.affected} lead(s) lack it)`).join('; ')}` },
    { name: 'limits', passed: dailyLimit > 0, blocking: false, message: `Daily limit ${dailyLimit} · delay ${delaySeconds}s · est. duration ${estimatedDuration}` },
    { name: 'sender_verification', passed: verified, blocking: false, message: verified ? `SMTP verified (${account?.last_test_status})` : `SMTP not verified (${account?.last_test_status ?? 'never tested'}) — launch still allowed, sends may fail` },
  ];
  if (opts?.worker) {
    checks.push({ name: 'worker', passed: true, blocking: false, message: `Worker ${opts.worker} — sending continues after browser refresh` });
  }
  // Optional live SMTP probe. Only a deterministic auth failure blocks;
  // network/timeout outcomes warn (transient) so a blip can't wedge a launch.
  if (opts?.probeSmtp && account) {
    try {
      const probe = await opts.probeSmtp();
      const blocks = !probe.ok && probe.code === 'AUTH_FAILED';
      checks.push({ name: 'smtp_live', passed: probe.ok, blocking: blocks, message: probe.message });
      if (blocks) errors.push(probe.message);
    } catch (e) {
      checks.push({ name: 'smtp_live', passed: false, blocking: false, message: `SMTP probe errored (${e instanceof Error ? e.message : String(e)}) — launch still allowed` });
    }
  }
  return {
    campaign: campaign.name,
    sender: account ? `${account.display_name} <${account.email}>` : '(none)',
    recipients: leadIds.length,
    valid, invalid, duplicates, suppressed, ready,
    dailyLimit, delaySeconds,
    missingVariables: missing2,
    invalidEmails: invalidEmails.slice(0, 20),
    estimatedDuration,
    ok: errors.length === 0,
    errors,
    checks,
  };
}
