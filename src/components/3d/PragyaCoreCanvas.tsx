"use client";

import dynamic from "next/dynamic";
import type { IntroProgressRef, ScrollProgressRef } from "./PragyaCoreScene";
import type { CapabilityTier } from "@/hooks/use-device-capability";

const Scene = dynamic(
  () => import("./PragyaCoreScene").then((m) => m.PragyaCoreScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
        <div className="size-48 rounded-full border border-line opacity-60 [background:radial-gradient(circle_at_50%_40%,rgb(53_233_255/0.14),transparent_65%)]" />
      </div>
    ),
  }
);

/**
 * Dynamically-loaded Core canvas. Three.js never touches initial page JS —
 * the chunk loads only where this component is placed. Parents mount it
 * only while its scene is near the viewport (intersection-aware).
 */
export function PragyaCoreCanvas({
  scrollRef,
  introRef,
  quality = "high",
  className,
}: {
  scrollRef?: ScrollProgressRef;
  introRef?: IntroProgressRef;
  quality?: CapabilityTier;
  className?: string;
}) {
  return (
    <div className={className ?? "h-full w-full"}>
      <Scene scrollRef={scrollRef} introRef={introRef} quality={quality} />
    </div>
  );
}
