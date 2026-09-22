"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { getProject } from "@/data/projects";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { cn } from "@/lib/cn";

const SaarthiansFlow = dynamic(
  () => import("@/components/projects/SaarthiansVisual").then((m) => m.SaarthiansVisual),
  { ssr: false, loading: () => <div className="h-full w-full bg-void" aria-hidden="true" /> }
);
const RagDiagram = dynamic(
  () => import("@/components/lab/RetrievalViz").then((m) => m.RetrievalViz),
  { ssr: false, loading: () => <div className="h-full w-full bg-void" aria-hidden="true" /> }
);

/**
 * CHAPTER 03 — WORK. Each project is its own visual world.
 * Saarthians: a scrolled system narrative beside its live data layer.
 * Stock/RAG: a living retrieval diagram. X recreation: a compact specimen.
 */

const STEPS = [
  { title: "Entry", body: "Saarthians — an AI-grounded learning platform where material, people, and intelligence meet." },
  { title: "Interface", body: "A Next.js workspace uniting students and teachers in one surface." },
  { title: "Authorization", body: "Supabase row-level security — every classroom sees only its own data." },
  { title: "Data", body: "A materials pipeline with PDF grounding feeding everything above it." },
  { title: "AI", body: "A tutor that answers from the material — retrieval over reverie." },
  { title: "Security + testing", body: "Policies and systems verified live, not assumed." },
  { title: "Current state", body: "In progress. The system runs, and keeps growing." },
];

const RAG_BEATS = ["Data", "Retrieval", "Reasoning", "Answer"];

function SaarthiansWorld() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = railRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll("[data-step]").forEach((step, i) => {
        gsap.fromTo(
          step,
          { opacity: 0.25 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: step,
              start: "top 72%",
              end: "bottom 38%",
              scrub: true,
              onToggle: (self) => {
                if (self.isActive) setActive(i);
              },
            },
          }
        );
      });
    }, railRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div className="mt-12">
      <Reveal>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="meta text-faint">01</span>
          <h3 className="font-display text-3xl uppercase md:text-5xl">Saarthians</h3>
        </div>
        <p className="meta mt-3 text-faint">Education platform — 2025–2026 — in progress</p>
      </Reveal>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div ref={railRef} className="order-2 space-y-0 lg:order-1">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              data-step
              className={cn("border-t border-line py-6 last:border-b", i === active && "border-line-strong")}
            >
              <div className="flex items-baseline gap-4">
                <span className={cn("meta", i === active ? "text-cyan" : "text-faint")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="font-display text-xl uppercase md:text-2xl">{s.title}</h4>
              </div>
              <p className="mt-2 max-w-[52ch] pl-10 leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
          <Link
            href="/work/saarthians"
            data-cursor="OPEN"
            className="meta mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
          >
            Open the case study →
          </Link>
        </div>
        <div className="order-1 lg:order-2">
          <div className="h-[52svh] border border-line bg-void/40 lg:sticky lg:top-24 lg:h-[72vh]">
            <SaarthiansFlow step={active} total={STEPS.length} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RagWorld() {
  return (
    <div className="mt-20">
      <Reveal>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="meta text-faint">02</span>
          <h3 className="font-display text-3xl uppercase md:text-5xl">Stock / RAG</h3>
        </div>
        <p className="meta mt-3 text-faint">AI / Data / Retrieval — 2025 — experiment</p>
        <p className="mt-4 max-w-[62ch] leading-relaxed text-muted">
          An experiment in grounded answers over financial data. No performance
          claims — the architecture is the story.
        </p>
      </Reveal>
      <Reveal className="mt-8">
        <div className="relative h-[46svh] border border-line bg-void/40 md:h-[52vh]" data-cursor="EXPLORE">
          <RagDiagram />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3">
            <span className="meta text-faint">SYS—RETRIEVAL / LIVE DIAGRAM</span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 py-3">
            <p className="meta text-faint">
              {RAG_BEATS.join("  →  ")} — press to reseed the query
            </p>
          </div>
        </div>
      </Reveal>
      <Reveal>
        <Link
          href="/work/stock-rag"
          data-cursor="OPEN"
          className="meta mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
        >
          Open the dossier →
        </Link>
      </Reveal>
    </div>
  );
}

export function Work() {
  const xclone = getProject("x-frontend-clone");

  return (
    <SectionContainer index="03" eyebrow="The work" id="work" className="scroll-mt-20">
      <Reveal>
        <Display size="md" className="max-w-[12ch]">
          Proof, not promises.
        </Display>
        <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">
          Each project is its own world — enter it, disturb it, read how it runs.
        </p>
      </Reveal>

      <SaarthiansWorld />
      <RagWorld />

      {xclone && (
        <div className="mt-20">
          <Reveal>
            <Eyebrow className="mb-2 text-faint">03 — compact specimen</Eyebrow>
          </Reveal>
          <ProjectCard project={xclone} />
        </div>
      )}
    </SectionContainer>
  );
}
