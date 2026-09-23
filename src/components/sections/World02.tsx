"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useDeviceCapability } from "@/hooks/use-device-capability";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { cn } from "@/lib/cn";

const Engine = dynamic(() => import("@/components/3d/CraftEngine").then((m) => m.CraftEngineScene), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-void" aria-hidden="true" />,
});

const STATIONS = [
  { word: "Structure", line: "Sixteen hundred nodes. Nothing random." },
  { word: "Disturbance", line: "Move — the field answers every displacement." },
  { word: "Reorganization", line: "The same nodes, a new order." },
  { word: "Language", line: "Geometry learns to speak." },
  { word: "Form", line: "Design, motion and code — one discipline." },
];

/**
 * WORLD 02 — the lattice engine. A tall scroll world with a sticky stage:
 * scroll morphs the system through structure → disturbance → order →
 * language → form while the pointer continuously disturbs it.
 * DOM words ignite per station; the medium stays WebGL throughout.
 */
export function World02() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const progress = useRef(0);
  const [live, setLive] = useState(false);
  const [station, setStation] = useState(0);
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
        onUpdate: (self) => {
          setStation((prev) => {
            const next = Math.min(STATIONS.length - 1, Math.floor(self.progress * STATIONS.length));
            return next === prev ? prev : next;
          });
        },
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section aria-label="The lattice engine" className="mx-auto w-full max-w-[var(--pl-container)] px-[var(--pl-gutter)] py-[var(--pl-section-y)]">
        <p className="meta text-faint">World 02 — the lattice engine</p>
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
    <section ref={wrapRef} aria-label="The lattice engine" className="relative h-[380vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          {live && capability.webgl ? (
            <Engine progress={progress} quality={capability.tier} />
          ) : (
            <div className="h-full w-full bg-void" />
          )}
        </div>
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[var(--pl-container)] flex-col justify-end px-[var(--pl-gutter)] pb-20">
          <p className="meta text-faint">World 02 — the lattice engine</p>
          <div key={station} className="mt-4 max-w-[60ch]">
            <p className="meta text-cyan">
              0{station + 1} / 0{STATIONS.length}
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-tight md:text-6xl">
              {STATIONS[station].word}
            </h2>
            <p className={cn("mt-3 text-muted")}>{STATIONS[station].line}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
