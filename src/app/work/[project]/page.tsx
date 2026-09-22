import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CaseStudy, CaseStudyHeader } from "@/components/projects/CaseStudy";
import { getProject, getProjectSlugs } from "@/data/projects";
import { buildMetadata } from "@/lib/metadata";

export function generateStaticParams(): Array<{ project: string }> {
  return getProjectSlugs().map((project) => ({ project }));
}

export async function generateMetadata({ params }: { params: Promise<{ project: string }> }) {
  const { project: slug } = await params;
  const project = getProject(slug);
  if (!project) return buildMetadata({ title: "Not found — Pragya Labs" });
  return buildMetadata({ title: `${project.title} — Pragya Labs` });
}

/** Dynamic case-study template shared by all projects. */
export default async function ProjectPage({ params }: { params: Promise<{ project: string }> }) {
  const { project: slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

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
