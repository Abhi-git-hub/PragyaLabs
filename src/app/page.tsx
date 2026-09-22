import Link from "next/link";
import { HeroArrival } from "@/components/sections/HeroArrival";
import { Thesis } from "@/components/sections/Thesis";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { projects } from "@/data/projects";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Pragya Labs — Digital systems engineered with intelligence." });

/**
 * HOME — visitor-facing experience only.
 * SCENE 01 Arrival → SCENE 02 Thesis → selected systems index.
 * Internal documentation lives in /docs, never on this page.
 */
export default function HomePage() {
  return (
    <>
      <HeroArrival />
      <Thesis />

      <SectionContainer index="03" eyebrow="Selected systems">
        <Reveal>
          <Display size="md">Work, indexed.</Display>
          <Eyebrow className="mt-4 text-faint">
            <Link href="/work" className="transition-colors hover:text-cyan">
              Full index →
            </Link>
          </Eyebrow>
        </Reveal>
        <div className="mt-10">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </SectionContainer>
    </>
  );
}
