// Les rappels de Braise, pour de vrai : programmés sur le téléphone, sans serveur.
//
// C'est l'implémentation que lib/notifications/delivery.ts attendait depuis le début (son
// commentaire le dit : « The native implementation is NOT written or tested yet: it needs the
// native shell »). Tout le reste — quand envoyer, combien, avec quels mots, quand se taire —
// existe déjà dans lib/notifications et ne change pas d'une ligne : ce fichier ne décide rien,
// il transmet.
import { LocalNotifications } from "@capacitor/local-notifications";
import type { Delivery, Permission } from "@/lib/notifications/delivery";

/** Capacitor identifie une notification par un entier ; nos plans utilisent une chaîne stable.
 *  FNV-1a 32 bits : même chaîne, même entier, à chaque replanification — c'est ce qui permet de
 *  remplacer un rappel au lieu d'en empiler un deuxième. */
function numericId(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Android n'accepte pas 0, et reste dans les entiers 32 bits signés.
  return ((h >>> 0) % 2147483646) + 1;
}

function toPermission(display: string): Permission {
  if (display === "granted") return "granted";
  if (display === "denied") return "denied";
  return "default";
}

export const nativeDelivery: Delivery = {
  kind: "native",

  async permission() {
    try {
      return toPermission((await LocalNotifications.checkPermissions()).display);
    } catch {
      return "unsupported";
    }
  },

  async request() {
    try {
      return toPermission((await LocalNotifications.requestPermissions()).display);
    } catch {
      return "denied";
    }
  },

  async schedule(plan) {
    // Le plan peut contenir un créneau déjà passé (il est recalculé à chaque ouverture) : le
    // programmer ferait sonner le téléphone tout de suite, au moment où l'élève est DANS l'app.
    const now = Date.now();
    const future = plan.filter((p) => p.at > now + 1000);
    if (future.length === 0) return true;
    try {
      await LocalNotifications.schedule({
        notifications: future.map((p) => ({
          id: numericId(p.id),
          title: p.title,
          body: p.body,
          // Pas de `allowWhileIdle` : ça demande à Android une alarme EXACTE, c'est-à-dire la
          // permission « Alarmes et rappels » à réclamer à l'élève, et une justification côté
          // Play réservée aux réveils et aux agendas. Un rappel de révision qui arrive avec
          // quelques minutes de retard reste un bon rappel — et fait moins sonnerie.
          schedule: { at: new Date(p.at) },
          // L'écran visé voyage avec la notification : de quoi ouvrir l'app au bon endroit le
          // jour où on branchera l'appui (rien ne le lit encore).
          extra: { target: p.target, kind: p.kind },
        })),
      });
      return true;
    } catch {
      return false;
    }
  },

  async cancelAll() {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) await LocalNotifications.cancel(pending);
    } catch {
      // Rien à annuler, ou permission retirée entre-temps : le plan suivant repartira de zéro.
    }
  },

  async showNow(title, body) {
    try {
      if ((await nativeDelivery.permission()) !== "granted") return false;
      // Sans `schedule`, la notification part immédiatement — c'est l'aperçu que l'élève
      // demande depuis les réglages pour savoir à quoi ça ressemble.
      await LocalNotifications.schedule({
        notifications: [{ id: numericId("braise-apercu"), title, body }],
      });
      return true;
    } catch {
      return false;
    }
  },
};
