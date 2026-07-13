export const lunaPwaManifest = {
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
} as const;
