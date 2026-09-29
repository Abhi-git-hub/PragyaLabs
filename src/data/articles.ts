/**
 * Articles — single source for the Insights hub. Each piece pairs one
 * commercial intent with one proof link and one original asset.
 * No filler, no trend lists; publish only what earns its place.
 */

export type ArticleSection = {
  h2: string;
  paragraphs: string[];
  list?: string[];
};

export type Article = {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  date: string;
  lede: string;
  serviceSlug: string;
  caseSlugs: string[];
  cta: string;
  keywords: string[];
  sections: ArticleSection[];
};

export const articles: Article[] = [
  {
    slug: "tutoring-ai-answers-from-documents",
    title: "Why Our Tutoring AI Answers from Documents, Not Memory | Pragya Labs",
    metaDescription:
      "A tutoring AI is only useful when it answers from classroom material. How Saarthians does retrieval-first tutoring — and what it takes.",
    h1: "Why our tutoring AI answers from documents, not memory",
    date: "2026-09-26",
    lede:
      "A tutor that invents curriculum is worse than no tutor. Saarthians answers from classroom material first and generates second — here is the architecture that makes that promise hold.",
    serviceSlug: "ai-development",
    caseSlugs: ["saarthians"],
    cta: "Scope your retrieval system",
    keywords: ["grounded AI tutoring", "RAG for education", "retrieval-first AI", "PDF-grounded tutor"],
    sections: [
      {
        h2: "The failure mode: confident, wrong, untraceable",
        paragraphs: [
          "A general-purpose language model asked about a chapter will produce a fluent answer whether or not it knows the chapter. In a classroom that failure mode is not an edge case — it is the product failing at its only job.",
          "So the first architectural decision in Saarthians was a negative one: the tutor is never allowed to answer from memory alone. Every response must trace to retrieved material — a PDF section, a note, a grounded chunk.",
        ],
      },
      {
        h2: "Retrieval first, generation second",
        paragraphs: [
          "The pipeline order is deliberate: ingest classroom PDFs, chunk them with structure preserved, embed, retrieve the top passages for a question, and only then generate — with the retrieved passages in context and citations pointing back.",
          "This ordering changes what can go wrong. When an answer is bad, the failure is inspectable: either retrieval fetched the wrong chunk (a data problem) or generation strayed (a prompt problem). Each has a different fix, and neither requires retraining anything.",
        ],
      },
      {
        h2: "Classroom scoping is a retrieval problem too",
        paragraphs: [
          "A tutor serving many classrooms must never leak one classroom's material into another's answers. In Saarthians this is enforced where it cannot be bypassed: row-level security in Postgres scopes every retrieval query before generation ever sees it.",
          "Frontend checks would be a promise. Database policy is a guarantee — and it is verified with live testing, not assumed.",
        ],
      },
      {
        h2: "Evaluation before launch, not after complaints",
        paragraphs: [
          "Before classrooms depended on it, answers were checked against source material in loops: does this response trace to a real chunk? Does it stay inside the classroom's scope? Anything unverifiable stayed out of the product.",
          "The rule we ship with: what cannot be measured is not shipped.",
        ],
        list: [
          "Trace every answer to a retrieved chunk",
          "Scope every query by classroom policy",
          "Test flows live, not just in notebooks",
          "Keep the honest unknowns visible",
        ],
      },
      {
        h2: "What this means for your documents",
        paragraphs: [
          "The same pattern ports directly: curricula, manuals, policies, knowledge bases — any corpus where wrong answers cost trust. Ingestion and evaluation do the heavy lifting; the model is the last mile, not the foundation.",
          "If your material matters enough that hallucinations are unacceptable, the architecture above is where we would start with you too.",
        ],
      },
    ],
  },
];

export function getArticleSlugs(): string[] {
  return articles.map((a) => a.slug);
}

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
