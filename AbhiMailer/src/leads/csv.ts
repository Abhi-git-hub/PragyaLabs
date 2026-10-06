import { parse } from 'csv-parse/sync';
import { isValidEmail, normalizeEmail } from '../email/validation.js';
import { firstToken } from '../email/template.js';

export interface CsvPreviewRow {
  index: number;
  values: Record<string, string>;
  email: string;
  emailValid: boolean;
  duplicate: boolean;
  errors: string[];
}

export interface CsvAnalysis {
  headers: string[];
  total: number;
  rows: CsvPreviewRow[];
  valid: number;
  invalid: number;
  duplicates: number;
  emailColumn: string;
}

// Parse CSV text deterministically. Never silently modifies values (no trimming
// of inner content; only header/outer handling). Returns raw string values.
export function parseCsv(text: string): { headers: string[]; records: Record<string, string>[] } {
  const cleaned = text.replace(/^\uFEFF/, '');
  const records = parse(cleaned, {
    columns: true,
    skip_empty_lines: true,
    trim: false,
    relax_column_count: true,
  }) as Record<string, unknown>[];
  if (records.length === 0) {
    // Still extract headers from first line for empty files.
    const first = cleaned.split(/\r?\n/)[0] ?? '';
    const headers = first.split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    return { headers: headers.filter(Boolean), records: [] };
  }
  const headers = Object.keys(records[0] ?? {});
  const rows = records.map((r) => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(r)) out[k] = v == null ? '' : String(v);
    return out;
  });
  return { headers, records: rows };
}

const EMAIL_HEADER_HINTS = ['email', 'e-mail', 'mail', 'email_address', 'emailaddress'];

// Single shared email-column predicate used by BOTH preview (detectEmailColumn)
// and import (defaultMapping). It must stay exact: substring matching once
// misclassified content columns like `email_subject` as the address column,
// silently dropping every row at import while preview reported them valid.
const EMAIL_ALIASES = new Set([
  'email', 'e_mail', 'mail', 'email_address', 'emailaddress',
  'recipient', 'recipient_email',
]);

export function isEmailHeader(normalized: string): boolean {
  if (EMAIL_ALIASES.has(normalized)) return true;
  // Suffix form (contact_email, work_email, …). Content columns end in
  // _subject/_body/_message, never _email, so this cannot steal them.
  return normalized.endsWith('_email');
}

// Heuristic: pick the header most likely to be the email column.
export function detectEmailColumn(headers: string[]): string {
  const lower = headers.map((h) => h.trim().toLowerCase());
  for (const hint of EMAIL_HEADER_HINTS) {
    const i = lower.indexOf(hint);
    if (i >= 0) return headers[i] as string;
  }
  for (let i = 0; i < headers.length; i++) {
    if (isEmailHeader(normalizeHeader(headers[i] as string))) return headers[i] as string;
  }
  return headers[0] ?? 'email';
}

export function analyzeCsv(
  text: string,
  opts?: { emailColumn?: string; existingEmails?: Set<string> },
): CsvAnalysis {
  const { headers, records } = parseCsv(text);
  const emailColumn = opts?.emailColumn ?? detectEmailColumn(headers);
  const seen = new Set<string>();
  const existing = opts?.existingEmails ?? new Set<string>();
  const rows: CsvPreviewRow[] = records.map((values, i) => {
    const rawEmail = (values[emailColumn] ?? '').trim();
    const emailValid = isValidEmail(rawEmail);
    const norm = normalizeEmail(rawEmail);
    const errors: string[] = [];
    if (!rawEmail) errors.push('missing email');
    else if (!emailValid) errors.push('invalid email');
    let duplicate = false;
    if (emailValid) {
      if (seen.has(norm) || existing.has(norm)) {
        duplicate = true;
        errors.push('duplicate email');
      } else {
        seen.add(norm);
      }
    }
    return { index: i, values, email: rawEmail, emailValid: emailValid && !duplicate, duplicate, errors };
  });
  return {
    headers,
    total: rows.length,
    rows,
    valid: rows.filter((r) => r.emailValid).length,
    invalid: rows.filter((r) => !r.emailValid && !r.duplicate).length,
    duplicates: rows.filter((r) => r.duplicate).length,
    emailColumn,
  };
}

// Map arbitrary CSV columns onto lead fields. Unknown columns -> raw_data.
// Alias originals are ALSO preserved in raw_data (e.g. header `company_name`
// maps to canonical `company` but raw keeps `company_name`), so templates may
// use either {{company}} or {{company_name}}.
const KNOWN = new Set(['email', 'first_name', 'firstname', 'last_name', 'lastname', 'company', 'website', 'industry']);

export function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s\-]+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_');
}

export function mapRowToLead(
  values: Record<string, string>,
  mapping: Record<string, string>,
): { email: string; first_name?: string; last_name?: string; company?: string; website?: string; industry?: string; raw_data: Record<string, string> } {
  const inv: Record<string, string> = {};
  for (const [csvCol, leadField] of Object.entries(mapping)) inv[leadField] = values[csvCol] ?? '';
  const raw: Record<string, string> = {};
  for (const [k, v] of Object.entries(values)) {
    const m = mapping[k];
    if (!m || !KNOWN.has(m)) raw[m ?? k] = v;
    else {
      // Preserve the original column name as a template alias ({{company_name}}).
      const normOrig = normalizeHeader(k);
      if (normOrig && normOrig !== m) raw[normOrig] = v;
    }
  }
  return {
    email: (inv.email ?? '').trim(),
    first_name: inv.first_name || undefined,
    last_name: inv.last_name || undefined,
    company: inv.company || undefined,
    website: inv.website || undefined,
    industry: inv.industry || undefined,
    raw_data: raw,
  };
}

export function defaultMapping(headers: string[]): Record<string, string> {
  const m: Record<string, string> = {};
  for (const h of headers) {
    const l = normalizeHeader(h);
    if (isEmailHeader(l)) m[h] = 'email';
    else if (['first_name', 'firstname', 'fname', 'first'].includes(l)) m[h] = 'first_name';
    else if (['last_name', 'lastname', 'lname', 'last'].includes(l)) m[h] = 'last_name';
    else if (['company', 'company_name', 'organisation', 'organization', 'business', 'business_name'].includes(l)) m[h] = 'company';
    else if (['website', 'site', 'url'].includes(l)) m[h] = 'website';
    else if (l === 'industry') m[h] = 'industry';
    else m[h] = l;
  }
  return m;
}

// ---------- One-click campaign import: column roles ----------
// Roles extend the lead-field mapping with per-row content columns
// (subject/body). Reserved raw_data keys for per-row content.
export const CSV_SUBJECT_KEY = '_csv_subject';
export const CSV_BODY_KEY = '_csv_body';

export type ColumnRole =
  | 'email' | 'company' | 'first_name' | 'last_name' | 'full_name' | 'job_title'
  | 'website' | 'industry' | 'subject' | 'body' | 'custom';

const ROLE_ALIAS: Record<Exclude<ColumnRole, 'custom'>, string[]> = {
  email: ['email', 'e_mail', 'mail', 'email_address', 'emailaddress', 'recipient',
    'recipient_email', 'contact_email', 'work_email', 'business_email', 'contact'],
  company: ['company', 'company_name', 'business', 'business_name', 'organisation',
    'organization', 'firm', 'startup', 'enterprise'],
  first_name: ['first_name', 'firstname', 'fname', 'first', 'given_name', 'forename', 'christian_name'],
  full_name: ['full_name', 'fullname', 'name', 'contact_name', 'person', 'full',
    'first_last_name', 'first_and_last_name', 'display_name', 'candidate', 'lead_name'],
  last_name: ['last_name', 'lastname', 'lname', 'last', 'surname', 'family_name', 'familyname'],
  job_title: ['job_title', 'jobtitle', 'title', 'job_role', 'role', 'position',
    'designation', 'occupation', 'function'],
  website: ['website', 'site', 'url', 'domain', 'company_website', 'webpage', 'link'],
  industry: ['industry', 'sector', 'vertical', 'market'],
  subject: ['subject', 'email_subject'],
  body: ['body', 'email_body', 'message', 'email_message'],
};

export interface RoleDetection {
  /** header -> role */
  roles: Record<string, ColumnRole>;
  emailHeader: string | null;
  companyHeader: string | null;
  subjectHeader: string | null;
  bodyHeader: string | null;
  /** normalized custom field names (every non-role column is preserved) */
  customFields: string[];
}

// Intelligently map headers to roles using alias lists (case/space-insensitive).
// Exact column names are NOT required. First header wins on conflicts.
export function detectRoles(headers: string[]): RoleDetection {
  const roles: Record<string, ColumnRole> = {};
  const claimed = new Set<string>();
  const norm = headers.map(normalizeHeader);
  const findFirst = (aliases: string[]): number => {
    for (let i = 0; i < headers.length; i++) {
      if (claimed.has(headers[i] as string)) continue;
      if (aliases.includes(norm[i] as string)) return i;
    }
    return -1;
  };
  // Priority: email first, then content, then lead fields.
  const order: (keyof typeof ROLE_ALIAS)[] = ['email', 'subject', 'body', 'company', 'first_name', 'full_name', 'last_name', 'job_title', 'website', 'industry'];
  const picked: Record<string, string | null> = {};
  for (const role of order) {
    const i = findFirst(ROLE_ALIAS[role]);
    if (i >= 0) {
      roles[headers[i] as string] = role;
      claimed.add(headers[i] as string);
      picked[role] = headers[i] as string;
    } else {
      picked[role] = null;
    }
  }
  const customFields: string[] = [];
  for (const h of headers) {
    if (!roles[h]) {
      roles[h] = 'custom';
      const n = normalizeHeader(h) || h;
      if (!customFields.includes(n)) customFields.push(n);
    }
  }
  return {
    roles,
    emailHeader: picked.email ?? null,
    companyHeader: picked.company ?? null,
    subjectHeader: picked.subject ?? null,
    bodyHeader: picked.body ?? null,
    customFields,
  };
}

export type ImportRowStatus = 'valid' | 'missing_email' | 'invalid_email' | 'duplicate' | 'missing_content';

export interface ImportRow {
  index: number;
  values: Record<string, string>;
  email: string;
  status: ImportRowStatus;
  reason: string | null;
}

export interface CampaignImportAnalysis {
  headers: string[];
  detection: RoleDetection;
  total: number;
  valid: number;
  missingEmail: number;
  invalidEmail: number;
  duplicates: number;
  missingContent: number;
  /** 'row' = CSV carries subject+body (Mode A), 'template' = user supplies them (Mode B) */
  suggestedMode: 'row' | 'template';
  rows: ImportRow[];
}

// Full row-by-row analysis for campaign import. In 'row' mode, rows with empty
// per-row subject/body are rejected (missing_content) — never silently queued.
export function analyzeCampaignCsv(
  text: string,
  opts?: { emailHeader?: string; subjectHeader?: string | null; bodyHeader?: string | null; mode?: 'row' | 'template'; existingEmails?: Set<string> },
): CampaignImportAnalysis {
  const { headers, records } = parseCsv(text);
  const detection = detectRoles(headers);
  // Default email column via full discovery (header aliases + value-shape),
  // so unusual headers holding emails still validate correctly.
  const discovered = opts?.emailHeader ? null : discoverFields(headers, records);
  const emailHeader = opts?.emailHeader ?? discovered?.emailHeader ?? detection.emailHeader ?? detectEmailColumn(headers);
  const subjectHeader = opts?.subjectHeader !== undefined ? opts.subjectHeader : detection.subjectHeader;
  const bodyHeader = opts?.bodyHeader !== undefined ? opts.bodyHeader : detection.bodyHeader;
  const mode = opts?.mode ?? (subjectHeader && bodyHeader ? 'row' : 'template');
  const seen = new Set<string>();
  const existing = opts?.existingEmails ?? new Set<string>();
  const rows: ImportRow[] = records.map((values, i) => {
    const rawEmail = (values[emailHeader] ?? '').trim();
    if (!rawEmail) return { index: i, values, email: '', status: 'missing_email', reason: 'Missing email' } as ImportRow;
    if (!isValidEmail(rawEmail)) return { index: i, values, email: rawEmail, status: 'invalid_email', reason: 'Invalid email address' } as ImportRow;
    const norm = normalizeEmail(rawEmail);
    if (seen.has(norm) || existing.has(norm)) {
      return { index: i, values, email: rawEmail, status: 'duplicate', reason: 'Duplicate email address' } as ImportRow;
    }
    seen.add(norm);
    if (mode === 'row') {
      const subj = subjectHeader ? (values[subjectHeader] ?? '').trim() : '';
      const body = bodyHeader ? (values[bodyHeader] ?? '').trim() : '';
      if (!subj || !body) {
        return { index: i, values, email: rawEmail, status: 'missing_content', reason: !subj && !body ? 'Missing subject and body' : !subj ? 'Missing subject' : 'Missing body' } as ImportRow;
      }
    }
    return { index: i, values, email: rawEmail, status: 'valid', reason: null } as ImportRow;
  });
  const count = (s: ImportRowStatus) => rows.filter((r) => r.status === s).length;
  return {
    headers, detection, total: rows.length,
    valid: count('valid'), missingEmail: count('missing_email'),
    invalidEmail: count('invalid_email'), duplicates: count('duplicate'),
    missingContent: count('missing_content'),
    suggestedMode: mode, rows,
  };
}

// ---------- Value-shape analysis (deterministic, local, no LLM) ----------
// Recognizes columns by the shape of their values so unusual headers like
// "Reach Out" or "Primary Contact" still resolve when they hold emails.

const MAX_SAMPLE_VALUES = 50;

function sampleValues(records: Record<string, string>[], header: string): string[] {
  const out: string[] = [];
  for (const r of records) {
    const v = (r[header] ?? '').trim();
    if (v) out.push(v);
    if (out.length >= MAX_SAMPLE_VALUES) break;
  }
  return out;
}

export function emailShapeRatio(values: string[]): number {
  if (values.length === 0) return 0;
  let n = 0;
  for (const v of values) if (isValidEmail(v)) n++;
  return n / values.length;
}

export function personNameRatio(values: string[]): number {
  if (values.length === 0) return 0;
  // "John Smith" / "Rahul Sharma": 2-4 capitalized words, no digits, short.
  const re = /^[A-ZÀ-Þ][a-zà-þ'.\-]*(?: +[A-ZÀ-Þ][a-zà-þ'.\-]*){1,3}$/;
  let n = 0;
  for (const v of values) {
    if (v.length <= 40 && !/\d/.test(v) && re.test(v)) n++;
  }
  return n / values.length;
}

// Single-word token vocabulary for partial header matches
// ("Company Legal Name" → company). Exact alias matches always win;
// bare `contact`/`mail` are NOT token triggers (too ambiguous alone).
const TOKEN_VOCAB: { role: ColumnRole; tokens: string[] }[] = [
  { role: 'email', tokens: ['email'] },
  { role: 'company', tokens: ['company', 'business', 'firm', 'startup', 'enterprise'] },
  { role: 'full_name', tokens: ['name', 'contact', 'person'] },
  { role: 'job_title', tokens: ['title', 'role', 'position', 'designation', 'job'] },
  { role: 'website', tokens: ['website', 'site', 'domain', 'url'] },
];

function tokenRole(normalized: string): ColumnRole | null {
  const parts = normalized.split('_').filter(Boolean);
  let best: { role: ColumnRole; idx: number } | null = null;
  for (const { role, tokens } of TOKEN_VOCAB) {
    for (const t of tokens) {
      const idx = parts.indexOf(t);
      if (idx >= 0 && (!best || idx < best.idx)) best = { role, idx };
    }
  }
  return best?.role ?? null;
}

export interface FieldConfidence {
  role: ColumnRole;
  /** 0..1 — header exact matches score high, value-shape lower. */
  score: number;
  source: 'header' | 'values';
}

export interface Discovery {
  roles: Record<string, ColumnRole>;
  confidence: Record<string, FieldConfidence>;
  /** columns whose values look like emails (strongest first) */
  emailCandidates: string[];
  /** true when the email column is genuinely ambiguous — UI must ask. */
  needsChoice: boolean;
  emailHeader: string | null;
  companyHeader: string | null;
  subjectHeader: string | null;
  bodyHeader: string | null;
  customFields: string[];
}

// Deterministic discovery: normalized header matching first, then value-shape
// analysis, then confidence scoring. Email-shaped values win over header names.
export function discoverFields(headers: string[], records: Record<string, string>[] = []): Discovery {
  const detected = detectRoles(headers);
  const roles: Record<string, ColumnRole> = { ...detected.roles };
  const confidence: Record<string, FieldConfidence> = {};
  for (const h of headers) {
    confidence[h] = { role: roles[h] as ColumnRole, score: roles[h] === 'custom' ? 0 : 0.9, source: 'header' };
  }

  // Value-shape pass for the email column (strongest signal available).
  const emailScores: { header: string; ratio: number }[] = [];
  for (const h of headers) {
    const ratio = emailShapeRatio(sampleValues(records, h));
    if (ratio >= 0.5) emailScores.push({ header: h, ratio });
  }
  emailScores.sort((a, b) => b.ratio - a.ratio);
  const emailCandidates = emailScores.map((e) => e.header);

  let emailHeader = detected.emailHeader;
  let needsChoice = false;
  if (emailCandidates.length >= 2) {
    // Genuinely ambiguous — default to the strongest, but force the question.
    needsChoice = true;
    emailHeader = emailCandidates[0] as string;
  } else if (emailCandidates.length === 1) {
    emailHeader = emailCandidates[0] as string;
  }
  if (emailHeader) {
    // Value-shape verdict overrides header guessing for the email role.
    for (const h of headers) {
      if (roles[h] === 'email' && h !== emailHeader) {
        roles[h] = 'custom';
        confidence[h] = { role: 'custom', score: 0.4, source: 'values' };
      }
    }
    roles[emailHeader] = 'email';
    const fromValues = emailCandidates.includes(emailHeader);
    confidence[emailHeader] = {
      role: 'email',
      score: fromValues ? Math.max(0.85, emailScores.find((e) => e.header === emailHeader)?.ratio ?? 0.85) : 0.9,
      source: fromValues ? 'values' : 'header',
    };
  }

  // Token-overlap pass for headers with no exact alias ("Company Legal Name"
  // → company). An email token verdict is vetoed when the values are clearly
  // not emails — values win over header guesses.
  for (const h of headers) {
    if (roles[h] !== 'custom' || h === emailHeader) continue;
    const t = tokenRole(normalizeHeader(h));
    if (!t) continue;
    if (t === 'email' && emailShapeRatio(sampleValues(records, h)) < 0.5) continue;
    roles[h] = t;
    confidence[h] = { role: t, score: 0.55, source: 'header' };
  }

  // Value-shape fallback for an unmatched name column (conservative).
  if (!Object.values(roles).includes('first_name') && !Object.values(roles).includes('full_name')) {
    let best: { header: string; ratio: number } | null = null;
    for (const h of headers) {
      if (roles[h] !== 'custom' || h === emailHeader) continue;
      const ratio = personNameRatio(sampleValues(records, h));
      if (ratio >= 0.6 && (!best || ratio > best.ratio)) best = { header: h, ratio };
    }
    if (best) {
      roles[best.header] = 'full_name';
      confidence[best.header] = { role: 'full_name', score: 0.55, source: 'values' };
    }
  }

  const pick = (role: ColumnRole): string | null =>
    Object.entries(roles).find(([, r]) => r === role)?.[0] ?? null;
  return {
    roles, confidence, emailCandidates, needsChoice,
    emailHeader,
    companyHeader: pick('company'),
    subjectHeader: pick('subject'),
    bodyHeader: pick('body'),
    customFields: detected.customFields,
  };
}
// Build the lead payload for one import row: canonical fields + EVERY column
// preserved in raw_data (normalized names), plus reserved per-row content keys
// in 'row' mode. Returns null when the row cannot produce a lead (no email).
export function buildImportLead(
  values: Record<string, string>,
  roles: Record<string, ColumnRole>,
): { email: string; first_name?: string; last_name?: string; company?: string; website?: string; industry?: string; raw_data: Record<string, string> } | null {
  let email = '', first_name = '', last_name = '', company = '', website = '', industry = '';
  let full_name = '', job_title = '', subject = '', body = '';
  const raw: Record<string, string> = {};
  for (const [header, v] of Object.entries(values)) {
    const role = roles[header] ?? 'custom';
    const normKey = normalizeHeader(header) || header;
    raw[normKey] = v; // preserve ALL columns
    switch (role) {
      case 'email': email = v.trim(); break;
      case 'company': company = v; if (raw.company_name === undefined && normKey !== 'company') raw.company_name = v; break;
      case 'first_name': first_name = v; break;
      case 'full_name': full_name = v; break;
      case 'last_name': last_name = v; break;
      case 'job_title': job_title = v; break;
      case 'website': website = v; break;
      case 'industry': industry = v; break;
      case 'subject': subject = v; break;
      case 'body': body = v; break;
      default: break;
    }
  }
  if (!email || !isValidEmail(email)) return null;
  // Safe fallbacks, baked at import: "John Smith" in Full Name → first_name.
  if (!first_name.trim() && full_name.trim()) {
    const t = firstToken(full_name);
    if (t) first_name = t;
  }
  if (full_name.trim()) {
    if (raw.full_name === undefined) raw.full_name = full_name;
    if (raw.name === undefined) raw.name = full_name;
  }
  if (job_title.trim()) {
    if (raw.job_title === undefined) raw.job_title = job_title;
    if (raw.role === undefined) raw.role = job_title;
    if (raw.title === undefined) raw.title = job_title;
  }
  // Canonical aliases also available under their own names.
  if (company && raw.company_name === undefined) raw.company_name = company;
  if (subject) raw[CSV_SUBJECT_KEY] = subject;
  if (body) raw[CSV_BODY_KEY] = body;
  return {
    email,
    first_name: first_name || undefined,
    last_name: last_name || undefined,
    company: company || undefined,
    website: website || undefined,
    industry: industry || undefined,
    raw_data: raw,
  };
}

// CSV-escape a single cell for export files.
export function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
