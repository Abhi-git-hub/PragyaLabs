"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { DeviceCapability } from "@/hooks/use-device-capability";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { cn } from "@/lib/cn";

export const PORTAL_VIDEO = "/motion/portal-environment--web.mp4";
export const PORTAL_VIDEO_MOBILE = "/motion/portal-environment--mobile.mp4";
export const PORTAL_POSTER = "/motion/portal-environment--poster.jpg";

/**
 * Portal environment layer — cinematic video backdrop with poster-first loading.
 * - Poster paints immediately (cut from the video's own opening frame, so the
 *   poster→video handoff has no flash); video fades in on canplay.
 * - Responsive sources: 640×360 mobile cut (146KB) / 1280×720 desktop (928KB).
 * - Video plays when: in viewport + WebGL + full motion + no data-saver.
 *   Mobile is NOT excluded — the mobile cut exists so handhelds get the living
 *   layer too. Reduced motion / no WebGL / data-saver → stable poster.
 * - Optional scroll parallax (slow scale) when a trigger element is provided.
 * - Always silent, never interactive, never carrying text.
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
    capability.webgl && !capability.saveData && !prefersReducedMotion();

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
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          onCanPlay={() => setCanPlay(true)}
        >
          <source src={PORTAL_VIDEO_MOBILE} type="video/mp4" media="(max-width: 767px)" />
          <source src={PORTAL_VIDEO} type="video/mp4" />
        </video>
      )}
      {/* Legibility falloff — type stays readable, environment keeps depth.
          Kept deliberately light so the video carries the atmosphere. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgb(6 6 8 / 0.52) 0%, rgb(6 6 8 / 0.10) 38%, rgb(6 6 8 / 0.22) 62%, var(--pl-background) 100%)",
        }}
      />
    </div>
  );
}
