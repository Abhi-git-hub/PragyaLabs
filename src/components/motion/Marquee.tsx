import { cn } from "@/lib/cn";

/**
 * Marquee — a typographic current running across a chapter boundary.
 * Pure CSS motion; frozen under reduced motion by the global kill-switch.
 */
export function Marquee({ text, className }: { text: string; className?: string }) {
  const row = Array.from({ length: 6 });
  return (
    <div aria-hidden="true" className={cn("overflow-hidden border-y border-line py-4", className)}>
      <div className="marquee-track flex w-max items-baseline gap-8 whitespace-nowrap">
        {row.map((_, i) => (
          <span key={i} className="flex items-baseline gap-8">
            <span className="font-display text-3xl uppercase md:text-5xl">{text}</span>
            <span className="font-display text-3xl text-cyan md:text-5xl">×</span>
          </span>
        ))}
      </div>
    </div>
  );
}
