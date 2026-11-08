import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocationSettings } from "@/context/location";
import { computePrayerTimes, PRAYER_LABELS, type PrayerKey } from "@/lib/prayer-times";
import { ShareekLogo } from "@/components/ShareekLogo";

const NOTIFY_KEY = "shareek.notify";
const ALERT_PRAYERS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const REMINDER_MS = 15 * 60_000;
const AUTO_DISMISS_MS = 8_000; // Active for 8 seconds, then automatically disappears

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

function isPreviewHost() {
  const h = window.location.hostname;
  return (
    window.self !== window.top ||
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    h.endsWith("lovableproject.com") ||
    h.endsWith("lovableproject-dev.com")
  );
}

async function getWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator) || isPreviewHost() || !import.meta.env.PROD) return null;
  try {
    return await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}notify-sw.js`);
  } catch {
    return null;
  }
}

async function showAlert(title: string, body: string, tag: string) {
  const icon = `${import.meta.env.BASE_URL}icon-192.png`;
  const reg = await getWorker();
  if (reg) return reg.showNotification(title, { body, tag, icon, badge: icon });
  try {
    new Notification(title, { body, tag, icon });
  } catch {
    /* Unsupported */
  }
}

/** Auto-disappearing Install button + prayer notifications */
export function AppExtras() {
  const { location, settings } = useLocationSettings();
  const [installEvt, setInstallEvt] = useState<InstallEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [installTip, setInstallTip] = useState<string | null>(null);
  const [notify, setNotify] = useState(false);
  const sent = useRef(new Set<string>());

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!standalone) {
      setShowInstall(true);
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as InstallEvent);
      setShowInstall(true);
    };
    const onInstalled = () => {
      setInstallEvt(null);
      setShowInstall(false);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    try {
      setNotify(localStorage.getItem(NOTIFY_KEY) === "on" && Notification.permission === "granted");
    } catch {
      /* ignore */
    }

    void getWorker();
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Automatically hide the install button after AUTO_DISMISS_MS (8 seconds)
  useEffect(() => {
    if (!showInstall) return;
    const timer = setTimeout(() => {
      setShowInstall(false);
      setInstallTip(null);
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [showInstall]);

  useEffect(() => {
    if (!notify) return;
    const point = {
      latitude: location.latitude,
      longitude: location.longitude,
      elevation: location.elevation,
    };
    const check = () => {
      const now = Date.now();
      const times = computePrayerTimes(new Date(), point, settings).times;
      for (const key of ALERT_PRAYERS) {
        const at = times[key].getTime();
        const day = times[key].toDateString();
        const label = PRAYER_LABELS[key];
        const clock = times[key].toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const before = `${day}-${key}-pre`;
        if (
          now >= at - REMINDER_MS &&
          now < at - REMINDER_MS + 120_000 &&
          !sent.current.has(before)
        ) {
          sent.current.add(before);
          void showAlert(
            `${label} in 15 minutes`,
            `${label} begins at ${clock} in ${location.name}.`,
            before
          );
        }
        const on = `${day}-${key}-on`;
        if (now >= at && now < at + 120_000 && !sent.current.has(on)) {
          sent.current.add(on);
          void showAlert(`It's time for ${label}`, `${label} has begun (${clock}) in ${location.name}.`, on);
        }
      }
    };
    check();
    const id = setInterval(check, 20_000);
    return () => clearInterval(id);
  }, [notify, location, settings]);

  const toggleNotify = async () => {
    if (notify) {
      setNotify(false);
      try {
        localStorage.setItem(NOTIFY_KEY, "off");
      } catch {
        /* ignore */
      }
      return;
    }
    if (!("Notification" in window)) {
      alert("This browser cannot show notifications. Install the app first, then try again.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;
    setNotify(true);
    try {
      localStorage.setItem(NOTIFY_KEY, "on");
    } catch {
      /* ignore */
    }
    void showAlert("Prayer alerts are on", "You'll be notified 15 minutes before and at each prayer.", "shareek-welcome");
  };

  const handleInstallClick = async () => {
    if (installEvt) {
      await installEvt.prompt();
      setInstallEvt(null);
      setShowInstall(false);
      return;
    }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setInstallTip(
      ios
        ? "Tap Share in Safari, then choose “Add to Home Screen”."
        : "Use your browser menu (⋮) → “Install app” or “Add to Home Screen”."
    );
  };

  return (
    <>
      <AnimatePresence>
        {showInstall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ duration: 0.25 }}
            className="relative flex items-center"
          >
            <button
              type="button"
              onClick={handleInstallClick}
              className="relative overflow-hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-panel border border-brand/25 text-brand text-xs font-semibold shadow-xs hover:bg-mist transition cursor-pointer whitespace-nowrap"
              title="Install Shareek App"
            >
              <Download className="size-3.5 shrink-0" />
              <span>Install App</span>
              {/* Subtle auto-disappear timer bar */}
              <motion.span
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: AUTO_DISMISS_MS / 1000, ease: "linear" }}
                className="absolute bottom-0 left-0 h-0.5 bg-brand/40"
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {installTip && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-6 z-50 max-w-sm rounded-2xl bg-panel border border-hairline p-3.5 shadow-xl flex items-center gap-3 text-xs text-deep"
          >
            <ShareekLogo className="size-8 shrink-0" />
            <p className="flex-1 leading-relaxed">{installTip}</p>
            <button
              type="button"
              onClick={() => {
                setInstallTip(null);
                setShowInstall(false);
              }}
              className="p-1 rounded-full hover:bg-mist text-deep/50 hover:text-deep"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleNotify}
        aria-label={notify ? "Turn off prayer alerts" : "Turn on prayer alerts"}
        title={notify ? "Prayer alerts on" : "Turn on prayer alerts"}
        className={`shrink-0 rounded-full border border-hairline hover:bg-mist transition ${
          notify ? "text-brand" : "text-deep/70"
        }`}
      >
        {notify ? <Bell className="size-4" /> : <BellOff className="size-4" />}
      </Button>
    </>
  );
}
