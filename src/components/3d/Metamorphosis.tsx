"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/config/tokens";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { CapabilityTier } from "@/hooks/use-device-capability";

const FRESNEL_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vV = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRESNEL_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.5);
    gl_FragColor = vec4(uColor, f * uIntensity);
  }
`;

/**
 * METAMORPHOSIS — one procedural system, three states, zero footage.
 * A wireframe seed (FORM) ignites into a bronze-green torus knot (ENERGY)
 * that unwinds into a rising helix (SIGNAL). Pointer hovers spike emissive
 * on live geometry; scroll morphs states; the room itself travels from
 * obsidian into deep green-black. FORM → ENERGY → SIGNAL.
 */
function Engine({
  progress,
  quality,
}: {
  progress: React.MutableRefObject<number>;
  quality: CapabilityTier;
}) {
  const seed = useRef<THREE.Group>(null!);
  const knot = useRef<THREE.Mesh>(null!);
  const knotMat = useRef<THREE.MeshStandardMaterial>(null!);
  const helix = useRef<THREE.InstancedMesh>(null!);
  const shellMat = useRef<THREE.ShaderMaterial>(null!);
  const bg = useRef<THREE.Color>(new THREE.Color(colors.background));
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const { gl, scene } = useThree();
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const hovered = useRef<string | null>(null);
  const iceLight = useRef<THREE.PointLight>(null!);

  const HELIX = quality === "high" ? 220 : 110;

  const helixData = useMemo(() => {
    const pts: Array<{ r: number; a: number; y: number; s: number }> = [];
    for (let i = 0; i < HELIX; i++) {
      const f = i / HELIX;
      pts.push({ r: 1.7 - f * 0.5, a: f * Math.PI * 7, y: -2.4 + f * 4.8, s: 0.5 + Math.random() * 0.8 });
    }
    return pts;
  }, [quality]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = state.pointer;
    const prog = reduced ? 0.34 : progress.current;
    const cam = state.camera;

    // State windows: seed reigns early, knot mid, helix late — crossfaded.
    const seedW = 1 - THREE.MathUtils.smoothstep(prog, 0.22, 0.42);
    const knotW = THREE.MathUtils.smoothstep(prog, 0.3, 0.5) * (1 - THREE.MathUtils.smoothstep(prog, 0.68, 0.86));
    const helixW = THREE.MathUtils.smoothstep(prog, 0.62, 0.85);

    // Hover raycast — the pointer touches live geometry.
    let hov: string | null = null;
    if (!reduced) {
      ray.setFromCamera(new THREE.Vector2(p.x, p.y), cam);
      const targets: THREE.Object3D[] = [];
      if (seed.current) targets.push(seed.current);
      if (knot.current) targets.push(knot.current);
      const hits = ray.intersectObjects(targets, false);
      hov = hits.length > 0 ? hits[0].object.name : null;
    }
    hovered.current = hov;
    const excite = hov ? 1 : 0;

    // Seed: slow tumble, leans toward the pointer, excites on hover.
    if (seed.current) {
      seed.current.rotation.y = reduced ? 0.5 : t * 0.18;
      seed.current.rotation.x = THREE.MathUtils.lerp(seed.current.rotation.x, -p.y * 0.35, 0.04);
      seed.current.rotation.z = THREE.MathUtils.lerp(seed.current.rotation.z, p.x * 0.2, 0.04);
      seed.current.visible = seedW > 0.02;
      seed.current.scale.setScalar(Math.max(seedW, 0.001));
      seed.current.children.forEach((c) => {
        const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (m.emissiveIntensity !== undefined) m.emissiveIntensity = 0.7 + excite * 1.6;
      });
    }
    // Knot: rises rotating, breathes with hover.
    if (knot.current) {
      knot.current.rotation.y = reduced ? 0.3 : t * 0.22;
      knot.current.rotation.x = Math.sin(t * 0.2) * 0.25;
      knot.current.visible = knotW > 0.02;
      knot.current.scale.setScalar(Math.max(knotW * (1 + excite * 0.08), 0.001));
      if (knotMat.current) knotMat.current.emissiveIntensity = 0.35 + excite * 1.4 + knotW * 0.3;
    }
    // Helix: instanced beads climbing, swirl follows pointer.
    if (helix.current) {
      helix.current.visible = helixW > 0.02;
      helix.current.rotation.y = (reduced ? 0.4 : t * 0.25) + p.x * 0.4;
      const m = helix.current.material as THREE.MeshBasicMaterial;
      m.opacity = helixW * 0.9;
    }
    if (shellMat.current) shellMat.current.uniforms.uIntensity.value = seedW * (0.5 + excite * 0.9);
    // Ice rim strengthens as the room greens — the color journey in light.
    if (iceLight.current) iceLight.current.intensity = 3 + prog * 11;

    // The room travels too: obsidian → deep green-black → graphite lift.
    const c = bg.current;
    if (prog < 0.5) c.lerpColors(new THREE.Color("#050608"), new THREE.Color("#07110e"), prog * 2);
    else c.lerpColors(new THREE.Color("#07110e"), new THREE.Color("#0b0f12"), (prog - 0.5) * 2);
    scene.background = c;
    gl.setClearColor(c, 1);

    // Camera: gentle push-in with pointer drift.
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, p.x * 0.7, 0.03);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, 0.4 - p.y * 0.3 + prog * 0.5, 0.04);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, 8.5 - prog * 1.6, 0.04);
    cam.lookAt(0, 0.3, 0);
  });

  return (
    <group>
      <ambientLight intensity={0.5} color="#24352c" />
      <directionalLight position={[-4, 5, 6]} intensity={1.0} color="#d8efe2" />
      <pointLight position={[3, -1, 3]} intensity={10} distance={14} color={colors.accentCyan} />
      <pointLight ref={iceLight} position={[-4, 3, -2]} intensity={3} distance={16} color={colors.accentBlue} />
      <ChamberEcho />
      {/* STATE 1 — FORM: precise wireframe seed + fresnel aura */}
      <group ref={seed} name="seed">
        <mesh name="seed">
          <icosahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial
            color="#1a2223"
            emissive={colors.accentCyan}
            emissiveIntensity={0.7}
            wireframe
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
        <mesh scale={1.25}>
          <icosahedronGeometry args={[1.5, 2]} />
          <shaderMaterial
            ref={shellMat}
            args={[
              {
                uniforms: { uColor: { value: new THREE.Color(colors.accentCyan) }, uIntensity: { value: 0.5 } },
                vertexShader: FRESNEL_VERT,
                fragmentShader: FRESNEL_FRAG,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
              },
            ]}
          />
        </mesh>
      </group>
      {/* STATE 2 — ENERGY: bronze-green knot */}
      <mesh ref={knot} name="knot" visible={false}>
        <torusKnotGeometry args={quality === "high" ? [1.05, 0.3, 220, 36] : [1.05, 0.3, 120, 24]} />
        <meshStandardMaterial
          ref={knotMat}
          color="#2a3a32"
          emissive={colors.accentViolet}
          emissiveIntensity={0.35}
          roughness={0.32}
          metalness={0.9}
        />
      </mesh>
      {/* STATE 3 — SIGNAL: rising helix of instanced beads */}
      <instancedMesh
        ref={helix}
        args={[undefined, undefined, HELIX]}
        visible={false}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color={colors.accentCyan} transparent opacity={0} depthWrite={false} />
      </instancedMesh>
      <HelixPlacer helixRef={helix} data={helixData} />
    </group>
  );
}

/** Places helix beads after mount — parametric, no per-frame React state. */
function HelixPlacer({
  helixRef,
  data,
}: {
  helixRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  data: Array<{ r: number; a: number; y: number; s: number }>;
}) {
  useEffect(() => {
    const mesh = helixRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();
    data.forEach((d, i) => {
      v.set(Math.cos(d.a) * d.r, d.y, Math.sin(d.a) * d.r);
      sc.setScalar(d.s);
      m.compose(v, q, sc);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [helixRef, data]);
  return null;
}

/**
 * ChamberEcho — the opening world's matter returns: dark rubber floor
 * and ribbed shutter monoliths flank the lattice. Same studio, same matter.
 */
function ChamberEcho() {
  const [rubber, shutter] = useLoader(THREE.TextureLoader, [
    "/textures/rubber--web.jpg",
    "/textures/shutter--web.jpg",
  ]);
  const maps = useMemo(() => {
    for (const [t, rx, ry] of [
      [rubber, 5, 5],
      [shutter, 1.5, 2],
    ] as Array<[THREE.Texture, number, number]>) {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    }
    return { rubber, shutter };
  }, [rubber, shutter]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.4, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial map={maps.rubber} color="#8a8d94" roughness={0.92} metalness={0.08} />
      </mesh>
      {[-6.4, 6.4].map((x) => (
        <mesh key={x} position={[x, 0.5, -2]}>
          <boxGeometry args={[1.4, 8, 1.4]} />
          <meshStandardMaterial map={maps.shutter} color="#9a9da3" roughness={0.7} metalness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

export function MetamorphosisScene({
  progress,
  quality = "high",
}: {
  progress: React.MutableRefObject<number>;
  quality?: CapabilityTier;
}) {
  const reduced = useMemo(() => prefersReducedMotion(), []);
  return (
    <Canvas
      camera={{ position: [0, 0.4, 8.5], fov: 50 }}
      dpr={quality === "high" ? [1, 1.75] : [1, 1]}
      gl={{ antialias: quality === "high", alpha: false, powerPreference: "high-performance" }}
      frameloop={reduced ? "demand" : "always"}
      aria-hidden="true"
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
    >
      <Suspense fallback={null}>
        <Engine progress={progress} quality={quality} />
      </Suspense>
    </Canvas>
  );
}
