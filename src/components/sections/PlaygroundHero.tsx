"use client";

import { useEffect, useRef } from "react";
import { PragyaCoreCanvas } from "@/components/3d/PragyaCoreCanvas";
import { Display, Eyebrow } from "@/components/typography/Type";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * PRAGYA CORE PLAYGROUND — Phase 1 technical prototype.
 * Validates: dark-matter backdrop, editorial type over 3D, pointer-reactive
 * object layer, scroll-aware motion architecture (a 0..1 progress ref shared
 * with the canvas via rAF-free ScrollTrigger updates).
 */
export function PlaygroundHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef({ current: 0 });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = sectionRef.current;
    if (!el || reduced || !motionAllowed()) {
      scrollRef.current.current = 0;
      return;
    }
    const st = gsap.to(scrollRef.current, {
      current: 1,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
    });
    return () => {
      st.scrollTrigger?.kill();
      st.kill();
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      aria-label="Pragya Core playground prototype"
      className="relative flex min-h-[100svh] flex-col overflow-clip"
    >
      {/* Object layer */}
      <div className="absolute inset-0" aria-hidden="true">
        <PragyaCoreCanvas scrollRef={scrollRef.current} className="h-full w-full" />
      </div>
      {/* Light falloff: keeps type legible, colors come from the object */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, transparent 40%, var(--pl-background) 92%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[var(--pl-container)] flex-1 flex-col justify-end px-[var(--pl-gutter)] pb-16 pt-28">
        <Eyebrow className="mb-6 text-cyan">Proto — 001 / Pragya Core Playground</Eyebrow>
        <Display as="h1" size="hero">
          Pragya
          <br />
          <span className="text-chrome">Labs</span>
        </Display>
        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[52ch] text-base leading-relaxed text-muted md:text-lg">
            Digital systems engineered with intelligence. Move the pointer — the core answers.
            Scroll — it descends. This is the technical prototype, not the final hero.
          </p>
          <dl className="meta grid grid-cols-2 gap-x-8 gap-y-2 text-faint">
            <div><dt className="inline">Obj&nbsp;</dt><dd className="inline text-muted">Core.R3F/01</dd></div>
            <div><dt className="inline">Motion&nbsp;</dt><dd className="inline text-muted">GSAP+ST/01</dd></div>
            <div><dt className="inline">Input&nbsp;</dt><dd className="inline text-muted">Pointer/Scroll</dd></div>
            <div><dt className="inline">State&nbsp;</dt><dd className="inline text-lime">Prototype</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
