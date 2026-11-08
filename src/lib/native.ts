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

function parse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getInstalledApps(): InstalledApp[] {
  if (!window.ShareekNative) return [];
  return parse<InstalledApp[]>(window.ShareekNative.getInstalledApps(), []);
}

export function getNativeStatus(): NativeStatus | null {
  if (!window.ShareekNative) return null;
  return parse<NativeStatus | null>(window.ShareekNative.getStatus(), null);
}

export function nativeSaveConfig(json: string): void {
  window.ShareekNative?.saveConfig(json);
}

export function nativeSaveSchedule(json: string): void {
  window.ShareekNative?.saveSchedule(json);
}

export function nativeOpenAccessibilitySettings(): void {
  window.ShareekNative?.openAccessibilitySettings();
}

export function nativeRequestNotifications(): void {
  window.ShareekNative?.requestNotificationPermission();
}

export function nativeOpenBatterySettings(): void {
  window.ShareekNative?.openBatterySettings();
}

export function nativeStartTestWindow(minutes: number): void {
  window.ShareekNative?.startTestWindow(minutes);
}

export function nativeTestAdhan(): void {
  window.ShareekNative?.testAdhan();
}

export function nativeStopAdhan(): void {
  window.ShareekNative?.stopAdhan();
}
