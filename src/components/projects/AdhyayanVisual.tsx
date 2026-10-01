"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Adhyayan Classes — recorded walkthrough of the live production site.
 * Real footage, not a concept render: the case page holds the verified facts.
 */
export function AdhyayanVisual() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(prefersReducedMotion());
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || still) return;
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
  }, [still]);

  const label = "Adhyayan Classes — recorded walkthrough of the live site";

  if (still) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/film/adhyayan--feature--poster.jpg" alt={label} className="h-full w-full object-cover" />;
  }

  return (
    <div className="relative h-full w-full" data-cursor="PLAY">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src="/film/adhyayan--feature.mp4"
        poster="/film/adhyayan--feature--poster.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-label={label}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 py-3" aria-hidden="true">
        <span className="meta text-faint">Recorded walkthrough — adhyayanclasses.vercel.app, live since 2023</span>
      </div>
    </div>
  );
}
