/**
 * Core domain types for Rialo Explorer.
 * Phase 1 only implements the player + map. Everything else is declared here
 * so future phases (relics, quests, portals, NPCs, multiplayer) can plug in
 * without reshaping existing code.
 */

export type LatLng = { lat: number; lng: number };

export interface PlayerState {
  position: LatLng | null;
  heading: number | null;
  accuracy: number | null;
  isMoving: boolean;
  level: number;
  xp: number;
  xpToNext: number;
  locationLabel: string;
}

export type DiscoveryKind = "relic" | "mystery-box" | "portal" | "npc" | "quest-node";

/** Placeholder — spawned world entities arrive in Phase 2. */
export interface WorldEntity {
  id: string;
  kind: DiscoveryKind;
  position: LatLng;
  title: string;
  claimed?: boolean;
}

/** Placeholder — inventory items arrive in Phase 2. */
export interface InventoryItem {
  id: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  quantity: number;
}

/** Placeholder — achievements arrive in Phase 3. */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export interface WalletState {
  address: string | null;
  connecting: boolean;
  error: string | null;
}