"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { duration } from "@/config/tokens";
import { cn } from "@/lib/cn";

const WORDS = ["visualise", "create", "achieve"];

/**
 * WordMachine — the bridge between object and identity. Three verbs cycle
 * through a masked slot, each letter staggering in with blur and skew while
 * the last word burns out upward. Every change fires onBeat (the Beacon
 * flares in answer). Still text when motion is reduced.
 */
export function WordMachine({ onBeat }: { onBeat?: () => void }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [live, setLive] = useState(false);
  const beatRef = useRef(onBeat);
  beatRef.current = onBeat;

  useEffect(() => {
    registerMotion();
    if (prefersReducedMotion() || !motionAllowed()) return;
    setLive(true);
    const id = window.setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % WORDS.length;
        beatRef.current?.();
        return next;
      });
    }, 2400);
    const onVis = () => undefined;
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    registerMotion();
    const el = wrapRef.current;
    if (!el || !live || prefersReducedMotion() || !motionAllowed()) return;
    const chars = el.querySelectorAll("[data-word-char]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { yPercent: 115, opacity: 0, filter: "blur(6px)", skewY: 4 },
        {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          skewY: 0,
          duration: duration.slow,
          stagger: 0.028,
          ease: "expo.out",
          overwrite: "auto",
        }
      );
    }, wrapRef);
    return () => ctx.revert();
  }, [index, live]);

  if (!live) {
    return (
      <p className="font-display text-2xl uppercase tracking-wide md:text-3xl" aria-label="visualise. create. achieve.">
        visualise<span className="text-cyan">.</span> create<span className="text-cyan">.</span> achieve
        <span className="text-cyan">.</span>
      </p>
    );
  }

  const word = WORDS[index];
  return (
    <div
      ref={wrapRef}
      className={cn("overflow-hidden")}
      aria-live="off"
      aria-label={`visualise. create. achieve. — now showing ${word}`}
    >
      <p className="font-display uppercase leading-none tracking-wide text-[clamp(1.9rem,5.5vw,3.6rem)]">
        <span className="sr-only">{word}. </span>
        <span aria-hidden="true">
          {word.split("").map((ch, i) => (
            <span key={`${word}-${i}`} data-word-char className="inline-block will-change-transform">
              {ch}
            </span>
          ))}
          <span data-word-char className="inline-block text-cyan will-change-transform">
            .
          </span>
        </span>
      </p>
    </div>
  );
}
