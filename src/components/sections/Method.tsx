import { ChapterHead } from "@/components/typography/ChapterHead";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";

/**
 * METHOD — clarity before complexity. Four phases with a visible system
 * state, then a trust strip that claims nothing unverified.
 */
const PHASES = [
  {
    index: "01",
    name: "Understand",
    body: "Map people, workflows, data, constraints, and the outcome that matters.",
    state: "Raw context",
  },
  {
    index: "02",
    name: "Design",
    body: "Define the system architecture, interface logic, technical approach, and evaluation plan.",
    state: "Modelled flow",
  },
  {
    index: "03",
    name: "Build",
    body: "Create, test, integrate, and refine with performance and maintainability in mind.",
    state: "Working product",
  },
  {
    index: "04",
    name: "Improve",
    body: "Measure use, find friction, and evolve the system responsibly.",
    state: "Learning system",
  },
];

const TRUST = ["Clear scope", "Direct technical leadership", "Production-minded build", "Evidence-led iteration"];

export function Method() {
  return (
    <SectionContainer id="method" className="scroll-mt-20">
      <ChapterHead
        index="04"
        eyebrow="How the system takes shape"
        title="Clarity before complexity."
        lede="We begin with the real environment: your users, data, constraints, existing systems, and the decision a new product needs to improve."
      />
      <Stagger className="mt-12 space-y-0">
        {PHASES.map((p) => (
          <div
            key={p.index}
            data-stagger-item
            className="grid gap-2 border-t border-line py-8 last:border-b md:grid-cols-[88px_240px_1fr_auto] md:items-baseline md:gap-8"
          >
            <span className="meta text-cyan" aria-hidden="true">
              {p.index}
            </span>
            <h3 className="font-display text-2xl font-semibold uppercase md:text-3xl">{p.name}</h3>
            <p className="max-w-[58ch] leading-relaxed text-muted">{p.body}</p>
            <p className="meta text-faint md:text-right">
              System state — <span className="text-bone">{p.state}</span>
            </p>
          </div>
        ))}
      </Stagger>
      <Reveal>
        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border border-line bg-graphite px-6 py-5">
          {TRUST.map((t) => (
            <li key={t} className="meta text-muted">
              <span aria-hidden="true" className="mr-2 text-success">●</span>
              {t}
            </li>
          ))}
        </ul>
      </Reveal>
    </SectionContainer>
  );
}
