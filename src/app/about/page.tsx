import { Display, Body } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "About — Pragya Labs" });

/** Person + philosophy. No persona fiction — facts only. */
export default function AboutPage() {
  return (
    <SectionContainer index="05" eyebrow="About — the person">
      <Reveal>
        <Display size="lg">Engineer, not persona.</Display>
        <Body className="mt-6">
          Pragya Labs is the practice of one creative engineer working across AI,
          the web, and interaction — {site.location.toLowerCase()}, {site.year}.
          Restraint as a feature: fewer, better systems.
        </Body>
        <dl className="meta mt-8 grid gap-3 border-t border-line pt-6 sm:grid-cols-3">
          <div><dt className="text-faint">Discipline</dt><dd className="mt-1 text-bone">Creative engineering</dd></div>
          <div><dt className="text-faint">Coordinates</dt><dd className="mt-1 text-bone">{site.location} — {site.year}</dd></div>
          <div><dt className="text-faint">Thesis</dt><dd className="mt-1 normal-case tracking-normal text-bone">{site.thesis}</dd></div>
        </dl>
      </Reveal>
    </SectionContainer>
  );
}
