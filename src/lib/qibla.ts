export const KAABA = { latitude: 21.4224779, longitude: 39.6516172 };

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

/** Great-circle initial bearing from an observer to the Kaʿbah, in degrees from true north. */
export function qiblaBearing(latitude: number, longitude: number): number {
  const phi1 = latitude * D2R;
  const phi2 = KAABA.latitude * D2R;
  const dLng = (KAABA.longitude - longitude) * D2R;
  const y = Math.sin(dLng);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLng);
  return (Math.atan2(y, x) * R2D + 360) % 360;
}

/** Great-circle distance in kilometres to the Kaʿbah. */
export function distanceToKaaba(latitude: number, longitude: number): number {
  const R = 6371;
  const dLat = (KAABA.latitude - latitude) * D2R;
  const dLng = (KAABA.longitude - longitude) * D2R;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latitude * D2R) * Math.cos(KAABA.latitude * D2R) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function compassPointName(bearing: number): string {
  const names = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  return names[Math.round(bearing / 22.5) % 16] ?? "N";
}
