import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";

/**
 * PROCESS — visually minimal. Four stages, no diagram:
 * understand, design, build, improve.
 */
const STAGES = [
  {
    index: "01",
    title: "Understand",
    body: "Users, workflows, constraints, data, and success criteria.",
  },
  {
    index: "02",
    title: "Design",
    body: "System architecture, information flow, interface, and evaluation approach.",
  },
  {
    index: "03",
    title: "Build",
    body: "Develop, test, integrate, and refine the product with the people who will use it.",
  },
  {
    index: "04",
    title: "Improve",
    body: "Measure real usage, identify friction, and iterate responsibly.",
  },
];

export function Process() {
  return (
    <SectionContainer eyebrow="How work happens">
      <Reveal>
        <Display size="md" className="max-w-[22ch]">
          A clear path from problem to working product.
        </Display>
      </Reveal>
      <Stagger className="mt-12 grid gap-px border border-line bg-line md:grid-cols-4">
        {STAGES.map((s) => (
          <div key={s.index} data-stagger-item className="bg-void p-6 md:p-8">
            <Eyebrow className="text-coral-deep">{s.index}</Eyebrow>
            <h3 className="mt-4 font-display text-2xl uppercase md:text-3xl">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
          </div>
        ))}
      </Stagger>
    </SectionContainer>
  );
}
