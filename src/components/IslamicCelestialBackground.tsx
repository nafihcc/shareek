import { memo } from "react";

export const IslamicCelestialBackground = memo(function IslamicCelestialBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0 select-none transform-gpu">
      {/* Dynamic ambient prayer aura / celestial gradients (hardware accelerated via CSS) */}
      <div 
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full blur-[100px] bg-gradient-to-br from-brand/15 via-brand-soft/10 to-transparent orb-1" 
      />

      <div 
        className="absolute top-[25%] -right-[15%] w-[50vw] h-[50vw] rounded-full blur-[110px] bg-gradient-to-bl from-gold/20 via-gold/10 to-transparent orb-2" 
      />

      <div 
        className="absolute -bottom-[15%] left-[25%] w-[45vw] h-[45vw] rounded-full blur-[120px] bg-gradient-to-t from-brand/10 via-gold/10 to-transparent" 
      />

      {/* Floating Sacred Islamic Geometric Arabesque (8-pointed Khatim Star) */}
      <div className="absolute top-10 right-[6%] w-[420px] h-[420px] opacity-[0.05] dark:opacity-[0.10] animate-slow-spin">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full text-deep fill-none stroke-current"
          strokeWidth="0.75"
        >
          {/* Concentric sacred circles */}
          <circle cx="100" cy="100" r="95" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="75" />
          <circle cx="100" cy="100" r="50" strokeDasharray="2 2" />
          <circle cx="100" cy="100" r="28" />

          {/* Interlocking 8-point stars */}
          <rect x="35" y="35" width="130" height="130" rx="3" transform="rotate(0 100 100)" />
          <rect x="35" y="35" width="130" height="130" rx="3" transform="rotate(45 100 100)" />
          <rect x="50" y="50" width="100" height="100" rx="2" transform="rotate(22.5 100 100)" strokeDasharray="4 2" />
          <rect x="50" y="50" width="100" height="100" rx="2" transform="rotate(67.5 100 100)" strokeDasharray="4 2" />

          {/* Rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="100"
              y1="6"
              x2="100"
              y2="194"
              transform={`rotate(${angle} 100 100)`}
              strokeOpacity="0.4"
            />
          ))}
        </svg>
      </div>

      {/* Secondary Sacred Geometry motif in bottom left */}
      <div className="absolute -bottom-20 -left-16 w-[360px] h-[360px] opacity-[0.035] dark:opacity-[0.07] animate-reverse-spin">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full text-gold fill-none stroke-current"
          strokeWidth="0.8"
        >
          <circle cx="100" cy="100" r="90" />
          <polygon points="100,12 188,100 100,188 12,100" />
          <polygon points="100,12 188,100 100,188 12,100" transform="rotate(45 100 100)" />
          <circle cx="100" cy="100" r="45" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* Luminous celestial dust particles (pure CSS hardware accelerated) */}
      <div className="absolute inset-0">
        {[
          { top: "18%", left: "22%", delay: "0s", duration: "7s", size: 3 },
          { top: "28%", left: "76%", delay: "2s", duration: "8.5s", size: 2 },
          { top: "48%", left: "14%", delay: "4s", duration: "9s", size: 2.5 },
          { top: "65%", left: "84%", delay: "1s", duration: "10s", size: 3 },
          { top: "78%", left: "38%", delay: "3s", duration: "7.5s", size: 2 },
          { top: "86%", left: "65%", delay: "5s", duration: "8s", size: 2.5 },
        ].map((star, idx) => (
          <div
            key={idx}
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
            className="absolute rounded-full bg-gold shadow-[0_0_8px_rgba(235,170,50,0.7)] animate-celestial-float"
          />
        ))}
      </div>

      {/* Subtle top light gradient */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-brand/[0.03] to-transparent pointer-events-none" />
    </div>
  );
});
