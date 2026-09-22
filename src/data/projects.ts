/**
 * Typed project data architecture.
 * Rule: no invented outcomes. Unverified fields stay "placeholder".
 */

export type ProjectStatus = "shipped" | "in-progress" | "experiment" | "placeholder";

export type ProjectMedia = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Project = {
  slug: string;
  number: string;
  title: string;
  category: string;
  year: string;
  status: ProjectStatus;
  summary: string;
  description: string[];
  technologies: string[];
  role: string;
  challenge: string;
  approach: string;
  engineering: string[];
  design: string[];
  outcome: string; // "placeholder" until verified — never invent metrics.
  heroMedia: ProjectMedia | null;
  thumbnail: ProjectMedia | null;
  liveUrl: string | null;
  repositoryUrl: string | null;
};

const ph = (label: string): string => `placeholder — ${label} pending verification.`;

export const projects: Project[] = [
  {
    slug: "saarthians",
    number: "01",
    title: "Saarthians",
    category: "Education Platform",
    year: "2025–2026",
    status: "in-progress",
    summary: "AI-grounded learning platform on Next.js + Supabase with RLS, testing, and PDF-grounded retrieval.",
    description: [ph("full case-study narrative")],
    technologies: ["Next.js", "Supabase", "AI / RAG", "Postgres RLS", "Testing", "PDF grounding"],
    role: ph("role"),
    challenge: ph("challenge"),
    approach: ph("approach"),
    engineering: [ph("engineering detail")],
    design: [ph("design detail")],
    outcome: "placeholder",
    heroMedia: null,
    thumbnail: null,
    liveUrl: null,
    repositoryUrl: null,
  },
  {
    slug: "stock-rag",
    number: "02",
    title: "Stock / RAG System",
    category: "AI / Data / Retrieval",
    year: "2025",
    status: "experiment",
    summary: "Financial-data retrieval experimentation: ingestion, embeddings, grounded answers.",
    description: [ph("full case-study narrative")],
    technologies: ["AI / RAG", "Data pipelines", "Embeddings", "Evaluation"],
    role: ph("role"),
    challenge: ph("challenge"),
    approach: ph("approach"),
    engineering: [ph("engineering detail")],
    design: [ph("design detail")],
    outcome: "placeholder",
    heroMedia: null,
    thumbnail: null,
    liveUrl: null,
    repositoryUrl: null,
  },
  {
    slug: "x-frontend-clone",
    number: "03",
    title: "X.com Frontend Clone",
    category: "Frontend Engineering",
    year: "2024",
    status: "shipped",
    summary: "Pixel-faithful, interaction-heavy React rebuild exercising feed architecture and motion.",
    description: [ph("full case-study narrative")],
    technologies: ["React", "Frontend architecture", "Motion"],
    role: ph("role"),
    challenge: ph("challenge"),
    approach: ph("approach"),
    engineering: [ph("engineering detail")],
    design: [ph("design detail")],
    outcome: "placeholder",
    heroMedia: null,
    thumbnail: null,
    liveUrl: null,
    repositoryUrl: null,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}
