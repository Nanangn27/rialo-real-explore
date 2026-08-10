import { Sparkles, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DISCOVERY_META, INTERACT_RADIUS_M, formatDistance } from "@/game/discoveries";
import type { WorldEntity } from "@/game/types";

interface Props {
  entity: WorldEntity;
  distance: number | null;
  onInteract: () => void;
  onClose: () => void;
}

export function DiscoveryPanel({ entity, distance, onInteract, onClose }: Props) {
  const meta = DISCOVERY_META[entity.kind];
  const Icon = meta.icon;
  const inRange = distance != null && distance <= INTERACT_RADIUS_M;

  return (
    <div className="pointer-events-auto absolute inset-x-3 bottom-28 z-20 sm:inset-x-auto sm:left-1/2 sm:w-[26rem] sm:-translate-x-1/2">
      <div className="glass-panel rise-in rounded-3xl p-4">
        <div className="flex items-start gap-3">
          <div
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
            style={{ background: `color-mix(in oklab, ${meta.color} 22%, transparent)` }}
          >
            <Icon className="h-7 w-7" style={{ color: meta.color }} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> Discovery found
            </p>
            <h2 className="font-display text-lg font-bold leading-tight">{meta.itemName}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{meta.flavor}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-primary">
              <Navigation className="h-3 w-3" />
              {distance != null ? `${formatDistance(distance)} away` : "Distance unknown"}
              <span className="text-muted-foreground">· +{meta.xp} XP</span>
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button
            className="h-11 flex-1 rounded-2xl font-display text-sm font-bold tracking-wide"
            disabled={!inRange}
            onClick={onInteract}
          >
            {inRange ? "INTERACT" : `WALK CLOSER (${INTERACT_RADIUS_M}m)`}
          </Button>
          <Button variant="ghost" className="h-11 rounded-2xl" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
