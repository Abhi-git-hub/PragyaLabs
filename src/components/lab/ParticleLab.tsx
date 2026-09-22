"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { colors } from "@/config/tokens";

/**
 * 01 — Particle field. Drift + pointer gravity (click toggles attract/repel,
 * tap/click fires a burst). Capped DPR, mobile counts, pauses offscreen.
 */
export function ParticleLab() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [repel, setRepel] = useState(false);
  const repelRef = useRef(false);

  useEffect(() => {
    repelRef.current = repel;
  }, [repel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const COUNT = isMobile ? 70 : 150;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let ps: P[] = [];
    const pointer = { x: -9999, y: -9999, down: false };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const seed = () => {
      ps = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.6 + 0.5,
      }));
    };
    const burst = (x: number, y: number) => {
      for (const p of ps) {
        const dx = p.x - x;
        const dy = p.y - y;
        const d = Math.hypot(dx, dy) || 1;
        const f = Math.max(0, 1 - d / 160) * 5;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const sign = repelRef.current ? -1 : 1;
      for (const p of ps) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140 && d2 > 4) {
          const d = Math.sqrt(d2);
          p.vx += ((dx / d) * 0.35 * sign) / Math.max(d / 60, 1);
          p.vy += ((dy / d) * 0.35 * sign) / Math.max(d / 60, 1);
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -8) p.x = w + 8;
        if (p.x > w + 8) p.x = -8;
        if (p.y < -8) p.y = h + 8;
        if (p.y > h + 8) p.y = -8;
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = colors.accentCyan;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const tick = () => {
      if (!running) return;
      draw();
      raf = requestAnimationFrame(tick);
    };

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      pointer.x = p.x;
      pointer.y = p.y;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onDown = (e: PointerEvent) => {
      const p = toLocal(e);
      burst(p.x, p.y);
    };

    resize();
    seed();
    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(tick);
    }
    const io = new IntersectionObserver(([entry]) => {
      if (reduced) return;
      running = entry.isIntersecting && !document.hidden;
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      } else cancelAnimationFrame(raf);
    });
    io.observe(canvas);
    const onVis = () => {
      if (reduced) return;
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full touch-none" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setRepel((v) => !v)}
        aria-pressed={repel}
        className="meta absolute bottom-3 left-3 border border-line bg-void/70 px-3 py-2 text-bone backdrop-blur-sm transition-colors hover:border-cyan hover:text-cyan"
      >
        {repel ? "Mode — repel" : "Mode — attract"}
      </button>
    </div>
  );
}
