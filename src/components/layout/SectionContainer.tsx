import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Standard lab section container: rhythm, gutters, max width, hairline option. */
export function SectionContainer({
  id,
  index,
  eyebrow,
  className,
  children,
}: {
  id?: string;
  index?: string;
  eyebrow?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={eyebrow ?? id}
      className={cn("mx-auto w-full max-w-[var(--pl-container)] px-[var(--pl-gutter)] py-[var(--pl-section-y)]", className)}
    >
      {(index ?? eyebrow) && (
        <div className="mb-8 flex items-baseline justify-between gap-4 md:mb-12">
          {index && <span className="meta text-faint">{index}</span>}
          {eyebrow && <span className="meta">{eyebrow}</span>}
        </div>
      )}
      {children}
    </section>
  );
}
