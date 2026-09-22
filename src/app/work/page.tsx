import { Display, Eyebrow, Body } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projects } from "@/data/projects";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Work — Pragya Labs" });

/** Project index. Full dimensional transitions land in Phase 2. */
export default function WorkPage() {
  return (
    <SectionContainer index="01" eyebrow="Work — project index">
      <Reveal>
        <Display size="lg">Selected systems.</Display>
        <Body className="mt-6">
          Only systems that exist. Outcomes stay placeholder until verified —
          nothing here is invented.
        </Body>
      </Reveal>
      <div className="mt-12">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
      <Eyebrow className="mt-8 text-faint">03 entries — dimensional preview in Phase 2</Eyebrow>
    </SectionContainer>
  );
}
