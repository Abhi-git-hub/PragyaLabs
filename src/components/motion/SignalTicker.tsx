"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * SignalTicker — the single marquee on the site. The narrative spine,
 * drifting once across the fold between hero and recognition:
 * fragments become context, context becomes intelligence.
 * Decorative; screen readers get the plain sequence once.
 */
const SPINE = ["Fragments", "Context", "Intelligence", "Interface", "Impact"];

export function SignalTicker() {
  const reduced = usePrefersReducedMotion();
  const row = [...SPINE, ...SPINE, ...SPINE];

  return (
    <div className="relative overflow-hidden border-y border-line py-4" aria-hidden="true">
      <p className="sr-only">
        Fragments become context, context becomes intelligence, intelligence becomes interface, interface creates impact.
      </p>
      {reduced ? (
        <p className="meta text-center text-faint">
          Fragments — Context — Intelligence — Interface — Impact
        </p>
      ) : (
        <div className="marquee-track flex w-max items-center gap-10 pr-10">
          {[0, 1].map((half) => (
            <div key={half} className="flex items-center gap-10" aria-hidden="true">
              {row.map((w, i) => (
                <span key={`${half}-${i}`} className="flex items-center gap-10">
                  <span className="font-display text-2xl font-semibold uppercase tracking-wide text-bone/80 md:text-3xl">
                    {w}
                  </span>
                  <span className="text-cyan">→</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(90deg, var(--pl-background) 0%, transparent 12%, transparent 88%, var(--pl-background) 100%)" }}
      />
    </div>
  );
}
