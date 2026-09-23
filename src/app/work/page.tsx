import { Display, Eyebrow, Body } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projects } from "@/data/projects";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Work — Pragya Labs" });

/** Project index — featured systems only. The studio shows finished proof. */
export default function WorkPage() {
  const featured = projects.filter((p) => p.featured);
  return (
    <SectionContainer eyebrow="Work — project index">
      <Reveal>
        <Display size="lg">Selected systems.</Display>
        <Body className="mt-6">
          Only systems that exist. Each entry opens its dossier.
        </Body>
      </Reveal>
      <div className="mt-12">
        {featured.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
      <Eyebrow className="mt-8 text-faint">{String(featured.length).padStart(2, "0")} entries</Eyebrow>
    </SectionContainer>
  );
}
