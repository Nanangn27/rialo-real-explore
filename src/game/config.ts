import type { LatLng } from "./types";

/**
 * Fallback start location used only when GPS is unavailable or denied.
 * The playable world is global — nothing is restricted to this region.
 */
export const FALLBACK_CENTER: LatLng = { lat: -7.1509, lng: 110.4262 };

/** @deprecated use FALLBACK_CENTER */
export const CENTRAL_JAVA_CENTER = FALLBACK_CENTER;

export const MAP_DEFAULTS = {
  zoom: 14.5,
  pitch: 55,
  bearing: -18,
  /** Fully zoomed out shows the whole world. */
  minZoom: 1.5,
  maxZoom: 19,
};

/** Zoom used before a GPS fix arrives, so the world is visible. */
export const WORLD_ZOOM = 2.4;

export const XP_PER_LEVEL = 1000;

/** Feature flags for future phases. Keep false in Phase 1. */
export const FEATURES = {
  discoveries: false,
  relics: false,
  mysteryBoxes: false,
  portals: false,
  npcs: false,
  quests: false,
  inventory: false,
  achievements: false,
  onChainRewards: false,
  multiplayerEvents: false,
} as const;