"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { DeviceCapability } from "@/hooks/use-device-capability";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { cn } from "@/lib/cn";

export const PORTAL_VIDEO = "/motion/portal-environment--web.mp4";
export const PORTAL_POSTER = "/motion/portal-environment--poster.jpg";

/**
 * Portal environment layer — cinematic video backdrop with poster-first loading.
 * - Poster (169KB) paints immediately; video (928KB) fades in on canplay.
 * - Video plays only when: in viewport + high tier + full motion + no data-saver.
 * - Optional scroll parallax (slow scale) when a trigger element is provided.
 * - Reduced motion / reduced tier / data-saver → poster only. Always silent.
 */
export function EnvironmentLayer({
  capability,
  trigger,
  className,
}: {
  capability: DeviceCapability;
  trigger?: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  const allowVideo =
    capability.tier === "high" && capability.webgl && !capability.saveData && !prefersReducedMotion();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "200px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scroll parallax: environment breathes outward as the hero leaves.
  useEffect(() => {
    registerMotion();
    const el = wrapRef.current;
    const scope = trigger?.current;
    if (!el || !scope || !motionAllowed()) return;
    const tween = gsap.fromTo(
      el,
      { scale: 1.04 },
      {
        scale: 1.16,
        ease: "none",
        scrollTrigger: { trigger: scope, start: "top top", end: "bottom top", scrub: true },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [trigger]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !inView) return;
    video.play().catch(() => {
      /* autoplay blocked — poster remains, no error surface */
    });
  }, [inView, canPlay]);

  return (
    <div ref={wrapRef} className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <Image
        src={PORTAL_POSTER}
        alt=""
        fill
        priority
        sizes="100vw"
        className={cn(
          "object-cover transition-opacity duration-1000",
          canPlay ? "opacity-0" : "opacity-100"
        )}
      />
      {allowVideo && inView && (
        <video
          ref={videoRef}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-1000",
            canPlay ? "opacity-100" : "opacity-0"
          )}
          src={PORTAL_VIDEO}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          onCanPlay={() => setCanPlay(true)}
        />
      )}
      {/* Legibility falloff — type stays readable, environment keeps depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgb(6 6 8 / 0.62) 0%, rgb(6 6 8 / 0.18) 38%, rgb(6 6 8 / 0.30) 62%, var(--pl-background) 100%)",
        }}
      />
    </div>
  );
}
