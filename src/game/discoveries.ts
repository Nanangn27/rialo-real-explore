import type { DiscoveryKind, LatLng } from "./types";

export interface DiscoveryMeta {
  kind: DiscoveryKind;
  label: string;
  itemName: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  xp: number;
  color: string;
  flavor: string;
}

export const DISCOVERY_META: Record<DiscoveryKind, DiscoveryMeta> = {
  relic: {
    kind: "relic",
    label: "Rialo Relic",
    itemName: "Ancient Rialo Relic",
    rarity: "epic",
    xp: 150,
    color: "var(--primary)",
    flavor: "A crystallised shard humming with Rialo energy.",
  },
  "mystery-box": {
    kind: "mystery-box",
    label: "Mystery Box",
    itemName: "Sealed Mystery Box",
    rarity: "rare",
    xp: 100,
    color: "var(--accent)",
    flavor: "Sealed by an unknown explorer. Contents unclear.",
  },
  "quest-node": {
    kind: "quest-node",
    label: "Unknown Signal",
    itemName: "Signal Fragment",
    rarity: "common",
    xp: 60,
    color: "var(--sun)",
    flavor: "A repeating transmission bouncing off the highlands.",
  },
  portal: {
    kind: "portal",
    label: "Ancient Portal",
    itemName: "Portal Key Sigil",
    rarity: "legendary",
    xp: 250,
    color: "var(--primary)",
    flavor: "A doorway humming between two places at once.",
  },
};

/** Interaction range in meters. */
export const INTERACT_RADIUS_M = 80;
/** Anything within this range is reported as "nearby". */
export const NEARBY_RADIUS_M = 400;

const SPAWN_KINDS: DiscoveryKind[] = ["relic", "mystery-box", "quest-node", "portal"];

export function distanceMeters(a: LatLng, b: LatLng) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = (a ^ (a >>> 15)) * 1 | 0;
    t = (t + (t ^ (t >>> 7)) * 61 | 0) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function offset(origin: LatLng, bearingDeg: number, meters: number): LatLng {
  const dLat = (meters * Math.cos((bearingDeg * Math.PI) / 180)) / 111320;
  const dLng =
    (meters * Math.sin((bearingDeg * Math.PI) / 180)) /
    (111320 * Math.cos((origin.lat * Math.PI) / 180));
  return { lat: origin.lat + dLat, lng: origin.lng + dLng };
}

/**
 * Deterministically spawns discoveries in a ring around an origin.
 * Same origin + seed always yields the same world, so the map feels persistent.
 */
export function spawnDiscoveries(origin: LatLng, count = 10, seed?: number) {
  const base =
    seed ??
    (Math.floor(Math.abs(origin.lat * 10000) + Math.abs(origin.lng * 10000)) || 1);
  const rand = mulberry32(base);
  const result = [];
  for (let i = 0; i < count; i++) {
    const kind = SPAWN_KINDS[Math.floor(rand() * SPAWN_KINDS.length)] as DiscoveryKind;
    const bearing = (i / count) * 360 + rand() * 28;
    const radius = i < 3 ? 35 + rand() * 45 : 140 + rand() * 900;
    const position = offset(origin, bearing, radius);
    result.push({
      id: `${base}-${i}`,
      kind,
      position,
      title: DISCOVERY_META[kind].label,
      claimed: false,
    });
  }
  return result;
}
