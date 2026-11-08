import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Printer, Download, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocationSettings } from "@/context/location";
import { useNow } from "@/hooks/usePrayerTimes";
import {
  PRAYER_LABELS,
  PRAYER_ORDER,
  computePrayerTimes,
  formatTime,
} from "@/lib/prayer-times";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Monthly Prayer Timetable for Your Location | Shareek" },
      {
        name: "description",
        content:
          "A full month of Fajr, sunrise, Dhuhr, Asr, Maghrib and Isha times computed from your own coordinates and elevation on the traditional reckoning.",
      },
      { property: "og:title", content: "Monthly Prayer Timetable | Shareek" },
      {
        property: "og:description",
        content: "Print-friendly month view of accurate azan times for your exact place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { location, settings } = useLocationSettings();
  const now = useNow(60_000);
  const [offset, setOffset] = useState(0);

  const base = useMemo(() => {
    const d = now ?? new Date();
    return new Date(d.getFullYear(), d.getMonth() + offset, 1);
  }, [now ? `${now.getFullYear()}-${now.getMonth()}` : null, offset]);

  const rows = useMemo(() => {
    if (!base) return [];
    const days = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const point = {
      latitude: location.latitude,
      longitude: location.longitude,
      elevation: location.elevation,
    };
    return Array.from({ length: days }, (_, i) => {
      const day = new Date(base.getFullYear(), base.getMonth(), i + 1);
      return { day, times: computePrayerTimes(day, point, settings).times };
    });
  }, [base, location, settings]);

  const todayKey = now ? now.toDateString() : "";
  const monthName = base ? base.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "";

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (!rows.length) return;
    const header = ["Date", "Day", ...PRAYER_ORDER.map((k) => PRAYER_LABELS[k])].join(",");
    const lines = rows.map(({ day, times }) => {
      const dateNum = day.toLocaleDateString("en-GB", { day: "2-digit" });
      const dayName = day.toLocaleDateString("en-GB", { weekday: "short" });
      const prayerTimes = PRAYER_ORDER.map((k) => formatTime(times[k]));
      return [dateNum, dayName, ...prayerTimes].join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...lines].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Shareek_Prayer_Timetable_${location.name.replace(/\s+/g, "_")}_${monthName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-6 py-10"
    >
      {/* Official Print/PDF Header (only rendered during PDF export/printing) */}
      <div className="hidden print-only mb-6 text-center border-b pb-4">
        <p className="font-arabic text-2xl font-bold tracking-wide">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <h1 className="text-2xl font-bold font-display uppercase tracking-wider mt-1">
          Shareek · Monthly Prayer Timetable
        </h1>
        <p className="text-sm font-semibold mt-1">
          {location.name} {location.region ? `, ${location.region}` : ""} · {monthName}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          Lat {location.latitude.toFixed(4)}°, Lon {location.longitude.toFixed(4)}° · Elevation {Math.round(location.elevation)} m
        </p>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-4 no-print">
        <div>
          <h1 className="text-4xl font-semibold text-deep font-display tracking-tight">
            Monthly timetable
          </h1>
          <p className="mt-2 text-sm text-deep/60">
            {location.name}
            {location.region ? `, ${location.region}` : ""} · elevation{" "}
            {Math.round(location.elevation)} m
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month selector navigation */}
          <div className="flex items-center gap-2 bg-panel/60 p-1 rounded-2xl border border-hairline shadow-sm">
            <button
              onClick={() => setOffset((o) => o - 1)}
              className="p-2 rounded-xl hover:bg-mist text-deep/70 hover:text-deep transition"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-[9.5rem] text-center text-sm font-semibold text-deep font-display">
              {monthName || "…"}
            </span>
            <button
              onClick={() => setOffset((o) => o + 1)}
              className="p-2 rounded-xl hover:bg-mist text-deep/70 hover:text-deep transition"
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Export tools */}
          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-primary-foreground text-xs sm:text-sm font-semibold shadow-md shadow-brand/20 hover:bg-deep transition active:scale-95"
            title="Download or print this month's calendar as a high-quality PDF"
          >
            <Printer className="size-4" />
            <span>Save as PDF</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl glass-panel text-deep/80 text-xs sm:text-sm font-semibold hover:border-brand/40 hover:text-brand transition active:scale-95 shadow-sm"
            title="Export timetable data as CSV"
          >
            <FileSpreadsheet className="size-4 text-brand" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </header>

      <div className="mt-8 glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-panel/50 border-b border-hairline text-deep/60">
                <th className="text-left font-semibold px-5 py-3">Date</th>
                {PRAYER_ORDER.map((k) => (
                  <th key={k} className="text-right font-semibold px-5 py-3">
                    {PRAYER_LABELS[k]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {rows.map(({ day, times }) => {
                const isToday = day.toDateString() === todayKey;
                return (
                  <tr key={day.toDateString()} className={isToday ? "bg-brand/[0.07]" : ""}>
                    <td className="px-5 py-2.5 font-medium text-deep whitespace-nowrap">
                      {day.toLocaleDateString("en-GB", { day: "2-digit", weekday: "short" })}
                    </td>
                    {PRAYER_ORDER.map((k) => (
                      <td
                        key={k}
                        className="px-5 py-2.5 text-right tabular-nums text-deep/80"
                      >
                        {formatTime(times[k])}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-deep/50" colSpan={7}>
                    Preparing the timetable…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Print/PDF Footer notes */}
      <div className="hidden print-only mt-6 text-xs text-gray-600 border-t pt-3">
        <p className="font-medium">
          Calculated using traditional astronomical reckoning · Fajr (18.0° dip) · Isha (17.5° dip) · Elevation adjustment applied ({Math.round(location.elevation)}m).
        </p>
        <p className="mt-1 text-gray-500">
          Generated via Shareek (شَرِيك)
        </p>
      </div>
    </motion.main>
  );
}
