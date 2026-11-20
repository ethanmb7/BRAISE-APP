// Point d'entrée de l'app embarquée (iOS / Android), à côté du build web — jamais à sa place.
//
// Le web passe par TanStack Start : un serveur rend la page, puis le client prend la main. Une
// app dans un store n'a pas de serveur : elle ouvre un fichier depuis le téléphone, souvent sans
// réseau. Ce fichier est donc le démarrage le plus court possible — on monte <App /> et c'est
// tout. Il n'y a qu'une seule « page » dans BRAISE (src/routes/index.tsx monte déjà <App /> et
// rien d'autre, avec ssr: false), donc rien n'est perdu au passage : pas de routeur à embarquer,
// pas de rendu serveur à simuler.
//
// Les polices sont importées ici, pas chargées depuis Google Fonts comme sur le web : une app
// hors-ligne qui va chercher sa typo sur internet s'affiche en Times au premier lancement dans le
// métro. Elles pèsent quelques centaines de ko, embarqués une fois pour toutes.
// Sous-ensembles latin + latin-ext seulement. Baloo 2 est à l'origine une famille devanagari :
// tout importer embarquait 1,5 Mo d'alphabet que BRAISE n'affichera jamais. latin-ext porte les
// accents dont le français a besoin au-delà du latin de base (œ, ÿ, les capitales accentuées).
import "@fontsource/baloo-2/latin-400.css";
import "@fontsource/baloo-2/latin-ext-400.css";
import "@fontsource/baloo-2/latin-600.css";
import "@fontsource/baloo-2/latin-ext-600.css";
import "@fontsource/baloo-2/latin-700.css";
import "@fontsource/baloo-2/latin-ext-700.css";
import "@fontsource/baloo-2/latin-800.css";
import "@fontsource/baloo-2/latin-ext-800.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-ext-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-sans/latin-ext-600.css";
import "@fontsource/ibm-plex-sans/latin-700.css";
import "@fontsource/ibm-plex-sans/latin-ext-700.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "@fontsource/archivo-black/latin-400.css";
import "@fontsource/archivo-black/latin-ext-400.css";
import "@/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import App from "@/App";
import { setNativeDelivery } from "@/lib/notifications/delivery";
import { handleNativeBack } from "@/lib/nativeBack";
import { nativeDelivery } from "./notifications";

// Tout ce qui suit ne vaut que dans la coque : ouvert dans un navigateur (par exemple pendant le
// développement avec `npm run preview:native`), rien ne se branche et l'app reste celle du web.
if (Capacitor.isNativePlatform()) {
  // Les rappels deviennent réels : lib/notifications pilote, le téléphone exécute.
  setNativeDelivery(nativeDelivery);

  // Le bouton retour d'Android ferme l'app par défaut, depuis n'importe où. On lui donne d'abord
  // à manger l'écran courant (un Déclic, une matière, les réglages) ; il ne ferme l'app que
  // depuis un onglet racine, là où c'est le geste attendu.
  void CapacitorApp.addListener("backButton", ({ canGoBack }) => {
    if (handleNativeBack()) return;
    if (canGoBack) window.history.back();
    else void CapacitorApp.exitApp();
  });

  // La barre d'état suit le thème : texte sombre sur le crème de BRAISE.
  void StatusBar.setStyle({ style: Style.Light }).catch(() => {});
}

const root = document.getElementById("root");
if (!root) throw new Error("#root manquant dans native/index.html");

createRoot(root).render(
  <StrictMode>
    <div className="app-root">
      <App />
    </div>
  </StrictMode>,
);
