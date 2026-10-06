import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverFields, parseCsv, personNameRatio, emailShapeRatio } from '../../src/leads/csv.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const fx = (n: string) => fs.readFileSync(path.join(dir, '..', 'fixtures', n), 'utf8');
const parsed = (n: string) => {
  const { headers, records } = parseCsv(fx(n));
  return { headers, discovery: discoverFields(headers, records) };
};

describe('schema discovery matrix (headers must not need exact names)', () => {
  it.each([
    ['matrix-a.csv', 'Email', 'Name', 'Company'],
    ['matrix-b.csv', 'email_address', 'full_name', 'organization'],
    ['matrix-c.csv', 'Work Email', 'Contact Name', 'Company Name'],
    ['matrix-d.csv', 'Contact', 'Person', 'Business'],
    ['matrix-e.csv', 'EMAIL', 'NAME', 'ORGANISATION'],
  ])('%s resolves email/name/company', (file, emailH, nameH, companyH) => {
    const { headers, discovery } = parsed(file);
    expect(headers).toContain(emailH);
    expect(discovery.emailHeader).toBe(emailH);
    expect(discovery.needsChoice).toBe(false);
    const nameRole = discovery.roles[nameH];
    expect(['full_name', 'first_name']).toContain(nameRole);
    expect(discovery.roles[companyH]).toBe('company');
    expect(discovery.confidence[emailH]?.score).toBeGreaterThanOrEqual(0.85);
  });

  it('F: unusual headers resolve through value-shape analysis', () => {
    const { discovery } = parsed('matrix-f.csv');
    // "Reach Out" holds emails → email despite the header saying nothing.
    expect(discovery.emailHeader).toBe('Reach Out');
    expect(discovery.confidence['Reach Out']?.source).toBe('values');
    expect(discovery.roles['Primary Contact']).toBe('full_name');
    expect(discovery.roles['Company Legal Name']).toBe('company');
    expect(discovery.roles['Designation']).toBe('job_title');
    expect(discovery.roles['Domain']).toBe('website');
    expect(discovery.needsChoice).toBe(false);
  });

  it('ambiguous email columns force an explicit choice (never guess silently)', () => {
    const { discovery } = parsed('matrix-amb.csv');
    expect(discovery.needsChoice).toBe(true);
    expect(discovery.emailCandidates).toContain('Email');
    expect(discovery.emailCandidates).toContain('Backup Email');
    // Deterministic default = strongest candidate, UI still must ask.
    expect(discovery.emailHeader).toBe('Email');
  });

  it('value-shape helpers behave', () => {
    expect(emailShapeRatio(['a@b.com', 'c@d.org'])).toBe(1);
    expect(emailShapeRatio(['Acme', 'hello'])).toBe(0);
    expect(personNameRatio(['John Smith', 'Rahul Sharma'])).toBe(1);
    expect(personNameRatio(['Acme Inc', 'john@x.com', 'CEO'])).toBeLessThan(0.6);
  });
});
