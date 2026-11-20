import type { CapacitorConfig } from "@capacitor/cli";

// La coque native (iOS / Android) autour du même BRAISE. Elle n'ajoute pas d'écran : elle apporte
// les trois choses qu'un site ne peut pas faire — les rappels programmés sur le téléphone, une
// icône sur l'écran d'accueil, et le fonctionnement hors-ligne complet.
//
// `appId` est l'identifiant permanent de l'app dans les deux stores : il ne peut plus changer
// après la première publication. Choisi sur un domaine que le projet possède déjà (mearim.fr),
// à relire avant le premier envoi.
const config: CapacitorConfig = {
  appId: "fr.mearim.braise",
  appName: "BRAISE",
  // Le dossier produit par `npm run build:native` (vite.native.config.ts), pas `.output` :
  // celui-là contient un serveur, et une app embarquée n'en a pas.
  webDir: "dist-native",
  ios: {
    // Le CSS de BRAISE gère lui-même les encoches via env(safe-area-inset-*) ; laisser iOS
    // ajouter ses propres marges par-dessus décalerait tout vers le bas.
    contentInset: "never",
    backgroundColor: "#fdf7ef",
  },
  android: {
    backgroundColor: "#fdf7ef",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: "#ff4500",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    LocalNotifications: {
      // Android impose une icône monochrome pour la barre d'état ; la couleur donne la teinte.
      smallIcon: "ic_stat_braise",
      iconColor: "#ff4500",
    },
  },
};

export default config;
