import { DISCOVERY_META, formatDistance } from "@/game/discoveries";
import type { WorldEntity } from "@/game/types";

interface Props {
  entity: WorldEntity;
  distance: number | null;
  active: boolean;
  inRange: boolean;
  onSelect: () => void;
}

export function DiscoveryMarker({ entity, distance, active, inRange, onSelect }: Props) {
  const meta = DISCOVERY_META[entity.kind];
  const Icon = meta.icon;
  if (entity.claimed) return null;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${meta.label}${distance != null ? ` ${formatDistance(distance)} away` : ""}`}
      className="pointer-events-auto group absolute -translate-x-1/2 -translate-y-full focus:outline-none"
      style={{ left: 0, top: 0 }}
    >
      <div className="relative grid place-items-center">
        <span
          className="pulse-ring absolute -bottom-2 h-10 w-10 rounded-full border-2"
          style={{
            borderColor: `color-mix(in oklab, ${meta.color} 70%, transparent)`,
            background: `color-mix(in oklab, ${meta.color} 22%, transparent)`,
          }}
        />
        <div
          className={`glass-panel relative grid h-11 w-11 place-items-center rounded-2xl text-xl transition-transform duration-200 group-hover:-translate-y-1 group-active:scale-95 ${
            active ? "-translate-y-1 ring-2 ring-primary" : ""
          }`}
          style={{
            boxShadow: inRange
              ? `0 0 0 2px color-mix(in oklab, ${meta.color} 55%, transparent), 0 10px 24px -10px ${meta.color}`
              : undefined,
            animation: "float-bob 3s ease-in-out infinite",
          }}
        >
          <Icon className="h-5 w-5" style={{ color: meta.color }} aria-hidden />
        </div>
        {distance != null && (
          <span className="pointer-events-none glass-panel mt-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide">
            {formatDistance(distance)}
          </span>
        )}
      </div>
    </button>
  );
}
