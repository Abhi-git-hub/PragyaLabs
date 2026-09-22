import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { site } from "@/config/site";

/**
 * CHAPTER 07 — CONTACT. The closing: one line, one action, one channel.
 * No generic form as the hero — a mailto that actually opens mail.
 */
export function ContactSection() {
  return (
    <SectionContainer index="07" eyebrow="Contact" id="contact" className="scroll-mt-20">
      <Reveal>
        <Eyebrow className="mb-6 text-faint">The closing</Eyebrow>
        <Display size="hero">
          Let&apos;s build
          <br />
          something<span className="text-cyan">.</span>
        </Display>
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
