import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";

/**
 * TRUST — typography and whitespace only. No weight, no decoration:
 * the sentence carries it.
 */
export function Trust() {
  return (
    <SectionContainer eyebrow="Why teams call">
      <Reveal>
        <Display as="h2" size="md" className="max-w-[22ch]">
          Technology should reduce complexity — not create more of it.
        </Display>
        <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-muted md:text-lg">
          We combine technical depth, clear product thinking, and thoughtful design to
          build systems teams can trust and use.
        </p>
      </Reveal>
    </SectionContainer>
  );
}
