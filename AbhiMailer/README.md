# 📬 Mail Mania

**Self-hosted email campaigns, the simple way.** Upload any reasonable CSV, write your subject and message, pick your sender, hit **START CAMPAIGN** — Mail Mania personalizes and sends every email through **your own SMTP account**. No subscriptions, no per-email fees, no data leaving your machine except through your mail server.

> Upload CSV → enter subject & message → choose sender → **START CAMPAIGN** → watch live progress. That's the whole product.

---

## ✨ What you get

- **One-screen campaigns** — drop a CSV, glance at the auto-detected columns, preview real rendered emails, launch.
- **Any CSV headers work** — `Email,Name,Company` or `Work Email,Contact Name,Company Name` or even odd ones like `Reach Out,Primary Contact`. Columns are detected by name *and* by the shape of their values. If the app genuinely can't tell, it asks — otherwise it just works.
- **Personalization that resolves itself** — write `Hi {{first_name}},` even when your CSV only has `Full Name`. `{{name}} {{company}} {{organization}} {{role}} {{job_title}} {{website}} {{email}}` and your exact header names all work. Optional fields accept inline fallbacks: `{{company|your company}}`.
- **Honest preflight** — every check shows pass/fail with the actual reason. Nothing sends until everything that matters is green.
- **Your SMTP, your limits** — Gmail (or any provider) via host/port + App Password. Default pacing is provider-scale (500/day); per-account limits and delays are always respected, never bypassed.
- **Real sending guarantees** — `SENT` means the mail server accepted the message. Bounded retries for transient failures, zero retries for permanent ones, no duplicates ever (even across restarts), pause/resume/stop, suppression list, live progress that survives a browser refresh.

---

## 🚀 Run it locally (5 minutes)

**You need:** Node.js 20+ and npm. That's it — the app runs with a built-in store out of the box.

```bash
cd AbhiMailer
npm install
npm run dev
```

Open **http://127.0.0.1:5174** 🎉 (API runs at http://127.0.0.1:3100.)

> Prefer production mode? `npm run build` once, then `npm start` — UI + API together at http://127.0.0.1:3100.

### Optional: persistent database (Supabase)

Out of the box, data lives in memory (perfect for trying things out; it resets on restart). For persistence across restarts:

1. Create a free project at https://supabase.com/dashboard.
2. Copy `.env.example` to `.env` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API). The service key **never leaves the server**.
3. Run the two SQL files in `supabase/migrations/` (in order) in the Supabase SQL editor — or `supabase db push` if linked.
4. (Recommended) Generate a credential-encryption secret and set `CREDENTIALS_KEY`:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
5. Restart — the header now shows `Store: supabase`, and everything persists.

---

## 📖 Your first campaign (end to end)

### 1. Connect your sender — Accounts page
Click **Accounts** → fill in your SMTP details → **Save account** → **Test connection** (verifies host, security and login *without* sending anything) → optionally **Send test email** to yourself (exactly one email, confirmed first, never queued).

**Gmail setup** (most common):
| Field | Value |
|---|---|
| SMTP host | `smtp.gmail.com` |
| Port | `587` |
| Security | `STARTTLS` (`465` + `SSL` also works) |
| Username | your Gmail address |
| Password | a **Google App Password**, not your login password — Google Account → Security → 2-Step Verification → App passwords |

Your password is encrypted on the server (AES-256-GCM when `CREDENTIALS_KEY` is set) and is **never** shown in the UI, API responses, or logs.

### 2. New Campaign — upload your CSV
Click **New Campaign** (Dashboard or Campaigns page) and drop your file (`.csv`, max 5MB, parsed privately on your machine's server):

```csv
Email,Name,Company,Role
john@example.com,John Smith,Acme,Founder
priya@example.com,Priya Sharma,Bright Smiles,CEO
```

You'll immediately see `2 contacts · 2 valid`, the detected fields (`Email → Email ✓`, `Name → Name ✓` …), and `Everything looks good ✓`. Only touch **Advanced** if detection got something wrong.

### 3. Subject + message
```
Subject: Quick idea for {{company}}

Hi {{first_name}},

I came across {{company}} and wanted to reach out...
```

Flip through the **live previews** — they're rendered by the exact same engine that sends. If a field can't be resolved you'll see precisely which one and for how many rows, and launching stays disabled until you fix the text, add a fallback (`{{company|your company}}`), or exclude those rows.

### 4. Sender + START
Pick your SMTP account (it re-verifies live and shows `SMTP CONNECTED ✓`, your daily limit, delay and estimated finish time), see **"N emails ready to send"**, and press the big **START CAMPAIGN** button. One click does import → validate → launch; uploading or validating alone never sends.

### 5. Watch it send
The campaign page shows live progress (`Sent / Remaining / Failed / Suppressed` + bar), a per-message table, and an event console. **Pause**, **Resume**, and **Stop** (with confirmation) work anytime. Refresh the browser freely — sending continues on the server.

---

## 🧠 Personalization cheat sheet

| Write this | Resolves from |
|---|---|
| `{{first_name}}` | `First Name`, `Full Name` (first word), `Name`, `Contact`, … |
| `{{name}}`, `{{full_name}}` | full name however your CSV labels it |
| `{{company}}`, `{{company_name}}`, `{{organization}}` | `Company`, `Company Name`, `Organization`, `Business`, `Firm`, … |
| `{{role}}`, `{{job_title}}` | `Title`, `Designation`, `Position`, `Role`, … |
| `{{website}}` | `Website`, `Domain`, `URL`, … |
| `{{email}}` | the detected email column, whatever it's called |
| `{{Any Exact Header}}` | your literal column names (case/space/punctuation tolerant) |
| `{{company\|your company}}` | inline fallback — used only when that row has no value |

Empty cells never silently become broken emails: unresolvable fields block launch with per-field counts, and you can exclude those rows in one click.

---

## 🗂️ The rest of the app

- **Dashboard** — totals (campaigns, running, sent, queued, failed, today's sent) + recent campaigns + the big **Import CSV Campaign** button.
- **Leads** — searchable contact database; paste-CSV import with invalid/duplicate reporting.
- **Templates** — save reusable subject/body snippets (stored in your browser).
- **Suppression** — never-mail list (unsubscribed, bounced, manual). Checked before *every* send; suppressed addresses never enter the queue.
- **Activity** — every account/campaign/send/pause event, newest first.
- **Settings** — how the pieces fit (local-first, no telemetry, CLI usage).

### Campaign states
`DRAFT → VALIDATING → READY → RUNNING ⇄ PAUSED → COMPLETED`, plus `STOPPED`/`FAILED`. Creation never sends; only an explicit START does.

---

## ⌨️ Command line (same engine as the UI)

```bash
npm start                                    # serve UI + API + embedded worker
npm run worker                               # standalone worker (same queue logic)
npm run mailer -- --campaign <id>            # preflight → send one campaign
npm run mailer -- import-csv --file leads.csv --account <account-id>
npm run mailer -- import-csv --file leads.csv --account <account-id> --start
```

## ⚙️ Configuration (`.env`)

| Variable | Default | What it does |
|---|---|---|
| `PORT` / `HOST` | `3100` / `127.0.0.1` | Local-only server binding (never exposed publicly by default) |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | — | Persistent Postgres store (omit all three → in-memory store) |
| `CREDENTIALS_KEY` | — | 32-byte hex secret enabling AES-256-GCM SMTP password encryption |
| `MAX_RETRIES` | `2` | Bounded retries, transient failures only |
| `WORKER_POLL_MS` | `1000` | Worker idle poll interval |

CSV limits: 5MB / 20,000 rows per upload. API: all JSON bodies validated; passwords/service keys never leave the server. Database tables are RLS-locked (deny-by-default; server uses the service-role key).

## 🧪 Testing

```bash
npm test        # 88 automated tests (fake local SMTP server — sends zero real emails)
npm run typecheck
```

Suite covers: CSV parsing/aliases/edge cases, header discovery across 6+ real-world schemas, all personalization variables, fallbacks, HTML sanitization, retry classification, store invariants, full fake-SMTP journeys (send → COMPLETED → restart with zero duplicates → suppression → pause/resume → daily limits).

Live Gmail test (opt-in, sends to addresses **you** control — verify inbox receipt yourself):

```bash
ABHIMAILER_LIVE_ACCEPT=1 LIVE_SMTP_HOST=smtp.gmail.com LIVE_SMTP_PORT=587 LIVE_SMTP_SECURITY=STARTTLS \
LIVE_SMTP_USER=you@gmail.com LIVE_SMTP_PASS='<app-password>' LIVE_SMTP_FROM=you@gmail.com \
LIVE_SMTP_TO=you@gmail.com npm run test:live
```

## 🆘 Troubleshooting

| Symptom | Fix |
|---|---|
| `SMTP AUTH_FAILED` on Test connection | Wrong password — for Gmail you must use an **App Password**, not your login password |
| `TIMEOUT` | Wrong host/port or firewall/VPN; check STARTTLS-587 vs SSL-465 pairing |
| Launch blocked: unknown `{{variable}}` | Column truly absent — fix the text, add a `{{field\|fallback}}`, or Exclude those rows |
| `No ready recipients` | Every row was invalid/duplicate/suppressed — check the rejected-rows download |
| Page shows an error panel instead of content | Read it and follow the tip (usually: `npm run build` + restart so UI and server match) |
| Data gone after restart | You run the in-memory store — set the Supabase `.env` vars for persistence |

## 🗃️ Project layout

```text
src/            api  campaigns  cli  config  db  email  leads  queue  security  worker
frontend/src/   App  Import (composer)  ErrorBoundary  api  styles
supabase/migrations/   0001_init.sql  0002_rls_defaults.sql
tests/          unit (6 files)  integration (fake + live SMTP)  fixtures
```

## 📝 A note on names

The product is **Mail Mania**. A few internal identifiers predate the rename and were deliberately left stable so existing installs keep working: the `mailer_*` database tables, the `ABHIMAILER_LIVE_ACCEPT` test flag, and API paths. Only what you see was renamed.

---

Built to send real, personalized email reliably — and to tell you the truth when something's wrong. Happy sending! 📬

---

*Made by Pragya Labs.*
