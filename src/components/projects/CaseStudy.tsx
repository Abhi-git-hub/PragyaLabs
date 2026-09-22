import { Display } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/cn";

function isPending(value: string): boolean {
  return value.trimStart().toLowerCase().startsWith("placeholder");
}

function verifiedList(values: string[]): string[] {
  return values.filter((v) => !isPending(v));
}

function matchTech(project: Project, pattern: RegExp): string[] {
  return project.technologies.filter((t) => pattern.test(t));
}

type Section = { index: string; title: string; body: React.ReactNode };

/**
 * Case-study architecture: PROBLEM → SYSTEM → DESIGN → ENGINEERING →
 * AI → SECURITY → EXPERIENCE. Only verified content renders — sections
 * without verified material are withheld (never invented, never announced).
 * The full seven-section structure activates as each narrative is verified.
 */
export function CaseStudy({ project }: { project: Project }) {
  const aiSignals = matchTech(project, /ai|rag|llm|embedding|retrieval|grounding|agent/i);
  const securitySignals = matchTech(project, /rls|security|auth|supabase|postgres|policy|test/i);

  const candidates: Array<Section | null> = [
    isPending(project.challenge)
      ? null
      : { index: "S—01", title: "Problem", body: <p>{project.challenge}</p> },
    isPending(project.approach)
      ? null
      : {
          index: "S—02",
          title: "System",
          body: (
            <>
              <p>{project.approach}</p>
              <p className="meta mt-4 text-faint">Stack — {project.technologies.join(" / ")}</p>
            </>
          ),
        },
    verifiedList(project.design).length === 0
      ? null
      : {
          index: "S—03",
          title: "Design",
          body: (
            <ul className="space-y-2">
              {verifiedList(project.design).map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          ),
        },
    verifiedList(project.engineering).length === 0
      ? null
      : {
          index: "S—04",
          title: "Engineering",
          body: (
            <ul className="space-y-2">
              {verifiedList(project.engineering).map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          ),
        },
    aiSignals.length === 0
      ? null
      : { index: "S—05", title: "AI", body: <p>{aiSignals.join(" / ")}</p> },
    securitySignals.length === 0
      ? null
      : { index: "S—06", title: "Security", body: <p>{securitySignals.join(" / ")}</p> },
    isPending(project.outcome)
      ? null
      : { index: "S—07", title: "Experience", body: <p>{project.outcome}</p> },
  ];

  const sections = candidates.filter((s): s is Section => s !== null);
  if (sections.length === 0) return null;

  return (
    <Stagger className="mt-14 space-y-0">
      {sections.map((s) => (
        <article
          key={s.index}
          data-stagger-item
          className="grid gap-3 border-t border-line py-8 last:border-b md:grid-cols-[88px_220px_1fr] md:gap-8"
        >
          <span className="meta text-faint">{s.index}</span>
          <h2 className="font-display text-2xl uppercase md:text-3xl">{s.title}</h2>
          <div className="max-w-[62ch] text-base leading-relaxed text-muted">{s.body}</div>
        </article>
      ))}
    </Stagger>
  );
}

/** Case-study header: index, title, summary, verified status strip. */
export function CaseStudyHeader({ project }: { project: Project }) {
  const facts = [
    { term: "Year", value: project.year },
    { term: "Status", value: project.status },
    ...(isPending(project.role) ? [] : [{ term: "Role", value: project.role }]),
    ...(isPending(project.outcome) ? [] : [{ term: "Outcome", value: project.outcome }]),
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
            <dd className={cn("mt-1", term === "Outcome" ? "text-lime" : "text-bone")}>{value}</dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}
