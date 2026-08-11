import { useEffect, useRef, useState } from "react";
import type { Map as MLMap } from "maplibre-gl";
import { FALLBACK_CENTER, MAP_DEFAULTS, WORLD_ZOOM } from "@/game/config";
import type { LatLng, WorldEntity } from "@/game/types";
import { INTERACT_RADIUS_M, distanceMeters } from "@/game/discoveries";
import { useDeviceProfile } from "@/game/useDeviceProfile";
import { ExplorerCharacter } from "./ExplorerCharacter";
import { DiscoveryMarker } from "./DiscoveryMarker";

const BRIGHT_OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    { id: "sky-base", type: "background" as const, paint: { "background-color": "#dfeeff" } },
    { id: "osm", type: "raster" as const, source: "osm" },
  ],
};

interface MapViewProps {
  playerPosition: LatLng | null;
  walking: boolean;
  follow: boolean;
  onUserInteract: () => void;
  recenterSignal: number;
  discoveries?: WorldEntity[];
  selectedId?: string | null;
  onSelectDiscovery?: (entity: WorldEntity) => void;
}

export function MapView({
  playerPosition,
  walking,
  follow,
  onUserInteract,
  recenterSignal,
  discoveries = [],
  selectedId = null,
  onSelectDiscovery,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const profile = useDeviceProfile();
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const [ready, setReady] = useState(false);
  const hasFlownToPlayer = useRef(false);
  const [screen, setScreen] = useState<{ x: number; y: number } | null>(null);
  const [markerScreens, setMarkerScreens] = useState<Record<string, { x: number; y: number }>>(
    {},
  );

  // Create the map once, client-side only.
  useEffect(() => {
    let disposed = false;
    (async () => {
      const maplibre = await import("maplibre-gl");
      await import("maplibre-gl/dist/maplibre-gl.css");
      if (disposed || !containerRef.current || mapRef.current) return;

      const map = new maplibre.Map({
        container: containerRef.current,
        style: BRIGHT_OSM_STYLE,
        center: [FALLBACK_CENTER.lng, FALLBACK_CENTER.lat],
        zoom: WORLD_ZOOM,
        pitch: profileRef.current.map.pitch,
        bearing: MAP_DEFAULTS.bearing,
        minZoom: MAP_DEFAULTS.minZoom,
        maxZoom: MAP_DEFAULTS.maxZoom,
        renderWorldCopies: true,
        canvasContextAttributes: {
          antialias: profileRef.current.map.antialias,
          powerPreference: profileRef.current.tier === "high" ? "high-performance" : "low-power",
        },
        fadeDuration: profileRef.current.map.fadeDuration,
        refreshExpiredTiles: false,
        // Tiles load per viewport only — nothing global is prefetched.
        maxTileCacheSize: profileRef.current.tier === "low" ? 40 : 120,
        attributionControl: { compact: true },
        dragRotate: true,
      });
      map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), "bottom-right");
      map.touchZoomRotate.enable({ around: "center" });
      // Desktop: mouse wheel + arrow-key/+- navigation.
      map.scrollZoom.enable({ around: "center" });
      map.keyboard.enable();
      map.on("load", () => {
        map.resize();
        setReady(true);
      });
      map.on("dragstart", onUserInteract);
      map.on("zoomstart", onUserInteract);
      mapRef.current = map;
    })();

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onUserInteract]);

  // Keep the avatar pinned to the player's projected screen position.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const project = () => {
      const target = playerPosition ?? FALLBACK_CENTER;
      const p = map.project([target.lng, target.lat]);
      setScreen({ x: p.x, y: p.y });
      const next: Record<string, { x: number; y: number }> = {};
      for (const d of discoveries) {
        if (d.claimed) continue;
        const q = map.project([d.position.lng, d.position.lat]);
        next[d.id] = { x: q.x, y: q.y };
      }
      setMarkerScreens(next);
    };
    project();
    map.on("move", project);
    map.on("resize", project);
    map.on("idle", project);
    const ro = new ResizeObserver(() => {
      map.resize();
      project();
    });
    if (containerRef.current) ro.observe(containerRef.current);
    const raf = requestAnimationFrame(() => {
      map.resize();
      project();
    });
    return () => {
      map.off("move", project);
      map.off("resize", project);
      map.off("idle", project);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [ready, playerPosition, discoveries]);

  // Follow the player.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !playerPosition) return;
    // First real GPS fix anywhere in the world: fly in from the world view.
    if (!hasFlownToPlayer.current) {
      hasFlownToPlayer.current = true;
      map.flyTo({
        center: [playerPosition.lng, playerPosition.lat],
        zoom: MAP_DEFAULTS.zoom,
        pitch: MAP_DEFAULTS.pitch,
        duration: 2200,
        essential: true,
      });
      return;
    }
    if (!follow) return;
    map.easeTo({
      center: [playerPosition.lng, playerPosition.lat],
      duration: 900,
      essential: true,
    });
  }, [ready, playerPosition, follow]);

  // Manual recenter button.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || recenterSignal === 0) return;
    const target = playerPosition ?? FALLBACK_CENTER;
    map.easeTo({
      center: [target.lng, target.lat],
      zoom: Math.max(map.getZoom(), MAP_DEFAULTS.zoom),
      pitch: MAP_DEFAULTS.pitch,
      duration: 1100,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterSignal]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        ref={containerRef}
        className="h-full w-full [&_.maplibregl-canvas]:saturate-[1.08] [&_.maplibregl-canvas]:brightness-[1.03] [&_.maplibregl-ctrl-bottom-right]:bottom-28 [&_.maplibregl-ctrl-bottom-left]:bottom-28"
      />
      {/* daylight atmosphere wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_-10%,color-mix(in_oklab,var(--sun)_45%,transparent),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--sky-2)_75%,transparent),transparent)]" />

      {screen && (
        <div
          className="pointer-events-none absolute"
          style={{ left: screen.x, top: screen.y, transform: "translate(-50%, -50%)" }}
        >
          <div className="relative grid place-items-center">
            <span className="pulse-ring absolute h-16 w-16 rounded-full border-2 border-primary/60 bg-primary/15" />
            <span className="absolute h-6 w-6 rounded-full bg-primary/70 blur-[6px]" />
            <div className="relative h-[150px] w-[130px] -translate-y-[46px]">
              <ExplorerCharacter walking={walking} />
            </div>
          </div>
        </div>
      )}

      {/* Discovery markers */}
      <div className="pointer-events-none absolute inset-0">
        {discoveries.map((d) => {
          const pos = markerScreens[d.id];
          if (!pos || d.claimed) return null;
          const distance = playerPosition ? distanceMeters(playerPosition, d.position) : null;
          return (
            <div
              key={d.id}
              className="absolute"
              style={{
                left: pos.x,
                top: pos.y,
                zIndex: distance != null ? Math.max(1, 2000 - Math.round(distance)) : 1,
              }}
            >
              <DiscoveryMarker
                entity={d}
                distance={distance}
                active={selectedId === d.id}
                inRange={distance != null && distance <= INTERACT_RADIUS_M}
                onSelect={() => onSelectDiscovery?.(d)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}