import dotenv from 'dotenv';
dotenv.config();

function num(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  port: num('PORT', 3100),
  host: process.env.HOST ?? '127.0.0.1',
  credentialsKey: process.env.CREDENTIALS_KEY ?? '',
  maxRetries: num('MAX_RETRIES', 2),
  workerPollMs: num('WORKER_POLL_MS', 1000),
  liveAccept: process.env.ABHIMAILER_LIVE_ACCEPT === '1',
};

export function hasSupabase(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceKey);
}
