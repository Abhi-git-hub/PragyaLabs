import { Display, Body, Eyebrow } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { LabHall } from "@/components/lab/LabHall";
import { ExperimentCard } from "@/components/projects/ExperimentCard";
import { experiments } from "@/data/experiments";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Lab — Pragya Labs" });

/** The richer playground: full-length live specimens + the wider index. */
export default function LabPage() {
  return (
    <>
      <SectionContainer index="04" eyebrow="Lab — experiments">
        <Reveal>
          <Display size="lg">Enter the lab.</Display>
          <Body className="mt-6">
            Full-length specimens. Each one runs live and answers to touch —
            move, drag, click, and watch the system respond.
          </Body>
        </Reveal>
        <div className="mt-12">
          <LabHall roomy />
        </div>
      </SectionContainer>
      <SectionContainer index="04—B" eyebrow="Wider index">
        <Reveal>
          <Eyebrow className="mb-2 text-faint">In progress — concept to live</Eyebrow>
        </Reveal>
        <Stagger className="mt-8 grid gap-px bg-line md:grid-cols-2">
          {experiments.map((e) => (
            <ExperimentCard key={e.id} experiment={e} />
          ))}
        </Stagger>
      </SectionContainer>
    </>
  );
}
