/**
 * Token mirror for JS/3D/motion code. CSS remains the source of truth for
 * styling; this module is for values needed at runtime (GSAP, Three.js).
 * Keep in sync with src/styles/tokens.css.
 */

export const colors = {
  background: "#060608",
  surface: "#0b0c10",
  surface2: "#12141a",
  foreground: "#f4f3ec",
  muted: "#9ba0ab",
  faint: "#5b606b",
  accentCyan: "#35e9ff",
  accentBlue: "#4d7cff",
  accentViolet: "#8b5cff",
  accentLime: "#c6ff3d",
} as const;

export const duration = {
  instant: 0.12,
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
  cinematic: 1.0,
  epic: 1.6,
} as const;

export const ease = {
  lab: "expo.out", // ≈ cubic-bezier(0.22,1,0.36,1)
  quart: "quart.out",
  snap: [0.16, 1, 0.3, 1] as const,
  linear: "none",
} as const;

export const stagger = { tight: 0.04, base: 0.07, loose: 0.12 } as const;

export const distance = { micro: 12, base: 24, section: 48, hero: 96 } as const;

/** Responsive bands — compositions differ per band, not just scaling.
 * 320–430: stacked cinematic / 768: condensed dual / 1024+: full lab grid. */
export const breakpoints = {
  xs: 360,
  sm: 768,
  md: 1024,
  lg: 1280,
  xl: 1440,
  xxl: 1920,
} as const;
