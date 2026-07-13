export type OS = "ios" | "android" | "windows" | "macos" | "linux" | "other";
export type Browser = "safari" | "chrome" | "edge" | "firefox" | "samsung" | "opera" | "other";

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS standalone property
    window.navigator.standalone === true
  );
}

export function detectOS(): OS {
  if (typeof window === "undefined") return "other";
  const ua = window.navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/windows nt/.test(ua)) return "windows";
  if (/macintosh|mac os x/.test(ua)) return "macos";
  if (/linux/.test(ua)) return "linux";
  return "other";
}

export function detectBrowser(): Browser {
  if (typeof window === "undefined") return "other";
  const ua = window.navigator.userAgent.toLowerCase();

  if (/samsungbrowser/.test(ua)) return "samsung";
  if (/edg/.test(ua)) return "edge";
  if (/opr|opera/.test(ua)) return "opera";
  if (/chrome/.test(ua) && /android/.test(ua)) return "chrome";
  if (/chrome/.test(ua) && !/edg/.test(ua) && !/opr|opera/.test(ua)) return "chrome";
  if (/safari/.test(ua) && /apple computer/.test(ua)) return "safari";
  if (/firefox/.test(ua)) return "firefox";
  if (/safari/.test(ua)) return "safari";
  return "other";
}

export function supportsBeforeInstallPrompt(): boolean {
  return typeof window !== "undefined" && "BeforeInstallPromptEvent" in window;
}

export interface InstallContext {
  os: OS;
  browser: Browser;
  isStandalone: boolean;
  canPrompt: boolean;
}

export function getInstallContext(): InstallContext {
  const os = detectOS();
  const browser = detectBrowser();
  const standalone = isStandalone();

  // beforeinstallprompt is mainly available on Android Chrome/Samsung and desktop Chrome/Edge.
  const canPrompt =
    supportsBeforeInstallPrompt() &&
    !standalone &&
    (browser === "chrome" || browser === "edge" || browser === "samsung");

  return { os, browser, isStandalone: standalone, canPrompt };
}
