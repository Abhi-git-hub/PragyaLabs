import Link from "next/link";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProjectForm } from "@/components/sections/ProjectForm";
import { Film } from "@/components/motion/Film";
import { assets } from "@/lib/assets";

/**
 * FINAL — conversion over a living atmosphere. The recorded smoke study
 * breathes behind the form as pure texture (masked, gated, still frame
 * under reduced motion): resolution and readiness, no spectacle.
 */
export function FinalCta() {
  return (
    <div className="theme-ink relative overflow-hidden bg-ink text-bone">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)",
        }}
      >
        <Film
          src={assets.film.smokeAtmos.src}
          poster={assets.film.smokeAtmos.poster}
          label={assets.film.smokeAtmos.label}
        />
      </div>
      <div className="orbit-ring orbit-a" aria-hidden="true" style={{ width: "120%", opacity: 0.5 }} />
      <div className="orbit-ring orbit-b" aria-hidden="true" style={{ width: "85%", opacity: 0.6 }}>
        <span className="orbit-sat" />
      </div>
      <div className="relative">
      <SectionContainer id="start">
        <p className="meta mb-8 text-faint md:mb-12">Start</p>
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
              <Link href="/#method" data-cursor="OPEN" className="text-muted transition-colors hover:text-cyan">
                See how we work — clarity before complexity →
              </Link>
            </p>
          </Reveal>
          <Reveal>
            <ProjectForm />
          </Reveal>
        </div>
      </SectionContainer>
      </div>
    </div>
  );
}
