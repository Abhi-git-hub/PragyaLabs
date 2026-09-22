"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { stack } from "@/data/stack";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionAllowed, registerMotion, gsap } from "@/lib/motion";

/**
 * ACT 06 — THE STACK. Technology as an assembled system, not a skill grid.
 * Categories draw themselves in on scroll; every item points at the project
 * that proves it. No percentages, no bars, no nonsense.
 */
export function Stack() {
  const listRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerMotion();
    const el = listRef.current;
    if (!el || reduced || !motionAllowed()) return;
    const rows = el.querySelectorAll("[data-stack-row]");
    const tween = gsap.fromTo(
      rows,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.9,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 78%", once: true },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  return (
    <SectionContainer index="06" eyebrow="The stack">
      <Reveal>
        <Display size="md" className="max-w-[14ch]">
          Every tool earns its place.
        </Display>
      </Reveal>
      <div ref={listRef} className="mt-10">
        {stack.map((cat) => (
          <div
            key={cat.id}
            data-stack-row
            className="grid gap-2 border-t border-line py-7 last:border-b md:grid-cols-[200px_1fr_1fr] md:gap-8"
          >
            <p className="font-display text-xl uppercase text-cyan md:text-2xl">{cat.title}</p>
            <p className="text-lg text-bone md:text-xl">{cat.items.join(" — ")}</p>
            <p className="meta leading-loose">
              {cat.evidence.map((e, i) => (
                <span key={e.href + e.label}>
                  {i > 0 && <span className="text-faint"> / </span>}
                  <Link href={e.href} data-cursor="OPEN" className="text-muted transition-colors hover:text-cyan">
                    {e.label} →
                  </Link>
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
