import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AUTHENTIC_ADHKAR, type Supplication } from "@/data/adhkar";
import { Search, CheckCircle2, RotateCcw, Copy, Check, Volume2, BookMarked, Sparkles } from "lucide-react";

export const Route = createFileRoute("/duas")({
  component: DuasPage,
});

function DuasPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    "All",
    "Home",
    "Masjid",
    "Salah",
    "Morning & Evening",
    "Sleep & Awakening",
    "Distress & Forgiveness",
    "Daily Life",
  ];

  const filtered = AUTHENTIC_ADHKAR.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.translation.toLowerCase().includes(q) ||
      item.transliteration.toLowerCase().includes(q) ||
      item.arabic.includes(q) ||
      item.reference.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  const incrementCounter = (dua: Supplication) => {
    setProgress((prev) => {
      const current = prev[dua.id] || 0;
      if (current >= dua.targetCount) return prev; // already complete
      const next = current + 1;
      // Trigger subtle vibration if supported
      if (navigator.vibrate) navigator.vibrate(25);
      return { ...prev, [dua.id]: next };
    });
  };

  const resetCounter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProgress((prev) => ({ ...prev, [id]: 0 }));
  };

  const copyToClipboard = (dua: Supplication, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n"${dua.translation}"\n\n[${dua.reference}]`;
    navigator.clipboard.writeText(text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakDua = (arabic: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12"
    >
      {/* Editorial Header */}
      <section className="border-b border-hairline pb-8 mb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block size-2 rounded-full bg-brand" />
              <span className="font-mono text-xs uppercase tracking-widest text-brand">
                Hisn al-Muslim · حصن المسلم
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-deep">
              Authentic Adhkar & Duas
            </h1>
          </div>

          <div className="font-mono text-xs text-deep/60 bg-panel border border-hairline px-3 py-2 rounded-xl">
            Verified Sunnah Traditions
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-sm text-deep/70 leading-relaxed">
          Daily fortress supplications from Sahih al-Bukhari, Muslim, and the authentic Sunnah. Practice intentional dhikr with live repetition trackers for stepping outside, entering the masjid, prayer conclusion, and nightly rest.
        </p>

        {/* Categories Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-mist/60 border border-hairline text-xs font-mono">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedCategory === c
                    ? "bg-brand text-primary-foreground font-semibold shadow-xs"
                    : "text-deep/60 hover:text-deep"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-deep/40" />
            <input
              type="text"
              placeholder="Search supplication or occasion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-hairline bg-panel pl-9 pr-3 py-2 text-xs text-deep placeholder:text-deep/40 focus:border-brand focus:outline-hidden"
            />
          </div>
        </div>
      </section>

      {/* List of Authentic Adhkar */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((dua, idx) => {
            const count = progress[dua.id] || 0;
            const isCompleted = count >= dua.targetCount;
            const progressPct = Math.min((count / dua.targetCount) * 100, 100);

            return (
              <motion.article
                key={dua.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
                className={`glass-panel group relative rounded-3xl transition-all p-6 sm:p-8 ${
                  isCompleted
                    ? "border-brand/50 shadow-md bg-panel"
                    : "hover:border-brand/30"
                }`}
              >
                {/* Top Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline/60 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-mist/60 text-deep/70">
                      {dua.category}
                    </span>
                    <h2 className="font-display text-lg font-semibold text-deep">
                      {dua.title}
                    </h2>
                  </div>

                  {/* Actions: Copy & Pronounce */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => speakDua(dua.arabic, e)}
                      className="p-2 rounded-xl text-deep/40 hover:text-deep hover:bg-mist/70 transition"
                      title="Audio Pronunciation"
                    >
                      <Volume2 className="size-4" />
                    </button>
                    <button
                      onClick={(e) => copyToClipboard(dua, e)}
                      className="p-2 rounded-xl text-deep/40 hover:text-brand hover:bg-mist/70 transition"
                      title="Copy Supplication"
                    >
                      {copiedId === dua.id ? (
                        <Check className="size-4 text-brand" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Vocalized Arabic Script */}
                <div className="py-4 text-right">
                  <p
                    className="font-arabic text-2xl sm:text-3xl lg:text-4xl leading-loose text-deep"
                    dir="rtl"
                  >
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                <p className="mt-3 font-sans text-xs sm:text-sm text-deep/60 italic leading-relaxed">
                  {dua.transliteration}
                </p>

                {/* Translation */}
                <p className="mt-2 text-sm sm:text-base font-medium text-deep leading-relaxed">
                  "{dua.translation}"
                </p>

                {/* Virtue or Context */}
                {dua.fadilah && (
                  <div className="mt-4 p-3 rounded-xl bg-brand/5 border border-brand/15 flex items-start gap-2.5 text-xs text-deep/80">
                    <Sparkles className="size-4 shrink-0 text-brand mt-0.5" />
                    <span><strong>Virtue:</strong> {dua.fadilah}</span>
                  </div>
                )}

                {/* Footer with Hadith Reference & Repetition Counter */}
                <div className="mt-6 pt-4 border-t border-hairline/60 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-deep/50">
                    <BookMarked className="size-3.5 text-brand" />
                    <span>{dua.reference}</span>
                  </div>

                  {/* Interactive Repetition Counter */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 sm:w-32 h-2 rounded-full bg-mist overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand to-gold transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-deep min-w-[36px]">
                        {count}/{dua.targetCount}
                      </span>
                    </div>

                    <button
                      onClick={() => incrementCounter(dua)}
                      disabled={isCompleted}
                      className={`px-4 py-2 rounded-xl font-mono text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 ${
                        isCompleted
                          ? "bg-brand/10 text-brand border border-brand/25 cursor-default"
                          : "bg-brand text-primary-foreground hover:bg-deep active:scale-95"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="size-3.5 text-brand" /> Completed
                        </>
                      ) : (
                        <span>Tap to Count (+1)</span>
                      )}
                    </button>

                    {count > 0 && (
                      <button
                        onClick={(e) => resetCounter(dua.id, e)}
                        className="p-2 rounded-xl text-deep/30 hover:text-deep hover:bg-mist/60 transition"
                        title="Reset counter"
                      >
                        <RotateCcw className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
