import { useEffect } from "react";
import { registerPWA } from "@/lib/pwa-register";

export function useRegisterPWA() {
  useEffect(() => {
    // Anchor side-effect so the hook is not tree-shaken in production bundles.
    document.documentElement.dataset.pwa = "ready";
    registerPWA();
  }, []);
}
