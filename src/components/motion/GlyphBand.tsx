"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Glyph transition band — a thin typographic seam between chapters.
 * Excitement follows the band's distance from the viewport center as the
 * visitor scrolls through: glyphs ignite at the crossing, then settle.
 * Progression made visible; pointer can stir it, scroll drives it.
 */
const GLYPHS = "×+·/01".split("");

export function GlyphBand({ label }: { label: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    const CELL = 30;
    let cols = 0;
    const pointer = { x: -9999, stir: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL);
    };

    const draw = (excitement: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const rows = 3;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL + CELL / 2;
          const y = (r + 0.5) * (h / rows);
          const pd = Math.abs(pointer.x - x);
          const pstir = Math.max(0, 1 - pd / 120) * pointer.stir;
          const wave = 0.5 + 0.5 * Math.sin(c * 0.35 - performance.now() / 700 + r);
          const energy = Math.min(1, excitement * (0.35 + 0.65 * wave) + pstir);
          if (energy < 0.03) continue;
          ctx.font = `${11 + energy * 9}px "JetBrains Mono", monospace`;
          ctx.fillStyle = `rgba(53,233,255,${0.08 + energy * 0.5})`;
          ctx.fillText(GLYPHS[(c * 5 + r * 2) % GLYPHS.length], x, y);
        }
      }
    };

    const tick = () => {
      if (!running) return;
      const rect = canvas.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(window.innerHeight / 2 - center);
      const excitement = Math.max(0, 1 - dist / (window.innerHeight * 0.75));
      pointer.stir = Math.max(0, pointer.stir - 0.03);
      draw(reduced ? 0.25 : excitement);
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.stir = 1;
    };

    resize();
    draw(0.25);
    if (!reduced) raf = requestAnimationFrame(tick);
    const io = new IntersectionObserver(([entry]) => {
      if (reduced) return;
      running = entry.isIntersecting;
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      } else cancelAnimationFrame(raf);
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div aria-hidden="true" className="relative h-20 overflow-hidden md:h-24">
      <canvas ref={canvasRef} className="h-full w-full" />
      <span className="meta absolute right-[var(--pl-gutter)] top-1/2 -translate-y-1/2 text-faint">
        {label}
      </span>
      <span className="absolute inset-x-0 top-0 h-px bg-line" />
      <span className="absolute inset-x-0 bottom-0 h-px bg-line" />
    </div>
  );
}
