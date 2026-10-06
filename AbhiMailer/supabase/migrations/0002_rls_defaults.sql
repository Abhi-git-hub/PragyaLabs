-- AbhiMailer migration 0002: Row Level Security + provider-scale defaults.
--
-- RLS: the browser NEVER talks to Supabase directly (all access goes through
-- the Express API, which uses the service-role key server-side). Enabling RLS
-- with no public policies therefore denies anon/authenticated roles outright
-- while the server (service_role, which bypasses RLS) keeps full access.
-- SMTP credentials and campaign data are no longer readable with the anon key.
ALTER TABLE public.mailer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailer_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailer_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailer_campaign_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailer_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailer_settings ENABLE ROW LEVEL SECURITY;

-- No arbitrary app-level 50/day cap: provider-scale default (Gmail: 500/day).
-- Configured per-account/per-campaign limits always win; this only changes
-- the default for newly created accounts.
ALTER TABLE public.mailer_accounts ALTER COLUMN daily_limit SET DEFAULT 500;
