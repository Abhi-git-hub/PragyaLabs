"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/config/tokens";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { CapabilityTier } from "@/hooks/use-device-capability";

const EMBER = "#ff9d5c";
const COPPER = "#8a4f2a";
const ICE = "#C9FFF0";

/**
 * EMBER FORMS — the warm chapter. A copper knot (craft), a phosphor
 * icosahedron (signal), an ice ring (clarity) and rising ember motes share
 * one stage. Scroll morphs their hierarchy; hover ignites whichever form
 * the pointer touches. Amber is motivated — it is the practical lamp's
 * world, expanded. Phosphor remains the studio's through-line.
 */
function Forms({
  progress,
  quality,
}: {
  progress: React.MutableRefObject<number>;
  quality: CapabilityTier;
}) {
  const knot = useRef<THREE.Mesh>(null!);
  const knotMat = useRef<THREE.MeshStandardMaterial>(null!);
  const icosa = useRef<THREE.Group>(null!);
  const icosaMat = useRef<THREE.MeshStandardMaterial>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const embers = useRef<THREE.Points>(null!);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const excite = useRef({ knot: 0, icosa: 0, ring: 0 });

  const COUNT = quality === "high" ? 240 : 100;
  const moteGeo = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 13;
      positions[i * 3 + 1] = Math.random() * 7 - 2;
      positions[i * 3 + 2] = -3 + Math.random() * 6;
      seeds[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return geo;
  }, [quality, COUNT]);

  useEffect(
    () => () => {
      moteGeo.dispose();
    },
    [moteGeo]
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = state.pointer;
    const prog = reduced ? 0.5 : progress.current;
    const cam = state.camera;

    // Hover — raycast the three forms, excite what is touched.
    if (!reduced) {
      ray.setFromCamera(new THREE.Vector2(p.x, p.y), cam);
      const targets: THREE.Object3D[] = [];
      if (knot.current) targets.push(knot.current);
      if (icosa.current) targets.push(icosa.current);
      if (ring.current) targets.push(ring.current);
      const hits = ray.intersectObjects(targets, true);
      const name = hits.length > 0 ? findNamed(hits[0].object) : null;
      for (const k of ["knot", "icosa", "ring"] as const) {
        const target = name === k ? 1 : 0;
        excite.current[k] = THREE.MathUtils.lerp(excite.current[k], target, 0.08);
      }
    }

    // Scroll morphs hierarchy: knot leads, icosa rises, ring crowns.
    const knotW = 1 - THREE.MathUtils.smoothstep(prog, 0.55, 0.9);
    const icosaW = THREE.MathUtils.smoothstep(prog, 0.25, 0.6);
    const ringW = THREE.MathUtils.smoothstep(prog, 0.55, 0.9);

    if (knot.current) {
      knot.current.rotation.y = reduced ? 0.4 : t * 0.2;
      knot.current.rotation.x = Math.sin(t * 0.18) * 0.3;
      knot.current.position.y = THREE.MathUtils.lerp(0, -1.4, 1 - knotW);
      knot.current.scale.setScalar(Math.max(knotW, 0.001));
      knot.current.visible = knotW > 0.02;
      if (knotMat.current) knotMat.current.emissiveIntensity = 0.4 + excite.current.knot * 1.8;
    }
    if (icosa.current) {
      icosa.current.rotation.y = reduced ? 0.3 : -t * 0.16;
      icosa.current.position.y = THREE.MathUtils.lerp(-1.6, 0.2, icosaW);
      icosa.current.scale.setScalar(Math.max(0.4 + icosaW * 0.9, 0.001));
      icosa.current.visible = icosaW > 0.01;
      icosaMat.current.emissiveIntensity = 0.8 + excite.current.icosa * 2.2;
    }
    if (ring.current) {
      ring.current.rotation.z = reduced ? 0 : t * 0.12;
      ring.current.visible = ringW > 0.02;
      ring.current.scale.setScalar(Math.max(ringW * 2.1, 0.001));
      const m = ring.current.material as THREE.MeshBasicMaterial;
      m.opacity = ringW * (0.4 + excite.current.ring * 0.5);
    }
    if (embers.current && !reduced) {
      embers.current.rotation.y = t * 0.03 + p.x * 0.15;
      const m = embers.current.material as THREE.PointsMaterial;
      const pos = embers.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        arr[i * 3 + 1] += delta * (0.25 + (i % 5) * 0.06);
        if (arr[i * 3 + 1] > 5) arr[i * 3 + 1] = -2;
      }
      pos.needsUpdate = true;
      m.opacity = 0.55 + Math.sin(t * 0.8) * 0.1;
    }

    cam.position.x = THREE.MathUtils.lerp(cam.position.x, p.x * 0.8, 0.03);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, 0.5 - p.y * 0.3 + prog * 0.4, 0.04);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, 9 - prog * 2.2, 0.05);
    cam.lookAt(0, 0.3, 0);
    void delta;
  });

  return (
    <group>
      <fog attach="fog" args={["#0d0805", 9, 22]} />
      <ambientLight intensity={0.45} color="#3a2c22" />
      <directionalLight position={[-4, 5, 6]} intensity={1.0} color="#ffe3c4" />
      <pointLight position={[3, -1, 3]} intensity={11} distance={14} color={EMBER} />
      <pointLight position={[-3, 2, -2]} intensity={8} distance={12} color={colors.accentCyan} />
      {/* Copper knot — craft */}
      <mesh ref={knot} name="knot" position={[-1.8, 0, 0]}>
        <torusKnotGeometry args={quality === "high" ? [1.0, 0.3, 200, 32] : [1.0, 0.3, 110, 20]} />
        <meshStandardMaterial
          ref={knotMat}
          color={COPPER}
          emissive={EMBER}
          emissiveIntensity={0.4}
          roughness={0.35}
          metalness={0.85}
        />
      </mesh>
      {/* Phosphor icosahedron — signal */}
      <group ref={icosa} name="icosa" position={[1.9, 0.2, -0.5]}>
        <mesh name="icosa">
          <icosahedronGeometry args={[1.05, 1]} />
          <meshStandardMaterial
            ref={icosaMat}
            color="#12241c"
            emissive={colors.accentCyan}
            emissiveIntensity={0.8}
            wireframe
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
      </group>
      {/* Ice ring — clarity, crowning late */}
      <mesh ref={ring} name="ring" position={[0, 0.4, -1]} rotation={[Math.PI / 2.3, 0, 0]} visible={false}>
        <torusGeometry args={[2.3, 0.025, 8, 90]} />
        <meshBasicMaterial color={ICE} transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Rising ember motes */}
      <points ref={embers} geometry={moteGeo}>
        <pointsMaterial
          color={EMBER}
          size={0.045}
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function findNamed(o: THREE.Object3D | null): string | null {
  let cur: THREE.Object3D | null | undefined = o;
  while (cur) {
    if (cur.name) return cur.name;
    cur = cur.parent;
  }
  return null;
}

export function EmberFormsScene({
  progress,
  quality = "high",
}: {
  progress: React.MutableRefObject<number>;
  quality?: CapabilityTier;
}) {
  const reduced = useMemo(() => prefersReducedMotion(), []);
  return (
    <Canvas
      camera={{ position: [0, 0.5, 9], fov: 50 }}
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
        <Forms progress={progress} quality={quality} />
      </Suspense>
    </Canvas>
  );
}
