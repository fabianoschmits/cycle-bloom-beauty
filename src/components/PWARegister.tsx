import { useEffect } from "react";
import { registerPWA } from "@/lib/pwa-register";

export function PWARegister() {
  useEffect(() => {
    registerPWA();
  }, []);

  return null;
}
