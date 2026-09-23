/**
 * Stack as an evidence-based system. Every item links to the project that
 * proves it — no floating skill claims, no percentages, no bars.
 */

export type StackLink = { label: string; href: string };
export type StackCategory = {
  id: string;
  title: string;
  items: string[];
  evidence: StackLink[];
};

export const stack: StackCategory[] = [
  {
    id: "interface",
    title: "Interface",
    items: ["React", "Next.js", "Flutter"],
    evidence: [
      { label: "Saarthians", href: "/work/saarthians" },
      { label: "X recreation", href: "/work/x-frontend-clone" },
      { label: "Majdoor Haq", href: "/work/majdoor-haq" },
      { label: "This site", href: "/#work" },
    ],
  },
  {
    id: "systems",
    title: "Systems",
    items: ["Node", "Python"],
    evidence: [{ label: "Retrieval experiments", href: "/work/stock-rag" }],
  },
  {
    id: "intelligence",
    title: "Intelligence",
    items: ["LLMs", "RAG", "Agents"],
    evidence: [
      { label: "Saarthians tutor", href: "/work/saarthians" },
      { label: "Stock experiment", href: "/work/stock-rag" },
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure",
    items: ["Cloudflare", "Supabase"],
    evidence: [{ label: "Saarthians", href: "/work/saarthians" }],
  },
  {
    id: "experimentation",
    title: "Experimentation",
    items: ["Three.js", "WebGL", "Motion"],
    evidence: [
      { label: "Pragya Labs", href: "/" },
      { label: "Work worlds", href: "/#work" },
    ],
  },
];
