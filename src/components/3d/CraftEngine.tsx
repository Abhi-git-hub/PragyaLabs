"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/config/tokens";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { CapabilityTier } from "@/hooks/use-device-capability";

const VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uProgress;
  uniform float uDisturb;
  uniform vec3 uPointer;
  varying float vEnergy;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  void main() {
    // Per-instance lattice anchor (instances carry translation only).
    vec3 base = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
    // State B — wave field.
    vec3 wave = base + vec3(
      0.0,
      sin(base.x * 0.8 + uTime * 0.9 + aSeed * 6.2831) * 0.9,
      cos(base.z * 0.7 + uTime * 0.7 + aSeed * 3.0) * 0.6
    );
    // State C — sphere shell reorganization.
    vec3 dir = normalize(base + vec3(0.0001));
    vec3 shell = dir * 3.4;
    float w1 = smoothstep(0.18, 0.45, uProgress) * (1.0 - smoothstep(0.62, 0.85, uProgress));
    // Finale: the shell releases back into field — the form becomes
    // material for whatever follows, never finishing into a dead ball.
    float release = 1.0 - smoothstep(0.9, 1.0, uProgress);
    float w2 = smoothstep(0.55, 0.8, uProgress) * release;
    vec3 p = mix(base, wave, w1);
    p = mix(p, shell, w2);
    // Pointer disturbance — a pressure field that pushes matter aside.
    vec3 toP = p - uPointer;
    float d = length(toP);
    float force = uDisturb * exp(-d * d * 0.35);
    p += (toP / max(d, 0.0001)) * force * 1.4;
    p += vec3(sin(uTime * 0.6 + aSeed * 12.0) * 0.05);
    vEnergy = clamp(w1 * 0.5 + w2 * 0.7 + force * 1.2, 0.0, 1.5);
    mat4 im = instanceMatrix;
    im[3].xyz = p;
    vec4 wp = modelMatrix * im * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewW = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uCyan;
  uniform vec3 uViolet;
  uniform vec3 uBone;
  varying float vEnergy;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(vViewW);
    float fres = pow(1.0 - abs(dot(N, V)), 2.0);
    vec3 col = mix(uBone * 0.22, uCyan, clamp(vEnergy, 0.0, 1.0));
    col = mix(col, uViolet, clamp(vEnergy - 0.55, 0.0, 1.0) * 0.8);
    col += fres * uCyan * 0.55;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * LATTICE ENGINE — an original realtime composition. Sixteen hundred
 * instanced nodes run FORM → MOTION → DISTORTION → INFORMATION → FORM:
 * a precise lattice, pointer pressure, wave disorder, sphere-shell
 * reorganization, and a wireframe core anchoring the new state.
 * Procedural geometry + one shader + light. Nothing else.
 */
function Lattice({
  progress,
  quality,
}: {
  progress: React.MutableRefObject<number>;
  quality: CapabilityTier;
}) {
  const core = useRef<THREE.Mesh>(null!);
  const coreMat = useRef<THREE.MeshBasicMaterial>(null!);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const dims = quality === "high" ? [18, 11, 8] : [11, 7, 6];
  const total = dims[0] * dims[1] * dims[2];

  const geometry = useMemo(() => {
    const [nx, ny, nz] = dims;
    const geo = new THREE.OctahedronGeometry(0.05);
    const seeds = new Float32Array(nx * ny * nz);
    const m = new THREE.Matrix4();
    const im = new Float32Array(nx * ny * nz * 16);
    let i = 0;
    for (let x = 0; x < nx; x++) {
      for (let y = 0; y < ny; y++) {
        for (let z = 0; z < nz; z++) {
          m.makeTranslation(
            (x / (nx - 1) - 0.5) * 9.4,
            (y / (ny - 1) - 0.5) * 5.5,
            (z / (nz - 1) - 0.5) * 3.9
          );
          m.toArray(im, i * 16);
          seeds[i] = Math.random();
          i++;
        }
      }
    }
    geo.setAttribute("instanceMatrix", new THREE.InstancedBufferAttribute(im, 16));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return geo;
  }, [quality, dims]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uDisturb: { value: 0.55 },
      uPointer: { value: new THREE.Vector3(0, 0, 0) },
      uCyan: { value: new THREE.Color(colors.accentCyan) },
      uViolet: { value: new THREE.Color(colors.accentViolet) },
      uBone: { value: new THREE.Color(colors.foreground) },
    }),
    []
  );

  const material = useMemo(
    () => new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG }),
    [uniforms]
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = state.pointer;
    const prog = reduced ? 0.2 : progress.current;
    const cam = state.camera;
    uniforms.uTime.value = t;
    uniforms.uProgress.value = THREE.MathUtils.lerp(uniforms.uProgress.value, prog, 0.08);
    // Disturbance peaks mid-travel, settles as language arrives.
    const disturb = 0.35 + 0.65 * Math.sin(Math.min(prog, 1) * Math.PI);
    uniforms.uDisturb.value = THREE.MathUtils.lerp(uniforms.uDisturb.value, disturb, 0.05);
    uniforms.uPointer.value.set(p.x * 5, p.y * 3, Math.sin(t * 0.4) * 1.2);
    // Camera: drift + pointer + scroll dolly into the new state.
    const up = uniforms.uProgress.value;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, p.x * 0.9, 0.03);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, -p.y * 0.5, 0.03);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, 10 - up * 4.2, 0.05);
    cam.lookAt(0, 0, 0);
    // The core anchors the late state, then dissolves with the shell —
    // form becomes field again, ready to be the next transformation.
    if (core.current && coreMat.current) {
      const g = THREE.MathUtils.smoothstep(up, 0.78, 0.92) * (1 - THREE.MathUtils.smoothstep(up, 0.93, 1));
      core.current.scale.setScalar(Math.max(g * 2.3, 0.0001));
      core.current.rotation.y = t * 0.15;
      core.current.rotation.x = t * 0.08;
      coreMat.current.opacity = g * 0.75;
      core.current.visible = g > 0.01;
    }
  });

  return (
    <group>
      <fog attach="fog" args={[colors.background, 9, 22]} />
      <ambientLight intensity={0.4} color="#2a3350" />
      <directionalLight position={[-4, 5, 6]} intensity={1.1} color="#cfe4ff" />
      <pointLight position={[3, -2, 3]} intensity={9} distance={14} color={colors.accentViolet} />
      <instancedMesh args={[geometry, material, total]} frustumCulled={false} />
      <mesh ref={core} visible={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial ref={coreMat} color={colors.accentCyan} wireframe transparent opacity={0} />
      </mesh>
    </group>
  );
}

export function CraftEngineScene({
  progress,
  quality = "high",
}: {
  progress: React.MutableRefObject<number>;
  quality?: CapabilityTier;
}) {
  const reduced = useMemo(() => prefersReducedMotion(), []);
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
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
        <Lattice progress={progress} quality={quality} />
      </Suspense>
    </Canvas>
  );
}
