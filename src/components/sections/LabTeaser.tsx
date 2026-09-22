import Link from "next/link";
import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { LabHall } from "@/components/lab/LabHall";

/**
 * ACT 05 — THE LAB (teaser). Three live specimens, each manipulable.
 * Full-length versions live on /lab. Decorative blobs are banned here —
 * every specimen responds to the visitor.
 */
export function LabTeaser() {
  return (
    <SectionContainer index="05" eyebrow="The lab">
      <Reveal>
        <Display size="md" className="max-w-[12ch]">
          Touch the thinking.
        </Display>
        <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">
          Experiments, running live. Move, drag, click — each specimen answers.
        </p>
      </Reveal>
      <div className="mt-10">
        <LabHall />
      </div>
      <Reveal>
        <Link
          href="/lab"
          data-cursor="OPEN"
          className="meta mt-10 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
        >
          Enter the full lab →
        </Link>
      </Reveal>
      <div className="mt-4 flex items-center gap-3" aria-hidden="true">
        <Eyebrow className="text-faint">E—04…06 — shader study, neural field, procedural form — in progress</Eyebrow>
        <span className="h-px flex-1 bg-line" />
      </div>
    </SectionContainer>
  );
}
