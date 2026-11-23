// La version de BRAISE, écrite une fois.
//
// Elle vivait à quatre endroits qui ne se parlaient pas : le pied de page des Paramètres annonçait
// « v1.0 », les projets natifs aussi (la valeur par défaut de Capacitor), et la fiche des stores
// préparait « 0.1.0 ». Un testeur qui signale un bug cite la version qu'il lit à l'écran : si elle
// ne correspond à rien, le signalement ne vaut plus grand-chose.
//
// La vérité est ici ET dans package.json, android/app/build.gradle et le projet Xcode — les trois
// derniers ne peuvent pas lire ce fichier (ce sont des fichiers de build). appVersion.test.ts
// vérifie qu'ils disent tous la même chose, donc une version oubliée casse les tests au lieu de
// partir en production.
export const APP_VERSION = "0.1.0";
