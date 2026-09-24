"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useDeviceCapability } from "@/hooks/use-device-capability";
import { usePrefersReducedMotion, prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

const PHOTO_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uWave;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(uv.x * 9.0 + uTime * 1.1) * sin(uv.y * 7.0 + uTime * 0.8) * 0.07 * uWave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const PHOTO_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  void main() {
    vec3 tex = texture2D(uMap, vUv).rgb;
    // Gentle vignette keeps the frame cinematic.
    vec2 d = vUv - 0.5;
    float v = smoothstep(0.85, 0.35, length(d));
    gl_FragColor = vec4(tex * mix(0.55, 1.0, v), 1.0);
  }
`;

/**
 * PhotoPlane — the workspace photograph as a living WebGL surface.
 * A slow vertex wave breathes across it; the whole plane leans toward
 * the pointer. Real moment, realtime material.
 */
function PhotoPlane({
  src,
  progress,
}: {
  src: string;
  progress: React.MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const texture = useLoader(THREE.TextureLoader, src);
  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uTime: { value: 0 },
      uWave: { value: 1 },
    }),
    [texture]
  );

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = state.pointer;
    if (!reduced) {
      uniforms.uTime.value = t;
      const g = group.current;
      // Recede into negative space as the journey continues.
      const recede = THREE.MathUtils.smoothstep(progress.current, 0.42, 0.72);
      g.position.y = recede * 1.6;
      g.scale.setScalar(1 - recede * 0.16);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, p.x * 0.1, 0.04);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -p.y * 0.06, 0.04);
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[13.5, 9]} />
        <shaderMaterial ref={mat} args={[{ uniforms, vertexShader: PHOTO_VERT, fragmentShader: PHOTO_FRAG }]} />
      </mesh>
    </group>
  );
}

const PhotoCanvas = dynamic(
  () =>
    Promise.resolve(function PhotoCanvasInner({
      progress,
      quality,
    }: {
      progress: React.MutableRefObject<number>;
      quality: "high" | "reduced";
    }) {
      const reduced = useMemo(() => prefersReducedMotion(), []);
      return (
        <Canvas
          camera={{ position: [0, 0, 10.5], fov: 50 }}
          dpr={quality === "high" ? [1, 1.5] : [1, 1]}
          gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance" }}
          frameloop={reduced ? "demand" : "always"}
          aria-hidden="true"
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <Suspense fallback={null}>
            <PhotoPlane
              src={quality === "high" ? "/person/workspace--web.jpg" : "/person/workspace--mobile.jpg"}
              progress={progress}
            />
          </Suspense>
        </Canvas>
      );
    }),
  { ssr: false, loading: () => <div className="h-full w-full bg-void" aria-hidden="true" /> }
);

/** Ember dust drifting over the photographs — the room is never still. */
function DustVeil() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    type Mote = { x: number; y: number; r: number; s: number; a: number };
    let motes: Mote[] = [];
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      motes = Array.from({ length: 60 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        s: Math.random() * 0.25 + 0.08,
        a: Math.random() * 0.5 + 0.15,
      }));
    };
    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y -= m.s;
        if (m.y < -6) {
          m.y = h + 6;
          m.x = Math.random() * w;
        }
        ctx.globalAlpha = m.a;
        ctx.fillStyle = "#3DFFA2";
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    resize();
    raf = requestAnimationFrame(tick);
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting && !document.hidden;
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      } else cancelAnimationFrame(raf);
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}

/**
 * ABOUT — the human world. A pinned scroll journey: the workspace photograph
 * breathes as a WebGL surface while the traced signature writes itself
 * across it; then the photo recedes into negative space and the second
 * photograph rises with the contact lines. Authorship, revealed by scroll.
 */
export function AboutSection() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const progress = useRef(0);
  const sigRef = useRef<HTMLDivElement | null>(null);
  const photo2Ref = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);
  const [live, setLive] = useState(false);
  const capability = useDeviceCapability();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), {
      rootMargin: "400px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    registerMotion();
    const el = wrapRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      gsap.to(progress, {
        current: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
      // Signature writes across the photograph, then holds.
      gsap.fromTo(
        sigRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 60%", end: "center 45%", scrub: true },
        }
      );
      // Second photograph + contact rise as the first recedes.
      gsap.fromTo(
        photo2Ref.current,
        { yPercent: 22, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "center 55%", end: "bottom bottom", scrub: true },
        }
      );
      gsap.fromTo(
        contactRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "center 35%", end: "bottom 85%", scrub: true },
        }
      );
    }, wrapRef);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <section aria-label="About" className="mx-auto w-full max-w-[var(--pl-container)] px-[var(--pl-gutter)] py-[var(--pl-section-y)]">
        <p className="meta text-faint">The engineer</p>
        <h2 className="mt-4 font-display text-4xl uppercase leading-tight md:text-6xl">
          Abhi builds.
        </h2>
        <p className="mt-6 max-w-[62ch] leading-relaxed text-muted">
          One engineer, Delhi — India. Systems where AI earns its place and interfaces disappear.
        </p>
        <p className="meta mt-8 text-bone">{site.contact.phone}</p>
        <p className="meta mt-2 text-bone">{site.contact.email}</p>
      </section>
    );
  }

  return (
    <section ref={wrapRef} aria-label="About" className="relative h-[340vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Photograph as living surface */}
        <div className="absolute inset-0" aria-hidden="true">
          {live && capability.webgl ? (
            <PhotoCanvas progress={progress} quality={capability.tier} />
          ) : (
            <div className="h-full w-full bg-void" />
          )}
        </div>
        {/* Ember dust over everything */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <DustVeil />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(180deg, var(--pl-background) 0%, transparent 22%, transparent 62%, var(--pl-background) 100%)",
          }}
        />

        {/* Signature writes across the photograph */}
        <div className="absolute inset-x-0 top-[16%] z-10 mx-auto w-full max-w-[var(--pl-container)] px-[var(--pl-gutter)]">
          <p className="meta text-faint">The engineer</p>
          <div ref={sigRef} className="relative mt-2 max-w-[420px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/person/signature.svg" alt="" aria-hidden="true" className="block w-full invert" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-1/3 [background:linear-gradient(100deg,transparent,rgb(61_255_162/0.2),transparent)]"
            />
          </div>
        </div>

        {/* Second photograph + contact rise as the first recedes */}
        <div className="absolute inset-x-0 bottom-0 z-10 pb-14">
          <div className="mx-auto grid w-full max-w-[var(--pl-container)] gap-8 px-[var(--pl-gutter)] md:grid-cols-2 md:items-end">
            <div ref={photo2Ref} className="relative hidden overflow-hidden border border-line md:block">
              <Image
                src="/person/workspace2--web.jpg"
                alt="Abhi at the work desk, looking up from the screen"
                width={1400}
                height={933}
                sizes="50vw"
                loading="lazy"
                className="block aspect-[3/2] w-full object-cover"
              />
              <p className="meta absolute bottom-3 left-4 text-bone/80">At the desk — Delhi, 2026</p>
            </div>
            <div ref={contactRef}>
              <h2 className="font-display text-4xl uppercase leading-tight md:text-6xl">
                Abhi
                <br />
                builds<span className="text-cyan">.</span>
              </h2>
              <p className="mt-4 max-w-[52ch] leading-relaxed text-muted">
                One engineer. Systems where AI earns its place and interfaces disappear.
              </p>
              <div className={cn("mt-6 space-y-2")}>
                <p>
                  <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} data-cursor="OPEN" className="meta text-bone transition-colors hover:text-cyan">
                    {site.contact.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${site.contact.email}`} data-cursor="OPEN" className="meta text-bone transition-colors hover:text-cyan">
                    {site.contact.email}
                  </a>
                </p>
                <p className="meta mt-3 text-faint">Replies within 12 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
