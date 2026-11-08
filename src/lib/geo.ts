export interface PlaceResult {
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation: number;
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  if (!query.trim()) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=8&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Place search failed");
  const data = (await res.json()) as {
    results?: Array<{
      name: string;
      admin1?: string;
      country?: string;
      latitude: number;
      longitude: number;
      elevation?: number;
    }>;
  };
  return (data.results ?? []).map((r) => ({
    name: r.name,
    region: r.admin1 ?? "",
    country: r.country ?? "",
    latitude: r.latitude,
    longitude: r.longitude,
    elevation: r.elevation ?? 0,
  }));
}

/** Ground elevation in metres for a coordinate pair (SRTM 90 m dataset). */
export async function fetchElevation(latitude: number, longitude: number): Promise<number> {
  const url = `https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`;
  const res = await fetch(url);
  if (!res.ok) return 0;
  const data = (await res.json()) as { elevation?: number[] };
  return data.elevation?.[0] ?? 0;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<{ name: string; region: string; country: string } | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
    };
    return {
      name: data.city || data.locality || "Current position",
      region: data.principalSubdivision ?? "",
      country: data.countryName ?? "",
    };
  } catch {
    return null;
  }
}
