// Le bouton « retour » d'Android, sans faire entrer Capacitor dans le build web.
//
// Dans une coque native, ce bouton est le geste le plus utilisé du téléphone. Sans rien, il
// referme l'app depuis n'importe quel écran — y compris au milieu d'un Déclic. L'app ne peut pas
// écouter l'évènement elle-même sans importer Capacitor partout ; elle dépose donc ici ce qu'il
// faut faire, et c'est le point d'entrée natif (src/native/main.tsx) qui branche la vraie touche.
// Sur le web, personne ne lit ce registre : il ne coûte rien.

/** Rend `true` si le retour a été absorbé par l'app, `false` s'il doit fermer l'app. */
export type BackHandler = () => boolean;

let handler: BackHandler | null = null;

/** Pose le gestionnaire courant. Rend la fonction qui le retire (à rendre depuis un useEffect). */
export function registerBackHandler(fn: BackHandler): () => void {
  handler = fn;
  return () => {
    if (handler === fn) handler = null;
  };
}

/** Appelé par la coque native à chaque appui sur le bouton retour. */
export function handleNativeBack(): boolean {
  return handler ? handler() : false;
}
