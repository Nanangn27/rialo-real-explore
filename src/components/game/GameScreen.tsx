import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FALLBACK_CENTER } from "@/game/config";
import { DISCOVERY_META, distanceMeters } from "@/game/discoveries";
import { useDiscoveries } from "@/game/useDiscoveries";
import { useGeolocation } from "@/game/useGeolocation";
import type { WorldEntity } from "@/game/types";
import { CollectionSheet } from "./CollectionSheet";
import { DiscoveryPanel } from "./DiscoveryPanel";
import { GameHUD } from "./GameHUD";
import { MapView } from "./MapView";

interface GameScreenProps {
  address: string | null;
  connecting: boolean;
  onConnect: () => void;
}

export function GameScreen({ address, connecting, onConnect }: GameScreenProps) {
  const geo = useGeolocation(true);
  const [follow, setFollow] = useState(true);
  const [recenterSignal, setRecenterSignal] = useState(0);
  const [label, setLabel] = useState("Explore The World");
  const [selected, setSelected] = useState<WorldEntity | null>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);

  const position = geo.position;
  const world = useDiscoveries(position, FALLBACK_CENTER);

  useEffect(() => {
    if (geo.error) toast.error("Location unavailable", { description: geo.error });
  }, [geo.error]);

  // Reverse geocode the player's area for the HUD label.
  useEffect(() => {
    if (!position) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.lat}&lon=${position.lng}&zoom=14`,
          { signal: controller.signal, headers: { Accept: "application/json" } },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          address?: Record<string, string>;
          display_name?: string;
        };
        const a = data.address ?? {};
        const area =
          a["village"] ??
          a["suburb"] ??
          a["town"] ??
          a["city_district"] ??
          a["city"] ??
          a["county"];
        const region = a["state"] ?? a["region"];
        setLabel([area, region].filter(Boolean).join(", ") || (data.display_name ?? label));
      } catch {
        /* keep previous label */
      }
    }, 800);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.lat.toFixed(3), position?.lng.toFixed(3)]);

  const handleRecenter = useCallback(() => {
    setFollow(true);
    setRecenterSignal((n) => n + 1);
  }, []);

  const handlePlaceholder = useCallback((feature: string) => {
    toast(`${feature} unlocks in the next phase`, {
      description: "Quests, NPCs and on-chain rewards are coming soon.",
    });
  }, []);

  const handleTrackNearest = useCallback(() => {
    const nearest = world.nearby[0];
    if (!nearest) {
      toast("No signals in range", { description: "Explore further to reveal new discoveries." });
      return;
    }
    setSelected(nearest);
  }, [world.nearby]);

  const handleInteract = useCallback(() => {
    if (!selected) return;
    const meta = DISCOVERY_META[selected.kind];
    world.claim(selected);
    setSelected(null);
    toast.success(`${meta.itemName} collected!`, {
      description: `+${meta.xp} XP · added to your collection`,
    });
  }, [selected, world]);

  const onUserInteract = useCallback(() => setFollow(false), []);

  const locationLabel = useMemo(
    () => (position ? label : "Locating… · Explore The World"),
    [position, label],
  );

  const selectedDistance =
    selected && position ? distanceMeters(position, selected.position) : null;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <MapView
        playerPosition={position ?? FALLBACK_CENTER}
        walking={geo.isMoving}
        follow={follow}
        onUserInteract={onUserInteract}
        recenterSignal={recenterSignal}
        discoveries={world.entities}
        selectedId={selected?.id ?? null}
        onSelectDiscovery={setSelected}
      />
      <GameHUD
        level={world.level}
        xp={world.xp}
        discoveryCount={world.discoveryCount}
        nearby={world.nearby}
        locationLabel={locationLabel}
        accuracy={geo.accuracy}
        address={address}
        connecting={connecting}
        onConnect={onConnect}
        onRecenter={handleRecenter}
        onOpenCollection={() => setCollectionOpen(true)}
        onTrackNearest={handleTrackNearest}
        onPlaceholder={handlePlaceholder}
      />
      {selected && (
        <DiscoveryPanel
          entity={selected}
          distance={selectedDistance}
          onInteract={handleInteract}
          onClose={() => setSelected(null)}
        />
      )}
      <CollectionSheet
        open={collectionOpen}
        onOpenChange={setCollectionOpen}
        items={world.items}
        discoveryCount={world.discoveryCount}
        totalXp={world.totalXp}
      />
    </div>
  );
}
