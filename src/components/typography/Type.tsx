import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type DisplayProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  size?: "hero" | "lg" | "md" | "sm";
  className?: string;
  children: ReactNode;
};

/** Editorial display voice. Sentence case by default — pass `uppercase`
 *  only for short labels. Tracking stays controlled in long headings. */
export function Display({ as: Tag = "h2", size = "md", className, children }: DisplayProps) {
  return (
    <Tag
      className={cn(
        "font-display font-semibold leading-[1.02] tracking-[-0.01em] text-balance",
        size === "hero" && "text-[var(--pl-text-hero)]",
        size === "lg" && "text-[var(--pl-text-display-lg)]",
        size === "md" && "text-[var(--pl-text-display-md)]",
        size === "sm" && "text-[var(--pl-text-display-sm)]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/** Small technical metadata voice: mono, tracked, uppercase. */
export function Eyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("meta", className)}>{children}</p>;
}

/** Clean readable body voice. 18px → 20px desktop, 16–18px mobile. */
export function Body({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p className={cn("max-w-[62ch] text-lg leading-[1.6] text-muted md:text-xl md:leading-[1.55]", className)}>
      {children}
    </p>
  );
}
