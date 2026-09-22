import { Display, Eyebrow, Body } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projects } from "@/data/projects";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Work — Pragya Labs" });

/** Project index — systems that exist, nothing invented. */
export default function WorkPage() {
  return (
    <SectionContainer index="01" eyebrow="Work — project index">
      <Reveal>
        <Display size="lg">Selected systems.</Display>
        <Body className="mt-6">
          Only systems that exist. Each entry opens its dossier.
        </Body>
      </Reveal>
      <div className="mt-12">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
      <Eyebrow className="mt-8 text-faint">{String(projects.length).padStart(2, "0")} entries</Eyebrow>
    </SectionContainer>
  );
}
