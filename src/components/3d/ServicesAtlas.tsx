"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/config/tokens";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { CapabilityTier } from "@/hooks/use-device-capability";

/**
 * SERVICES ATLAS — one instanced field, four formations, one journey.
 * AI systems condense into a network sphere; web applications flatten
 * into a precision grid; software platforms rise as monolith stacks;
 * creative technology unwinds into a helix ring. Scroll morphs matter;
 * the pointer stirs it; color travels phosphor → ice → amber → copper
 * while the studio signal never leaves the frame.
 */

const STATION_COLORS = ["#3DFFA2", "#C9FFF0", "#FFB46B", "#C97B4A"];

function buildLayouts(count: number): Float32Array[] {
  const layouts: Float32Array[] = [];
  // 0 — network sphere (AI systems)
  {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.2 + Math.random() * 1.1;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      a[i * 3] = r * Math.sin(ph) * Math.cos(th);
      a[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.8;
      a[i * 3 + 2] = r * Math.cos(ph);
    }
    layouts.push(a);
  }
  // 1 — precision grid (web applications)
  {
    const a = new Float32Array(count * 3);
    const side = Math.ceil(Math.cbrt(count));
    for (let i = 0; i < count; i++) {
      const x = i % side;
      const y = Math.floor(i / side) % side;
      const z = Math.floor(i / (side * side));
      a[i * 3] = (x / (side - 1) - 0.5) * 8;
      a[i * 3 + 1] = (y / (side - 1) - 0.5) * 5;
      a[i * 3 + 2] = (z / (side - 1) - 0.5) * 2.4;
    }
    layouts.push(a);
  }
  // 2 — monolith stacks (software platforms)
  {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const col = i % 3;
      const f = Math.floor(i / 3) / Math.ceil(count / 3);
      a[i * 3] = (col - 1) * 2.4 + (Math.random() - 0.5) * 0.5;
      a[i * 3 + 1] = -2.6 + f * 5.4;
      a[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
    }
    layouts.push(a);
  }
  // 3 — helix ring (creative technology)
  {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const f = i / count;
      const ang = f * Math.PI * 8;
      const r = 2.6 - f * 0.9;
      a[i * 3] = Math.cos(ang) * r;
      a[i * 3 + 1] = -2.4 + f * 4.8;
      a[i * 3 + 2] = Math.sin(ang) * r;
    }
    layouts.push(a);
  }
  return layouts;
}

function Atlas({
  progress,
  quality,
}: {
  progress: React.MutableRefObject<number>;
  quality: CapabilityTier;
}) {
  const points = useRef<THREE.Points>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.PointsMaterial>(null!);
  const settled = useRef(false);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const COUNT = quality === "high" ? 900 : 350;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
    return geo;
  }, [COUNT]);
  const layouts = useMemo(() => buildLayouts(COUNT), [COUNT]);
  const colA = useMemo(() => new THREE.Color(), []);
  const colB = useMemo(() => new THREE.Color(), []);

  useEffect(
    () => () => {
      geometry.dispose();
    },
    [geometry]
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = state.pointer;
    const prog = THREE.MathUtils.clamp(progress.current, 0, 1);
    const seg = Math.min(2.999, prog * 3);
    const from = Math.floor(seg);
    const f = seg - from;
    const e = f * f * (3 - 2 * f);

    const A = layouts[from];
    const B = layouts[from + 1];
    const pos = points.current?.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (pos && !reduced) {
      const arr = pos.array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;
        // Pointer stir — nearby particles orbit slightly.
        const dx = A[ix] - p.x * 5;
        const dy = A[ix + 1] - p.y * 3;
        const d2 = dx * dx + dy * dy;
        const push = Math.max(0, 1 - d2 / 9) * 0.5;
        const wob = Math.sin(t * 1.4 + i * 0.7) * 0.06;
        arr[ix] = A[ix] + (B[ix] - A[ix]) * e + Math.cos(t + i) * push;
        arr[ix + 1] = A[ix + 1] + (B[ix + 1] - A[ix + 1]) * e + Math.sin(t * 1.1 + i * 1.3) * push + wob;
        arr[ix + 2] = A[ix + 2] + (B[ix + 2] - A[ix + 2]) * e;
      }
      pos.needsUpdate = true;
    } else if (pos && reduced && !settled.current) {
      const arr = pos.array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;
        arr[ix] = A[ix];
        arr[ix + 1] = A[ix + 1];
        arr[ix + 2] = A[ix + 2];
      }
      pos.needsUpdate = true;
      settled.current = true;
    }
    // Color journey — phosphor, ice, amber, copper. Signal persists.
    const mm = mat.current;
    if (mm) {
      colA.set(STATION_COLORS[from]);
      colB.set(STATION_COLORS[from + 1]);
      mm.color.copy(colA).lerp(colB, e);
      mm.size = 0.05 + Math.sin(t * 0.9) * 0.006;
    }
    // Halo ring crowns the finale.
    if (halo.current) {
      const hw = THREE.MathUtils.smoothstep(prog, 0.8, 1);
      halo.current.visible = hw > 0.02 && !reduced;
      halo.current.scale.setScalar(Math.max(hw * 3.1, 0.001));
      halo.current.rotation.z = t * 0.1;
      (halo.current.material as THREE.MeshBasicMaterial).opacity = hw * 0.5;
    }
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, p.x * 0.8, 0.03);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, -p.y * 0.4 + prog * 0.5, 0.04);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, 9 - prog * 2, 0.05);
    cam.lookAt(0, 0, 0);
    void delta;
  });

  return (
    <group>
      <fog attach="fog" args={[colors.background, 10, 24]} />
      <ambientLight intensity={0.6} color="#2c3833" />
      <directionalLight position={[-4, 5, 6]} intensity={1.0} color="#ffe3c4" />
      <pointLight position={[3, -1, 3]} intensity={10} distance={16} color={colors.accentCyan} />
      <points ref={points} geometry={geometry} frustumCulled={false}>
        <pointsMaterial
          ref={mat}
          size={0.05}
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={halo} rotation={[Math.PI / 2.3, 0, 0]} visible={false}>
        <torusGeometry args={[3.1, 0.025, 8, 100]} />
        <meshBasicMaterial color={colors.accentCyan} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function ServicesAtlasScene({
  progress,
  quality = "high",
}: {
  progress: React.MutableRefObject<number>;
  quality?: CapabilityTier;
}) {
  const reduced = useMemo(() => prefersReducedMotion(), []);
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 50 }}
      dpr={quality === "high" ? [1, 1.75] : [1, 1]}
      gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance" }}
      frameloop={reduced ? "demand" : "always"}
      aria-hidden="true"
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
    >
      <Suspense fallback={null}>
        <Atlas progress={progress} quality={quality} />
      </Suspense>
    </Canvas>
  );
}
