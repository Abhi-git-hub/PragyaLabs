import Link from "next/link";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { SectionContainer } from "@/components/layout/SectionContainer";

/**
 * FINAL CTA — the editorial close. Ink chapter, quiet type,
 * two ways forward. Conclusion of the journey, not a SaaS banner.
 */
export function FinalCta() {
  return (
    <div className="theme-ink bg-ink text-bone">
      <SectionContainer eyebrow="Begin">
        <Reveal>
          <Display size="lg" className="max-w-[24ch]">
            Have a complex workflow, fragmented data, or a product idea worth building?
          </Display>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-muted md:text-lg">
            Let&apos;s turn it into a dependable digital system.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Link href="/contact" data-cursor="OPEN" className="btn-primary">
                Start a conversation
              </Link>
            </Magnetic>
            <Link href="/work" data-cursor="OPEN" className="btn-ghost">
              View our work
            </Link>
          </div>
        </Reveal>
      </SectionContainer>
    </div>
  );
}
