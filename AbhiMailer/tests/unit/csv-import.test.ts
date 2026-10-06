import { describe, it, expect } from 'vitest';
import {
  analyzeCampaignCsv, buildImportLead, csvCell, detectRoles, normalizeHeader,
  analyzeCsv, defaultMapping, mapRowToLead, detectEmailColumn,
  CSV_SUBJECT_KEY, CSV_BODY_KEY,
} from '../../src/leads/csv.js';
import { renderStrict, buildLeadContext, sanitizeSubject } from '../../src/email/template.js';
import { sanitizeEmailHtml } from '../../src/email/sanitize.js';

const ROW_CSV = `company_name,email,first_name,industry,website,email_subject,email_body
Acme Dental,owner@acme.com,John,Dental,https://acme.example.com,Quick idea for Acme Dental,"Hi John, thanks for your time"
,missing-name@example.com,NoCo,,,"No company subject","Body here"
bad-email,not-an-email,Bad,,,"S","B"
dup1@example.com,DUP1@example.com,Dup,,,"S2","B2"`;

describe('header aliases', () => {
  it.each([
    [['Email Address', 'Company'], 'emailHeader', 'Email Address'],
    [['recipient_email', 'business_name'], 'emailHeader', 'recipient_email'],
    [['Email', 'Company Name'], 'companyHeader', 'Company Name'],
    [['email', 'business'], 'companyHeader', 'business'],
    [['EMAIL_SUBJECT', 'EMAIL_BODY', 'email'], 'subjectHeader', 'EMAIL_SUBJECT'],
    [['Subject', 'Message', 'email'], 'bodyHeader', 'Message'],
    [['email', 'email_message'], 'bodyHeader', 'email_message'],
  ])('detects %j', (headers, field, expected) => {
    const d = detectRoles(headers as string[]);
    expect(d[field as keyof typeof d]).toBe(expected);
  });
  it('is case/space insensitive and keeps custom columns', () => {
    const d = detectRoles(['  COMPANY NAME  ', 'Custom-Field!', 'email']);
    expect(d.companyHeader).toBe('  COMPANY NAME  ');
    expect(d.roles['Custom-Field!']).toBe('custom');
    expect(d.customFields).toContain('custom_field');
  });
  it('normalizes headers', () => {
    expect(normalizeHeader('  Email Address ')).toBe('email_address');
    expect(normalizeHeader('Company-Name')).toBe('company_name');
  });
});

describe('row analysis', () => {
  it('reports valid/missing/invalid/duplicates (default dedupe)', () => {
    const a = analyzeCampaignCsv(`email\nok@example.com\n\nbad\nok@example.com\nOK@example.com\n`);
    expect(a.total).toBe(4);
    expect(a.valid).toBe(1);
    expect(a.invalidEmail).toBe(1);
    expect(a.duplicates).toBe(2); // case-insensitive
    expect(a.missingEmail).toBe(0);
  });
  it('missing email rows reported, not silently dropped', () => {
    const a = analyzeCampaignCsv(`email,name\n,NoMail\nok@example.com,Ok\n`);
    expect(a.missingEmail).toBe(1);
    expect(a.rows[0]).toMatchObject({ status: 'missing_email' });
  });
  it('row mode rejects empty per-row subject/body', () => {
    const a = analyzeCampaignCsv(ROW_CSV, { mode: 'row' });
    expect(a.suggestedMode).toBe('row');
    expect(a.valid).toBe(3); // company is optional; invalid + duplicate excluded
    expect(a.invalidEmail).toBe(1);
    expect(a.missingContent).toBe(0);
    const b = analyzeCampaignCsv(`email,email_subject,email_body\nok@example.com,,\n`, { mode: 'row' });
    expect(b.missingContent).toBe(1);
    expect(b.rows[0]?.reason).toMatch(/subject/i);
  });
  it('suggests template mode when no content columns', () => {
    const a = analyzeCampaignCsv(`email,first_name\nok@example.com,Ann\n`);
    expect(a.suggestedMode).toBe('template');
  });
  it('handles quoted commas, multiline bodies, UTF-8', () => {
    const csv = `email,email_subject,email_body\nprénom@example.com,"Hi, there","Line1\nLine2, with comma ✓"\n`;
    const a = analyzeCampaignCsv(csv, { mode: 'row' });
    expect(a.valid).toBe(1);
    expect(a.rows[0]?.values.email_body).toContain('Line2, with comma ✓');
  });
  it('empty CSV yields zero rows (no crash)', () => {
    const a = analyzeCampaignCsv(`email,first_name\n`);
    expect(a.total).toBe(0);
    expect(a.valid).toBe(0);
  });
  it('malformed CSV throws (never half-parsed silently)', () => {
    expect(() => analyzeCampaignCsv(`email\n"unclosed@example.com\n`)).toThrow();
  });
});

describe('lead building preserves everything', () => {
  it('keeps ALL columns in raw_data incl. aliases', () => {
    const roles = detectRoles(['company_name', 'email', 'first_name', 'industry', 'website', 'email_subject', 'email_body']).roles;
    const lead = buildImportLead({
      company_name: 'Acme', email: 'o@acme.com', first_name: 'John', industry: 'Dental',
      website: 'https://acme.example.com', email_subject: 'Quick idea for Acme', email_body: 'Hi John',
    }, roles);
    expect(lead?.company).toBe('Acme');
    expect(lead?.raw_data.company_name).toBe('Acme');
    expect(lead?.raw_data.industry).toBe('Dental');
    expect(lead?.raw_data[CSV_SUBJECT_KEY]).toBe('Quick idea for Acme');
    expect(lead?.raw_data[CSV_BODY_KEY]).toBe('Hi John');
    // Template can use any CSV column dynamically:
    const ctx = buildLeadContext({ ...lead, raw_data: lead?.raw_data });
    expect(renderStrict('Quick idea for {{company_name}} — {{industry}}', ctx)).toBe('Quick idea for Acme — Dental');
  });
  it('returns null for unmappable rows', () => {
    const roles = detectRoles(['email']).roles;
    expect(buildImportLead({ email: 'bad' }, roles)).toBeNull();
  });
});

describe('template + security', () => {
  it('per-row personalization renders', () => {
    const ctx = buildLeadContext({ email: 'o@a.com', first_name: 'John', raw_data: { company_name: 'Acme', [CSV_SUBJECT_KEY]: 'Quick idea for Acme' } });
    expect(sanitizeSubject(renderStrict('{{_csv_subject}}', ctx))).toBe('Quick idea for Acme');
  });
  it('subject newlines are stripped (header-injection guard)', () => {
    expect(sanitizeSubject('Hello\r\nBcc: evil@x.com')).toBe('Hello Bcc: evil@x.com');
  });
  it('CSV XSS cannot survive the HTML sanitizer', () => {
    const dirty = 'Hi <script>alert(1)</script><a href="javascript:alert(1)">x</a>';
    const clean = sanitizeEmailHtml(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('javascript:');
    expect(clean).toContain('Hi');
  });
  it('csvCell escapes for export', () => {
    expect(csvCell('a"b,c\nd')).toBe('"a""b,c\nd"');
    expect(csvCell('plain')).toBe('plain');
  });
});

describe('manual-path mapping regression: content columns must never steal the email role', () => {
  // One-row campaign CSV from the bug report. Before the fix, defaultMapping
  // classified `email_subject` as the email column (substring match), so the
  // real address was overwritten by the subject text and the row was dropped.
  const HEADERS = ['company_name', 'email', 'email_subject', 'message'];
  const VALUES = {
    company_name: 'Test Company',
    email: 'recipient@example.test',
    email_subject: 'Quick idea for Test Company',
    message: 'Hi, this is a test email.',
  };
  it('defaultMapping keeps the true email column', () => {
    const m = defaultMapping(HEADERS);
    expect(m.email).toBe('email');
    expect(m.email_subject).not.toBe('email');
    expect(m.message).not.toBe('email');
  });
  it('mapRowToLead preserves the real address (no subject overwrite)', () => {
    const lead = mapRowToLead(VALUES, defaultMapping(HEADERS));
    expect(lead.email).toBe('recipient@example.test');
    expect(lead.company).toBe('Test Company');
    // Per-row content stays available under its own column names.
    expect(lead.raw_data.email_subject).toBe('Quick idea for Test Company');
    expect(lead.raw_data.message).toBe('Hi, this is a test email.');
  });
  it('preview and import agree on the email column (single shared predicate)', () => {
    const emailCol = detectEmailColumn(HEADERS);
    const m = defaultMapping(HEADERS);
    expect(m[emailCol]).toBe('email');
    const analysis = analyzeCsv(
      `company_name,email,email_subject,message\nTest Company,recipient@example.test,Quick idea for Test Company,"Hi"`,
    );
    expect(analysis.emailColumn).toBe('email');
    expect(analysis.valid).toBe(1);
  });
  it('plausible email variants still map (no over-correction)', () => {
    expect(defaultMapping(['contact_email']).contact_email).toBe('email');
    expect(defaultMapping(['Email Address'])['Email Address']).toBe('email');
    expect(defaultMapping(['recipient']).recipient).toBe('email');
  });
});
