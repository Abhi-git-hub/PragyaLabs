"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Display } from "@/components/typography/Type";
import { useDeviceCapability } from "@/hooks/use-device-capability";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { duration } from "@/config/tokens";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

/**
 * HERO — THE SIGNAL CHAMBER. A physical place where technology is
 * engineered: pipe architecture, an instrument console, a parabolic
 * antenna carrying the signal, one warm practical in the dark.
 * Camera approaches on load, answers the pointer, travels on scroll.
 * Typography belongs to the environment — no HUD, no dashboard.
 */
const Chamber = dynamic(
  () => import("@/components/3d/SignalChamber").then((m) => m.SignalChamberScene),
  { ssr: false, loading: () => null }
);

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const typeRef = useRef<HTMLDivElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);
  const scrollProgress = useRef({ current: 0 });
  const introProgress = useRef({ current: 0 });
  const [live, setLive] = useState(false);
  const capability = useDeviceCapability();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), {
      rootMargin: "300px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    registerMotion();
    const lines = typeRef.current?.querySelectorAll("[data-hero-line]");
    if (reduced || !motionAllowed()) {
      introProgress.current.current = 1;
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(introProgress.current, { current: 1, duration: duration.epic + 0.4 }, 0.15)
        .fromTo(
          lines ?? [],
          { yPercent: 112 },
          { yPercent: 0, duration: duration.cinematic, stagger: 0.12 },
          0.5
        )
        .fromTo(cueRef.current, { opacity: 0 }, { opacity: 1, duration: duration.base }, "-=0.4");
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

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
        yPercent: -18,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "75% top", scrub: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="arrival"
      aria-label="Pragya Labs — signal chamber"
      className="relative flex min-h-[100svh] flex-col overflow-clip bg-void"
    >
      <div className="absolute inset-0" aria-hidden="true">
        {live && capability.webgl ? (
          <Chamber
            scrollRef={scrollProgress.current}
            introRef={introProgress.current}
            quality={capability.tier}
          />
        ) : (
          <div className="h-full w-full [background:radial-gradient(ellipse_60%_50%_at_50%_42%,rgb(53_233_255/0.06),transparent_70%)]" />
        )}
      </div>
      {/* Legibility falloff + vignette — the frame holds together */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, rgb(6 6 8 / 0.55) 0%, rgb(6 6 8 / 0.12) 40%, rgb(6 6 8 / 0.28) 68%, var(--pl-background) 100%), radial-gradient(ellipse 90% 80% at 50% 45%, transparent 55%, rgb(6 6 8 / 0.55) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[var(--pl-container)] flex-1 flex-col justify-end px-[var(--pl-gutter)] pb-16 pt-28">
        <div ref={typeRef}>
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
          <Display as="p" size="sm" className="mt-6 max-w-[20ch]">
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
      </div>

      <div
        ref={cueRef}
        className="relative z-10 mx-auto flex w-full max-w-[var(--pl-container)] items-center gap-4 px-[var(--pl-gutter)] pb-8"
      >
        <div className="cue-line" aria-hidden="true" />
        <p className="meta text-faint">Scroll — the chamber responds</p>
      </div>
    </section>
  );
}
