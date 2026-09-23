import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Standard section container: rhythm, gutters, max width.
 *  Eyebrows are plain editorial labels — no index numbers, no HUD. */
export function SectionContainer({
  id,
  eyebrow,
  className,
  children,
}: {
  id?: string;
  eyebrow?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={eyebrow ?? id}
      className={cn(
        "mx-auto w-full max-w-[var(--pl-container)] px-[var(--pl-gutter)] py-[var(--pl-section-y)]",
        className
      )}
    >
      {eyebrow && (
        <div className="mb-8 md:mb-12">
          <span className="meta text-faint">{eyebrow}</span>
        </div>
      )}
      {children}
    </section>
  );
}
