"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

/**
 * STATEMENT — the belief, set spatially. A pinned scroll world where four
 * words ignite in sequence while orbital objects drift past and the room
 * travels obsidian → deep green → graphite. Scrubbed both directions:
 * scroll up undoes every reveal. Our own words, Lusion's mechanic.
 */
const WORDS = ["BOLD", "IDEAS,", "COME TO", "LIFE."];

export function Statement() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = wrapRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6, pin: ".statement-stage" },
      });
      // Room travels with the words.
      tl.fromTo(
        ".statement-stage",
        { backgroundColor: "rgb(5,6,8)" },
        { backgroundColor: "rgb(7,17,14)", duration: 1 },
        0
      );
      tl.to(".statement-stage", { backgroundColor: "rgb(11,15,18)", duration: 1 }, 1);
      // Words ignite letter by letter — the word lands whole first (order
      // guaranteed), then letters settle. LIFE. stays one solid gradient
      // word: per-letter filters break background-clip rendering in Chrome.
      WORDS.forEach((_, i) => {
        const at = 0.15 + i * 0.42;
        tl.fromTo(
          `[data-state-word="${i}"]`,
          { opacity: 0 },
          { opacity: 1, duration: 0.1 },
          at
        );
        if (WORDS[i] !== "LIFE.") {
          tl.fromTo(
            `[data-state-char="${i}"]`,
            { y: 46, rotate: 3, filter: "blur(8px)" },
            { y: 0, rotate: 0, filter: "blur(0px)", duration: 0.38, stagger: 0.022 },
            at + 0.02
          );
        }
        tl.fromTo(
          `[data-state-word="${i}"]`,
          { letterSpacing: "0.14em" },
          { letterSpacing: "0.01em", duration: 0.35 },
          at
        );
        if (WORDS[i] !== "LIFE.") {
          tl.fromTo(
            `[data-state-word="${i}"]`,
            { textShadow: "0 0 0px rgb(61 255 162 / 0)" },
            { textShadow: "0 0 30px rgb(61 255 162 / 0.5)", duration: 0.35 },
            at
          );
          tl.to(
            `[data-state-word="${i}"]`,
            { textShadow: "0 0 6px rgb(61 255 162 / 0.12)", duration: 0.4 },
            at + 0.35
          );
        }
      });
      // Ghost echo drifts against the scroll — the words leave light behind.
      tl.fromTo(".statement-echo", { yPercent: -14 }, { yPercent: 14, duration: 2 }, 0);
      // Orbital objects drift through at different depths.
      tl.fromTo(".statement-orbit-a", { yPercent: 18, rotate: -8 }, { yPercent: -18, rotate: 8, duration: 2 }, 0);
      tl.fromTo(".statement-orbit-b", { yPercent: 26, rotate: 10 }, { yPercent: -26, rotate: -10, duration: 2 }, 0);
      // Blue-metal accent breathes behind the words — the controlled accent beat.
      tl.fromTo(".statement-metal", { yPercent: 12, opacity: 0.1 }, { yPercent: -12, opacity: 0.2, duration: 2 }, 0);
    }, wrapRef);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <section aria-label="Statement" className="mx-auto w-full max-w-[var(--pl-container)] px-[var(--pl-gutter)] py-[var(--pl-section-y)]">
        <p className="meta text-faint">What we believe</p>
        <h2 className="mt-4 font-display text-4xl uppercase leading-tight md:text-6xl">
          Bold ideas, <span className="text-cyan">come to life</span>.
        </h2>
        <p className="mt-6 max-w-[62ch] leading-relaxed text-muted">
          We combine design, motion, 3D and development to create immersive web experiences.
        </p>
      </section>
    );
  }

  return (
    <section ref={wrapRef} aria-label="Statement" className="relative h-[260vh]">
      <div className="statement-stage relative flex h-[100svh] flex-col overflow-hidden">
        {/* Blue-metal accent — cool painted surface behind the belief */}
        <div aria-hidden="true" className="statement-metal pointer-events-none absolute inset-0 opacity-10">
          <Image
            src="/textures/bluemetal--web.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{
              maskImage: "radial-gradient(ellipse 70% 60% at 30% 50%, black 20%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 30% 50%, black 20%, transparent 75%)",
            }}
          />
        </div>
        {/* Orbital objects — symmetric, drifting, depth-sorted */}
        <div
          aria-hidden="true"
          className="statement-orbit-a pointer-events-none absolute -right-40 top-1/2 aspect-square w-[560px] max-w-none -translate-y-1/2 rounded-full border border-cyan/20"
        >
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan [box-shadow:var(--pl-glow-cyan)]" />
        </div>
        <div
          aria-hidden="true"
          className="statement-orbit-b pointer-events-none absolute -right-24 top-1/2 aspect-square w-[340px] max-w-none -translate-y-1/2 rounded-full border border-line-strong"
        >
          <span className="absolute left-0 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone" />
        </div>
        <div className="relative z-10 mx-auto grid w-full max-w-[var(--pl-container)] flex-1 items-center gap-10 px-[var(--pl-gutter)] lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="meta text-faint">What we believe</p>
            <p className="mt-6 max-w-[46ch] leading-relaxed text-muted md:text-lg">
              We combine design, motion, 3D and development to create immersive web experiences.
            </p>
            <Link
              href="/work"
              data-cursor="OPEN"
              className="meta mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
            >
              See the proof →
            </Link>
          </div>
          <div className="relative">
            {/* Ghost echo — outlined afterimage drifting against the words */}
            <div
              aria-hidden="true"
              className="statement-echo pointer-events-none absolute inset-0 select-none font-display uppercase leading-[0.95] text-transparent"
              style={{ fontSize: "clamp(3rem,9vw,7.5rem)", WebkitTextStroke: "1px rgb(61 255 162 / 0.22)" }}
            >
              {WORDS.map((w) => (
                <span key={w} className="block">
                  {w}
                </span>
              ))}
            </div>
            <h2 className="font-display relative uppercase leading-[0.95]">
              {WORDS.map((w, i) =>
                w === "LIFE." ? (
                  <span key={w} className="block overflow-hidden pb-1">
                    <span
                      data-state-word={i}
                      className="block will-change-transform"
                      style={{
                        fontSize: "clamp(3rem,9vw,7.5rem)",
                        backgroundImage: "linear-gradient(100deg, #3DFFA2 10%, #C9FFF0 45%, #3DFFA2 90%)",
                        backgroundSize: "220% 100%",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {w}
                    </span>
                  </span>
                ) : (
                  <span key={w} className="block overflow-hidden pb-1">
                    <span
                      data-state-word={i}
                      className="block will-change-transform"
                      style={{ fontSize: "clamp(3rem,9vw,7.5rem)", color: "var(--pl-foreground)" }}
                    >
                      {w.split("").map((ch, j) => (
                        <span key={j} data-state-char={i} className="inline-block will-change-transform">
                          {ch === " " ? " " : ch}
                        </span>
                      ))}
                    </span>
                  </span>
                )
              )}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
