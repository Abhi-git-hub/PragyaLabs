import { Display, Body } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Contact — Pragya Labs" });

/** Contact. One channel, no dead forms — framing matches homepage (PRD §6.7). */
export default function ContactPage() {
  return (
    <SectionContainer index="06" eyebrow="Contact">
      <Reveal>
        <Display size="hero">
          Let&apos;s build
          <br />
          something<span className="text-cyan">.</span>
        </Display>
        <Body className="mt-6">
          Bring the problem and the timeline — the reply comes from the lab.
        </Body>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
          <a
            href={`mailto:${site.contact.email}?subject=Project%20inquiry%20—%20Pragya%20Labs`}
            data-cursor="OPEN"
            className="group inline-flex w-fit items-center gap-4 border border-line-strong px-7 py-4 transition-colors hover:border-cyan"
          >
            <span className="meta text-bone transition-colors group-hover:text-cyan">Start a project →</span>
          </a>
          <p className="meta text-faint">
            {site.contact.email}
            <br />
            {site.location} — replies from the lab
          </p>
        </div>
      </Reveal>
    </SectionContainer>
  );
}
