import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateSW } from "workbox-build";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let publicDir = path.join(root, ".output/public");
let assetsDir = path.join(publicDir, "assets");

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
    const vercelDir = path.join(root, ".vercel/output/static");
    try {
      await fs.access(vercelDir);
      publicDir = vercelDir;
      assetsDir = path.join(publicDir, "assets");
    } catch {
      console.error("[PWA] Missing build output directory (.output/public or .vercel/output/static) — run build first.");
      process.exit(1);
    }
  }

  const assets = await fs.readdir(assetsDir);
  const indexJs = assets.find((f) => /^index-.*\.js$/.test(f));
  const stylesCss = assets.find((f) => /^styles-.*\.css$/.test(f));

  if (!indexJs || !stylesCss) {
    console.error("[PWA] Could not find client bundles in", assetsDir);
    process.exit(1);
  }

  await writeManifest();
  await writeHeaders();

  const { count, size, warnings } = await generateSW({
    swDest: path.join(publicDir, "sw.js"),
    globDirectory: publicDir,
    globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,webmanifest,woff2,ttf}"],
    globIgnores: ["**/server/**", "**/*.map", "sw.js", "workbox-*.js"],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "luna-pages",
          networkTimeoutSeconds: 10,
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
