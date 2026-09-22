import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

let registered = false;

/** Register GSAP plugins once. ScrollTrigger is app-wide scroll choreography. */
export function registerMotion(): void {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/**
 * Motion gate: when the user prefers reduced motion, skip the tween and
 * apply the end state (or nothing). Every signature interaction branches here.
 */
export function motionAllowed(): boolean {
  return !prefersReducedMotion();
}

export { gsap, ScrollTrigger };
