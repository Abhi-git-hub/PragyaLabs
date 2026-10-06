import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import type { Account, Campaign, Event, Lead, Message, Suppression } from './types.js';

const now = () => new Date().toISOString();

// Unified store interface. MemoryStore backs tests/dev without credentials;
// SupabaseStore backs production when SUPABASE_URL + SERVICE_ROLE are set.
// Both enforce the same invariants (unique email, unique campaign+lead, suppression).
export interface Store {
  kind: string;
  // accounts
  createAccount(a: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account>;
  listAccounts(): Promise<Account[]>;
  getAccount(id: string): Promise<Account | null>;
  updateAccount(id: string, patch: Partial<Account>): Promise<Account | null>;
  // leads
  upsertLead(l: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<{ lead: Lead; created: boolean }>;
  listLeads(limit?: number, search?: string): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | null>;
  countLeads(): Promise<number>;
  // campaigns
  createCampaign(c: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign>;
  listCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | null>;
  updateCampaign(id: string, patch: Partial<Campaign>): Promise<Campaign | null>;
  setCampaignRecipients(campaignId: string, leadIds: string[]): Promise<number>;
  getCampaignLeadIds(campaignId: string): Promise<string[]>;
  removeCampaignRecipients(campaignId: string, leadIds: string[]): Promise<number>;
  // messages
  enqueueMessages(msgs: Omit<Message, 'id' | 'created_at' | 'updated_at'>[]): Promise<Message[]>;
  claimNext(campaignId?: string): Promise<Message | null>;
  updateMessage(id: string, patch: Partial<Message>): Promise<Message | null>;
  listMessages(campaignId: string): Promise<Message[]>;
  countByStatus(campaignId?: string): Promise<Record<string, number>>;
  sentToday(accountId: string): Promise<number>;
  lastSentAt(accountId: string): Promise<string | null>;
  messageExists(campaignId: string, leadId: string): Promise<boolean>;
  resetStuckSending(olderThanMs: number): Promise<number>;
  // suppressions
  addSuppression(s: Omit<Suppression, 'id' | 'created_at'>): Promise<Suppression>;
  listSuppressions(search?: string): Promise<Suppression[]>;
  removeSuppression(id: string): Promise<boolean>;
  isSuppressed(email: string): Promise<boolean>;
  // events
  addEvent(e: Omit<Event, 'id' | 'created_at'>): Promise<Event>;
  listEvents(campaignId?: string, limit?: number): Promise<Event[]>;
  // settings
  getSetting(key: string): Promise<unknown>;
  setSetting(key: string, value: unknown): Promise<void>;
}

function normEmail(e: string): string {
  return e.trim().toLowerCase();
}

// ---------------- MemoryStore ----------------
export class MemoryStore implements Store {
  kind = 'memory';
  accounts = new Map<string, Account>();
  leads = new Map<string, Lead>();
  leadByEmail = new Map<string, string>();
  campaigns = new Map<string, Campaign>();
  campaignLeads = new Map<string, Set<string>>();
  messages = new Map<string, Message>();
  msgKey = new Map<string, string>(); // campaign:lead -> message id
  suppressions = new Map<string, Suppression>();
  suppByEmail = new Map<string, string>();
  events: Event[] = [];
  settings = new Map<string, unknown>();
  private claimLock = Promise.resolve();

  async createAccount(a: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account> {
    const row: Account = { ...a, id: randomUUID(), created_at: now(), updated_at: now() };
    this.accounts.set(row.id, row);
    return row;
  }
  async listAccounts(): Promise<Account[]> {
    return [...this.accounts.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
  async getAccount(id: string): Promise<Account | null> {
    return this.accounts.get(id) ?? null;
  }
  async updateAccount(id: string, patch: Partial<Account>): Promise<Account | null> {
    const cur = this.accounts.get(id);
    if (!cur) return null;
    const next = { ...cur, ...patch, id: cur.id, updated_at: now() };
    this.accounts.set(id, next);
    return next;
  }
  async upsertLead(l: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<{ lead: Lead; created: boolean }> {
    const key = normEmail(l.email);
    const existingId = this.leadByEmail.get(key);
    if (existingId) {
      const cur = this.leads.get(existingId)!;
      const next: Lead = { ...cur, ...l, id: cur.id, email: cur.email, created_at: cur.created_at, updated_at: now() };
      this.leads.set(cur.id, next);
      return { lead: next, created: false };
    }
    const row: Lead = { ...l, id: randomUUID(), created_at: now(), updated_at: now() };
    this.leads.set(row.id, row);
    this.leadByEmail.set(key, row.id);
    return { lead: row, created: true };
  }
  async listLeads(limit = 200, search = ''): Promise<Lead[]> {
    let all = [...this.leads.values()];
    if (search) {
      const s = search.toLowerCase();
      all = all.filter((l) => l.email.toLowerCase().includes(s) || (l.company ?? '').toLowerCase().includes(s) || (l.first_name ?? '').toLowerCase().includes(s));
    }
    return all.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
  }
  async getLead(id: string): Promise<Lead | null> {
    return this.leads.get(id) ?? null;
  }
  async countLeads(): Promise<number> {
    return this.leads.size;
  }
  async createCampaign(c: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign> {
    const row: Campaign = { ...c, id: randomUUID(), created_at: now(), updated_at: now() };
    this.campaigns.set(row.id, row);
    this.campaignLeads.set(row.id, new Set());
    return row;
  }
  async listCampaigns(): Promise<Campaign[]> {
    return [...this.campaigns.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  async getCampaign(id: string): Promise<Campaign | null> {
    return this.campaigns.get(id) ?? null;
  }
  async updateCampaign(id: string, patch: Partial<Campaign>): Promise<Campaign | null> {
    const cur = this.campaigns.get(id);
    if (!cur) return null;
    const next = { ...cur, ...patch, id: cur.id, updated_at: now() };
    this.campaigns.set(id, next);
    return next;
  }
  async setCampaignRecipients(campaignId: string, leadIds: string[]): Promise<number> {
    this.campaignLeads.set(campaignId, new Set(leadIds));
    return leadIds.length;
  }
  async removeCampaignRecipients(campaignId: string, leadIds: string[]): Promise<number> {
    const set = this.campaignLeads.get(campaignId);
    if (!set) return 0;
    let n = 0;
    for (const id of leadIds) if (set.delete(id)) n++;
    return n;
  }
  async getCampaignLeadIds(campaignId: string): Promise<string[]> {
    return [...(this.campaignLeads.get(campaignId) ?? new Set())];
  }
  async enqueueMessages(msgs: Omit<Message, 'id' | 'created_at' | 'updated_at'>[]): Promise<Message[]> {
    const out: Message[] = [];
    for (const m of msgs) {
      const key = `${m.campaign_id}:${m.lead_id ?? m.recipient.toLowerCase()}`;
      const existingId = this.msgKey.get(key);
      if (existingId) {
        const ex = this.messages.get(existingId);
        if (ex) { out.push(ex); continue; }
      }
      const row: Message = { ...m, id: randomUUID(), created_at: now(), updated_at: now() };
      this.messages.set(row.id, row);
      if (m.lead_id) this.msgKey.set(`${m.campaign_id}:${m.lead_id}`, row.id);
      out.push(row);
    }
    return out;
  }
  async claimNext(campaignId?: string): Promise<Message | null> {
    // Serialize claims so two workers cannot take the same message.
    let result: Message | null = null;
    const run = async () => {
      const t = Date.now();
      const cands = [...this.messages.values()]
        .filter((m) => (m.status === 'QUEUED' || m.status === 'RETRYING')
          && (!campaignId || m.campaign_id === campaignId)
          && (!m.next_attempt_at || Date.parse(m.next_attempt_at) <= t))
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
      const pick = cands[0];
      if (!pick) { result = null; return; }
      pick.status = 'SENDING';
      pick.locked_at = now();
      pick.updated_at = now();
      result = { ...pick };
    };
    this.claimLock = this.claimLock.then(run, run);
    await this.claimLock;
    return result;
  }
  async updateMessage(id: string, patch: Partial<Message>): Promise<Message | null> {
    const cur = this.messages.get(id);
    if (!cur) return null;
    // Idempotency guard: SENT is terminal, never transitions back to sending.
    if (cur.status === 'SENT' && patch.status && patch.status !== 'SENT') return { ...cur };
    const next = { ...cur, ...patch, id: cur.id, updated_at: now() };
    this.messages.set(id, next);
    return { ...next };
  }
  async listMessages(campaignId: string): Promise<Message[]> {
    return [...this.messages.values()]
      .filter((m) => m.campaign_id === campaignId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
  async countByStatus(campaignId?: string): Promise<Record<string, number>> {
    const out: Record<string, number> = {};
    for (const m of this.messages.values()) {
      if (campaignId && m.campaign_id !== campaignId) continue;
      out[m.status] = (out[m.status] ?? 0) + 1;
    }
    return out;
  }
  async sentToday(accountId: string): Promise<number> {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    let n = 0;
    for (const m of this.messages.values()) {
      if (m.account_id === accountId && m.status === 'SENT' && m.sent_at && Date.parse(m.sent_at) >= start.getTime()) n++;
    }
    return n;
  }
  async lastSentAt(accountId: string): Promise<string | null> {
    let last: string | null = null;
    for (const m of this.messages.values()) {
      if (m.account_id === accountId && m.sent_at && (!last || m.sent_at > last)) last = m.sent_at;
    }
    return last;
  }
  async messageExists(campaignId: string, leadId: string): Promise<boolean> {
    return this.msgKey.has(`${campaignId}:${leadId}`);
  }
  async resetStuckSending(olderThanMs: number): Promise<number> {
    const cutoff = Date.now() - olderThanMs;
    let n = 0;
    for (const m of this.messages.values()) {
      if (m.status === 'SENDING' && m.locked_at && Date.parse(m.locked_at) < cutoff) {
        m.status = 'QUEUED'; m.locked_at = null; m.updated_at = now(); n++;
      }
    }
    return n;
  }
  async addSuppression(s: Omit<Suppression, 'id' | 'created_at'>): Promise<Suppression> {
    const key = normEmail(s.email);
    const existingId = this.suppByEmail.get(key);
    if (existingId) return this.suppressions.get(existingId)!;
    const row: Suppression = { ...s, email: s.email.trim(), id: randomUUID(), created_at: now() };
    this.suppressions.set(row.id, row);
    this.suppByEmail.set(key, row.id);
    return row;
  }
  async listSuppressions(search = ''): Promise<Suppression[]> {
    let all = [...this.suppressions.values()];
    if (search) all = all.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()));
    return all.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  async removeSuppression(id: string): Promise<boolean> {
    const cur = this.suppressions.get(id);
    if (!cur) return false;
    this.suppressions.delete(id);
    this.suppByEmail.delete(normEmail(cur.email));
    return true;
  }
  async isSuppressed(email: string): Promise<boolean> {
    return this.suppByEmail.has(normEmail(email));
  }
  async addEvent(e: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
    const row: Event = { ...e, id: randomUUID(), created_at: now() };
    this.events.push(row);
    return row;
  }
  async listEvents(campaignId?: string, limit = 200): Promise<Event[]> {
    let all = this.events;
    if (campaignId) all = all.filter((e) => e.campaign_id === campaignId);
    return all.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
  }
  async getSetting(key: string): Promise<unknown> {
    return this.settings.get(key) ?? null;
  }
  async setSetting(key: string, value: unknown): Promise<void> {
    this.settings.set(key, value);
  }
}

// ---------------- SupabaseStore ----------------
export class SupabaseStore implements Store {
  kind = 'supabase';
  constructor(private sb: SupabaseClient) {}

  async createAccount(a: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account> {
    const { data, error } = await this.sb.from('mailer_accounts').insert(a).select().single();
    if (error) throw error;
    return data as Account;
  }
  async listAccounts(): Promise<Account[]> {
    const { data, error } = await this.sb.from('mailer_accounts').select('*').order('created_at');
    if (error) throw error;
    return (data ?? []) as Account[];
  }
  async getAccount(id: string): Promise<Account | null> {
    const { data } = await this.sb.from('mailer_accounts').select('*').eq('id', id).maybeSingle();
    return (data as Account | null) ?? null;
  }
  async updateAccount(id: string, patch: Partial<Account>): Promise<Account | null> {
    const { data, error } = await this.sb.from('mailer_accounts').update({ ...patch, updated_at: now() }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return (data as Account | null) ?? null;
  }
  async upsertLead(l: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<{ lead: Lead; created: boolean }> {
    const norm = normEmail(l.email);
    const { data: existing } = await this.sb.from('mailer_leads').select('*').ilike('email', norm).maybeSingle();
    if (existing) {
      const { data, error } = await this.sb.from('mailer_leads').update({ ...l, email: (existing as Lead).email, updated_at: now() }).eq('id', (existing as Lead).id).select().single();
      if (error) throw error;
      return { lead: data as Lead, created: false };
    }
    const { data, error } = await this.sb.from('mailer_leads').insert(l).select().single();
    if (error) throw error;
    return { lead: data as Lead, created: true };
  }
  async listLeads(limit = 200, search = ''): Promise<Lead[]> {
    let q = this.sb.from('mailer_leads').select('*').order('created_at', { ascending: false }).limit(limit);
    if (search) q = q.or(`email.ilike.%${search}%,company.ilike.%${search}%,first_name.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Lead[];
  }
  async getLead(id: string): Promise<Lead | null> {
    const { data } = await this.sb.from('mailer_leads').select('*').eq('id', id).maybeSingle();
    return (data as Lead | null) ?? null;
  }
  async countLeads(): Promise<number> {
    const { count } = await this.sb.from('mailer_leads').select('*', { count: 'exact', head: true });
    return count ?? 0;
  }
  async createCampaign(c: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign> {
    const { data, error } = await this.sb.from('mailer_campaigns').insert(c).select().single();
    if (error) throw error;
    return data as Campaign;
  }
  async listCampaigns(): Promise<Campaign[]> {
    const { data, error } = await this.sb.from('mailer_campaigns').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Campaign[];
  }
  async getCampaign(id: string): Promise<Campaign | null> {
    const { data } = await this.sb.from('mailer_campaigns').select('*').eq('id', id).maybeSingle();
    return (data as Campaign | null) ?? null;
  }
  async updateCampaign(id: string, patch: Partial<Campaign>): Promise<Campaign | null> {
    const { data, error } = await this.sb.from('mailer_campaigns').update({ ...patch, updated_at: now() }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return (data as Campaign | null) ?? null;
  }
  async setCampaignRecipients(campaignId: string, leadIds: string[]): Promise<number> {
    await this.sb.from('mailer_campaign_leads').delete().eq('campaign_id', campaignId);
    if (leadIds.length === 0) return 0;
    const rows = leadIds.map((lead_id) => ({ campaign_id: campaignId, lead_id }));
    const { error } = await this.sb.from('mailer_campaign_leads').insert(rows);
    if (error) throw error;
    return leadIds.length;
  }
  async removeCampaignRecipients(campaignId: string, leadIds: string[]): Promise<number> {
    if (leadIds.length === 0) return 0;
    const { error, count } = await this.sb.from('mailer_campaign_leads')
      .delete({ count: 'exact' }).eq('campaign_id', campaignId).in('lead_id', leadIds);
    if (error) throw error;
    return count ?? 0;
  }
  async getCampaignLeadIds(campaignId: string): Promise<string[]> {
    const { data, error } = await this.sb.from('mailer_campaign_leads').select('lead_id').eq('campaign_id', campaignId);
    if (error) throw error;
    return (data ?? []).map((r: { lead_id: string }) => r.lead_id);
  }
  async enqueueMessages(msgs: Omit<Message, 'id' | 'created_at' | 'updated_at'>[]): Promise<Message[]> {
    // Idempotent: skip rows that already exist for (campaign_id, lead_id).
    const out: Message[] = [];
    for (const m of msgs) {
      if (m.lead_id) {
        const { data: ex } = await this.sb.from('mailer_messages').select('*').eq('campaign_id', m.campaign_id).eq('lead_id', m.lead_id).maybeSingle();
        if (ex) { out.push(ex as Message); continue; }
      }
      const { data, error } = await this.sb.from('mailer_messages').insert(m).select().single();
      if (error) {
        if (/duplicate|unique/i.test(error.message) && m.lead_id) {
          const { data: ex2 } = await this.sb.from('mailer_messages').select('*').eq('campaign_id', m.campaign_id).eq('lead_id', m.lead_id).maybeSingle();
          if (ex2) { out.push(ex2 as Message); continue; }
        }
        throw error;
      }
      out.push(data as Message);
    }
    return out;
  }
  async claimNext(campaignId?: string): Promise<Message | null> {
    // Atomic claim via RPC (FOR UPDATE SKIP LOCKED). Falls back to ordered select+update.
    try {
      const { data, error } = await this.sb.rpc('mailer_claim_next', { p_campaign_id: campaignId ?? null });
      if (!error && data && (data as { id: string }[]).length > 0) {
        const id = (data as { id: string }[])[0]!.id;
        const { data: msg } = await this.sb.from('mailer_messages').select('*').eq('id', id).maybeSingle();
        return (msg as Message | null) ?? null;
      }
    } catch { /* fallback below */ }
    const q = this.sb.from('mailer_messages').select('*')
      .in('status', ['QUEUED', 'RETRYING'])
      .order('created_at').limit(1);
    const qq = campaignId ? q.eq('campaign_id', campaignId) : q;
    const { data: cand } = await qq.maybeSingle();
    if (!cand) return null;
    const m = cand as Message;
    if (m.next_attempt_at && Date.parse(m.next_attempt_at) > Date.now()) return null;
    const { data: claimed } = await this.sb.from('mailer_messages')
      .update({ status: 'SENDING', locked_at: now(), updated_at: now() })
      .eq('id', m.id).in('status', ['QUEUED', 'RETRYING']).select().maybeSingle();
    return (claimed as Message | null) ?? null;
  }
  async updateMessage(id: string, patch: Partial<Message>): Promise<Message | null> {
    const { data: cur } = await this.sb.from('mailer_messages').select('*').eq('id', id).maybeSingle();
    if (!cur) return null;
    if ((cur as Message).status === 'SENT' && patch.status && patch.status !== 'SENT') return cur as Message;
    const { data, error } = await this.sb.from('mailer_messages').update({ ...patch, updated_at: now() }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return (data as Message | null) ?? null;
  }
  async listMessages(campaignId: string): Promise<Message[]> {
    const { data, error } = await this.sb.from('mailer_messages').select('*').eq('campaign_id', campaignId).order('created_at');
    if (error) throw error;
    return (data ?? []) as Message[];
  }
  async countByStatus(campaignId?: string): Promise<Record<string, number>> {
    let q = this.sb.from('mailer_messages').select('status');
    if (campaignId) q = q.eq('campaign_id', campaignId);
    const { data, error } = await q;
    if (error) throw error;
    const out: Record<string, number> = {};
    for (const r of (data ?? []) as { status: string }[]) out[r.status] = (out[r.status] ?? 0) + 1;
    return out;
  }
  async sentToday(accountId: string): Promise<number> {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const { count } = await this.sb.from('mailer_messages').select('*', { count: 'exact', head: true })
      .eq('account_id', accountId).eq('status', 'SENT').gte('sent_at', start.toISOString());
    return count ?? 0;
  }
  async lastSentAt(accountId: string): Promise<string | null> {
    const { data } = await this.sb.from('mailer_messages').select('sent_at')
      .eq('account_id', accountId).eq('status', 'SENT').order('sent_at', { ascending: false }).limit(1).maybeSingle();
    return (data as { sent_at: string } | null)?.sent_at ?? null;
  }
  async messageExists(campaignId: string, leadId: string): Promise<boolean> {
    const { data } = await this.sb.from('mailer_messages').select('id').eq('campaign_id', campaignId).eq('lead_id', leadId).maybeSingle();
    return Boolean(data);
  }
  async resetStuckSending(olderThanMs: number): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanMs).toISOString();
    const { data } = await this.sb.from('mailer_messages').select('id').eq('status', 'SENDING').lt('locked_at', cutoff);
    let n = 0;
    for (const r of (data ?? []) as { id: string }[]) {
      await this.sb.from('mailer_messages').update({ status: 'QUEUED', locked_at: null, updated_at: now() }).eq('id', r.id);
      n++;
    }
    return n;
  }
  async addSuppression(s: Omit<Suppression, 'id' | 'created_at'>): Promise<Suppression> {
    const { data: ex } = await this.sb.from('mailer_suppressions').select('*').ilike('email', s.email.trim()).maybeSingle();
    if (ex) return ex as Suppression;
    const { data, error } = await this.sb.from('mailer_suppressions').insert(s).select().single();
    if (error) throw error;
    return data as Suppression;
  }
  async listSuppressions(search = ''): Promise<Suppression[]> {
    let q = this.sb.from('mailer_suppressions').select('*').order('created_at', { ascending: false });
    if (search) q = q.ilike('email', `%${search}%`);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Suppression[];
  }
  async removeSuppression(id: string): Promise<boolean> {
    const { error } = await this.sb.from('mailer_suppressions').delete().eq('id', id);
    return !error;
  }
  async isSuppressed(email: string): Promise<boolean> {
    const { data } = await this.sb.from('mailer_suppressions').select('id').ilike('email', email.trim()).maybeSingle();
    return Boolean(data);
  }
  async addEvent(e: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
    const { data, error } = await this.sb.from('mailer_events').insert(e).select().single();
    if (error) throw error;
    return data as Event;
  }
  async listEvents(campaignId?: string, limit = 200): Promise<Event[]> {
    let q = this.sb.from('mailer_events').select('*').order('created_at', { ascending: false }).limit(limit);
    if (campaignId) q = q.eq('campaign_id', campaignId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Event[];
  }
  async getSetting(key: string): Promise<unknown> {
    const { data } = await this.sb.from('mailer_settings').select('value').eq('key', key).maybeSingle();
    return (data as { value: unknown } | null)?.value ?? null;
  }
  async setSetting(key: string, value: unknown): Promise<void> {
    await this.sb.from('mailer_settings').upsert({ key, value, updated_at: now() });
  }
}

let singleton: Store | null = null;

export function getStore(): Store {
  if (singleton) return singleton;
  if (env.supabaseUrl && env.supabaseServiceKey) {
    const sb = createClient(env.supabaseUrl, env.supabaseServiceKey, { auth: { persistSession: false } });
    singleton = new SupabaseStore(sb);
  } else {
    singleton = new MemoryStore();
  }
  return singleton;
}

// Test hook: allow injection of a fresh MemoryStore.
export function setStore(s: Store | null): void {
  singleton = s;
}
