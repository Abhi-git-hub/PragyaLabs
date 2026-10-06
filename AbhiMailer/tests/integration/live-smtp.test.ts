import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Opt-in LIVE Gmail/SMTP acceptance. NEVER runs in the normal suite
// (excluded in vitest.config.ts; requires ABHIMAILER_LIVE_ACCEPT=1).
// Sends exactly ONE test email plus ONE 3-recipient campaign to
// operator-controlled addresses only. Verify inbox receipt manually.
//
// Gmail: create an App Password (Google Account → Security → 2-Step
// Verification → App passwords), then run:
//
//   ABHIMAILER_LIVE_ACCEPT=1 LIVE_SMTP_HOST=smtp.gmail.com LIVE_SMTP_PORT=587 \
//   LIVE_SMTP_SECURITY=STARTTLS LIVE_SMTP_USER=you@gmail.com \
//   LIVE_SMTP_PASS='<app-password>' LIVE_SMTP_FROM=you@gmail.com \
//   LIVE_SMTP_TO=you@gmail.com npm run test:live
//
// Optional: LIVE_SMTP_TO2 / LIVE_SMTP_TO3 for distinct inboxes (otherwise
// Gmail plus-addressing you+abhi2@gmail.com / you+abhi3@gmail.com is used,
// which lands in the same inbox — still distinct recipients end-to-end).
// LIVE_DAILY_LIMIT / LIVE_DELAY_S tune the campaign (defaults 10 / 2).

function gate() {
  if (process.env.ABHIMAILER_LIVE_ACCEPT !== '1') {
    console.log('skip: set ABHIMAILER_LIVE_ACCEPT=1 to run the live SMTP test');
    return null;
  }
  const host = process.env.LIVE_SMTP_HOST ?? 'smtp.gmail.com';
  const user = process.env.LIVE_SMTP_USER ?? '';
  const pass = process.env.LIVE_SMTP_PASS ?? '';
  const from = process.env.LIVE_SMTP_FROM ?? user;
  const to = process.env.LIVE_SMTP_TO ?? '';
  expect(user, 'LIVE_SMTP_USER required').toBeTruthy();
  expect(pass, 'LIVE_SMTP_PASS required (Gmail App Password)').toBeTruthy();
  expect(to, 'LIVE_SMTP_TO required (your own inbox)').toBeTruthy();
  const plus = (tag: string) => {
    const [local, domain] = to.split('@');
    return `${local}+${tag}@${domain}`;
  };
  return {
    cfg: {
      host,
      port: Number(process.env.LIVE_SMTP_PORT ?? 587),
      security: (process.env.LIVE_SMTP_SECURITY as 'SSL' | 'STARTTLS' | undefined) ?? 'STARTTLS',
      username: user,
      password: pass,
    },
    from,
    recipients: [to, process.env.LIVE_SMTP_TO2 ?? plus('abhi2'), process.env.LIVE_SMTP_TO3 ?? plus('abhi3')],
  };
}

describe('live SMTP (opt-in, real Gmail)', () => {
  it('connection → test message → 3-recipient campaign → SENT → COMPLETED → no resend', async () => {
    const g = gate();
    if (!g) return;
    const { verifyConnection, sendOne, classifySmtpStatus, setTransportFactory, createTransport } =
      await import('../../src/email/sender.js');
    const { MemoryStore } = await import('../../src/db/store.js');
    const { runPreflight } = await import('../../src/campaigns/preflight.js');
    const { buildQueue } = await import('../../src/queue/queue.js');
    const { runWorker } = await import('../../src/worker/worker.js');

    // 1. SMTP connection (granular — must be CONNECTED, never assumed).
    let code = 'UNKNOWN';
    try {
      await verifyConnection(g.cfg, { timeoutMs: 20000 });
      code = 'CONNECTED';
    } catch (e) {
      const s = classifySmtpStatus(e);
      console.log(`live SMTP verify: ${s.code} — ${s.message} ${s.fix}`);
      code = s.code;
    }
    expect(code).toBe('CONNECTED');

    // 2. Exactly one test message (never a campaign).
    const t = await sendOne(g.cfg, {
      from: g.from, to: g.recipients[0] as string,
      subject: '[Mail Mania] live test message',
      text: 'Mail Mania live acceptance: single test message. Please confirm receipt.',
    });
    expect(t.accepted.length).toBeGreaterThan(0);
    console.log(`live test message accepted: ${t.messageId} → check inbox of ${g.recipients[0]}`);

    // 3–5. Real campaign: 3 recipients, personalized, worker-driven.
    let smtpSends = 0;
    const store = new MemoryStore();
    const acc = await store.createAccount({
      display_name: 'Live Gmail', email: g.from, smtp_host: g.cfg.host,
      smtp_port: g.cfg.port, security: g.cfg.security, username: g.cfg.username,
      password_enc: (await import('../../src/security/crypto.js')).encryptSecret(g.cfg.password),
      daily_limit: Number(process.env.LIVE_DAILY_LIMIT ?? 10),
      delay_seconds: Number(process.env.LIVE_DELAY_S ?? 2),
      last_test_at: null, last_test_status: 'CONNECTED',
    });
    const names = ['Live One', 'Live Two', 'Live Three'];
    const leadIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const { lead } = await store.upsertLead({
        email: g.recipients[i] as string, first_name: names[i],
        company: `Live Co ${i + 1}`, source: 'live-test', raw_data: {},
      });
      leadIds.push(lead.id);
    }
    const campaign = await store.createCampaign({
      name: 'Live acceptance', account_id: acc.id,
      subject_template: '[Mail Mania live {{company}}] hello {{first_name}}',
      body_text_template: 'Hi {{first_name}},\n\nLive acceptance for {{company}} ({{email}}).\n\nPlease confirm receipt.',
      body_html_template: null, reply_to: null, unsubscribe_footer: false,
      daily_limit: null, delay_seconds: null, status: 'DRAFT',
      start_at: null, end_at: null, started_at: null, completed_at: null, preflight: null,
    });
    await store.setCampaignRecipients(campaign.id, leadIds);
    // 6. Preflight must pass (live probe runs against the real server).
    const pre = await runPreflight(store, (await store.getCampaign(campaign.id))!, {
      probeSmtp: async () => {
        try {
          await verifyConnection(g.cfg, { timeoutMs: 15000 });
          return { ok: true, code: 'CONNECTED', message: 'SMTP connected (live)' };
        } catch (e) {
          const s = classifySmtpStatus(e);
          return { ok: false, code: s.code, message: `${s.message} ${s.fix}` };
        }
      },
      worker: 'test',
    });
    expect(pre.ok).toBe(true);
    // 7–8. Launch; count REAL smtp sends through a passthrough spy.
    await store.updateCampaign(campaign.id, { status: 'RUNNING', started_at: new Date().toISOString() });
    await buildQueue(store, (await store.getCampaign(campaign.id))!);
    setTransportFactory((cfg) => {
      const real = createTransport(cfg);
      const orig = real.sendMail.bind(real);
      real.sendMail = (async (mail: never) => {
        smtpSends++;
        return orig(mail);
      }) as typeof real.sendMail;
      return real;
    });
    try {
      await runWorker(store, { maxIterations: 200, pollMs: 500 });
    } finally {
      setTransportFactory(null);
    }
    expect(smtpSends).toBe(3);
    const counts = await store.countByStatus(campaign.id);
    expect(counts.SENT).toBe(3);
    expect((await store.getCampaign(campaign.id))!.status).toBe('COMPLETED');
    console.log('live campaign COMPLETED — confirm 3 personalized mails in the inbox(es)');
    // 9. Restart behavior: draining again must send NOTHING more.
    await runWorker(store, { maxIterations: 30, pollMs: 200 });
    expect(smtpSends).toBe(3);
    console.log('live restart-safe: no duplicate sends');
  }, 300000);
});

describe('live SMTP (opt-in)', () => {
  it('sends exactly one test email', async () => {
    if (process.env.ABHIMAILER_LIVE_ACCEPT !== '1') {
      console.log('skip: set ABHIMAILER_LIVE_ACCEPT=1 to run live SMTP test');
      return;
    }
    const { sendOne } = await import('../../src/email/sender.js');
    const host = process.env.LIVE_SMTP_HOST;
    const to = process.env.LIVE_SMTP_TO;
    const from = process.env.LIVE_SMTP_FROM;
    expect(host, 'LIVE_SMTP_HOST required').toBeTruthy();
    expect(to, 'LIVE_SMTP_TO required').toBeTruthy();
    const r = await sendOne(
      {
        host: host!,
        port: Number(process.env.LIVE_SMTP_PORT ?? 587),
        security: (process.env.LIVE_SMTP_SECURITY as 'SSL' | 'STARTTLS') ?? 'STARTTLS',
        username: process.env.LIVE_SMTP_USER ?? '',
        password: process.env.LIVE_SMTP_PASS ?? '',
      },
      { from: from!, to: to!, subject: '[Mail Mania] live acceptance (1 message)', text: 'Mail Mania live SMTP acceptance: exactly one message.' },
    );
    expect(r.accepted.length).toBeGreaterThan(0);
    console.log(`live SMTP accepted: ${r.messageId}`);
  });
});
