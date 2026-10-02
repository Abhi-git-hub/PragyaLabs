export const site = {
  name: "Pragya Labs",
  thesis:
    "Pragya Labs builds grounded AI systems, RAG applications, web products, and interactive digital experiences around real data and workflows.",
  internalPhrase: "Grounded intelligence.",
  location: "Delhi — India",
  year: "2026",
  disciplines: ["Creative Engineering", "AI / Web / Interaction"] as string[],
  url: "https://www.pragyalabs.online",
  author: "Abhi Yadav",
  contact: { email: "number1abhiyadav@gmail.com", phone: "+91 93112 30129" },
} as const;

export type RouteDef = {
  href: string;
  label: string;
  index: string;
  description: string;
};

/**
 * Route architecture. /lab redirects to /work — the LAB is the brand and
 * its systems run inside the Work worlds, not a separate gallery.
 */
export const routes: RouteDef[] = [
  { href: "/", index: "00", label: "Index", description: "Continuous narrative: arrival to loop." },
  { href: "/work", index: "01", label: "Work", description: "Project worlds + specimen index." },
  { href: "/work/saarthians", index: "02", label: "Saarthians", description: "Flagship case study." },
  { href: "/work/[project]", index: "03", label: "Case study", description: "Dynamic case-study template." },
  { href: "/lab", index: "—", label: "Lab", description: "Redirects to /work (gallery retired)." },
  { href: "/about", index: "04", label: "About", description: "Readable personal story." },
  { href: "/contact", index: "05", label: "Contact", description: "One channel, no dead forms." },
];

/** Public navigation: studio destinations. Nothing else. */
export const nav = [
  { href: "/work", label: "Work" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#method", label: "Method" },
  { href: "/insights", label: "Insights" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Footer index: commercial destinations plus legal. */
export const footerNav = [
  { href: "/services/ai-development", label: "AI Systems" },
  { href: "/services/web-development", label: "Web Applications" },
  { href: "/services/creative-technology", label: "Immersive Experiences" },
  { href: "/work", label: "Case Studies" },
  { href: "/insights", label: "Insights" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
];
