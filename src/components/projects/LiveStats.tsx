"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * LiveStats — the "live system" readout, rendered ONLY when the server
 * proxy returns real figures. No data (no token, any failure) → renders
 * nothing. Request totals are labeled as traffic, never as users.
 * The figure counts up on arrival; the value itself is never altered.
 */
export function LiveStats() {
  const [requests, setRequests] = useState<number | null>(null);
  const [shown, setShown] = useState<number | null>(null);

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

  useEffect(() => {
    if (requests === null) return;
    if (prefersReducedMotion()) {
      setShown(requests);
      return;
    }
    const start = performance.now();
    const span = 1200;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / span);
      setShown(Math.round(requests * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [requests]);

  if (requests === null || shown === null) return null;

  return (
    <p className="meta text-faint" role="status">
      Live traffic — {shown.toLocaleString("en-IN")} requests served in the last 7 days
    </p>
  );
}
