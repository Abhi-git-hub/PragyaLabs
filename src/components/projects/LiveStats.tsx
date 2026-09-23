"use client";

import { useEffect, useState } from "react";

/**
 * LiveStats — the "live system" readout, rendered ONLY when the server
 * proxy returns real figures. No data (no token, any failure) → renders
 * nothing. Request totals are labeled as traffic, never as users.
 */
export function LiveStats() {
  const [requests, setRequests] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { ok: boolean; requests7d?: number } | null) => {
        if (!cancelled && json?.ok && typeof json.requests7d === "number") {
          setRequests(json.requests7d);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (requests === null) return null;

  return (
    <p className="meta text-faint" role="status">
      Live traffic — {requests.toLocaleString("en-IN")} requests served in the last 7 days
    </p>
  );
}
