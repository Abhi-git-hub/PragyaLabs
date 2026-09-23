import Image from "next/image";
import type { ReactNode } from "react";
import { Display } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/cn";

type Section = { index: string; title: string; body: ReactNode };

/**
 * Case-study template (PRD §6.4): Entry → Problem → Approach → Visual proof →
 * Challenge → Outcome → Stack. Gallery renders when real assets exist;
 * `visual` (interactive diagram) stands in honestly until then.
 */
export function CaseStudy({
  project,
  visual,
}: {
  project: Project;
  visual?: ReactNode;
}) {
  const sections: Section[] = [
    { index: "S—01", title: "Problem", body: <p>{project.problem}</p> },
    {
      index: "S—02",
      title: "Approach",
      body: (
        <ul className="space-y-3">
          {project.decisions.map((d, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden="true" className="meta mt-1 text-cyan">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      ),
    },
    ...(project.challenge
      ? [
          {
            index: "S—03",
            title: project.challenge.title,
            body: <p>{project.challenge.body}</p>,
          } as Section,
        ]
      : []),
    {
      index: "S—04",
      title: "Outcome",
      body: (
        <>
          <p>{project.outcome}</p>
          {project.metrics && project.metrics.length > 0 && (
            <dl className="meta mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="text-faint">{m.label}</dt>
                  <dd className="mt-1 text-bone">{m.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      ),
    },
    {
      index: "S—05",
      title: "Stack",
      body: <p className="meta leading-loose text-bone">{project.technologies.join(" / ")}</p>,
    },
  ];

  return (
    <>
      {(visual || project.gallery.length > 0) && (
        <div className="mt-14">
          <p className="meta mb-4 text-faint" aria-hidden="true">
            Visual proof
          </p>
          {visual && (
            <div className="relative h-[46svh] border border-line bg-void/40 md:h-[52vh]">
              {visual}
            </div>
          )}
          {project.gallery.length > 0 && (
            <Stagger className={cn("grid gap-px bg-line md:grid-cols-2", visual ? "mt-px" : undefined)}>
              {project.gallery.map((g) => (
                <figure key={g.src} data-stagger-item className="bg-void">
                  <Image
                    src={g.src}
                    alt={g.alt}
                    width={g.width}
                    height={g.height}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="block w-full"
                    loading="lazy"
                  />
                  {g.caption && (
                    <figcaption className="meta px-5 py-3 text-faint">{g.caption}</figcaption>
                  )}
                </figure>
              ))}
            </Stagger>
          )}
        </div>
      )}
      <Stagger className="mt-14 space-y-0">
        {sections.slice(0, 2).map((s) => (
          <article
            key={s.index}
            data-stagger-item
            className="grid gap-3 border-t border-line py-8 last:border-b md:grid-cols-[88px_220px_1fr] md:gap-8"
          >
            <span className="meta text-faint" aria-hidden="true">{s.index}</span>
            <h2 className="font-display text-2xl uppercase md:text-3xl">{s.title}</h2>
            <div className="max-w-[62ch] text-base leading-relaxed text-muted">{s.body}</div>
          </article>
        ))}
      </Stagger>
      <Stagger className="mt-14 space-y-0">
        {sections.slice(2).map((s) => (
          <article
            key={s.index}
            data-stagger-item
            className="grid gap-3 border-t border-line py-8 last:border-b md:grid-cols-[88px_220px_1fr] md:gap-8"
          >
            <span className="meta text-faint" aria-hidden="true">
              {s.index}
            </span>
            <h2 className="font-display text-2xl uppercase md:text-3xl">{s.title}</h2>
            <div className="max-w-[62ch] text-base leading-relaxed text-muted">{s.body}</div>
          </article>
        ))}
      </Stagger>
    </>
  );
}

/** Case-study header: index, title, summary, verified status strip. */
export function CaseStudyHeader({ project }: { project: Project }) {
  const facts = [
    { term: "Year", value: project.year },
    { term: "Status", value: project.status },
    ...(project.liveUrl ? [{ term: "Live", value: project.liveUrl }] : []),
    ...(project.repositoryUrl ? [{ term: "Code", value: project.repositoryUrl }] : []),
  ];

  return (
    <Reveal>
      <Display size="lg">{project.title}</Display>
      <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">
        {project.summary}
      </p>
      <dl className="meta mt-8 grid gap-3 border-t border-line pt-6 sm:grid-cols-4">
        {facts.map(({ term, value }) => (
          <div key={term}>
            <dt className="text-faint">{term}</dt>
            <dd className={cn("mt-1", term === "Status" ? "text-lime" : "text-bone")}>
              {term === "Live" || term === "Code" ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="OPEN"
                  className="transition-colors hover:text-cyan"
                >
                  Open →
                </a>
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}
