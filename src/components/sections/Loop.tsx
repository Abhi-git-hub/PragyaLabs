"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { Signature } from "@/components/person/Signature";
import { useDeviceCapability } from "@/hooks/use-device-capability";

/**
 * THE LOOP — visual echo, not a restart. The signature's line becomes a
 * light trail, becomes an orbital path around the reassembled Core —
 * reconnecting with the opening scene. Closure through continuity.
 */
const Core = dynamic(() => import("@/components/3d/PragyaCoreCanvas").then((m) => m.PragyaCoreCanvas), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-void" aria-hidden="true" />,
});

export function Loop() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const introRef = useRef({ current: 0 });
  const [live, setLive] = useState(false);
  const capability = useDeviceCapability();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setLive(entry.isIntersecting);
        if (entry.isIntersecting) introRef.current.current = 1;
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} aria-label="The loop" className="rule">
      <div className="mx-auto grid w-full max-w-[var(--pl-container)] gap-10 px-[var(--pl-gutter)] py-[var(--pl-section-y)] lg:grid-cols-2">
        <Reveal className="flex flex-col justify-center">
          <Eyebrow className="mb-6 text-faint">The loop</Eyebrow>
          <Display size="md" className="max-w-[12ch]">
            Ends where it began.
          </Display>
          <p className="mt-6 max-w-[52ch] leading-relaxed text-muted">
            Digital systems, engineered with intelligence — from the first frame
            to this one.
          </p>
          <div className="mt-8">
            <Signature className="max-w-[240px]" />
          </div>
          <Link
            href="#arrival"
            className="meta mt-10 inline-block w-fit border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
          >
            ↑ Return to arrival
          </Link>
        </Reveal>
        <Reveal className="relative h-[46svh] overflow-hidden border border-line bg-void/40 lg:h-auto lg:min-h-[420px]">
          {/* Orbital echo: the signature line, become a path home */}
          <div aria-hidden="true" className="orbit-ring orbit-a">
            <span className="orbit-sat" />
          </div>
          <div aria-hidden="true" className="orbit-ring orbit-b" />
          {live && capability.webgl ? (
            <Core introRef={introRef.current} quality={capability.tier} className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
              <div className="size-40 rounded-full border border-line opacity-60 [background:radial-gradient(circle_at_50%_40%,rgb(22_143_98/0.2),transparent_65%)]" />
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
