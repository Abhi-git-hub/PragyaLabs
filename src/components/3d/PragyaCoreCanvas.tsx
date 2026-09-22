"use client";

import dynamic from "next/dynamic";
import type { ScrollProgressRef } from "./PragyaCoreScene";

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
 * the chunk loads only where this component is placed.
 */
export function PragyaCoreCanvas({
  scrollRef,
  className,
}: {
  scrollRef?: ScrollProgressRef;
  className?: string;
}) {
  return (
    <div className={className ?? "h-full w-full"}>
      <Scene scrollRef={scrollRef} />
    </div>
  );
}
