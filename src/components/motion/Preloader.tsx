"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";

/**
 * Preloader — the opening ceremony. A counter runs to 100 while the worlds
 * hydrate beneath it, then the curtain lifts. Fast, skippable by nature
 * (1.5s), absent entirely under reduced motion.
 */
export function Preloader() {
  const [count, setCount] = useState(0);
  const [gone, setGone] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setGone(true);
      return;
    }
    setEnabled(true);
    const start = performance.now();
    const span = 1400;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / span);
      // Ease hard at the end — arrival, not loading.
      setCount(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else setTimeout(() => setGone(true), 250);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-void transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
        enabled && count >= 100 ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <p className="font-display text-7xl uppercase tabular-nums md:text-8xl">
        {count}
      </p>
      <p className="meta mt-4 text-faint">Pragya Labs — entering the system</p>
      <div className="mt-6 h-px w-48 bg-line">
        <div className="h-full origin-left bg-cyan transition-transform" style={{ transform: `scaleX(${count / 100})` }} />
      </div>
    </div>
  );
}
