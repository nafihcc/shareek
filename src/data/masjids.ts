export interface Masjid {
  id: string;
  name: string;
  arabicName?: string;
  lat: number;
  lng: number;
  address?: string;
  distanceKm?: number;
  walkingMins?: number;
  bearing?: number; // Compass degrees from user
  amenities: {
    womensArea: boolean;
    wuduFacility: boolean;
    jummahPrayer: boolean;
    parking: boolean;
    wheelchair: boolean;
  };
  contact?: string;
  source: "live" | "verified";
}

// Haversine formula to compute distance in km
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Compute compass bearing from user to masjid
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  const bearing = ((θ * 180) / Math.PI + 360) % 360;
  return Math.round(bearing);
}

// Direction label from bearing
export function getBearingLabel(bearing: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(bearing / 45) % 8;
  return directions[index] || "N";
}

// Curated verified masjids fallback dataset (major hubs + universal reference places)
export const VERIFIED_MASJIDS: Masjid[] = [
  {
    id: "masjid-al-haram",
    name: "Masjid al-Haram (The Sacred Mosque)",
    arabicName: "المسجد الحرام",
    lat: 21.4225,
    lng: 39.8262,
    address: "Al Haram, Mecca, Kingdom of Saudi Arabia",
    amenities: {
      womensArea: true,
      wuduFacility: true,
      jummahPrayer: true,
      parking: true,
      wheelchair: true,
    },
    source: "verified",
  },
  {
    id: "masjid-an-nabawi",
    name: "Al-Masjid an-Nabawi (The Prophet's Mosque)",
    arabicName: "المسجد النبوي",
    lat: 24.4672,
    lng: 39.6111,
    address: "Al Haram, Medina, Kingdom of Saudi Arabia",
    amenities: {
      womensArea: true,
      wuduFacility: true,
      jummahPrayer: true,
      parking: true,
      wheelchair: true,
    },
    source: "verified",
  },
  {
    id: "masjid-al-aqsa",
    name: "Al-Aqsa Mosque Compound",
    arabicName: "المسجد الأقصى المبارك",
    lat: 31.7761,
    lng: 35.2358,
    address: "Old City, Jerusalem",
    amenities: {
      womensArea: true,
      wuduFacility: true,
      jummahPrayer: true,
      parking: false,
      wheelchair: true,
    },
    source: "verified",
  },
  {
    id: "cambridge-central-mosque",
    name: "Cambridge Central Mosque",
    arabicName: "جامع كامبريدج المركزي",
    lat: 52.1989,
    lng: 0.1444,
    address: "309-313 Mill Rd, Cambridge CB1 3DF, United Kingdom",
    amenities: {
      womensArea: true,
      wuduFacility: true,
      jummahPrayer: true,
      parking: true,
      wheelchair: true,
    },
    source: "verified",
  },
  {
    id: "sheikh-zayed-grand-mosque",
    name: "Sheikh Zayed Grand Mosque",
    arabicName: "جامع الشيخ زايد الكبير",
    lat: 24.4128,
    lng: 54.4750,
    address: "Al Rawdah, Abu Dhabi, United Arab Emirates",
    amenities: {
      womensArea: true,
      wuduFacility: true,
      jummahPrayer: true,
      parking: true,
      wheelchair: true,
    },
    source: "verified",
  },
  {
    id: "sultanahmet-mosque",
    name: "Sultan Ahmed Mosque (Blue Mosque)",
    arabicName: "جامع السلطان أحمد",
    lat: 41.0054,
    lng: 28.9768,
    address: "Sultan Ahmet, Fatih/Istanbul, Turkey",
    amenities: {
      womensArea: true,
      wuduFacility: true,
      jummahPrayer: true,
      parking: false,
      wheelchair: true,
    },
    source: "verified",
  },
  {
    id: "istiqlal-mosque",
    name: "Istiqlal Mosque",
    arabicName: "مسجد الاستقلال",
    lat: -6.1702,
    lng: 106.8317,
    address: "Jl. Taman Wijaya Kusuma, Central Jakarta, Indonesia",
    amenities: {
      womensArea: true,
      wuduFacility: true,
      jummahPrayer: true,
      parking: true,
      wheelchair: true,
    },
    source: "verified",
  },
  {
    id: "islamic-cultural-center-ny",
    name: "Islamic Cultural Center of New York",
    arabicName: "المركز الثقافي الإسلامي في نيويورك",
    lat: 40.7854,
    lng: -73.9515,
    address: "1711 3rd Ave, New York, NY 10029, USA",
    amenities: {
      womensArea: true,
      wuduFacility: true,
      jummahPrayer: true,
      parking: false,
      wheelchair: true,
    },
    source: "verified",
  },
  {
    id: "east-london-mosque",
    name: "East London Mosque & London Muslim Centre",
    arabicName: "جامع شرق لندن",
    lat: 51.5175,
    lng: -0.0658,
    address: "82-92 Whitechapel Rd, London E1 1JQ, United Kingdom",
    amenities: {
      womensArea: true,
      wuduFacility: true,
      jummahPrayer: true,
      parking: true,
      wheelchair: true,
    },
    source: "verified",
  },
];

// Query OpenStreetMap Overpass API for real-time live local masjids
export async function queryOverpassNearbyMasjids(
  userLat: number,
  userLng: number,
  radiusKm = 5
): Promise<Masjid[]> {
  const radiusMeters = Math.min(radiusKm * 1000, 25000); // capped at 25km
  const overpassQuery = `
    [out:json][timeout:10];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${userLat},${userLng});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${userLat},${userLng});
      relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${userLat},${userLng});
    );
    out center 30;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) throw new Error("Overpass API response error");
    const json = await response.json();

    const masjids: Masjid[] = [];
    if (json.elements && Array.isArray(json.elements)) {
      for (const el of json.elements) {
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (!lat || !lon) continue;

        const name = el.tags?.name || el.tags?.["name:en"] || "Local Mosque / Masjid";
        const arabicName = el.tags?.["name:ar"] || undefined;
        const addressParts = [
          el.tags?.["addr:street"],
          el.tags?.["addr:city"] || el.tags?.["addr:suburb"],
          el.tags?.["addr:postcode"],
        ].filter(Boolean);

        const dist = calculateDistance(userLat, userLng, lat, lon);
        const bearing = calculateBearing(userLat, userLng, lat, lon);

        masjids.push({
          id: `osm-${el.type}-${el.id}`,
          name,
          arabicName,
          lat,
          lng: lon,
          address: addressParts.length ? addressParts.join(", ") : el.tags?.["addr:full"],
          distanceKm: dist,
          walkingMins: Math.round(dist * 12), // approx 5km/h walking
          bearing,
          amenities: {
            womensArea: el.tags?.["female"] === "yes" || el.tags?.["women"] === "yes" || true,
            wuduFacility: true,
            jummahPrayer: true,
            parking: el.tags?.["parking"] === "yes" || false,
            wheelchair: el.tags?.["wheelchair"] === "yes" || false,
          },
          source: "live",
        });
      }
    }

    // Sort by proximity
    masjids.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    return masjids;
  } catch (error) {
    console.warn("Failed to fetch live Overpass masjids, using calculated distances:", error);
    return [];
  }
}
