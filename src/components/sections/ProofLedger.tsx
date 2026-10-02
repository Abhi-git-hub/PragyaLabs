"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Display } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { getProject } from "@/data/projects";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * PROOF — selected systems in motion. Every card states its classification
 * honestly: client work, in progress, R&D, interface study, studio R&D.
 * Real recordings where they exist; typographic panels where they don't —
 * never fabricated screenshots.
 */
const CARDS = [
  {
    slug: "saarthians",
    cta: "View system case study",
    description:
      "Secure student and teacher workspaces with a reasoning-augmented assistant, designed around grounded learning workflows.",
    film: { src: "/film/saarthians--feature.mp4", poster: "/film/saarthians--feature--poster.jpg", label: "Saarthians concept film" },
  },
  {
    slug: "adhyayan-classes",
    cta: "View client case study",
    description:
      "A coaching institute's website — programs, admissions, and contact — live in production since 2023.",
    film: { src: "/film/adhyayan--feature.mp4", poster: "/film/adhyayan--feature--poster.jpg", label: "Adhyayan Classes recorded walkthrough" },
  },
  {
    slug: "stock-rag",
    cta: "Explore the experiment",
    description: "A retrieval experiment exploring source-grounded financial information workflows.",
    film: null,
  },
  {
    slug: "x-interface-study",
    cta: "View interface study",
    description:
      "A front-end recreation used to study interaction architecture, motion detail, and production performance.",
    film: null,
  },
];

function CardFilm({ src, poster, label }: { src: string; poster: string; label: string }) {
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

export function ProofLedger() {
  return (
    <SectionContainer eyebrow="Selected work">
      <Reveal>
        <Display size="md" className="max-w-[20ch]">
          Selected systems in motion.
        </Display>
        <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-muted md:text-lg">
          Work that shows how research, design, engineering, and interaction come together.
        </p>
      </Reveal>
      <Stagger className="mt-12 grid gap-6 md:grid-cols-2">
        {CARDS.map((c) => {
          const project = getProject(c.slug);
          if (!project) return null;
          return (
            <article
              key={c.slug}
              data-stagger-item
              className="group flex flex-col border border-line bg-graphite"
            >
              <div className="aspect-video w-full overflow-hidden border-b border-line">
                {c.film ? (
                  <div className="h-full w-full transition-transform duration-500 [clip-path:inset(0_0_0_0)] group-hover:[clip-path:inset(2%_2%_2%_2%)]">
                    <CardFilm src={c.film.src} poster={c.film.poster} label={c.film.label} />
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col justify-between p-6 md:p-8">
                    <p className="meta text-faint">
                      {project.category} — {project.year}
                    </p>
                    <p className="font-display text-4xl font-semibold uppercase leading-none text-muted/40 transition-colors duration-500 group-hover:text-muted/70 md:text-5xl">
                      {project.title}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <p className="meta text-cyan">
                  {project.classification}
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold uppercase md:text-3xl">
                  {project.title}
                </h3>
                <p className="mt-3 flex-1 leading-relaxed text-muted">{c.description}</p>
                <Link
                  href={`/work/${project.slug}`}
                  data-cursor="OPEN CASE"
                  className="meta mt-6 inline-flex w-fit items-center gap-2 text-bone transition-all duration-200 hover:gap-3 hover:text-cyan"
                >
                  {c.cta} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          );
        })}
      </Stagger>
      <Reveal>
        <p className="meta mt-8 text-faint">
          Studio R&D — this website is a real-time experiment in procedural visuals and
          narrative interface design.{" "}
          <Link href="/" className="text-muted transition-colors hover:text-cyan">
            You are inside it →
          </Link>
        </p>
      </Reveal>
    </SectionContainer>
  );
}
