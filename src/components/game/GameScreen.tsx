import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CENTRAL_JAVA_CENTER } from "@/game/config";
import { useGeolocation } from "@/game/useGeolocation";
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
  const [label, setLabel] = useState("Central Java, Indonesia");

  const position = geo.position;

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
      description: "Phase 1 focuses on the real map, GPS and your 3D explorer.",
    });
  }, []);

  const onUserInteract = useCallback(() => setFollow(false), []);

  const locationLabel = useMemo(
    () => (position ? label : "Locating… · Central Java"),
    [position, label],
  );

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <MapView
        playerPosition={position ?? CENTRAL_JAVA_CENTER}
        walking={geo.isMoving}
        follow={follow}
        onUserInteract={onUserInteract}
        recenterSignal={recenterSignal}
      />
      <GameHUD
        level={1}
        xp={0}
        locationLabel={locationLabel}
        accuracy={geo.accuracy}
        address={address}
        connecting={connecting}
        onConnect={onConnect}
        onRecenter={handleRecenter}
        onPlaceholder={handlePlaceholder}
      />
    </div>
  );
}