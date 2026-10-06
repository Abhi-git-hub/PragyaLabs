import { useCallback, useEffect, useRef, useState } from 'react';
import { api, apiForm, downloadCsv } from './api';

export type Role = 'email' | 'company' | 'first_name' | 'full_name' | 'last_name' | 'job_title' | 'website' | 'industry' | 'subject' | 'body' | 'custom';

interface Account { id: string; display_name: string; email: string; daily_limit: number; delay_seconds: number; }
interface ConnState { status: 'idle' | 'checking' | 'CONNECTED' | 'FAILED'; code?: string; fix?: string; }
interface Preview {
  headers: string[]; roles: Record<string, Role>;
  fieldConfidence: Record<string, { role: string; score: number; source: string }>;
  emailCandidates: string[]; needsChoice: boolean;
  emailHeader: string | null; subjectHeader: string | null; bodyHeader: string | null;
  customFields: string[];
  total: number; valid: number; missingEmail: number; invalidEmail: number;
  duplicates: number; missingContent: number; suppressed: number; sendable: number;
  suggestedMode: 'row' | 'template';
  rejectedSample: { email: string; reason: string }[];
  previews: { to: string; subject: string; text: string; missing: string[] }[];
  templateMissing: { variable: string; affected: number }[];
}
interface Check { name: string; passed: boolean; blocking: boolean; message: string; }
interface Preflight {
  campaign: string; sender: string; recipients: number; valid: number; ready: number;
  suppressed: number; dailyLimit: number; delaySeconds: number; estimatedDuration: string;
  missingVariables: { variable: string; affected: number }[];
  ok: boolean; errors: string[]; checks: Check[];
}
interface ImportResult {
  campaign: { id: string; name: string; status: string };
  mode: 'row' | 'template';
  total: number; valid: number; suppressed: number; imported: number;
  rejected: { email: string; reason: string; row: Record<string, string> }[];
}

const ROLE_OPTIONS: { v: Role; label: string }[] = [
  { v: 'email', label: 'Email' }, { v: 'company', label: 'Company' },
  { v: 'first_name', label: 'First Name' }, { v: 'full_name', label: 'Full Name' },
  { v: 'last_name', label: 'Last Name' }, { v: 'job_title', label: 'Job Title / Role' },
  { v: 'website', label: 'Website' }, { v: 'industry', label: 'Industry' },
  { v: 'subject', label: 'Subject (per-row)' }, { v: 'body', label: 'Message (per-row)' },
  { v: 'custom', label: 'Custom field' },
];
const ROLE_LABEL: Record<string, string> = { email: 'Email', company: 'Company', first_name: 'Name', full_name: 'Name', job_title: 'Role' };

const SAMPLE = `Email,Name,Company,Role
john@example.com,John Smith,Acme,Founder
priya@example.com,Priya Sharma,Bright Smiles,CEO`;

function fmtSecs(s: number): string {
  if (s < 90) return `~${Math.max(1, Math.round(s))} seconds`;
  const m = Math.round(s / 60);
  if (m < 90) return `~${m} minutes`;
  return `~${Math.floor(m / 60)}h ${m % 60}m`;
}

// Normalize the server payload so a partial/stale response degrades instead
// of throwing during render (which unmounts React → blank screen).
function normalizePreview(p: unknown): Preview | null {
  if (!p || typeof p !== 'object') return null;
  const o = p as Partial<Preview> & { sample?: unknown };
  if (!Array.isArray(o.headers)) return null;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  return {
    headers: o.headers.filter((h): h is string => typeof h === 'string'),
    roles: (o.roles ?? {}) as Record<string, Role>,
    fieldConfidence: (o.fieldConfidence ?? {}) as Preview['fieldConfidence'],
    emailCandidates: (o.emailCandidates ?? []).filter((h): h is string => typeof h === 'string'),
    needsChoice: o.needsChoice === true,
    emailHeader: typeof o.emailHeader === 'string' ? o.emailHeader : null,
    subjectHeader: typeof o.subjectHeader === 'string' ? o.subjectHeader : null,
    bodyHeader: typeof o.bodyHeader === 'string' ? o.bodyHeader : null,
    customFields: Array.isArray(o.customFields) ? o.customFields.filter((h): h is string => typeof h === 'string') : [],
    total: num(o.total), valid: num(o.valid),
    missingEmail: num(o.missingEmail), invalidEmail: num(o.invalidEmail),
    duplicates: num(o.duplicates), missingContent: num(o.missingContent),
    suppressed: num(o.suppressed), sendable: num(o.sendable),
    suggestedMode: o.suggestedMode === 'row' ? 'row' : 'template',
    rejectedSample: Array.isArray(o.rejectedSample) ? o.rejectedSample : [],
    previews: Array.isArray(o.previews) ? o.previews.map((x) => {
      const r = (x ?? {}) as Partial<Preview['previews'][number]>;
      return {
        to: typeof r.to === 'string' ? r.to : '',
        subject: typeof r.subject === 'string' ? r.subject : '',
        text: typeof r.text === 'string' ? r.text : '',
        missing: Array.isArray(r.missing) ? r.missing.filter((m): m is string => typeof m === 'string') : [],
      };
    }) : [],
    templateMissing: Array.isArray(o.templateMissing)
      ? o.templateMissing.filter((m): m is { variable: string; affected: number } =>
        !!m && typeof (m as { variable?: unknown }).variable === 'string')
      : [],
  };
}

export default function ImportWizard({ openCampaign }: { openCampaign: (id: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [roles, setRoles] = useState<Record<string, Role>>({});
  const [emailChoice, setEmailChoice] = useState('');
  const [mode, setMode] = useState<'row' | 'template'>('template');
  const [subject, setSubject] = useState('PragyaLabs/{{company}}');
  const [bodyText, setBodyText] = useState('Hi {{first_name}},\n\nI came across {{company}} and wanted to reach out.\n\nBest,\nAbhi');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState('');
  const [conn, setConn] = useState<ConnState>({ status: 'idle' });
  const [phase, setPhase] = useState<'idle' | 'importing' | 'validating' | 'starting' | 'launched'>('idle');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preflight, setPreflight] = useState<Preflight | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [pvIdx, setPvIdx] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api<{ accounts: Account[] }>('/api/accounts').then((r) => setAccounts(r.accounts)).catch(() => null);
  }, []);

  const runPreview = useCallback(async (f: File, overrides?: { roles?: Record<string, Role>; emailHeader?: string; mode?: 'row' | 'template'; subject?: string; bodyText?: string }) => {
    setBusy(true); setMsg('');
    try {
      const form = new FormData();
      form.append('file', f);
      const r = overrides?.roles;
      if (r) form.append('roles', JSON.stringify(r));
      if (overrides?.emailHeader) form.append('emailHeader', overrides.emailHeader);
      const m = overrides?.mode;
      if (m) form.append('mode', m);
      // In row mode the server defaults to per-row content; only send
      // templates when the user chose template mode.
      if ((m ?? 'template') === 'template') {
        form.append('subject', overrides?.subject ?? '');
        form.append('bodyText', overrides?.bodyText ?? '');
      }
      const out = await apiForm<{ preview: Preview }>('/api/campaigns/import-csv/preview', form);
      const clean = normalizePreview(out.preview);
      if (!clean) {
        setMsg('Server returned an unexpected response. Rebuild and restart the app: npm run build, then npm start.');
        return;
      }
      setPreview(clean);
      setRoles(clean.roles);
      if (!overrides?.emailHeader) setEmailChoice(clean.emailHeader ?? '');
      setPvIdx(0);
    } catch (e) { setMsg(`Could not analyze CSV: ${e instanceof Error ? e.message : String(e)}`); }
    setBusy(false);
  }, []);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (!/\.csv$/i.test(f.name)) { setMsg('Only .csv files are accepted — convert your spreadsheet to CSV first.'); return; }
    if (f.size > 5_000_000) { setMsg('File too large (max 5MB). Split it into smaller campaigns.'); return; }
    setFile(f);
    setResult(null); setPreflight(null); setPhase('idle');
    void runPreview(f, { mode: 'template', subject, bodyText });
  };

  // Live re-render as the user types templates (debounced, server-side).
  useEffect(() => {
    if (!file || !preview) return;
    if (mode !== 'template') return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      void runPreview(file, { roles, emailHeader: emailChoice || undefined, mode, subject, bodyText });
    }, 700);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, bodyText]);

  const chooseSender = async (id: string) => {
    setAccountId(id);
    if (!id) { setConn({ status: 'idle' }); return; }
    setConn({ status: 'checking' });
    try {
      await api<{ status: string }>(`/api/accounts/${id}/test-connection`, { method: 'POST' });
      setConn({ status: 'CONNECTED' });
    } catch (e) {
      const body = (e as { body?: { code?: string; error?: string; fix?: string } }).body;
      setConn({ status: 'FAILED', code: body?.code ?? 'UNKNOWN', fix: body?.fix ?? (e instanceof Error ? e.message : String(e)) });
    }
  };

  const validateCampaign = async (campaignId: string): Promise<Preflight> => {
    const v = await api<{ preflight: Preflight }>(`/api/campaigns/${campaignId}/validate`, { method: 'POST' });
    setPreflight(v.preflight);
    return v.preflight;
  };

  const excludeAndRevalidate = async (campaignId: string, variable: string) => {
    setBusy(true); setMsg('');
    try {
      await api(`/api/campaigns/${campaignId}/recipients/exclude-missing`, { method: 'POST', body: JSON.stringify({ variable }) });
      await validateCampaign(campaignId);
    } catch (e) { setMsg(`Could not exclude rows: ${e instanceof Error ? e.message : String(e)}`); }
    setBusy(false);
  };

  const startCampaign = async () => {
    if (!file || !accountId) return;
    setBusy(true); setMsg(''); setPreflight(null);
    try {
      setPhase('importing');
      const form = new FormData();
      form.append('file', file);
      form.append('name', file.name.replace(/\.csv$/i, ''));
      form.append('accountId', accountId);
      form.append('roles', JSON.stringify(roles));
      if (emailChoice) form.append('emailHeader', emailChoice);
      form.append('mode', mode);
      if (mode === 'template') { form.append('subject', subject); form.append('bodyText', bodyText); }
      const out = await apiForm<ImportResult>('/api/campaigns/import-csv', form);
      setResult(out);
      setPhase('validating');
      const pre = await validateCampaign(out.campaign.id);
      if (!pre.ok) { setPhase('idle'); return; } // reasons shown below, launch stays disabled
      setPhase('starting');
      await api(`/api/campaigns/${out.campaign.id}/start`, { method: 'POST' });
      setPhase('launched');
    } catch (e) { setMsg(`Could not start: ${e instanceof Error ? e.message : String(e)}`); setPhase('idle'); }
    setBusy(false);
  };

  const downloadRejected = () => {
    if (!result || result.rejected.length === 0) return;
    const headers = ['email', 'reason', ...(preview?.headers ?? Object.keys(result.rejected[0]?.row ?? {}))];
    downloadCsv(`rejected-rows.csv`, headers,
      result.rejected.map((r) => [r.email, r.reason, ...headers.slice(2).map((h) => r.row[h] ?? '')]));
  };

  const selAccount = accounts.find((a) => a.id === accountId);
  const sendable = preview?.sendable ?? 0;
  const estSecs = selAccount && sendable > 0 ? Math.max(0, (sendable - 1)) * (selAccount.delay_seconds ?? 0) : 0;
  const detected = preview ? Object.entries(preview.roles).filter(([, r]) => ['email', 'company', 'full_name', 'first_name', 'job_title'].includes(r)) : [];
  const canStart = file && preview && !preview.needsChoice && sendable > 0 && accountId && conn.status === 'CONNECTED' && subject.trim() && (mode === 'row' || bodyText.trim()) && !busy;

  return (
    <div>
      <h2>New Campaign</h2>
      <p style={{ color: '#9aa6b8' }}>Upload any reasonable CSV → enter subject and message → choose sender → START. The system detects columns, resolves personalization, and validates everything automatically.</p>
      {msg && <p className="err">{msg}</p>}

      <div className="panel">
        <h3>CSV</h3>
        {!file ? (
          <div ref={dropRef} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0]); }}
            style={{ border: '2px dashed #2a3342', borderRadius: 12, padding: 40, textAlign: 'center', color: '#9aa6b8' }}>
            <p style={{ fontSize: 19, color: '#e8edf3' }}>Drop your CSV here<br />or</p>
            <label className="btn" style={{ display: 'inline-block' }}>Choose CSV
              <input type="file" accept=".csv" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
            </label>
            <p>Any headers work — columns are detected automatically · max 5MB</p>
            <button className="btn ghost" onClick={() => pickFile(new File([SAMPLE], 'sample.csv', { type: 'text/csv' }))}>Try sample CSV</button>
          </div>
        ) : (
          <div>
            <p><b>{file.name}</b> · {preview ? <>{preview.total} contacts · <b>{preview.valid} valid</b> · {preview.duplicates} duplicates · {preview.invalidEmail + preview.missingEmail} invalid</> : 'analyzing…'}
              {' '}<button className="btn ghost" onClick={() => { setFile(null); setPreview(null); setResult(null); setPreflight(null); setPhase('idle'); }}>Replace</button></p>
            {preview && (
              <div>
                <p>Detected fields: {detected.length === 0 ? <span style={{ color: '#9aa6b8' }}>email only</span> : detected.map(([h, r]) => {
                  const c = preview.fieldConfidence[h];
                  return <span key={h} className="pill" title={`${c?.source === 'values' ? 'Detected from values' : 'Detected from header'} (confidence ${Math.round((c?.score ?? 0) * 100)}%)`}>
                    {ROLE_LABEL[r] ?? r} → {h} ✓</span>;
                })}</p>
                {preview.needsChoice && (
                  <div className="panel" style={{ borderColor: '#e5a13d' }}>
                    <p><b>We found {preview.emailCandidates.length} possible email columns — choose the right one:</b></p>
                    <select value={emailChoice} onChange={(e) => { setEmailChoice(e.target.value); if (file) void runPreview(file, { roles, emailHeader: e.target.value, mode, subject, bodyText }); }}>
                      <option value="">— choose —</option>
                      {preview.emailCandidates.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                {!preview.needsChoice && <p className="ok">Everything looks good ✓</p>}
                {preview.rejectedSample.length > 0 && (
                  <details><summary>{preview.rejectedSample.length}+ rejected rows (duplicates/invalid shown)</summary>
                    <table><thead><tr><th>Email</th><th>Reason</th></tr></thead>
                      <tbody>{preview.rejectedSample.slice(0, 10).map((r, i) => <tr key={i}><td>{r.email}</td><td>{r.reason}</td></tr>)}</tbody>
                    </table>
                  </details>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {preview && (
        <div className="panel">
          <h3>Subject</h3>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="PragyaLabs/{{company}}" />
          <h3 style={{ marginTop: 12 }}>Message</h3>
          <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} style={{ minHeight: 150 }}
            placeholder={'Hi {{first_name}},\n\nI came across {{company}} and wanted to reach out.'} />
          <p style={{ color: '#9aa6b8' }}>Use any column as a variable: {'{{first_name}} {{name}} {{company}} {{role}} {{website}} {{email}}'} — plus the exact CSV headers. Missing values fall back safely (e.g. full name → first name). For optional fields add an inline fallback: {'{{company|your company}}'}. Only truly unresolvable fields block sending.</p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
            <label style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <input type="radio" style={{ width: 'auto' }} checked={mode === 'template'} onChange={() => { setMode('template'); if (file) void runPreview(file, { roles, emailHeader: emailChoice || undefined, mode: 'template', subject, bodyText }); }} />
              Use my subject/message above
            </label>
            <label style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <input type="radio" style={{ width: 'auto' }} checked={mode === 'row'} disabled={!preview.subjectHeader || !preview.bodyHeader} onChange={() => { setMode('row'); if (file) void runPreview(file, { roles, emailHeader: emailChoice || undefined, mode: 'row' }); }} />
              Use per-row subject/message from CSV {(preview.subjectHeader && preview.bodyHeader) ? `(${preview.subjectHeader} / ${preview.bodyHeader})` : '(not in this CSV)'}
            </label>
          </div>
          {preview.templateMissing.length > 0 && mode === 'template' && (
            <p className="err">These fields can't be resolved: {preview.templateMissing.map((m) => `{{${m.variable}}} (${m.affected} rows)`).join('; ')}. Fix the text or pick a CSV with matching columns — launch stays disabled until resolved.</p>
          )}
          {preview.previews.length > 0 && (
            <div className="panel" style={{ background: '#10151d' }}>
              <p>Preview {pvIdx + 1} / {preview.previews.length}</p>
              {(() => { const p = preview.previews[pvIdx]; return p ? (
                <div>
                  <p><b>TO:</b> {p.to}</p>
                  <p><b>SUBJECT:</b> {p.subject || <span className="err">(unresolved — {p.missing.join(', ')})</span>}</p>
                  <pre className="log">{p.text.slice(0, 1200)}</pre>
                </div>) : null; })()}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn ghost" disabled={pvIdx === 0} onClick={() => setPvIdx(pvIdx - 1)}>← Previous</button>
                <button className="btn ghost" disabled={pvIdx >= preview.previews.length - 1} onClick={() => setPvIdx(pvIdx + 1)}>Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {preview && (
        <div className="panel">
          <h3>Sender</h3>
          <label>SMTP account
            <select value={accountId} onChange={(e) => chooseSender(e.target.value)}>
              <option value="">— select sender —</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.display_name} &lt;{a.email}&gt;</option>)}
            </select>
          </label>
          {conn.status === 'checking' && <p style={{ color: '#9aa6b8' }}>Verifying SMTP connection…</p>}
          {conn.status === 'CONNECTED' && selAccount && <p className="ok">SMTP CONNECTED ✓ · {selAccount.email} · Configured daily limit: {selAccount.daily_limit} · Delay: {selAccount.delay_seconds}s · Estimated completion: {fmtSecs(estSecs)}</p>}
          {conn.status === 'FAILED' && <p className="err">SMTP {conn.code}: could not verify. {conn.fix}</p>}
        </div>
      )}

      {preview && (
        <div className="panel">
          <h3>{sendable} emails ready to send</h3>
          {phase !== 'idle' && phase !== 'launched' && <p style={{ color: '#9aa6b8' }}>{phase === 'importing' ? 'Creating campaign…' : phase === 'validating' ? 'Running preflight…' : 'Starting…'}</p>}
          <button className="btn" style={{ fontSize: 17, padding: '12px 26px' }} disabled={!canStart} onClick={startCampaign}>START CAMPAIGN</button>
          {!canStart && !busy && (
            <p style={{ color: '#9aa6b8' }}>
              {!accountId ? 'Select a sender to enable.' : conn.status !== 'CONNECTED' ? 'Waiting for SMTP verification…' : preview.needsChoice ? 'Choose the email column above.' : sendable === 0 ? 'No valid recipients in this CSV.' : 'Resolve the flagged fields above.'}
            </p>
          )}
          {preflight && !preflight.ok && (
            <div>
              <p className="err"><b>Campaign cannot start:</b></p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {preflight.checks.filter((c) => c.blocking && !c.passed).map((c, i) => <li key={i} className="err">✗ <b>{c.name}</b> — {c.message}</li>)}
              </ul>
              {result && preflight.missingVariables.filter((m) => m.affected > 0).map((m) => (
                <div key={m.variable} style={{ margin: '6px 0' }}>
                  <button className="btn ghost" disabled={busy} onClick={() => excludeAndRevalidate(result.campaign.id, m.variable)}>
                    Exclude {m.affected} row{m.affected === 1 ? '' : 's'} lacking {'{{' + m.variable + '}}'} &amp; re-validate
                  </button>
                </div>
              ))}
              <p style={{ color: '#9aa6b8' }}>Or add an inline fallback ({'{{company|your company}}'}) / fix the CSV and click START again. Excluded rows never send.</p>
              {result && <button className="btn ghost" onClick={() => openCampaign(result.campaign.id)}>Open draft →</button>}
            </div>
          )}
          {phase === 'launched' && result && (
            <div>
              <p className="ok">Campaign started — worker is sending in the background. Progress stays live even if you refresh.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => openCampaign(result.campaign.id)}>Watch live progress →</button>
                {result.rejected.length > 0 && <button className="btn ghost" onClick={downloadRejected}>Download rejected rows ({result.rejected.length})</button>}
              </div>
            </div>
          )}
        </div>
      )}

      {preview && (
        <div className="panel">
          <button className="btn ghost" onClick={() => setShowAdvanced(!showAdvanced)}>{showAdvanced ? 'Hide' : 'Show'} Advanced (column mapping)</button>
          {showAdvanced && (
            <div>
              <p style={{ color: '#9aa6b8' }}>Only touch this if detection got something wrong — confidence is shown per field above.</p>
              <table><thead><tr><th>CSV column</th><th>Role</th></tr></thead>
                <tbody>{preview.headers.map((h) => (
                  <tr key={h}><td><code>{h}</code></td>
                    <td><select value={roles[h] ?? 'custom'} onChange={(e) => setRoles({ ...roles, [h]: e.target.value as Role })}>
                      {ROLE_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
                    </select></td></tr>
                ))}</tbody>
              </table>
              <button className="btn ghost" disabled={busy} onClick={() => file && runPreview(file, { roles, emailHeader: emailChoice || undefined, mode, subject, bodyText })}>Re-analyze with this mapping</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
