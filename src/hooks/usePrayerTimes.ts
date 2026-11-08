import { useEffect, useMemo, useState } from "react";
import { useLocationSettings } from "@/context/location";
import {
  computePrayerTimes,
  findNextPrayer,
  type PrayerTimesResult,
  type NextPrayerInfo,
} from "@/lib/prayer-times";

/** Ticks once a second on the client only, so SSR and hydration stay in step. */
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function usePrayerTimes(date?: Date): {
  result: PrayerTimesResult | null;
  next: NextPrayerInfo | null;
  now: Date | null;
} {
  const { location, settings } = useLocationSettings();
  const now = useNow();

  const point = useMemo(
    () => ({
      latitude: location.latitude,
      longitude: location.longitude,
      elevation: location.elevation,
    }),
    [location],
  );

  const result = useMemo(() => {
    if (!now) return null;
    return computePrayerTimes(date ?? now, point, settings);
  }, [now ? (date ?? now).toDateString() : null, point, settings, now !== null]);

  const next = useMemo(() => {
    if (!now) return null;
    return findNextPrayer(point, settings, now);
  }, [now, point, settings]);

  return { result, next, now };
}

export function useHijriDate(now: Date | null): string {
  return useMemo(() => {
    if (!now) return "";
    try {
      return new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now);
    } catch {
      return "";
    }
  }, [now]);
}
