"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Route transition: View Transitions API where supported, clean
 * rise+fade fallback otherwise. Reduced motion gets no movement —
 * content simply swaps.
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
    if (prefersReducedMotion()) return;
    const bar = barRef.current;
    const sweep = () => {
      if (!bar) return;
      bar.style.transition = "none";
      bar.style.transform = "scaleX(0)";
      bar.style.opacity = "1";
      requestAnimationFrame(() => {
        bar.style.transition = "transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 200ms 300ms";
        bar.style.transform = "scaleX(1)";
        bar.style.opacity = "0";
      });
    };
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (typeof doc.startViewTransition === "function") {
      try {
        doc.startViewTransition(() => undefined);
      } catch {
        /* fall through to the sweep */
      }
    }
    sweep();
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
