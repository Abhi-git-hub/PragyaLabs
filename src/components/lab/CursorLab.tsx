"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * 02 — Cursor physics. A spring trailer: fourteen nodes chase the pointer,
 * each bound to the previous one. Move to bend it, hold still to settle.
 */
const NODES = 14;

export function CursorLab() {
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

    const nodes = Array.from({ length: NODES }, () => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    let target = { x: -9999, y: -9999 };
    let placed = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!placed) {
        nodes.forEach((n) => {
          n.x = w / 2;
          n.y = h / 2;
        });
        placed = true;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // Links
      ctx.strokeStyle = "rgba(53, 233, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      nodes.forEach((n, i) => {
        if (i === 0) ctx.moveTo(n.x, n.y);
        else ctx.lineTo(n.x, n.y);
      });
      ctx.stroke();
      // Nodes: bone → cyan along the chain
      nodes.forEach((n, i) => {
        const t = i / (NODES - 1);
        const r = Math.round(244 - t * 190);
        const g = Math.round(243 - t * 10);
        const b = Math.round(236 + t * 19);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4.5 - t * 3, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const tick = () => {
      if (!running) return;
      const stiffness = 0.22;
      const damping = 0.72;
      let px = target.x;
      let py = target.y;
      nodes.forEach((n, i) => {
        const k = stiffness * (i === 0 ? 1 : 0.55);
        n.vx = (n.vx + (px - n.x) * k) * damping;
        n.vy = (n.vy + (py - n.y) * k) * damping;
        n.x += n.vx;
        n.y += n.vy;
        px = n.x;
        py = n.y;
      });
      draw();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target = { x: e.clientX - rect.left, y: e.clientY - rect.top };
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
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full touch-none" aria-hidden="true" />;
}
