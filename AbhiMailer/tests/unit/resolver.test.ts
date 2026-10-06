import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverFields, parseCsv, buildImportLead } from '../../src/leads/csv.js';
import { buildLeadContext, renderStrict, findMissing, MissingVariableError, normalizeVarName, extractVariables } from '../../src/email/template.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const fx = (n: string) => fs.readFileSync(path.join(dir, '..', 'fixtures', n), 'utf8');

function ctxFor(file: string, rowIdx: number) {
  const { headers, records } = parseCsv(fx(file));
  const { roles } = discoverFields(headers, records);
  const lead = buildImportLead(records[rowIdx] as Record<string, string>, roles);
  if (!lead) throw new Error('row did not build');
  return buildLeadContext({ ...lead, raw_data: lead.raw_data });
}

const render = (ctx: object, tpl: string) => renderStrict(tpl, ctx as Record<string, unknown>);

describe('personalization variables resolve across schemas', () => {
  it.each(['matrix-a.csv', 'matrix-b.csv', 'matrix-c.csv', 'matrix-d.csv', 'matrix-e.csv'])(
    '%s: all 9 variables resolve for a complete row',
    (file) => {
      const ctx = ctxFor(file, 0);
      expect(render(ctx, 'Hi {{first_name}},')).toBe('Hi John,');
      expect(render(ctx, '{{name}} / {{full_name}}')).toBe('John Smith / John Smith');
      expect(render(ctx, '{{company}} / {{company_name}} / {{organization}}')).toBe('Acme / Acme / Acme');
      expect(render(ctx, '{{email}}')).toBe('john@example.com');
    },
  );

  it('matrix-f: role + website + legal-name synonyms resolve', () => {
    const ctx = ctxFor('matrix-f.csv', 0);
    expect(render(ctx, '{{role}} / {{job_title}}')).toBe('Founder / Founder');
    expect(render(ctx, '{{website}}')).toBe('acme.example.com');
    expect(render(ctx, '{{company}}')).toBe('Acme Inc');
  });

  it('header names are directly usable, tolerantly', () => {
    const ctx = ctxFor('matrix-f.csv', 0);
    expect(render(ctx, '{{Company Legal Name}}')).toBe('Acme Inc');
    expect(render(ctx, '{{company_legal_name}}')).toBe('Acme Inc');
    expect(render(ctx, '{{COMPANY NAME}}')).toBe('Acme Inc');
    expect(render(ctx, '{{Designation}}')).toBe('Founder');
    expect(render(ctx, '{{Primary Contact}}')).toBe('John Smith');
  });

  it('missing optional values throw (never silent empty strings)', () => {
    const ctx = ctxFor('matrix-a.csv', 1); // priya: no company
    expect(render(ctx, 'Hi {{first_name}}')).toBe('Hi Priya');
    expect(() => render(ctx, '{{company}}')).toThrow(MissingVariableError);
    expect(findMissing('Hi {{first_name}} of {{company}}', ctx)).toEqual(['company']);
  });

  it('genuinely unknown variables throw', () => {
    const ctx = ctxFor('matrix-a.csv', 0);
    expect(() => render(ctx, '{{nope}}')).toThrow(MissingVariableError);
  });

  it('variable names normalize identically to header keys', () => {
    expect(normalizeVarName('Company Legal Name')).toBe('company_legal_name');
    expect(normalizeVarName('First & Last Name')).toBe('first_last_name');
  });

  it('inline fallbacks apply only when the value is genuinely missing', () => {
    const full = ctxFor('matrix-a.csv', 0);
    const sparse = ctxFor('matrix-a.csv', 1); // priya: no company
    expect(render(full, '{{company|your company}}')).toBe('Acme');
    expect(render(sparse, '{{company|your company}}')).toBe('your company');
    expect(findMissing('{{company|your company}}', sparse)).toEqual([]);
  });

  it('no fallback, no mercy: unknown and empty-fallback variables still throw', () => {
    const ctx = ctxFor('matrix-a.csv', 1);
    expect(() => render(ctx, '{{company}}')).toThrow(MissingVariableError);
    expect(() => render(ctx, '{{company|}}')).toThrow(MissingVariableError);
  });

  it('extractVariables reports the variable, not the fallback text', () => {
    expect(extractVariables('{{company|your company}} and {{name}}')).toEqual(['company', 'name']);
  });
});
