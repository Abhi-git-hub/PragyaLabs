"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/config/tokens";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { CapabilityTier } from "@/hooks/use-device-capability";
import type { ScrollProgressRef, IntroProgressRef } from "./PragyaCoreScene";

const TEX_URLS = [
  "/textures/pipes--web.jpg",
  "/textures/plaster--web.jpg",
  "/textures/rubber--web.jpg",
  "/textures/shutter--web.jpg",
  "/textures/bluemetal--web.jpg",
  "/textures/instrument--web.jpg",
] as const;

function prepare(t: THREE.Texture, rx: number, ry: number): THREE.Texture {
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Staged window: maps intro 0..1 into a 0..1 ramp between two marks. */
function windowed(intro: number, from: number, to: number): number {
  const t = THREE.MathUtils.clamp((intro - from) / Math.max(to - from, 0.001), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Soft radial sheen — faked floor bounce under the beacon. */
function useSheen(): THREE.Texture {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,0.85)");
    g.addColorStop(0.5, "rgba(255,255,255,0.25)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
}

const RINGS = 7;

/**
 * THE BEACON — a transmitter assembling itself as you arrive.
 * Seven rings orbit a phosphor core; satellites trace its signal.
 * Scroll disperses it into the journey — arrival becomes departure.
 * The one object the opening is about.
 */
function Beacon({
  pointer,
  introRef,
  scroll,
  beat,
}: {
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  introRef?: IntroProgressRef;
  scroll: React.MutableRefObject<number>;
  beat?: React.MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null!);
  const rings = useRef<Array<THREE.Mesh | null>>([]);
  const sats = useRef<Array<THREE.Mesh | null>>([]);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null!);
  const beaconLight = useRef<THREE.PointLight>(null!);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  useFrame((state, delta) => {
    const intro = THREE.MathUtils.clamp(introRef?.current ?? 1, 0, 1);
    const s = scroll.current;
    const t = state.clock.elapsedTime;
    const g = group.current;
    const rise = reduced ? 1 : windowed(intro, 0.2, 0.7);
    // Word-beat flare — each verb lands as light in the core.
    let flare = 0;
    if (beat && beat.current > 0 && !reduced) {
      flare = beat.current;
      beat.current = Math.max(0, beat.current - delta * 0.9);
    }
    // Assemble on arrival, disperse on scroll — one transformation.
    const spread = reduced ? 0 : s * 1.35;
    g.position.y = THREE.MathUtils.lerp(-0.9, 0.15, rise) + s * 1.1;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.current.x * 0.22, 0.04);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -pointer.current.y * 0.12, 0.04);
    const fade = 1 - s * 0.75;

    for (let i = 0; i < RINGS; i++) {
      const r = rings.current[i];
      if (!r) continue;
      const dir = i % 2 === 0 ? 1 : -1;
      r.rotation.z = reduced ? i * 0.4 : t * (0.12 + i * 0.035) * (1 + flare * 2.2) * dir + i * 0.35;
      r.position.y = (i - (RINGS - 1) / 2) * (0.34 + spread * 0.42);
      const m = r.material as THREE.MeshStandardMaterial;
      m.opacity = fade * rise;
      m.transparent = true;
    }
    sats.current.forEach((sat, i) => {
      if (!sat) return;
      const a = (reduced ? 1 : t * (0.3 + i * 0.12)) + (i * Math.PI * 2) / 3;
      const rr = 1.9 + spread * 1.3;
      sat.position.set(Math.cos(a) * rr, 0.4 + Math.sin(t * 0.5 + i) * 0.3 + spread * 0.8, Math.sin(a) * rr);
      const m = sat.material as THREE.MeshStandardMaterial;
      m.opacity = fade * rise;
      m.transparent = true;
    });
    if (coreMat.current) {
      coreMat.current.emissiveIntensity = (1.6 + Math.sin(t * 1.8) * 0.7 + flare * 2.4) * rise * fade + 0.15;
    }
    if (beaconLight.current) {
      beaconLight.current.intensity = (11 + flare * 22) * rise * fade;
    }
  });

  return (
    <group position={[2.2, 0, -0.9]}>
      <group ref={group} scale={1.18}>
        {Array.from({ length: RINGS }).map((_, i) => (
          <mesh
            key={i}
            ref={(m) => {
              rings.current[i] = m;
            }}
            rotation={[Math.PI / 2.15, 0.12 * i, 0]}
          >
            <torusGeometry args={[0.55 + i * 0.16, 0.032, 12, 64]} />
            <meshStandardMaterial color="#8f979e" roughness={0.35} metalness={0.9} />
          </mesh>
        ))}
        {/* Core column with phosphor slits */}
        <mesh>
          <cylinderGeometry args={[0.11, 0.14, 2.5, 16]} />
          <meshStandardMaterial color="#1c2026" roughness={0.5} metalness={0.7} />
        </mesh>
        {[0.5, 1.25, 2.0].map((y) => (
          <mesh key={y} position={[0, y - 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.125, 0.022, 8, 32]} />
            <meshStandardMaterial
              ref={y === 1.25 ? coreMat : undefined}
              color={colors.accentCyan}
              emissive={colors.accentCyan}
              emissiveIntensity={1.6}
            />
          </mesh>
        ))}
        {/* Signal satellites */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            ref={(m) => {
              sats.current[i] = m;
            }}
          >
            <sphereGeometry args={[i === 0 ? 0.07 : 0.045, 12, 12]} />
            <meshStandardMaterial
              color={i === 0 ? colors.accentCyan : colors.foreground}
              emissive={i === 0 ? colors.accentCyan : "#000000"}
              emissiveIntensity={i === 0 ? 2.5 : 0}
            />
          </mesh>
        ))}
        <pointLight ref={beaconLight} position={[0, 1, 0.6]} intensity={11} distance={8} color={colors.accentCyan} />
      </group>
      {/* Mast grounding the object in the architecture */}
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.16, 0.24, 1.7, 12]} />
        <meshStandardMaterial color="#3a4048" roughness={0.55} metalness={0.8} />
      </mesh>
    </group>
  );
}

function Chamber({
  scrollRef,
  introRef,
  beatRef,
  quality,
}: {
  scrollRef?: ScrollProgressRef;
  introRef?: IntroProgressRef;
  beatRef?: React.MutableRefObject<number>;
  quality: CapabilityTier;
}) {
  const rig = useRef<THREE.Group>(null!);
  const sweep = useRef<THREE.PointLight>(null!);
  const keyLight = useRef<THREE.DirectionalLight>(null!);
  const cyanLight = useRef<THREE.PointLight>(null!);
  const violetLight = useRef<THREE.PointLight>(null!);
  const warmLight = useRef<THREE.PointLight>(null!);
  const ambient = useRef<THREE.AmbientLight>(null!);
  const pointer = useRef({ x: 0, y: 0 });
  const dustMat = useRef<THREE.PointsMaterial>(null!);
  const sheenMat = useRef<THREE.MeshBasicMaterial>(null!);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const { gl, scene } = useThree();
  const [pipes, plaster, rubber, shutter, bluemetal, instrument] = useLoader(
    THREE.TextureLoader,
    [...TEX_URLS]
  );

  // Intentional dark-studio IBL: a black room with three cool strips.
  // No HDRI sky, no generic studio look — reflections stay directional.
  useEffect(() => {
    const env = new THREE.Scene();
    env.background = new THREE.Color("#000000");
    const strip = (color: string, intensity: number, w: number, h: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) })
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    strip("#c9fff0", 5.5, 6, 1.6, -6, 3.5, 1); // ice key, left
    strip("#168f62", 3.2, 4, 1.2, 6, 2, -1); // deep phosphor kicker, right
    strip("#3a4a44", 1.6, 8, 2, 0, 7, 0); // dim cold top
    const pmrem = new THREE.PMREMGenerator(gl);
    const envTex = pmrem.fromScene(env, 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.5;
    return () => {
      scene.environment = null;
      envTex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  const maps = useMemo(
    () => ({
      pipes: prepare(pipes, 3, 1),
      plaster: prepare(plaster, 2, 1),
      rubber: prepare(rubber, 5, 5),
      shutter: prepare(shutter, 1.5, 2),
      bluemetal: prepare(bluemetal, 1, 1),
      instrument: prepare(instrument, 1, 1),
    }),
    [pipes, plaster, rubber, shutter, bluemetal, instrument]
  );
  const sheen = useSheen();

  const dust = useMemo(() => {
    const count = quality === "high" ? 260 : 90;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = Math.random() * 6;
      positions[i * 3 + 2] = -4 + Math.random() * 6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [quality]);

  // Pure realtime — no video layers in the hero. The medium is the message.

  useFrame((state, delta) => {
    const intro = THREE.MathUtils.clamp(introRef?.current ?? 1, 0, 1);
    const s = scrollRef?.current ?? 0;
    const p = state.pointer;
    const t = state.clock.elapsedTime;
    const cam = state.camera;
    pointer.current.x = p.x;
    pointer.current.y = p.y;
    // The arrival staging: darkness → environment → object → identity.
    const lights = reduced ? 1 : windowed(intro, 0, 0.55);
    const haze = reduced ? 1 : windowed(intro, 0.35, 1);

    // Physically staged lighting rig — everything wakes in order.
    if (ambient.current) ambient.current.intensity = 0.5 * lights;
    if (keyLight.current) keyLight.current.intensity = 1.05 * lights;
    if (cyanLight.current) cyanLight.current.intensity = 18 * lights;
    if (violetLight.current) violetLight.current.intensity = 13 * lights;
    if (warmLight.current) warmLight.current.intensity = 8 * lights;

    if (!reduced) {
      // Slow approach + pointer parallax + scroll travel toward the beacon.
      const tz = 9.2 - intro * 1.4 - s * 2.6;
      cam.position.x = THREE.MathUtils.lerp(cam.position.x, p.x * 0.8, 0.03);
      cam.position.y = THREE.MathUtils.lerp(cam.position.y, 1.35 - p.y * 0.35 + s * 0.7, 0.04);
      cam.position.z = THREE.MathUtils.lerp(cam.position.z, tz, 0.03);
      cam.lookAt(-0.7, 1.2 - s * 0.4, -1.8);
      rig.current.rotation.y = p.x * 0.02;
      // Atmosphere breathes in with the haze window — dust then sheen.
      if (dustMat.current) dustMat.current.opacity = 0.55 * haze;
      if (sheenMat.current) sheenMat.current.opacity = 0.14 * haze;
      // Signal sweep — a slow rim light orbiting the beacon.
      if (sweep.current) {
        const a = t * 0.35;
        sweep.current.position.set(2.2 + Math.cos(a) * 2.8, 1.9 + Math.sin(t * 0.5) * 0.5, -0.9 + Math.sin(a) * 2.8);
        sweep.current.intensity = (6 + Math.sin(t * 0.7) * 1.5) * lights;
      }
    } else {
      cam.position.set(0, 1.35, 7.8);
      cam.lookAt(-0.7, 1.2, -1.8);
      if (sweep.current) sweep.current.intensity = 5;
    }
    void delta;
  });

  return (
    <group ref={rig}>
      <fog attach="fog" args={[colors.background, 11, 24]} />
      <ambientLight ref={ambient} intensity={0.5} color="#2a3350" />
      <directionalLight ref={keyLight} position={[-5, 6, 4]} intensity={1.05} color="#cfe8d8" />
      <pointLight ref={cyanLight} position={[-2.4, 1.6, -1.2]} intensity={18} distance={9} color={colors.accentCyan} />
      <pointLight ref={violetLight} position={[4.5, 2.5, -4]} intensity={13} distance={10} color={colors.accentViolet} />
      <pointLight ref={sweep} position={[5.7, 1.9, -2.6]} intensity={6} distance={8} color={colors.accentCyan} />
      {/* One restrained warm practical — the lamp in the dark */}
      <pointLight ref={warmLight} position={[-4.4, 2.6, -3.4]} intensity={8} distance={8} color="#ffb46b" />
      <mesh position={[-4.4, 2.6, -3.4]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial color="#ffcf99" />
      </mesh>

      {/* Floor — dark rubber, map doubled as roughness variation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          map={maps.rubber}
          roughnessMap={maps.rubber}
          color="#8a8d94"
          roughness={0.92}
          metalness={0.08}
        />
      </mesh>
      {/* Back wall — plaster */}
      <mesh position={[0, 4, -7]}>
        <planeGeometry args={[26, 10]} />
        <meshStandardMaterial map={maps.plaster} color="#6f7278" roughness={0.95} metalness={0} />
      </mesh>
      {/* Side columns — ribbed shutter */}
      {[-5.6, 5.6].map((x) => (
        <mesh key={x} position={[x, 3, -3.5]}>
          <boxGeometry args={[1.3, 7.5, 1.3]} />
          <meshStandardMaterial map={maps.shutter} color="#9a9da3" roughness={0.7} metalness={0.45} />
        </mesh>
      ))}
      {/* Foreground silhouettes — dark mass at the frame edges for depth */}
      <mesh position={[-4.6, 2.2, 2.4]} rotation={[0, 0.25, 0.06]}>
        <cylinderGeometry args={[0.5, 0.5, 9, 14]} />
        <meshStandardMaterial color="#0b0f12" roughness={0.85} metalness={0.3} />
      </mesh>
      <mesh position={[5.4, 1.6, 2.8]} rotation={[0, -0.2, -0.05]}>
        <cylinderGeometry args={[0.38, 0.38, 8, 14]} />
        <meshStandardMaterial color="#0b0f12" roughness={0.85} metalness={0.3} />
      </mesh>
      {/* Overhead pipe runs */}
      {[3.4, 4.0, 2.8].map((y, i) => (
        <group key={y}>
          <mesh position={[0, y, -4.6]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2 - i * 0.03, 0.2 - i * 0.03, 15, 20]} />
            <meshStandardMaterial
              map={maps.pipes}
              roughnessMap={maps.pipes}
              color="#b9bec6"
              roughness={0.5}
              metalness={0.85}
            />
          </mesh>
          {[-4, 0, 4].map((x) => (
            <mesh key={x} position={[x, y, -4.6]}>
              <torusGeometry args={[0.24 - i * 0.03, 0.05, 10, 20]} />
              <meshStandardMaterial color="#7d838c" roughness={0.45} metalness={0.85} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Vertical pipe drop */}
      <mesh position={[-3.4, 1.7, -4.6]}>
        <cylinderGeometry args={[0.17, 0.17, 3.4, 16]} />
        <meshStandardMaterial map={maps.pipes} color="#b9bec6" roughness={0.4} metalness={0.85} />
      </mesh>
      {/* Blue metal accent plate */}
      <mesh position={[5.6, 2.2, -2.8]} rotation={[0, -Math.PI / 2 + 0.15, 0]}>
        <boxGeometry args={[1.6, 2.2, 0.08]} />
        <meshStandardMaterial map={maps.bluemetal} color="#aebfd4" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Instrument console with lit face */}
      <group position={[-2.7, 0, -1.4]} rotation={[0, 0.38, 0]}>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[2.7, 1.4, 0.7]} />
          <meshStandardMaterial color="#22252b" roughness={0.6} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.78, 0.36]}>
          <planeGeometry args={[2.4, 1.15]} />
          <meshStandardMaterial
            map={maps.instrument}
            emissiveMap={maps.instrument}
            emissive="#c9fff0"
            emissiveIntensity={0.32}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
      </group>

      {/* THE BEACON — the object the opening is about */}
      <Beacon pointer={pointer} introRef={introRef} scroll={scrollRef ?? { current: 0 }} beat={beatRef} />
      {/* Faked floor bounce under the beacon */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.2, 0.02, -0.9]}>
        <planeGeometry args={[4.5, 4.5]} />
        <meshBasicMaterial
          ref={sheenMat}
          map={sheen}
          color={colors.accentCyan}
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Dust */}
      <points geometry={dust}>
        <pointsMaterial
          ref={dustMat}
          color={colors.accentCyan}
          size={0.03}
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export function SignalChamberScene({
  scrollRef,
  introRef,
  beatRef,
  quality = "high",
}: {
  scrollRef?: ScrollProgressRef;
  introRef?: IntroProgressRef;
  beatRef?: React.MutableRefObject<number>;
  quality?: CapabilityTier;
}) {
  const reduced = useMemo(() => prefersReducedMotion(), []);
  return (
    <Canvas
      camera={{ position: [0, 1.35, 9.2], fov: 46 }}
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
        <Chamber scrollRef={scrollRef} introRef={introRef} beatRef={beatRef} quality={quality} />
      </Suspense>
    </Canvas>
  );
}
