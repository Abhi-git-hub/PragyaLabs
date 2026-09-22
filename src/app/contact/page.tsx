import { Display, Eyebrow, Body } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Contact — Pragya Labs" });

/** Contact shell. No fake channels, no dead forms — one real channel when ready. */
export default function ContactPage() {
  return (
    <SectionContainer index="06" eyebrow="Contact">
      <Reveal>
        <Display size="hero">Enter the lab.</Display>
        <Body className="mt-6">
          One clear channel. The address below is a placeholder until the public
          inbox is provisioned — nothing fake is listed.
        </Body>
        <p className="meta mt-8 border border-line px-5 py-4 text-bone">
          {site.contact.email} — <span className="text-faint">{site.contact.status}</span>
        </p>
        <Eyebrow className="mt-8 text-faint">Magnetic CTA + full-bleed scene in Phase 2 (Act 08)</Eyebrow>
      </Reveal>
    </SectionContainer>
  );
}
