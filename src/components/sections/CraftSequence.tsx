import Link from "next/link";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Film } from "@/components/motion/Film";

/**
 * CRAFT SEQUENCE — what the studio actually works with, recorded not
 * rendered. Machinery, built environment, material studies — framed as
 * studies, then the line hands off to the proof below.
 */
const STUDIES = [
  {
    src: "/film/lathe--craft.mp4",
    poster: "/film/lathe--craft--poster.jpg",
    label: "Process study — cut metal, real tolerances",
    caption: "Process study",
  },
  {
    src: "/film/interior--est.mp4",
    poster: "/film/interior--est--poster.jpg",
    label: "Built environment study",
    caption: "Built environment",
  },
  {
    src: "/film/drop--macro.mp4",
    poster: "/film/drop--macro--poster.jpg",
    label: "Material study — impact and ripple",
    caption: "Material study",
  },
];

export function CraftSequence() {
  return (
    <SectionContainer eyebrow="The craft">
      <Reveal>
        <Display size="md" className="max-w-[16ch]">
          Recorded, not rendered.
        </Display>
        <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">
          The studio works with physical process and living material before a
          single interface is drawn. Studies from the bench — then the proof.
        </p>
      </Reveal>
      <div className="mt-10 grid gap-px bg-line md:grid-cols-3">
        {STUDIES.map((s) => (
          <figure key={s.src} className="bg-void">
            <div className="aspect-[4/3] overflow-hidden">
              <Film src={s.src} poster={s.poster} label={s.label} />
            </div>
            <figcaption className="meta px-5 py-3 text-faint">{s.caption}</figcaption>
          </figure>
        ))}
      </div>
      <Reveal>
        <p className="meta mt-8 text-faint">
          <Link href="#work" className="text-bone transition-colors hover:text-cyan">
            The proof is in the work below →
          </Link>
        </p>
      </Reveal>
    </SectionContainer>
  );
}
