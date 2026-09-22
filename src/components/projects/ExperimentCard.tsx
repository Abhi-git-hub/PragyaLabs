import type { Experiment } from "@/data/experiments";
import { Eyebrow } from "@/components/typography/Type";

/**
 * Lab specimen card — structural foundation for future interactive
 * experiments (particles, cursor physics, typographic motion, neural
 * visualization, shaders, procedural geometry). Detail routes arrive
 * with the first live specimens; until then, cards carry honest status.
 */
export function ExperimentCard({ experiment }: { experiment: Experiment }) {
  return (
    <article data-stagger-item data-cursor="EXPLORE" className="bg-void p-6">
      <div className="flex items-baseline justify-between">
        <Eyebrow className="text-faint">{experiment.id}</Eyebrow>
        <span className="meta text-lime">{experiment.status}</span>
      </div>
      <h2 className="mt-3 font-display text-2xl uppercase">{experiment.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{experiment.intent}</p>
      <p className="meta mt-4 text-faint">{experiment.tech.join(" / ")}</p>
    </article>
  );
}
