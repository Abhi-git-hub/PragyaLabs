"use client";

import { useRef } from "react";

/**
 * Spotlight — cursor-tracked radial highlight for cards.
 * Sets --mx/--my custom properties; CSS paints a soft material
 * light that follows the pointer. No motion, just presence.
 * Touch users simply never trigger it — content unaffected.
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${Math.round(e.clientX - rect.left)}px`);
    el.style.setProperty("--my", `${Math.round(e.clientY - rect.top)}px`);
  };
  return { ref, onPointerMove };
}
