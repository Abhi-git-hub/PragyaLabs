"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WordMachine } from "@/components/motion/WordMachine";
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
  const ruleRef = useRef<HTMLDivElement | null>(null);
  const machineRef = useRef<HTMLDivElement | null>(null);
  const scrollProgress = useRef({ current: 0 });
  const introProgress = useRef({ current: 0 });
  const beat = useRef(-1);
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
        // Character cascade — each letter rises with a whisper of rotation.
        .fromTo(
          "[data-hero-char]",
          { yPercent: 118, rotate: 5 },
          { yPercent: 0, rotate: 0, duration: duration.cinematic, stagger: 0.045 },
          0.45
        )
        .fromTo(
          lines ?? [],
          { yPercent: 112, filter: "blur(10px)" },
          { yPercent: 0, filter: "blur(0px)", duration: duration.cinematic, stagger: 0.16 },
          1.0
        )
        // Phosphor rule draws itself beneath the statement.
        .fromTo(
          ruleRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: duration.slow, ease: "expo.inOut" },
          "-=0.7"
        )
        .fromTo(cueRef.current, { opacity: 0 }, { opacity: 1, duration: duration.base }, "-=0.3");
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
      gsap.to(machineRef.current, {
        yPercent: -30,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "60% top", scrub: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="arrival"
      aria-label="Pragya Labs — signal chamber"
      className="theme-ink relative flex min-h-[100svh] flex-col overflow-clip bg-ink"
    >
      <div className="absolute inset-0" aria-hidden="true">
        {live && capability.webgl ? (
          <Chamber
            scrollRef={scrollProgress.current}
            introRef={introProgress.current}
            beatRef={beat}
            quality={capability.tier}
          />
        ) : (
          <div className="h-full w-full [background:radial-gradient(ellipse_60%_50%_at_50%_42%,rgb(61_255_162/0.06),transparent_70%)]" />
        )}
      </div>
      {/* Legibility falloff + vignette — the frame holds together */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, rgb(17 17 17 / 0.55) 0%, rgb(17 17 17 / 0.12) 40%, rgb(17 17 17 / 0.28) 68%, var(--pl-background) 100%), radial-gradient(ellipse 90% 80% at 50% 45%, transparent 55%, rgb(17 17 17 / 0.55) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[var(--pl-container)] flex-1 flex-col justify-end px-[var(--pl-gutter)] pb-16 pt-28">
        <div ref={typeRef}>
          <p className="meta text-faint">Pragya Labs — Intelligent systems, thoughtfully built.</p>
          <h1 className="mt-6 max-w-[20ch] font-display text-[clamp(2.2rem,5.5vw,4.5rem)] uppercase leading-[1.02]">
            <span className="mask-line">
              <span data-hero-line>Custom AI systems and</span>
            </span>
            <span className="mask-line">
              <span data-hero-line>web applications built</span>
            </span>
            <span className="mask-line">
              <span data-hero-line>around your real <span className="text-cyan">business data.</span></span>
            </span>
          </h1>
          <div
            ref={ruleRef}
            aria-hidden="true"
            className="mt-7 h-px w-40 origin-left bg-cyan"
          />
          <p className="mt-8 max-w-[58ch] text-base leading-relaxed text-muted md:text-lg">
            Pragya Labs designs and develops grounded AI workflows, RAG applications,
            custom web products, and interactive digital experiences for teams solving
            real-world problems.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/contact" data-cursor="OPEN" className="btn-primary">
              Discuss your project
            </Link>
            <Link href="/work" data-cursor="OPEN" className="btn-ghost">
              View case studies
            </Link>
          </div>
        </div>
      </div>

      {/* The bridge — offset right of the headline, clear breathing room.
          Static in flow on mobile, staged right-of-center on desktop. */}
      <div
        ref={machineRef}
        className="relative z-[5] mx-auto mt-10 w-full max-w-[var(--pl-container)] px-[var(--pl-gutter)] lg:absolute lg:left-[57%] lg:top-[38%] lg:mx-0 lg:mt-0 lg:w-auto lg:max-w-none lg:-translate-x-1/2 lg:-translate-y-1/2 lg:px-0"
      >
        <WordMachine
          onBeat={() => {
            if (beat.current < 0) beat.current = 0;
            beat.current = Math.min(1, beat.current + 0.85);
          }}
        />
      </div>

      <div
        ref={cueRef}
        className="relative z-10 mx-auto flex w-full max-w-[var(--pl-container)] items-center justify-between gap-4 px-[var(--pl-gutter)] pb-8"
      >
        <div className="flex items-center gap-4">
          <div className="cue-line" aria-hidden="true" />
          <p className="meta text-faint">Scroll — the chamber responds</p>
        </div>
        <p className="meta hidden text-faint sm:block">Delhi — India / 2026</p>
      </div>
    </section>
  );
}
