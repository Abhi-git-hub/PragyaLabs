"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useDeviceCapability } from "@/hooks/use-device-capability";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

const Engine = dynamic(() => import("@/components/3d/Metamorphosis").then((m) => m.MetamorphosisScene), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-void" aria-hidden="true" />,
});

const STATIONS = [
  { word: "Form", line: "A precise seed. Sixteen hundred decisions, none random." },
  { word: "Energy", line: "Hover it — matter answers touch with light." },
  { word: "Signal", line: "The system unwinds upward and becomes the message." },
];

/**
 * METAMORPHOSIS — pinned guided scroll directly after the hero.
 * One procedural system in three states, hover-reactive throughout,
 * traveling obsidian → deep green as scroll advances. FORM → ENERGY → SIGNAL.
 */
export function Metamorphosis() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const progress = useRef(0);
  const [live, setLive] = useState(false);
  const capability = useDeviceCapability();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), {
      rootMargin: "400px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    registerMotion();
    const el = wrapRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const tween = gsap.to(progress, {
      current: 1,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section aria-label="Metamorphosis" className="mx-auto w-full max-w-[var(--pl-container)] px-[var(--pl-gutter)] py-[var(--pl-section-y)]">
        <p className="meta text-faint">Form → energy → signal</p>
        <ol className="mt-8 space-y-8">
          {STATIONS.map((s, i) => (
            <li key={s.word}>
              <p className="meta text-cyan">0{i + 1}</p>
              <h2 className="mt-2 font-display text-3xl uppercase">{s.word}</h2>
              <p className="mt-2 max-w-[52ch] text-muted">{s.line}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section ref={wrapRef} aria-label="Metamorphosis — procedural craft engine" className="relative h-[320vh]">
      <span className="sr-only">
        A procedural WebGL system in three states: precise seed, energy knot, rising signal helix.
      </span>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          {live && capability.webgl ? (
            <Engine progress={progress} quality={capability.tier} />
          ) : (
            <div className="h-full w-full bg-void" />
          )}
        </div>
      </div>
    </section>
  );
}
