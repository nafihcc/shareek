import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Lock, Search, Smartphone, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AppIcon } from "@/components/AppIcon";
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
      { title: "Pray First — Lock Distracting Apps Until You've Prayed | Shareek" },
      {
        name: "description",
        content:
          "When prayer time comes, Shareek plays the adhan and locks the apps that pull you away until you've prayed. Works in the Shareek Android app.",
      },
      { property: "og:title", content: "Pray First — Shareek" },
      {
        property: "og:description",
        content: "Adhan at prayer time and a lock on distracting apps, chosen by you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrayFirstPage,
});

const card = "glass-panel rounded-3xl p-5 sm:p-6";

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-base font-semibold text-deep">{children}</h2>
      {hint ? <p className="mt-0.5 text-xs leading-relaxed text-deep/60">{hint}</p> : null}
    </div>
  );
}

function SetupRow({
  step,
  title,
  body,
  done,
  action,
  onAction,
}: {
  step: number;
  title: string;
  body: string;
  done?: boolean;
  action: string;
  onAction: () => void;
}) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done ? "bg-brand text-primary-foreground" : "bg-brand/10 text-brand"
        }`}
      >
        {done ? <Check className="size-4" aria-hidden="true" /> : step}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-deep">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-deep/60">{body}</p>
      </div>
      {done ? (
        <span className="shrink-0 text-xs font-semibold text-brand">Done</span>
      ) : (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-deep"
        >
          {action}
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </li>
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

  // Detect the Android app, then keep its status fresh: the user leaves for
  // Android settings and comes back, so poll gently and on return.
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

  // In the app: every installed app, popular distractions first. In a browser
  // there is no app list, so show the common ones as a preview.
  const catalogue: InstalledApp[] = useMemo(() => {
    if (!native) return SUGGESTED_APPS;
    const popular = new Map(SUGGESTED_APPS.map((s, i) => [s.pkg, i]));
    return [...apps].sort((a, b) => {
      const pa = popular.has(a.pkg) ? popular.get(a.pkg)! : Infinity;
      const pb = popular.has(b.pkg) ? popular.get(b.pkg)! : Infinity;
      if (pa !== pb) return pa - pb;
      return a.label.localeCompare(b.label);
    });
  }, [native, apps]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? catalogue.filter((a) => a.label.toLowerCase().includes(q)) : catalogue;
  }, [catalogue, query]);

  const selectedApps = useMemo(
    () =>
      config.blockedPackages.map(
        (pkg) =>
          catalogue.find((a) => a.pkg === pkg) ??
          SUGGESTED_APPS.find((a) => a.pkg === pkg) ?? { pkg, label: pkg.split(".").pop() ?? pkg },
      ),
    [config.blockedPackages, catalogue],
  );

  const untilPrayed = config.unlock === "prayed";

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 pb-20 pt-5 sm:px-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(140deg,#0b2e24,#12503d)] p-5 text-white shadow-lg sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-arabic text-lg text-[#e6c77a]" dir="rtl" lang="ar">
              حَيَّ عَلَى الصَّلَاة
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Pray First</h1>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/75">
              At prayer time your chosen apps are locked
              {untilPrayed ? " until you tap “I’ve prayed”." : ` for ${config.blockMinutes} minutes.`}
            </p>
          </div>
          <label className="flex shrink-0 flex-col items-center gap-1.5 text-xs font-semibold text-white/80">
            <Switch
              checked={config.enabled}
              onCheckedChange={(v) => update((c) => ({ ...c, enabled: v }))}
              aria-label="Turn Pray First on or off"
            />
            {config.enabled ? "On" : "Off"}
          </label>
        </div>

        {upcoming ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm">
            <span className="text-white/75">Next lock</span>
            <span className="font-semibold">
              {PRAYER_LABELS[upcoming.key]} · {formatTime(new Date(upcoming.at))}
              {config.prayers[upcoming.key].block ? "" : " (apps stay open)"}
            </span>
          </div>
        ) : null}

        {native && status?.blockingNow ? (
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#e6c77a]">
            <Lock className="size-4" aria-hidden="true" /> Apps are locked right now
          </p>
        ) : null}
      </section>

      {/* Browser preview notice, or app setup */}
      {!native ? (
        <section className={`${card} flex gap-3`}>
          <Smartphone className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
          <div className="text-sm leading-relaxed text-deep/75">
            <p className="font-semibold text-deep">Previewing in a browser</p>
            <p className="mt-1">
              A website can't see or lock other apps on your phone, so locking only works in the
              Shareek Android app. Open this page there to pick from your real apps.
            </p>
          </div>
        </section>
      ) : (
        <section className={card}>
          <SectionTitle>Set up</SectionTitle>
          <ol className="divide-y divide-border">
            <SetupRow
              step={1}
              title="Turn on the app lock"
              body="Accessibility → Installed apps → “Shareek Pray First”. It only sees which app is open, never your screen or what you type."
              done={status?.accessibilityEnabled}
              action="Open"
              onAction={nativeOpenAccessibilitySettings}
            />
            <SetupRow
              step={2}
              title="Allow notifications"
              body="For the prayer-time alert and the adhan."
              done={status?.notificationsAllowed}
              action="Allow"
              onAction={nativeRequestNotifications}
            />
            <SetupRow
              step={3}
              title="Keep alarms on time"
              body="Choose “Don't optimise” for Shareek so the adhan is never late."
              action="Battery"
              onAction={nativeOpenBatterySettings}
            />
          </ol>
        </section>
      )}

      {/* Apps to lock */}
      <section className={card}>
        <div className="flex items-start justify-between gap-3">
          <SectionTitle hint="Calls and phone settings are never locked.">Apps to lock</SectionTitle>
          <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
            {config.blockedPackages.length} selected
          </span>
        </div>

        {selectedApps.length > 0 ? (
          <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Selected apps">
            {selectedApps.map((a) => (
              <button
                key={a.pkg}
                type="button"
                onClick={() => togglePackage(a.pkg)}
                title={`Remove ${a.label}`}
                className="shrink-0 cursor-pointer rounded-2xl ring-2 ring-brand/60 transition hover:opacity-80"
              >
                <AppIcon pkg={a.pkg} label={a.label} size={40} />
              </button>
            ))}
          </div>
        ) : null}

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-deep/40"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps"
            aria-label="Search apps"
            className="w-full rounded-2xl border border-border bg-mist py-2.5 pl-9 pr-3 text-sm text-deep placeholder:text-deep/40"
          />
        </div>

        <div className="mt-3 max-h-[26rem] overflow-y-auto rounded-2xl">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-deep/55">
              {native ? "No apps match." : "No apps match your search."}
            </p>
          ) : (
            <ul className="grid grid-cols-4 gap-x-1 gap-y-3 sm:grid-cols-5">
              {filtered.map((a) => {
                const on = config.blockedPackages.includes(a.pkg);
                return (
                  <li key={a.pkg}>
                    <button
                      type="button"
                      onClick={() => togglePackage(a.pkg)}
                      aria-pressed={on}
                      aria-label={`${on ? "Unlock" : "Lock"} ${a.label}`}
                      className="group flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-2xl px-1 py-1.5 transition hover:bg-mist"
                    >
                      <span className="relative">
                        <span
                          className={`block rounded-[16px] transition ${
                            on ? "ring-2 ring-brand ring-offset-2 ring-offset-panel" : "opacity-90 group-hover:opacity-100"
                          }`}
                        >
                          <AppIcon pkg={a.pkg} label={a.label} size={52} />
                        </span>
                        {on ? (
                          <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-brand text-primary-foreground shadow">
                            <Lock className="size-3" aria-hidden="true" />
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={`line-clamp-2 w-full text-center text-[11px] leading-tight ${
                          on ? "font-semibold text-deep" : "text-deep/70"
                        }`}
                      >
                        {a.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* How apps unlock */}
      <section className={card}>
        <SectionTitle>How apps unlock</SectionTitle>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="How apps unlock">
          {(
            [
              { value: "prayed", title: "I've prayed", body: "Locked until you tap the button" },
              { value: "timer", title: "Timer", body: "Unlocks by itself" },
            ] as const
          ).map((o) => {
            const on = config.unlock === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => update((c) => ({ ...c, unlock: o.value }))}
                className={`cursor-pointer rounded-2xl border p-3 text-left transition ${
                  on ? "border-brand bg-brand/10" : "border-border bg-panel hover:bg-mist"
                }`}
              >
                <span className="block text-sm font-semibold text-deep">{o.title}</span>
                <span className="mt-0.5 block text-xs text-deep/60">{o.body}</span>
              </button>
            );
          })}
        </div>

        {config.unlock === "timer" ? (
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Lock length">
            {BLOCK_MINUTE_OPTIONS.map((m) => {
              const on = config.blockMinutes === m;
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => update((c) => ({ ...c, blockMinutes: m }))}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    on
                      ? "border-brand bg-brand text-primary-foreground"
                      : "border-border bg-panel text-deep hover:bg-mist"
                  }`}
                >
                  {m} min
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-xs leading-relaxed text-deep/60">
            Nobody checks — it's between you and Allah. If you forget to tap, apps release by
            themselves after 2 hours.
          </p>
        )}

        <label className="mt-4 flex items-start justify-between gap-3 border-t border-border pt-4 text-sm">
          <span>
            <span className="block font-semibold text-deep">Strict mode</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-deep/60">
              Removes the emergency-access button from the lock screen.
            </span>
          </span>
          <Switch
            checked={config.strict}
            onCheckedChange={(v) => update((c) => ({ ...c, strict: v }))}
            aria-label="Strict mode"
          />
        </label>
      </section>

      {/* Per-prayer controls */}
      <section className={card}>
        <SectionTitle
          hint={`Times follow your location and method — ${location.name}${location.region ? `, ${location.region}` : ""}.`}
        >
          Each prayer
        </SectionTitle>
        <div className="divide-y divide-border">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-deep/50">
            <span>Prayer</span>
            <span className="flex w-14 items-center justify-center gap-1">
              <Volume2 className="size-3" aria-hidden="true" /> Adhan
            </span>
            <span className="flex w-14 items-center justify-center gap-1">
              <Lock className="size-3" aria-hidden="true" /> Lock
            </span>
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
                    aria-label={`${PRAYER_LABELS[key]} lock apps`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Test tools */}
      {native ? (
        <section className={card}>
          <SectionTitle hint="Locks your ticked apps for one minute. Open one of them to see the lock screen.">
            Try it now
          </SectionTitle>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => nativeStartTestWindow(1)}
              className="cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-deep"
            >
              Lock apps for 1 minute
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
              No adhan recording is bundled in this build, so you'll get the notification without
              sound. See <span className="font-semibold">android/README.md</span> to add one.
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
