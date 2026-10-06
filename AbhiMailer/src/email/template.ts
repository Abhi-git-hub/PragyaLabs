// Production template engine. SAME engine is used for preview, preflight and sending.
//
// Variable names are tolerant: case/whitespace/underscore/dash/punctuation
// insensitive (`Company Name`, `company_name`, `COMPANY NAME` all resolve to
// the same field), and semantic synonyms resolve (`{{first_name}}` works when
// the CSV only has `Full Name`). Strictness is preserved: genuinely unknown
// variables still throw instead of silently rendering ''.
const VAR_RE = /\{\{\s*([^{}]+?)\s*\}\}/g;

export type TemplateContext = Record<string, unknown>;

export class MissingVariableError extends Error {
  readonly variable: string;
  constructor(variable: string) {
    super(`Missing variable: {{${variable}}}`);
    this.name = 'MissingVariableError';
    this.variable = variable;
  }
}

// Canonical normalization for variable names. Must agree with the raw_data
// keys produced by normalizeHeader() in leads/csv.ts (identical pipeline,
// plus dots preserved for nested paths).
export function normalizeVarName(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, '_')
    .replace(/[^a-z0-9_.]/g, '')
    .replace(/_+/g, '_');
}

// Semantic synonym groups, in lookup priority order. A requested variable
// resolves to the first non-missing member of its group.
const SYNONYM_GROUPS: string[][] = [
  ['first_name', 'firstname', 'fname', 'given_name', 'preferred_name', 'first',
   'full_name', 'fullname', 'name', 'contact_name', 'contact', 'person'],
  ['full_name', 'fullname', 'name', 'contact_name', 'contact', 'person',
   'first_name', 'firstname', 'last_name', 'lastname'],
  ['last_name', 'lastname', 'lname', 'surname', 'family_name', 'familyname', 'last'],
  ['company', 'company_name', 'business', 'business_name', 'organization',
   'organisation', 'firm', 'startup', 'employer', 'account', 'brand', 'company_legal_name'],
  ['job_title', 'jobtitle', 'title', 'designation', 'position', 'role',
   'job_role', 'occupation', 'function', 'department'],
  ['website', 'site', 'domain', 'url', 'company_website', 'webpage', 'link'],
  ['email', 'email_address', 'work_email', 'contact_email', 'business_email'],
  ['industry'],
];

function groupFor(normalized: string): string[] | null {
  for (const g of SYNONYM_GROUPS) {
    if (g.includes(normalized)) return g;
  }
  return null;
}

// Inline fallback: {{company|your company}} renders the fallback when the
// row has no value. Operator-authored, deterministic, never silent-empty.
// Only genuinely unresolvable variables WITHOUT fallbacks block a campaign.
export interface ParsedVariable {
  name: string;
  fallback: string | null;
  raw: string;
}

export function parseVariable(inner: string): ParsedVariable {
  const raw = inner ?? '';
  const pipe = raw.indexOf('|');
  if (pipe < 0) return { name: normalizeVarName(raw), fallback: null, raw };
  return { name: normalizeVarName(raw.slice(0, pipe)), fallback: raw.slice(pipe + 1).trim(), raw };
}

function lookupExact(ctx: TemplateContext, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = ctx;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function isMissing(v: unknown): boolean {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

// Resolve a raw {{...}} inner to a concrete value (or undefined).
// Falls back to the inline `|fallback` when the variable is unresolvable.
export function resolveVariable(ctx: TemplateContext, raw: string): unknown {
  const parsed = parseVariable(raw);
  if (!parsed.name && parsed.fallback == null) return undefined;
  if (!parsed.name) return parsed.fallback;
  const direct = lookupExact(ctx, parsed.name);
  if (!isMissing(direct)) return direct;
  // Dotted paths only resolve exactly (no synonym expansion inside nesting).
  if (parsed.name.includes('.')) return parsed.fallback ?? undefined;
  const group = groupFor(parsed.name);
  if (group) {
    for (const key of group) {
      if (key === parsed.name) continue;
      const v = lookupExact(ctx, key);
      if (!isMissing(v)) return v;
    }
  }
  return parsed.fallback ?? undefined;
}

export function extractVariables(template: string): string[] {
  const found = new Set<string>();
  VAR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = VAR_RE.exec(template)) !== null) {
    const name = parseVariable(m[1] ?? '').name;
    if (name) found.add(name);
  }
  return [...found].sort();
}

// Strict render: throws MissingVariableError instead of silently inserting ''.
// Variables with an inline `|fallback` resolve to the fallback instead.
export function renderStrict(template: string, ctx: TemplateContext): string {
  return template.replace(VAR_RE, (whole, raw: string) => {
    const v = resolveVariable(ctx, raw ?? '');
    if (isMissing(v)) throw new MissingVariableError(parseVariable(raw ?? '').name || whole);
    return String(v);
  });
}

// Subject guard: collapse CR/LF runs so CSV/template content can never inject
// extra mail headers. Applied to every rendered subject before queue/send.
export function sanitizeSubject(s: string): string {
  return s.replace(/[\r\n]+/g, ' ').trim();
}

// Lenient render used only to compute per-variable missing stats (never for send).
// Resolves raw inners (fallback-aware): {{company|there}} is NOT missing.
export function findMissing(template: string, ctx: TemplateContext): string[] {
  const missing = new Set<string>();
  VAR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = VAR_RE.exec(template)) !== null) {
    const raw = m[1] ?? '';
    const name = parseVariable(raw).name;
    if (!name) continue;
    if (isMissing(resolveVariable(ctx, raw))) missing.add(name);
  }
  return [...missing].sort();
}

// Split "John Smith" → "John" (safe first-name fallback from a full name).
export function firstToken(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const t = value.trim().split(/\s+/)[0] ?? '';
  return t ? t : undefined;
}

function pick(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    const v = obj[k];
    if (!isMissing(v)) return v;
  }
  return undefined;
}

const PERSON_FULL_KEYS = ['full_name', 'fullname', 'name', 'contact_name', 'contact', 'person'];
const PERSON_FIRST_KEYS = ['first_name', 'firstname', 'fname', 'given_name', 'preferred_name', 'first'];
const ORG_KEYS = ['company', 'company_name', 'business', 'business_name', 'organization',
  'organisation', 'firm', 'startup', 'employer', 'account', 'brand'];
const ROLE_KEYS = ['job_title', 'jobtitle', 'title', 'designation', 'position', 'role',
  'job_role', 'occupation', 'function', 'department'];
const WEB_KEYS = ['website', 'site', 'domain', 'url', 'company_website', 'webpage', 'link'];

export function buildLeadContext(lead: {
  email?: unknown; first_name?: unknown; last_name?: unknown;
  company?: unknown; website?: unknown; industry?: unknown;
  raw_data?: unknown;
}): TemplateContext {
  const raw = (lead.raw_data && typeof lead.raw_data === 'object'
    ? (lead.raw_data as Record<string, unknown>)
    : {});
  const base: Record<string, unknown> = {
    email: lead.email ?? '',
    first_name: lead.first_name ?? '',
    last_name: lead.last_name ?? '',
    company: lead.company ?? '',
    website: lead.website ?? '',
    industry: lead.industry ?? '',
    ...raw,
  };

  // Semantic derivations (safe fallbacks — never invent data, only reshape it):
  // "John Smith" in Full Name → first_name "John", name/full_name "John Smith".
  const fullVal = pick(base, PERSON_FULL_KEYS)
    ?? ([pick(base, PERSON_FIRST_KEYS), pick(base, ['last_name', 'lastname'])]
      .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
      .join(' ') || undefined);
  if (fullVal !== undefined) {
    if (isMissing(base.first_name)) {
      const ft = firstToken(fullVal);
      if (ft) base.first_name = ft;
    }
    for (const k of ['full_name', 'fullname', 'name']) {
      if (isMissing(base[k])) base[k] = fullVal;
    }
    for (const k of PERSON_FIRST_KEYS) {
      if (isMissing(base[k]) && !isMissing(base.first_name)) base[k] = base.first_name;
    }
  }
  // Organization mirrors: any org-like value answers every org-like variable.
  const orgVal = pick(base, ORG_KEYS);
  if (orgVal !== undefined) {
    for (const k of ORG_KEYS) if (isMissing(base[k])) base[k] = orgVal;
  }
  // Role mirrors.
  const roleVal = pick(base, ROLE_KEYS);
  if (roleVal !== undefined) {
    for (const k of ROLE_KEYS) if (isMissing(base[k])) base[k] = roleVal;
  }
  // Website mirrors.
  const webVal = pick(base, WEB_KEYS);
  if (webVal !== undefined) {
    for (const k of WEB_KEYS) if (isMissing(base[k])) base[k] = webVal;
  }
  // Email mirrors.
  if (!isMissing(base.email)) {
    for (const k of ['email_address', 'work_email', 'contact_email', 'business_email']) {
      if (isMissing(base[k])) base[k] = base.email;
    }
  }
  return base;
}
