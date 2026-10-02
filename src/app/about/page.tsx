import { AboutSection } from "@/components/sections/AboutSection";
import { ProofLedger } from "@/components/sections/ProofLedger";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";
import { Display, Body } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ContactLink } from "@/components/seo/ContactLink";
import { site } from "@/config/site";

export const metadata = buildMetadata({
  title: "About Pragya Labs | AI, Web & Creative Technology Studio",
  description:
    "Learn how Pragya Labs combines AI engineering, web development, product thinking, and creative technology to build useful digital systems.",
  canonical: "/about",
});

/** About: studio positioning, genuine founder facts, then the human world. */
export default function AboutPage() {
  return (
    <>
      <SiteJsonLd />
      <SectionContainer eyebrow="About">
        <Reveal>
          <Display as="h1" size="lg" className="max-w-[22ch]">
            An independent digital systems studio.
          </Display>
          <Body className="mt-6">
            Pragya Labs is an independent digital systems studio focused on practical
            AI, web development, and creative technology.
          </Body>
          <Body className="mt-4">
            We work with teams that need more than a surface-level prototype. Our work
            starts with the real context: the people using the system, the data it
            depends on, the workflow it must support, and the constraints it must
            respect.
          </Body>
          <Body className="mt-4">
            Our approach combines product thinking, full-stack development, AI system
            design, and clear interface design — so the final result is not only
            technically capable, but useful in daily work.
          </Body>
        </Reveal>
        <Reveal>
          <h2 className="mt-14 font-display text-2xl uppercase md:text-3xl">The founder</h2>
          <div className="mt-6 grid gap-3 border-t border-line pt-6 md:grid-cols-[220px_1fr] md:gap-8">
            <p className="meta text-faint">Abhi Yadav — Creative engineer, Delhi, India</p>
            <div>
              <p className="max-w-[62ch] leading-relaxed text-muted">
                One engineer running the whole chain: AI systems, full-stack web
                development, and interactive interfaces — designed, built, and shipped
                from Delhi to anywhere.
              </p>
              <p className="meta mt-5 leading-loose">
                <a
                  href="https://github.com/Abhi-git-hub"
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="OPEN"
                  className="text-muted transition-colors hover:text-cyan"
                >
                  GitHub →
                </a>
                <span className="text-faint"> / </span>
                <ContactLink
                  href={`mailto:${site.contact.email}`}
                  className="text-muted transition-colors hover:text-cyan"
                >
                  {site.contact.email} →
                </ContactLink>
              </p>
            </div>
          </div>
        </Reveal>
      </SectionContainer>
      <ProofLedger />
      <AboutSection standalone />
    </>
  );
}
