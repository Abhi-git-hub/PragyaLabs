"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";

/**
 * Editorial portrait: approved artwork, responsive sources, slow scroll
 * parallax, grain, cool grade preserved. The face never dominates — it is
 * revealed gradually inside its chapter.
 */
export function Portrait({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = wrapRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const img = el.querySelector("img");
    const tween = gsap.fromTo(
      img,
      { yPercent: -6, scale: 1.12 },
      {
        yPercent: 6,
        scale: 1.12,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className={cn("grain relative overflow-hidden border border-line", className)}>
      <Image
        src="/person/portrait--web.jpg"
        alt="Abhi, the engineer behind Pragya Labs, in a dark studio environment with cool blue rim light"
        width={1600}
        height={900}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
