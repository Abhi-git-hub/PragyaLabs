"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { getProject } from "@/data/projects";
import type { Project } from "@/data/projects";
import { usePrefersReducedMotion, prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

/**
 * FEATURED WORK — two systems, on screen, in perfect symmetry.
 * Saarthians (concept film) and Adhyayan Classes (recorded walkthrough
 * of the live site) share one grid: same frame, same scale, same motion.
 * Text never blurs, films play on every device — tap toggles playback.
 */
export function FeaturedWork() {
  const saarthians = getProject("saarthians");
  const adhyayan = getProject("adhyayan-classes");
  const gridRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  if (!saarthians || !adhyayan) return null;

  useEffect(() => {
    registerMotion();
    const el = gridRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      // The pair opens together — one frame, two systems.
      gsap.fromTo(
        el,
        { scale: 0.97, opacity: 0.6 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 92%", end: "top 55%", scrub: true },
        }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <SectionContainer eyebrow="Featured work" id="featured" className="scroll-mt-20">
      <Reveal>
        <Display size="md" className="max-w-[14ch]">
          Two systems, on screen.
        </Display>
      </Reveal>

      {/* Symmetric pair — identical frames, identical behavior */}
      <div ref={gridRef} className="relative mt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-8 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 45% 40% at 22% 40%, rgb(111 93 255 / 0.10), transparent 70%), radial-gradient(ellipse 45% 40% at 78% 40%, rgb(61 255 162 / 0.07), transparent 70%)",
          }}
        />
        <div className="relative grid gap-6 md:grid-cols-2">
          <WorkPanel
            project={saarthians}
            src="/film/saarthians--feature.mp4"
            poster="/film/saarthians--feature--poster.jpg"
            label="Saarthians concept film — interface explorations in motion"
            caption="Saarthians — concept film. Verified facts live on the case page."
          />
          <WorkPanel
            project={adhyayan}
            src="/film/adhyayan--feature.mp4"
            poster="/film/adhyayan--feature--poster.jpg"
            label="Adhyayan Classes — recorded walkthrough of the live site"
            caption="Adhyayan Classes — recorded walkthrough. Live since 2023."
          />
        </div>
      </div>

      <Reveal className="relative mt-12 overflow-hidden border border-line p-6 md:p-10">
        {/* Plaster backdrop — the chamber's wall returns behind the promise */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage: "url(/textures/plaster--web.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            maskImage: "linear-gradient(100deg, black 30%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(100deg, black 30%, transparent 80%)",
          }}
        />
        <Display size="sm" className="relative max-w-[24ch]">
          Concept.Design.Development.Authentication.Security.Deployment.
        </Display>
        <p className="relative mt-4 max-w-[52ch] text-xl text-bone md:text-2xl">
          One engineer owns the whole chain — from first sketch to production login.
        </p>
        <Magnetic>
          <Link
            href="/contact"
            data-cursor="OPEN"
            className="meta relative mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
          >
            Start a project →
          </Link>
        </Magnetic>
      </Reveal>
    </SectionContainer>
  );
}

function WorkPanel({
  project,
  src,
  poster,
  label,
  caption,
}: {
  project: Project;
  src: string;
  poster: string;
  label: string;
  caption: string;
}) {
  return (
    <article className="group relative overflow-hidden border border-line bg-void/60">
      <div className="p-6 md:p-8">
        <p className="meta text-faint">
          {project.category} — {project.year} — {project.status}
        </p>
        <h3 className="mt-3 font-display text-4xl uppercase md:text-5xl">{project.title}</h3>
        <p className="mt-4 max-w-[52ch] leading-relaxed text-muted">{project.summary}</p>
      </div>
      <div className="aspect-video w-full border-t border-line">
        <Film src={src} poster={poster} label={label} />
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-line px-6 py-4 md:px-8">
        <p className="meta text-faint">{caption}</p>
        <Link
          href={`/work/${project.slug}`}
          data-cursor="OPEN"
          className="meta shrink-0 text-bone transition-colors hover:text-cyan"
        >
          Open case →
        </Link>
      </div>
    </article>
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
