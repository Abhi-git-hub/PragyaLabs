import { SMTPServer } from 'smtp-server';

export interface CapturedMail {
  to: string;
  from: string;
  subject: string;
  raw: string;
}

export type RecipientBehavior = 'ok' | 'transient' | 'permanent';

// Deterministic fake SMTP server for tests. Never touches real SMTP.
export class FakeSmtp {
  server: SMTPServer;
  port = 0;
  received: CapturedMail[] = [];
  behavior = new Map<string, RecipientBehavior>();
  authAttempts = 0;
  /** 'reject' makes the server answer 535 to AUTH (for auth-failure tests). */
  authBehavior: 'accept' | 'reject' = 'accept';

  constructor(opts?: { requireAuth?: boolean }) {
    this.server = new SMTPServer({
      authOptional: !opts?.requireAuth,
      disabledCommands: ['STARTTLS'],
      onAuth: (auth: { username?: unknown }, _session: unknown, cb: (err: Error | null, res?: unknown) => void) => {
        this.authAttempts++;
        if (this.authBehavior === 'reject') {
          const err = new Error('535 5.7.8 Authentication credentials invalid') as Error & { responseCode?: number };
          err.responseCode = 535;
          return cb(err);
        }
        cb(null, { user: String(auth.username ?? '') });
      },
      onRcptTo: (address: { address: string }, _session: unknown, cb: (err?: Error) => void) => {
        const to = address.address.toLowerCase();
        const b = this.behavior.get(to) ?? 'ok';
        if (b === 'transient') {
          const err = new Error('4.7.0 Temporary failure, try again later') as Error & { responseCode?: number };
          err.responseCode = 421;
          return cb(err);
        }
        if (b === 'permanent') {
          const err = new Error('5.1.1 Mailbox unavailable') as Error & { responseCode?: number };
          err.responseCode = 550;
          return cb(err);
        }
        return cb();
      },
      onData: (stream: NodeJS.ReadableStream, session: { envelope: { rcptTo?: { address: string }[]; mailFrom?: { address: string } | false } }, cb: () => void) => {
        let raw = '';
        stream.on('data', (d: Buffer) => { raw += d.toString('utf8'); });
        stream.on('end', () => {
          const to = (session.envelope.rcptTo ?? []).map((r: { address: string }) => r.address).join(',');
          const from = session.envelope.mailFrom ? session.envelope.mailFrom.address : '';
          const subj = (/^subject:(.*)$/gim.exec(raw)?.[1] ?? '').trim();
          this.received.push({ to, from, subject: subj, raw });
          cb();
        });
      },
    });
    // Surface server errors without crashing tests.
    this.server.on('error', () => undefined);
  }

  async start(): Promise<number> {
    await new Promise<void>((resolve, reject) => {
      this.server.listen(0, '127.0.0.1', () => resolve());
      this.server.on('error', reject);
    });
    const addr = this.server.server.address();
    this.port = typeof addr === 'object' && addr ? addr.port : 0;
    return this.port;
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolve) => this.server.close(() => resolve()));
  }

  for(to: string): CapturedMail[] {
    const t = to.toLowerCase();
    return this.received.filter((m) => m.to.toLowerCase().includes(t));
  }
}
