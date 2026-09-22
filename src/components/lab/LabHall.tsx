"use client";

import dynamic from "next/dynamic";
import { ExperimentShell } from "@/components/lab/ExperimentShell";

const ParticleLab = dynamic(() => import("@/components/lab/ParticleLab").then((m) => m.ParticleLab), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-void" aria-hidden="true" />,
});
const CursorLab = dynamic(() => import("@/components/lab/CursorLab").then((m) => m.CursorLab), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-void" aria-hidden="true" />,
});
const TypeLab = dynamic(() => import("@/components/lab/TypeLab").then((m) => m.TypeLab), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-void" aria-hidden="true" />,
});

const specimens = [
  {
    id: "E—01",
    title: "Particle field",
    intent: "A gravity well that follows intent — attract, repel, detonate.",
    hint: "Move to steer — click to burst — toggle the mode",
    caption: "Interactive particle field responding to pointer movement and clicks.",
    Lab: ParticleLab,
  },
  {
    id: "E—02",
    title: "Cursor physics",
    intent: "Fourteen nodes on springs, chasing the hand that moves them.",
    hint: "Move to bend — hold still to settle",
    caption: "A spring-physics trailer of dots following the pointer.",
    Lab: CursorLab,
  },
  {
    id: "E—03",
    title: "Typographic engine",
    intent: "Type as a live material — glyphs swell near attention.",
    hint: "Move to excite — click to ripple",
    caption: "A grid of glyphs that brighten near the pointer and ripple on click.",
    Lab: TypeLab,
  },
];

/**
 * Shared live-specimen hall. Compact grid on the homepage teaser, roomy
 * full-length specimens on /lab. One definition, two stagings.
 */
export function LabHall({ roomy = false }: { roomy?: boolean }) {
  return (
    <div className={roomy ? "grid gap-14" : "grid gap-10 md:grid-cols-3 md:gap-6"}>
      {specimens.map(({ Lab, ...s }) => (
        <ExperimentShell key={s.id} {...s} roomy={roomy}>
          <Lab />
        </ExperimentShell>
      ))}
    </div>
  );
}
