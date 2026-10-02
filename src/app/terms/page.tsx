import { Display, Body } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Terms of Work | Pragya Labs",
  description:
    "How engagements with Pragya Labs work: agreed scope, honest estimates, and ownership that transfers on final payment.",
  canonical: "/terms",
});

/** Terms: plain working terms, no legal theatre. */
export default function TermsPage() {
  return (
    <SectionContainer eyebrow="Terms">
      <Reveal>
        <Display as="h1" size="lg" className="max-w-[20ch]">
          Clear terms, in writing.
        </Display>
        <Body className="mt-6">
          Every engagement starts with a written agreement covering scope, timeline, and
          cost before any work begins. Estimates are honest: if something cannot be
          known up front, that is stated instead of guessed.
        </Body>
        <Body className="mt-4">
          You own the finished work on final payment — code, content, and assets built
          for your project. Pre-existing studio tooling and this website&apos;s own
          systems remain with Pragya Labs.
        </Body>
        <Body className="mt-4">
          AI systems are built to answer from your data with evaluation before launch;
          no outcome is guaranteed beyond what is agreed and measured.
        </Body>
      </Reveal>
    </SectionContainer>
  );
}
