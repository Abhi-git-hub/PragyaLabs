import { PlaygroundHero } from "@/components/sections/PlaygroundHero";
import { ActPlaceholder, type ActDef } from "@/components/sections/ActPlaceholder";
import { TypeSpecimen } from "@/components/sections/TypeSpecimen";
import { ColorSystem } from "@/components/sections/ColorSystem";
import { MotionTestArea } from "@/components/sections/MotionTestArea";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { projects } from "@/data/projects";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Pragya Labs — Digital systems engineered with intelligence." });

/**
 * HOME — Phase 1 foundation.
 * Full cinematic scenes land incrementally; this page wires the narrative
 * spine (ACT 0–9), the Core prototype, and the design-system demos.
 */
const acts: ActDef[] = [
  { act: "ACT—00", title: "System initialization", message: "A boot sequence that establishes the lab: coordinates, discipline, status. Fast, technical, skippable.", visual: "Terminal-grade mono overlay dissolving into the core.", interaction: "None required — auto-plays, respects reduced motion by showing final state.", transition: "Dissolve into arrival.", cta: { label: "How it moves", href: "#foundation-motion" } },
  { act: "ACT—01", title: "Arrival", message: "The visitor meets Pragya Labs: monumental display type beside the reactive core. This act is prototyped above.", visual: "Pragya Core + PRAGYA LABS mass type.", interaction: "Pointer parallax, scroll descent.", transition: "Core recedes, thesis rises." },
  { act: "ACT—02", title: "The thesis", message: "Digital systems engineered with intelligence — stated once, at full scale.", visual: "Full-viewport editorial statement, masked reveals.", interaction: "Scroll-choreographed line reveals.", transition: "Mask wipe into work." },
  { act: "ACT—03", title: "The work", message: "Selected systems, indexed like lab specimens — no cards, no hype, no invented outcomes.", visual: "Hairline index rows with dimensional hover.", interaction: "VIEW cursor, dimensional preview.", transition: "Horizontal slide into the lab.", cta: { label: "Open the index", href: "/work" } },
  { act: "ACT—04", title: "The lab", message: "Experiments in progress. The visitor sees how thinking happens, not just what shipped.", visual: "AI planet / network sphere.", interaction: "EXPLORE cursor, draggable specimens.", transition: "Orbital rotation into stack.", cta: { label: "Enter the lab", href: "/lab" } },
  { act: "ACT—05", title: "The stack", message: "Technology as an animated system — every tool earns its place on screen.", visual: "Data monolith.", interaction: "Scroll-assembled system diagram.", transition: "Collapse into philosophy." },
  { act: "ACT—06", title: "The philosophy", message: "Fewer, better systems. Restraint as a feature.", visual: "Prismatic ribbon transition.", interaction: "Scroll-driven ribbon morph.", transition: "Ribbon resolves into portrait." },
  { act: "ACT—07", title: "The person", message: "The engineer behind the lab — real background, real location, no persona fiction.", visual: "Portrait + Delhi/2026 coordinates.", interaction: "Quiet parallax.", transition: "Fade to contact.", cta: { label: "About", href: "/about" } },
  { act: "ACT—08", title: "Contact", message: "One clear channel. No fake socials, no dead forms.", visual: "Full-bleed ENTER THE LAB.", interaction: "Magnetic CTA (desktop only).", transition: "Loop reset.", cta: { label: "Contact", href: "/contact" } },
  { act: "ACT—09", title: "The loop", message: "The final scene reconstructs the opening visual — the visit ends where it began, transformed.", visual: "Core reassembly.", interaction: "Scroll rewound.", transition: "Back to ACT—00." },
];

export default function HomePage() {
  return (
    <>
      <PlaygroundHero />

      {acts.map((act) => (
        <ActPlaceholder key={act.act} act={act} />
      ))}

      <SectionContainer index="INDEX" eyebrow="Selected systems">
        <Reveal>
          <Display size="md">Work, indexed.</Display>
          <Eyebrow className="mt-4 text-faint">Full index → /work</Eyebrow>
        </Reveal>
        <div className="mt-10">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </SectionContainer>

      <div id="foundation-motion">
        <TypeSpecimen />
        <ColorSystem />
        <MotionTestArea />
      </div>
    </>
  );
}
