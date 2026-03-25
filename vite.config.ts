import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["placeholder.svg", "robots.txt", "images/oficina-cover.png"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,webp}"],
      },
      manifest: {
        name: "OFICINA TL-BLU",
        short_name: "OFICINA-BLU",
        description: "Sistema de gestão de oficina - OFICINA TL-BLU",
        theme_color: "#00FF41",
        background_color: "#00050A",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/images/oficina-cover.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/images/oficina-cover.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
