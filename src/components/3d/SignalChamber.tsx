"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/config/tokens";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { CapabilityTier } from "@/hooks/use-device-capability";
import type { ScrollProgressRef, IntroProgressRef } from "./PragyaCoreScene";

const TEX = {
  pipes: "/textures/pipes--web.jpg",
  plaster: "/textures/plaster--web.jpg",
  rubber: "/textures/rubber--web.jpg",
  shutter: "/textures/shutter--web.jpg",
  bluemetal: "/textures/bluemetal--web.jpg",
  instrument: "/textures/instrument--web.jpg",
};

function tex(url: string, rx = 1, ry = 1): THREE.Texture {
  const t = new THREE.TextureLoader().load(url);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Procedural parabolic dish — the signal motif, built not loaded. */
function Dish({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const geometry = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const r = (i / 20) * 1.15;
      pts.push(new THREE.Vector2(Math.max(r, 0.001), r * r * 0.5));
    }
    return new THREE.LatheGeometry(pts, 40);
  }, []);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#aeb6c2" metalness={0.65} roughness={0.32} side={THREE.DoubleSide} />
      </mesh>
      {/* Feed arm + signal tip */}
      <mesh position={[0, 0.42, 0.62]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
        <meshStandardMaterial color="#3a3f47" metalness={0.9} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.22, 0.98]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color={colors.accentCyan} emissive={colors.accentCyan} emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

function Chamber({
  scrollRef,
  introRef,
  quality,
}: {
  scrollRef?: ScrollProgressRef;
  introRef?: IntroProgressRef;
  quality: CapabilityTier;
}) {
  const rig = useRef<THREE.Group>(null!);
  const smokeMat = useRef<THREE.MeshBasicMaterial>(null!);
  const tipMat = useRef<THREE.MeshStandardMaterial>(null!);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const maps = useMemo(
    () => ({
      pipes: tex(TEX.pipes, 3, 1),
      plaster: tex(TEX.plaster, 2, 1),
      rubber: tex(TEX.rubber, 5, 5),
      shutter: tex(TEX.shutter, 1.5, 2),
      bluemetal: tex(TEX.bluemetal, 1, 1),
      instrument: tex(TEX.instrument, 1, 1),
    }),
    []
  );

  const dust = useMemo(() => {
    const count = quality === "high" ? 240 : 90;
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

  // Smoke film as masked volumetric layer (additive over black).
  const smokeTex = useMemo(() => {
    if (reduced || typeof document === "undefined") return null;
    const video = document.createElement("video");
    video.src = "/film/smoke--atmos.mp4";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.play().catch(() => undefined);
    const t = new THREE.VideoTexture(video);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [reduced]);

  useFrame((state, delta) => {
    const intro = THREE.MathUtils.clamp(introRef?.current ?? 1, 0, 1);
    const s = scrollRef?.current ?? 0;
    const p = state.pointer;
    const t = state.clock.elapsedTime;
    const cam = state.camera;

    if (!reduced) {
      // Slow approach + pointer parallax + scroll travel.
      const tz = 9.2 - intro * 1.4 - s * 2.4;
      cam.position.x = THREE.MathUtils.lerp(cam.position.x, p.x * 0.8, 0.03);
      cam.position.y = THREE.MathUtils.lerp(cam.position.y, 1.35 - p.y * 0.35 + s * 0.7, 0.04);
      cam.position.z = THREE.MathUtils.lerp(cam.position.z, tz, 0.03);
      cam.lookAt(0, 1.3 - s * 0.4, -2.5);
      rig.current.rotation.y = p.x * 0.02;
      if (smokeMat.current) smokeMat.current.opacity = 0.3 * intro * (1 - s * 0.6);
      if (tipMat.current) tipMat.current.emissiveIntensity = 2.4 + Math.sin(t * 2.2) * 1.1 + intro;
    } else {
      cam.position.set(0, 1.35, 7.8);
      cam.lookAt(0, 1.3, -2.5);
      if (smokeMat.current) smokeMat.current.opacity = 0;
    }
    void delta;
  });

  return (
    <group ref={rig}>
      <fog attach="fog" args={[colors.background, 10, 22]} />
      <ambientLight intensity={0.32} color="#2a3350" />
      <directionalLight position={[-5, 6, 4]} intensity={0.85} color="#9db8ff" />
      <pointLight position={[-2.4, 1.6, -1.2]} intensity={14} distance={9} color={colors.accentCyan} />
      <pointLight position={[4.5, 2.5, -4]} intensity={11} distance={10} color={colors.accentViolet} />
      {/* One restrained warm practical — the lamp in the dark */}
      <pointLight position={[-4.4, 2.6, -3.4]} intensity={7} distance={8} color="#ffb46b" />
      <mesh position={[-4.4, 2.6, -3.4]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial color="#ffcf99" />
      </mesh>

      {/* Floor — dark rubber */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial map={maps.rubber} color="#8a8d94" roughness={0.92} metalness={0.08} />
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
      {/* Overhead pipe runs */}
      {[3.4, 4.0, 2.8].map((y, i) => (
        <group key={y}>
          <mesh position={[0, y, -4.6]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2 - i * 0.03, 0.2 - i * 0.03, 15, 20]} />
            <meshStandardMaterial map={maps.pipes} color="#b9bec6" roughness={0.38} metalness={0.85} />
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
            emissive="#9fd8ff"
            emissiveIntensity={0.5}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
      </group>

      {/* The antenna — hero anchor, abstracted in 3D */}
      <Dish position={[2.9, 0.4, -2.6]} rotation={[-0.5, -0.5, 0.15]} />
      <mesh position={[2.9, 1.1, -2.6]}>
        <cylinderGeometry args={[0.09, 0.13, 2.2, 12]} />
        <meshStandardMaterial color="#565c66" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Smoke volumetric layer */}
      {smokeTex && (
        <mesh position={[0, 2.6, -0.8]}>
          <planeGeometry args={[17, 9.5]} />
          <meshBasicMaterial
            ref={smokeMat}
            map={smokeTex}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      {/* Dust */}
      <points geometry={dust}>
        <pointsMaterial
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
  quality = "high",
}: {
  scrollRef?: ScrollProgressRef;
  introRef?: IntroProgressRef;
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
    >
      <Chamber scrollRef={scrollRef} introRef={introRef} quality={quality} />
    </Canvas>
  );
}
