import { useEffect, useRef, useState } from "react";
import { getAppIcon, isNative } from "@/lib/native";

const iconCache = new Map<string, string>();

/** Stable pastel-ish colour per app, used when no real icon is available. */
function hueFor(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) % 360;
  return h;
}

interface AppIconProps {
  pkg: string;
  label: string;
  size?: number;
  className?: string;
}

/**
 * An app's real launcher icon inside the Android app (fetched only once the
 * tile scrolls into view, then cached). In a browser, or if the icon cannot be
 * read, it shows a coloured tile with the app's first letter.
 */
export function AppIcon({ pkg, label, size = 52, className = "" }: AppIconProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [src, setSrc] = useState<string>(() => iconCache.get(pkg) ?? "");

  useEffect(() => {
    if (src || !isNative()) return;
    const node = ref.current;
    if (!node) return;
    const load = () => {
      const icon = getAppIcon(pkg);
      if (icon) {
        iconCache.set(pkg, icon);
        setSrc(icon);
      }
    };
    if (typeof IntersectionObserver === "undefined") {
      load();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [pkg, src]);

  const radius = Math.round(size * 0.26);
  if (src) {
    return (
      <span ref={ref} className={`inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          draggable={false}
          style={{ borderRadius: radius }}
          className="size-full object-cover"
        />
      </span>
    );
  }

  const hue = hueFor(pkg);
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center font-semibold text-white ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: size * 0.42,
        background: `linear-gradient(135deg, hsl(${hue} 55% 46%), hsl(${(hue + 30) % 360} 55% 36%))`,
      }}
    >
      {label.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
