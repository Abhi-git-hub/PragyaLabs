"use client";

import { Film } from "@/components/motion/Film";

/**
 * TransitionBand — a thin refraction seam between worlds. Rain on glass,
 * masked top and bottom so it reads as atmosphere passing through, not a
 * video section. Gated playback, still poster under reduced motion.
 */
export function TransitionBand({ label }: { label: string }) {
  return (
    <div aria-hidden="true" className="relative h-[16vh] min-h-[120px] overflow-hidden">
      <div className="absolute inset-0 opacity-70">
        <Film
          src="/film/rain--lens.mp4"
          poster="/film/rain--lens--poster.jpg"
          label={label}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--pl-background) 0%, transparent 35%, transparent 65%, var(--pl-background) 100%)",
        }}
      />
    </div>
  );
}
