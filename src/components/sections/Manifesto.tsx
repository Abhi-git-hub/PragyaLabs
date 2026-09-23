import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";

/**
 * Manifesto — one statement beat between worlds. The thesis, stated once:
 * the site is the proof. Ends with an invitation to keep scrolling.
 */
export function Manifesto() {
  return (
    <SectionContainer>
      <Reveal>
        <Display size="lg" className="max-w-[16ch]">
          The website is the interaction system.
        </Display>
        <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">
          Design, motion, 3D and code — one discipline, proved as you scroll.
        </p>
      </Reveal>
      <div className="mt-10 flex items-center gap-4" aria-hidden="true">
        <div className="cue-line" />
        <p className="meta text-faint">Keep scrolling</p>
      </div>
    </SectionContainer>
  );
}
