import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Daily Worship Tracker — Swalat, Istighfar, Quran | Shareek" },
      {
        name: "description",
        content:
          "Log your daily swalat, istighfar, Quran pages and wake-up time, then see how you are improving week by week.",
      },
      { property: "og:title", content: "Daily Worship Tracker | Shareek" },
      {
        property: "og:description",
        content: "Mark swalat, istighfar, Quran and wake-up time for each day and watch your progress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackerPage,
});

interface DayLog {
  swalat: number;
  istighfar: number;
  quran: number; // pages
  wake: string; // "HH:MM"
}

const KEY = "faiz.tracker";
const EMPTY: DayLog = { swalat: 0, istighfar: 0, quran: 0, wake: "" };

const keyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const wakeMin = (w: string) => {
  if (!w) return null;
  const [h, m] = w.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
const fmtMin = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.round(m % 60)).padStart(2, "0")}`;

function TrackerPage() {
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [today, setToday] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date | null>(null);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLogs(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    const t = new Date();
    setToday(t);
    setMonth(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelected(keyOf(t));
  }, []);

  const save = (k: string, patch: Partial<DayLog>) => {
    setLogs((prev) => {
      const next = { ...prev, [k]: { ...EMPTY, ...prev[k], ...patch } };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const entry = { ...EMPTY, ...logs[selected] };

  const cells = useMemo(() => {
    if (!month) return [];
    const first = month.getDay();
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [
      ...Array.from({ length: first }, () => null),
      ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
    ];
  }, [month]);

  const stats = useMemo(() => {
    if (!today) return null;
    const avg = (from: number, to: number) => {
      let s = 0, i = 0, q = 0, wSum = 0, wN = 0, n = 0;
      for (let d = from; d < to; d++) {
        const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - d);
        const l = logs[keyOf(day)];
        if (!l) continue;
        n++;
        s += l.swalat; i += l.istighfar; q += l.quran;
        const w = wakeMin(l.wake);
        if (w != null) { wSum += w; wN++; }
      }
      return n === 0
        ? null
        : { swalat: s / n, istighfar: i / n, quran: q / n, wake: wN ? wSum / wN : null, days: n };
    };
    return { recent: avg(0, 7), previous: avg(7, 14) };
  }, [logs, today]);

  const counter = (label: string, field: "swalat" | "istighfar" | "quran", steps: number[]) => (
    <div className="rounded-2xl bg-panel/60 border border-hairline p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-brand/70 font-semibold">{label}</p>
      <input
        type="number"
        min={0}
        value={entry[field]}
        onChange={(e) => save(selected, { [field]: Math.max(0, Number(e.target.value) || 0) })}
        className="mt-2 w-full bg-transparent text-3xl font-semibold font-display text-deep tabular-nums outline-none"
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {steps.map((s) => (
          <button
            key={s}
            onClick={() => save(selected, { [field]: Math.max(0, entry[field] + s) })}
            className="px-2.5 py-1 rounded-lg bg-mist text-xs font-semibold text-deep/70 hover:bg-brand hover:text-primary-foreground transition"
          >
            {s > 0 ? `+${s}` : s}
          </button>
        ))}
      </div>
    </div>
  );

  const trend = (
    label: string,
    r: number | null | undefined,
    p: number | null | undefined,
    fmt: (v: number) => string,
    lowerIsBetter = false,
  ) => {
    let tone = "text-deep/50", note = "Not enough data yet";
    if (r != null && p != null) {
      const diff = r - p;
      const better = lowerIsBetter ? diff < 0 : diff > 0;
      if (Math.abs(diff) < 0.01) { note = "Steady"; }
      else {
        tone = better ? "text-brand" : "text-destructive";
        note = `${better ? "▲ Improved" : "▼ Dropped"} · ${lowerIsBetter ? fmt(Math.abs(diff)).replace(/^00:/, "") + (Math.abs(diff) < 60 ? " min" : "") + (diff < 0 ? " earlier" : " later") : (diff > 0 ? "+" : "−") + fmt(Math.abs(diff))}`;
      }
    } else if (r != null) note = "Keep logging to compare with last week";
    return (
      <div className="glass-panel rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.15em] text-deep/50 font-semibold">{label}</p>
        <p className="mt-2 text-2xl font-semibold font-display text-deep tabular-nums">
          {r != null ? fmt(r) : "—"}
        </p>
        <p className="text-[11px] text-deep/50">7-day average{p != null ? ` · previous week ${fmt(p)}` : ""}</p>
        <p className={`mt-2 text-sm font-semibold ${tone}`}>{note}</p>
      </div>
    );
  };

  const r = stats?.recent, p = stats?.previous;
  const num = (v: number) => (Math.round(v * 10) / 10).toString();
  const selDate = selected ? new Date(selected + "T00:00:00") : null;

  return (
    <motion.main 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-6 py-10"
    >
      <h1 className="text-4xl font-semibold text-deep font-display tracking-tight">Daily tracker</h1>
      <p className="mt-2 text-sm text-deep/60">
         Tap a day to log swalat, istighfar, Quran pages and wake-up time. Entries stay in this browser on this device, including on GitHub Pages; clearing its site data removes them.
      </p>

      <section className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {trend("Swalat / day", r?.swalat, p?.swalat, num)}
        {trend("Istighfar / day", r?.istighfar, p?.istighfar, num)}
        {trend("Quran pages / day", r?.quran, p?.quran, num)}
        {trend("Wake-up time", r?.wake, p?.wake, fmtMin, true)}
      </section>

      <section className="mt-8 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => month && setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="px-4 py-2 rounded-xl bg-mist text-sm font-semibold text-deep/70"
              aria-label="Previous month"
            >
              ←
            </button>
            <span className="font-semibold text-deep">
              {month?.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) ?? "…"}
            </span>
            <button
              onClick={() => month && setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="px-4 py-2 rounded-xl bg-mist text-sm font-semibold text-deep/70"
              aria-label="Next month"
            >
              →
            </button>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-deep/45">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const k = keyOf(d);
              const l = logs[k];
              const done = l ? Math.min(l.swalat, 5) / 5 : 0;
              const isSel = k === selected;
              const isToday = today && k === keyOf(today);
              return (
                <button
                  key={k}
                  onClick={() => setSelected(k)}
                  className={`aspect-square rounded-xl text-sm font-semibold flex flex-col items-center justify-center gap-1 border transition ${
                    isSel ? "bg-brand text-primary-foreground border-brand" : "bg-panel/50 border-hairline text-deep hover:bg-mist"
                  } ${isToday && !isSel ? "ring-2 ring-gold" : ""}`}
                >
                  {d.getDate()}
                  {l && (
                    <span className="h-1 w-6 rounded-full bg-mist overflow-hidden">
                      <span className="block h-full bg-gold" style={{ width: `${done * 100}%` }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 glass-panel rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-brand/70 font-semibold">Selected day</p>
          <p className="mt-1 text-2xl font-semibold font-display text-deep">
            {selDate?.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) ?? "…"}
          </p>
          <div className="mt-5 grid gap-3">
            {counter("Swalat (prayers)", "swalat", [-1, 1])}
            {counter("Istighfar", "istighfar", [10, 33, 100, -10])}
            {counter("Quran (pages)", "quran", [1, 5, 20, -1])}
            <div className="rounded-2xl bg-panel/60 border border-hairline p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-brand/70 font-semibold">Wake-up time</p>
              <input
                type="time"
                value={entry.wake}
                onChange={(e) => save(selected, { wake: e.target.value })}
                className="mt-2 w-full bg-transparent text-3xl font-semibold font-display text-deep outline-none"
              />
              <p className="text-[11px] text-deep/50 mt-1">Earlier is better.</p>
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
