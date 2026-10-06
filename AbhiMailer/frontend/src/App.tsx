import { useCallback, useEffect, useState } from 'react';
import './styles.css';
import { api, downloadCsv } from './api';
import ImportWizard from './Import';
import ErrorBoundary from './ErrorBoundary';

type Page = 'dashboard' | 'campaigns' | 'detail' | 'import' | 'leads' | 'accounts' | 'templates' | 'suppression' | 'activity' | 'settings';

interface CsvImportReport { mode?: string; total?: number; imported?: number; rejected?: { email: string; reason: string; row: Record<string, string> }[]; }
interface Campaign { id: string; name: string; status: string; subject_template: string; account_id: string | null; counts?: Record<string, number>; created_at: string; preflight?: { delaySeconds?: number; csvImport?: CsvImportReport } | null; }
interface Lead { id: string; email: string; first_name?: string | null; company?: string | null; }
interface Account { id: string; display_name: string; email: string; smtp_host: string; smtp_port: number; security: string; last_test_status?: string | null; }

const SAMPLE_CSV = `first_name,email,company,website,industry
Rahul,rahul@example.com,Example Pvt Ltd,https://example.com,Salon
Priya,priya@example.com,Another Ltd,https://another.com,Dentist`;

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [detailId, setDetailId] = useState<string>('');
  const [health, setHealth] = useState<{ store?: string } | null>(null);
  const [dash, setDash] = useState<{ totals?: Record<string, number> } | null>(null);

  const refresh = useCallback(async () => {
    try { setHealth(await api('/api/health')); } catch { /* offline */ }
    try { setDash(await api('/api/dashboard')); } catch { /* offline */ }
  }, []);
  useEffect(() => { void refresh(); const t = setInterval(refresh, 5000); return () => clearInterval(t); }, [refresh]);

  const nav: { id: Page; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' }, { id: 'campaigns', label: 'Campaigns' },
    { id: 'leads', label: 'Leads' }, { id: 'accounts', label: 'Accounts' },
    { id: 'templates', label: 'Templates' }, { id: 'suppression', label: 'Suppression' },
    { id: 'activity', label: 'Activity' }, { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="layout">
      <aside className="side">
        <div className="brand">Mail<span>Mania</span></div>
        <div className="nav">
          {nav.map((n) => (
            <button key={n.id} className={page === n.id ? 'on' : ''} onClick={() => setPage(n.id)}>{n.label}</button>
          ))}
        </div>
      </aside>
      <div className="main">
        <div className="top">
          <span className="pill">Store <b>{health?.store ?? '…'}</b></span>
          <span className="pill">Today sent <b>{dash?.totals?.today ?? 0}</b></span>
          <span className="pill">Queued <b>{dash?.totals?.queued ?? 0}</b></span>
          <span className="pill">SMTP <b>per-account</b></span>
        </div>
        <div className="body">
          <ErrorBoundary key={page === 'detail' ? `detail-${detailId}` : page} page={page}>
          {page === 'dashboard' && <Dashboard go={(p, id) => { setPage(p); if (id) setDetailId(id); }} />}
          {page === 'campaigns' && <Campaigns go={(id) => { setDetailId(id); setPage('detail'); }} importCsv={() => setPage('import')} />}
          {page === 'import' && <ImportWizard openCampaign={(id) => { setDetailId(id); setPage('detail'); }} />}
          {page === 'detail' && <Detail id={detailId} back={() => setPage('campaigns')} />}
          {page === 'leads' && <Leads />}
          {page === 'accounts' && <Accounts />}
          {page === 'templates' && <Templates />}
          {page === 'suppression' && <Suppression />}
          {page === 'activity' && <Activity />}
          {page === 'settings' && <Settings />}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ go }: { go: (p: Page, id?: string) => void }) {
  const [d, setD] = useState<{ totals: Record<string, number>; recent: Campaign[] } | null>(null);
  useEffect(() => { api<{ totals: Record<string, number>; recent: Campaign[] }>('/api/dashboard').then(setD).catch(() => null); }, []);
  if (!d) return <p>Loading…</p>;
  const t = d.totals;
  const cards: [string, number][] = [
    ['Campaigns', t.campaigns ?? 0], ['Running', t.running ?? 0], ['Completed', t.completed ?? 0],
    ['Sent', t.sent ?? 0], ['Queued', t.queued ?? 0], ['Failed', t.failed ?? 0],
    ['Suppressed', t.suppressed ?? 0], ["Today's sent", t.today ?? 0],
  ];
  return (
    <div>
      <h2>Dashboard</h2>
      <div className="panel" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <b>New outreach?</b>
          <p style={{ color: '#9aa6b8', margin: '4px 0' }}>Upload a CSV → preview → choose sender → launch. Nothing sends until you press START.</p>
        </div>
        <button className="btn" onClick={() => go('import')}>⤴ Import CSV Campaign</button>
      </div>
      <div className="cards">{cards.map(([k, v]) => <div className="card" key={k}><div className="k">{k}</div><div className="v">{v}</div></div>)}</div>
      <div className="panel">
        <h3>Recent campaigns</h3>
        <table><thead><tr><th>Name</th><th>Status</th><th></th></tr></thead>
          <tbody>{d.recent.map((c) => <tr key={c.id}><td>{c.name}</td><td><Status s={c.status} /></td><td><button className="btn ghost" onClick={() => go('detail', c.id)}>Open</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function Status({ s }: { s: string }) {
  return <span className={`badge b ${s.toLowerCase()}`}>{s}</span>;
}

function Campaigns({ go, importCsv }: { go: (id: string) => void; importCsv: () => void }) {
  const [list, setList] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [form, setForm] = useState({ name: '', account_id: '', subject: 'Quick idea for {{company}}', body_text: 'Hi {{first_name}},\n\nI was looking at {{company}} and noticed something interesting.\n\nBest,\nAbhi', lead_ids: [] as string[] });
  const [msg, setMsg] = useState('');
  const load = useCallback(async () => {
    const c = await api<{ campaigns: Campaign[] }>('/api/campaigns').catch(() => ({ campaigns: [] }));
    setList(c.campaigns);
    const a = await api<{ accounts: Account[] }>('/api/accounts').catch(() => ({ accounts: [] }));
    setAccounts(a.accounts);
    const l = await api<{ leads: Lead[] }>('/api/leads?limit=500').catch(() => ({ leads: [] }));
    setLeads(l.leads);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const create = async () => {
    setMsg('');
    try {
      const r = await api<{ campaign: Campaign }>('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({ name: form.name, account_id: form.account_id || null, subject: form.subject, body_text: form.body_text, lead_ids: form.lead_ids }),
      });
      setMsg(`Created ${r.campaign.id} (DRAFT — nothing sent)`);
      setForm({ ...form, name: '' });
      void load();
    } catch (e) { setMsg(`Error: ${e instanceof Error ? e.message : String(e)}`); }
  };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ flex: 1 }}>Campaigns</h2>
        <button className="btn" onClick={importCsv}>⤴ Import CSV</button>
      </div>
      <div className="panel">
        <h3>New campaign (never auto-sends)</h3>
        <label>Campaign name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <div className="row">
          <label>Sender account<select value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })}><option value="">— select —</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.display_name} &lt;{a.email}&gt;</option>)}</select></label>
          <label>Recipients ({form.lead_ids.length} selected)<select multiple value={form.lead_ids} style={{ minHeight: 90 }} onChange={(e) => setForm({ ...form, lead_ids: [...e.target.selectedOptions].map((o) => o.value) })}>{leads.map((l) => <option key={l.id} value={l.id}>{l.email}</option>)}</select></label>
        </div>
        <label>Subject<input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label>
        <label>Body (supports {'{{first_name}} {{company}} …'})<textarea value={form.body_text} onChange={(e) => setForm({ ...form, body_text: e.target.value })} /></label>
        <button className="btn" onClick={create}>Create campaign</button>
        {msg && <p>{msg}</p>}
      </div>
      <div className="panel">
        <table><thead><tr><th>Name</th><th>Status</th><th>Sent</th><th>Queued</th><th>Failed</th><th></th></tr></thead>
          <tbody>{list.map((c) => <tr key={c.id}><td>{c.name}</td><td><Status s={c.status} /></td><td>{c.counts?.SENT ?? 0}</td><td>{(c.counts?.QUEUED ?? 0) + (c.counts?.RETRYING ?? 0)}</td><td>{c.counts?.FAILED ?? 0}</td><td><button className="btn ghost" onClick={() => go(c.id)}>Open</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function Detail({ id, back }: { id: string; back: () => void }) {
  const [data, setData] = useState<{ campaign: Campaign; counts: Record<string, number>; progress: number } | null>(null);
  const [pre, setPre] = useState<{ preflight?: Record<string, unknown> } & Record<string, unknown> | null>(null);
  const [msgs, setMsgs] = useState<{ messages: { id: string; recipient: string; status: string; last_error?: string | null; sent_at?: string | null }[] }>({ messages: [] });
  const [events, setEvents] = useState<{ events: { id: string; type: string; created_at: string; detail: Record<string, unknown> }[] }>({ events: [] });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [prevLead, setPrevLead] = useState('');
  const [prev, setPrev] = useState<{ from?: string; to?: string; subject?: string; text?: string; html?: string | null; error?: string } | null>(null);
  const [msg, setMsg] = useState('');
  const load = useCallback(async () => {
    if (!id) return;
    setData(await api(`/api/campaigns/${id}`).catch(() => null));
    setMsgs(await api(`/api/campaigns/${id}/messages`).catch(() => ({ messages: [] })));
    setEvents(await api(`/api/campaigns/${id}/events`).catch(() => ({ events: [] })));
    setLeads((await api<{ leads: Lead[] }>('/api/leads?limit=500').catch(() => ({ leads: [] }))).leads);
  }, [id]);
  useEffect(() => { void load(); const t = setInterval(load, 3000); return () => clearInterval(t); }, [load]);
  const act = async (a: string, confirmStop = false) => {
    if (confirmStop && !window.confirm('STOP this campaign? Sending will halt.')) return;
    setMsg('');
    try {
      const r = await api<{ preflight?: unknown; error?: unknown }>(`/api/campaigns/${id}/${a}`, { method: 'POST' });
      if (a === 'validate' || a === 'start') setPre(r as typeof pre);
      setMsg(`${a} ok`);
    } catch (e) {
      const s = String(e instanceof Error ? e.message : e);
      // Structured reasons travel on the error body (e.g. 409 { error, preflight }).
      const body = (e as { body?: { preflight?: unknown; error?: unknown } }).body;
      if (body?.preflight) {
        setPre({ preflight: body.preflight } as typeof pre);
        const errs = (body.preflight as { errors?: string[] }).errors ?? [];
        setMsg(`Preflight failed: ${errs.join(' · ') || s}`);
      } else {
        setMsg(`Error: ${s}`);
      }
    }
    void load();
  };
  if (!data) return <div><button className="btn ghost" onClick={back}>← Campaigns</button><p>Loading…</p></div>;
  const c = data.campaign;
  const total = Object.values(data.counts).reduce((a, b) => a + b, 0);
  const pct = Math.round(data.progress * 100);
  const pending = (data.counts.QUEUED ?? 0) + (data.counts.RETRYING ?? 0) + (data.counts.SENDING ?? 0);
  // Next-send estimate from the existing poll data (no new infrastructure).
  const delaySec = c.preflight?.delaySeconds ?? 0;
  const lastSent = msgs.messages.map((m) => m.sent_at).filter(Boolean).sort().pop();
  const nextInSec = c.status === 'RUNNING' && pending > 0 && delaySec > 0 && lastSent
    ? Math.max(0, Math.round((Date.parse(lastSent as string) + delaySec * 1000 - Date.now()) / 1000))
    : null;
  const rejected = c.preflight?.csvImport?.rejected ?? [];
  const downloadRejected = () => {
    if (rejected.length === 0) return;
    const extra = Object.keys(rejected[0]?.row ?? {});
    const headers = ['email', 'reason', ...extra.filter((h) => h !== 'email')];
    downloadCsv(`rejected-${c.id}.csv`, headers,
      rejected.map((r) => [r.email, r.reason, ...headers.slice(2).map((h) => r.row[h] ?? '')]));
  };
  return (
    <div>
      <button className="btn ghost" onClick={back}>← Campaigns</button>
      <h2>{c.name}</h2>
      <p><Status s={c.status} /> &nbsp; Created {new Date(c.created_at).toLocaleString()}</p>
      <div className="panel">
        <div className="bar"><i style={{ width: `${pct}%` }} /></div>
        <p>{'█'.repeat(Math.round(pct / 10))}{'░'.repeat(10 - Math.round(pct / 10))} {pct}% — {data.counts.SENT ?? 0} / {total}</p>
        <p>Queued {data.counts.QUEUED ?? 0} · Sending {data.counts.SENDING ?? 0} · Sent {data.counts.SENT ?? 0} · Failed {data.counts.FAILED ?? 0} · Retrying {data.counts.RETRYING ?? 0} · Skipped {data.counts.SKIPPED ?? 0} · Suppressed {data.counts.SUPPRESSED ?? 0} · Pending {pending}</p>
        {nextInSec !== null && <p style={{ color: '#9aa6b8' }}>Next send: {nextInSec === 0 ? 'due now' : `~${nextInSec} seconds`}</p>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" disabled={c.status !== 'READY' && c.status !== 'DRAFT'} onClick={() => act('validate')}>Validate (preflight)</button>
          <button className="btn" disabled={!['READY', 'PAUSED', 'DRAFT'].includes(c.status)} onClick={() => act('start')}>Start campaign</button>
          <button className="btn ghost" disabled={c.status !== 'RUNNING'} onClick={() => act('pause')}>Pause</button>
          <button className="btn ghost" disabled={c.status !== 'PAUSED'} onClick={() => act('resume')}>Resume</button>
          <button className="btn danger" onClick={() => act('stop', true)}>Stop</button>
          <a className="btn ghost" style={{ textDecoration: 'none' }} href={`/api/campaigns/${id}/export.csv`}>Export results CSV</a>
          {rejected.length > 0 && <button className="btn ghost" onClick={downloadRejected}>Rejected rows ({rejected.length})</button>}
        </div>
        {msg && <p className={msg.startsWith('Preflight failed') || msg.startsWith('Error') ? 'err' : undefined}>{msg}</p>}
        {pre && <PreflightReasons pre={pre.preflight ?? pre} />}
      </div>
      <div className="panel">
        <h3>Email preview (production engine)</h3>
        <div className="row">
          <label>Lead<select value={prevLead} onChange={(e) => setPrevLead(e.target.value)}><option value="">— select —</option>{leads.map((l) => <option key={l.id} value={l.id}>{l.email}</option>)}</select></label>
          <label>&nbsp;<button className="btn ghost" onClick={async () => { setPrev(await api(`/api/campaigns/${id}/preview?lead_id=${prevLead}`).catch((e) => ({ error: String(e) }))); }}>Render preview</button></label>
        </div>
        {prev && <pre className="log">{JSON.stringify(prev, null, 2)}</pre>}
      </div>
      <div className="grid2">
        <div className="panel"><h3>Messages</h3><table><thead><tr><th>To</th><th>Status</th><th>Error</th></tr></thead><tbody>{msgs.messages.slice(0, 100).map((m) => <tr key={m.id}><td>{m.recipient}</td><td>{m.status}</td><td>{m.last_error ?? ''}</td></tr>)}</tbody></table></div>
        <div className="panel"><h3>Live console</h3><div className="log">{events.events.slice().reverse().map((e) => `${e.created_at.slice(11, 19)}  ${e.type}  ${JSON.stringify(e.detail)}`).join('\n') || 'No events yet.'}</div></div>
      </div>
    </div>
  );
}

function PreflightReasons({ pre }: { pre: Record<string, unknown> }) {
  const checks = (pre.checks ?? []) as { name: string; passed: boolean; blocking: boolean; message: string }[];
  const errors = (pre.errors ?? []) as string[];
  if (checks.length === 0) {
    return (
      <div>
        {errors.length > 0 && <ul>{errors.map((e, i) => <li key={i} className="err">✗ {e}</li>)}</ul>}
        <details><summary>Raw preflight</summary><pre className="log">{JSON.stringify(pre, null, 2)}</pre></details>
      </div>
    );
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {checks.map((c, i) => (
        <li key={i} style={{ color: c.passed ? '#5fe39a' : c.blocking ? '#ff9b94' : '#ffd479' }}>
          {c.passed ? '✓' : c.blocking ? '✗' : '⚠'} <b>{c.name}</b> — {c.message}
        </li>
      ))}
    </ul>
  );
}

function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [csv, setCsv] = useState(SAMPLE_CSV);
  const [prev, setPrev] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState('');
  const load = useCallback(async () => {
    setLeads((await api<{ leads: Lead[] }>('/api/leads?limit=200').catch(() => ({ leads: [] }))).leads);
  }, []);
  useEffect(() => { void load(); }, [load]);
  return (
    <div>
      <h2>Leads</h2>
      <div className="panel">
        <h3>CSV import</h3>
        <label>CSV<textarea value={csv} onChange={(e) => setCsv(e.target.value)} style={{ minHeight: 140 }} /></label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn ghost" onClick={async () => setPrev(await api('/api/leads/preview', { method: 'POST', body: JSON.stringify({ csv }) }))}>Preview</button>
          <button className="btn" onClick={async () => { const r = await api<Record<string, unknown>>('/api/leads/import', { method: 'POST', body: JSON.stringify({ csv }) }); setMsg(JSON.stringify(r)); void load(); }}>Import (exclude invalid)</button>
        </div>
        {prev && <pre className="log">{JSON.stringify(prev, null, 2)}</pre>}
        {msg && <p className="ok">{msg}</p>}
      </div>
      <div className="panel"><table><thead><tr><th>Email</th><th>Name</th><th>Company</th></tr></thead><tbody>{leads.map((l) => <tr key={l.id}><td>{l.email}</td><td>{l.first_name ?? ''}</td><td>{l.company ?? ''}</td></tr>)}</tbody></table></div>
    </div>
  );
}

function Accounts() {
  const [list, setList] = useState<Account[]>([]);
  const [form, setForm] = useState({ display_name: 'My Gmail', email: '', smtp_host: 'smtp.gmail.com', smtp_port: 587, security: 'STARTTLS', username: '', password: '', daily_limit: 500, delay_seconds: 30 });
  const [msg, setMsg] = useState('');
  const [testTo, setTestTo] = useState('');
  const load = useCallback(async () => { setList((await api<{ accounts: Account[] }>('/api/accounts').catch(() => ({ accounts: [] }))).accounts); }, []);
  useEffect(() => { void load(); }, [load]);
  const save = async () => {
    try {
      await api('/api/accounts', { method: 'POST', body: JSON.stringify({ ...form, smtp_port: Number(form.smtp_port) }) });
      setMsg('Account saved (password never returned).');
      void load();
    } catch (e) { setMsg(`Error: ${e instanceof Error ? e.message : String(e)}`); }
  };
  const testConn = async (id: string) => {
    setMsg('Testing connection…');
    try { const r = await api<{ status: string }>(`/api/accounts/${id}/test-connection`, { method: 'POST' }); setMsg(`Connection: ${r.status}`); }
    catch (e) { setMsg(`Connection FAILED: ${e instanceof Error ? e.message : String(e)}`); }
    void load();
  };
  const sendTest = async (id: string) => {
    if (!testTo) { setMsg('Enter a test recipient first.'); return; }
    if (!window.confirm(`Send ONE TEST EMAIL to ${testTo}? This does not enter any campaign queue.`)) return;
    try { const r = await api<{ smtpId: string }>(`/api/accounts/${id}/send-test`, { method: 'POST', body: JSON.stringify({ to: testTo, subject: 'Mail Mania test', text: 'Hello from Mail Mania test email.' }) }); setMsg(`TEST EMAIL sent, smtpId=${r.smtpId}`); }
    catch (e) { setMsg(`Test email FAILED: ${e instanceof Error ? e.message : String(e)}`); }
  };
  return (
    <div>
      <h2>Accounts (SMTP)</h2>
      <div className="panel">
        <h3>Add SMTP account</h3>
        <div className="row">
          <label>Display name<input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></label>
          <label>Email address<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        </div>
        <div className="row">
          <label>SMTP host<input value={form.smtp_host} onChange={(e) => setForm({ ...form, smtp_host: e.target.value })} /></label>
          <label>SMTP port<input type="number" value={form.smtp_port} onChange={(e) => setForm({ ...form, smtp_port: Number(e.target.value) })} /></label>
        </div>
        <div className="row">
          <label>Security<select value={form.security} onChange={(e) => setForm({ ...form, security: e.target.value })}><option>SSL</option><option>STARTTLS</option><option>NONE</option></select></label>
          <label>Username<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
        </div>
        <div className="row">
          <label>Password / App password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <label>Daily limit<input type="number" value={form.daily_limit} onChange={(e) => setForm({ ...form, daily_limit: Number(e.target.value) })} /></label>
        </div>
        <label>Delay between messages (seconds)<input type="number" value={form.delay_seconds} onChange={(e) => setForm({ ...form, delay_seconds: Number(e.target.value) })} /></label>
        <button className="btn" onClick={save}>Save account</button>
        {msg && <p>{msg}</p>}
      </div>
      <div className="panel">
        <h3>Send test email (explicit, one message, never queued)</h3>
        <label>Recipient<input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" /></label>
        <table><thead><tr><th>Account</th><th>SMTP</th><th>Last test</th><th></th></tr></thead>
          <tbody>{list.map((a) => <tr key={a.id}><td>{a.display_name} &lt;{a.email}&gt;</td><td>{a.smtp_host}:{a.smtp_port}/{a.security}</td><td>{a.last_test_status ?? '—'}</td><td style={{ display: 'flex', gap: 6 }}><button className="btn ghost" onClick={() => testConn(a.id)}>Test connection</button><button className="btn ghost" onClick={() => sendTest(a.id)}>Send test email</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function Templates() {
  const [tpls, setTpls] = useState<{ name: string; subject: string; body: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('abhimailer.templates') ?? '[]'); } catch { return []; }
  });
  const [f, setF] = useState({ name: '', subject: '', body: '' });
  const save = () => {
    const next = [...tpls, { name: f.name || `Template ${tpls.length + 1}`, subject: f.subject, body: f.body }];
    setTpls(next); localStorage.setItem('abhimailer.templates', JSON.stringify(next)); setF({ name: '', subject: '', body: '' });
  };
  return (
    <div>
      <h2>Templates</h2>
      <div className="panel">
        <label>Name<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label>Subject<input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="Quick idea for {{company}}" /></label>
        <label>Body<textarea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder={'Hi {{first_name}}, ...'} /></label>
        <button className="btn" onClick={save}>Save snippet</button>
      </div>
      <div className="panel">{tpls.length === 0 ? <p>No saved snippets. Variables like {'{{first_name}} {{company}} {{industry}}'} work in campaigns.</p> : tpls.map((t, i) => <pre className="log" key={i}>{t.name}\nSubject: {t.subject}\n{t.body}</pre>)}</div>
    </div>
  );
}

function Suppression() {
  const [list, setList] = useState<{ id: string; email: string; reason: string }[]>([]);
  const [email, setEmail] = useState('');
  const load = useCallback(async () => { setList((await api<{ suppressions: { id: string; email: string; reason: string }[] }>('/api/suppressions').catch(() => ({ suppressions: [] }))).suppressions); }, []);
  useEffect(() => { void load(); }, [load]);
  return (
    <div>
      <h2>Suppression list</h2>
      <div className="panel">
        <div className="row"><label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>&nbsp;<button className="btn" onClick={async () => { await api('/api/suppressions', { method: 'POST', body: JSON.stringify({ email }) }); setEmail(''); void load(); }}>Add</button></label></div>
        <table><thead><tr><th>Email</th><th>Reason</th><th></th></tr></thead><tbody>{list.map((s) => <tr key={s.id}><td>{s.email}</td><td>{s.reason}</td><td><button className="btn ghost" onClick={async () => { await api(`/api/suppressions/${s.id}`, { method: 'DELETE' }); void load(); }}>Remove</button></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}

function Activity() {
  const [ev, setEv] = useState<{ events: { id: string; type: string; created_at: string; detail: Record<string, unknown> }[] }>({ events: [] });
  useEffect(() => { api<{ events: { id: string; type: string; created_at: string; detail: Record<string, unknown> }[] }>('/api/activity').then(setEv).catch(() => null); }, []);
  return <div><h2>Activity</h2><div className="panel"><div className="log">{ev.events.map((e) => `${e.created_at.slice(11, 19)}  ${e.type}  ${JSON.stringify(e.detail)}`).join('\n') || 'No events.'}</div></div></div>;
}

function Settings() {
  return (
    <div>
      <h2>Settings</h2>
      <div className="panel">
        <p>Local-first: server binds <b>127.0.0.1</b> by default. Supabase is the database/state layer; SMTP is the mail transport. No telemetry.</p>
        <p>Passwords are AES-256-GCM encrypted when <b>CREDENTIALS_KEY</b> is set, otherwise obscured. They are never returned by the API or printed in logs.</p>
        <p>CLI: <code>npm run mailer -- --campaign &lt;id&gt;</code> shares the same service layer as the UI.</p>
      </div>
    </div>
  );
}
