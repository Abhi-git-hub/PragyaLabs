import type { ReactNode } from "react";
import { Eyebrow } from "@/components/typography/Type";

/**
 * Experiment shell: instrument framing shared by all live specimens.
 * Canvas is decorative; the caption carries meaning for assistive tech.
 */
export function ExperimentShell({
  id,
  title,
  intent,
  hint,
  caption,
  children,
  className,
  roomy = false,
}: {
  id: string;
  title: string;
  intent: string;
  hint: string;
  caption: string;
  children: ReactNode;
  className?: string;
  roomy?: boolean;
}) {
  return (
    <figure data-cursor="EXPLORE" className={className ?? ""}>
      <div className="flex items-baseline justify-between">
        <Eyebrow className="text-faint">{id}</Eyebrow>
        <span className="meta text-lime">live</span>
      </div>
      <h3 className="mt-2 font-display text-xl uppercase md:text-2xl">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">{intent}</p>
      <div className={`relative mt-4 overflow-hidden border border-line bg-void ${roomy ? "h-[52svh] md:h-[60vh]" : "h-64 md:h-72"}`}>
        {children}
      </div>
      <figcaption>
        <span className="sr-only">{caption}</span>
        <span aria-hidden="true" className="meta mt-3 block text-faint">
          {hint}
        </span>
      </figcaption>
    </figure>
  );
}
