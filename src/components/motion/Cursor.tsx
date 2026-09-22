"use client";

import { useEffect, useRef, useState } from "react";
import type { CursorState } from "@/config/cursor";
import { useCursor } from "@/components/motion/CursorProvider";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";

/**
 * Visible contextual cursor (desktop only). A small dot + hairline ring that
 * lerps behind the pointer and expands with a state label over
 * [data-cursor] zones (VIEW / OPEN / DRAG / EXPLORE via event delegation).
 * Never renders on touch, coarse pointers, or reduced motion.
 */
export function Cursor() {
  const { state, setState } = useCursor();
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const pos = useRef({ x: -100, y: -100, rx: -100, ry: -100 });

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      setVisible(true);
      const target = (e.target as HTMLElement).closest?.("[data-cursor]");
      setState(((target?.getAttribute("data-cursor") as CursorState) || "DEFAULT"));
    };
    const onLeave = () => setVisible(false);
    const loop = () => {
      const p = pos.current;
      p.rx += (p.x - p.rx) * 0.16;
      p.ry += (p.y - p.ry) * 0.16;
      if (dotRef.current) dotRef.current.style.transform = `translate(${p.x}px, ${p.y}px)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${p.rx}px, ${p.ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, setState]);

  if (!enabled) return null;

  const label =
    state === "VIEW" ? "View" : state === "OPEN" ? "Open" : state === "DRAG" ? "Drag" : state === "EXPLORE" ? "Explore" : "";

  return (
    <div aria-hidden="true" className={cn("pointer-events-none fixed inset-0 z-[80]", !visible && "opacity-0")}>
      <div ref={dotRef} className="absolute left-0 top-0">
        <div className="size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan" />
      </div>
      <div ref={ringRef} className="absolute left-0 top-0">
        <div
          className={cn(
            "flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-300",
            label
              ? "size-20 border-cyan/70 bg-void/60 backdrop-blur-[2px]"
              : "size-7 border-bone/30"
          )}
        >
          {label && <span className="meta text-bone">{label}</span>}
        </div>
      </div>
    </div>
  );
}
