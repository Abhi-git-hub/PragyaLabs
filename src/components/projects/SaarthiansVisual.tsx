"use client";

import dynamic from "next/dynamic";
import { useDeviceCapability } from "@/hooks/use-device-capability";

const ParticleLab = dynamic(() => import("@/components/lab/ParticleLab").then((m) => m.ParticleLab), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-void" aria-hidden="true" />,
});

/**
 * Saarthians live data layer — the particle system repurposed as the
 * project's pulse: learners, material, queries as one field. Pointer
 * disturbs it; clicks detonate it. WHY HERE: particles visualize the
 * system/data the chapter is about, not decoration.
 */
export function SaarthiansVisual({ step, total }: { step: number; total: number }) {
  const capability = useDeviceCapability();
  void capability;

  return (
    <div className="relative h-full w-full" data-cursor="EXPLORE">
      <ParticleLab />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3">
        <span className="meta text-faint">SYS—SAARTHIANS / LIVE DATA</span>
        <span className="meta text-faint">
          {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3">
        <span className="meta text-faint">Move to disturb — click to detonate</span>
      </div>
    </div>
  );
}
