import crypto from 'node:crypto';
import { env } from '../config/env.js';

// SMTP credential protection.
// Mechanism: AES-256-GCM with CREDENTIALS_KEY (hex or utf8, hashed to 32 bytes).
// Stored format: v1:<iv hex>:<authTag hex>:<ciphertext hex>.
// If CREDENTIALS_KEY is absent, credentials are stored as v0 base64 (obscured,
// NOT encrypted) and a warning is surfaced. Documented in README; never logged.
const PREFIX_V1 = 'v1:';
const PREFIX_V0 = 'v0:';

function key32(): Buffer {
  const raw = env.credentialsKey;
  if (!raw) throw new Error('CREDENTIALS_KEY is not set');
  // Accept 64-hex (32 bytes) or arbitrary string (sha256-hashed).
  if (/^[0-9a-fA-F]{64}$/.test(raw.trim())) return Buffer.from(raw.trim(), 'hex');
  return crypto.createHash('sha256').update(raw, 'utf8').digest();
}

export function isEncryptionEnabled(): boolean {
  return env.credentialsKey.length >= 8;
}

export function encryptSecret(plain: string): string {
  if (!isEncryptionEnabled()) {
    return PREFIX_V0 + Buffer.from(plain, 'utf8').toString('base64');
  }
  const key = key32();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX_V1}${iv.toString('hex')}:${tag.toString('hex')}:${ct.toString('hex')}`;
}

export function decryptSecret(stored: string): string {
  if (stored.startsWith(PREFIX_V1)) {
    const parts = stored.slice(PREFIX_V1.length).split(':');
    if (parts.length !== 3) throw new Error('Malformed credential payload');
    const [ivH, tagH, ctH] = parts as [string, string, string];
    const key = key32();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivH, 'hex'));
    decipher.setAuthTag(Buffer.from(tagH, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(ctH, 'hex')), decipher.final()]).toString('utf8');
  }
  if (stored.startsWith(PREFIX_V0)) {
    return Buffer.from(stored.slice(PREFIX_V0.length), 'base64').toString('utf8');
  }
  // Legacy plaintext (should not happen for new rows)
  return stored;
}

export function redact(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(redact);
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (/password|secret|service.?role|token|app.?password/i.test(k)) out[k] = '[REDACTED]';
      else out[k] = redact(v);
    }
    return out;
  }
  return obj;
}
