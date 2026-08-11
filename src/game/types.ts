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

export type DiscoveryKind = "relic" | "mystery-box" | "portal" | "quest-node";
export type NpcKind = "wanderer" | "guide" | "trader";
export type QuestKind = "find" | "deliver" | "explore";

/** Placeholder — spawned world entities arrive in Phase 2. */
export interface Npc {
  id: string;
  kind: NpcKind;
  position: LatLng;
  title: string;
  dialogue: string[];
  quest?: Quest;
  claimed?: boolean;
}

export interface Quest {
  id: string;
  kind: QuestKind;
  title: string;
  description: string;
  objective: string;
  targetPosition?: LatLng;
  targetId?: string;
  rewardXp: number;
  rewardItem?: string;
  completed: boolean;
  progress: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  quantity: number;
  quest?: Quest;
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