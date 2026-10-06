"use client";

import { useEffect, useRef } from "react";
import { ChapterHead } from "@/components/typography/ChapterHead";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

/**
 * METHOD — clarity before complexity. Four phases with a visible system
 * state, then a trust strip that claims nothing unverified.
 */
const PHASES = [
  {
    index: "01",
    name: "Understand",
    body: "Map people, workflows, data, constraints, and the outcome that matters.",
    state: "Raw context",
  },
  {
    index: "02",
    name: "Design",
    body: "Define the system architecture, interface logic, technical approach, and evaluation plan.",
    state: "Modelled flow",
  },
  {
    index: "03",
    name: "Build",
    body: "Create, test, integrate, and refine with performance and maintainability in mind.",
    state: "Working product",
  },
  {
    index: "04",
    name: "Improve",
    body: "Measure use, find friction, and evolve the system responsibly.",
    state: "Learning system",
  },
];

const TRUST = ["Clear scope", "Direct technical leadership", "Production-minded build", "Evidence-led iteration"];

export function Method() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = wrapRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      // Spine draws down the list while each phase ignites in turn.
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 65%", scrub: 0.6 },
      })
        .fromTo("[data-method-spine]", { scaleY: 0 }, { scaleY: 1, duration: 2 }, 0)
        .fromTo(
          "[data-method-row]",
          { opacity: 0.25, x: -18 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.5 },
          0.1
        )
        .fromTo("[data-method-state]", { color: "rgb(115 123 120)" }, { color: "rgb(61 255 162)", duration: 0.4, stagger: 0.5 }, 0.3);
    }, wrapRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={wrapRef}>
    <SectionContainer id="method" className="scroll-mt-20">
      <ChapterHead
        index="04"
        eyebrow="How the system takes shape"
        title="Clarity before complexity."
        lede="We begin with the real environment: your users, data, constraints, existing systems, and the decision a new product needs to improve."
      />
      <div className="relative mt-12">
        <div aria-hidden="true" className="absolute bottom-2 left-0 top-2 w-px bg-line">
          <div data-method-spine className="h-full w-px origin-top bg-cyan" />
        </div>
      <div className="space-y-0 pl-6 md:pl-10">
        {PHASES.map((p) => (
          <div
            key={p.index}
            data-method-row
            className="grid gap-2 border-t border-line py-8 last:border-b md:grid-cols-[88px_240px_1fr_auto] md:items-baseline md:gap-8"
          >
            <span className="meta text-cyan" aria-hidden="true">
              {p.index}
            </span>
            <h3 className="font-display text-2xl font-semibold uppercase md:text-3xl">{p.name}</h3>
            <p className="max-w-[58ch] leading-relaxed text-muted">{p.body}</p>
            <p className="meta text-faint md:text-right">
              System state — <span data-method-state className="text-bone">{p.state}</span>
            </p>
          </div>
        ))}
      </div>
      </div>
      <Reveal>
        <ul className="glass-signal mt-10 flex flex-wrap gap-x-8 gap-y-3 px-6 py-5">
          {TRUST.map((t) => (
            <li key={t} className="meta text-muted">
              <span aria-hidden="true" className="mr-2 text-success">●</span>
              {t}
            </li>
          ))}
        </ul>
      </Reveal>
    </SectionContainer>
    </div>
  );
}
