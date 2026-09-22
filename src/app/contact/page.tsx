import { Display, Body } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Contact — Pragya Labs" });

/** Contact. One channel, no dead forms. */
export default function ContactPage() {
  return (
    <SectionContainer index="06" eyebrow="Contact">
      <Reveal>
        <Display size="hero">Enter the lab.</Display>
        <Body className="mt-6">
          One clear channel. Write to the lab — {site.location}.
        </Body>
        <p className="meta mt-8 border border-line px-5 py-4 text-bone">
          {site.contact.email}
        </p>
      </Reveal>
    </SectionContainer>
  );
}
