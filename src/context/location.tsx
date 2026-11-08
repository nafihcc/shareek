import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_SETTINGS, type MethodSettings } from "@/lib/prayer-times";
import { fetchElevation, reverseGeocode } from "@/lib/geo";

export interface SavedLocation {
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation: number;
}

const FALLBACK: SavedLocation = {
  name: "Kozhikode",
  region: "Kerala",
  country: "India",
  latitude: 11.2588,
  longitude: 75.7804,
  elevation: 12,
};

const LOC_KEY = "faiz.location";
const SET_KEY = "faiz.settings";

interface LocationContextValue {
  location: SavedLocation;
  isDefault: boolean;
  settings: MethodSettings;
  detecting: boolean;
  detectError: string | null;
  setLocation: (loc: SavedLocation) => void;
  setSettings: (s: MethodSettings) => void;
  detect: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<SavedLocation>(FALLBACK);
  const [isDefault, setIsDefault] = useState(true);
  const [settings, setSettingsState] = useState<MethodSettings>(DEFAULT_SETTINGS);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rawLoc = window.localStorage.getItem(LOC_KEY);
      if (rawLoc) {
        setLocationState(JSON.parse(rawLoc) as SavedLocation);
        setIsDefault(false);
      }
      const rawSet = window.localStorage.getItem(SET_KEY);
      if (rawSet) {
        const saved = JSON.parse(rawSet) as MethodSettings;
        const merged: MethodSettings = { ...DEFAULT_SETTINGS, ...saved };
        // Angles are whole degrees in this reckoning; snap any half-degree
        // value left over from an earlier slider.
        merged.fajrAngle = Math.round(merged.fajrAngle);
        merged.ishaAngle = Math.round(merged.ishaAngle);
        setSettingsState(merged);
      }
    } catch {
      /* ignore corrupted storage */
    }
  }, []);

  const setLocation = useCallback((loc: SavedLocation) => {
    setLocationState(loc);
    setIsDefault(false);
    try {
      window.localStorage.setItem(LOC_KEY, JSON.stringify(loc));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setSettings = useCallback((s: MethodSettings) => {
    setSettingsState(s);
    try {
      window.localStorage.setItem(SET_KEY, JSON.stringify(s));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const detect = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setDetectError("This browser cannot share your position.");
      return;
    }
    setDetecting(true);
    setDetectError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, altitude } = pos.coords;
        const [place, ground] = await Promise.all([
          reverseGeocode(latitude, longitude),
          altitude == null ? fetchElevation(latitude, longitude) : Promise.resolve(altitude),
        ]);
        setLocation({
          name: place?.name ?? "Current position",
          region: place?.region ?? "",
          country: place?.country ?? "",
          latitude,
          longitude,
          elevation: Math.max(ground ?? 0, 0),
        });
        setDetecting(false);
      },
      (err) => {
        setDetecting(false);
        setDetectError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was refused. Search for your town instead."
            : "Could not read your position. Try again or search manually.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }, [setLocation]);

  const value = useMemo(
    () => ({
      location,
      isDefault,
      settings,
      detecting,
      detectError,
      setLocation,
      setSettings,
      detect,
    }),
    [location, isDefault, settings, detecting, detectError, setLocation, setSettings, detect],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationSettings(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocationSettings must be used inside LocationProvider");
  return ctx;
}

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
