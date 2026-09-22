"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { distance, duration, stagger } from "@/config/tokens";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  /** Vertical travel in px before settling. */
  distance?: number;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
};

/**
 * SECTION-category motion primitive: fade + rise on scroll-enter.
 * Reduced motion → content renders in final state, no tween.
 */
export function Reveal({
  children,
  distance: travel = distance.section,
  delay = 0,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = ref.current;
    if (!el || reduced || !motionAllowed()) return;

    const tween = gsap.fromTo(
      el,
      { y: travel, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: duration.slow,
        delay,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [travel, delay, reduced]);

  // `as` is intentionally constrained; ref div covers current uses.
  void Tag;
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Stagger container: children with [data-stagger-item] rise in sequence.
 * Documents the STAGGER token usage for section choreography.
 */
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = ref.current;
    if (!el || reduced || !motionAllowed()) return;
    const items = el.querySelectorAll("[data-stagger-item]");
    if (items.length === 0) return;

    const tween = gsap.fromTo(
      items,
      { y: distance.base, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: duration.base,
        stagger: stagger.base,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
