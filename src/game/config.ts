import type { LatLng } from "./types";

/** Central Java, Indonesia — the Phase 1 starting region (near Semarang/Salatiga). */
export const CENTRAL_JAVA_CENTER: LatLng = { lat: -7.1509, lng: 110.4262 };

export const MAP_DEFAULTS = {
  zoom: 14.5,
  pitch: 55,
  bearing: -18,
  minZoom: 4,
  maxZoom: 19,
};

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