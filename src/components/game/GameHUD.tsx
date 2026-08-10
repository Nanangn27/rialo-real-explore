import { Backpack, Compass, User, Crosshair, MapPin, Radar, Sparkles } from "lucide-react";
import logo from "@/assets/rialo-logo.png.asset.json";
import { XP_PER_LEVEL } from "@/game/config";
import { DISCOVERY_META, formatDistance } from "@/game/discoveries";
import type { NearbyDiscovery } from "@/game/useDiscoveries";
import { WalletButton } from "./WalletButton";

interface GameHUDProps {
  level: number;
  xp: number;
  discoveryCount: number;
  nearby: NearbyDiscovery[];
  locationLabel: string;
  accuracy: number | null;
  address: string | null;
  connecting: boolean;
  onConnect: () => void;
  onRecenter: () => void;
  onOpenCollection: () => void;
  onTrackNearest: () => void;
  onPlaceholder: (feature: string) => void;
}

export function GameHUD({
  level,
  xp,
  discoveryCount,
  nearby,
  locationLabel,
  accuracy,
  address,
  connecting,
  onConnect,
  onRecenter,
  onOpenCollection,
  onTrackNearest,
  onPlaceholder,
}: GameHUDProps) {
  const progress = Math.min(100, (xp / XP_PER_LEVEL) * 100);
  const nearest = nearby[0];

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-2">
        <div className="pointer-events-auto glass-panel flex items-center gap-3 rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
          <img src={logo.url} alt="Rialo Explorer logo" className="h-8 w-8 sm:h-9 sm:w-9" />
          <div className="min-w-0">
            <p className="font-display text-xs font-bold leading-tight sm:text-sm">
              Explorer Level {level}
            </p>
            <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-secondary sm:w-32">
              <div
                className="h-full rounded-full bg-[var(--gradient-primary)] transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground">
              <span>
                XP {xp} / {XP_PER_LEVEL}
              </span>
              <span className="flex items-center gap-1 text-foreground">
                <Sparkles className="h-3 w-3 text-primary" /> {discoveryCount}
              </span>
            </p>
          </div>
        </div>

        <div className="pointer-events-auto">
          <WalletButton
            address={address}
            connecting={connecting}
            onConnect={onConnect}
            compact
          />
        </div>
      </div>

      {/* Nearby indicator */}
      {nearest && (
        <button
          type="button"
          onClick={onTrackNearest}
          className="pointer-events-auto mx-auto flex max-w-full items-center gap-2 rounded-full glass-panel px-3 py-1.5 text-left transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          <Radar className="h-4 w-4 shrink-0 animate-pulse text-primary" />
          <span className="truncate text-xs font-semibold">
            {DISCOVERY_META[nearest.kind].label} detected — {formatDistance(nearest.distance)} away
          </span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {nearby.length} nearby
          </span>
        </button>
      )}

      {/* Bottom bar */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="pointer-events-auto glass-panel min-w-0 flex-1 rounded-2xl px-3 py-2 sm:max-w-xs sm:px-4 sm:py-3">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <MapPin className="h-3 w-3 text-primary" /> Current location
          </p>
          <p className="truncate font-display text-sm font-bold sm:text-base">{locationLabel}</p>
          {accuracy != null && (
            <p className="text-[10px] text-muted-foreground">GPS ±{Math.round(accuracy)} m</p>
          )}
        </div>

        <div className="pointer-events-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <HudButton label="Recenter" onClick={onRecenter}>
            <Crosshair className="h-5 w-5 text-primary" />
          </HudButton>
          <HudButton label="Discovery" onClick={onTrackNearest}>
            <Compass className="h-5 w-5 text-primary" />
          </HudButton>
          <HudButton label="Collection" onClick={onOpenCollection} badge={discoveryCount}>
            <Backpack className="h-5 w-5 text-primary" />
          </HudButton>
          <HudButton label="Profile" onClick={() => onPlaceholder("Profile")}>
            <User className="h-5 w-5 text-primary" />
          </HudButton>
        </div>
      </div>
    </div>
  );
}

function HudButton({
  label,
  onClick,
  badge,
  children,
}: {
  label: string;
  onClick: () => void;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="glass-panel relative grid h-10 w-10 place-items-center rounded-2xl transition-transform hover:-translate-y-0.5 active:scale-95 sm:h-12 sm:w-12"
    >
      {children}
      {!!badge && (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}
