-- Seed / demo data (optional). Uses obscured credential placeholder; replace via UI.
insert into public.mailer_accounts (display_name, email, smtp_host, smtp_port, security, username, password_enc, daily_limit, delay_seconds)
values ('Demo Gmail', 'you@gmail.com', 'smtp.gmail.com', 587, 'STARTTLS', 'you@gmail.com', 'v0:', 50, 30)
on conflict do nothing;
