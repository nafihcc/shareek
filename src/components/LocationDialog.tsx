import { useEffect, useState } from "react";
import { searchPlaces, fetchElevation, type PlaceResult } from "@/lib/geo";
import { useLocationSettings } from "@/context/location";
import { DEFAULT_SETTINGS } from "@/lib/prayer-times";

export function LocationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { location, settings, setLocation, setSettings, detect, detecting, detectError } =
    useLocationSettings();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [lat, setLat] = useState(String(location.latitude));
  const [lng, setLng] = useState(String(location.longitude));
  const [elev, setElev] = useState(String(Math.round(location.elevation)));

  useEffect(() => {
    setLat(String(location.latitude));
    setLng(String(location.longitude));
    setElev(String(Math.round(location.elevation)));
  }, [location]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const id = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await searchPlaces(query));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [query]);

  if (!open) return null;

  const applyManual = async () => {
    const la = Number(lat);
    const ln = Number(lng);
    if (Number.isNaN(la) || Number.isNaN(ln)) return;
    let el = Number(elev);
    if (Number.isNaN(el)) el = await fetchElevation(la, ln);
    setLocation({
      name: "Custom point",
      region: `${la.toFixed(3)}, ${ln.toFixed(3)}`,
      country: "",
      latitude: la,
      longitude: ln,
      elevation: el,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-overlay/60 backdrop-blur-sm"
      />
      <div role="dialog" aria-modal="true" aria-label="Location and method" className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto glass-panel rounded-t-3xl sm:rounded-3xl bg-panel/95 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand/70 font-semibold">
              Location & method
            </p>
            <h2 className="text-2xl font-semibold text-deep mt-1">Where are you praying?</h2>
          </div>
          <button onClick={onClose} className="text-deep/40 hover:text-deep text-xl leading-none">
            ×
          </button>
        </div>

        <button
          onClick={detect}
          disabled={detecting}
          className="mt-5 w-full bg-brand text-primary-foreground text-sm font-semibold px-4 py-3 rounded-2xl shadow-lg shadow-brand/25 hover:bg-deep transition disabled:opacity-60"
        >
          {detecting ? "Reading your position…" : "Use my current position"}
        </button>
        {detectError && <p className="mt-2 text-xs text-destructive">{detectError}</p>}

        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-[0.15em] text-deep/50">
            Search a town
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kozhikode, Kasaragod, Dubai…"
            className="mt-2 w-full rounded-2xl border border-hairline bg-panel/70 px-4 py-3 text-sm text-deep outline-none focus:border-brand/50"
          />
          {searching && <p className="mt-2 text-xs text-deep/40">Searching…</p>}
          {results.length > 0 && (
            <ul className="mt-2 rounded-2xl border border-hairline bg-panel/80 divide-y divide-mist overflow-hidden">
              {results.map((r) => (
                <li key={`${r.latitude},${r.longitude}`}>
                  <button
                    onClick={() => {
                      setLocation(r);
                      onClose();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-mist/70 transition"
                  >
                    <p className="text-sm font-medium text-deep">{r.name}</p>
                    <p className="text-xs text-deep/50">
                      {[r.region, r.country].filter(Boolean).join(" · ")} · {Math.round(r.elevation)} m
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-[0.15em] text-deep/50">
            Manual coordinates
          </label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Latitude"
              className="rounded-2xl border border-hairline bg-panel/70 px-3 py-2.5 text-sm text-deep outline-none focus:border-brand/50"
            />
            <input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Longitude"
              className="rounded-2xl border border-hairline bg-panel/70 px-3 py-2.5 text-sm text-deep outline-none focus:border-brand/50"
            />
            <input
              value={elev}
              onChange={(e) => setElev(e.target.value)}
              placeholder="Elev m"
              className="rounded-2xl border border-hairline bg-panel/70 px-3 py-2.5 text-sm text-deep outline-none focus:border-brand/50"
            />
          </div>
          <button
            onClick={applyManual}
            className="mt-2 w-full text-sm font-semibold text-brand border border-brand/30 rounded-2xl py-2.5 hover:bg-mist/70 transition"
          >
            Apply coordinates
          </button>
        </div>

        <div className="mt-6 border-t border-mist pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-deep/50">
            Method settings
          </p>
          <p className="mt-1 text-xs text-deep/50 leading-relaxed">
            Fajr {settings.fajrAngle}°, Isha {settings.ishaAngle}° and the full solar disc for
            Maghrib are fixed by the traditional reckoning and are not adjustable.
          </p>
          <div className="mt-3 space-y-3 text-sm text-deep/70">
            <Row label="Asr shadow">
              <div className="flex gap-2">
                {[1, 2].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSettings({ ...settings, asrShadowFactor: f })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      settings.asrShadowFactor === f
                        ? "bg-brand text-primary-foreground"
                        : "border border-hairline text-deep/60"
                    }`}
                  >
                    {f === 1 ? "Standard" : "Hanafi"}
                  </button>
                ))}
              </div>
            </Row>
          </div>
          <button
            onClick={() => setSettings(DEFAULT_SETTINGS)}
            className="mt-4 text-xs font-semibold text-deep/50 hover:text-brand transition"
          >
            Reset to the traditional reckoning
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-deep/60">{label}</span>
      {children}
    </div>
  );
}
