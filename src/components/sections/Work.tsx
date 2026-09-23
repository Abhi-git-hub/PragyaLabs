"use client";

import Link from "next/link";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { SaarthiansSpace } from "@/components/3d/SaarthiansSpace";
import { getProject } from "@/data/projects";
import { useDeviceCapability } from "@/hooks/use-device-capability";

/**
 * WORK — the first and only project world in the main experience.
 * Saarthians, told spatially: real words from the live product travel
 * through depth as scroll advances. No cards, no invented UI.
 * Other projects stay out of the main experience until visually ready.
 */
export function Work() {
  const project = getProject("saarthians");
  const capability = useDeviceCapability();
  if (!project) return null;

  return (
    <>
      <SectionContainer eyebrow="Featured work" id="work" className="scroll-mt-20">
        <Reveal>
          <p className="meta text-faint">product • engineering • intelligence</p>
          <Display size="md" className="mt-4 max-w-[12ch]">
            Proof, not promises.
          </Display>
          <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">
            One project, told the way it runs — enter it, travel through it,
            read how it works.
          </p>
        </Reveal>
      </SectionContainer>
      <SaarthiansSpace quality={capability.tier} />
      <SectionContainer>
        <Reveal>
          <p className="meta text-faint">
            {project.category} — {project.year} — {project.status}
          </p>
          <Link
            href={`/work/${project.slug}`}
            data-cursor="OPEN"
            className="meta mt-6 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
          >
            Open the case study →
          </Link>
        </Reveal>
      </SectionContainer>
    </>
  );
}
