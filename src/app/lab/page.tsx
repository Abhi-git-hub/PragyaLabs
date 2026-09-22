import { Display, Body } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ExperimentCard } from "@/components/projects/ExperimentCard";
import { experiments } from "@/data/experiments";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Lab — Pragya Labs" });

/** Experiments index — specimens with honest state labels. */
export default function LabPage() {
  return (
    <SectionContainer index="04" eyebrow="Lab — experiments">
      <Reveal>
        <Display size="lg">Enter the lab.</Display>
        <Body className="mt-6">
          Ongoing experiments. Each specimen carries its state —
          concept, prototype, or live.
        </Body>
      </Reveal>
      <Stagger className="mt-12 grid gap-px bg-line md:grid-cols-2">
        {experiments.map((e) => (
          <ExperimentCard key={e.id} experiment={e} />
        ))}
      </Stagger>
    </SectionContainer>
  );
}
