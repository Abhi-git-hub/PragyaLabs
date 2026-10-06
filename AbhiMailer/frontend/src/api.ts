export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (data as { error?: unknown }).error;
    // Attach the full response body (e.g. `{ preflight }` on 409) so callers
    // can render structured reasons instead of a bare message.
    throw Object.assign(
      new Error(err ? JSON.stringify(err) : `HTTP ${res.status}`),
      { body: data },
    );
  }
  return data as T;
}

// Multipart upload (CSV file + fields). No JSON Content-Type — the browser sets it.
export async function apiForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(path, { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: unknown }).error ? JSON.stringify((data as { error?: unknown }).error) : `HTTP ${res.status}`);
  return data as T;
}

export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const esc = (v: string): string => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const body = `\uFEFF${headers.map(esc).join(',')}\r\n${rows.map((r) => r.map(esc).join(',')).join('\r\n')}\r\n`;
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
