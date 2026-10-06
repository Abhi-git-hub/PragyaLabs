import { z } from 'zod';

export const accountSchema = z.object({
  display_name: z.string().min(1).max(120),
  email: z.string().email().max(320),
  smtp_host: z.string().min(1).max(255),
  smtp_port: z.number().int().min(1).max(65535),
  security: z.enum(['SSL', 'STARTTLS', 'NONE']).default('STARTTLS'),
  username: z.string().min(1).max(320),
  password: z.string().min(1).max(1024),
  // Provider-scale default (Gmail: 500/day). Tune to your SMTP provider.
  daily_limit: z.number().int().min(1).max(10000).default(500),
  delay_seconds: z.number().int().min(0).max(3600).default(30),
});

export const leadImportSchema = z.object({
  csv: z.string().min(1).max(5_000_000),
  mapping: z.record(z.string()).optional(),
  emailColumn: z.string().optional(),
  source: z.string().max(60).optional(),
});

export const campaignSchema = z.object({
  name: z.string().min(1).max(200),
  account_id: z.string().uuid().nullable().optional(),
  lead_ids: z.array(z.string().uuid()).optional(),
  subject: z.string().min(1).max(500),
  body_text: z.string().max(200_000).optional(),
  body_html: z.string().max(500_000).optional(),
  reply_to: z.string().email().nullable().optional(),
  unsubscribe_footer: z.boolean().default(true),
  daily_limit: z.number().int().min(1).max(10000).nullable().optional(),
  delay_seconds: z.number().int().min(0).max(3600).nullable().optional(),
  start_at: z.string().nullable().optional(),
  end_at: z.string().nullable().optional(),
}).refine((v) => v.body_text || v.body_html, { message: 'body_text or body_html required' });

export const suppressionSchema = z.object({
  email: z.string().email(),
  reason: z.enum(['UNSUBSCRIBED', 'BOUNCED', 'INVALID', 'MANUAL', 'OTHER']).default('MANUAL'),
  note: z.string().max(500).optional(),
});

export const testEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(500).default('Mail Mania test email'),
  text: z.string().max(100_000).default('This is a test email from Mail Mania.'),
  html: z.string().max(200_000).optional(),
});

const columnRole = z.enum([
  'email', 'company', 'first_name', 'full_name', 'last_name', 'job_title',
  'website', 'industry', 'subject', 'body', 'custom',
]);

// One-click CSV campaign import. Accepts multipart (file) or JSON ({csv}).
export const csvCampaignPreviewSchema = z.object({
  csv: z.string().min(1).max(5_000_000).optional(),
  emailHeader: z.string().max(255).optional(),
  roles: z.record(columnRole).optional(),
  subject: z.string().max(5000).optional(),
  bodyText: z.string().max(200_000).optional(),
  mode: z.enum(['row', 'template']).optional(),
});

export const csvCampaignImportSchema = csvCampaignPreviewSchema.extend({
  name: z.string().min(1).max(200),
  accountId: z.string().uuid().nullable().optional(),
  source: z.string().max(60).optional(),
});
