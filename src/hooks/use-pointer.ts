"use client";

import { useEffect, useRef } from "react";

export type PointerState = { x: number; y: number; nx: number; ny: number };

const initial: PointerState = { x: 0.5, y: 0.5, nx: 0, ny: 0 };

/**
 * Normalized pointer within a container. Returns a ref updated on
 * pointermove (no re-renders) — consumers read it inside rAF/GSAP tickers.
 * nx/ny are -0.5..0.5 offsets from center for parallax math.
 */
export function usePointer<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const pointer = useRef<PointerState>({ ...initial });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
      const y = (e.clientY - rect.top) / Math.max(rect.height, 1);
      pointer.current = { x, y, nx: x - 0.5, ny: y - 0.5 };
    };
    const onLeave = () => {
      pointer.current = { ...initial };
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return { containerRef: ref, pointer };
}
