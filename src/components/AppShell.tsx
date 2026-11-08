import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useLocationSettings } from "@/context/location";
import { LocationDialog } from "@/components/LocationDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DesignToggle } from "@/components/DesignToggle";
import { PrayFirstSync } from "@/components/PrayFirstSync";
import { AppExtras } from "@/components/AppExtras";
import { IslamicCelestialBackground } from "@/components/IslamicCelestialBackground";
import { ContributeSection } from "@/components/ContributeSection";
import { ShareekLogo } from "@/components/ShareekLogo";

const NAV = [
  { to: "/", label: "Prayer Times", short: "Prayer", icon: "🕌" },
  { to: "/pray-first", label: "Pray First", short: "Pray First", icon: "🛡️" },
  { to: "/qibla", label: "Qibla", short: "Qibla", icon: "🧭" },
  { to: "/quran", label: "Quran", short: "Quran", icon: "📖" },
  { to: "/masjid", label: "Masajid", short: "Masajid", icon: "📍" },
  { to: "/asmaul-husna", label: "99 Names", short: "99 Names", icon: "✨" },
  { to: "/duas", label: "Adhkar & Duas", short: "Duas", icon: "🤲" },
  { to: "/dhikr", label: "Dhikr", short: "Dhikr", icon: "📿" },
  { to: "/tracker", label: "Tracker", short: "Tracker", icon: "📊" },
  { to: "/calendar", label: "Calendar", short: "Calendar", icon: "🗓️" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { location } = useLocationSettings();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-surface overflow-x-hidden text-deep antialiased select-none sm:select-auto pb-24 lg:pb-0">
      <div data-ui="celestial">
        <IslamicCelestialBackground />
      </div>
      <PrayFirstSync />

      {/* Header — Fully optimized for mobile & desktop */}
      <div data-ui="header-bar" className="relative z-20">
      <header className="relative z-20 px-3 sm:px-6 py-3.5 sm:py-5 flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto border-b border-hairline/60 lg:border-none">
        {/* Brand with Na'l Shareef & Green Qubbah Logo */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 no-underline">
          <ShareekLogo className="size-9 sm:size-10 shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-semibold text-deep tracking-tight font-display">
                Shareek
              </span>
              <span className="text-xs font-arabic text-brand/80 font-normal">
                شَرِيك
              </span>
            </div>
            <span className="hidden sm:inline text-[9px] uppercase tracking-[0.22em] text-brand/60 -mt-0.5">
              Prayer · Quran · Sunnah
            </span>
          </div>
        </Link>

        {/* Desktop Nav — Zero underlines */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-sm font-medium text-deep/75">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-brand bg-brand/10 font-semibold" }}
              activeOptions={{ exact: item.to === "/" }}
              className="px-3 py-1.5 rounded-full hover:bg-mist hover:text-deep transition no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <AppExtras />
          <DesignToggle />
          <ThemeToggle />
          <Link
            to="/about"
            className="hidden sm:inline text-xs sm:text-sm font-semibold text-brand hover:text-deep transition whitespace-nowrap px-2 py-1 rounded-full no-underline"
          >
            About
          </Link>
          <span className="hidden md:inline text-xs font-medium text-deep/65 bg-panel/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-hairline shadow-2xs">
            {location.name}
            {location.region ? `, ${location.region}` : ""}
          </span>
          <button
            onClick={() => setOpen(true)}
            className="bg-brand text-primary-foreground text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-md shadow-brand/20 hover:bg-deep transition whitespace-nowrap cursor-pointer shrink-0"
          >
            <span className="sm:inline hidden">Set Location</span>
            <span className="inline sm:hidden">Location</span>
          </button>
        </div>
      </header>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10">{children}</div>

      <ContributeSection />

      {/* Desktop Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-10 hidden lg:flex flex-row items-center justify-between gap-3 text-xs text-deep/50 border-t border-hairline">
        <p>
          Shareek (شَرِيك) · Prayer times, Quran, Masajid, 99 Names, Adhkar, Qibla, and worship tracker.
        </p>
        <div className="flex gap-5">
          <a href="#contribute" className="font-semibold text-brand hover:text-deep transition no-underline">
            Contribute
          </a>
          <Link to="/about" className="font-semibold text-brand hover:text-deep transition no-underline">
            About
          </Link>
          <Link to="/methodology" className="font-semibold text-brand hover:text-deep transition no-underline">
            View methodology →
          </Link>
        </div>
      </footer>

      {/* Bottom Mobile Floating Navigation Bar — Highly Ergonomic with Zero Underlines */}
      <nav data-ui="mobile-nav" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-panel/90 backdrop-blur-xl border-t border-hairline/80 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar scroll-smooth">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-brand bg-brand/10 font-semibold" }}
              activeOptions={{ exact: item.to === "/" }}
              className="flex-1 min-w-[56px] py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-deep/65 hover:text-brand transition no-underline select-none"
            >
              <span data-ui="nav-icon" className="text-base leading-none">{item.icon}</span>
              <span className="text-[10px] leading-tight font-medium tracking-tight whitespace-nowrap">
                {item.short}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      <LocationDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
