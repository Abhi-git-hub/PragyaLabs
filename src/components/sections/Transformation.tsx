"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

const CHANNELS = [
  { index: "01", name: "Ground", caption: "Ground the answer.", x: 70 },
  { index: "02", name: "Build", caption: "Build the workflow.", x: 170 },
  { index: "03", name: "Experience", caption: "Make the system felt.", x: 270 },
];

/**
 * TRANSFORMATION — context becomes capability. Fragments pull together into
 * a transparent system lattice with three visible channels. Scroll-scrubbed,
 * unpinned: the lattice converges as the copy arrives, then hands off to
 * the capability worlds below.
 */
export function Transformation() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = wrapRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 55%", scrub: 0.6 },
      })
        .fromTo("[data-tr-frag]", { opacity: 0.15, y: 26 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0)
        .fromTo("[data-tr-lattice]", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.3)
        .fromTo("[data-tr-channel]", { opacity: 0.2 }, { opacity: 1, duration: 0.5, stagger: 0.2 }, 0.5);
    }, wrapRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={wrapRef}>
      <SectionContainer eyebrow="Transformation">
        <Reveal>
          <Display size="md" className="max-w-[20ch]">
            Context becomes capability.
          </Display>
        </Reveal>
        {/* Converging lattice — decorative; channels named in HTML below. */}
        <div className="mt-12 border border-line" aria-hidden="true">
          <svg viewBox="0 0 340 220" className="block h-auto w-full" role="presentation">
            <g data-tr-lattice stroke="#273150" strokeWidth={1}>
              <path d="M 10 40 L 330 40 M 10 80 L 330 80 M 10 120 L 330 120 M 10 160 L 330 160 M 10 200 L 330 200 M 60 10 L 60 210 M 120 10 L 120 210 M 180 10 L 180 210 M 240 10 L 240 210 M 300 10 L 300 210" opacity={0.6} />
            </g>
            {[
              [30, 190], [70, 170], [120, 185], [180, 175], [230, 190], [290, 170], [310, 195],
            ].map(([x, y], i) => (
              <rect key={i} data-tr-frag x={x} y={y} width={14} height={14} fill="none" stroke="#7E8AA6" strokeWidth={1.2} />
            ))}
            {CHANNELS.map((c) => (
              <g key={c.index} data-tr-channel>
                <path d={`M ${c.x} 30 L ${c.x} 150`} stroke="#28D7FE" strokeWidth={1.5} />
                <circle cx={c.x} cy={150} r={5} fill="#28D7FE" />
              </g>
            ))}
          </svg>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {CHANNELS.map((c) => (
            <div key={c.index} className="border-t border-line pt-5">
              <p className="meta text-cyan">
                {c.index} / {c.name}
              </p>
              <p className="mt-2 font-display text-xl font-semibold md:text-2xl">{c.caption}</p>
            </div>
          ))}
        </div>
        <p className="meta mt-8">
          <Link href="/#capabilities" className="text-muted transition-colors hover:text-cyan">
            Continue to the capability worlds →
          </Link>
        </p>
      </SectionContainer>
    </div>
  );
}
