"use client";

import { useEffect, useState } from "react";

export type CapabilityTier = "high" | "reduced";

export type DeviceCapability = {
  tier: CapabilityTier;
  isMobile: boolean;
  webgl: boolean;
  saveData: boolean;
};

const SSR_SAFE: DeviceCapability = { tier: "reduced", isMobile: false, webgl: false, saveData: false };

function testWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Device capability probe (client only). Decides the experience tier:
 * - reduced: mobile / ≤4 cores / ≤4GB RAM / no WebGL / data-saver.
 * SSR defaults to reduced (safe) and upgrades on mount when capable.
 * Poster/backdrop content renders identically in both tiers.
 */
export function useDeviceCapability(): DeviceCapability {
  const [cap, setCap] = useState<DeviceCapability>(SSR_SAFE);

  useEffect(() => {
    const isMobile =
      window.matchMedia("(max-width: 767px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;
    const cores = window.navigator.hardwareConcurrency ?? 8;
    const memory = (window.navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const saveData =
      (window.navigator as Navigator & { connection?: { saveData?: boolean } }).connection
        ?.saveData === true;
    const webgl = testWebGL();
    const reduced = isMobile || cores <= 4 || memory <= 4 || !webgl || saveData;
    setCap({ tier: reduced ? "reduced" : "high", isMobile, webgl, saveData });
  }, []);

  return cap;
}
