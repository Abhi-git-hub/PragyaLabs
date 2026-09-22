"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Subtle route transition: content enters with a short rise+fade, and a
 * 1px energy hairline sweeps the top on every navigation. Premium, never
 * annoying — 350ms, expo out, then gone.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const bar = barRef.current;
    if (!bar) return;
    bar.style.transition = "none";
    bar.style.transform = "scaleX(0)";
    bar.style.opacity = "1";
    requestAnimationFrame(() => {
      bar.style.transition = "transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 200ms 300ms";
      bar.style.transform = "scaleX(1)";
      bar.style.opacity = "0";
    });
  }, [pathname]);

  return (
    <>
      <div
        ref={barRef}
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[90] h-px origin-left bg-cyan opacity-0"
      />
      <div key={pathname} className="route-enter">
        {children}
      </div>
    </>
  );
}
