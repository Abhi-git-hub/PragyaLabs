"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChapterHead } from "@/components/typography/ChapterHead";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { getProject } from "@/data/projects";
import { assets } from "@/lib/assets";
import { useSpotlight } from "@/components/motion/Spotlight";
import { prefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

/**
 * PROOF — selected systems in motion, staged as an exhibition journey.
 * Desktop (capable, motion allowed): the chapter pins and travels
 * horizontally — two equal cinematic panels, Saarthians then Adhyayan.
 * Everywhere else: the same cards in a calm vertical stack.
 * Same DOM, same copy, same links either way.
 */
const CARDS = [
  {
    slug: "saarthians",
    cta: "View system case study",
    description:
      "Secure student and teacher workspaces with a reasoning-augmented assistant, designed around grounded learning workflows.",
    film: assets.film.saarthians,
  },
  {
    slug: "adhyayan-classes",
    cta: "View client case study",
    description:
      "A coaching institute's website — programs, admissions, and contact — live in production since 2023.",
    film: assets.film.adhyayan,
  },
];

export function ProofLedger() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track || reduced || !motionAllowed()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const distance = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <div ref={wrapRef}>
      <div className="proof-stage lg:overflow-hidden">
        <SectionContainer id="work" className="scroll-mt-20 lg:py-10">
          <ChapterHead
            index="05"
            eyebrow="Selected work"
        title="Selected systems in motion."
        lede="Work that shows how research, design, engineering, and interaction come together."
          />
        </SectionContainer>
        <div className="mx-auto w-full max-w-[var(--pl-container)] px-[var(--pl-gutter)]">
          <div
            ref={trackRef}
            className="flex flex-col gap-6 pb-[var(--pl-section-y)] lg:w-max lg:flex-row lg:items-stretch lg:gap-8 lg:pb-0"
          >
            {CARDS.map((c) => (
              <ProofCard key={c.slug} slug={c.slug} cta={c.cta} description={c.description} film={c.film} />
            ))}
          </div>
          <div className="mt-8 hidden lg:block" aria-hidden="true">
            <div className="h-px w-full bg-line">
              <div ref={barRef} className="h-px w-full origin-left bg-cyan" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[var(--pl-container)] px-[var(--pl-gutter)]">
          <Reveal>
            <p className="meta pb-[var(--pl-section-y)] pt-8 text-faint lg:pb-0">
              Studio R&D — this website is a real-time experiment in procedural visuals and
              narrative interface design.{" "}
              <Link href="/" className="link-line text-muted transition-colors hover:text-cyan">
                You are inside it →
              </Link>
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function ProofCard({
  slug,
  cta,
  description,
  film,
}: {
  slug: string;
  cta: string;
  description: string;
  film: { src: string; poster: string; label: string } | null;
}) {
  const project = getProject(slug);
  const { ref, onPointerMove } = useSpotlight<HTMLElement>();
  if (!project) return null;
  return (
    <article
      ref={ref}
      onPointerMove={onPointerMove}
      className="spot glass-card group flex shrink-0 flex-col lg:w-[54vw] lg:max-w-[720px]"
    >
      <div className="aspect-video w-full overflow-hidden border-b border-line">
        {film ? (
          <div className="h-full w-full transition-transform duration-500 [clip-path:inset(0_0_0_0)] group-hover:scale-[1.02] group-hover:[clip-path:inset(2%_2%_2%_2%)]">
            <CardFilm src={film.src} poster={film.poster} label={film.label} />
          </div>
        ) : (
          <div className="flex h-full min-h-[220px] w-full flex-col justify-between p-6 transition-colors duration-500 md:p-8">
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
        <p className="meta text-cyan">{project.classification}</p>
        <h3 className="mt-3 font-display text-2xl font-semibold uppercase md:text-3xl">
          {project.title}
        </h3>
        <p className="mt-3 flex-1 leading-relaxed text-muted">{description}</p>
        <dl className="meta mt-6 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-line pt-5 text-faint">
          <div>
            <dt className="inline">Category — </dt>
            <dd className="inline text-muted">{project.category}</dd>
          </div>
          <div>
            <dt className="inline">Status — </dt>
            <dd className="inline text-muted">{project.classification}</dd>
          </div>
          <div>
            <dt className="inline">Role — </dt>
            <dd className="inline text-muted">{project.role}</dd>
          </div>
          <div>
            <dt className="inline">Stack — </dt>
            <dd className="inline text-muted">{project.technologies.slice(0, 3).join(" / ")}</dd>
          </div>
        </dl>
        <Link
          href={`/work/${project.slug}`}
          data-cursor="VIEW CASE"
          className="meta mt-6 inline-flex w-fit items-center gap-2 text-bone transition-all duration-200 hover:gap-3 hover:text-cyan"
        >
          {cta} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

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
