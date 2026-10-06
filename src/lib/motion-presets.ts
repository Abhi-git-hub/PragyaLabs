/**
 * Central motion presets — the single vocabulary for every tween.
 * Components compose these instead of inventing values. Durations and
 * easings mirror src/styles/tokens.css; JS mirrors src/config/tokens.
 */

export const EASE_OUT = "expo.out";
export const EASE_SNAP = [0.16, 1, 0.3, 1] as const;

export const D = {
  micro: 0.16,
  fast: 0.22,
  ui: 0.32,
  enter: 0.6,
  section: 0.9,
  cinematic: 1.4,
} as const;

/** Soft rise + fade for section entrances. */
export function revealRise(distance = 48) {
  return {
    from: { y: distance, opacity: 0 },
    to: { y: 0, opacity: 1, duration: D.section, ease: EASE_OUT },
  };
}

/** Blur resolving into precision — key statements only. */
export function revealBlur(distance = 32) {
  return {
    from: { y: distance, opacity: 0, filter: "blur(10px)" },
    to: { y: 0, opacity: 1, filter: "blur(0px)", duration: D.cinematic, ease: EASE_OUT },
  };
}

/** Masked rise — lines/blocks through a clipped container. */
export function revealClip() {
  return {
    from: { yPercent: 110, opacity: 0 },
    to: { yPercent: 0, opacity: 1, duration: D.enter, ease: EASE_OUT },
  };
}

/** Gentle settle for cards and small surfaces. */
export function revealSoft(distance = 24) {
  return {
    from: { y: distance, opacity: 0, scale: 0.985 },
    to: { y: 0, opacity: 1, scale: 1, duration: D.enter, ease: EASE_OUT },
  };
}

/** Stagger helper for grouped children. */
export function staggerChildren(gap = 0.07) {
  return { each: gap };
}

/** Parallax drift for images inside overflow-hidden frames. */
export function imageParallax(range = 10) {
  return {
    from: { yPercent: -range / 2 },
    to: { yPercent: range / 2, ease: "none" as const },
  };
}

/** Entrance defaults for ScrollTrigger reveals. */
export function enterTrigger(trigger: Element | string, start = "top 88%") {
  return { trigger, start, once: true };
}
