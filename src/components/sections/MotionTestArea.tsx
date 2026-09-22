"use client";

import { useRef, useState } from "react";
import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { duration } from "@/config/tokens";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

/**
 * Motion test area: exercises MICRO + INTERFACE tokens live.
 * Signature scroll choreography arrives with the acts in Phase 2.
 */
export function MotionTestArea() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [pulses, setPulses] = useState(0);
  const reduced = usePrefersReducedMotion();

  const fire = () => {
    registerMotion();
    setPulses((n) => n + 1);
    const el = boxRef.current;
    if (!el || reduced || !motionAllowed()) return;
    gsap.fromTo(
      el,
      { x: 0, scale: 1 },
      {
        keyframes: [
          { x: 48, scale: 1.06, duration: duration.base, ease: "expo.out" },
          { x: 0, scale: 1, duration: duration.slow, ease: "expo.out" },
        ],
      }
    );
  };

  return (
    <SectionContainer index="F—03" eyebrow="Motion test area">
      <Reveal>
        <Display size="sm" className="max-w-[20ch]">
          Motion communicates progression.
        </Display>
        <p className="meta mt-4 text-faint">
          {reduced ? "Reduced motion detected — tweens disabled, states instant." : "Full motion enabled — 350ms base / expo.out."}
        </p>
      </Reveal>

      <div className="mt-10 grid gap-px bg-line md:grid-cols-3" role="list" aria-label="Motion token tests">
        <div role="listitem" className="bg-void p-6">
          <Eyebrow className="mb-2 text-cyan">Micro — 120ms</Eyebrow>
          <button
            type="button"
            onClick={fire}
            className="meta mt-4 border border-line-strong px-5 py-3 text-bone transition-all duration-[120ms] hover:-translate-y-0.5 hover:border-cyan hover:text-cyan active:translate-y-0"
          >
            Fire base tween
          </button>
          <p className="meta mt-3 text-faint">Fired × {pulses}</p>
        </div>
        <div role="listitem" className="flex min-h-44 items-center overflow-hidden bg-void p-6">
          <div
            ref={boxRef}
            aria-hidden="true"
            className="size-14 border border-cyan [box-shadow:var(--pl-glow-cyan)]"
          />
        </div>
        <div role="listitem" className="bg-void p-6">
          <Eyebrow className="mb-2 text-ultra">Interface — 350ms</Eyebrow>
          <div className="group mt-4 inline-block cursor-pointer" data-cursor="EXPLORE">
            <span className="meta text-bone">Hover field</span>
            <span className="mt-2 block h-px w-full origin-left scale-x-100 bg-line-strong transition-transform duration-300 group-hover:scale-x-50 group-hover:bg-lime" />
          </div>
          <p className="meta mt-3 text-faint">Underline collapse → lime</p>
        </div>
      </div>
    </SectionContainer>
  );
}
