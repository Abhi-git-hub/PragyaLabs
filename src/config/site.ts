export const site = {
  name: "Pragya Labs",
  thesis: "Digital systems engineered with intelligence.",
  internalPhrase: "Enter the lab.",
  location: "Delhi — India",
  year: "2026",
  disciplines: ["Creative Engineering", "AI / Web / Interaction"] as string[],
  url: "https://pragyalabs.dev",
  author: "Pragya",
  contact: { email: "hello@pragyalabs.dev", status: "placeholder" as const },
} as const;

export type RouteDef = {
  href: string;
  label: string;
  index: string;
  phase: "phase-1" | "later";
  description: string;
};

/** Route architecture. Phase 1 ships placeholders; full scenes land later. */
export const routes: RouteDef[] = [
  { href: "/", index: "00", label: "Index", phase: "phase-1", description: "Narrative spine ACT 0–9, placeholders + Core playground." },
  { href: "/work", index: "01", label: "Work", phase: "phase-1", description: "Project index." },
  { href: "/work/saarthians", index: "02", label: "Saarthians", phase: "phase-1", description: "Flagship case-study shell." },
  { href: "/work/[project]", index: "03", label: "Case study", phase: "phase-1", description: "Dynamic case-study template." },
  { href: "/lab", index: "04", label: "Lab", phase: "phase-1", description: "Experiments index." },
  { href: "/about", index: "05", label: "About", phase: "phase-1", description: "Person + philosophy shell." },
  { href: "/contact", index: "06", label: "Contact", phase: "phase-1", description: "Contact shell (no fake channels)." },
];

export const nav = routes.filter((r) => !r.href.includes("["));
