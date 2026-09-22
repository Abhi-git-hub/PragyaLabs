import Link from "next/link";
import { Eyebrow } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CaseStudy, CaseStudyHeader } from "@/components/projects/CaseStudy";
import { getProject } from "@/data/projects";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Saarthians — Pragya Labs" });

/** Flagship case study. Sections render from verified data; the rest is tagged. */
export default function SaarthiansPage() {
  const project = getProject("saarthians");
  if (!project) return null;

  return (
    <SectionContainer index={project.number} eyebrow={project.category}>
      <Reveal>
        <Eyebrow className="mb-4 text-faint">
          <Link href="/work" className="transition-colors hover:text-cyan">← Work index</Link>
        </Eyebrow>
      </Reveal>
      <CaseStudyHeader project={project} />
      <CaseStudy project={project} />
    </SectionContainer>
  );
}
