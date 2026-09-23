"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
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
const XFeed = dynamic(
  () => import("@/components/projects/XFrontendVisual").then((m) => m.XFrontendVisual),
  { ssr: false, loading: () => <div className="h-full w-full bg-void" aria-hidden="true" /> }
);

/**
 * CHAPTER 03 — WORK. Each project is its own visual world.
 * Narrative beats and summaries come from `data/projects` — never duplicated here.
 */

const RAG_BEATS = ["Data", "Retrieval", "Reasoning", "Answer"];

function SaarthiansWorld() {
  const project = getProject("saarthians");
  const steps = project?.narrative ?? [];
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

  if (!project || steps.length === 0) return null;

  return (
    <div className="mt-12">
      <Reveal>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="meta text-faint" aria-hidden="true">
            {project.number}
          </span>
          <h3 className="font-display text-3xl uppercase md:text-5xl">{project.title}</h3>
        </div>
        <p className="meta mt-3 text-faint">
          {project.category} — {project.year} — {project.status}
        </p>
      </Reveal>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div ref={railRef} className="order-2 space-y-0 lg:order-1">
          {steps.map((s, i) => (
            <div
              key={s.title}
              data-step
              className={cn("border-t border-line py-6 last:border-b", i === active && "border-line-strong")}
            >
              <div className="flex items-baseline gap-4">
                <span className={cn("meta", i === active ? "text-cyan" : "text-faint")} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="font-display text-xl uppercase md:text-2xl">{s.title}</h4>
              </div>
              <p className="mt-2 max-w-[52ch] pl-10 leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
          <Link
            href={`/work/${project.slug}`}
            data-cursor="OPEN"
            className="meta mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
          >
            Open the case study →
          </Link>
        </div>
        <div className="order-1 lg:order-2">
          <div className="h-[52svh] border border-line bg-void/40 lg:sticky lg:top-24 lg:h-[72vh]">
            <SaarthiansFlow step={active} total={steps.length} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RagWorld() {
  const project = getProject("stock-rag");
  if (!project) return null;

  return (
    <div className="mt-20">
      <Reveal>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="meta text-faint" aria-hidden="true">
            {project.number}
          </span>
          <h3 className="font-display text-3xl uppercase md:text-5xl">Stock / RAG</h3>
        </div>
        <p className="meta mt-3 text-faint">
          {project.category} — {project.year} — {project.status}
        </p>
        <p className="mt-4 max-w-[62ch] leading-relaxed text-muted">{project.problem}</p>
      </Reveal>
      <Reveal className="mt-8">
        <div className="relative h-[46svh] border border-line bg-void/40 md:h-[52vh]" data-cursor="EXPLORE">
          <RagDiagram />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3" aria-hidden="true">
            <span className="meta text-faint">SYS—RETRIEVAL / LIVE DIAGRAM</span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 py-3" aria-hidden="true">
            <p className="meta text-faint">
              {RAG_BEATS.join("  →  ")} — press to reseed the query
            </p>
          </div>
        </div>
      </Reveal>
      <Reveal>
        <Link
          href={`/work/${project.slug}`}
          data-cursor="OPEN"
          className="meta mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
        >
          Open the dossier →
        </Link>
      </Reveal>
    </div>
  );
}

function XWorld() {
  const project = getProject("x-frontend-clone");
  if (!project) return null;

  return (
    <div className="mt-20">
      <Reveal>
        <div aria-hidden="true">
          <Eyebrow className="mb-2 text-faint">
            {project.number} — compact specimen
          </Eyebrow>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <h3 className="font-display text-3xl uppercase md:text-5xl">{project.title}</h3>
        </div>
        <p className="meta mt-3 text-faint">
          {project.category} — {project.year} — {project.status}
        </p>
      </Reveal>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Reveal>
          <ul className="space-y-4 border-t border-line pt-6">
            {(project.breakdown ?? [project.summary]).map((line) => (
              <li key={line} className="max-w-[52ch] leading-relaxed text-muted">
                {line}
              </li>
            ))}
          </ul>
          <Link
            href={`/work/${project.slug}`}
            data-cursor="OPEN"
            className="meta mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
          >
            Open the specimen →
          </Link>
        </Reveal>
        <Reveal>
          <div className="relative h-[40svh] border border-line bg-void/40 md:h-[46vh]">
            <XFeed />
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export function Work() {
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
      <XWorld />
    </SectionContainer>
  );
}
