import Link from "next/link";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProjectForm } from "@/components/sections/ProjectForm";

/**
 * FINAL — conversion on midnight ink. The chamber resolved: low-density
 * orbit field behind a direct form. Resolution and readiness, no spectacle.
 */
export function FinalCta() {
  return (
    <div className="theme-ink relative overflow-hidden bg-ink text-bone">
      <div className="orbit-ring orbit-a" aria-hidden="true" style={{ width: "120%", opacity: 0.5 }} />
      <div className="orbit-ring orbit-b" aria-hidden="true" style={{ width: "85%", opacity: 0.6 }}>
        <span className="orbit-sat" />
      </div>
      <SectionContainer eyebrow="Start">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <Display size="md" className="max-w-[20ch]">
              Start with the problem worth solving.
            </Display>
            <p className="mt-6 max-w-[52ch] leading-relaxed text-muted md:text-lg">
              Tell us where information, workflow, or user experience is breaking
              down. We will help you clarify what a useful system could look like.
            </p>
            <p className="meta mt-8">
              <Link href="/work" data-cursor="OPEN" className="text-muted transition-colors hover:text-cyan">
                See how we work — selected systems →
              </Link>
            </p>
          </Reveal>
          <Reveal>
            <ProjectForm />
          </Reveal>
        </div>
      </SectionContainer>
    </div>
  );
}
