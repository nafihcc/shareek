import { useEffect } from "react";
import { useLocationSettings } from "@/context/location";
import { isNative } from "@/lib/native";
import { syncToNative, usePrayFirst } from "@/lib/pray-first";

/**
 * Keeps the Android app's blocking schedule current. Renders nothing; in a
 * normal browser it does nothing at all. It re-syncs when the settings,
 * location or calculation method change, and whenever the app comes back to
 * the foreground (which also tops up the rolling 10-day schedule).
 */
export function PrayFirstSync() {
  const { location, settings } = useLocationSettings();
  const { config } = usePrayFirst();

  useEffect(() => {
    if (!isNative()) return;
    const point = {
      latitude: location.latitude,
      longitude: location.longitude,
      elevation: location.elevation,
    };
    const sync = () => syncToNative(config, point, settings);
    sync();
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [config, location, settings]);

  return null;
}
