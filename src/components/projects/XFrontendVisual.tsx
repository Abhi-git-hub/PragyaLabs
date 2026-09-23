"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Compact feed-density diagram for the X.com Frontend Clone.
 * Not a screenshot — an honest architectural specimen of information
 * density and interaction rhythm until real capture assets exist.
 */
export function XFrontendVisual() {
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
    let t = 0;
    let pulse = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      if (!running) return;
      t += reduced ? 0 : 0.016;
      pulse = (pulse + (reduced ? 0 : 0.02)) % 1;
      ctx.clearRect(0, 0, w, h);

      // Sidebar rail
      ctx.fillStyle = "rgb(242 241 234 / 0.04)";
      ctx.fillRect(w * 0.08, h * 0.1, w * 0.14, h * 0.8);
      for (let i = 0; i < 5; i++) {
        const y = h * (0.18 + i * 0.12);
        ctx.fillStyle = i === Math.floor(pulse * 5) % 5 ? "rgb(61 255 162 / 0.55)" : "rgb(242 241 234 / 0.18)";
        ctx.fillRect(w * 0.11, y, w * 0.08, 3);
      }

      // Feed column — dense post blocks
      const feedX = w * 0.28;
      const feedW = w * 0.44;
      const rows = 6;
      for (let i = 0; i < rows; i++) {
        const y = h * (0.1 + i * 0.13);
        const active = Math.abs(((t * 0.4 + i * 0.15) % 1) - 0.5) < 0.08;
        ctx.strokeStyle = active ? "rgb(61 255 162 / 0.45)" : "rgb(242 241 234 / 0.1)";
        ctx.lineWidth = 1;
        ctx.strokeRect(feedX, y, feedW, h * 0.11);
        // Avatar
        ctx.fillStyle = active ? "rgb(61 255 162 / 0.35)" : "rgb(242 241 234 / 0.12)";
        ctx.beginPath();
        ctx.arc(feedX + 18, y + h * 0.035, 8, 0, Math.PI * 2);
        ctx.fill();
        // Lines of content
        ctx.fillStyle = "rgb(242 241 234 / 0.22)";
        ctx.fillRect(feedX + 36, y + h * 0.025, feedW * 0.55, 3);
        ctx.fillStyle = "rgb(242 241 234 / 0.12)";
        ctx.fillRect(feedX + 36, y + h * 0.05, feedW * 0.72, 3);
        ctx.fillRect(feedX + 36, y + h * 0.07, feedW * 0.48, 3);
        // Action row
        for (let a = 0; a < 4; a++) {
          ctx.fillStyle =
            active && a === 1 ? "rgb(201 255 240 / 0.5)" : "rgb(242 241 234 / 0.1)";
          ctx.fillRect(feedX + 36 + a * 28, y + h * 0.09, 16, 2);
        }
      }

      // Trends panel
      ctx.fillStyle = "rgb(242 241 234 / 0.03)";
      ctx.fillRect(w * 0.78, h * 0.1, w * 0.14, h * 0.5);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = "rgb(242 241 234 / 0.14)";
        ctx.fillRect(w * 0.8, h * (0.16 + i * 0.1), w * 0.1, 2);
        ctx.fillStyle = "rgb(242 241 234 / 0.08)";
        ctx.fillRect(w * 0.8, h * (0.18 + i * 0.1), w * 0.08, 2);
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pulse = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onPointer);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div className="relative h-full w-full" data-cursor="EXPLORE">
      <canvas ref={canvasRef} className="h-full w-full touch-none" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3"
        aria-hidden="true"
      >
        <span className="meta text-faint">SYS—FEED / DENSITY SPECIMEN</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 py-3" aria-hidden="true">
        <span className="meta text-faint">Layout · paint · interaction — measured against feel</span>
      </div>
    </div>
  );
}
