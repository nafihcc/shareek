import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, ShieldCheck, Smartphone, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useLocationSettings } from "@/context/location";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { formatTime, PRAYER_LABELS } from "@/lib/prayer-times";
import {
  getInstalledApps,
  getNativeStatus,
  isNative,
  nativeOpenAccessibilitySettings,
  nativeOpenBatterySettings,
  nativeRequestNotifications,
  nativeStartTestWindow,
  nativeStopAdhan,
  nativeTestAdhan,
  type InstalledApp,
  type NativeStatus,
} from "@/lib/native";
import {
  BLOCK_MINUTE_OPTIONS,
  FARD_PRAYERS,
  SUGGESTED_APPS,
  buildSchedule,
  usePrayFirst,
  type FardPrayer,
} from "@/lib/pray-first";

export const Route = createFileRoute("/pray-first")({
  head: () => ({
    meta: [
      { title: "Pray First — Pause Distracting Apps at Prayer Time | Shareek" },
      {
        name: "description",
        content:
          "When prayer time comes, Shareek can play the adhan and pause the apps that pull you away, so prayer always comes first. Works in the Shareek Android app.",
      },
      { property: "og:title", content: "Pray First — Shareek" },
      {
        property: "og:description",
        content: "Adhan at prayer time and a pause on distracting apps, chosen by you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrayFirstPage,
});

function StatusPill({ ok, okText, todoText }: { ok: boolean | undefined; okText: string; todoText: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        ok ? "bg-brand/10 text-brand" : "bg-mist text-deep/60"
      }`}
    >
      {ok ? <Check className="size-3" aria-hidden="true" /> : null}
      {ok ? okText : todoText}
    </span>
  );
}

function PrayFirstPage() {
  const { location, settings } = useLocationSettings();
  const { result, now } = usePrayerTimes();
  const { config, update } = usePrayFirst();

  const [native, setNative] = useState(false);
  const [status, setStatus] = useState<NativeStatus | null>(null);
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [query, setQuery] = useState("");

  // Detect the Android app once, then keep its status fresh (the user leaves to
  // Android settings and comes back, so poll gently and on focus).
  useEffect(() => {
    const inApp = isNative();
    setNative(inApp);
    if (!inApp) return;
    setApps(getInstalledApps());
    const refresh = () => setStatus(getNativeStatus());
    refresh();
    const id = setInterval(refresh, 2000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const minuteTick = now ? Math.floor(now.getTime() / 60_000) : 0;
  const upcoming = useMemo(() => {
    if (!now) return null;
    const point = {
      latitude: location.latitude,
      longitude: location.longitude,
      elevation: location.elevation,
    };
    const list = buildSchedule(point, settings, now, 2);
    return (
      list.find((e) => e.at > now.getTime() && config.prayers[e.key].block) ??
      list.find((e) => e.at > now.getTime()) ??
      null
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minuteTick, location, settings, config.prayers]);

  const setPrayer = (key: FardPrayer, patch: Partial<{ adhan: boolean; block: boolean }>) =>
    update((c) => {
      const prayers = { ...c.prayers };
      prayers[key] = { ...prayers[key], ...patch };
      return { ...c, prayers };
    });

  const togglePackage = (pkg: string) =>
    update((c) => ({
      ...c,
      blockedPackages: c.blockedPackages.includes(pkg)
        ? c.blockedPackages.filter((p) => p !== pkg)
        : [...c.blockedPackages, pkg],
    }));

  // Browser preview lists the suggestions; the app lists everything installed.
  const catalogue: InstalledApp[] = native ? apps : SUGGESTED_APPS;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? catalogue.filter((a) => a.label.toLowerCase().includes(q)) : catalogue;
  }, [catalogue, query]);
  const installedSuggestions = useMemo(
    () => SUGGESTED_APPS.filter((s) => catalogue.some((a) => a.pkg === s.pkg)),
    [catalogue],
  );

  const card = "glass-panel rounded-3xl p-5 sm:p-6";

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 pb-16 pt-6 sm:px-6">
      {/* Hero + master switch */}
      <section className={card}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-arabic text-lg text-brand/80" dir="rtl" lang="ar">
              حَيَّ عَلَى الصَّلَاة
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-deep sm:text-3xl">
              <ShieldCheck className="size-6 shrink-0 text-brand" aria-hidden="true" />
              Pray First
            </h1>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-deep/65">
              When prayer time comes, Shareek plays the adhan and pauses the apps that pull you away
              — for as long as you choose. Then they open again, and nothing is lost.
            </p>
          </div>
          <label className="flex shrink-0 flex-col items-center gap-1.5 text-xs font-semibold text-deep/70">
            <Switch
              checked={config.enabled}
              onCheckedChange={(v) => update((c) => ({ ...c, enabled: v }))}
              aria-label="Turn Pray First on or off"
            />
            {config.enabled ? "On" : "Off"}
          </label>
        </div>

        {upcoming ? (
          <p className="mt-4 rounded-2xl bg-mist px-4 py-3 text-sm text-deep/80">
            Next:{" "}
            <span className="font-semibold text-deep">
              {PRAYER_LABELS[upcoming.key]} at {formatTime(new Date(upcoming.at))}
            </span>
            {config.prayers[upcoming.key].block
              ? ` · apps paused for ${config.blockMinutes} min`
              : " · apps stay open"}
          </p>
        ) : null}
      </section>

      {/* Browser preview notice */}
      {!native ? (
        <section className={`${card} flex gap-3`}>
          <Smartphone className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
          <div className="text-sm leading-relaxed text-deep/75">
            <p className="font-semibold text-deep">You're previewing Pray First in a browser</p>
            <p className="mt-1">
              A website cannot see or block other apps on your phone, so blocking only works inside
              the Shareek Android app. You can set everything up here; it takes effect once you open
              the same settings in the app.
            </p>
          </div>
        </section>
      ) : (
        <section className={card}>
          <h2 className="text-lg font-semibold text-deep">Set up</h2>
          <ol className="mt-3 divide-y divide-border">
            <li className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-deep">1. Turn on the app blocker</p>
                <p className="mt-0.5 text-xs leading-relaxed text-deep/60">
                  In Accessibility, open Installed apps and switch on “Shareek Pray First”. It only
                  sees which app is in front — it cannot read your screen or anything you type.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <StatusPill ok={status?.accessibilityEnabled} okText="On" todoText="Off" />
                {!status?.accessibilityEnabled ? (
                  <button
                    type="button"
                    onClick={nativeOpenAccessibilitySettings}
                    className="cursor-pointer rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-deep"
                  >
                    Open settings
                  </button>
                ) : null}
              </div>
            </li>
            <li className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-deep">2. Allow notifications</p>
                <p className="mt-0.5 text-xs leading-relaxed text-deep/60">
                  Needed for the prayer-time alert and the adhan.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <StatusPill ok={status?.notificationsAllowed} okText="Allowed" todoText="Not yet" />
                {!status?.notificationsAllowed ? (
                  <button
                    type="button"
                    onClick={nativeRequestNotifications}
                    className="cursor-pointer rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-deep"
                  >
                    Allow
                  </button>
                ) : null}
              </div>
            </li>
            <li className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-deep">3. Keep alarms on time (recommended)</p>
                <p className="mt-0.5 text-xs leading-relaxed text-deep/60">
                  Some phones stop background apps to save battery. Choose “Don't optimise” for
                  Shareek so the adhan is never late.
                </p>
              </div>
              <button
                type="button"
                onClick={nativeOpenBatterySettings}
                className="shrink-0 cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-deep transition hover:bg-mist"
              >
                Battery settings
              </button>
            </li>
          </ol>
          {status?.blockingNow ? (
            <p className="mt-3 rounded-2xl bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand">
              Apps are paused right now.
            </p>
          ) : null}
        </section>
      )}

      {/* Per-prayer controls */}
      <section className={card}>
        <h2 className="text-lg font-semibold text-deep">Each prayer</h2>
        <p className="mt-1 text-xs text-deep/60">
          Times follow your location and method — {location.name}
          {location.region ? `, ${location.region}` : ""}.
        </p>
        <div className="mt-3 divide-y divide-border">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-deep/50">
            <span>Prayer</span>
            <span className="flex w-14 items-center justify-center gap-1">
              <Volume2 className="size-3" aria-hidden="true" /> Adhan
            </span>
            <span className="w-14 text-center">Block</span>
          </div>
          {FARD_PRAYERS.map((key) => {
            const at = result?.times[key];
            return (
              <div key={key} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-deep">{PRAYER_LABELS[key]}</p>
                  <p className="text-xs tabular-nums text-deep/55">{at ? formatTime(at) : "—"}</p>
                </div>
                <div className="flex w-14 justify-center">
                  <Switch
                    checked={config.prayers[key].adhan}
                    onCheckedChange={(v) => setPrayer(key, { adhan: v })}
                    aria-label={`${PRAYER_LABELS[key]} adhan`}
                  />
                </div>
                <div className="flex w-14 justify-center">
                  <Switch
                    checked={config.prayers[key].block}
                    onCheckedChange={(v) => setPrayer(key, { block: v })}
                    aria-label={`${PRAYER_LABELS[key]} block apps`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-semibold text-deep">Pause apps for</span>
            <select
              value={config.blockMinutes}
              onChange={(e) => update((c) => ({ ...c, blockMinutes: Number(e.target.value) }))}
              className="mt-1.5 w-full rounded-xl border border-border bg-panel px-3 py-2 text-sm text-deep"
            >
              {BLOCK_MINUTE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m} minutes after the prayer time
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-start justify-between gap-3 text-sm">
            <span>
              <span className="block font-semibold text-deep">Strict mode</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-deep/60">
                Removes the emergency-access button from the pause screen.
              </span>
            </span>
            <Switch
              checked={config.strict}
              onCheckedChange={(v) => update((c) => ({ ...c, strict: v }))}
              aria-label="Strict mode"
            />
          </label>
        </div>
      </section>

      {/* App picker */}
      <section className={card}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold text-deep">Apps to pause</h2>
          <span className="text-xs font-semibold text-deep/60">
            {config.blockedPackages.length} selected
          </span>
        </div>

        {installedSuggestions.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {installedSuggestions.map((s) => {
              const on = config.blockedPackages.includes(s.pkg);
              return (
                <button
                  key={s.pkg}
                  type="button"
                  onClick={() => togglePackage(s.pkg)}
                  aria-pressed={on}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    on
                      ? "border-brand bg-brand text-primary-foreground"
                      : "border-border bg-panel text-deep hover:bg-mist"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        ) : null}

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps"
          aria-label="Search apps"
          className="mt-4 w-full rounded-xl border border-border bg-panel px-3 py-2 text-sm text-deep placeholder:text-deep/40"
        />

        <ul className="mt-3 max-h-80 divide-y divide-border overflow-y-auto rounded-2xl border border-border">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-deep/55">
              {native ? "No apps match." : "Open this page in the Shareek app to see your installed apps."}
            </li>
          ) : (
            filtered.map((a) => (
              <li key={a.pkg}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-deep hover:bg-mist">
                  <input
                    type="checkbox"
                    checked={config.blockedPackages.includes(a.pkg)}
                    onChange={() => togglePackage(a.pkg)}
                    className="size-4 accent-brand"
                  />
                  <span className="min-w-0 flex-1 truncate">{a.label}</span>
                </label>
              </li>
            ))
          )}
        </ul>
        <p className="mt-2 text-xs text-deep/55">
          Calls and the phone's own settings are never paused, only the apps you tick here.
        </p>
      </section>

      {/* Test tools */}
      {native ? (
        <section className={card}>
          <h2 className="text-lg font-semibold text-deep">Try it now</h2>
          <p className="mt-1 text-xs leading-relaxed text-deep/60">
            Pause your ticked apps for one minute, then open one of them to see the pause screen.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => nativeStartTestWindow(1)}
              className="cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-deep"
            >
              Pause apps for 1 minute
            </button>
            <button
              type="button"
              onClick={nativeTestAdhan}
              className="cursor-pointer rounded-full border border-border px-4 py-2 text-xs font-semibold text-deep transition hover:bg-mist"
            >
              Play adhan
            </button>
            <button
              type="button"
              onClick={nativeStopAdhan}
              className="cursor-pointer rounded-full border border-border px-4 py-2 text-xs font-semibold text-deep transition hover:bg-mist"
            >
              Stop adhan
            </button>
          </div>
          {status && !status.adhanFile ? (
            <p className="mt-3 text-xs leading-relaxed text-deep/60">
              No adhan recording is bundled in this build, so you'll get the prayer notification
              without sound. See <span className="font-semibold">android/README.md</span> to add one.
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
