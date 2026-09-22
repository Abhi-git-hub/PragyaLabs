import { Display, Eyebrow, Body } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { experiments } from "@/data/experiments";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Lab — Pragya Labs" });

/** Experiments index. Interactive specimens land in Phase 2. */
export default function LabPage() {
  return (
    <SectionContainer index="04" eyebrow="Lab — experiments">
      <Reveal>
        <Display size="lg">Enter the lab.</Display>
        <Body className="mt-6">
          Work in progress, shown honestly. Concepts are labeled concepts;
          prototypes are labeled prototypes.
        </Body>
      </Reveal>
      <Stagger className="mt-12 grid gap-px bg-line md:grid-cols-2">
        {experiments.map((e) => (
          <article key={e.id} data-stagger-item data-cursor="EXPLORE" className="bg-void p-6">
            <div className="flex items-baseline justify-between">
              <Eyebrow className="text-faint">{e.id}</Eyebrow>
              <span className="meta text-lime">{e.status}</span>
            </div>
            <h2 className="mt-3 font-display text-2xl uppercase">{e.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{e.intent}</p>
            <p className="meta mt-4 text-faint">{e.tech.join(" / ")}</p>
          </article>
        ))}
      </Stagger>
    </SectionContainer>
  );
}
