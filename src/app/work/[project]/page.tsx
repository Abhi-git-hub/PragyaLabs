import Link from "next/link";
import { notFound } from "next/navigation";
import { Display, Eyebrow, Body } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
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
        <Display size="lg">{project.title}</Display>
        <Body className="mt-6">{project.summary}</Body>
        <dl className="meta mt-8 grid gap-3 border-t border-line pt-6 sm:grid-cols-3">
          <div><dt className="text-faint">Year</dt><dd className="mt-1 text-bone">{project.year}</dd></div>
          <div><dt className="text-faint">Status</dt><dd className="mt-1 text-bone">{project.status}</dd></div>
          <div><dt className="text-faint">Outcome</dt><dd className="mt-1 text-lime">{project.outcome}</dd></div>
        </dl>
        <p className="meta mt-8 text-faint">Stack — {project.technologies.join(" / ")}</p>
        <p className="meta mt-4 text-faint">
          Full case study unlocks after verification. Phase 1 ships the template.
        </p>
      </Reveal>
    </SectionContainer>
  );
}
