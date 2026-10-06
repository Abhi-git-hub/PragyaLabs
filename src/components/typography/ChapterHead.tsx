import type { ReactNode } from "react";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";

/**
 * ChapterHead — the shared opening composition for major chapters.
 * Oversized ghost index numeral behind, mono chapter marker, editorial
 * heading, hairline rule. One system across the whole journey.
 */
export function ChapterHead({
  index,
  eyebrow,
  title,
  lede,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <div className="relative">
      <Reveal>
        <p className="meta text-faint">
          <span className="text-cyan">{index}</span>
          <span aria-hidden="true"> / </span>
          {eyebrow}
        </p>
        <Display size="md" className="mt-5 max-w-[20ch]">
          {title}
        </Display>
        {lede && (
          <div className="mt-6 max-w-[58ch] text-base leading-relaxed text-muted md:text-lg">
            {lede}
          </div>
        )}
        <div aria-hidden="true" className="mt-8 h-px w-24 bg-line-strong" />
      </Reveal>
    </div>
  );
}
