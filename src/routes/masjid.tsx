import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocationSettings } from "@/context/location";
import {
  type Masjid,
  VERIFIED_MASJIDS,
  queryOverpassNearbyMasjids,
  calculateDistance,
  calculateBearing,
  getBearingLabel,
} from "@/data/masjids";
import {
  Compass,
  MapPin,
  Navigation,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  Car,
  Footprints,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/masjid")({
  component: MasjidPage,
});

function MasjidPage() {
  const { location } = useLocationSettings();
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "jummah" | "womens">("all");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: location.latitude,
    lng: location.longitude,
  });
  const [gpsActive, setGpsActive] = useState(false);

  // Sync coords if location changes
  useEffect(() => {
    setUserCoords({ lat: location.latitude, lng: location.longitude });
  }, [location.latitude, location.longitude]);

  // Request actual device GPS if user prefers
  const requestDeviceGPS = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsActive(true);
      },
      () => {
        // Fall back to stored location
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Fetch masjids whenever coordinates or radius changes
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const live = await queryOverpassNearbyMasjids(userCoords.lat, userCoords.lng, radiusKm);
        if (cancelled) return;

        if (live.length > 0) {
          setMasjids(live);
        } else {
          // If no live results in tight radius or rate limit, use verified reference masjids calculated from user position
          const mappedVerified = VERIFIED_MASJIDS.map((m) => {
            const dist = calculateDistance(userCoords.lat, userCoords.lng, m.lat, m.lng);
            const bearing = calculateBearing(userCoords.lat, userCoords.lng, m.lat, m.lng);
            return {
              ...m,
              distanceKm: dist,
              walkingMins: Math.round(dist * 12),
              bearing,
            };
          }).sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
          setMasjids(mappedVerified);
        }
      } catch {
        if (!cancelled) {
          const fallback = VERIFIED_MASJIDS.map((m) => ({
            ...m,
            distanceKm: calculateDistance(userCoords.lat, userCoords.lng, m.lat, m.lng),
            bearing: calculateBearing(userCoords.lat, userCoords.lng, m.lat, m.lng),
          }));
          setMasjids(fallback);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [userCoords.lat, userCoords.lng, radiusKm]);

  // Filter list
  const filtered = masjids.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (m.arabicName && m.arabicName.includes(filterQuery)) ||
      (m.address && m.address.toLowerCase().includes(filterQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeTab === "jummah") return m.amenities.jummahPrayer;
    if (activeTab === "womens") return m.amenities.womensArea;
    return true;
  });

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.215, 0.61, 0.355, 1] }}
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12"
    >
      {/* Swiss Editorial Header */}
      <section className="border-b border-hairline pb-8 mb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block size-2 rounded-full bg-brand animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-brand">
                Spatial Locator · {location.name}
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-deep">
              Masajid Nearby
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={requestDeviceGPS}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                gpsActive
                  ? "bg-brand text-primary-foreground font-semibold shadow-sm"
                  : "bg-panel border border-hairline text-deep/80 hover:border-brand/50"
              }`}
              title="Use precise device GPS coordinates"
            >
              <Navigation className="size-3.5 text-brand" />
              {gpsActive ? "GPS Active" : "Use Live GPS"}
            </button>
            <div className="font-mono text-xs px-3 py-2 rounded-xl bg-panel border border-hairline text-deep/60">
              {userCoords.lat.toFixed(4)}°, {userCoords.lng.toFixed(4)}°
            </div>
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-sm text-deep/70 leading-relaxed">
          Locate houses of Allah with real-time compass bearings, walking estimates, and verified prayer facilities. Verified through OpenStreetMap geographic data and satellite coordinates.
        </p>

        {/* Filter Toolbar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          {/* Radius selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-mist/60 border border-hairline text-xs font-mono">
            {[1, 3, 5, 10, 25].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  radiusKm === r
                    ? "bg-brand text-primary-foreground font-semibold shadow-xs"
                    : "text-deep/60 hover:text-deep"
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {/* Quick amenity tabs */}
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl border transition ${
                activeTab === "all"
                  ? "border-brand/40 bg-brand/10 text-brand font-semibold"
                  : "border-hairline bg-panel text-deep/60 hover:text-deep"
              }`}
            >
              All Mosques ({masjids.length})
            </button>
            <button
              onClick={() => setActiveTab("jummah")}
              className={`px-3 py-1.5 rounded-xl border transition ${
                activeTab === "jummah"
                  ? "border-brand/40 bg-brand/10 text-brand font-semibold"
                  : "border-hairline bg-panel text-deep/60 hover:text-deep"
              }`}
            >
              Jumu'ah Friday Prayer
            </button>
            <button
              onClick={() => setActiveTab("womens")}
              className={`px-3 py-1.5 rounded-xl border transition ${
                activeTab === "womens"
                  ? "border-brand/40 bg-brand/10 text-brand font-semibold"
                  : "border-hairline bg-panel text-deep/60 hover:text-deep"
              }`}
            >
              Women's Prayer Area
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-deep/40" />
            <input
              type="text"
              placeholder="Search mosque name or street..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full rounded-xl border border-hairline bg-panel pl-9 pr-3 py-1.5 text-xs text-deep placeholder:text-deep/40 focus:border-brand focus:outline-hidden"
            />
          </div>
        </div>
      </section>

      {/* Grid of Mosque Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RefreshCw className="size-8 animate-spin text-brand mb-4" />
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            Querying satellite nodes & geographic coordinates...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-card p-12 text-center max-w-lg mx-auto">
          <MapPin className="size-10 mx-auto text-deep/30 mb-3" />
          <h3 className="font-display text-lg font-semibold text-deep">No Masajid in Current Radius</h3>
          <p className="mt-2 text-xs text-deep/60">
            Try expanding the search radius to 10 km or 25 km, or search for another location using the top location switcher.
          </p>
          <button
            onClick={() => setRadiusKm(25)}
            className="mt-5 px-4 py-2 rounded-xl bg-brand text-primary-foreground text-xs font-mono font-semibold hover:bg-deep transition"
          >
            Expand to 25 km
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((m, idx) => {
              const bearingLabel = m.bearing !== undefined ? getBearingLabel(m.bearing) : "N";
              const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`;

              return (
                <motion.article
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4) }}
                  className="glass-panel group relative flex flex-col justify-between rounded-2xl p-5 shadow-xs transition-all hover:border-brand/40 hover:shadow-md"
                >
                  <div>
                    {/* Header: Distance & Bearing Dial */}
                    <div className="flex items-center justify-between gap-2 border-b border-hairline/60 pb-3 mb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-deep">
                          {m.distanceKm !== undefined ? `${m.distanceKm} km` : "Nearby"}
                        </span>
                        {m.walkingMins !== undefined && (
                          <span className="flex items-center gap-1 font-mono text-[11px] text-deep/50">
                            <Footprints className="size-3" />
                            ~{m.walkingMins} min
                          </span>
                        )}
                      </div>

                      {/* Compass Bearing Indicator */}
                      {m.bearing !== undefined && (
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand/10 border border-brand/20 text-[11px] font-mono text-brand"
                          title={`Bearing: ${m.bearing}° (${bearingLabel})`}
                        >
                          <Compass
                            className="size-3.5 text-brand transition-transform duration-500"
                            style={{ transform: `rotate(${m.bearing}deg)` }}
                          />
                          <span>
                            {m.bearing}° {bearingLabel}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Name & Arabic Calligraphy */}
                    <h2 className="font-display text-lg font-semibold text-deep leading-snug group-hover:text-brand transition-colors">
                      {m.name}
                    </h2>
                    {m.arabicName && (
                      <p className="font-arabic text-base text-deep/70 mt-1" dir="rtl">
                        {m.arabicName}
                      </p>
                    )}

                    {/* Address */}
                    {m.address && (
                      <p className="mt-2 text-xs text-deep/60 line-clamp-2 leading-relaxed flex items-start gap-1.5">
                        <MapPin className="size-3.5 shrink-0 mt-0.5 text-brand/70" />
                        <span>{m.address}</span>
                      </p>
                    )}

                    {/* Amenities tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {m.amenities.jummahPrayer && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-medium font-mono border border-brand/20">
                          <CheckCircle2 className="size-2.5 text-brand" /> Jumu'ah
                        </span>
                      )}
                      {m.amenities.womensArea && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-mist text-deep/80 text-[10px] font-medium font-mono border border-hairline">
                          Sisters' Hall
                        </span>
                      )}
                      {m.amenities.wuduFacility && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-panel border border-hairline text-deep/70 text-[10px] font-medium font-mono">
                          Wudu
                        </span>
                      )}
                      {m.amenities.parking && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-panel border border-hairline text-deep/70 text-[10px] font-medium font-mono">
                          <Car className="size-2.5 text-deep/50" /> Parking
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Navigation Buttons */}
                  <div className="mt-5 pt-3.5 border-t border-hairline/60 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-deep/40 uppercase tracking-wider">
                      {m.source === "live" ? "Live Node" : "Verified Hub"}
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-brand text-primary-foreground text-xs font-mono font-semibold shadow-xs hover:bg-deep transition"
                      >
                        <span>Directions</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Footnote on OpenStreetMap and Community Accuracy */}
      <footer className="mt-12 p-4 rounded-2xl bg-panel border border-hairline flex items-start gap-3 text-xs text-deep/60">
        <Info className="size-4 shrink-0 text-brand mt-0.5" />
        <p>
          Coordinates and prayer facilities are fetched through OpenStreetMap and geographical geodetic systems. When traveling, please confirm Friday prayer timings directly with local mosque committees.
        </p>
      </footer>
    </motion.main>
  );
}
