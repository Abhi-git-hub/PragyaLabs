"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * RainbowCursor — a section-scoped cursor field. The pointer drags a
 * hue-cycling ribbon; strikes detonate expanding ripple rings.
 * Fine pointers + full motion only; touch and reduced motion see nothing.
 */
export function RainbowCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let hue = 160;

    type Dot = { x: number; y: number; age: number };
    type Ring = { x: number; y: number; r: number; alpha: number };
    const trail: Dot[] = [];
    const rings: Ring[] = [];
    const MAX_TRAIL = 26;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const tick = () => {
      if (!running) return;
      hue = (hue + 1.1) % 360;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      // Ribbon trail — newest bright and wide, tail dissolving.
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i];
        const b = trail[i - 1];
        const f = i / trail.length;
        a.age += 1;
        ctx.strokeStyle = `hsla(${(hue + i * 4) % 360}, 95%, 62%, ${(f * 0.85).toFixed(3)})`;
        ctx.lineWidth = 1 + f * 3.5;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(a.x, a.y);
        ctx.stroke();
      }
      while (trail.length > MAX_TRAIL) trail.shift();
      // Ripple rings — expanding, thinning, cooling.
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.r += 4.2;
        r.alpha *= 0.94;
        if (r.alpha < 0.02 || r.r > Math.max(w, h)) {
          rings.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `hsla(${(hue + r.r) % 360}, 95%, 65%, ${r.alpha.toFixed(3)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      trail.push({ x: p.x, y: p.y, age: 0 });
    };
    const onDown = (e: PointerEvent) => {
      const p = toLocal(e);
      rings.push({ x: p.x, y: p.y, r: 6, alpha: 0.9 });
    };

    resize();
    raf = requestAnimationFrame(tick);
    const parent = canvas.parentElement;
    parent?.addEventListener("pointermove", onMove);
    parent?.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", resize);
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting && !document.hidden;
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      } else cancelAnimationFrame(raf);
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      parent?.removeEventListener("pointermove", onMove);
      parent?.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
