import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateSW } from "workbox-build";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, ".output/public");
const assetsDir = path.join(publicDir, "assets");

async function writeManifest() {
  const manifest = {
    name: "Luna — Ciclo & Bem-estar",
    short_name: "Luna",
    description: "Acompanhe seu ciclo menstrual com elegância, privacidade e insights diários.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#faf7f2",
    orientation: "portrait",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  await fs.writeFile(path.join(publicDir, "manifest.webmanifest"), JSON.stringify(manifest, null, 2), "utf8");
}

async function writeAppShell(indexJs: string, stylesCss: string) {
  const shell = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#faf7f2" />
  <meta name="description" content="Acompanhe seu ciclo menstrual com elegância, privacidade e insights diários." />
  <title>Luna — Ciclo & Bem-estar</title>
  <link rel="stylesheet" href="/assets/${stylesCss}" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</head>
<body>
  <script type="module" src="/assets/${indexJs}"></script>
</body>
</html>`;

  await fs.writeFile(path.join(publicDir, "app-shell.html"), shell, "utf8");
}

async function writeHeaders() {
  const headers = `/*
  cache-control: public, max-age=0, must-revalidate

/assets/*
  cache-control: public, max-age=31536000, immutable

/sw.js
  cache-control: public, max-age=0, must-revalidate

/workbox-*.js
  cache-control: public, max-age=0, must-revalidate
`;

  await fs.writeFile(path.join(publicDir, "_headers"), headers, "utf8");
}

async function main() {
  try {
    await fs.access(publicDir);
  } catch {
    console.error("[PWA] Missing .output/public — run vite build first.");
    process.exit(1);
  }

  const assets = await fs.readdir(assetsDir);
  const indexJs = assets.find((f) => /^index-.*\.js$/.test(f));
  const stylesCss = assets.find((f) => /^styles-.*\.css$/.test(f));

  if (!indexJs || !stylesCss) {
    console.error("[PWA] Could not find client bundles in", assetsDir);
    process.exit(1);
  }

  await writeManifest();
  await writeAppShell(indexJs, stylesCss);
  await writeHeaders();

  const { count, size, warnings } = await generateSW({
    swDest: path.join(publicDir, "sw.js"),
    globDirectory: publicDir,
    globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,webmanifest,woff2,ttf}"],
    globIgnores: ["**/server/**", "**/*.map", "sw.js", "workbox-*.js"],
    navigateFallback: "/app-shell.html",
    navigateFallbackDenylist: [/^\/api\//, /^\/assets\//, /^\/sw\.js$/, /^\/workbox-/, /\.[^/]+$/],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "luna-pages",
          networkTimeoutSeconds: 3,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
    ],
  });

  console.log(`[PWA] Service worker ready — precached ${count} files (${size} bytes)`);
  warnings.forEach((warning) => console.warn("[PWA]", warning));
}

main().catch((error) => {
  console.error("[PWA] Failed to generate service worker:", error);
  process.exit(1);
});
