"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/config/tokens";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { CapabilityTier } from "@/hooks/use-device-capability";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

/** Real words from the live product — verified at saarthians.online. */
const STATIONS = [
  {
    word: "SAARTHIANS",
    title: "Saarthi Classes · Shahdara, Delhi",
    body: "Where Shahdara comes to understand. Classes 9–12 in every subject, with NEET and JEE coaching built in.",
  },
  {
    word: "6 PROGRAMS",
    title: "Classes 9–12 · NEET · JEE",
    body: "Six focused tracks. One rhythm: understand, practice, review, improve.",
  },
  {
    word: "CAPABLE",
    title: "Teaching that treats every child as capable",
    body: "Personal attention. Concepts before shortcuts. Progress you can see.",
  },
  {
    word: "WORKSPACE",
    title: "Understand in class. Prove it in the workspace.",
    body: "Notes, assignments, server-graded tests. Doubts cleared daily.",
  },
  {
    word: "LIVE",
    title: "saarthians.online",
    body: "267, Gali No. 16, Balbir Nagar Extension, Shahdara, Delhi. Visit link on the case page.",
  },
];

function wordTexture(word: string, accent: boolean): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 1024, 256);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 120px Arial, sans-serif";
  ctx.fillStyle = accent ? "#35e9ff" : "rgba(244,243,236,0.92)";
  ctx.fillText(word, 512, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function Space({
  progress,
  quality,
}: {
  progress: React.MutableRefObject<number>;
  quality: CapabilityTier;
}) {
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const ring = useRef<THREE.Mesh>(null!);
  const panels = useMemo(() => STATIONS.map((s, i) => wordTexture(s.word, i === STATIONS.length - 1)), []);

  const motes = useMemo(() => {
    const count = quality === "high" ? 300 : 110;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = 6 - Math.random() * 20;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [quality]);

  useEffect(
    () => () => {
      panels.forEach((p) => p.dispose());
      motes.dispose();
    },
    [panels, motes]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = state.pointer;
    const cam = state.camera;
    // Camera travels the depth between stations as scroll progresses.
    const z = THREE.MathUtils.lerp(7.5, -7.5, progress.current);
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, p.x * 0.9, 0.04);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, 0.4 - p.y * 0.4, 0.04);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, reduced ? 0.5 : z, 0.06);
    cam.lookAt(0, 0.2, -12);
    if (!reduced && ring.current) ring.current.rotation.z = t * 0.12;
  });

  return (
    <>
      <fog attach="fog" args={[colors.background, 6, 20]} />
      <ambientLight intensity={0.4} color="#2a3350" />
      <pointLight position={[-3, 2, 2]} intensity={12} distance={12} color={colors.accentCyan} />
      <pointLight position={[3, -1, -6]} intensity={10} distance={12} color={colors.accentViolet} />
      {STATIONS.map((s, i) => {
        void s;
        const z = 4 - i * 3.6;
        return (
          <mesh key={i} position={[(i % 2 === 0 ? -1.4 : 1.4) * (i === 0 || i === 4 ? 0 : 1), 0.3, z]}>
            <planeGeometry args={[7.2, 1.8]} />
            <meshBasicMaterial map={panels[i]} transparent opacity={0.95} depthWrite={false} />
          </mesh>
        );
      })}
      {/* Orbital echo of the studio */}
      <mesh ref={ring} position={[0, 0.2, -12]} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.6, 0.03, 8, 80]} />
        <meshBasicMaterial color={colors.accentCyan} transparent opacity={0.5} />
      </mesh>
      <points geometry={motes}>
        <pointsMaterial
          color={colors.accentCyan}
          size={0.03}
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

const SpaceCanvas = dynamic(
  () =>
    Promise.resolve(function SpaceCanvasInner({
      progress,
      quality,
    }: {
      progress: React.MutableRefObject<number>;
      quality: CapabilityTier;
    }) {
      const reduced = useMemo(() => prefersReducedMotion(), []);
      return (
        <Canvas
          dpr={quality === "high" ? [1, 1.75] : [1, 1]}
          gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance" }}
          frameloop={reduced ? "demand" : "always"}
          aria-hidden="true"
        >
          <Suspense fallback={null}>
            <Space progress={progress} quality={quality} />
          </Suspense>
        </Canvas>
      );
    }),
  { ssr: false, loading: () => <div className="h-full w-full bg-void" aria-hidden="true" /> }
);

/**
 * Saarthians world — the first project world. A scroll-driven travel
 * through the REAL product's words (verified at saarthians.online):
 * place → programs → philosophy → workspace → live address.
 * No cards, no invented UI, no AI interface.
 */
export function SaarthiansSpace({ quality }: { quality: CapabilityTier }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const progress = useRef(0);
  const [station, setStation] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    registerMotion();
    setReduced(prefersReducedMotion());
    const el = wrapRef.current;
    if (!el || prefersReducedMotion() || !motionAllowed()) return;
    const tween = gsap.to(progress, {
      current: 1,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          setStation((prev) => {
            const next = Math.min(STATIONS.length - 1, Math.floor(self.progress * STATIONS.length));
            return next === prev ? prev : next;
          });
        },
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[340vh]" data-cursor="EXPLORE">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <SpaceCanvas progress={progress} quality={quality} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-transparent to-void" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[var(--pl-container)] flex-col justify-end px-[var(--pl-gutter)] pb-20">
          {reduced ? (
            <ol className="space-y-8">
              {STATIONS.map((s, i) => (
                <li key={s.word}>
                  <p className="meta text-cyan">0{i + 1}</p>
                  <h3 className="mt-2 font-display text-2xl uppercase">{s.title}</h3>
                  <p className="mt-2 max-w-[52ch] text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          ) : (
            <div key={station} className="max-w-[60ch]">
              <p className="meta text-cyan">
                0{station + 1} / 0{STATIONS.length}
              </p>
              <h3 className="mt-3 font-display text-3xl uppercase leading-tight md:text-5xl">
                {STATIONS[station].title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted">{STATIONS[station].body}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
