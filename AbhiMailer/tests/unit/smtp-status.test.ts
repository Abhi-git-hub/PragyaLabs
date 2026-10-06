import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nodemailer from 'nodemailer';
import { classifySmtpStatus, verifyConnection, setTransportFactory } from '../../src/email/sender.js';
import { FakeSmtp } from '../helpers/fake-smtp.js';

const err = (props: Record<string, unknown>, message: string) =>
  Object.assign(new Error(message), props);

describe('SMTP status classification (WHAT + HOW TO FIX, never bare failure)', () => {
  it('auth failures identify credentials (incl. Gmail App Password hint)', () => {
    for (const e of [
      err({ code: 'EAUTH', responseCode: 535 }, 'Invalid login: 535-5.7.8 Username and Password not accepted'),
      err({ responseCode: 535 }, '535 5.7.8 Authentication credentials invalid'),
    ]) {
      const s = classifySmtpStatus(e);
      expect(s.code).toBe('AUTH_FAILED');
      expect(s.fix).toMatch(/App Password/i);
    }
  });
  it('timeouts are distinguished', () => {
    const s = classifySmtpStatus(err({ code: 'ETIMEDOUT' }, 'Connection timed out'));
    expect(s.code).toBe('TIMEOUT');
    expect(s.fix).toMatch(/host and port/i);
  });
  it('refused/unresolvable hosts are distinguished', () => {
    expect(classifySmtpStatus(err({ code: 'ECONNREFUSED' }, 'connect ECONNREFUSED')).code).toBe('REJECTED');
    expect(classifySmtpStatus(err({ code: 'ENOTFOUND' }, 'getaddrinfo ENOTFOUND x')).code).toBe('REJECTED');
  });
  it('message rejections are distinguished', () => {
    const s = classifySmtpStatus(err({ code: 'EENVELOPE', responseCode: 550 }, 'Mailbox unavailable'));
    expect(s.code).toBe('REJECTED');
  });
  it('unknown errors stay UNKNOWN (never misreported)', () => {
    expect(classifySmtpStatus(err({}, 'weird')).code).toBe('UNKNOWN');
    expect(classifySmtpStatus(undefined).code).toBe('UNKNOWN');
  });
});

describe('SMTP verification end-to-end (fake server)', () => {
  let fake: FakeSmtp;
  beforeEach(async () => {
    fake = new FakeSmtp();
    await fake.start();
    setTransportFactory(() => nodemailer.createTransport({
      host: '127.0.0.1', port: fake.port, secure: false, ignoreTLS: true,
    } as never));
  });
  afterEach(async () => { setTransportFactory(null); await fake.stop(); });

  const cfg = (port: number) => ({ host: '127.0.0.1', port, security: 'NONE' as const, username: 'u', password: 'p' });

  it('CONNECTED only after real verification', async () => {
    await expect(verifyConnection(cfg(fake.port))).resolves.toBeUndefined();
  });
  it('wrong credentials surface AUTH_FAILED (not generic failure)', async () => {
    // NOTE: verify() never attempts AUTH — only an actual send does.
    const strict = new FakeSmtp({ requireAuth: true });
    strict.authBehavior = 'reject';
    await strict.start();
    try {
      const t = nodemailer.createTransport({
        host: '127.0.0.1', port: strict.port, secure: false, ignoreTLS: true,
        auth: { user: 'u', pass: 'wrong' },
      });
      const outcome = await t.sendMail({ from: 'a@b.com', to: 'c@d.com', subject: 't', text: 'x' }).then(
        () => ({ code: 'CONNECTED' as const }),
        (e: unknown) => classifySmtpStatus(e),
      );
      try { t.close(); } catch { /* ignore */ }
      expect(outcome.code).toBe('AUTH_FAILED');
      if (outcome.code === 'AUTH_FAILED') expect(outcome.fix).toMatch(/App Password/i);
    } finally {
      await strict.stop();
    }
  });
  it('unreachable server surfaces REJECTED/TIMEOUT, never CONNECTED', async () => {
    await fake.stop(); // nothing listening now
    const outcome = await verifyConnection(cfg(fake.port)).then(
      () => ({ code: 'CONNECTED' as const }),
      (e: unknown) => classifySmtpStatus(e),
    );
    expect(['REJECTED', 'TIMEOUT', 'UNKNOWN']).toContain(outcome.code);
    expect(outcome.code).not.toBe('CONNECTED');
  });
});
