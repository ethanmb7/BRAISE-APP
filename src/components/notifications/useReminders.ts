import { useCallback } from "react";
import { getDelivery, type Permission } from "@/lib/notifications/delivery";
import { notifStore, setPrefs } from "@/lib/notifications/store";
import type { NotifPrefs } from "@/lib/notifications/model";

/** Turning Braise's reminders on and off. Turning them on saves the student's choices first, so the
 *  choice is kept even where the phone cannot show a notification yet (the web), then asks the system
 *  for permission, once, now that the student has said yes. */
export function useReminders() {
  const enable = useCallback(async (prefs: NotifPrefs): Promise<Permission> => {
    notifStore.update((s) => setPrefs(s, { ...prefs, enabled: true }));
    const delivery = getDelivery();
    const current = await delivery.permission();
    return current === "default" ? delivery.request() : current;
  }, []);

  const disable = useCallback(() => {
    notifStore.update((s) => setPrefs(s, { ...s.prefs, enabled: false }));
  }, []);

  return { enable, disable };
}

/** What to tell the student about whether a reminder can reach them. */
export function permissionLine(p: Permission, nativeKind: "native" | "web" | "none"): string {
  if (nativeKind === "native") {
    return p === "granted"
      ? "Braise te préviendra à ton moment."
      : "Autorise les notifications dans les réglages du téléphone pour que Braise puisse passer.";
  }
  return "Les rappels arrivent avec l'appli sur téléphone. J'ai noté ton moment : il sera prêt.";
}
