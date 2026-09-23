"use client";

import { useEffect, useRef } from "react";
import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Portrait } from "@/components/person/Portrait";
import { Signature } from "@/components/person/Signature";
import { storyBeats } from "@/data/story";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

/**
 * CHAPTER 02 — ORIGIN. A cinematic progression through real events, not a
 * biography panel. The portrait is discovered, never presented: scroll opens
 * it from a slit to full frame while THEN → LEARNING → REAL WORK → NOW
 * passes beside it. Facts only — no dates, awards, or mythology invented.
 */
export function Origin() {
  const revealRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const scope = sectionRef.current;
    const frame = revealRef.current;
    if (!scope || !frame || reduced || !motionAllowed()) return;
    const tween = gsap.fromTo(
      frame,
      { clipPath: "inset(6% 36% 6% 36%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
        scrollTrigger: { trigger: scope, start: "top 75%", end: "bottom 65%", scrub: true },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  return (
    <SectionContainer index="02" eyebrow="Origin" id="origin" className="scroll-mt-20">
      <div ref={sectionRef}>
        <Reveal>
          <Display size="md" className="max-w-[14ch]">
            Every system has an origin.
          </Display>
        </Reveal>
        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div ref={revealRef} className="relative">
              <Portrait className="h-[54svh] lg:h-[68vh]" />
            </div>
            <div className="mt-3 flex items-center justify-between" aria-hidden="true">
              <Eyebrow className="text-faint">Discovered, not presented — keep scrolling</Eyebrow>
              <Eyebrow className="text-faint">Fig. 01</Eyebrow>
            </div>
          </div>
          <Stagger className="flex flex-col justify-between gap-10">
            <div className="space-y-0">
              {storyBeats.map((beat) => (
                <div key={beat.era} data-stagger-item className="border-t border-line py-7 last:border-b">
                  <Eyebrow className="text-cyan">{beat.era}</Eyebrow>
                  <h3 className="mt-3 font-display text-2xl uppercase leading-tight md:text-3xl">
                    {beat.title}
                  </h3>
                  {beat.lines.map((line) => (
                    <p key={line} className="mt-3 max-w-[52ch] leading-relaxed text-muted">
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <div data-stagger-item>
              <Eyebrow className="mb-2 text-faint">The mark</Eyebrow>
              <Signature className="max-w-[300px]" />
            </div>
          </Stagger>
        </div>
      </div>
    </SectionContainer>
  );
}
