import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocationSettings } from "@/context/location";
import { compassPointName, distanceToKaaba, qiblaBearing } from "@/lib/qibla";

export const Route = createFileRoute("/qibla")({
  head: () => ({
    meta: [
      { title: "Qibla Finder — Compass, Dial and AR View | Shareek" },
      {
        name: "description",
        content:
          "Find the direction of the Kaʿbah from anywhere: live magnetic compass, classic rose dial, minimal needle and an augmented-reality camera view.",
      },
      { property: "og:title", content: "Qibla Finder — Compass, Dial and AR View" },
      {
        property: "og:description",
        content: "Four ways to face the Kaʿbah, including a camera-based augmented-reality overlay.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QiblaPage,
});

type CompassStyle = "rose" | "dial" | "needle" | "ar";

interface OrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

function QiblaPage() {
  const { location } = useLocationSettings();
  const bearing = qiblaBearing(location.latitude, location.longitude);
  const distance = distanceToKaaba(location.latitude, location.longitude);
  const [style, setStyle] = useState<CompassStyle>("rose");
  const [heading, setHeading] = useState<number | null>(null);
  const [sensorError, setSensorError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!listening) return;
    const handler = (event: Event) => {
      const e = event as OrientationEvent;
      const webkit = e.webkitCompassHeading;
      if (typeof webkit === "number") {
        setHeading(webkit);
      } else if (typeof e.alpha === "number") {
        setHeading((360 - e.alpha) % 360);
      }
    };
    window.addEventListener("deviceorientationabsolute", handler, true);
    window.addEventListener("deviceorientation", handler, true);
    return () => {
      window.removeEventListener("deviceorientationabsolute", handler, true);
      window.removeEventListener("deviceorientation", handler, true);
    };
  }, [listening]);

  const enableSensor = async () => {
    setSensorError(null);
    const anyOrientation = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    try {
      if (typeof anyOrientation?.requestPermission === "function") {
        const state = await anyOrientation.requestPermission();
        if (state !== "granted") {
          setSensorError("Motion access was refused, so the needle cannot follow your device.");
          return;
        }
      }
      setListening(true);
    } catch {
      setSensorError("This device did not share its compass sensor.");
    }
  };

  const relative = heading == null ? bearing : (bearing - heading + 360) % 360;
  const aligned = Math.min(relative, 360 - relative) < 5;

  return (
    <motion.main 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="max-w-5xl mx-auto px-6 pb-20 pt-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-brand/70 font-semibold">Qibla · القبلة</p>
          <h1 className="mt-2 text-4xl font-semibold text-deep leading-tight font-display">
            Face the Kaʿbah from {location.name}
          </h1>
        </div>
        {aligned && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-4 py-2 rounded-2xl bg-gold/15 border border-gold/40 text-gold font-semibold text-xs flex items-center gap-2 shadow-lg shadow-gold/10"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gold animate-ping" />
            <span>Aligned with Ka'bah! (مواجه للكعبة)</span>
          </motion.div>
        )}
      </div>
      <p className="mt-3 text-deep/60 max-w-xl">
        Great-circle bearing {bearing.toFixed(1)}° ({compassPointName(bearing)}) · {Math.round(distance)} km
        away. Hold the device flat and away from metal for a stable reading.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["rose", "Compass rose"],
            ["dial", "Brass dial"],
            ["needle", "Minimal needle"],
            ["ar", "AR camera"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setStyle(value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              style === value
                ? "bg-brand text-primary-foreground shadow-lg shadow-brand/25"
                : "glass-panel text-deep/70 hover:text-brand"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 glass-panel rounded-3xl p-6 grid place-items-center min-h-[360px]">
          {style === "ar" ? (
            <ArView relative={relative} aligned={aligned} listening={listening} />
          ) : (
            <CompassGraphic style={style} relative={relative} heading={heading} aligned={aligned} />
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-brand/70 font-semibold">
              Live reading
            </p>
            <p className="mt-2 text-3xl font-semibold text-deep font-display tabular-nums">
              {heading == null ? "—" : `${Math.round(heading)}°`}
              <span className="text-sm font-sans text-deep/40 ml-2">device heading</span>
            </p>
            <p className="mt-1 text-sm text-deep/60 tabular-nums">
              Turn {relative <= 180 ? "right" : "left"}{" "}
              {Math.round(relative <= 180 ? relative : 360 - relative)}° to face the Kaʿbah
            </p>
            {!listening && (
              <button
                onClick={enableSensor}
                className="mt-4 w-full bg-brand text-primary-foreground text-sm font-semibold px-4 py-3 rounded-2xl shadow-lg shadow-brand/25 hover:bg-deep transition"
              >
                Enable device compass
              </button>
            )}
            {sensorError && <p className="mt-2 text-xs text-destructive">{sensorError}</p>}
            {listening && heading == null && (
              <p className="mt-3 text-xs text-deep/50">
                Waiting for the sensor — move the device in a figure of eight to calibrate.
              </p>
            )}
          </div>

          <div className="glass-panel rounded-3xl p-6 text-sm text-deep/60 leading-relaxed">
            <p className="text-xs uppercase tracking-[0.18em] text-brand/70 font-semibold">
              No compass?
            </p>
            <p className="mt-2">
              Use the fixed bearing instead: stand facing true north and turn{" "}
              <span className="font-semibold text-deep">{bearing.toFixed(1)}°</span> clockwise. A
              paper compass points to magnetic north, which differs from true north by a few
              degrees in most places.
            </p>
          </div>
        </div>
      </div>
    </motion.main>
  );
}

function CompassGraphic({
  style,
  relative,
  heading,
  aligned,
}: {
  style: CompassStyle;
  relative: number;
  heading: number | null;
  aligned: boolean;
}) {
  const rotation = heading == null ? 0 : -heading;

  return (
    <div className="relative w-[280px] h-[280px] grid place-items-center">
      {style === "rose" && (
        <div
          className="absolute inset-0 rounded-full border border-hairline bg-panel/60 transition-transform duration-300"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {Array.from({ length: 72 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-0 origin-bottom"
              style={{
                height: "140px",
                transform: `rotate(${i * 5}deg)`,
              }}
            >
              <div
                className={`mx-auto ${i % 9 === 0 ? "h-4 w-0.5 bg-deep/60" : "h-2 w-px bg-deep/25"}`}
              />
            </div>
          ))}
          {["N", "E", "S", "W"].map((label, i) => (
            <span
              key={label}
              className="absolute left-1/2 top-5 -translate-x-1/2 text-xs font-semibold text-deep/70 origin-[50%_115px]"
              style={{ transform: `rotate(${i * 90}deg)` }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {style === "dial" && (
        <div
          className="absolute inset-0 rounded-full transition-transform duration-300"
          style={{
            transform: `rotate(${rotation}deg)`,
            background:
              "var(--dial-fill)",
            boxShadow: "var(--dial-shadow)",
          }}
        >
          <div className="absolute inset-6 rounded-full bg-panel/70 backdrop-blur-md border border-hairline" />
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-8 -translate-x-1/2 text-[10px] font-semibold text-deep/60 origin-[50%_104px] tabular-nums"
              style={{ transform: `rotate(${i * 30}deg)` }}
            >
              {i * 30}
            </span>
          ))}
        </div>
      )}

      {style === "needle" && (
        <div
          className="absolute inset-6 rounded-full border border-dashed border-deep/20 transition-transform duration-300"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <span className="absolute left-1/2 -top-5 -translate-x-1/2 text-xs font-semibold text-deep/50">
            N
          </span>
        </div>
      )}

      {/* qibla pointer */}
      <div
        className="absolute inset-0 transition-transform duration-300"
        style={{ transform: `rotate(${relative}deg)` }}
      >
        <div className="absolute left-1/2 top-3 -translate-x-1/2 flex flex-col items-center">
          <span className="text-2xl">🕋</span>
          <div
            className={`w-0.5 h-[100px] ${aligned ? "bg-brand" : "bg-gold"} transition-colors`}
          />
        </div>
      </div>

      <div
        className={`relative z-10 w-24 h-24 rounded-full grid place-items-center text-center ${
          aligned ? "bg-brand text-primary-foreground" : "bg-panel/85 text-deep"
        } border border-hairline shadow-lg transition-colors`}
      >
        <div>
          <p className="text-lg font-semibold font-display tabular-nums">
            {Math.round(relative)}°
          </p>
          <p className="text-[10px] uppercase tracking-widest opacity-70">
            {aligned ? "aligned" : "to qibla"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ArView({
  relative,
  aligned,
  listening,
}: {
  relative: number;
  aligned: boolean;
  listening: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (!active) return;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          void videoRef.current.play();
        }
      })
      .catch(() => setError("Camera access was refused, so the AR view cannot open."));
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [active]);

  if (!active) {
    return (
      <div className="text-center max-w-xs">
        <span className="text-3xl">📷</span>
        <p className="mt-3 text-sm text-deep/60">
          The AR view puts a Kaʿbah marker over your camera feed. It needs camera access and the
          device compass.
        </p>
        <button
          onClick={() => setActive(true)}
          className="mt-4 bg-brand text-primary-foreground text-sm font-semibold px-4 py-3 rounded-2xl shadow-lg shadow-brand/25 hover:bg-deep transition"
        >
          Open AR view
        </button>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  const offset = relative > 180 ? relative - 360 : relative;
  const withinView = Math.abs(offset) < 45;

  return (
    <div className="relative w-full aspect-[3/4] sm:aspect-video rounded-2xl overflow-hidden bg-overlay">
      <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0">
        {withinView ? (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-center transition-all duration-200"
            style={{ left: `${50 + (offset / 45) * 45}%` }}
          >
            <span className="text-5xl drop-shadow-lg">🕋</span>
            <p
              className={`mt-1 text-xs font-semibold px-2 py-1 rounded-full ${
                aligned ? "bg-brand text-primary-foreground" : "bg-panel/80 text-deep"
              }`}
            >
              {aligned ? "Facing the Kaʿbah" : `${Math.round(Math.abs(offset))}° off`}
            </p>
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-6 text-center">
            <p className="inline-block bg-panel/85 text-deep text-sm font-semibold px-4 py-2 rounded-full">
              Turn {offset > 0 ? "right →" : "← left"}{" "}
              {Math.round(Math.abs(offset))}°
            </p>
          </div>
        )}
        {!listening && (
          <p className="absolute top-4 inset-x-4 text-center text-xs text-on-overlay/90 bg-overlay/60 rounded-full py-2">
            Enable the device compass for the marker to follow your movement.
          </p>
        )}
      </div>
    </div>
  );
}
