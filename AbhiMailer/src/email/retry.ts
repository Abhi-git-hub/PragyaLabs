// Bounded-retry classification. Only transient failures are retried.
export type FailureKind = 'transient' | 'permanent';

const TRANSIENT_CODES = new Set(['421', '450', '451', '452', '4']);
const TRANSIENT_SUBSTR = [
  'temporar', 'try again', 'throttl', 'rate limit', 'greylist',
  'connection timeout', 'timed out', 'econnreset', 'etimedout',
  'econnrefused', 'socket', 'network', 'unavailable', 'busy',
];

const PERMANENT_SUBSTR = [
  'auth', '535', 'invalid credential', 'username or password',
  'mailbox unavailable', '550', '553', '552', 'recipient rejected',
  'user unknown', 'mailbox not found', 'blocked', 'blacklist',
  'spam', 'rejected', 'unrouteable', 'invalid recipient', 'no such user',
  'suppressed', 'unsubscribed', 'config',
];

export function classifyFailure(err: unknown): FailureKind {
  const msg = (err instanceof Error ? `${err.name} ${err.message}` : String(err ?? '')).toLowerCase();
  const code = /(\b[45]\d\d\b)/.exec(msg)?.[1];
  if (code && code.startsWith('5')) {
    // 5xx is permanent unless it is clearly a transient-looking 4xx-in-5xx wrapper.
    if (TRANSIENT_SUBSTR.some((s) => msg.includes(s)) && !PERMANENT_SUBSTR.some((s) => msg.includes(s))) {
      return 'transient';
    }
    return 'permanent';
  }
  if (code && code.startsWith('4')) return 'transient';
  if (PERMANENT_SUBSTR.some((s) => msg.includes(s))) return 'permanent';
  if (TRANSIENT_SUBSTR.some((s) => msg.includes(s))) return 'transient';
  // Unknown errors: treat as transient so bounded retries can absorb blips,
  // but the retry bound (MAX_RETRIES=2) prevents infinite loops.
  return 'transient';
}

export function backoffMs(attempt: number): number {
  // attempt is 1-based count of completed failures.
  return Math.min(60_000, 2_000 * 2 ** Math.max(0, attempt - 1));
}
