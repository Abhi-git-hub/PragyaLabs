"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { assets } from "@/lib/assets";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const ANNOTATIONS = ["Workspaces", "Access", "Retrieval", "Learning flow"];

/**
 * Saarthians cinematic composition — the concept film as the wide frame,
 * the material study layered small and low, annotations as the readout.
 * Ingredients of one composition, never an asset gallery.
 */
export function SaarthiansMedia() {
  return (
    <SectionContainer eyebrow="In motion">
      <Reveal>
        <div className="group relative overflow-hidden border border-line">
          <ImageReveal className="aspect-[16/10] w-full md:aspect-[21/10]">
            <Film
              src={assets.film.saarthians.src}
              poster={assets.film.saarthians.poster}
              label={assets.film.saarthians.label}
            />
          </ImageReveal>
          {/* Material study — layered fragment, lower right */}
          <div className="glass-deep absolute bottom-4 right-4 hidden w-56 overflow-hidden border border-line sm:block md:bottom-6 md:right-6 md:w-72">
            <div className="aspect-video w-full">
              <Film
                src={assets.film.saarthiansTexture.src}
                poster={assets.film.saarthiansTexture.poster}
                label={assets.film.saarthiansTexture.label}
              />
            </div>
            <p className="meta px-4 py-2 text-faint">Material study</p>
          </div>
          {/* Readout */}
          <div className="pointer-events-none absolute left-4 top-4 md:left-6 md:top-6" aria-hidden="true">
            <p className="meta text-faint">Concept film — verified facts in the dossier</p>
          </div>
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
          {ANNOTATIONS.map((a) => (
            <li key={a} className="meta text-faint">
              <span aria-hidden="true" className="mr-2 inline-block h-px w-4 bg-cyan align-middle" />
              {a}
            </li>
          ))}
        </ul>
      </Reveal>
    </SectionContainer>
  );
}

function Film({ src, poster, label }: { src: string; poster: string; label: string }) {
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

  if (still) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt={label} className="h-full w-full object-cover" />;
  }

  return (
    <video
      ref={videoRef}
      className="h-full w-full cursor-pointer object-cover"
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      controls
      controlsList="nodownload noremoteplayback"
      aria-label={`${label} — tap to play or pause`}
      onClick={(e) => {
        const video = e.currentTarget;
        if (video.paused) video.play().catch(() => undefined);
        else video.pause();
      }}
    />
  );
}
