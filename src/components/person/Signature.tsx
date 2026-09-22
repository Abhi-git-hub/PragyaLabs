"use client";

import { useEffect, useRef } from "react";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { duration } from "@/config/tokens";
import { cn } from "@/lib/cn";

/**
 * The mark — approved handwritten signature, cropped from the portrait
 * artwork. Black drops out via screen blend; on scroll-enter it emerges
 * with a slow light pass. Never a logo, never everywhere: story, about,
 * and the loop only.
 */
export function Signature({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const passRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = wrapRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: duration.slow, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      gsap.fromTo(
        passRef.current,
        { xPercent: -120 },
        { xPercent: 120, duration: duration.epic, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 80%", once: true } }
      );
    }, wrapRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={wrapRef} className={cn("relative overflow-hidden", className)} role="img" aria-label="Abhi's handwritten signature">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/person/signature--detail.jpg"
        alt=""
        loading="lazy"
        className="block w-full mix-blend-screen"
      />
      <div
        ref={passRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-1/3 [background:linear-gradient(100deg,transparent,rgb(53_233_255/0.14),transparent)]"
      />
    </div>
  );
}
