// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";
import type { Plugin } from "vite";

/**
 * VitePWA emits sw.js and workbox-*.js at the root of the Vite outDir.
 * TanStack Start/Nitro serves static assets from dist/client, so we copy
 * the generated service worker files into the public client folder after
 * the client bundle is written.
 */
function copyServiceWorkerToClient(): Plugin {
  return {
    name: "copy-sw-to-client",
    enforce: "post",
    apply: "build",
    async writeBundle(options) {
      if (!options.dir) return;

      const path = await import("node:path");
      const target = path.resolve("dist/client");
      if (path.resolve(options.dir) !== target) return;

      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const root = process.cwd();
      const srcDir = path.join(root, "dist");
      const destDir = path.join(root, "dist", "client");

      const entries = await fs.readdir(srcDir);
      for (const entry of entries) {
        if (entry === "sw.js" || entry.startsWith("workbox-")) {
          await fs.copyFile(path.join(srcDir, entry), path.join(destDir, entry));
        }
      }
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null,
        devOptions: { enabled: false },
        manifest: {
          name: "Luna — Ciclo & Bem-estar",
          short_name: "Luna",
          description: "Acompanhe seu ciclo menstrual com elegância, privacidade e insights diários.",
          start_url: "/",
          display: "standalone",
          background_color: "#faf7f2",
          theme_color: "#faf7f2",
          orientation: "portrait",
          lang: "pt-BR",
          icons: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf}"],
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/\~oauth/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
          ],
        },
      }),
      copyServiceWorkerToClient(),
    ],
  },
});
