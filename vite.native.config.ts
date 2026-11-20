// Le build embarqué dans l'app iOS / Android. Volontairement séparé de vite.config.ts : celui-là
// est géré par la configuration Lovable (TanStack Start + nitro + Cloudflare) et sort un serveur,
// pas un dossier de fichiers. Capacitor, lui, a besoin d'un index.html et de ses assets, à ouvrir
// depuis le téléphone. Les deux builds lisent le même src/ ; rien n'est dupliqué sauf le point
// d'entrée (src/native/main.tsx).
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const dir = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  root: dir("./native"),
  // Chemins relatifs : la page est servie depuis capacitor://localhost (iOS) ou
  // https://localhost (Android), pas depuis la racine d'un domaine. Un "/assets/..." absolu
  // casserait au premier lancement.
  base: "./",
  publicDir: dir("./public"),
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": dir("./src") } },
  build: {
    outDir: dir("./dist-native"),
    emptyOutDir: true,
    target: "es2020",
  },
});
