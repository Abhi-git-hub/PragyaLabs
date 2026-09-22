"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/config/tokens";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { CapabilityTier } from "@/hooks/use-device-capability";

export type ScrollProgressRef = { current: number };
export type IntroProgressRef = { current: number };

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Pragya Core — production scene (Phase 2).
 * Faceted computation object: crystal core + energy lattice + intelligence
 * seed + chrome orbit rings + orbital particle shell.
 * - Pointer parallax tilt + lighting response (lerped).
 * - Scroll-aware descent/rotation/scale via shared progress ref.
 * - Materialize-in via shared intro ref (driven by the hero load timeline).
 * - Quality tiers: high (260 shell pts, dpr ≤1.75) / reduced (90 pts, dpr 1).
 * - Static poster frame under reduced motion.
 */
function CoreRig({
  scrollRef,
  introRef,
  quality,
}: {
  scrollRef?: ScrollProgressRef;
  introRef?: IntroProgressRef;
  quality: CapabilityTier;
}) {
  const group = useRef<THREE.Group>(null!);
  const ringA = useRef<THREE.Mesh>(null!);
  const ringB = useRef<THREE.Mesh>(null!);
  const cyanLight = useRef<THREE.PointLight>(null!);
  const violetLight = useRef<THREE.PointLight>(null!);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null!);
  const latticeMat = useRef<THREE.MeshBasicMaterial>(null!);
  const seedMat = useRef<THREE.MeshStandardMaterial>(null!);
  const chromeMat = useRef<THREE.MeshStandardMaterial>(null!);
  const ringGlowMat = useRef<THREE.MeshBasicMaterial>(null!);
  const shellMat = useRef<THREE.PointsMaterial>(null!);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const shell = useMemo(() => {
    const count = quality === "high" ? 260 : 90;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.1 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [quality]);

  useFrame((state, delta) => {
    const intro = easeOutCubic(THREE.MathUtils.clamp(introRef?.current ?? 1, 0, 1));
    const g = group.current;

    // Materialize: fade + grow. Runs even in reduced mode so the hero
    // timeline's end state is reachable without animation elsewhere.
    coreMat.current.opacity = intro;
    latticeMat.current.opacity = 0.28 * intro;
    seedMat.current.opacity = intro;
    chromeMat.current.opacity = intro;
    ringGlowMat.current.opacity = 0.85 * intro;
    shellMat.current.opacity = 0.7 * intro;
    g.visible = intro > 0.01;

    if (reduced) {
      g.scale.setScalar(0.85 + 0.15 * intro);
      return;
    }

    const t = state.clock.elapsedTime;
    const p = state.pointer; // -1..1, provided by R3F
    const s = scrollRef?.current ?? 0;

    // Pointer parallax (lerped) + slow idle spin + scroll descent.
    g.rotation.y += delta * (0.12 + s * 0.5);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, p.y * -0.28, 0.04);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, p.x * 0.12, 0.04);
    g.position.y = -s * 1.4;
    g.scale.setScalar((0.8 + 0.2 * intro) * (1 - s * 0.18));

    // Lighting response: pointer drags the energy lights across the crystal.
    cyanLight.current.intensity = 18 + p.x * 7 + intro * 4;
    violetLight.current.intensity = 14 - p.x * 5 + intro * 3;
    cyanLight.current.position.x = -4 + p.x * 2.5;
    violetLight.current.position.y = 3 - p.y * 2;

    ringA.current.rotation.z = t * 0.25;
    ringB.current.rotation.z = -t * 0.18;
  });

  return (
    <group ref={group}>
      {/* Energy lights ride with the rig so pointer response stays composed */}
      <pointLight ref={cyanLight} position={[-4, -2, 3]} intensity={18} color={colors.accentCyan} />
      <pointLight ref={violetLight} position={[4, 3, -2]} intensity={14} color={colors.accentViolet} />
      {/* Faceted core */}
      <mesh>
        <icosahedronGeometry args={[1.15, 0]} />
        <meshStandardMaterial
          ref={coreMat}
          color="#101218"
          metalness={0.9}
          roughness={0.18}
          flatShading
          transparent
        />
      </mesh>
      {/* Energy lattice overlay */}
      <mesh scale={1.002}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial
          ref={latticeMat}
          color={colors.accentCyan}
          wireframe
          transparent
          opacity={0}
        />
      </mesh>
      {/* Inner intelligence seed */}
      <mesh scale={0.42}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          ref={seedMat}
          color={colors.accentViolet}
          emissive={colors.accentViolet}
          emissiveIntensity={1.6}
          roughness={0.3}
          transparent
        />
      </mesh>
      {/* Chrome orbit rings */}
      <mesh ref={ringA} rotation={[Math.PI / 2.4, 0.2, 0]}>
        <torusGeometry args={[1.9, 0.09, 16, 128]} />
        <meshStandardMaterial
          ref={chromeMat}
          color="#c9ccd4"
          metalness={1}
          roughness={0.22}
          transparent
        />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 1.7, -0.35, 0.4]}>
        <torusGeometry args={[2.35, 0.022, 8, 160]} />
        <meshBasicMaterial ref={ringGlowMat} color={colors.accentCyan} transparent opacity={0} />
      </mesh>
      {/* Orbital particle shell */}
      <points geometry={shell}>
        <pointsMaterial
          ref={shellMat}
          color={colors.accentCyan}
          size={0.025}
          transparent
          opacity={0}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export function PragyaCoreScene({
  scrollRef,
  introRef,
  quality = "high",
}: {
  scrollRef?: ScrollProgressRef;
  introRef?: IntroProgressRef;
  quality?: CapabilityTier;
}) {
  const reduced = useMemo(() => prefersReducedMotion(), []);
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 42 }}
      dpr={quality === "high" ? [1, 1.75] : [1, 1]}
      gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance" }}
      frameloop={reduced ? "demand" : "always"}
      aria-hidden="true"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 6]} intensity={1.4} color="#ffffff" />
      <CoreRig scrollRef={scrollRef} introRef={introRef} quality={quality} />
    </Canvas>
  );
}
