import nodemailer, { type Transporter } from 'nodemailer';
import type { Account } from '../db/types.js';
import { decryptSecret } from '../security/crypto.js';

export interface SmtpConfig {
  host: string;
  port: number;
  security: 'SSL' | 'STARTTLS' | 'NONE';
  username: string;
  password: string;
}

export function configFromAccount(a: Account): SmtpConfig {
  return {
    host: a.smtp_host,
    port: a.smtp_port,
    security: a.security,
    username: a.username,
    password: decryptSecret(a.password_enc),
  };
}

export function createTransport(cfg: SmtpConfig, opts?: { timeoutMs?: number }): Transporter {
  const secure = cfg.security === 'SSL';
  const t = opts?.timeoutMs;
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure,
    requireTLS: cfg.security === 'STARTTLS',
    auth: { user: cfg.username, pass: cfg.password },
    connectionTimeout: t ?? 15_000,
    greetingTimeout: t ?? 10_000,
    socketTimeout: (t ?? 20_000),
  });
}

// Transport factory hook for tests (fake SMTP injection).
let factory: ((cfg: SmtpConfig) => Transporter) | null = null;
export function setTransportFactory(f: ((cfg: SmtpConfig) => Transporter) | null): void {
  factory = f;
}
export function getTransport(cfg: SmtpConfig): Transporter {
  return factory ? factory(cfg) : createTransport(cfg);
}

export async function verifyConnection(cfg: SmtpConfig, opts?: { timeoutMs?: number }): Promise<void> {
  const t = factory ? factory(cfg) : createTransport(cfg, opts);
  try {
    await t.verify();
  } finally {
    try { t.close(); } catch { /* ignore */ }
  }
}

export type SmtpStatusCode = 'CONNECTED' | 'AUTH_FAILED' | 'TIMEOUT' | 'REJECTED' | 'UNKNOWN';

export interface SmtpStatus {
  code: SmtpStatusCode;
  /** Human-readable WHAT. */
  message: string;
  /** HOW TO FIX. */
  fix: string;
}

// Distinguish real SMTP outcomes. Never report CONNECTED without verification
// (callers only build it after verifyConnection resolves).
export function classifySmtpStatus(err: unknown): SmtpStatus {
  const e = err as { code?: unknown; responseCode?: unknown; command?: unknown; message?: unknown } | null;
  const code = String(e?.code ?? '');
  const responseCode = String(e?.responseCode ?? '');
  const msg = (e instanceof Error ? e.message : String(err ?? 'unknown error')).slice(0, 300);
  const hay = `${code} ${responseCode} ${msg}`.toLowerCase();

  if (/eauth/.test(hay) || /\b53[45]\b/.test(responseCode) || /5\.7\.[89]|invalid credentials|bad username|username or password|authentication failed|auth unsuccessful/i.test(msg)) {
    return {
      code: 'AUTH_FAILED',
      message: `SMTP authentication failed (${msg})`,
      fix: 'Fix: check the username and password. For Gmail, use your address plus a Google App Password (Google Account → Security → 2-Step Verification → App passwords), not your login password.',
    };
  }
  if (/etimedout|esockettimedout|timed out|timeout|greeting/.test(hay)) {
    return {
      code: 'TIMEOUT',
      message: `SMTP connection timed out (${msg})`,
      fix: 'Fix: check the SMTP host and port, firewall/VPN rules, and that STARTTLS (587) vs SSL (465) matches the port.',
    };
  }
  if (/econnrefused|enotfound|enetunreach|ehostunreach|econnreset/.test(hay)) {
    return {
      code: 'REJECTED',
      message: `SMTP server refused the connection (${msg})`,
      fix: 'Fix: verify the SMTP host and port. For Gmail use smtp.gmail.com with 587/STARTTLS or 465/SSL.',
    };
  }
  if (/eenvelope/.test(hay) || /\b55[0134]\b/.test(responseCode) || /mailbox unavailable|recipient.*reject|rejected/i.test(msg)) {
    return {
      code: 'REJECTED',
      message: `SMTP server rejected the message (${msg})`,
      fix: 'Fix: verify the sender address is allowed for this account and the recipient address exists.',
    };
  }
  return {
    code: 'UNKNOWN',
    message: `SMTP error (${msg || code || 'unknown'})`,
    fix: 'Fix: verify host, port, security mode and credentials, then retry.',
  };
}

export interface SendInput {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

export interface SendResult {
  messageId: string;
  accepted: string[];
  response: string;
}

// Exactly one SMTP send. The caller records the result; SENT is only reported
// when the SMTP server accepts the message (no fake success).
export async function sendOne(cfg: SmtpConfig, mail: SendInput): Promise<SendResult> {
  const t = getTransport(cfg);
  try {
    const info = await t.sendMail({
      from: mail.from,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      replyTo: mail.replyTo,
    });
    return {
      messageId: String(info.messageId ?? ''),
      accepted: (info.accepted as string[] | undefined) ?? [mail.to],
      response: String(info.response ?? ''),
    };
  } finally {
    try { t.close(); } catch { /* ignore */ }
  }
}
