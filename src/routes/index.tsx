import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useLocationSettings } from "@/context/location";
import { usePrayerTimes, useHijriDate } from "@/hooks/usePrayerTimes";
import { LocationDialog } from "@/components/LocationDialog";
import {
  PRAYER_LABELS,
  PRAYER_ORDER,
  formatCountdown,
  formatTime,
  prayerBasis,
  type PrayerKey,
} from "@/lib/prayer-times";
import { qiblaBearing } from "@/lib/qibla";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shareek — Prayer Times, Quran, Qibla & Daily Worship" },
      {
        name: "description",
        content:
          "Prayer times computed live from your coordinates and elevation: Fajr at true dawn (20°), Isha at 18°, Maghrib four minutes after sunset, plus Quran, Qibla and dhikr.",
      },
      { property: "og:title", content: "Shareek — Prayer Times, Quran, Qibla & Daily Worship" },
      {
        property: "og:description",
        content:
          "Location-aware prayer times with a Quran reader, Qibla compass and dhikr counter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const ICONS: Record<PrayerKey, string> = {
  fajr: "🌘",
  sunrise: "🌅",
  dhuhr: "☀️",
  asr: "🌤️",
  maghrib: "🌇",
  isha: "🌙",
};

import { motion } from "framer-motion";

const smoothEase = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      ease: smoothEase,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: smoothEase } },
};

function Home() {
  const { location, settings, isDefault } = useLocationSettings();
  const { result, next, now } = usePrayerTimes();
  const hijri = useHijriDate(now);
  const [dialog, setDialog] = useState(false);
  const bearing = qiblaBearing(location.latitude, location.longitude);

  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="max-w-7xl mx-auto px-6"
    >
      <motion.section 
        variants={container}
        initial="hidden"
        animate="show"
        className="pt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-9 gap-3"
      >
        {(
          [
            { to: "/pray-first", icon: "🛡️", title: "Pray First", sub: "Adhan & app pause", tint: "bg-emerald-50 text-emerald-700" },
            { to: "/quran", icon: "📖", title: "Quran", sub: "Mushaf & audio", tint: "bg-sky-50 text-sky-700" },
            { to: "/masjid", icon: "🕌", title: "Masajid", sub: "Spatial radar", tint: "bg-cyan-50 text-cyan-800" },
            { to: "/asmaul-husna", icon: "✨", title: "99 Names", sub: "Asmaul Husna", tint: "bg-amber-50 text-amber-800" },
            { to: "/duas", icon: "🤲", title: "Adhkar & Duas", sub: "Hisn al-Muslim", tint: "bg-rose-50 text-rose-700" },
            { to: "/qibla", icon: "🧭", title: "Qibla", sub: "Compass bearing", tint: "bg-orange-50 text-orange-700" },
            { to: "/dhikr", icon: "📿", title: "Dhikr", sub: "Tally counter", tint: "bg-purple-50 text-purple-700" },
            { to: "/tracker", icon: "📊", title: "Tracker", sub: "Daily checklist", tint: "bg-indigo-50 text-indigo-700" },
            { to: "/calendar", icon: "🗓️", title: "Timetable", sub: "Monthly times", tint: "bg-blue-50 text-blue-700" },
          ] as const
        ).map((t) => (
          <motion.div 
            variants={item} 
            key={t.to} 
            whileHover={{ scale: 1.03, y: -4 }} 
            whileTap={{ scale: 0.97 }}
            className="h-full"
          >
            <Link
              to={t.to}
              className="glass-panel group relative block h-full rounded-3xl p-4 sm:p-5 flex flex-col justify-center gap-3 shadow-2xs hover:shadow-lg hover:border-brand/30 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span data-ui="tile-icon" className={`text-2xl w-11 h-11 rounded-full ${t.tint} grid place-items-center group-hover:scale-110 shadow-2xs transition-all`}>
                {t.icon}
              </span>
              <span className="relative z-10">
                <span className="block font-semibold text-deep font-display group-hover:text-brand transition-colors text-sm sm:text-base">
                  {t.title}
                </span>
                <span className="block text-[11px] text-deep/55">{t.sub}</span>
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: smoothEase }}
        className="pt-10 pb-16 grid lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-5 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.35, ease: smoothEase }}
            className="inline-flex items-center gap-2 bg-panel/70 backdrop-blur-md border border-hairline rounded-full px-4 py-1.5 self-start shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
            <span className="text-xs font-semibold text-deep/80 tracking-wide">
              Sacred Timekeeper · رَفِيقُكَ الإِسْلَامِيّ
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.45, ease: smoothEase }}
            className="mt-6 text-5xl lg:text-6xl font-semibold text-deep leading-[1.05] tracking-tight font-display"
          >
            Your prayer,
            <br />
            <span className="text-brand relative inline-block">
              precisely
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.6, duration: 0.6, ease: smoothEase }}
                className="absolute bottom-1 left-0 h-2 bg-gold/25 -z-10 rounded-sm"
              />
            </span> timed.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.45, ease: smoothEase }}
            className="mt-5 text-deep/60 text-base leading-relaxed max-w-sm"
          >
            Shareek reads your coordinates and elevation, then computes each prayer time — then helps you read Quran, find the Qibla, keep dhikr
             and track your daily worship.
          </motion.p>

          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="mt-8 glass-panel rounded-3xl p-6 relative overflow-hidden shadow-sm"
          >
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand/70 font-semibold">
                  Next Prayer
                </p>
                <p className="text-3xl font-semibold text-deep mt-1 font-display">
                  {next ? PRAYER_LABELS[next.key] : "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold text-deep font-display tabular-nums">
                  {next ? formatTime(next.at) : "--:--"}
                </p>
                <p className="text-xs text-gold font-medium mt-0.5 tabular-nums">
                  {next ? `in ${formatCountdown(next.msRemaining)}` : "calculating…"}
                </p>
              </div>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-mist overflow-hidden relative z-10">
              <motion.div
                layout
                className="h-full bg-gradient-to-r from-brand to-gold rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.round((next?.progress ?? 0) * 100)}%` }}
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-deep/50 relative z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              Fajr {settings.fajrAngle}° · Isha {settings.ishaAngle}° · true-sunset Maghrib
            </div>
          </motion.div>

          {isDefault && (
            <button
              onClick={() => setDialog(true)}
              className="mt-4 text-xs font-semibold text-brand hover:text-deep transition self-start"
            >
              Showing Kozhikode by default — set your own location →
            </button>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="px-7 py-5 border-b border-hairline flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand/70 font-semibold">
                  {hijri || "Today"}
                </p>
                <p className="text-lg font-semibold text-deep font-display">
                  {location.name}
                  {location.region ? `, ${location.region}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-mist/60 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-brand" />
                <span className="text-xs font-medium text-deep/70">
                  Elevation {Math.round(location.elevation)} m
                </span>
              </div>
            </div>

            <div className="divide-y divide-hairline">
              {PRAYER_ORDER.map((key) => {
                const isNext = next?.key === key;
                return (
                  <div
                    key={key}
                    className={`px-7 py-4 flex items-center gap-4 ${
                      key === "maghrib" ? "bg-brand/[0.06]" : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full grid place-items-center text-base ${
                        key === "maghrib" ? "bg-brand/15" : "bg-mist"
                      }`}
                    >
                      {ICONS[key]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-deep flex items-center gap-2">
                        {PRAYER_LABELS[key]}
                        {isNext && (
                          <span className="text-[10px] font-semibold bg-brand/15 text-brand px-2 py-0.5 rounded-full">
                            Next
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-deep/50">{prayerBasis(key, settings)}</p>
                    </div>
                    <p
                      className={`text-lg font-semibold font-display tabular-nums ${
                        key === "maghrib" ? "text-brand" : "text-deep"
                      }`}
                    >
                      {result ? formatTime(result.times[key]) : "--:--"}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="px-7 py-4 bg-panel/40 border-t border-hairline flex items-center justify-between gap-3">
              <p className="text-xs text-deep/50">
                Maghrib enters {result ? result.maghribLagMinutes : 4} minutes after sunset ·{" "}
                {result ? result.horizonDipDegrees.toFixed(2) : "0.00"}° horizon dip
              </p>
              <Link
                to="/methodology"
                className="text-xs font-semibold text-brand hover:text-deep transition whitespace-nowrap"
              >
                View methodology →
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pb-20"
      >
        <div className="grid md:grid-cols-3 gap-5">
          <motion.div whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to="/qibla" className="glass-panel block h-full rounded-3xl p-6 hover:shadow-2xl hover:border-gold/30 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🧭</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand/70 bg-brand/10 px-2.5 py-1 rounded-full">
                  AR · Compass
                </span>
              </div>
              <p className="mt-4 text-xl font-semibold text-deep font-display">Qibla Finder</p>
              <p className="mt-2 text-sm text-deep/60 leading-relaxed">
                Rotate your device to face the Kaʿbah with augmented-reality overlay, magnetic or
                manual compass.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex-1 h-24 rounded-2xl bg-mist/70 border border-hairline grid place-items-center shadow-inner">
                  <span className="text-sm font-semibold text-deep/70 tabular-nums">
                    {bearing.toFixed(1)}°
                  </span>
                </div>
                <div className="flex-1 h-24 rounded-2xl bg-brand/10 border border-brand/20 grid place-items-center">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-brand font-semibold">
                    AR View
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to="/quran" className="glass-panel block h-full rounded-3xl p-6 hover:shadow-2xl hover:border-brand/30 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📖</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand/70 bg-brand/10 px-2.5 py-1 rounded-full">
                  Arabic · Recitation
                </span>
              </div>
              <p className="mt-4 text-xl font-semibold text-deep font-display">Quran Reader</p>
              <p className="mt-2 text-sm text-deep/60 leading-relaxed">
                All 114 surahs in Arabic, arranged by Mushaf page or ayah with full recitation.
              </p>
              <div className="mt-5 rounded-2xl bg-panel/70 border border-hairline p-4 shadow-sm">
                <p className="text-xs text-deep/50">سورة الفاتحة · ١:٥</p>
                <p dir="rtl" lang="ar" className="mt-1 font-arabic text-lg text-deep">
                  إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
                </p>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to="/dhikr" className="glass-panel block h-full rounded-3xl p-6 hover:shadow-2xl hover:border-brand/30 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📿</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand/70 bg-brand/10 px-2.5 py-1 rounded-full">
                  Tally · Streaks
                </span>
              </div>
              <p className="mt-4 text-xl font-semibold text-deep font-display">Dhikr Counter</p>
              <p className="mt-2 text-sm text-deep/60 leading-relaxed">
                Tap-friendly beading with progress rings, saved phrases and daily totals.
              </p>
              <div className="mt-5 flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full grid place-items-center shadow-md">
                  <div className="absolute inset-0 rounded-full bg-mist" />
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(var(--gold) 0deg, var(--gold) 252deg, transparent 252deg)",
                    }}
                  />
                  <div className="relative w-[62px] h-[62px] rounded-full bg-panel grid place-items-center">
                    <div className="text-center">
                      <p className="text-xl font-semibold text-deep font-display">33</p>
                      <p className="text-[8px] uppercase tracking-widest text-deep/50">/ 33</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-deep">SubḥānAllāh</p>
                  <p className="text-xs text-deep/50 mt-1">after every prayer</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <LocationDialog open={dialog} onClose={() => setDialog(false)} />
    </motion.main>
  );
}
