/**
 * Services — single content source for commercial intent pages.
 * Every claim traces to shipped work in data/projects.ts. No invented
 * clients, metrics, or capabilities. International positioning: services
 * read global-first; Delhi/India appears once as factual location.
 */

export type ServiceLink = { label: string; href: string };

export type Service = {
  slug: string;
  kicker: string;
  title: string;
  metaDescription: string;
  h1: string;
  lede: string;
  forWho: string[];
  problems: string[];
  process: { title: string; body: string }[];
  stack: string[];
  proof: ServiceLink[];
  related: ServiceLink[];
  faq: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "ai-development",
    kicker: "AI systems & RAG",
    title: "Custom AI Systems & RAG Development | Pragya Labs",
    metaDescription:
      "Build grounded AI assistants, RAG applications, and knowledge systems connected to your real documents, workflows, and business data.",
    h1: "AI systems, grounded in your data",
    lede:
      "Grounded AI systems connected to your real knowledge and workflows. Turn scattered documents and business knowledge into grounded AI assistants, searchable knowledge systems, retrieval-augmented generation applications, and practical automation workflows.",
    forWho: [
      "Education teams needing tutors that answer from real material",
      "Businesses sitting on documents and data they cannot query",
      "Founders who need an AI feature that survives contact with users",
    ],
    problems: [
      "AI answers that sound confident but cannot be traced to source data",
      "Retrieval pipelines nobody evaluated before launch",
      "Demos that never survive production traffic, auth, or real users",
    ],
    process: [
      {
        title: "Ground first",
        body: "Ingestion, chunking and retrieval come before generation. If the retrieved context is wrong, nothing downstream can fix it.",
      },
      {
        title: "Evaluate honestly",
        body: "Answers are checked against source material in loops, not vibes. What cannot be measured is not shipped.",
      },
      {
        title: "Ship behind auth",
        body: "Row-level access, real user boundaries and tested policies — the system runs for actual classrooms and customers.",
      },
    ],
    stack: ["Retrieval-augmented generation (RAG)", "LLM integrations", "Embeddings", "Supabase + Postgres RLS", "Evaluation loops"],
    proof: [
      { label: "Saarthians — AI-grounded learning platform", href: "/work/saarthians" },
      { label: "Stock/RAG retrieval experiment", href: "/work/stock-rag" },
    ],
    related: [
      { label: "RAG systems deep dive", href: "/services/rag-systems" },
      { label: "AI assistants deep dive", href: "/services/ai-assistants" },
      { label: "Software development", href: "/services/software-development" },
    ],
    faq: [
      {
        q: "Do you build custom AI or integrate existing tools?",
        a: "Both, with a bias toward grounded systems: retrieval pipelines and assistants wired to your data, not generic chatbot wrappers.",
      },
      {
        q: "How do you keep AI answers reliable?",
        a: "Retrieval-first architecture plus evaluation loops that check answers against source material before anything ships.",
      },
      {
        q: "Can you work with our existing product?",
        a: "Yes. AI features are integrated behind your existing auth and data boundaries — see the Saarthians case study for the pattern.",
      },
    ],
  },
  {
    slug: "web-development",
    kicker: "Custom web applications",
    title: "Custom Web Application Development | Pragya Labs",
    metaDescription:
      "Pragya Labs designs and develops high-performance web applications, dashboards, internal tools, and digital products tailored to your workflow.",
    h1: "Web products around your workflow",
    lede:
      "Web products designed around the way your business actually works. Build fast, scalable portals, dashboards, internal tools, SaaS products, and customer-facing applications around your actual workflows.",
    forWho: [
      "Founders who need a marketing site that performs like product",
      "Teams whose interface density outgrew their frontend",
      "Anyone whose current site stutters, however good it looks",
    ],
    problems: [
      "Beautiful pages that jank under real interaction and real data",
      "Feed-dense interfaces nobody architected for frame budgets",
      "Motion used as decoration instead of interface feedback",
    ],
    process: [
      {
        title: "Architect the feed",
        body: "Layout, paint and state updates are budgeted per frame before a single component ships.",
      },
      {
        title: "Motion with a job",
        body: "Every animation carries hierarchy or progression — or it is cut. Interaction timing is part of the interface.",
      },
      {
        title: "Ship to production",
        body: "Responsive systems, image optimization and measured Core Web Vitals on the live URL, not just localhost.",
      },
    ],
    stack: ["Next.js App Router", "React", "Tailwind CSS", "Performance budgets", "Responsive systems"],
    proof: [
      { label: "Adhyayan Classes — live MERN site", href: "/work/adhyayan-classes" },
      { label: "Saarthians — Next.js platform", href: "/work/saarthians" },
    ],
    related: [
      { label: "Creative technology", href: "/services/creative-technology" },
      { label: "Software development", href: "/services/software-development" },
    ],
    faq: [
      {
        q: "Which stack do you build with?",
        a: "Next.js and React with TypeScript and Tailwind — the same stack running this website and the Saarthians platform.",
      },
      {
        q: "Can you rebuild our slow frontend?",
        a: "Yes. Rebuilds start from frame budgets and interaction timing — the Adhyayan Classes production site is a working reference for responsive, content-dense UI.",
      },
      {
        q: "Do you handle deployment?",
        a: "Yes — production deployment with measured performance on the live URL is part of delivery, not an afterthought.",
      },
    ],
  },
  {
    slug: "software-development",
    kicker: "Software platforms",
    title: "Custom Software Development & Product Engineering | Pragya Labs",
    metaDescription:
      "Custom software development: backends, databases, auth and product architecture that holds up in production. Systems proof from Pragya Labs.",
    h1: "Software that holds up",
    lede:
      "Pragya Labs engineers custom software systems — backends, databases, authentication and product architecture — designed for real users and verified before they depend on it.",
    forWho: [
      "Founders turning a prototype into a system real users can trust",
      "Teams that need auth, data boundaries and testing done properly",
      "Education and operations products where correctness matters",
    ],
    problems: [
      "Auth and data access bolted on after the prototype",
      "Business logic nobody tested before users depended on it",
      "Infrastructure chosen by default instead of by requirement",
    ],
    process: [
      {
        title: "Boundaries first",
        body: "Authentication, row-level authorization and data ownership are designed up front — see the Saarthians classroom model.",
      },
      {
        title: "Verify live",
        body: "Test suites plus smoke-tested flows. Policies are proven against real services, never assumed.",
      },
      {
        title: "Deploy deliberately",
        body: "Cloudflare Workers and Supabase chosen per requirement, with CI discipline from the first commit.",
      },
    ],
    stack: ["Supabase + Postgres RLS", "Authentication", "REST/API design", "Vitest + smoke testing", "Cloudflare Workers"],
    proof: [{ label: "Saarthians — secure platform", href: "/work/saarthians" }],
    related: [
      { label: "AI development", href: "/services/ai-development" },
      { label: "Web development", href: "/services/web-development" },
    ],
    faq: [
      {
        q: "Do you build backends or only frontends?",
        a: "Both ends. Supabase/Postgres data layers with row-level security, auth flows and tested APIs — the Saarthians platform runs this pattern in production.",
      },
      {
        q: "How do you handle data security?",
        a: "Access rules live in the database layer (RLS), verified with live testing — not trusted to frontend checks.",
      },
      {
        q: "Can you take over an existing codebase?",
        a: "Yes, starting from an audit of boundaries, tests and deployment — then hardening in priority order.",
      },
    ],
  },
  {
    slug: "creative-technology",
    kicker: "Immersive digital experiences",
    title: "Interactive & Immersive Web Experiences | Pragya Labs",
    metaDescription:
      "Create meaningful interactive web experiences, digital storytelling, and creative technology products with Pragya Labs.",
    h1: "Interactive work, engineered",
    lede:
      "Interactive digital experiences that make complex ideas easier to explore. We create immersive web experiences, interactive storytelling, visual interfaces, and creative technology products that help brands, products, and institutions communicate with more clarity and impact.",
    forWho: [
      "Brands that need a site people remember and send to colleagues",
      "Teams launching something that deserves a cinematic arrival",
      "Anyone tired of template portfolios and stock-feeling pages",
    ],
    problems: [
      "Sites that describe interactivity instead of demonstrating it",
      "WebGL demos with no narrative, or narratives with no interactivity",
      "Motion libraries installed but nothing worth moving",
    ],
    process: [
      {
        title: "One continuous system",
        body: "Realtime scenes, scroll choreography and typography composed as a single journey — never a gallery of effects.",
      },
      {
        title: "Performance as design",
        body: "Tiered 3D quality, code-split scenes, gated media. A stuttering experience is a broken composition.",
      },
      {
        title: "Restraint as craft",
        body: "Five principles govern every animation. What doesn't communicate gets cut.",
      },
    ],
    stack: ["Three.js / React Three Fiber", "GSAP ScrollTrigger", "Procedural systems", "Motion design", "WebGL performance budgets"],
    proof: [
      { label: "This website — the proof", href: "/" },
      { label: "Adhyayan Classes — recorded walkthrough", href: "/work/adhyayan-classes" },
    ],
    related: [
      { label: "Web development", href: "/services/web-development" },
      { label: "AI development", href: "/services/ai-development" },
    ],
    faq: [
      {
        q: "What makes this different from a normal agency site?",
        a: "The site itself is built like client work — realtime 3D, scroll choreography and procedural systems, all running in production right now.",
      },
      {
        q: "Does interactive mean slow?",
        a: "No. Tiered quality, lazy-loaded scenes and measured budgets keep it fast — performance is one of the studio's stated principles.",
      },
      {
        q: "Can you do restrained work too?",
        a: "Yes. The same discipline builds quiet, fast marketing sites — interactivity is applied where it earns its place.",
      },
    ],
  },
  {
    slug: "rag-systems",
    kicker: "Grounded retrieval",
    title: "RAG Development Services | Pragya Labs",
    metaDescription:
      "Grounded retrieval systems over your documents — RAG pipelines with evaluation, built for production. Proof from shipped work inside.",
    h1: "Retrieval you can trust",
    lede:
      "We build retrieval-augmented generation systems that answer from your documents — ingested, chunked, retrieved, evaluated — and serve them behind real auth to real users.",
    forWho: [
      "Education teams needing tutors that answer from real material",
      "Businesses sitting on documents and data they cannot query",
      "Founders whose AI demo needs a production backbone",
    ],
    problems: [
      "AI answers that sound confident but cannot be traced to source data",
      "Retrieval pipelines nobody evaluated before launch",
      "Demos that never survive production traffic, auth, or real users",
    ],
    process: [
      {
        title: "Ground first",
        body: "Ingestion, chunking and retrieval come before generation. If the retrieved context is wrong, nothing downstream can fix it.",
      },
      {
        title: "Evaluate honestly",
        body: "Answers are checked against source material in loops, not vibes. What cannot be measured is not shipped.",
      },
      {
        title: "Ship behind auth",
        body: "Row-level access, real user boundaries and tested policies — the system runs for actual classrooms and customers.",
      },
    ],
    stack: ["Retrieval-augmented generation (RAG)", "Embeddings", "Groq + LLMs", "Supabase Postgres RLS", "Evaluation loops"],
    proof: [
      { label: "Saarthians — PDF-grounded tutor", href: "/work/saarthians" },
      { label: "Stock/RAG retrieval experiment", href: "/work/stock-rag" },
    ],
    related: [
      { label: "AI development", href: "/services/ai-development" },
      { label: "AI assistants", href: "/services/ai-assistants" },
    ],
    faq: [
      {
        q: "How much does a RAG system cost to build?",
        a: "It depends on data volume, evaluation depth and auth complexity — typical ranges, never fixed quotes, are scoped on a call after seeing your documents.",
      },
      {
        q: "How long does it take?",
        a: "A working prototype in weeks; a production system with evaluation and auth in months. Timelines are committed per project, not promised here.",
      },
      {
        q: "What do you need from us?",
        a: "Your documents, access to the people who know them, and one person who can say yes. We handle ingestion through deployment.",
      },
    ],
  },
  {
    slug: "ai-assistants",
    kicker: "Assistants teams trust",
    title: "Enterprise AI Assistant Development | Pragya Labs",
    metaDescription:
      "AI assistants for teams and classrooms — grounded in your material, secured by role, tested before launch. Built by Pragya Labs.",
    h1: "Assistants your team can trust",
    lede:
      "We build AI assistants that answer from your material, respect who is asking, and get tested before anyone depends on them — for classrooms, teams, and operations.",
    forWho: [
      "Education operators needing safe, curriculum-grounded tutors",
      "Operations teams drowning in repeat questions",
      "Founders adding AI to an existing product",
    ],
    problems: [
      "Generic chatbot wrappers with no grounding in company material",
      "No role awareness — every user sees everything",
      "AI features launched without testing",
    ],
    process: [
      {
        title: "Anchor to material",
        body: "Curriculum and documents become the source of truth — the assistant retrieves before it speaks.",
      },
      {
        title: "Bound by role",
        body: "Students, teachers and admins each see their own scope, enforced in the data layer.",
      },
      {
        title: "Prove before launch",
        body: "Smoke-tested flows and evaluation loops. Nothing ships on hope.",
      },
    ],
    stack: ["RAG pipelines", "LLM integrations", "Supabase auth + RLS", "Vitest + smoke tests"],
    proof: [
      { label: "Saarthians tutor + workspace", href: "/work/saarthians" },
      { label: "Stock/RAG evaluation pattern", href: "/work/stock-rag" },
    ],
    related: [
      { label: "AI development", href: "/services/ai-development" },
      { label: "RAG systems", href: "/services/rag-systems" },
    ],
    faq: [
      {
        q: "Do you build custom AI or integrate existing tools?",
        a: "Both, with a bias toward grounded systems: retrieval pipelines and assistants wired to your data, not generic chatbot wrappers.",
      },
      {
        q: "Who sees what inside the assistant?",
        a: "Role-scoped retrieval — enforced in the database layer, so a student can never reach a teacher's scope.",
      },
      {
        q: "What does testing cover?",
        a: "User flows end to end, plus groundedness checks that answers trace to source material.",
      },
    ],
  },
];

export function getServiceSlugs(): string[] {
  return services.map((s) => s.slug);
}

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
