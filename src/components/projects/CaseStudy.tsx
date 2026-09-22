import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/cn";

function isPending(value: string): boolean {
  return value.trimStart().toLowerCase().startsWith("placeholder");
}

function matchTech(project: Project, pattern: RegExp): string[] {
  return project.technologies.filter((t) => pattern.test(t));
}

/**
 * Case-study architecture: PROBLEM → SYSTEM → DESIGN → ENGINEERING →
 * AI → SECURITY → EXPERIENCE. Every section renders from the typed Project
 * record; unverified sections are explicitly tagged instead of invented.
 */
export function CaseStudy({ project }: { project: Project }) {
  const aiSignals = matchTech(project, /ai|rag|llm|embedding|retrieval|grounding|agent/i);
  const securitySignals = matchTech(project, /rls|security|auth|supabase|postgres|policy|test/i);

  const sections: Array<{ index: string; title: string; pending: boolean; body: React.ReactNode }> = [
    {
      index: "S—01",
      title: "Problem",
      pending: isPending(project.challenge),
      body: <p>{project.challenge}</p>,
    },
    {
      index: "S—02",
      title: "System",
      pending: isPending(project.approach),
      body: (
        <>
          <p>{project.approach}</p>
          <p className="meta mt-4 text-faint">Stack — {project.technologies.join(" / ")}</p>
        </>
      ),
    },
    {
      index: "S—03",
      title: "Design",
      pending: project.design.every(isPending),
      body: (
        <ul className="space-y-2">
          {project.design.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      ),
    },
    {
      index: "S—04",
      title: "Engineering",
      pending: project.engineering.every(isPending),
      body: (
        <ul className="space-y-2">
          {project.engineering.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      ),
    },
    {
      index: "S—05",
      title: "AI",
      pending: aiSignals.length === 0,
      body:
        aiSignals.length > 0 ? (
          <p>AI surface in scope — {aiSignals.join(" / ")}. Retrieval behavior and evaluation pending verification.</p>
        ) : (
          <p>placeholder — AI surface pending verification.</p>
        ),
    },
    {
      index: "S—06",
      title: "Security",
      pending: securitySignals.length === 0,
      body:
        securitySignals.length > 0 ? (
          <p>Security surface in scope — {securitySignals.join(" / ")}. Policy details pending verification.</p>
        ) : (
          <p>placeholder — security surface pending verification.</p>
        ),
    },
    {
      index: "S—07",
      title: "Experience",
      pending: isPending(project.outcome),
      body: <p>{project.outcome}</p>,
    },
  ];

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
          <div className="max-w-[62ch] text-base leading-relaxed text-muted">
            {s.body}
            {s.pending && (
              <p className="meta mt-3 text-lime">
                Pending verification — no outcomes invented
              </p>
            )}
          </div>
        </article>
      ))}
    </Stagger>
  );
}

/** Case-study header: index, title, summary, status strip. */
export function CaseStudyHeader({ project }: { project: Project }) {
  return (
    <Reveal>
      <Display size="lg">{project.title}</Display>
      <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">
        {project.summary}
      </p>
      <dl className="meta mt-8 grid gap-3 border-t border-line pt-6 sm:grid-cols-4">
        {[
          ["Year", project.year],
          ["Status", project.status],
          ["Role", project.role],
          ["Outcome", project.outcome],
        ].map(([term, value]) => (
          <div key={term}>
            <dt className="text-faint">{term}</dt>
            <dd className={cn("mt-1", term === "Outcome" ? "text-lime" : "text-bone")}>{value}</dd>
          </div>
        ))}
      </dl>
      <Eyebrow className="mt-8 text-faint">
        Full narrative unlocks section by section as each claim is verified
      </Eyebrow>
    </Reveal>
  );
}
