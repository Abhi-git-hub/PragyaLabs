"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Majdoor Haq visual — a handset outline broadcasting concentric rights
 * signals. An honest architectural specimen (reach, broadcast, dignity)
 * until real capture assets exist. Press to reseed the broadcast.
 */
export function MajdoorVisual() {
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
    const rings: Array<{ r: number }> = [{ r: 0 }, { r: 0.33 }, { r: 0.66 }];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h * 0.46;
      const maxR = Math.min(w, h) * 0.42;

      // Handset outline
      const pw = Math.min(w * 0.24, 120);
      const ph = pw * 2.05;
      ctx.strokeStyle = "rgba(242,241,234,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, 18);
      ctx.stroke();
      // Signal dot
      ctx.fillStyle = "#3dffa2";
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Broadcast rings
      for (const ring of rings) {
        const rr = ring.r * maxR;
        const alpha = Math.max(0, 0.55 * (1 - ring.r));
        ctx.strokeStyle = `rgba(139,92,255,${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(rr, 1), -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(rr, 1), Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
        if (!reduced) {
          ring.r += 0.004;
          if (ring.r > 1) ring.r = 0;
        }
      }

      // Labels
      ctx.font = `10px "JetBrains Mono", monospace`;
      ctx.fillStyle = "rgba(155,160,171,0.9)";
      ctx.textAlign = "center";
      ctx.fillText("REACH", cx, cy + ph / 2 + 24);
      void t;
    };

    const tick = () => {
      if (!running) return;
      if (!reduced) t += 1 / 60;
      draw();
      if (!reduced) raf = requestAnimationFrame(tick);
    };

    const onDown = () => {
      rings.forEach((r, i) => {
        r.r = i * 0.33;
      });
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
