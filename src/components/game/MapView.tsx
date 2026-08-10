import { useEffect, useRef, useState } from "react";
import type { Map as MLMap } from "maplibre-gl";
import { CENTRAL_JAVA_CENTER, MAP_DEFAULTS } from "@/game/config";
import type { LatLng } from "@/game/types";
import { ExplorerCharacter } from "./ExplorerCharacter";

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
}

export function MapView({
  playerPosition,
  walking,
  follow,
  onUserInteract,
  recenterSignal,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<{ x: number; y: number } | null>(null);

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
        center: [CENTRAL_JAVA_CENTER.lng, CENTRAL_JAVA_CENTER.lat],
        zoom: MAP_DEFAULTS.zoom,
        pitch: MAP_DEFAULTS.pitch,
        bearing: MAP_DEFAULTS.bearing,
        minZoom: MAP_DEFAULTS.minZoom,
        maxZoom: MAP_DEFAULTS.maxZoom,
        attributionControl: { compact: true },
        dragRotate: true,
      });
      map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), "bottom-right");
      map.touchZoomRotate.enable({ around: "center" });
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
      const target = playerPosition ?? CENTRAL_JAVA_CENTER;
      const p = map.project([target.lng, target.lat]);
      setScreen({ x: p.x, y: p.y });
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
  }, [ready, playerPosition]);

  // Follow the player.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !playerPosition || !follow) return;
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
    const target = playerPosition ?? CENTRAL_JAVA_CENTER;
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
        className="absolute inset-0 [&_.maplibregl-canvas]:saturate-[1.08] [&_.maplibregl-canvas]:brightness-[1.03]"
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
    </div>
  );
}