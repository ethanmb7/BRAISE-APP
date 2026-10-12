// Starting from scratch on a device: erases everything the app keeps on it (progress, cards, courses,
// reminders, first-run flags, the demo and what it set aside). Meant for lending a phone to the next
// student of a test, or for a student who wants to begin again. Only keys the app owns are touched,
// and the device's own identity is kept: it says which device this is, not who is using it.
export const RESET_PREFIXES = ["sapie_", "braise_"] as const;
const KEPT_KEYS: readonly string[] = ["sapie_device_id", "sapie_device_secret"];

type EnumerableStore = Pick<Storage, "removeItem" | "key" | "length">;

/** Erases the app's data; returns how many keys went. */
export function resetEverything(storage: EnumerableStore = localStorage): number {
  const doomed: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && RESET_PREFIXES.some((p) => key.startsWith(p)) && !KEPT_KEYS.includes(key)) {
      doomed.push(key);
    }
  }
  for (const key of doomed) storage.removeItem(key);
  return doomed.length;
}

/** `?reset` in the address asks for a fresh start. */
export function resetRequest(search: string): boolean {
  return new URLSearchParams(search).has("reset");
}
