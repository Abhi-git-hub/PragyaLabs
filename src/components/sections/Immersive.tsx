"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useDeviceCapability } from "@/hooks/use-device-capability";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";
import { cn } from "@/lib/cn";

const Forms = dynamic(() => import("@/components/3d/EmberForms").then((m) => m.EmberFormsScene), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-void" aria-hidden="true" />,
});

/**
 * IMMERSIVE — the ember chapter. A pinned scroll world where typography
 * zooms through depth (scale + drift + blur, scrubbed both ways) while
 * copper, phosphor and ice forms morph behind it. Scroll up and the whole
 * journey rewinds — zoom out, states unmorph, words unignite.
 */
export function Immersive() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const progress = useRef(0);
  const [live, setLive] = useState(false);
  const capability = useDeviceCapability();
  const reduced = usePrefersReducedMotion();

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
    const ctx = gsap.context(() => {
      gsap.to(progress, {
        current: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
      // Zoom typography — lines rush toward the camera as scroll advances,
      // retreat as it returns. Both directions choreographed.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6, pin: ".immersive-stage" },
      });
      tl.fromTo("[data-zoom-line]", { scale: 0.72, y: 90, filter: "blur(12px)", opacity: 0 }, { scale: 1, y: 0, filter: "blur(0px)", opacity: 1, duration: 0.6, stagger: 0.35 }, 0);
      tl.to("[data-zoom-line]", { scale: 1.18, y: -70, filter: "blur(10px)", opacity: 0, duration: 0.9, stagger: 0.2 }, 1.1);
      tl.fromTo(".immersive-room", { backgroundColor: "rgb(5,6,8)" }, { backgroundColor: "rgb(20,11,6)", duration: 2 }, 0);
      tl.fromTo(".immersive-body", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.5 }, 1.5);
    }, wrapRef);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <section aria-label="Why Pragya Labs" className="mx-auto w-full max-w-[var(--pl-container)] px-[var(--pl-gutter)] py-[var(--pl-section-y)]">
        <p className="meta text-faint">Why Pragya Labs</p>
        <h2 className="mt-4 font-display text-4xl uppercase leading-tight md:text-6xl">
          Where creative ideas become immersive experiences.
        </h2>
        <p className="mt-6 max-w-[62ch] leading-relaxed text-muted">
          We produce web experiences, increase your sales, get more customers. You say we
          cover. We do it all.
        </p>
      </section>
    );
  }

  return (
    <section ref={wrapRef} aria-label="Why Pragya Labs" className="relative h-[340vh]">
      <div className="immersive-stage relative flex h-[100svh] flex-col overflow-hidden">
        <div className="immersive-room absolute inset-0 bg-void" aria-hidden="true">
          {live && capability.webgl && <Forms progress={progress} quality={capability.tier} />}
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-[var(--pl-container)] flex-1 flex-col justify-center px-[var(--pl-gutter)]">
          <p className="meta text-faint">Why Pragya Labs</p>
          <h2 className="mt-6 font-display uppercase leading-[0.95]">
            <span className="block overflow-hidden">
              <span data-zoom-line className="block text-[clamp(2.6rem,8vw,7rem)]">
                Where Creative Ideas
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-zoom-line className="block text-[clamp(2.6rem,8vw,7rem)]">
                Become <span className="text-cyan">immersive</span>
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-zoom-line className="block text-[clamp(2.6rem,8vw,7rem)]">
                experiences.
              </span>
            </span>
          </h2>
          <div className={cn("immersive-body mt-8 max-w-[62ch]")}>
            <p className="leading-relaxed text-muted md:text-lg">
              We produce web experiences, increase your sales, get more customers. You say we
              cover. We do it all.
            </p>
            <Link
              href="/contact"
              data-cursor="OPEN"
              className="meta mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
            >
              Start a project →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
