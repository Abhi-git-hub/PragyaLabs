"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useDeviceCapability } from "@/hooks/use-device-capability";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { services } from "@/data/services";
import { cn } from "@/lib/cn";

const Atlas = dynamic(() => import("@/components/3d/ServicesAtlas").then((m) => m.ServicesAtlasScene), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-void" aria-hidden="true" />,
});

/**
 * SERVICES ATLAS — the commercial spine as a world, not a list.
 * A pinned scroll journey through four formation states while captions
 * ignite per discipline: kicker, lede, live proof links, service page.
 * Clicking the index flies the scroll to that station. Reduced motion
 * and crawlers get the same content as an honest static index.
 */
export function ServicesStrip() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const progress = useRef(0);
  const [live, setLive] = useState(false);
  const [station, setStation] = useState(0);
  const capability = useDeviceCapability();
  const reduced = usePrefersReducedMotion();
  const active = services[station];

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
    const tween = gsap.to(progress, {
      current: 1,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          setStation((prev) => {
            const next = Math.min(services.length - 1, Math.floor(self.progress * services.length));
            return next === prev ? prev : next;
          });
        },
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  const flyTo = (i: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / services.length) * span, behavior: "smooth" });
  };

  if (reduced) {
    return (
      <section aria-label="What the studio builds" className="mx-auto w-full max-w-[var(--pl-container)] px-[var(--pl-gutter)] py-[var(--pl-section-y)]">
        <p className="meta text-faint">What the studio builds</p>
        <ol className="mt-8 space-y-8">
          {services.map((s) => (
            <li key={s.slug} className="border-t border-line pt-6">
              <p className="meta text-faint">{s.kicker}</p>
              <h2 className="mt-2 font-display text-2xl uppercase md:text-3xl">{s.h1}</h2>
              <p className="mt-2 max-w-[62ch] text-muted">{s.lede}</p>
              <p className="meta mt-3">
                <Link href={`/services/${s.slug}`} className="text-muted transition-colors hover:text-cyan">
                  {s.title.split("|")[0].trim()} →
                </Link>
              </p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section ref={wrapRef} aria-label="What the studio builds" className="relative h-[420vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          {live && capability.webgl ? (
            <Atlas progress={progress} quality={capability.tier} />
          ) : (
            <div className="h-full w-full bg-void" />
          )}
        </div>
        {/* Crawlable + assistive full index — the same content, honestly listed */}
        <ol className="sr-only">
          {services.map((s) => (
            <li key={s.slug}>
              {s.kicker}: {s.lede} Proof: {s.proof.map((p) => p.label).join(", ")}.
            </li>
          ))}
        </ol>
        <div className="relative z-10 mx-auto grid h-full w-full max-w-[var(--pl-container)] gap-8 px-[var(--pl-gutter)] pb-16 pt-24 md:grid-cols-[240px_1fr]">
          {/* Clickable index — flies the journey to that discipline */}
          <nav aria-label="Services" className="hidden flex-col justify-center gap-5 md:flex">
            {services.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => flyTo(i)}
                aria-current={i === station ? "true" : undefined}
                className="group flex items-baseline gap-3 text-left"
              >
                <span className={cn("meta", i === station ? "text-cyan" : "text-faint")}>
                  0{i + 1}
                </span>
                <span
                  className={cn(
                    "meta transition-all",
                    i === station ? "text-bone" : "text-faint group-hover:text-muted"
                  )}
                >
                  {s.kicker}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px transition-all duration-500",
                    i === station ? "w-10 bg-cyan" : "w-4 bg-line-strong"
                  )}
                />
              </button>
            ))}
          </nav>
          {/* Active caption — fixed height so swaps never move the page */}
          <div className="flex flex-col justify-end">
            <p className="meta text-faint">What the studio builds</p>
            <div key={station} className="mt-4 min-h-[300px] md:min-h-[340px]">
              <p className="meta text-cyan">{active.kicker}</p>
              <h2 className="mt-3 font-display uppercase leading-[0.95] text-[clamp(2.4rem,7vw,5.5rem)]">
                {active.kicker}
              </h2>
              <p className="mt-4 max-w-[56ch] leading-relaxed text-muted md:text-lg">
                {active.lede.split(".")[0]}.
              </p>
              <p className="meta mt-5 leading-loose">
                {active.proof.map((p, i) => (
                  <span key={p.href + p.label}>
                    {i > 0 && <span className="text-faint"> / </span>}
                    <Link href={p.href} data-cursor="OPEN" className="text-muted transition-colors hover:text-cyan">
                      {p.label} →
                    </Link>
                  </span>
                ))}
              </p>
              <Link
                href={`/services/${active.slug}`}
                data-cursor="OPEN"
                className="meta mt-6 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
              >
                Open {active.kicker} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
