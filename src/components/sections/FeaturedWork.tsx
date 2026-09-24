"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { RainbowCursor } from "@/components/motion/RainbowCursor";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { getProject } from "@/data/projects";
import { usePrefersReducedMotion, prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

/**
 * FEATURED WORK — Saarthians as cinema. A hover-reactive row (left blurs,
 * preview chases the cursor), then the concept film in a scroll-zooming
 * frame with a one-shot ripple, closing on the pipeline it covers.
 * The film is the concept cut — the case page holds the verified facts.
 */
export function FeaturedWork() {
  const project = getProject("saarthians");
  const rowRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const filmRef = useRef<HTMLDivElement | null>(null);
  const [rippled, setRippled] = useState(false);
  const reduced = usePrefersReducedMotion();
  if (!project) return null;

  useEffect(() => {
    registerMotion();
    const el = filmRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      // Scroll zoom-in: the frame opens from 0.94 as it arrives.
      gsap.fromTo(
        el,
        { scale: 0.94 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 95%", end: "top 45%", scrub: true },
        }
      );
      // One ripple when the film lands — a single expanding ring.
      gsap.to(
        {},
        {
          scrollTrigger: {
            trigger: el,
            start: "top 60%",
            once: true,
            onEnter: () => setRippled(true),
          },
        }
      );
    }, filmRef);
    return () => ctx.revert();
  }, [reduced]);

  const chase = (e: React.PointerEvent) => {
    const row = rowRef.current;
    const preview = previewRef.current;
    if (!row || !preview) return;
    const rect = row.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    preview.style.opacity = "1";
    preview.style.transform = `translate(${x - 160}px, ${y - 100}px) rotate(${(x / rect.width - 0.5) * 6}deg)`;
  };
  const release = () => {
    const preview = previewRef.current;
    if (!preview) return;
    preview.style.opacity = "0";
  };

  return (
    <SectionContainer eyebrow="Featured work" id="featured" className="scroll-mt-20">
      <Reveal>
        <Display size="md" className="max-w-[14ch]">
          One project, on screen.
        </Display>
      </Reveal>

      {/* Hover-reactive row over the rainbow cursor field */}
      <div
        ref={rowRef}
        onPointerMove={chase}
        onPointerLeave={release}
        data-cursor="EXPLORE"
        className="group relative mt-10 overflow-hidden border border-line"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <RainbowCursor />
        </div>
        <div className="relative grid gap-8 p-6 md:grid-cols-2 md:p-10">
          <div className="transition-all duration-500 group-hover:blur-[3px] group-hover:opacity-70">
            <p className="meta text-faint">product • engineering • intelligence</p>
            <h3 className="mt-3 font-display text-4xl uppercase md:text-6xl">{project.title}</h3>
            <p className="meta mt-3 text-faint">
              {project.category} — {project.year} — {project.status}
            </p>
            <p className="mt-4 max-w-[52ch] leading-relaxed text-muted">{project.summary}</p>
          </div>
          <div className="relative md:min-h-[280px]" aria-hidden="true">
            <video
              ref={previewRef}
              className="pointer-events-none absolute left-0 top-0 hidden h-[200px] w-[320px] border border-line-strong object-cover opacity-0 shadow-2xl transition-opacity duration-300 md:block"
              src="/film/saarthians--feature.mp4"
              muted
              loop
              playsInline
              preload="none"
              tabIndex={-1}
            />
            {/* Mobile: the film stacks in flow — nothing hidden, nothing overlapping */}
            <div className="aspect-video w-full border border-line-strong md:hidden">
              <Film
                src="/film/saarthians--feature.mp4"
                poster="/film/saarthians--feature--poster.jpg"
                label="Saarthians concept film"
              />
            </div>
            <p className="meta absolute bottom-0 right-0 hidden text-faint md:block">hover — the film follows</p>
          </div>
        </div>
      </div>

      {/* Cinematic film panel */}
      <div ref={filmRef} className="relative mt-6 overflow-hidden border border-line">
        <div className="aspect-video w-full">
          <Film
            src="/film/saarthians--feature.mp4"
            poster="/film/saarthians--feature--poster.jpg"
            label="Saarthians concept film — interface explorations in motion"
            autoPlay
          />
        </div>
        {rippled && <span aria-hidden="true" className="ripple-once" />}
        <p className="meta border-t border-line px-5 py-3 text-faint">
          Saarthians — concept film. Verified facts live on the case page.
        </p>
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
        <p className="relative mt-4 text-xl text-bone md:text-2xl">We are all covered.</p>
        <Magnetic>
          <Link
            href={`/work/${project.slug}`}
            data-cursor="OPEN"
            className="meta relative mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
          >
            Open the case study →
          </Link>
        </Magnetic>
      </Reveal>
    </SectionContainer>
  );
}

function Film({
  src,
  poster,
  label,
  autoPlay,
}: {
  src: string;
  poster: string;
  label: string;
  autoPlay?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(prefersReducedMotion());
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || still) return;
    if (autoPlay) {
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
    }
  }, [still, autoPlay]);

  if (still) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt={label} className="h-full w-full object-cover" />;
  }

  return (
    <video
      ref={videoRef}
      className="h-full w-full object-cover"
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      aria-label={label}
    />
  );
}
