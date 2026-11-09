import { useCallback, useEffect, useState } from "react";
import {
  computePrayerTimes,
  type GeoPoint,
  type MethodSettings,
  type PrayerKey,
} from "@/lib/prayer-times";
import { isNative, nativeSaveConfig, nativeSaveSchedule } from "@/lib/native";

/** The five obligatory prayers (sunrise is not a prayer time). */
export type FardPrayer = Exclude<PrayerKey, "sunrise">;
export const FARD_PRAYERS: FardPrayer[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export interface PrayFirstConfig {
  /** Master switch. Off = nothing is scheduled and nothing is blocked. */
  enabled: boolean;
  /**
   * "prayed": apps stay locked from the prayer time until you tap "I've prayed"
   * (they release by themselves after 2 hours so a forgotten tap never locks you out).
   * "timer": apps unlock by themselves `blockMinutes` after the prayer time.
   */
  unlock: "prayed" | "timer";
  /** Timer mode only: how long apps stay locked after each prayer time. */
  blockMinutes: number;
  /** Strict mode removes the emergency-access button from the block screen. */
  strict: boolean;
  prayers: Record<FardPrayer, { adhan: boolean; block: boolean }>;
  /** Android package names, e.g. "com.instagram.android". */
  blockedPackages: string[];
}

export const BLOCK_MINUTE_OPTIONS = [5, 10, 15, 20, 30, 45, 60] as const;

export const DEFAULT_PRAY_FIRST: PrayFirstConfig = {
  enabled: false,
  unlock: "prayed",
  blockMinutes: 20,
  strict: false,
  prayers: {
    fajr: { adhan: true, block: true },
    dhuhr: { adhan: true, block: true },
    asr: { adhan: true, block: true },
    maghrib: { adhan: true, block: true },
    isha: { adhan: true, block: true },
  },
  blockedPackages: [],
};

/** Popular distracting apps, offered as one-tap suggestions. */
export const SUGGESTED_APPS: Array<{ pkg: string; label: string }> = [
  { pkg: "com.instagram.android", label: "Instagram" },
  { pkg: "com.google.android.youtube", label: "YouTube" },
  { pkg: "com.facebook.katana", label: "Facebook" },
  { pkg: "com.zhiliaoapp.musically", label: "TikTok" },
  { pkg: "com.snapchat.android", label: "Snapchat" },
  { pkg: "com.twitter.android", label: "X (Twitter)" },
  { pkg: "com.reddit.frontpage", label: "Reddit" },
  { pkg: "com.netflix.mediaclient", label: "Netflix" },
  { pkg: "org.telegram.messenger", label: "Telegram" },
  { pkg: "com.whatsapp", label: "WhatsApp" },
  { pkg: "com.pinterest", label: "Pinterest" },
  { pkg: "com.discord", label: "Discord" },
];

const STORAGE_KEY = "shareek.prayFirst";
const CHANGE_EVENT = "shareek:prayfirst";
/** How many days of prayer times are handed to the Android app. */
const SCHEDULE_DAYS = 10;

function normalise(raw: Partial<PrayFirstConfig> | null): PrayFirstConfig {
  const base = DEFAULT_PRAY_FIRST;
  if (!raw) return base;
  const prayers = { ...base.prayers };
  for (const key of FARD_PRAYERS) {
    const saved = raw.prayers?.[key];
    if (saved) {
      prayers[key] = {
        adhan: saved.adhan ?? base.prayers[key].adhan,
        block: saved.block ?? base.prayers[key].block,
      };
    }
  }
  const minutes = Number(raw.blockMinutes);
  return {
    enabled: Boolean(raw.enabled),
    unlock: raw.unlock === "timer" ? "timer" : "prayed",
    blockMinutes: Number.isFinite(minutes) && minutes >= 5 && minutes <= 120 ? minutes : base.blockMinutes,
    strict: Boolean(raw.strict),
    prayers,
    blockedPackages: Array.isArray(raw.blockedPackages)
      ? raw.blockedPackages.filter((p): p is string => typeof p === "string")
      : [],
  };
}

export function loadPrayFirst(): PrayFirstConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return normalise(raw ? (JSON.parse(raw) as Partial<PrayFirstConfig>) : null);
  } catch {
    return DEFAULT_PRAY_FIRST;
  }
}

export function savePrayFirst(config: PrayFirstConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* Storage unavailable: settings last for this session only. */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Reads the saved settings and re-renders whenever they change anywhere in the app. */
export function usePrayFirst() {
  const [config, setConfig] = useState<PrayFirstConfig>(DEFAULT_PRAY_FIRST);

  useEffect(() => {
    setConfig(loadPrayFirst());
    const onChange = () => setConfig(loadPrayFirst());
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  const update = useCallback((change: (current: PrayFirstConfig) => PrayFirstConfig) => {
    savePrayFirst(change(loadPrayFirst()));
  }, []);

  return { config, update };
}

export interface ScheduleEntry {
  key: FardPrayer;
  /** Epoch milliseconds. */
  at: number;
}

/**
 * Upcoming prayer times for the next `days` days, computed with the same
 * engine as the rest of the site. The Android app stores this list and
 * schedules alarms / blocking windows from it, so it keeps working offline.
 */
export function buildSchedule(
  point: GeoPoint,
  settings: MethodSettings,
  from: Date = new Date(),
  days: number = SCHEDULE_DAYS,
): ScheduleEntry[] {
  const entries: ScheduleEntry[] = [];
  // Keep the last hour so an app opened mid-window still sees the active window.
  const cutoff = from.getTime() - 60 * 60_000;
  for (let i = -1; i <= days; i += 1) {
    const noon = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, 12);
    const times = computePrayerTimes(noon, point, settings).times;
    for (const key of FARD_PRAYERS) {
      const at = times[key].getTime();
      if (at >= cutoff) entries.push({ key, at });
    }
  }
  return entries.sort((a, b) => a.at - b.at);
}

/** Pushes the settings and prayer schedule to the Android app (no-op in a browser). */
export function syncToNative(
  config: PrayFirstConfig,
  point: GeoPoint,
  settings: MethodSettings,
): void {
  if (!isNative()) return;
  nativeSaveConfig(JSON.stringify(config));
  nativeSaveSchedule(JSON.stringify(buildSchedule(point, settings)));
}
