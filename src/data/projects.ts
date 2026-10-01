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
  /** Optional honest metrics — omitted entirely unless real (PRD v2 §6.4).
   *  Never raw request totals framed as users. */
  metrics?: { label: string; value: string }[];
  technologies: string[];
  /** Main-experience feature flag — only visually-ready work is featured.
   *  Unfeatured projects keep their routes but leave the listings. */
  featured: boolean;
  narrative?: NarrativeBeat[];
  /** Compact specimen: short breakdown when the project stays visually smaller. */
  breakdown?: string[];
  gallery: ProjectMedia[];
  heroMedia: ProjectMedia | null;
  thumbnail: ProjectMedia | null;
  liveUrl: string | null;
  repositoryUrl: string | null;
  /** Services this project evidences — renders both directions. */
  relatedServices: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "saarthians",
    number: "01",
    featured: true,
    title: "Saarthians",
    category: "Education Platform",
    year: "2025–2026",
    status: "in-progress",
    summary:
      "Secure student and teacher workspaces with a reasoning-augmented assistant — production foundation for saarthians.online.",
    problem:
      "Learning material lives in scattered formats, and a tutor's attention doesn't scale across classrooms. Saarthians puts material, people, and a grounded tutor inside one system.",
    decisions: [
      "Next.js App Router workspace uniting students and teachers in a single surface",
      "Supabase auth with row-level security, so every classroom sees only its own data",
      "Reasoning-augmented learning assistant over classroom material",
      "PDF-grounded retrieval pipeline feeding everything the tutor says",
      "Vitest suites plus smoke-tested flows before classrooms depend on them",
      "Auth, scores, and AI tooling designed for real services — explicitly never faked in the foundation",
      "Cloudflare Workers deployment via OpenNext and Wrangler",
    ],
    challenge: {
      title: "Answers that stay grounded",
      body: "A tutor is only useful when it answers from the classroom's material instead of generating fog — so retrieval comes first, generation second, and every answer traces back to source.",
    },
    outcome:
      "Live in production, with real usage across 10 countries — including India, the US, Indonesia, and the Netherlands — and predominantly mobile.",
    metrics: [
      { label: "Countries reached", value: "10" },
      { label: "Primary devices", value: "Mobile" },
    ],
    technologies: ["Next.js", "Supabase", "AI / RAG", "Postgres RLS", "Tailwind CSS", "Vitest", "Cloudflare Workers", "PDF grounding"],
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
        body: "Live in production — real usage across 10 countries, predominantly mobile.",
      },
    ],
    gallery: [],
    heroMedia: null,
    thumbnail: null,
    liveUrl: "https://saarthians.online",
    repositoryUrl: "https://github.com/Abhi-git-hub/Saarthians",
    relatedServices: [
      { label: "AI development", href: "/services/ai-development" },
      { label: "Software development", href: "/services/software-development" },
      { label: "Web development", href: "/services/web-development" },
    ],
  },
  {
    slug: "stock-rag",
    number: "02",
    featured: false,
    title: "Stock / RAG System",
    category: "AI / Data / Retrieval",
    year: "2025",
    status: "experiment",
    summary:
      "Groq-powered RAG over 60 major Indian stocks across 9 sectors — real-time Yahoo Finance data, Streamlit UI.",
    problem:
      "Financial questions deserve answers grounded in real data — not generated confidence. This experiment builds the pipeline that makes grounding possible.",
    decisions: [
      "Groq-powered RAG pipeline over 60 major Indian stocks across 9 sectors",
      "Real-time Yahoo Finance data ingested into retrievable chunks",
      "Streamlit interface with dark and light themes",
      "Evaluation loops checking that answers trace back to source data",
    ],
    challenge: {
      title: "Retrieval decides everything",
      body: "Generation is the easy part. The work is ingestion, chunking, and evaluation — iterating until the retrieved context is the right context.",
    },
    outcome: "Experiment — architecture documented, no performance claims.",
    technologies: ["Groq RAG", "Streamlit", "Yahoo Finance", "Embeddings", "Evaluation"],
    gallery: [],
    heroMedia: null,
    thumbnail: null,
    liveUrl: null,
    repositoryUrl: "https://github.com/Abhi-git-hub/stock-market-rag",
    relatedServices: [{ label: "AI development", href: "/services/ai-development" }],
  },
  {
    slug: "majdoor-haq",
    number: "03",
    featured: false,
    title: "Majdoor Haq",
    category: "Mobile Platform",
    year: "2026",
    status: "in-progress",
    summary: "A Flutter-built mobile app whose name states the mission: the labourer's right.",
    problem:
      "Rights that can't be reached might as well not exist. Majdoor Haq is built to be reachable — on the devices workers already carry.",
    decisions: [
      "Flutter (Dart) — one codebase across everyday devices",
      "Mobile-first: the mission lives where its people already are",
      "Built in the open, in public",
    ],
    challenge: null,
    outcome: "In progress — the case file opens as the build notes land.",
    technologies: ["Flutter", "Dart", "Mobile"],
    narrative: [
      {
        title: "Entry",
        body: "Majdoor Haq — the labourer's right, carried in a pocket.",
      },
      {
        title: "Interface",
        body: "A Flutter surface built for reach: big touch, plain language, zero ceremony.",
      },
      {
        title: "Current state",
        body: "In progress. The case file opens as the build notes land.",
      },
    ],
    gallery: [],
    heroMedia: null,
    thumbnail: null,
    liveUrl: null,
    repositoryUrl: "https://github.com/Abhi-git-hub/majdoor_haq",
    relatedServices: [
      { label: "Web development", href: "/services/web-development" },
      { label: "Software development", href: "/services/software-development" },
    ],
  },
  {
    slug: "adhyayan-classes",
    number: "04",
    featured: true,
    title: "Adhyayan Classes",
    category: "Education Website",
    year: "2023–2026",
    status: "shipped",
    summary: "MERN-stack website for a coaching institute — programs, admissions, and contact, live in production.",
    problem:
      "A coaching institute with real classrooms needed a website that works as hard as its teachers: programs explained, admissions open, contact one tap away.",
    decisions: [
      "Full MERN build — MongoDB, Express, React, Node",
      "Programs architecture: 6th–10th, 11th–12th, JEE, NEET",
      "Admissions-first contact paths: call, email, and forms",
      "Deployed to production and kept live since 2023",
    ],
    challenge: {
      title: "Real institute, real constraints",
      body: "Built for parents on phones as much as desktops — every section must read, load, and convert on mid-range devices.",
    },
    outcome: "Shipped — live in production at adhyayanclasses.vercel.app since 2023.",
    technologies: ["MongoDB", "Express", "React", "Node.js"],
    breakdown: [
      "Programs explained plainly: 6th–10th, 11th–12th, JEE, NEET.",
      "Admissions-first contact: call, email, and enquiry paths.",
      "Live in production since 2023 at adhyayanclasses.vercel.app.",
    ],
    gallery: [],
    heroMedia: null,
    thumbnail: null,
    liveUrl: "https://adhyayanclasses.vercel.app",
    repositoryUrl: "https://github.com/Abhi-git-hub/Adhyayan-Classes",
    relatedServices: [
      { label: "Web development", href: "/services/web-development" },
      { label: "Software development", href: "/services/software-development" },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}
