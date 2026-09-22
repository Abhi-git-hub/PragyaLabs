/**
 * Cursor architecture (Phase 2+). Phase 1 defines the contract only:
 * states, per-state visuals, and the rule that touch / reduced-motion
 * users never get a custom cursor. No DOM cursor is rendered yet.
 */

export type CursorState = "DEFAULT" | "VIEW" | "OPEN" | "DRAG" | "EXPLORE";

export const cursorConfig: Record<
  CursorState,
  { label: string; scale: number; mixBlend: boolean; note: string }
> = {
  DEFAULT: { label: "", scale: 1, mixBlend: true, note: "Small dot + hairline ring." },
  VIEW: { label: "View", scale: 3.2, mixBlend: false, note: "Project thumbnails." },
  OPEN: { label: "Open", scale: 2.4, mixBlend: false, note: "Case-study links." },
  DRAG: { label: "Drag", scale: 2.0, mixBlend: false, note: "Horizontal / orbital zones." },
  EXPLORE: { label: "Explore", scale: 2.8, mixBlend: false, note: "Work worlds + live layers." },
};

export const cursorRules = [
  "Desktop pointer:fine only — never on touch.",
  "Disabled entirely under prefers-reduced-motion.",
  "Subtle ring + dot; never a giant obnoxious cursor.",
  "State is set via data-cursor attributes; a provider swaps visuals.",
] as const;
