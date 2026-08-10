import { useCallback, useEffect, useRef, useState } from "react";
import type { LatLng } from "./types";

export interface GeoState {
  position: LatLng | null;
  accuracy: number | null;
  heading: number | null;
  isMoving: boolean;
  error: string | null;
  supported: boolean;
}

function distanceMeters(a: LatLng, b: LatLng) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Watches the real device GPS position and derives a simple movement flag. */
export function useGeolocation(enabled: boolean): GeoState {
  const [state, setState] = useState<GeoState>({
    position: null,
    accuracy: null,
    heading: null,
    isMoving: false,
    error: null,
    supported: true,
  });
  const last = useRef<{ pos: LatLng; t: number } | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(
      () => setState((s) => ({ ...s, isMoving: false })),
      4000,
    );
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState((s) => ({ ...s, supported: false, error: "Geolocation not supported" }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (p) => {
        const pos: LatLng = { lat: p.coords.latitude, lng: p.coords.longitude };
        const now = Date.now();
        let moving = false;
        if (last.current) {
          const d = distanceMeters(last.current.pos, pos);
          const dt = (now - last.current.t) / 1000;
          moving = d > 2 && dt > 0 && d / dt > 0.3;
        }
        last.current = { pos, t: now };
        setState((s) => ({
          ...s,
          position: pos,
          accuracy: p.coords.accuracy ?? null,
          heading: Number.isFinite(p.coords.heading as number) ? p.coords.heading : s.heading,
          isMoving: moving || s.isMoving,
          error: null,
        }));
        if (moving) markIdle();
      },
      (err) => setState((s) => ({ ...s, error: err.message })),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [enabled, markIdle]);

  return state;
}