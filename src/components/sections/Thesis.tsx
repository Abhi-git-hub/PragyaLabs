"use client";

import { useEffect, useRef } from "react";
import { Eyebrow } from "@/components/typography/Type";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

/**
 * SCENE 02 — THE THESIS. Pinned scroll system in four phases:
 * CODE (geometric structures) → DESIGN (fluid forms) →
 * INTELLIGENCE (network sweep) → convergence (CODE × DESIGN × INTELLIGENCE).
 * Reduced motion → the same words, statically stacked, no pin.
 */
export function Thesis() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const codeRef = useRef<HTMLDivElement | null>(null);
  const designRef = useRef<HTMLDivElement | null>(null);
  const intelRef = useRef<HTMLDivElement | null>(null);
  const finaleRef = useRef<HTMLDivElement | null>(null);
  const intelWordRef = useRef<HTMLSpanElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = sectionRef.current;
    if (!el || reduced || !motionAllowed()) return;

    const ctx = gsap.context(() => {
      gsap.set([designRef.current, intelRef.current, finaleRef.current], { opacity: 0 });
      gsap.set(codeRef.current, { opacity: 1 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=320%",
          scrub: 0.6,
          pin: true,
        },
      });

      // Phase 1 — CODE: geometric construction (clip + tracking + grid).
      tl.fromTo(
        "[data-code-line]",
        { clipPath: "inset(0 100% 0 0)", letterSpacing: "0.32em" },
        { clipPath: "inset(0 0% 0 0)", letterSpacing: "0.01em", duration: 1 },
        0
      )
        .fromTo(gridRef.current, { opacity: 0 }, { opacity: 0.5, duration: 1 }, 0)
        // Phase 2 — DESIGN: CODE lifts out, DESIGN flows in (blur + rise).
        .to(codeRef.current, { opacity: 0, y: -90, duration: 0.6 }, 1)
        .to(gridRef.current, { opacity: 0, duration: 0.6 }, 1)
        .fromTo(
          designRef.current,
          { opacity: 0, y: 90, filter: "blur(16px)", scaleY: 1.25 },
          { opacity: 1, y: 0, filter: "blur(0px)", scaleY: 1, duration: 1 },
          1.15
        )
        // Phase 3 — INTELLIGENCE: DESIGN dissolves, network sweep arrives.
        .to(designRef.current, { opacity: 0, y: -90, filter: "blur(12px)", duration: 0.6 }, 2.3)
        .fromTo(
          intelRef.current,
          { opacity: 0, y: 90 },
          { opacity: 1, y: 0, duration: 1 },
          2.45
        )
        .fromTo(
          intelWordRef.current,
          { backgroundPosition: "120% 0" },
          { backgroundPosition: "0% 0", duration: 1 },
          2.45
        )
        // Phase 4 — convergence: all three fuse into one line.
        .to(intelRef.current, { opacity: 0, scale: 0.92, duration: 0.5 }, 3.5)
        .fromTo(
          finaleRef.current,
          { opacity: 0, scale: 0.94, y: 40 },
          { opacity: 1, scale: 1, y: 0, duration: 0.8 },
          3.65
        );
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <section aria-label="The thesis" className="rule mx-auto w-full max-w-[var(--pl-container)] px-[var(--pl-gutter)] py-[var(--pl-section-y)]">
        <Eyebrow className="mb-8 text-cyan">ACT—02 / The thesis</Eyebrow>
        {["Code — geometric structures", "Design — fluid forms", "Intelligence — network systems"].map(
          (line) => (
            <p key={line} className="font-display text-[clamp(2.5rem,8vw,6rem)] uppercase leading-[1.02]">
              {line}
            </p>
          )
        )}
        <p className="mt-8 font-display text-[clamp(1.5rem,4vw,2.5rem)] uppercase">
          Code <span className="text-cyan">×</span> Design <span className="text-cyan">×</span> Intelligence
        </p>
      </section>
    );
  }

  return (
    <section ref={sectionRef} aria-label="The thesis" className="relative overflow-clip">
      <div className="relative flex h-[100svh] flex-col">
        <div className="mx-auto flex w-full max-w-[var(--pl-container)] items-center justify-between px-[var(--pl-gutter)] pt-24">
          <Eyebrow className="text-cyan">ACT—02 / The thesis</Eyebrow>
          <Eyebrow className="text-faint">Scroll — the words converge</Eyebrow>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          {/* Geometric scaffold for CODE */}
          <div
            ref={gridRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0"
            style={{
              backgroundImage:
                "linear-gradient(rgb(53 233 255 / 0.10) 1px, transparent 1px), linear-gradient(90deg, rgb(53 233 255 / 0.10) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 30%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 60% 60% at 50% 50%, black 30%, transparent 75%)",
            }}
          />

          <div ref={codeRef} className="absolute px-[var(--pl-gutter)] text-center">
            <p data-code-line className="font-display text-[clamp(3.2rem,11vw,9rem)] uppercase leading-none">
              Code
            </p>
            <Eyebrow className="mt-4 text-faint">Geometric structures</Eyebrow>
          </div>

          <div ref={designRef} className="absolute px-[var(--pl-gutter)] text-center opacity-0">
            <p className="font-display text-[clamp(3.2rem,11vw,9rem)] uppercase leading-none">
              Design
            </p>
            <Eyebrow className="mt-4 text-faint">Fluid forms</Eyebrow>
          </div>

          <div ref={intelRef} className="absolute px-[var(--pl-gutter)] text-center opacity-0">
            <span
              ref={intelWordRef}
              className="font-display text-[clamp(2.4rem,8vw,7rem)] uppercase leading-none text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(100deg, #35e9ff 10%, #4d7cff 40%, #8b5cff 65%, #f4f3ec 95%)",
                backgroundSize: "220% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
              }}
            >
              Intelligence
            </span>
            <Eyebrow className="mt-4 text-faint">Network / particle system</Eyebrow>
          </div>

          <div ref={finaleRef} className="absolute px-[var(--pl-gutter)] text-center opacity-0">
            <p className="font-display text-[clamp(1.8rem,5.5vw,4.5rem)] uppercase leading-tight">
              Code <span className="text-cyan">×</span> Design{" "}
              <span className="text-cyan">×</span> Intelligence
            </p>
            <p className="mx-auto mt-6 max-w-[52ch] text-base leading-relaxed text-muted md:text-lg">
              The website itself is the interaction system.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
