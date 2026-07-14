const SW_PATH = "/sw.js";

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export function registerPWA() {
  if (typeof window === "undefined") return;
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;
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

  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register(SW_PATH, { scope: "/" })
      .then((registration) => {
        console.log("[PWA] Service worker registered:", SW_PATH);

        const hasController = !!navigator.serviceWorker.controller;

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          if (!hasController) return;
          refreshing = true;
          window.location.reload();
        });

        // Proactively check for updates on startup
        registration.update().catch(() => {});

        // Check for updates every hour
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);

        return registration;
      })
      .catch((error) => {
        console.error("[PWA] Service worker registration failed:", error);
        registrationPromise = null;
        return null;
      });
  }

  return registrationPromise;
}

function unregisterAppSW() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      registrations.forEach((registration) => {
        if (registration.scope.includes(location.origin)) {
          registration.unregister();
        }
      });
    })
    .catch((error) => {
      console.error("[PWA] Failed to unregister service worker:", error);
    });
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari standalone flag
    window.navigator.standalone === true
  );
}
