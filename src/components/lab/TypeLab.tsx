"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * 03 — Typographic engine. A glyph field that brightens and swells near the
 * pointer; click sends a ripple through the grid. Type as a live material.
 */
const GLYPHS = "PRAGYALABS×+·01".split("");

export function TypeLab() {
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
    let cols = 0;
    let rows = 0;
    const CELL = 34;

    const pointer = { x: -9999, y: -9999 };
    const ripples: Array<{ x: number; y: number; r: number }> = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
    };

    const glyphAt = (c: number, r: number): string => GLYPHS[(c * 7 + r * 3) % GLYPHS.length];

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL + CELL / 2;
          const y = r * CELL + CELL / 2;
          const pd = Math.hypot(pointer.x - x, pointer.y - y);
          const heat = Math.max(0, 1 - pd / 130);
          let ripple = 0;
          for (const rp of ripples) {
            const rd = Math.hypot(rp.x - x, rp.y - y);
            const band = 1 - Math.min(Math.abs(rd - rp.r) / 40, 1);
            ripple = Math.max(ripple, Math.max(0, band) * Math.max(0, 1 - rp.r / 320));
          }
          const energy = Math.min(1, heat + ripple);
          const size = 13 + energy * 15;
          ctx.font = `${size}px "JetBrains Mono", monospace`;
          const cr = Math.round(91 + energy * (53 - 91) + energy * 100);
          const cg = Math.round(96 + energy * (233 - 96));
          const cb = Math.round(107 + energy * (255 - 107));
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.35 + energy * 0.65})`;
          ctx.fillText(glyphAt(c, r), x, y);
        }
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].r += 7;
        if (ripples[i].r > 340) ripples.splice(i, 1);
      }
    };

    const tick = () => {
      if (!running) return;
      draw();
      if (ripples.length > 0 || !reduced) raf = requestAnimationFrame(tick);
      else running = false;
    };
    const kick = () => {
      if (reduced) {
        draw();
        return;
      }
      cancelAnimationFrame(raf);
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      kick();
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
      kick();
    };
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 0 });
      kick();
    };

    resize();
    draw();
    if (!reduced) raf = requestAnimationFrame(tick);
    const io = new IntersectionObserver(([entry]) => {
      if (reduced) return;
      running = entry.isIntersecting && !document.hidden;
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      } else cancelAnimationFrame(raf);
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full touch-none" aria-hidden="true" />;
}
