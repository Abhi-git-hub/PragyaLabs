"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";

/**
 * Preloader — system calibration. A small signal motif forms while the
 * page becomes interactive; never longer than 1.5s, never a fake
 * percentage counter. Reduced motion skips it entirely.
 */
export function Preloader() {
  const [gone, setGone] = useState(false);
  const [lift, setLift] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setGone(true);
      return;
    }
    const t1 = setTimeout(() => setLift(true), 1100);
    const t2 = setTimeout(() => setGone(true), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "theme-ink fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
        lift ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <div className="flex items-end gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-px origin-bottom bg-cyan"
            style={{ height: `${12 + i * 6}px`, animation: `signal-form 1.1s ease-in-out ${i * 0.09}s infinite alternate` }}
          />
        ))}
      </div>
      <p className="meta mt-5 text-faint">Pragya Labs / System initializing</p>
      <style>{`@keyframes signal-form { from { transform: scaleY(0.35); opacity: 0.45; } to { transform: scaleY(1); opacity: 1; } }`}</style>
    </div>
  );
}
