import { Display, Body } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { ContactLink } from "@/components/seo/ContactLink";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ProjectForm } from "@/components/sections/ProjectForm";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Start Your AI or Web Project | Pragya Labs",
  description:
    "Tell Pragya Labs what you want to build. Discuss custom AI systems, RAG applications, web development, automation, and interactive experiences.",
  canonical: "/contact",
});

/** Contact. Inquiry form plus one clear direct channel — no dead forms. */
export default function ContactPage() {
  return (
    <>
    <SectionContainer eyebrow="Contact">
      <Reveal>
        <Display as="h1" size="hero">
          Let&apos;s build
          <br />
          something<span className="text-cyan">.</span>
        </Display>
        <Body className="mt-6">
          Bring the problem and the timeline — the reply comes from the lab.
        </Body>
      </Reveal>
    </SectionContainer>
    <SectionContainer eyebrow="Project inquiry">
      <Reveal>
        <ProjectForm />
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
          <ContactLink
            href={`mailto:${site.contact.email}?subject=Project%20inquiry%20—%20Pragya%20Labs`}
            className="group inline-flex w-fit items-center gap-4 border border-line-strong px-7 py-4 transition-colors hover:border-cyan"
          >
            <span className="meta text-bone transition-colors group-hover:text-cyan">Start a project →</span>
          </ContactLink>
          <p className="meta text-faint">
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="text-bone transition-colors hover:text-cyan"
            >
              {site.contact.phone}
            </a>
            <br />
            {site.contact.email}
            <br />
            Replies within 12 hours — {site.location}
          </p>
        </div>
      </Reveal>
    </SectionContainer>
    </>
  );
}
