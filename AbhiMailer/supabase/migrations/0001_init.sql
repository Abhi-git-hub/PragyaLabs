-- AbhiMailer migration 0001
-- Namespaced with mailer_ prefix to avoid collision in shared Supabase project.
-- Logical mapping to spec: mailer_accounts=accounts, mailer_leads=leads,
-- mailer_campaigns=campaigns, mailer_campaign_leads=campaign_leads,
-- mailer_messages=messages, mailer_suppressions=suppressions,
-- mailer_events=events, mailer_settings=settings.

create extension if not exists "pgcrypto";

-- ACCOUNTS (sender SMTP accounts)
create table if not exists public.mailer_accounts (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  smtp_host text not null,
  smtp_port int not null check (smtp_port between 1 and 65535),
  security text not null default 'STARTTLS' check (security in ('SSL','STARTTLS','NONE')),
  username text not null,
  password_enc text not null,
  daily_limit int not null default 50 check (daily_limit > 0 and daily_limit <= 10000),
  delay_seconds int not null default 30 check (delay_seconds >= 0 and delay_seconds <= 3600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_test_at timestamptz,
  last_test_status text
);
create index if not exists idx_mailer_accounts_email on public.mailer_accounts (email);

-- LEADS
create table if not exists public.mailer_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text,
  last_name text,
  company text,
  website text,
  industry text,
  source text not null default 'csv',
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists uq_mailer_leads_email on public.mailer_leads (lower(email));
create index if not exists idx_mailer_leads_company on public.mailer_leads (company);

-- CAMPAIGNS
create table if not exists public.mailer_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_id uuid references public.mailer_accounts(id) on delete restrict,
  subject_template text not null,
  body_text_template text,
  body_html_template text,
  reply_to text,
  unsubscribe_footer boolean not null default true,
  daily_limit int check (daily_limit is null or (daily_limit > 0 and daily_limit <= 10000)),
  delay_seconds int check (delay_seconds is null or (delay_seconds >= 0 and delay_seconds <= 3600)),
  status text not null default 'DRAFT'
    check (status in ('DRAFT','VALIDATING','READY','RUNNING','PAUSED','COMPLETED','STOPPED','FAILED')),
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  preflight jsonb,
  constraint chk_campaign_body check (body_text_template is not null or body_html_template is not null)
);
create index if not exists idx_mailer_campaigns_status on public.mailer_campaigns (status);
create index if not exists idx_mailer_campaigns_account on public.mailer_campaigns (account_id);

-- CAMPAIGN_LEADS (recipient list join)
create table if not exists public.mailer_campaign_leads (
  campaign_id uuid not null references public.mailer_campaigns(id) on delete cascade,
  lead_id uuid not null references public.mailer_leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (campaign_id, lead_id)
);
create index if not exists idx_mailer_cl_lead on public.mailer_campaign_leads (lead_id);

-- MESSAGES (persistent queue). Unique (campaign_id, lead_id) = idempotency.
create table if not exists public.mailer_messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.mailer_campaigns(id) on delete cascade,
  lead_id uuid references public.mailer_leads(id) on delete set null,
  account_id uuid references public.mailer_accounts(id) on delete restrict,
  recipient text not null,
  rendered_subject text,
  rendered_text text,
  rendered_html text,
  status text not null default 'QUEUED'
    check (status in ('QUEUED','SENDING','SENT','FAILED','RETRYING','SKIPPED','SUPPRESSED','DELIVERY_UNKNOWN')),
  attempt_count int not null default 0 check (attempt_count >= 0),
  max_retries int not null default 2 check (max_retries >= 0 and max_retries <= 10),
  last_error text,
  smtp_message_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  next_attempt_at timestamptz,
  locked_at timestamptz,
  constraint uq_mailer_msg_campaign_lead unique (campaign_id, lead_id)
);
create index if not exists idx_mailer_msg_status on public.mailer_messages (status);
create index if not exists idx_mailer_msg_campaign on public.mailer_messages (campaign_id);
create index if not exists idx_mailer_msg_next on public.mailer_messages (next_attempt_at);
create index if not exists idx_mailer_msg_recipient on public.mailer_messages (lower(recipient));
create index if not exists idx_mailer_msg_sent on public.mailer_messages (account_id, sent_at);

-- SUPPRESSIONS
create table if not exists public.mailer_suppressions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  reason text not null default 'MANUAL'
    check (reason in ('UNSUBSCRIBED','BOUNCED','INVALID','MANUAL','OTHER')),
  note text,
  created_at timestamptz not null default now()
);
create unique index if not exists uq_mailer_suppressions_email on public.mailer_suppressions (lower(email));

-- EVENTS
create table if not exists public.mailer_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.mailer_campaigns(id) on delete cascade,
  message_id uuid references public.mailer_messages(id) on delete cascade,
  lead_id uuid references public.mailer_leads(id) on delete set null,
  type text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_mailer_events_campaign on public.mailer_events (campaign_id, created_at desc);
create index if not exists idx_mailer_events_type on public.mailer_events (type);

-- SETTINGS
create table if not exists public.mailer_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Atomic claim function: reserves one eligible message with row lock, SKIP LOCKED.
create or replace function public.mailer_claim_next(p_campaign_id uuid default null)
returns table (id uuid)
language plpgsql
as $$
declare v_id uuid;
begin
  select m.id into v_id
  from public.mailer_messages m
  where m.status in ('QUEUED','RETRYING')
    and (m.next_attempt_at is null or m.next_attempt_at <= now())
    and (p_campaign_id is null or m.campaign_id = p_campaign_id)
  order by m.created_at
  limit 1
  for update skip locked;
  if v_id is null then
    return;
  end if;
  update public.mailer_messages
  set status = 'SENDING', locked_at = now(), updated_at = now()
  where public.mailer_messages.id = v_id
    and status in ('QUEUED','RETRYING');
  if found then
    id := v_id;
    return next;
  end if;
  return;
end;
$$;
