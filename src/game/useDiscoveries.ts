import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DISCOVERY_META,
  NEARBY_RADIUS_M,
  distanceMeters,
  spawnDiscoveries,
} from "./discoveries";
import { XP_PER_LEVEL } from "./config";
import type { InventoryItem, LatLng, WorldEntity } from "./types";

const STORAGE_KEY = "rialo-explorer-progress-v1";

interface Progress {
  xp: number;
  claimedIds: string[];
  items: InventoryItem[];
}

const EMPTY: Progress = { xp: 0, claimedIds: [], items: [] };

function load(): Progress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Progress) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export interface NearbyDiscovery extends WorldEntity {
  distance: number;
}

/**
 * Owns the Phase 2 discovery world: spawning, claiming, XP and collection.
 * Kept independent of the map so quests / NPCs / RLO rewards can hook in later.
 */
export function useDiscoveries(playerPosition: LatLng | null, spawnOrigin: LatLng) {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [entities, setEntities] = useState<WorldEntity[]>([]);
  const originRef = useRef<LatLng | null>(null);

  useEffect(() => {
    setProgress(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* storage unavailable */
    }
  }, [progress, hydrated]);

  // Spawn around the player, and re-seed a new cluster when they roam far away.
  useEffect(() => {
    const origin = playerPosition ?? spawnOrigin;
    const prev = originRef.current;
    if (prev && distanceMeters(prev, origin) < 700) return;
    originRef.current = origin;
    setEntities((current) => {
      const next = spawnDiscoveries(origin, 10);
      const seen = new Set(current.map((e) => e.id));
      return [...current, ...next.filter((e) => !seen.has(e.id))];
    });
  }, [playerPosition, spawnOrigin]);

  const claimed = useMemo(() => new Set(progress.claimedIds), [progress.claimedIds]);

  const visible = useMemo(
    () => entities.map((e) => ({ ...e, claimed: claimed.has(e.id) })),
    [entities, claimed],
  );

  const nearby: NearbyDiscovery[] = useMemo(() => {
    if (!playerPosition) return [];
    return visible
      .filter((e) => !e.claimed)
      .map((e) => ({ ...e, distance: distanceMeters(playerPosition, e.position) }))
      .filter((e) => e.distance <= NEARBY_RADIUS_M)
      .sort((a, b) => a.distance - b.distance);
  }, [visible, playerPosition]);

  const claim = useCallback((entity: WorldEntity) => {
    const meta = DISCOVERY_META[entity.kind];
    setProgress((p) => {
      if (p.claimedIds.includes(entity.id)) return p;
      const items = [...p.items];
      const existing = items.findIndex((i) => i.id === meta.kind);
      if (existing >= 0) {
        items[existing] = { ...items[existing]!, quantity: items[existing]!.quantity + 1 };
      } else {
        items.push({ id: meta.kind, name: meta.itemName, rarity: meta.rarity, quantity: 1 });
      }
      return { xp: p.xp + meta.xp, claimedIds: [...p.claimedIds, entity.id], items };
    });
  }, []);

  const level = Math.floor(progress.xp / XP_PER_LEVEL) + 1;

  return {
    entities: visible,
    nearby,
    claim,
    items: progress.items,
    xp: progress.xp % XP_PER_LEVEL,
    totalXp: progress.xp,
    level,
    discoveryCount: progress.claimedIds.length,
  };
}
