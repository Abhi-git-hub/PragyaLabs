"use client";

import { useEffect, useRef, useState } from "react";
import { PragyaCoreCanvas } from "@/components/3d/PragyaCoreCanvas";
import { EnvironmentLayer } from "@/components/motion/EnvironmentLayer";
import { Display, Eyebrow } from "@/components/typography/Type";
import { useDeviceCapability } from "@/hooks/use-device-capability";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { duration } from "@/config/tokens";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

/**
 * SCENE 01 — ARRIVAL. The placeholder hero is now the real hero.
 * Layered load: environment → core materializes → typography reveals →
 * metadata → scroll cue → interactive. Pointer tilts the core and drags its
 * lights; scroll descends the core while the type lifts away.
 */
export function HeroArrival() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const envRef = useRef<HTMLDivElement | null>(null);
  const typeRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const metaRef = useRef<HTMLDivElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);
  const scrollProgress = useRef({ current: 0 });
  const introProgress = useRef({ current: 0 });
  const surge = useRef({ current: 0 });
  const [canvasLive, setCanvasLive] = useState(false);
  const capability = useDeviceCapability();
  const reduced = usePrefersReducedMotion();

  // Intersection-aware 3D: the canvas exists only while the hero is near.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setCanvasLive(entry.isIntersecting), {
      rootMargin: "300px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Layered load choreography.
  useEffect(() => {
    registerMotion();
    const lines = typeRef.current?.querySelectorAll("[data-hero-line]");
    if (reduced || !motionAllowed()) {
      if (introProgress.current) introProgress.current.current = 1;
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(envRef.current, { opacity: 0 }, { opacity: 1, duration: duration.cinematic })
        .to(introProgress.current, { current: 1, duration: duration.epic, ease: "expo.out" }, "-=0.7")
        .fromTo(
          lines ?? [],
          { yPercent: 112 },
          { yPercent: 0, duration: duration.cinematic, stagger: 0.11 },
          "-=1.35"
        )
        .fromTo(
          panelRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: duration.slow },
          "-=0.9"
        )
        .fromTo(
          metaRef.current,
          { opacity: 0 },
          { opacity: 1, duration: duration.base },
          "-=0.5"
        )
        .fromTo(
          cueRef.current,
          { opacity: 0 },
          { opacity: 1, duration: duration.base },
          "-=0.3"
        );
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  // Scroll choreography: core descends, type lifts, panel drifts.
  useEffect(() => {
    registerMotion();
    const el = sectionRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      gsap.to(scrollProgress.current, {
        current: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(typeRef.current, {
        yPercent: -22,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "70% top", scrub: true },
      });
      gsap.to(panelRef.current, {
        y: -70,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  const showCanvas = canvasLive && capability.webgl;

  return (
    <section
      ref={sectionRef}
      id="arrival"
      aria-label="Arrival — Pragya Labs hero"
      className="relative flex min-h-[100svh] flex-col overflow-clip"
    >
      <div ref={envRef} className="absolute inset-0">
        <EnvironmentLayer capability={capability} trigger={sectionRef} />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[var(--pl-container)] flex-1 gap-10 px-[var(--pl-gutter)] pb-14 pt-24 md:pt-28 lg:grid-cols-12 lg:gap-8">
        {/* Typography field */}
        <div ref={typeRef} className="flex flex-col justify-end lg:col-span-7">
          <div className="mb-6 flex items-center justify-between gap-4 md:mb-8">
            <Eyebrow className="text-cyan">SYS.ONLINE — Arrival / 01</Eyebrow>
            <Eyebrow className="hidden text-faint sm:block">Delhi — India / 2026</Eyebrow>
          </div>
          <h1 className="font-display uppercase leading-[0.92]">
            <span className="mask-line">
              <span data-hero-line className="text-[clamp(3.8rem,13vw,11rem)]">
                Pragya
              </span>
            </span>
            <span className="mask-line">
              <span data-hero-line className="text-chrome text-[clamp(3.8rem,13vw,11rem)]">
                Labs
              </span>
            </span>
          </h1>
          <div className="mt-6 md:mt-8">
            <Display as="p" size="sm" className="max-w-[16ch]">
              <span className="mask-line">
                <span data-hero-line>Digital systems</span>
              </span>
              <span className="mask-line">
                <span data-hero-line>engineered with</span>
              </span>
              <span className="mask-line">
                <span data-hero-line>
                  intelligence<span className="text-cyan">.</span>
                </span>
              </span>
            </Display>
          </div>
          <div ref={metaRef} className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
            <p className="meta text-faint">Creative engineering</p>
            <p className="meta text-faint">AI / Web / Interaction</p>
            <p className="meta text-lime">Interactive — move / scroll</p>
          </div>
        </div>

        {/* Interactive visual field — press it: the core answers with light */}
        <div ref={panelRef} className="relative lg:col-span-5">
          <div
            className="relative h-[54svh] border border-line bg-void/40 backdrop-blur-[2px] lg:h-full lg:min-h-[62svh]"
            onPointerDown={() => {
              surge.current.current = 1;
            }}
          >
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3">
              <span className="meta text-faint">OBJ—CORE/02</span>
              <span className="meta flex items-center gap-2 text-faint">
                <span className="inline-block size-1.5 rounded-full bg-lime" aria-hidden="true" />
                Live
              </span>
            </div>
            {showCanvas ? (
              <PragyaCoreCanvas
                scrollRef={scrollProgress.current}
                introRef={introProgress.current}
                surgeRef={surge.current}
                quality={capability.tier}
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
                <div className="size-48 rounded-full border border-line opacity-60 [background:radial-gradient(circle_at_50%_40%,rgb(53_233_255/0.14),transparent_65%)]" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-4 py-3">
              <span className="meta text-faint">Pointer → tilt / Press → surge</span>
              <span className="meta hidden text-faint sm:block">Scroll → descent</span>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={cueRef}
        className="relative z-10 mx-auto flex w-full max-w-[var(--pl-container)] items-center gap-4 px-[var(--pl-gutter)] pb-8"
      >
        <div className="cue-line" aria-hidden="true" />
        <p className="meta text-faint">Scroll to explore</p>
      </div>
    </section>
  );
}
