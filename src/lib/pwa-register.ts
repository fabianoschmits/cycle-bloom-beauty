import { registerSW } from "virtual:pwa-register";

const SW_PATH = "/sw.js";

export function registerPWA() {
  if (typeof window === "undefined") return;
  if (!import.meta.env.PROD) return;
  if (window.parent !== window) return;

  const hostname = location.hostname;
  const isPreviewOrDev =
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev");

  const isKillSwitch = location.search.includes("sw=off");

  if (isPreviewOrDev || isKillSwitch) {
    unregisterAppSW();
    return;
  }

  registerSW({
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      console.log("[PWA] Service worker registered:", swUrl);
    },
    onRegisterError(error) {
      console.error("[PWA] Service worker registration failed:", error);
    },
  });
}

function unregisterAppSW() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      registrations.forEach((registration) => {
        const scope = registration.scope || "";
        if (scope.includes(location.origin) && scope.includes(SW_PATH)) {
          registration.unregister();
        }
      });
    })
    .catch((error) => {
      console.error("[PWA] Failed to unregister service worker:", error);
    });
}
