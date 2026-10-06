"use client";

import { useEffect, useRef } from "react";
import { ChapterHead } from "@/components/typography/ChapterHead";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

const WORDS = ["Concept", "Design", "Development", "Authentication", "Security", "Deployment"];
const STAGES = ["Discovery", "Architecture", "Interface", "Data", "Auth", "Deployment", "Iteration"];

/**
 * ENGINEERING WALL — from first signal to production system. One word
 * occupies the frame at a time, each locking into the grid, while a
 * signal line traverses the full chain below. Scrub-linked, unpinned.
 */
export function EngineeringWall() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = wrapRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 60%", scrub: 0.6 },
      })
        .fromTo("[data-wall-word]", { opacity: 0.14 }, { opacity: 1, duration: 0.4, stagger: 0.6 }, 0)
        .fromTo("[data-wall-line]", { scaleX: 0 }, { scaleX: 1, duration: 2.4 }, 0)
        .fromTo("[data-wall-stage]", { opacity: 0.25 }, { opacity: 1, duration: 0.3, stagger: 0.34 }, 0.2);
    }, wrapRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={wrapRef}>
      <SectionContainer id="engineering">
        <ChapterHead
          index="06"
          eyebrow="Full-stack proof"
          title="From first signal to production system."
          lede="One engineer owns the chain — from the first model of the problem to the interface, authentication, deployment, and iteration."
        />
        <div className="glass-signal mt-12 px-6 py-10 text-center md:px-10" aria-label="Engineering disciplines in sequence">
          {WORDS.map((w) => (
            <p key={w} data-wall-word className="font-display text-[clamp(2rem,6vw,4.5rem)] font-semibold leading-[1.05]">
              {w}
              <span aria-hidden="true" className="text-cyan">.</span>
            </p>
          ))}
        </div>
        <div className="mt-10" aria-label="Delivery chain">
          <div className="h-px w-full bg-line" aria-hidden="true">
            <div data-wall-line className="h-px w-full origin-left bg-cyan" />
          </div>
          <ol className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-center">
            {STAGES.map((s) => (
              <li key={s} data-wall-stage className="meta text-muted">
                {s}
              </li>
            ))}
          </ol>
        </div>
      </SectionContainer>
    </div>
  );
}
