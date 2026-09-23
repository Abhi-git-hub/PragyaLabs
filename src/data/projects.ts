/**
 * Typed project data — the single content source (TRD §5).
 * Rule: no invented outcomes, metrics, or claims. Unresolved facts stay
 * out of this file — never plausible filler. Galleries omit until real
 * screen recordings / annotated screenshots exist; interactive diagrams
 * on case-study pages stand in honestly as visual proof.
 */

export type ProjectStatus = "shipped" | "in-progress" | "experiment";

export type ProjectMedia = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export type CaseChallenge = {
  title: string;
  body: string;
};

export type NarrativeBeat = {
  title: string;
  body: string;
};

export type Project = {
  slug: string;
  number: string;
  title: string;
  category: string;
  year: string;
  status: ProjectStatus;
  /** One-line entry framing (PRD §6.4). */
  summary: string;
  problem: string;
  /** Named architecture decisions (approach). */
  decisions: string[];
  challenge: CaseChallenge | null;
  outcome: string;
  technologies: string[];
  /** Homepage / flagship scroll narrative — optional, single-sourced. */
  narrative?: NarrativeBeat[];
  /** Compact specimen: short breakdown when the project stays visually smaller. */
  breakdown?: string[];
  gallery: ProjectMedia[];
  heroMedia: ProjectMedia | null;
  thumbnail: ProjectMedia | null;
  liveUrl: string | null;
  repositoryUrl: string | null;
};

export const projects: Project[] = [
  {
    slug: "saarthians",
    number: "01",
    title: "Saarthians",
    category: "Education Platform",
    year: "2025–2026",
    status: "in-progress",
    summary:
      "AI-grounded learning platform on Next.js + Supabase with RLS, testing, and PDF-grounded retrieval.",
    problem:
      "Learning material lives in scattered formats, and a tutor's attention doesn't scale across classrooms. Saarthians puts material, people, and a grounded tutor inside one system.",
    decisions: [
      "Next.js workspace uniting students and teachers in a single surface",
      "Supabase with row-level security, so every classroom sees only its own data",
      "PDF-grounded retrieval pipeline feeding everything the tutor says",
      "Policies and flows verified with live testing before classrooms depend on them",
    ],
    challenge: {
      title: "Answers that stay grounded",
      body: "A tutor is only useful when it answers from the classroom's material instead of generating fog — so retrieval comes first, generation second, and every answer traces back to source.",
    },
    outcome: "In progress — the system runs, and keeps growing.",
    technologies: ["Next.js", "Supabase", "AI / RAG", "Postgres RLS", "Testing", "PDF grounding"],
    narrative: [
      {
        title: "Entry",
        body: "Saarthians — an AI-grounded learning platform where material, people, and intelligence meet.",
      },
      {
        title: "Interface",
        body: "A Next.js workspace uniting students and teachers in one surface.",
      },
      {
        title: "Authorization",
        body: "Supabase row-level security — every classroom sees only its own data.",
      },
      {
        title: "Data",
        body: "A materials pipeline with PDF grounding feeding everything above it.",
      },
      {
        title: "AI",
        body: "A tutor that answers from the material — retrieval over reverie.",
      },
      {
        title: "Security + testing",
        body: "Policies and systems verified live, not assumed.",
      },
      {
        title: "Current state",
        body: "In progress. The system runs, and keeps growing.",
      },
    ],
    gallery: [],
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
    problem:
      "Financial questions deserve answers grounded in real data — not generated confidence. This experiment builds the pipeline that makes grounding possible.",
    decisions: [
      "Ingestion pipelines turning raw financial data into retrievable chunks",
      "Embeddings tuned for retrieval quality over novelty",
      "Evaluation loops checking that answers trace back to source data",
    ],
    challenge: {
      title: "Retrieval decides everything",
      body: "Generation is the easy part. The work is ingestion, chunking, and evaluation — iterating until the retrieved context is the right context.",
    },
    outcome: "Experiment — architecture documented, no performance claims.",
    technologies: ["AI / RAG", "Data pipelines", "Embeddings", "Evaluation"],
    gallery: [],
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
    problem:
      "A social feed is the hardest frontend workout there is: information density, constant motion, and unforgiving state — all at sixty frames per second.",
    decisions: [
      "React feed architecture composed for density without clutter",
      "Interaction-heavy rebuild — every control answers instantly",
      "Motion treated as interface feedback, never decoration",
    ],
    challenge: {
      title: "Density without jank",
      body: "Pixel-faithful density with butter-smooth interaction means every frame budget gets spent deliberately — layout, paint, and state updates all measured against feel.",
    },
    outcome: "Shipped — a working recreation and a permanent motion reference.",
    technologies: ["React", "Frontend architecture", "Motion"],
    breakdown: [
      "Feed architecture built for information density without visual noise.",
      "Interaction timing treated as part of the interface — press, hover, and scroll all answer in frame.",
      "Motion used only where it communicates hierarchy or state change.",
      "Shipped as a living reference for dense, high-frequency UI work.",
    ],
    gallery: [],
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
