"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Retrieval visualization — the Stock/RAG world in one living diagram.
 * A query pulse leaves the left node, chunks ignite as it passes, and an
 * answer beam returns. Honest architecture, no metrics: data → retrieval →
 * reasoning → answer. Pointer reseeds the query origin.
 */
export function RetrievalViz() {
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

    type Chunk = { x: number; y: number; lit: number };
    let chunks: Chunk[] = [];
    const origin = { x: 0.12, y: 0.5 };
    const answer = { x: 0.88, y: 0.5 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      chunks = Array.from({ length: 9 }, (_, i) => ({
        x: 0.3 + (i % 3) * 0.13 + Math.random() * 0.03,
        y: 0.24 + Math.floor(i / 3) * 0.26 + Math.random() * 0.04,
        lit: 0,
      }));
    };

    const node = (x: number, y: number, r: number, color: string, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x * w, y * h, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cycle = (t % 6) / 6; // 6s loop: query → chunks → answer
      const qx = 0.12 + cycle * 0.76;

      // Rails
      ctx.strokeStyle = "rgba(242,241,234,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0.06 * w, 0.5 * h);
      ctx.lineTo(0.94 * w, 0.5 * h);
      ctx.stroke();

      // Links: origin → chunks → answer
      ctx.strokeStyle = "rgba(53,233,255,0.22)";
      for (const c of chunks) {
        ctx.beginPath();
        ctx.moveTo(origin.x * w, origin.y * h);
        ctx.lineTo(c.x * w, c.y * h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(c.x * w, c.y * h);
        ctx.lineTo(answer.x * w, answer.y * h);
        ctx.stroke();
      }

      // Chunks ignite as the pulse passes
      for (const c of chunks) {
        const target = qx > c.x - 0.02 ? 1 : 0;
        c.lit += (target - c.lit) * (reduced ? 1 : 0.08);
        if (cycle < 0.02) c.lit = 0;
        node(c.x, c.y, 3 + c.lit * 3, c.lit > 0.5 ? "#3dffa2" : "#737b78", 0.35 + c.lit * 0.65);
      }

      // Query pulse + answer beam
      const pulseA = cycle < 0.85 ? 0.9 : Math.max(0, 1 - (cycle - 0.85) / 0.15);
      node(qx, 0.5, 5, "#f2f1ea", pulseA);
      node(origin.x, origin.y, 6, "#168f62", 0.9);
      const beam = cycle > 0.7 ? (cycle - 0.7) / 0.3 : 0;
      node(answer.x, answer.y, 6 + beam * 4, "#c9fff0", 0.5 + beam * 0.5);

      // Labels
      ctx.font = `10px "JetBrains Mono", monospace`;
      ctx.fillStyle = "rgba(155,160,171,0.9)";
      ctx.textAlign = "center";
      ctx.fillText("QUERY", origin.x * w, origin.y * h + 22);
      ctx.fillText("CHUNKS", 0.5 * w, 0.12 * h);
      ctx.fillText("ANSWER", answer.x * w, answer.y * h + 22);
    };

    const tick = () => {
      if (!running) return;
      if (!reduced) t += 1 / 60;
      else t = 4.2; // frozen mid-answer state for reduced motion
      draw();
      if (!reduced) raf = requestAnimationFrame(tick);
    };

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      origin.x = Math.min(0.3, Math.max(0.06, (e.clientX - rect.left) / rect.width));
      origin.y = Math.min(0.8, Math.max(0.2, (e.clientY - rect.top) / rect.height));
      t = 0;
      if (reduced) draw();
    };

    resize();
    tick();
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
    canvas.addEventListener("pointerdown", onDown);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
