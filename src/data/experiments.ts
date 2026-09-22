/** Lab experiments index. Titles + intent only; tech uses full names. */

export type ExperimentStatus = "concept" | "prototype" | "live";

export type Experiment = {
  id: string;
  title: string;
  intent: string;
  status: ExperimentStatus;
  tech: string[];
};

export const experiments: Experiment[] = [
  { id: "exp-01", title: "Pragya Core", intent: "Hero centerpiece: pointer-reactive crystal system.", status: "prototype", tech: ["React Three Fiber", "GSAP"] },
  { id: "exp-02", title: "Neural Orbital", intent: "Intelligence-section orbital field.", status: "concept", tech: ["React Three Fiber"] },
  { id: "exp-03", title: "Data Monolith", intent: "Technology-section system sculpture.", status: "concept", tech: ["React Three Fiber"] },
  { id: "exp-04", title: "Prismatic Ribbon", intent: "Philosophy-section transition.", status: "concept", tech: ["GSAP", "Shaders"] },
  { id: "exp-05", title: "Particle Field", intent: "Ambient background system.", status: "prototype", tech: ["Canvas 2D"] },
];
