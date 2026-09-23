"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";

/**
 * Film — gated video insert. Plays only in viewport with motion allowed;
 * otherwise a composed still frame. Muted, looped, inline, no controls.
 * Mount-gated so server and first client render always agree (no hydration
 * mismatch for reduced-motion visitors).
 */
export function Film({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mode, setMode] = useState<"boot" | "motion" | "still">("boot");

  useEffect(() => {
    setMode(prefersReducedMotion() ? "still" : "motion");
  }, []);

  useEffect(() => {
    if (mode !== "motion") return;
    const video = videoRef.current;
    if (!video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => undefined);
        else video.pause();
      },
      { rootMargin: "200px" }
    );
    io.observe(video);
    const onVis = () => {
      if (document.hidden) video.pause();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [mode]);

  if (mode === "still") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt="" aria-hidden="true" className={cn("h-full w-full object-cover", className)} />;
  }

  if (mode === "boot") {
    return <div aria-hidden="true" className={cn("h-full w-full bg-void", className)} />;
  }

  return (
    <video
      ref={videoRef}
      className={cn("h-full w-full object-cover", className)}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      tabIndex={-1}
      aria-label={label}
    />
  );
}
