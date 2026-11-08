import type { SVGProps } from "react";

/**
 * Shareek (شَرِيك) Sacred Emblem
 * Combines the iconic silhouette of the Na'l Shareef (النعل الشريف — the Blessed Sandal)
 * with the Green Qubbah of the Prophet's Mosque ﷺ (القبة الخضراء) and its crescent finial.
 */
export function ShareekLogo({ className = "w-10 h-10", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Shareek Logo — Na'l Shareef & Sacred Qubbah"
      {...props}
    >
      <defs>
        {/* Subtle porcelain-slate background gradient */}
        <linearGradient id="shareek-bg" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1f2f57" />
          <stop offset="100%" stopColor="#152240" />
        </linearGradient>

        {/* Authentic Madinah Green Qubbah gradient */}
        <linearGradient id="qubbah-green" x1="20" y1="16" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2ca57b" />
          <stop offset="55%" stopColor="#1d7e5c" />
          <stop offset="100%" stopColor="#13583f" />
        </linearGradient>

        {/* Warm sand/amber outline for the Na'l Shareef */}
        <linearGradient id="nal-stroke" x1="16" y1="6" x2="48" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f6d896" />
          <stop offset="50%" stopColor="#e2b45b" />
          <stop offset="100%" stopColor="#c9953b" />
        </linearGradient>
      </defs>

      {/* Rounded squircle emblem base */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#shareek-bg)" />
      <rect
        x="3.5"
        y="3.5"
        width="57"
        height="57"
        rx="14.5"
        stroke="url(#nal-stroke)"
        strokeOpacity="0.35"
        strokeWidth="1"
      />

      {/* Outer Na'l Shareef (Blessed Sandal) Classical Waisted Silhouette */}
      <path
        d="M32 7C23.5 10.2 18.5 16.8 18.5 23.5C18.5 28.2 21.6 31.6 21.6 35.5C21.6 39.4 19 42.8 19 47.5C19 52.8 24.4 56.5 32 56.5C39.6 56.5 45 52.8 45 47.5C45 42.8 42.4 39.4 42.4 35.5C42.4 31.6 45.5 28.2 45.5 23.5C45.5 16.8 40.5 10.2 32 7Z"
        fill="#ffffff"
        fillOpacity="0.06"
        stroke="url(#nal-stroke)"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />

      {/* Inner double-line border of Na'l Shareef */}
      <path
        d="M32 10.2C25.2 12.9 21.3 18.2 21.3 23.5C21.3 27.6 24 30.8 24 35.5C24 40.2 21.7 43.2 21.7 47.2C21.7 51.2 26 53.8 32 53.8C38 53.8 42.3 51.2 42.3 47.2C42.3 43.2 40 40.2 40 35.5C40 30.8 42.7 27.6 42.7 23.5C42.7 18.2 38.8 12.9 32 10.2Z"
        stroke="url(#nal-stroke)"
        strokeOpacity="0.55"
        strokeWidth="0.9"
        strokeDasharray="2 1.5"
      />

      {/* Qubbah Finial (Crescent & Spire at top of Dome) */}
      <line x1="32" y1="14.5" x2="32" y2="18.5" stroke="url(#nal-stroke)" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="32" cy="14" r="1.3" fill="#f6d896" />

      {/* Green Qubbah of the Prophet ﷺ Nestled Inside the Upper Sanctuary */}
      <path
        d="M23.5 31.5C23.5 24.5 26.8 19.5 32 17.5C37.2 19.5 40.5 24.5 40.5 31.5H23.5Z"
        fill="url(#qubbah-green)"
        stroke="url(#nal-stroke)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Subtle architectural ribs on the Green Qubbah */}
      <path
        d="M32 17.8V31.5M28.2 19.8C27 23 26.5 27 26.5 31.5M35.8 19.8C37 23 37.5 27 37.5 31.5"
        stroke="#ffffff"
        strokeOpacity="0.22"
        strokeWidth="0.8"
      />

      {/* Base drum of the Qubbah with 3 miniature Madinah arches */}
      <rect
        x="23"
        y="31.5"
        width="18"
        height="3.5"
        rx="1"
        fill="#165e44"
        stroke="url(#nal-stroke)"
        strokeWidth="1"
      />
      <circle cx="27.5" cy="33.2" r="0.8" fill="#f6d896" />
      <circle cx="32" cy="33.2" r="0.8" fill="#f6d896" />
      <circle cx="36.5" cy="33.2" r="0.8" fill="#f6d896" />

      {/* Na'l Shareef Qibal (Sacred Thong Straps) arching below the Qubbah */}
      <path
        d="M24 36.5C26.8 39.5 29.5 41.2 32 43.8C34.5 41.2 37.2 39.5 40 36.5"
        stroke="url(#nal-stroke)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Lower Sacred Rosette / Star in heel of Na'l Shareef */}
      <path
        d="M32 45.8L33.2 48.2L35.8 48.6L33.9 50.4L34.4 53L32 51.7L29.6 53L30.1 50.4L28.2 48.6L30.8 48.2L32 45.8Z"
        fill="url(#nal-stroke)"
        fillOpacity="0.85"
      />
    </svg>
  );
}
