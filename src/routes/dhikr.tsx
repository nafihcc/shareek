import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/dhikr")({
  head: () => ({
    meta: [
      { title: "Dhikr Counter — Digital Tasbih with Targets | Shareek" },
      {
        name: "description",
        content:
          "A tap-friendly digital tasbih for SubḥānAllāh, Alḥamdulillāh, Allāhu Akbar, salawat and istighfar, with targets, vibration feedback and saved daily totals.",
      },
      { property: "og:title", content: "Dhikr Counter — Digital Tasbih" },
      {
        property: "og:description",
        content: "Count your dhikr with targets, haptic feedback and totals that persist.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DhikrPage,
});

interface Preset {
  id: string;
  arabic: string;
  translit: string;
  meaning: string;
  target: number;
}

const PRESETS: Preset[] = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ اللّٰه",
    translit: "SubḥānAllāh",
    meaning: "Glory be to God",
    target: 33,
  },
  {
    id: "alhamdulillah",
    arabic: "اَلْحَمْدُ لِلّٰه",
    translit: "Alḥamdulillāh",
    meaning: "All praise is for God",
    target: 33,
  },
  {
    id: "allahuakbar",
    arabic: "اَللّٰهُ أَكْبَر",
    translit: "Allāhu Akbar",
    meaning: "God is the greatest",
    target: 34,
  },
  {
    id: "istighfar",
    arabic: "أَسْتَغْفِرُ اللّٰه",
    translit: "Astaghfirullāh",
    meaning: "I seek God's forgiveness",
    target: 100,
  },
  {
    id: "salawat",
    arabic: "اَللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّد",
    translit: "Ṣalawāt",
    meaning: "Blessings upon the Prophet ﷺ",
    target: 100,
  },
  {
    id: "tahlil",
    arabic: "لَا إِلٰهَ إِلَّا اللّٰه",
    translit: "Lā ilāha illallāh",
    meaning: "There is no god but God",
    target: 100,
  },
];

const STORE_KEY = "faiz.dhikr";

function DhikrPage() {
  const [activeId, setActiveId] = useState<string>(PRESETS[0]!.id);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { date: string; counts: Record<string, number> };
        if (parsed.date === new Date().toDateString()) setCounts(parsed.counts);
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ date: new Date().toDateString(), counts }),
      );
    } catch {
      /* ignore */
    }
  }, [counts, loaded]);

  const active = PRESETS.find((p) => p.id === activeId)!;
  const count = counts[activeId] ?? 0;
  const progress = Math.min(count / active.target, 1);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const bump = (delta: number) => {
    setCounts((prev) => ({ ...prev, [activeId]: Math.max((prev[activeId] ?? 0) + delta, 0) }));
    if (delta > 0 && typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(12);
    }
  };

  const isCompleted = count >= active.target;

  return (
    <motion.main 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="max-w-5xl mx-auto px-6 pb-20 pt-6"
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        <p className="text-xs uppercase tracking-[0.18em] text-brand/70 font-semibold">Dhikr · الـذِّكْـر</p>
      </div>
      <h1 className="mt-2 text-4xl font-semibold text-deep leading-tight font-display">
        Tasbih Counter
      </h1>
      <p className="mt-3 text-deep/60 max-w-xl">
        Tap the sacred ring to count. Today's totals persist safely on this device and reset at midnight.
      </p>

      <div className="mt-6 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 glass-panel rounded-3xl p-8 flex flex-col items-center relative overflow-hidden shadow-lg">
          {/* Subtle background golden aura when target is reached */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-gradient-to-b from-gold/10 via-brand/5 to-transparent pointer-events-none"
            />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <p className="font-arabic text-3xl text-deep text-center leading-loose drop-shadow-sm" dir="rtl">
                {active.arabic}
              </p>
              <p className="mt-2 text-sm font-semibold text-deep">{active.translit}</p>
              <p className="text-xs text-deep/50">{active.meaning}</p>
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => bump(1)}
            aria-label={`Count ${active.translit}`}
            className="mt-8 relative w-56 h-56 rounded-full grid place-items-center shadow-xl select-none cursor-pointer"
          >
            {/* Pulsing outer aura ring */}
            <motion.div 
              animate={isCompleted ? { scale: [1, 1.08, 1], opacity: [0.3, 0.7, 0.3] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-2 rounded-full bg-gold/20 blur-md pointer-events-none"
            />
            
            <div className="absolute inset-0 rounded-full bg-mist/80 border border-hairline" />
            <div
              className="absolute inset-0 rounded-full transition-all duration-300"
              style={{
                background: `conic-gradient(var(--gold) 0deg, var(--gold) ${progress * 360}deg, transparent ${progress * 360}deg)`,
              }}
            />
            <div className="relative w-44 h-44 rounded-full bg-panel grid place-items-center shadow-inner border border-hairline">
              <div className="text-center">
                <motion.p 
                  key={count}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="text-6xl font-semibold text-deep font-display tabular-nums tracking-tight"
                >
                  {count}
                </motion.p>
                <p className="text-[11px] uppercase tracking-widest text-deep/50 mt-1 font-medium">
                  {isCompleted ? "Completed ✓" : `/ ${active.target}`}
                </p>
              </div>
            </div>
          </motion.button>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => bump(-1)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-hairline text-deep/60 hover:text-brand hover:bg-mist/50 transition active:scale-95"
            >
              Undo
            </button>
            <button
              onClick={() => setCounts((prev) => ({ ...prev, [activeId]: 0 }))}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-hairline text-deep/60 hover:text-brand hover:bg-mist/50 transition active:scale-95"
            >
              Reset this dhikr
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-3xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-brand/70 font-semibold">
              Today · {total} recitations
            </p>
            <ul className="mt-3 space-y-2">
              {PRESETS.map((p) => (
                <li key={p.id}>
                  <motion.button
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveId(p.id)}
                    className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${
                      p.id === activeId 
                        ? "bg-brand/10 border border-brand/25 shadow-sm" 
                        : "hover:bg-mist/70 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-deep">{p.translit}</span>
                      <span className="text-xs text-deep/50 tabular-nums">
                        {counts[p.id] ?? 0}/{p.target}
                      </span>
                    </div>
                    <p className="font-arabic text-lg text-deep/70 mt-0.5" dir="rtl">
                      {p.arabic}
                    </p>
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setCounts({})}
            className="w-full text-xs font-semibold text-deep/50 hover:text-brand transition py-2"
          >
            Clear every count for today
          </button>
        </div>
      </div>
    </motion.main>
  );
}
