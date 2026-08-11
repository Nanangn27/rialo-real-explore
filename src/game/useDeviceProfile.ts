import { useEffect, useState } from "react";

export type QualityTier = "low" | "medium" | "high";

export interface DeviceProfile {
  tier: QualityTier;
  /** Coarse pointer / touch-first device. */
  touch: boolean;
  reducedMotion: boolean;
  /** Renderer pixel-ratio clamp for the 3D canvas. */
  dpr: [number, number];
  antialias: boolean;
  /** Target frames per second for the character animation loop. */
  targetFps: number;
  /** Extra fill light + higher-poly primitives only when it's affordable. */
  richLighting: boolean;
  segments: { sphere: number; capsule: number; cylinder: number; circle: number };
  /** MapLibre tuning. */
  map: { antialias: boolean; pitch: number; fadeDuration: number };
}

const SSR_PROFILE: DeviceProfile = buildProfile("medium", false, false, 1.5);

function buildProfile(
  tier: QualityTier,
  touch: boolean,
  reducedMotion: boolean,
  devicePixelRatio: number,
): DeviceProfile {
  const low = tier === "low";
  const high = tier === "high";
  return {
    tier,
    touch,
    reducedMotion,
    dpr: low ? [1, 1] : high ? [1, Math.min(devicePixelRatio, 2)] : [1, 1.5],
    antialias: !low,
    targetFps: reducedMotion ? 15 : low ? 24 : high ? 60 : 30,
    richLighting: !low,
    segments: low
      ? { sphere: 12, capsule: 6, cylinder: 10, circle: 14 }
      : high
        ? { sphere: 24, capsule: 12, cylinder: 24, circle: 28 }
        : { sphere: 18, capsule: 8, cylinder: 18, circle: 22 },
    map: {
      antialias: high,
      pitch: low ? 40 : high ? 55 : 50,
      fadeDuration: low ? 0 : 300,
    },
  };
}

function detect(): DeviceProfile {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const touch = window.matchMedia("(pointer: coarse)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = window.devicePixelRatio || 1;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 500;

  let score = 0;
  if (cores >= 8) score += 2;
  else if (cores >= 4) score += 1;
  if (memory >= 8) score += 2;
  else if (memory >= 4) score += 1;
  if (!touch) score += 2;
  if (!smallScreen) score += 1;

  const tier: QualityTier = score >= 6 ? "high" : score >= 3 ? "medium" : "low";
  return buildProfile(tier, touch, reducedMotion, dpr);
}

/**
 * Adaptive quality profile. Detected once on the client so rendering cost matches
 * the device — gameplay logic never depends on it.
 */
export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(SSR_PROFILE);

  useEffect(() => {
    setProfile(detect());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setProfile(detect());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return profile;
}

/** True while the tab is visible — used to stop background work and save battery. */
export function usePageVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    onChange();
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return visible;
}
