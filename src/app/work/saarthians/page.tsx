import Link from "next/link";
import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CaseStudy, CaseStudyHeader } from "@/components/projects/CaseStudy";
import { SaarthiansMedia } from "@/components/projects/SaarthiansMedia";
import { SystemFlow } from "@/components/projects/SystemFlow";
import { SaarthiansVisual } from "@/components/projects/SaarthiansVisual";
import { LiveStats } from "@/components/projects/LiveStats";
import { getProject } from "@/data/projects";
import { site } from "@/config/site";
import { TechArticleJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Saarthians — AI-Grounded Learning Platform Case Study | Pragya Labs",
  description:
    "How Saarthians was engineered: Next.js workspace, Supabase row-level security, PDF-grounded tutoring AI, live in production across 10 countries.",
  canonical: "/work/saarthians",
});

/** Flagship case study: overview, live system flow, dossier, visual proof. */
export default function SaarthiansPage() {
  const project = getProject("saarthians");
  if (!project) return null;

  return (
    <>
      <TechArticleJsonLd
        headline={`${project.title} — AI-grounded learning platform case study`}
        description={project.summary}
        url={`${site.url}/work/saarthians`}
        about={project.technologies}
      />
      <SectionContainer eyebrow={project.category}>
        <Reveal>
          <Eyebrow className="mb-4 text-faint">
            <Link href="/work" className="transition-colors hover:text-cyan">
              ← Work index
            </Link>
          </Eyebrow>
        </Reveal>
        <CaseStudyHeader project={project} />
      </SectionContainer>
      <SaarthiansMedia />
      <SectionContainer eyebrow="How it runs">
        <Reveal>
          <Display size="sm" className="max-w-[20ch]">
            One request, every layer.
          </Display>
        </Reveal>
        <Stagger className="mt-8">
          <SystemFlow project={project} />
        </Stagger>
      </SectionContainer>
      <SectionContainer eyebrow="Dossier">
        <CaseStudy
          project={project}
          visual={<SaarthiansVisual step={0} total={project.narrative?.length ?? 1} />}
        />
        <div className="mt-8">
          <LiveStats />
        </div>
      </SectionContainer>
    </>
  );
}
