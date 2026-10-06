"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { D, EASE_OUT } from "@/lib/motion-presets";

/**
 * ImageReveal — cinematic curtain unveil for important media.
 * A graphite curtain wipes away while the media settles from a
 * slight overshoot into place. Once on entry; static when motion
 * is off. Transform + opacity only.
 */
export function ImageReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const frame = frameRef.current;
    if (!frame || reduced || !motionAllowed()) return;
    const curtain = frame.querySelector("[data-reveal-curtain]");
    const media = frame.querySelector("[data-reveal-media]");
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: { trigger: frame, start: "top 82%", once: true },
      })
        .fromTo(
          curtain,
          { scaleY: 1 },
          { scaleY: 0, duration: D.cinematic, ease: EASE_OUT, transformOrigin: "top" }
        )
        .fromTo(
          media,
          { scale: 1.14, opacity: 0.4 },
          { scale: 1, opacity: 1, duration: D.cinematic, ease: EASE_OUT },
          0.1
        );
    }, frameRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={frameRef} className={className} style={{ position: "relative", overflow: "hidden" }}>
      <div data-reveal-media className="h-full w-full will-change-transform">
        {children}
      </div>
      <div
        data-reveal-curtain
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-graphite"
      />
    </div>
  );
}
