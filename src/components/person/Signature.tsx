"use client";

import { useEffect, useRef } from "react";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { duration } from "@/config/tokens";
import { cn } from "@/lib/cn";

/**
 * SignatureMark — the authentic vector mark, revealed never redrawn.
 * A left-to-right clip wipe performs the draw-on, then a light pass
 * settles it. Reduced motion: fully visible, no animation.
 * Sparingly placed: story, about, loop. Never a logo.
 */
export function Signature({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wipeRef = useRef<HTMLDivElement | null>(null);
  const passRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = wrapRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wipeRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: duration.epic,
          ease: "expo.inOut",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }
      );
      gsap.fromTo(
        passRef.current,
        { xPercent: -120, opacity: 0 },
        {
          xPercent: 120,
          opacity: 1,
          duration: duration.epic,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        }
      );
    }, wrapRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      className={cn("relative overflow-hidden", className)}
      role="img"
      aria-label="Abhi's handwritten signature"
    >
      <div ref={wipeRef} className="relative w-full">
        {/* Two-tone traced mark: inverted layer lifts the dark strokes to
            white, native layer keeps the light strokes — stacked, the full
            authentic mark reads on obsidian. No redrawing, only reveal. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/person/signature.svg"
          alt=""
          loading="lazy"
          className="block w-full [filter:invert(1)]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/person/signature.svg"
          alt=""
          loading="lazy"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 block h-full w-full"
        />
      </div>
      <div
        ref={passRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-1/3 [background:linear-gradient(100deg,transparent,rgb(53_233_255/0.16),transparent)]"
      />
    </div>
  );
}
