"use client";

import { useEffect, useRef } from "react";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

const LINES = [
  "Your data is not the problem.",
  "Your workflow is not the problem.",
  "The gap between them is.",
];

const PATHS = [
  { id: "p-context", d: "M 20 60 C 120 60, 140 110, 260 110" },
  { id: "p-retrieval", d: "M 20 130 C 120 130, 140 140, 260 140" },
  { id: "p-workflow", d: "M 20 200 C 120 200, 140 170, 260 170" },
  { id: "p-interface", d: "M 20 270 C 130 270, 150 200, 260 200" },
];

const PATH_LABELS = ["Documents", "Knowledge", "Workflows", "Users", "Decisions"];

/**
 * RECOGNITION — the real problem is fragmentation. Three large centered
 * lines zoom in sequence while scattered sources connect into one system:
 * scroll-scrubbed paths labelled DOCUMENTS through DECISIONS. Pinned briefly
 * on capable desktop only; a calm flowing section everywhere else.
 */
export function Recognition() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = wrapRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=90%",
          scrub: 0.6,
          pin: ".recognition-stage",
        },
      });
      tl.fromTo("[data-rec-line]", { opacity: 0.1, y: 60, scale: 0.86 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.55 }, 0);
      tl.fromTo("[data-rec-path]", { strokeDashoffset: 320 }, { strokeDashoffset: 0, duration: 1.4, stagger: 0.25 }, 0.3);
      tl.fromTo("[data-rec-label]", { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.25 }, 0.8);
      tl.fromTo("[data-rec-node]", { opacity: 0.25 }, { opacity: 1, duration: 0.6, stagger: 0.15 }, 0.3);
    });
    mm.add("(max-width: 1023px)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 },
      });
      tl.fromTo("[data-rec-line]", { opacity: 0.1, y: 46, scale: 0.88 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.45 }, 0);
      tl.fromTo("[data-rec-path]", { strokeDashoffset: 320 }, { strokeDashoffset: 0, duration: 1.2, stagger: 0.2 }, 0.2);
      tl.fromTo("[data-rec-label]", { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.2 }, 0.6);
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <div ref={wrapRef}>
      <div className="recognition-stage">
        <SectionContainer id="recognition">
          <Reveal className="text-center">
            <p className="meta text-faint">
              <span className="text-cyan">02</span>
              <span aria-hidden="true"> / </span>
              Recognition
            </p>
            <Display size="lg" className="mx-auto mt-6 max-w-[24ch]">
              {LINES.map((l, i) => (
                <span key={l} data-rec-line className="block origin-center will-change-transform">
                  {i === LINES.length - 1 ? <span className="text-cyan">{l}</span> : l}
                </span>
              ))}
            </Display>
            <p className="mx-auto mt-8 max-w-[58ch] text-base leading-relaxed text-muted md:text-lg">
              Information lives in documents, inboxes, spreadsheets, dashboards, and
              people&apos;s heads. Pragya Labs designs the system that brings the right
              context into the right moment.
            </p>
          </Reveal>
          {/* Fragment sources → one system. Decorative; the copy above carries meaning. */}
          <div className="mt-12 border border-line" aria-hidden="true">
            <svg viewBox="0 0 340 330" className="block h-auto w-full" role="presentation">
              {/* source fragments */}
              {[60, 130, 200, 270].map((y) => (
                <g key={y} data-rec-node>
                  <rect x={8} y={y - 22} width={56} height={44} fill="none" stroke="#737B78" strokeWidth={1} opacity={0.7} />
                  <path d={`M 16 ${y - 8} L 56 ${y - 8}`} stroke="#737B78" strokeWidth={1} opacity={0.5} />
                  <path d={`M 16 ${y + 2} L 48 ${y + 2}`} stroke="#737B78" strokeWidth={1} opacity={0.35} />
                  <path d={`M 16 ${y + 12} L 52 ${y + 12}`} stroke="#737B78" strokeWidth={1} opacity={0.25} />
                </g>
              ))}
              {/* drawn pathways */}
              {PATHS.map((p) => (
                <path
                  key={p.id}
                  data-rec-path
                  d={p.d}
                  fill="none"
                  stroke="#3DFFA2"
                  strokeWidth={1.5}
                  strokeDasharray={320}
                  strokeDashoffset={320}
                />
              ))}
              {/* system node */}
              <g data-rec-node>
                <circle cx={292} cy={155} r={34} fill="none" stroke="#F2F1EA" strokeWidth={1.5} />
                <circle cx={292} cy={155} r={20} fill="none" stroke="#168F62" strokeWidth={1.5} />
                <circle cx={292} cy={155} r={5} fill="#3DFFA2" />
              </g>
            </svg>
            {/* pathway legend — the labels live in HTML, not canvas */}
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-5 py-4">
              {PATH_LABELS.map((l) => (
                <li key={l} data-rec-label className="meta text-faint">
                  <span aria-hidden="true" className="mr-2 inline-block h-px w-5 bg-cyan align-middle" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
          <p className="meta mt-4 text-center text-faint">
            Fragments → Context → Intelligence → Interface → Impact
          </p>
        </SectionContainer>
      </div>
    </div>
  );
}
