"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * ScrollCurves — the motif that runs through the whole website.
 * Two tall serpentine curves fixed behind the content; global scroll
 * progress draws their strokes, scrolling back undraws them. One system,
 * every page, always in sync with the journey.
 */
export function ScrollCurves() {
  const aRef = useRef<SVGPathElement | null>(null);
  const bRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b || prefersReducedMotion()) return;
    const setup = (el: SVGPathElement) => {
      const len = el.getTotalLength();
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      return len;
    };
    const la = setup(a);
    const lb = setup(b);
    let raf = 0;
    const loop = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      // Second curve trails the first — a canon, not an echo.
      const pb = Math.min(1, Math.max(0, (p - 0.12) / 0.88));
      a.style.strokeDashoffset = `${la * (1 - p)}`;
      b.style.strokeDashoffset = `${lb * (1 - pb)}`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 4000"
        preserveAspectRatio="xMidYMin slice"
        fill="none"
      >
        <path
          ref={aRef}
          d="M 1180 -50 C 980 400, 1380 700, 1150 1100 C 920 1500, 1300 1800, 1120 2200 C 940 2600, 1260 3000, 1100 3400 C 1020 3600, 1080 3800, 1060 4050"
          stroke="#3DFFA2"
          strokeOpacity="0.16"
          strokeWidth="2"
        />
        <path
          ref={bRef}
          d="M 260 -50 C 460 500, 80 800, 300 1200 C 520 1600, 140 2000, 330 2400 C 520 2800, 180 3200, 340 3600 C 400 3760, 360 3920, 380 4050"
          stroke="#F2F1EA"
          strokeOpacity="0.07"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
