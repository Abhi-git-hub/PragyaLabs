"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { imageParallax } from "@/lib/motion-presets";

/**
 * Parallax — overflow-hidden frame with a slow inner drift.
 * The image translates at a different speed from its container
 * (±5% by default): depth, not sliding. Static when motion is off.
 */
export function Parallax({
  children,
  range = 10,
  className,
}: {
  children: ReactNode;
  range?: number;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const frame = frameRef.current;
    const inner = frame?.firstElementChild as HTMLElement | null;
    if (!frame || !inner || reduced || !motionAllowed()) return;
    const preset = imageParallax(range);
    const tween = gsap.fromTo(inner, preset.from, {
      ...preset.to,
      scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [range, reduced]);

  return (
    <div ref={frameRef} className={className} style={{ overflow: "hidden" }}>
      <div className="h-full w-full" style={{ transform: "scale(1.08)" }}>
        {children}
      </div>
    </div>
  );
}
