/**
 * Token mirror for JS/3D/motion code. CSS remains the source of truth for
 * styling; this module is for values needed at runtime (GSAP, Three.js).
 * Keep in sync with src/styles/tokens.css.
 */

export const colors = {
  background: "#090d1a",
  surface: "#111a33",
  surface2: "#182347",
  foreground: "#f5f7ff",
  muted: "#b7c2d9",
  faint: "#7e8aa6",
  accentCyan: "#28d7fe",
  accentBlue: "#8b5cf6",
  accentViolet: "#8b5cf6",
  accentLime: "#46d39a",
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
