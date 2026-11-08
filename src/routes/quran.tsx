import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, List, Pause, Play, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const Route = createFileRoute("/quran")({
  head: () => ({
    meta: [
      { title: "Read the Quran — Arabic Pages and Recitation | Shareek" },
      {
        name: "description",
        content: "Read the Holy Quran in Arabic by Mushaf page or verse, with Mishary Alafasy recitation.",
      },
      { property: "og:title", content: "Arabic Quran Reader and Recitation | Shareek" },
      {
        property: "og:description",
        content: "An Arabic-only Quran reader with 604 Mushaf pages and verse recitation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuranPage,
});

interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  audio?: string;
  surah: SurahMeta;
}

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const RECITERS = [
  { id: "ar.alafasy", name: "Mishary Alafasy", image: `${BASE}/reciters/ar.alafasy.jpg`, origin: "Kuwait" },
  { id: "ar.abdurrahmaansudais", name: "Abdur-Rahman As-Sudais", image: `${BASE}/reciters/ar.abdurrahmaansudais.jpg`, origin: "Imam of Masjid al-Haram" },
  { id: "ar.saoodshuraym", name: "Saud Ash-Shuraim", image: `${BASE}/reciters/ar.saoodshuraym.jpg`, origin: "Masjid al-Haram" },
  { id: "ar.mahermuaiqly", name: "Maher Al-Muaiqly", image: `${BASE}/reciters/ar.mahermuaiqly.jpg`, origin: "Imam of Masjid al-Haram" },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary", image: `${BASE}/reciters/ar.husary.jpg`, origin: "Egypt · Shaykh al-Maqari" },
  { id: "ar.minshawi", name: "Mohamed Siddiq Al-Minshawi", image: `${BASE}/reciters/ar.minshawi.jpg`, origin: "Egypt · Legendary Murattal" },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit Abdus-Samad", image: `${BASE}/reciters/ar.abdulbasitmurattal.jpg`, origin: "Egypt · Golden Throat" },
  { id: "ar.ahmedajamy", name: "Ahmed Al-Ajamy", image: `${BASE}/reciters/ar.ahmedajamy.jpg`, origin: "Saudi Arabia" },
] as const;
const RECITER_KEY = "faiz.reciter";
const initials = (name: string) =>
  name.split(/[\s-]+/).filter((w) => !/^(al|as|ash|abdus|abdur)$/i.test(w)).slice(0, 2).map((w) => w[0]).join("");

const toArabicDigits = (value: number) =>
  String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)] ?? digit);

function QuranPage() {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [mode, setMode] = useState<"page" | "ayah">("page");
  const [mushafPage, setMushafPage] = useState(1);
  const [surahNumber, setSurahNumber] = useState(1);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [playingAll, setPlayingAll] = useState(false);
  const [reciter, setReciter] = useState<string>("ar.alafasy");
  // Two players alternate: while one plays, the next verse is already buffered in the other.
  const playersRef = useRef<HTMLAudioElement[]>([]);
  const slotRef = useRef(0);
  const stateRef = useRef({ index: null as number | null, all: false, ayahs: [] as Ayah[] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECITER_KEY);
      if (saved && RECITERS.some((r) => r.id === saved)) setReciter(saved);
    } catch { /* ignore */ }
    playersRef.current = [new Audio(), new Audio()];
    playersRef.current.forEach((audio, slot) => {
      audio.preload = "auto";
      audio.addEventListener("ended", () => {
        if (slot !== slotRef.current) return;
        const { index, all, ayahs: list } = stateRef.current;
        if (all && index !== null && index < list.length - 1) playAtRef.current(index + 1, true);
        else { setPlayingIndex(null); setPlayingAll(false); }
      });
    });
    return () => playersRef.current.forEach((a) => { a.pause(); a.src = ""; });
  }, []);

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then((response) => {
        if (!response.ok) throw new Error("Surah list request failed");
        return response.json();
      })
      .then((payload) => setSurahs(payload.data as SurahMeta[]))
      .catch(() => setError("The Quran could not be loaded. Please try again."));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPlayingIndex(null);
    setPlayingAll(false);
    playersRef.current.forEach((a) => a.pause());
    const endpoint =
      mode === "page"
        ? `https://api.alquran.cloud/v1/page/${mushafPage}/${reciter}`
        : `https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`;

    fetch(endpoint)
      .then((response) => {
        if (!response.ok) throw new Error("Quran request failed");
        return response.json();
      })
      .then((payload) => {
        if (cancelled) return;
        const loaded = payload.data.ayahs as Ayah[];
        if (mode === "ayah") {
          const surah = payload.data as SurahMeta;
          setAyahs(loaded.map((ayah) => ({ ...ayah, surah })));
        } else {
          setAyahs(loaded);
        }
      })
      .catch(() => !cancelled && setError("This reading could not be loaded. Please try again."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [mode, mushafPage, surahNumber, reciter]);

  const filteredSurahs = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return surahs;
    return surahs.filter((surah) =>
      `${surah.number} ${surah.englishName} ${surah.name}`.toLowerCase().includes(term),
    );
  }, [query, surahs]);

  const currentSurah = surahs.find((surah) => surah.number === surahNumber);
  const pageSurahs = Array.from(
    new Map(
      ayahs
        .filter((ayah) => ayah.surah)
        .map((ayah) => [ayah.surah.number, ayah.surah]),
    ).values(),
  );

  stateRef.current.ayahs = ayahs;

  const playAt = (index: number, continueAll = false) => {
    const players = playersRef.current;
    const source = ayahs[index]?.audio;
    if (players.length < 2 || !source) return;
    const current = players[slotRef.current]!;
    const other = players[1 - slotRef.current]!;
    current.pause();
    // Use the other player if it already holds this verse (pre-buffered).
    let audio = other;
    if (other.src !== source) { audio = current; audio.src = source; }
    else slotRef.current = 1 - slotRef.current;
    audio.currentTime = 0;
    stateRef.current.index = index;
    stateRef.current.all = continueAll;
    setPlayingIndex(index);
    setPlayingAll(continueAll);
    void audio.play().catch(() => {});
    const idle = players[1 - slotRef.current]!;
    const nextSource = ayahs[index + 1]?.audio;
    if (continueAll && nextSource && idle.src !== nextSource) { idle.src = nextSource; idle.load(); }
  };
  const playAtRef = useRef(playAt);
  playAtRef.current = playAt;

  const pauseAll = () => playersRef.current.forEach((a) => a.pause());

  const chooseReciter = (id: string) => {
    pauseAll();
    setReciter(id);
    try { localStorage.setItem(RECITER_KEY, id); } catch { /* ignore */ }
  };

  const toggleAll = () => {
    const audio = playersRef.current[slotRef.current];
    if (playingAll && audio && !audio.paused) {
      audio.pause();
      stateRef.current.all = false;
      setPlayingAll(false);
      return;
    }
    playAt(playingIndex ?? 0, true);
  };

  const toggleAyah = (index: number) => {
    const audio = playersRef.current[slotRef.current];
    if (playingIndex === index && audio && !audio.paused) {
      audio.pause();
      setPlayingIndex(null);
      setPlayingAll(false);
      return;
    }
    playAt(index, false);
  };

  const selectSurah = (number: number) => {
    setMode("ayah");
    setSurahNumber(number);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-deep">The Noble Quran</h1>
          <p className="mt-1 text-sm text-deep/60">Arabic Mushaf with recitation by {RECITERS.find((r) => r.id === reciter)?.name}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setSearchOpen((open) => !open)}
          aria-expanded={searchOpen}
          aria-controls="surah-finder"
        >
          {searchOpen ? <X /> : <Search />}
          {searchOpen ? "Close" : "Find Surah"}
        </Button>
      </div>

      {searchOpen && (
        <section id="surah-finder" className="mt-5 border-y border-hairline bg-card py-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-deep/40" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by Surah name or number"
              className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm text-deep outline-none focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <div className="mt-3 grid max-h-64 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
            {filteredSurahs.map((surah) => (
              <Button
                key={surah.number}
                variant="ghost"
                className="h-auto justify-start px-3 py-2 text-left"
                onClick={() => selectSurah(surah.number)}
              >
                <span className="w-7 text-xs tabular-nums text-deep/50">{surah.number}</span>
                <span className="flex-1 truncate">{surah.englishName}</span>
                <span lang="ar" dir="rtl" className="font-arabic text-base">{surah.name}</span>
              </Button>
            ))}
          </div>
        </section>
      )}

      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mt-6" 
        aria-label="Choose a reciter"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-deep tracking-tight">Master Reciters (القرّاء)</h2>
            <p className="text-xs text-deep/50">Listen to pristine verse-by-verse recitation</p>
          </div>
          {(playingAll || playingIndex !== null) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/25 text-brand text-xs font-medium"
            >
              <span className="flex items-end gap-0.5 h-3">
                {[0.4, 0.8, 0.5, 1, 0.6].map((h, i) => (
                  <motion.span
                    key={i}
                    animate={{ height: ["30%", "100%", "30%"] }}
                    transition={{
                      duration: 0.6 + i * 0.15,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-0.5 bg-brand rounded-full inline-block"
                  />
                ))}
              </span>
              <span>Playing recitation</span>
            </motion.div>
          )}
        </div>

        <div className="mt-2 flex gap-3.5 overflow-x-auto pb-4 pt-1 px-1 snap-x scrollbar-thin">
          {RECITERS.map((r) => {
            const active = r.id === reciter;
            const isThisPlaying = active && (playingAll || playingIndex !== null);
            return (
              <motion.button 
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                key={r.id} 
                type="button" 
                onClick={() => chooseReciter(r.id)} 
                aria-pressed={active}
                className={`relative flex w-32 shrink-0 snap-center flex-col items-center gap-2.5 rounded-2xl border p-3 text-center transition-all shadow-sm ${
                  active 
                    ? "border-brand bg-panel shadow-md ring-2 ring-brand/25" 
                    : "border-hairline bg-card/80 backdrop-blur-sm hover:border-brand/30 hover:bg-panel"
                }`}
              >
                {active && (
                  <motion.div 
                    layoutId="active-reciter-glow"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-b from-brand/10 to-transparent pointer-events-none"
                  />
                )}
                
                <div className="relative size-18 overflow-hidden rounded-full border-2 border-panel shadow-md ring-2 ring-brand/20">
                  <img 
                    src={r.image} 
                    alt={r.name} 
                    loading="eager"
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = "true";
                        target.src = `https://raw.githubusercontent.com/nafihcc/deen-degrees-plus/main/public/reciters/${r.id}.jpg`;
                        return;
                      }
                      target.style.display = 'none';
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = 'grid';
                      }
                    }}
                  />
                  <span 
                    style={{ display: 'none' }}
                    className={`absolute inset-0 place-items-center font-display text-lg font-semibold ${
                      active ? "bg-brand text-primary-foreground" : "bg-mist text-brand"
                    }`}
                  >
                    {initials(r.name)}
                  </span>

                  {isThisPlaying && (
                    <div className="absolute inset-0 bg-brand/30 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="flex items-end gap-0.5 h-4">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ height: ["20%", "100%", "20%"] }}
                            transition={{
                              duration: 0.5 + i * 0.1,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="w-1 bg-white rounded-full inline-block"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <span className={`block text-xs font-semibold leading-tight truncate ${active ? 'text-brand' : 'text-deep'}`}>
                    {r.name}
                  </span>
                  <span className="block text-[10px] text-deep/45 truncate mt-0.5">
                    {r.origin}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      <motion.section 
        layout
        className="mt-5 overflow-hidden rounded-3xl border border-hairline bg-card/90 backdrop-blur-md shadow-lg"
      >
        <motion.header 
          layout
          className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3.5 sm:px-6 bg-panel/50"
        >
          <div className="flex rounded-xl bg-mist/80 p-1 border border-hairline" aria-label="Reading mode">
            <Button
              size="sm"
              variant={mode === "page" ? "default" : "ghost"}
              onClick={() => setMode("page")}
              className="rounded-lg transition-all"
            >
              <List /> Page
            </Button>
            <Button
              size="sm"
              variant={mode === "ayah" ? "default" : "ghost"}
              onClick={() => setMode("ayah")}
              className="rounded-lg transition-all"
            >
              Ayah
            </Button>
          </div>

          <motion.div 
            key={mode === "page" ? `p-${mushafPage}` : `s-${surahNumber}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <p lang="ar" dir="rtl" className="font-arabic text-2xl text-deep drop-shadow-sm">
              {mode === "page"
                ? pageSurahs.map((surah) => surah.name).join(" · ") || "القرآن الكريم"
                : currentSurah?.name || "القرآن الكريم"}
            </p>
            <p className="text-xs text-brand font-medium tracking-wide">
              {mode === "page" ? `Mushaf page ${mushafPage} of 604` : currentSurah?.englishName}
            </p>
          </motion.div>

          <Button 
            variant={playingAll ? "default" : "outline"}
            size="sm" 
            onClick={toggleAll} 
            disabled={loading || ayahs.length === 0}
            className="gap-2 rounded-xl transition-all shadow-sm active:scale-95"
          >
            {playingAll ? <Pause className="size-4" /> : <Play className="size-4" />}
            <span>{playingAll ? "Pause" : mode === "page" ? "Play page" : "Play Surah"}</span>
          </Button>
        </motion.header>

        {error && <p className="px-6 py-10 text-center text-sm text-destructive">{error}</p>}
        {loading && <p className="px-6 py-16 text-center text-sm text-deep/50">Loading Quran…</p>}

        {!loading && !error && mode === "page" && (
          <motion.div 
            key={`page-${mushafPage}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="quran-page px-5 py-8 sm:px-10 sm:py-12"
          >
            <p lang="ar" dir="rtl" className="font-arabic text-right text-[1.8rem] leading-[2.55] text-deep sm:text-[2.05rem]">
              {ayahs.map((ayah, index) => (
                <span key={ayah.number}>
                  <button
                    type="button"
                    onClick={() => toggleAyah(index)}
                    className={`rounded-sm px-0.5 transition-colors duration-150 ${playingIndex === index ? "bg-gold/25 text-brand" : "hover:bg-mist/80"}`}
                    aria-label={`Play verse ${ayah.numberInSurah}`}
                  >
                    {ayah.text}
                    <span className="mx-1 inline-grid size-8 place-items-center align-middle text-base text-brand font-semibold">
                      ﴿{toArabicDigits(ayah.numberInSurah)}﴾
                    </span>
                  </button>{" "}
                </span>
              ))}
            </p>
          </motion.div>
        )}

        {!loading && !error && mode === "ayah" && (
          <motion.div 
            key={`surah-${surahNumber}`}
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="divide-y divide-hairline"
          >
            {ayahs.map((ayah, index) => (
              <article 
                key={ayah.number} 
                className={`flex items-start gap-4 px-5 py-6 sm:px-8 transition-colors duration-200 ${
                  playingIndex === index ? "bg-brand/[0.04]" : ""
                }`}
              >
                <Button
                  variant={playingIndex === index ? "default" : "outline"}
                  size="icon"
                  onClick={() => toggleAyah(index)}
                  aria-label={`${playingIndex === index ? "Pause" : "Play"} verse ${ayah.numberInSurah}`}
                  className="mt-2 shrink-0 transition-all duration-150 active:scale-95 shadow-sm"
                >
                  {playingIndex === index ? <Pause className="size-4" /> : <Play className="size-4" />}
                </Button>
                <p lang="ar" dir="rtl" className="min-w-0 flex-1 font-arabic text-right text-[1.85rem] leading-[2.25] text-deep sm:text-[2.1rem]">
                  {ayah.text}
                  <span className="mr-2 inline-grid size-9 place-items-center align-middle text-base text-brand font-semibold">
                    ﴿{toArabicDigits(ayah.numberInSurah)}﴾
                  </span>
                </p>
              </article>
            ))}
          </motion.div>
        )}

        <footer className="flex items-center justify-between gap-3 border-t border-hairline px-4 py-3 sm:px-6">
          <Button
            variant="outline"
            size="sm"
            disabled={mode === "page" ? mushafPage <= 1 : surahNumber <= 1}
            onClick={() => mode === "page" ? setMushafPage((page) => page - 1) : setSurahNumber((number) => number - 1)}
          >
            <ChevronLeft /> Previous
          </Button>
          <span className="text-xs tabular-nums text-deep/50">
            {mode === "page" ? `${mushafPage} / 604` : `${surahNumber} / 114`}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={mode === "page" ? mushafPage >= 604 : surahNumber >= 114}
            onClick={() => mode === "page" ? setMushafPage((page) => page + 1) : setSurahNumber((number) => number + 1)}
          >
            Next <ChevronRight />
          </Button>
        </footer>
      </motion.section>
    </motion.main>
  );
}