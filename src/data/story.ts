/**
 * Personal story — owner-provided facts ONLY. No dates, metrics, or
 * accomplishments beyond what was supplied. Anything unverified stays out.
 */

export type StoryBeat = {
  era: string;
  title: string;
  lines: string[];
};

export const storyBeats: StoryBeat[] = [
  {
    era: "Then",
    title: "Class 10 — the first line of code",
    lines: [
      "Curiosity about how software is actually made.",
      "A first development experience, followed by the decision to learn by building.",
    ],
  },
  {
    era: "Later",
    title: "Building, breaking, rebuilding",
    lines: [
      "Small projects, broken often, rebuilt until understood.",
      "Experimentation as the method — web interfaces first, systems later.",
    ],
  },
  {
    era: "Now",
    title: "Pragya Labs",
    lines: [
      "Real projects: Saarthians, retrieval experiments, interface recreations.",
      "One practice — creative engineering across AI, the web, and interaction.",
    ],
  },
];

export const person = {
  name: "Abhi",
  role: "Creative engineer",
  location: "Delhi — India",
  year: "2026",
  focus: ["Saarthians (in progress)", "Pragya Labs (this site)", "Independent experiments"],
  areas: ["AI / retrieval", "Web / systems", "Interaction / motion"],
} as const;
