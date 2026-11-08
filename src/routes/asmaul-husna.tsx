import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ASMAUL_HUSNA, type DivineName } from "@/data/asmaulHusna";
import { Search, Sparkles, BookOpen, Volume2, X, Plus, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/asmaul-husna")({
  component: AsmaulHusnaPage,
});

function AsmaulHusnaPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedName, setSelectedName] = useState<DivineName | null>(null);
  const [counts, setCounts] = useState<Record<number, number>>({});

  // Daily Name of the day based on day of year
  const nameOfTheDay = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return ASMAUL_HUSNA[dayOfYear % ASMAUL_HUSNA.length] || ASMAUL_HUSNA[0]!;
  }, []);

  const categories = ["All", "Mercy", "Majesty", "Creation", "Power", "Wisdom", "Peace"];

  const filteredNames = useMemo(() => {
    return ASMAUL_HUSNA.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.number.toString() === q ||
        item.transliteration.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.arabic.includes(q) ||
        item.explanation.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const incrementCount = (num: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCounts((prev) => ({
      ...prev,
      [num]: (prev[num] || 0) + 1,
    }));
  };

  const resetCount = (num: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCounts((prev) => ({
      ...prev,
      [num]: 0,
    }));
  };

  // Speak pronunciation using Web Speech API (Arabic voice)
  const speakArabic = (arabic: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(arabic);
      utterance.lang = "ar-SA";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.215, 0.61, 0.355, 1] }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12"
    >
      {/* Editorial Specimen Hero */}
      <section className="border-b border-hairline pb-8 mb-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block size-2 rounded-full bg-brand" />
              <span className="font-mono text-xs uppercase tracking-widest text-brand">
                Divine Attributes · الأسماء الحسنى
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight text-deep">
              Asmaul Husna
            </h1>
          </div>

          <div className="font-mono text-xs text-deep/60 bg-panel border border-hairline px-3 py-2 rounded-xl">
            99 Supreme Names of Allah
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm sm:text-base text-deep/70 leading-relaxed">
          The 99 Beautiful Names of Allah revealed in the Noble Quran and authentic Sunnah. Reflect on their profound theological attributes, meanings, and integrate them into daily contemplation.
        </p>

        {/* Name of the Day Feature Banner */}
        <div className="mt-8 glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 size-48 rounded-full bg-brand/10 blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-brand">
              <Sparkles className="size-3.5 text-brand" />
              <span>Name of the Day · Contemplation</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-deep/40">#{nameOfTheDay.number}</span>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-deep">
                {nameOfTheDay.transliteration}
              </h2>
              <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-brand/10 text-brand border border-brand/20">
                {nameOfTheDay.meaning}
              </span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-deep/70 max-w-xl leading-relaxed">
              {nameOfTheDay.explanation}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <span className="font-arabic text-4xl sm:text-5xl text-deep font-normal" dir="rtl">
              {nameOfTheDay.arabic}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => speakArabic(nameOfTheDay.arabic, e)}
                className="p-2 rounded-xl bg-panel border border-hairline text-deep/70 hover:text-brand hover:border-brand/40 transition"
                title="Listen to pronunciation"
              >
                <Volume2 className="size-4" />
              </button>
              <button
                onClick={() => setSelectedName(nameOfTheDay)}
                className="px-4 py-2 rounded-xl bg-brand text-primary-foreground text-xs font-mono font-semibold hover:bg-deep transition shadow-xs"
              >
                Reflect & Praise
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-mist/60 border border-hairline text-xs font-mono">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedCategory === cat
                    ? "bg-brand text-primary-foreground font-semibold shadow-xs"
                    : "text-deep/60 hover:text-deep"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-deep/40" />
            <input
              type="text"
              placeholder="Search by number, English, Arabic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-hairline bg-panel pl-9 pr-3 py-2 text-xs text-deep placeholder:text-deep/40 focus:border-brand focus:outline-hidden"
            />
          </div>
        </div>
      </section>

      {/* Grid of 99 Names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredNames.map((name) => {
          const count = counts[name.number] || 0;
          return (
            <motion.div
              key={name.number}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedName(name)}
              className="glass-panel cursor-pointer group relative flex flex-col justify-between rounded-2xl p-5 shadow-xs transition-all hover:border-brand/40 hover:bg-panel hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-deep/40">#{name.number.toString().padStart(2, "0")}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20 font-medium">
                    {name.category}
                  </span>
                </div>

                {/* Arabic Calligraphy Headline */}
                <div className="text-right py-2">
                  <span className="font-arabic text-3xl font-normal text-deep group-hover:text-brand transition-colors" dir="rtl">
                    {name.arabic}
                  </span>
                </div>

                <div className="mt-2">
                  <h3 className="font-display text-base font-semibold text-deep">
                    {name.transliteration}
                  </h3>
                  <p className="text-xs text-deep/60 font-medium">{name.meaning}</p>
                </div>

                <p className="mt-2 text-[11px] text-deep/50 line-clamp-2 leading-relaxed">
                  {name.explanation}
                </p>
              </div>

              {/* Counter / Audio bar at bottom of card */}
              <div className="mt-4 pt-3 border-t border-hairline/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => speakArabic(name.arabic, e)}
                  className="p-1.5 rounded-lg text-deep/40 hover:text-brand hover:bg-mist/70 transition"
                  title="Listen"
                >
                  <Volume2 className="size-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => incrementCount(name.number, e)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand/10 text-brand font-mono text-xs font-semibold hover:bg-brand hover:text-primary-foreground transition border border-brand/20"
                  >
                    <Plus className="size-3" />
                    <span>{count > 0 ? count : "Praise"}</span>
                  </button>
                  {count > 0 && (
                    <button
                      type="button"
                      onClick={(e) => resetCount(name.number, e)}
                      className="p-1 rounded-lg text-deep/30 hover:text-deep transition"
                      title="Reset count"
                    >
                      <RotateCcw className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Reflection Detail Modal */}
      <AnimatePresence>
        {selectedName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl border border-hairline bg-panel p-6 sm:p-8 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setSelectedName(null)}
                className="absolute right-5 top-5 p-2 rounded-xl text-deep/40 hover:text-deep hover:bg-mist/60 transition"
              >
                <X className="size-5" />
              </button>

              <div className="text-center pb-6 border-b border-hairline">
                <span className="font-mono text-xs text-deep/40">Name #{selectedName.number} of 99</span>
                <div className="my-3 font-arabic text-5xl text-deep" dir="rtl">
                  {selectedName.arabic}
                </div>
                <h2 className="font-display text-2xl font-bold text-deep">
                  {selectedName.transliteration}
                </h2>
                <p className="text-sm font-semibold text-brand mt-1">{selectedName.meaning}</p>
              </div>

              <div className="py-5 space-y-4 text-xs sm:text-sm text-deep/70 leading-relaxed">
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-deep/50 mb-1">
                    Theological Understanding
                  </h4>
                  <p>{selectedName.explanation}</p>
                </div>

                {selectedName.quranReference && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-mist/60 font-mono text-xs text-deep/70 border border-hairline">
                    <BookOpen className="size-4 text-brand" />
                    <span>Quranic Reference: {selectedName.quranReference}</span>
                  </div>
                )}

                {selectedName.virtue && (
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-deep/50 mb-1">
                      Spiritual Benefit & Reflection
                    </h4>
                    <p>{selectedName.virtue}</p>
                  </div>
                )}
              </div>

              {/* Integrated Counter */}
              <div className="pt-4 border-t border-hairline flex items-center justify-between">
                <button
                  onClick={(e) => speakArabic(selectedName.arabic, e)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-mist/60 text-xs font-mono font-medium text-deep/70 hover:text-deep transition"
                >
                  <Volume2 className="size-4 text-brand" /> Pronounce
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-deep/50">
                    Counter: {counts[selectedName.number] || 0}
                  </span>
                  <button
                    onClick={() => incrementCount(selectedName.number)}
                    className="px-4 py-2 rounded-xl bg-brand text-primary-foreground text-xs font-mono font-semibold hover:bg-deep transition shadow-xs"
                  >
                    +1 Tap to Count
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
