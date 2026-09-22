"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/config/tokens";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export type ScrollProgressRef = { current: number };

/**
 * Pragya Core — technical prototype (NOT the final hero).
 * Crystalline computation-object placeholder: faceted core + chrome rings
 * + orbital particle shell. Pointer-reactive tilt, scroll-aware descent.
 * Static poster frame under reduced motion.
 */
function CoreRig({ scrollRef }: { scrollRef?: ScrollProgressRef }) {
  const group = useRef<THREE.Group>(null!);
  const ringA = useRef<THREE.Mesh>(null!);
  const ringB = useRef<THREE.Mesh>(null!);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const shell = useMemo(() => {
    const count = 260;
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
  }, []);

  useFrame((state, delta) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    const p = state.pointer; // -1..1, provided by R3F
    const s = scrollRef?.current ?? 0;
    const g = group.current;

    // Pointer parallax (lerped) + slow idle spin + scroll descent.
    g.rotation.y += delta * (0.12 + s * 0.5);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, p.y * -0.28, 0.04);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, p.x * 0.12, 0.04);
    g.position.y = -s * 1.4;
    const scale = 1 - s * 0.18;
    g.scale.setScalar(scale);

    ringA.current.rotation.z = t * 0.25;
    ringB.current.rotation.z = -t * 0.18;
  });

  return (
    <group ref={group}>
      {/* Faceted core */}
      <mesh>
        <icosahedronGeometry args={[1.15, 0]} />
        <meshStandardMaterial color="#101218" metalness={0.9} roughness={0.18} flatShading />
      </mesh>
      {/* Energy lattice overlay */}
      <mesh scale={1.002}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial color={colors.accentCyan} wireframe transparent opacity={0.28} />
      </mesh>
      {/* Inner intelligence seed */}
      <mesh scale={0.42}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={colors.accentViolet}
          emissive={colors.accentViolet}
          emissiveIntensity={1.6}
          roughness={0.3}
        />
      </mesh>
      {/* Chrome orbit rings */}
      <mesh ref={ringA} rotation={[Math.PI / 2.4, 0.2, 0]}>
        <torusGeometry args={[1.9, 0.09, 16, 128]} />
        <meshStandardMaterial color="#c9ccd4" metalness={1} roughness={0.22} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 1.7, -0.35, 0.4]}>
        <torusGeometry args={[2.35, 0.022, 8, 160]} />
        <meshBasicMaterial color={colors.accentCyan} transparent opacity={0.85} />
      </mesh>
      {/* Orbital particle shell */}
      <points geometry={shell}>
        <pointsMaterial
          color={colors.accentCyan}
          size={0.025}
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export function PragyaCoreScene({ scrollRef }: { scrollRef?: ScrollProgressRef }) {
  const reduced = useMemo(() => prefersReducedMotion(), []);
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={reduced ? "demand" : "always"}
      aria-hidden="true"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 6]} intensity={1.4} color="#ffffff" />
      <pointLight position={[-4, -2, 3]} intensity={18} color={colors.accentCyan} />
      <pointLight position={[4, 3, -2]} intensity={14} color={colors.accentViolet} />
      <CoreRig scrollRef={scrollRef} />
    </Canvas>
  );
}
