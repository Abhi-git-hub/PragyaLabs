"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

/**
 * ChapterHead — the shared opening composition for major chapters.
 * Mono chapter marker, editorial heading, hairline rule.
 * Desktop only: the whole head drifts gently against scroll (parallax),
 * so chapters feel suspended in depth rather than glued to the page.
 */
export function ChapterHead({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title?: ReactNode;
  lede?: ReactNode;
}) {
  const headRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = headRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      gsap.fromTo(
        el,
        { y: 36 },
        {
          y: -36,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <div className="relative" ref={headRef}>
      <Reveal>
        <p className="meta text-faint">{eyebrow}</p>
        {title && (
          <Display size="md" className="mt-5 max-w-[20ch]">
            {title}
          </Display>
        )}
        {lede && (
          <div className="mt-6 max-w-[58ch] text-base leading-relaxed text-muted md:text-lg">
            {lede}
          </div>
        )}
        <div aria-hidden="true" className="mt-8 h-px w-24 bg-line-strong" />
      </Reveal>
    </div>
  );
}
