import { useEffect } from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { registerPWA } from "@/lib/pwa-register";

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  useEffect(() => {
    // Anchor side-effect so the hook is not tree-shaken in production.
    document.documentElement.dataset.pwa = "ready";
    registerPWA();
  }, []);

  return <Outlet />;
}
