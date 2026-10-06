import { describe, it, expect } from 'vitest';
import { extractVariables, renderStrict, findMissing, buildLeadContext, MissingVariableError } from '../../src/email/template.js';
import { isValidEmail, normalizeEmail } from '../../src/email/validation.js';
import { analyzeCsv, defaultMapping, mapRowToLead, detectEmailColumn } from '../../src/leads/csv.js';
import { sanitizeEmailHtml, htmlToText } from '../../src/email/sanitize.js';
import { classifyFailure, backoffMs } from '../../src/email/retry.js';

describe('template engine', () => {
  it('extracts variables', () => {
    expect(extractVariables('Hi {{first_name}} from {{company}}')).toEqual(['company', 'first_name']);
  });
  it('renders strictly with same engine for preview/send', () => {
    const ctx = buildLeadContext({ first_name: 'Rahul', company: 'Example Pvt Ltd', email: 'r@example.com' } as never);
    expect(renderStrict('Hi {{first_name}} of {{company}}', ctx)).toBe('Hi Rahul of Example Pvt Ltd');
  });
  it('throws on missing variable (never silent empty)', () => {
    const ctx = buildLeadContext({ first_name: 'Rahul' } as never);
    expect(() => renderStrict('Hi {{company}}', ctx)).toThrow(MissingVariableError);
  });
  it('finds missing variables for preflight', () => {
    const ctx = buildLeadContext({ first_name: 'R' } as never);
    expect(findMissing('{{first_name}} {{company}}', ctx)).toContain('company');
  });
  it('exposes raw_data columns as variables', () => {
    const ctx = buildLeadContext({ email: 'a@b.c', raw_data: { industry: 'Salon' } } as never);
    expect(renderStrict('{{industry}}', ctx)).toBe('Salon');
  });
});

describe('email validation', () => {
  it('accepts valid, rejects invalid', () => {
    expect(isValidEmail('rahul@example.com')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
  it('normalizes', () => {
    expect(normalizeEmail('  Rahul@Example.COM ')).toBe('rahul@example.com');
  });
});

describe('csv parsing', () => {
  const csv = `first_name,email,company\nRahul,rahul@example.com,Example\nBad,not-an-email,X\nDup,rahul@example.com,Y`;
  it('detects headers + email column', () => {
    expect(detectEmailColumn(['first_name', 'email', 'company'])).toBe('email');
  });
  it('reports valid/invalid/duplicates', () => {
    const a = analyzeCsv(csv);
    expect(a.total).toBe(3);
    expect(a.valid).toBe(1);
    expect(a.invalid).toBe(1);
    expect(a.duplicates).toBe(1);
  });
  it('maps known fields, preserves unknown in raw', () => {
    const m = defaultMapping(['first_name', 'email', 'industry']);
    expect(m.email).toBe('email');
    const lead = mapRowToLead({ first_name: 'R', email: 'r@e.com', industry: 'Salon' }, m);
    expect(lead.industry).toBe('Salon');
  });
  it('never silently modifies values', () => {
    const a = analyzeCsv(`email\n  spaced@example.com  \n`);
    // email lookup trims for validation only; raw preserved
    expect(a.rows[0]!.values.email).toBe('  spaced@example.com  ');
    expect(a.rows[0]!.email).toBe('spaced@example.com');
  });
});

describe('sanitize', () => {
  it('removes script, javascript: and handlers', () => {
    const out = sanitizeEmailHtml('<p>hi</p><script>alert(1)</script><a href="javascript:alert(1)" onclick="x()">c</a>');
    expect(out).not.toContain('<script>');
    expect(out).not.toContain('javascript:');
    expect(out).not.toContain('onclick');
    expect(out).toContain('hi');
  });
  it('plain-text fallback', () => {
    expect(htmlToText('<p>Hello<br>World</p>')).toContain('Hello');
  });
});

describe('retry classification', () => {
  it('transient: 421/timeout/network', () => {
    expect(classifyFailure(new Error('421 Temporary failure'))).toBe('transient');
    expect(classifyFailure(new Error('ETIMEDOUT connection'))).toBe('transient');
  });
  it('permanent: 550/auth/invalid', () => {
    expect(classifyFailure(new Error('550 Mailbox unavailable'))).toBe('permanent');
    expect(classifyFailure(new Error('535 Authentication failed'))).toBe('permanent');
    expect(classifyFailure(new Error('553 Invalid recipient'))).toBe('permanent');
  });
  it('bounded backoff', () => {
    expect(backoffMs(1)).toBeGreaterThan(0);
    expect(backoffMs(99)).toBeLessThanOrEqual(60000);
  });
});
