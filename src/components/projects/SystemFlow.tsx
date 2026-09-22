import type { Project } from "@/data/projects";

/**
 * Saarthians system flow — verified architecture as visual storytelling:
 * USER → INTERFACE → AUTHORIZATION → DATA → AI → EXPERIENCE.
 * Labels come from the project record + owner-confirmed stack; no metrics.
 */
const FLOW: Array<{ node: string; detail: string; tech: (p: Project) => string }> = [
  { node: "User", detail: "Students and teachers", tech: () => "classrooms" },
  { node: "Interface", detail: "Learning workspace", tech: (p) => p.technologies.find((t) => /next/i.test(t)) ?? "web" },
  { node: "Authorization", detail: "Row-level access", tech: (p) => p.technologies.find((t) => /rls|supabase/i.test(t)) ?? "policies" },
  { node: "Data", detail: "Materials + PDF pipeline", tech: (p) => p.technologies.find((t) => /supabase|postgres/i.test(t)) ?? "store" },
  { node: "AI", detail: "Grounded tutor", tech: (p) => p.technologies.find((t) => /rag|ai/i.test(t)) ?? "retrieval" },
  { node: "Experience", detail: "Learning, delivered", tech: () => "live" },
];

export function SystemFlow({ project }: { project: Project }) {
  return (
    <ol className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-6" aria-label={`${project.title} system flow`}>
      {FLOW.map((step, i) => (
        <li key={step.node} data-stagger-item className="group bg-void p-5">
          <p className="meta text-faint">
            {String(i + 1).padStart(2, "0")} — {step.tech(project)}
          </p>
          <p className="mt-3 font-display text-xl uppercase leading-none transition-colors group-hover:text-cyan">
            {step.node}
          </p>
          <p className="mt-2 text-sm text-muted">{step.detail}</p>
          {i < FLOW.length - 1 && (
            <p aria-hidden="true" className="meta mt-4 text-faint">
              ↓
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
