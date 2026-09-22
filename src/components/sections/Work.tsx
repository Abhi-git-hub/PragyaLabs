import Link from "next/link";
import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SystemFlow } from "@/components/projects/SystemFlow";
import { getProject, projects } from "@/data/projects";

/**
 * ACT 04 — THE WORK. Editorial proof: the Saarthians system told as a flow,
 * then the full specimen index. No grids of cards, no hype.
 */
export function Work() {
  const saarthians = getProject("saarthians");

  return (
    <SectionContainer index="04" eyebrow="The work">
      <Reveal>
        <Display size="md" className="max-w-[12ch]">
          Proof, not promises.
        </Display>
        <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">
          Systems that exist, shown the way they run — from the person tapping
          glass to the intelligence answering back.
        </p>
      </Reveal>

      {saarthians && (
        <div className="mt-12">
          <Reveal>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span className="meta text-faint">{saarthians.number}</span>
              <h3 className="font-display text-3xl uppercase md:text-5xl">{saarthians.title}</h3>
            </div>
            <p className="meta mt-3 text-faint">
              {saarthians.category} — {saarthians.year} — {saarthians.status}
            </p>
            <p className="mt-4 max-w-[62ch] leading-relaxed text-muted">{saarthians.summary}</p>
          </Reveal>
          <Stagger className="mt-8">
            <SystemFlow project={saarthians} />
          </Stagger>
          <Reveal>
            <Link
              href="/work/saarthians"
              data-cursor="OPEN"
              className="meta mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
            >
              Open the case study →
            </Link>
          </Reveal>
        </div>
      )}

      <div className="mt-16">
        <Reveal>
          <Eyebrow className="mb-2 text-faint">Full index</Eyebrow>
        </Reveal>
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </SectionContainer>
  );
}
