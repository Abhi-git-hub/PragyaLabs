"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const ghostRef = useRef<HTMLParagraphElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);
  const ruleRef = useRef<HTMLDivElement | null>(null);
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
      // Ghost word drifts at a fraction of scroll — data drift, 3%.
      gsap.to(ghostRef.current, {
        yPercent: 34,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
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
      {/* Ambient atmosphere — two slow orbs, transform-only, aria-hidden */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="orb orb-cyan left-[8%] top-[18%] h-[420px] w-[420px]" />
        <div className="orb orb-violet right-[4%] top-[42%] h-[520px] w-[520px]" />
      </div>
      <div className="absolute inset-0" aria-hidden="true">
        {live && capability.webgl ? (
          <Chamber
            scrollRef={scrollProgress.current}
            introRef={introProgress.current}
            beatRef={beat}
            quality={capability.tier}
          />
        ) : (
          <div className="h-full w-full [background:radial-gradient(ellipse_60%_50%_at_50%_42%,rgb(40_215_254/0.07),transparent_70%)]" />
        )}
      </div>
      {/* Legibility falloff + vignette — the frame holds together */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, rgb(9 13 26 / 0.55) 0%, rgb(9 13 26 / 0.12) 40%, rgb(9 13 26 / 0.28) 68%, var(--pl-background) 100%), radial-gradient(ellipse 90% 80% at 50% 45%, transparent 55%, rgb(9 13 26 / 0.55) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[var(--pl-container)] flex-1 flex-col justify-end px-[var(--pl-gutter)] pb-16 pt-28">
        <div ref={typeRef}>
          <p className="meta text-faint">Pragya Labs / Digital systems studio / Delhi, India</p>
          <div className="relative">
            <p
              ref={ghostRef}
              aria-hidden="true"
              className="display-ghost pointer-events-none absolute -top-[1.1em] left-0 select-none font-display text-[clamp(4.5rem,10vw,11rem)] font-bold leading-none"
            >
              Useful
            </p>
            <h1 className="relative mt-6 max-w-[16ch] font-display text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[1.04] tracking-[-0.01em]">
            <span className="mask-line">
              <span data-hero-line>Complex systems,</span>
            </span>
            <span className="mask-line">
              <span data-hero-line>
                made <span className="text-cyan">useful.</span>
              </span>
            </span>
          </h1>
          </div>
          <div
            ref={ruleRef}
            aria-hidden="true"
            className="mt-7 h-px w-40 origin-left bg-cyan"
          />
          <p className="mt-8 max-w-[58ch] text-base leading-relaxed text-muted md:text-lg">
            Pragya Labs builds grounded AI systems, web applications, and interactive
            digital experiences around the way your data, workflows, and people
            actually work.
          </p>
          <p className="meta mt-4 text-faint">Built for real use—not just impressive demos.</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/contact" data-cursor="OPEN" className="btn-primary">
              Start a project
            </Link>
            <Link href="/work" data-cursor="OPEN" className="btn-ghost">
              Explore selected work
            </Link>
          </div>
          <p className="meta mt-5 text-faint">
            Tell us what is complex. We will help define what is worth building.
          </p>
        </div>
      </div>

      {/* System state — glass readout of the chamber's three states.
          Decorative; the H1 above carries all meaning. */}
      <ChamberState sectionRef={sectionRef} />

      {/* Scroll cue — quiet, low, out of the copy's way. */}
      <div
        ref={cueRef}
        className="relative z-10 mx-auto flex w-full max-w-[var(--pl-container)] items-center justify-between gap-4 px-[var(--pl-gutter)] pb-8"
      >
        <div className="flex items-center gap-4">
          <div className="cue-line" aria-hidden="true" />
          <p className="meta text-faint">Scroll to transform</p>
        </div>
        <p className="meta hidden text-faint sm:block">Seed → Knot → Signal</p>
      </div>
    </section>
  );
}

/** Chamber state readout — FRAGMENT → STRUCTURE → SIGNAL with scroll. */
function ChamberState({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        setPhase(p < 0.45 ? 0 : p < 0.8 ? 1 : 2);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [sectionRef]);

  const states = ["Fragment", "Structure", "Signal"] as const;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute bottom-24 right-[var(--pl-gutter)] z-10 hidden md:block">
      <div className="glass-deep px-5 py-4">
        <p className="meta text-faint">
          State — <span className="text-cyan">{states[phase]}</span>
        </p>
        <p className="meta mt-2 text-faint">Input — Data / Workflow / People</p>
        <p className="meta mt-2 text-faint">Output — Useful system</p>
      </div>
    </div>
  );
}
