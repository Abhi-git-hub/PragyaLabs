"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/config/tokens";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { CapabilityTier } from "@/hooks/use-device-capability";
import type { ScrollProgressRef } from "./PragyaCoreScene";

function Field({ scrollRef, quality }: { scrollRef?: ScrollProgressRef; quality: CapabilityTier }) {
  const points = useRef<THREE.Points>(null!);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const { positions, colorsAttr } = useMemo(() => {
    const count = quality === "high" ? 1100 : 320;
    const positions = new Float32Array(count * 3);
    const colorsAttr = new Float32Array(count * 3);
    const cA = new THREE.Color(colors.accentCyan);
    const cB = new THREE.Color(colors.accentViolet);
    const cC = new THREE.Color(colors.foreground);
    for (let i = 0; i < count; i++) {
      // Wide shallow field: x spread, y band, slight depth.
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      const pick = Math.random();
      const c = pick < 0.55 ? cA : pick < 0.85 ? cB : cC;
      colorsAttr[i * 3] = c.r;
      colorsAttr[i * 3 + 1] = c.g;
      colorsAttr[i * 3 + 2] = c.b;
    }
    return { positions, colorsAttr };
  }, [quality]);

  useFrame((state, delta) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    const p = state.pointer;
    const s = scrollRef?.current ?? 0;
    const pts = points.current;
    // Slow drift + pointer parallax (lerped) + scroll dissolution.
    pts.rotation.y = t * 0.014 + p.x * 0.12;
    pts.rotation.x = p.y * -0.06;
    pts.position.y = -s * 1.1 + Math.sin(t * 0.24) * 0.08;
    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = 0.75 * (1 - s * 0.85);
    mat.size = 0.035 + Math.sin(t * 0.8) * 0.004;
    void delta;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colorsAttr, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * HeroField — the hero's living layer (TRD §3). A GPU point field that
 * answers pointer (parallax drift) and scroll (dissolves as the thesis
 * arrives). Code-split + lazy: type paints first, canvas hydrates after.
 * Reduced motion / no WebGL / data-saver → renders nothing; the poster
 * and video carry the scene (fallback ladder, required).
 */
export function HeroField({
  scrollRef,
  quality = "high",
  live,
  className,
}: {
  scrollRef?: ScrollProgressRef;
  quality?: CapabilityTier;
  live: boolean;
  className?: string;
}) {
  const allowed = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (prefersReducedMotion()) return false;
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") ?? c.getContext("webgl"))) return false;
    } catch {
      return false;
    }
    const nav = window.navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return false;
    return true;
  }, []);

  if (!allowed || !live) return null;

  return (
    <div className={className ?? "absolute inset-0"} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 55 }}
        dpr={quality === "high" ? [1, 1.5] : [1, 1]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        aria-hidden="true"
      >
        <Field scrollRef={scrollRef} quality={quality} />
      </Canvas>
    </div>
  );
}
