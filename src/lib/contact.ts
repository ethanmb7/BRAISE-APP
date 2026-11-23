// Comment un élève dit quelque chose à Braise, depuis l'app.
//
// Pendant le test, un testeur bloqué n'avait aucune sortie : ni bouton, ni adresse, rien. Les deux
// seules portes étaient de ne rien dire, ou d'écrire un avis public sur le store — la pire des
// deux. TestFlight apporte son propre bouton de retour (avec capture d'écran), mais rien
// d'équivalent n'existe côté Android ni une fois l'app publiée.
//
// Volontairement un simple `mailto:` : pas de serveur, pas de formulaire, rien à héberger, et le
// message part du compte de l'élève — il voit ce qu'il envoie, et à qui. Cohérent avec le reste de
// l'app, qui ne fait aucune requête sortante.
import { APP_VERSION } from "@/lib/appVersion";

/** L'adresse qui reçoit les retours. **Vide = le bouton n'existe pas** : mieux vaut pas de porte
 *  qu'une porte qui ne mène nulle part. À remplir avant d'envoyer l'app aux testeurs — c'est une
 *  adresse publique, visible par tous ceux qui ouvriront l'app, à choisir en conséquence. */
export const CONTACT_EMAIL = "";

/** Sur quel appareil tourne l'app, en un mot. Lu sur le global que pose la coque native, sans
 *  importer Capacitor : ce fichier est aussi compilé dans le build web, qui ne l'embarque pas. */
function platformName(): string {
  const cap = (globalThis as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  const name = cap?.getPlatform?.();
  return name && name !== "web" ? name : "web";
}

/** Le lien d'un message pré-rempli : une invitation à raconter, et la seule information technique
 *  qui aide vraiment à comprendre un bug. Rien du contenu de l'élève — ni prénom, ni progression,
 *  ni réponses : ce qu'il raconte, c'est lui qui l'écrit. */
export function feedbackMailto(): string {
  const subject = "BRAISE — un truc à dire";
  const body = [
    "Raconte ce qui s'est passé.",
    "Si c'est un bug : ce que tu faisais juste avant, c'est le plus utile.",
    "",
    "",
    "— — —",
    `BRAISE ${APP_VERSION} · ${platformName()}`,
  ].join("\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
