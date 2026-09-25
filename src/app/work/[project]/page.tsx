import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CaseStudy, CaseStudyHeader } from "@/components/projects/CaseStudy";
import { SystemFlow } from "@/components/projects/SystemFlow";
import { SaarthiansVisual } from "@/components/projects/SaarthiansVisual";
import { XFrontendVisual } from "@/components/projects/XFrontendVisual";
import { RetrievalViz } from "@/components/lab/RetrievalViz";
import { getProject, getProjectSlugs } from "@/data/projects";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { BreadcrumbListJsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/metadata";

export function generateStaticParams(): Array<{ project: string }> {
  return getProjectSlugs().map((project) => ({ project }));
}

export async function generateMetadata({ params }: { params: Promise<{ project: string }> }) {
  const { project: slug } = await params;
  const project = getProject(slug);
  if (!project) return buildMetadata({ title: "Not found — Pragya Labs" });
  return buildMetadata({
    title: `${project.title} — ${project.category} Case Study | Pragya Labs`,
    description: `${project.summary} Problem, approach, architecture and honest outcome.`,
    canonical: `/work/${slug}`,
  });
}

function CaseVisual({ slug }: { slug: string }) {
  if (slug === "saarthians") return <SaarthiansVisual step={0} total={7} />;
  if (slug === "stock-rag") return <RetrievalViz />;
  if (slug === "x-frontend-clone") return <XFrontendVisual />;
  return null;
}

/** Dynamic case-study template shared by all projects. */
export default async function ProjectPage({ params }: { params: Promise<{ project: string }> }) {
  const { project: slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  // Dedicated Saarthians route owns the flagship layout; keep dynamic as fallback.
  const showFlow = slug === "saarthians";
  const trail = [
    { label: "Index", href: "/" },
    { label: "Work", href: "/work" },
    { label: project.title },
  ];

  return (
    <>
      <BreadcrumbListJsonLd
        items={trail
          .filter((t) => t.href)
          .map((t) => ({ name: t.label, url: `${site.url}${t.href}` }))}
      />
      <SectionContainer eyebrow={project.category}>
        <Reveal>
          <Breadcrumb trail={trail} />
        </Reveal>
        <Reveal>
          <Eyebrow className="mb-4 mt-6 text-faint">
            <Link href="/work" className="transition-colors hover:text-cyan">
              ← Work index
            </Link>
          </Eyebrow>
        </Reveal>
        <CaseStudyHeader project={project} />
        {showFlow && (
          <div className="mt-14">
            <SystemFlow project={project} />
          </div>
        )}
        <CaseStudy project={project} visual={<CaseVisual slug={slug} />} />
      </SectionContainer>
    </>
  );
}
