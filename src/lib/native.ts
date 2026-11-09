/**
 * Bridge to the Shareek Android app.
 *
 * The APK (see /android) hosts this site in a WebView and exposes a
 * `ShareekNative` object. In an ordinary browser that object does not exist,
 * so every helper here degrades to a harmless no-op.
 */

export interface InstalledApp {
  pkg: string;
  label: string;
}

export interface NativeStatus {
  /** The "Pray First" accessibility service is switched on in Android settings. */
  accessibilityEnabled: boolean;
  notificationsAllowed: boolean;
  /** Apps are being blocked right now (prayer window or a test window). */
  blockingNow: boolean;
  /** An adhan recording was bundled in the APK (res/raw/adhan.*). */
  adhanFile: boolean;
}

interface NativeBridge {
  getInstalledApps(): string;
  getAppIcon(pkg: string): string;
  getStatus(): string;
  saveConfig(json: string): void;
  saveSchedule(json: string): void;
  openAccessibilitySettings(): void;
  requestNotificationPermission(): void;
  openBatterySettings(): void;
  startTestWindow(minutes: number): void;
  testAdhan(): void;
  stopAdhan(): void;
}

declare global {
  interface Window {
    ShareekNative?: NativeBridge;
  }
}

export function isNative(): boolean {
  return typeof window !== "undefined" && typeof window.ShareekNative !== "undefined";
}

/** Runs a bridge call; any failure on the Android side becomes a harmless fallback. */
function safe<T>(call: (bridge: NativeBridge) => T, fallback: T): T {
  try {
    const bridge = window.ShareekNative;
    if (!bridge) return fallback;
    return call(bridge);
  } catch {
    return fallback;
  }
}

function parse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getInstalledApps(): InstalledApp[] {
  return parse<InstalledApp[]>(safe((b) => b.getInstalledApps(), ""), []);
}

export function getNativeStatus(): NativeStatus | null {
  return parse<NativeStatus | null>(safe((b) => b.getStatus(), ""), null);
}

/** Small PNG data URL for an app's launcher icon, or "" if unavailable. */
export function getAppIcon(pkg: string): string {
  return safe((b) => b.getAppIcon(pkg), "");
}

export function nativeSaveConfig(json: string): void {
  safe((b) => b.saveConfig(json), undefined);
}

export function nativeSaveSchedule(json: string): void {
  safe((b) => b.saveSchedule(json), undefined);
}

export function nativeOpenAccessibilitySettings(): void {
  safe((b) => b.openAccessibilitySettings(), undefined);
}

export function nativeRequestNotifications(): void {
  safe((b) => b.requestNotificationPermission(), undefined);
}

export function nativeOpenBatterySettings(): void {
  safe((b) => b.openBatterySettings(), undefined);
}

export function nativeStartTestWindow(minutes: number): void {
  safe((b) => b.startTestWindow(minutes), undefined);
}

export function nativeTestAdhan(): void {
  safe((b) => b.testAdhan(), undefined);
}

export function nativeStopAdhan(): void {
  safe((b) => b.stopAdhan(), undefined);
}
