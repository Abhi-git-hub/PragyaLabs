export const site = {
  name: "Pragya Labs",
  thesis: "Digital systems engineered with intelligence.",
  internalPhrase: "Enter the lab.",
  location: "Delhi — India",
  year: "2026",
  disciplines: ["Creative Engineering", "AI / Web / Interaction"] as string[],
  url: "https://pragyalabs.dev",
  author: "Pragya",
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
  { href: "/#approach", label: "Approach" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
