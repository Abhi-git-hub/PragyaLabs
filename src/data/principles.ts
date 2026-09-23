/**
 * Approach principles — single authored source (TRD §6).
 * Quotable and specific; consumed by homepage Approach and any page that
 * frames the method. Never copy-paste these strings into JSX.
 */

export type Principle = {
  id: string;
  title: string;
  note: string;
};

export const principles: Principle[] = [
  {
    id: "P—01",
    title: "Make complexity invisible.",
    note: "The system does the hard part; the visitor feels none of it.",
  },
  {
    id: "P—02",
    title: "Motion should communicate.",
    note: "Every animation carries hierarchy or progression — or it is cut.",
  },
  {
    id: "P—03",
    title: "Performance is part of design.",
    note: "A stuttering experience is a broken composition.",
  },
  {
    id: "P—04",
    title: "AI should solve real problems.",
    note: "Retrieval over reverie. Grounded answers over generated fog.",
  },
  {
    id: "P—05",
    title: "Build before you brag.",
    note: "Proof first. This site is the evidence.",
  },
];
