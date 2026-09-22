import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type DisplayProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  size?: "hero" | "lg" | "md" | "sm";
  className?: string;
  children: ReactNode;
};

/** High-impact editorial display voice. Uppercase condensed mass. */
export function Display({ as: Tag = "h2", size = "md", className, children }: DisplayProps) {
  return (
    <Tag
      className={cn(
        "font-display font-normal uppercase leading-[0.95] tracking-[0.01em] text-balance",
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

/** Clean readable body voice. Never condensed, never tracked. */
export function Body({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p className={cn("max-w-[62ch] text-base leading-relaxed text-muted md:text-lg", className)}>
      {children}
    </p>
  );
}
