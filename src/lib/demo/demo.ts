// The demo profile, switched on and off without ever losing the real one. Entering the demo first sets
// the student's own storage aside (every key the demo is about to touch, absent ones included); leaving
// puts it back exactly as it was. Opening the app with `?demo` enters, `?demo=off` leaves, and while it
// is on, Paramètres shows a button to leave. Nothing here talks to a server.
import { BACKUP_KEYS } from "@/lib/backup";
import { NOTIF_KEY } from "@/lib/notifications/store";
import { buildDemoData, REVISER_JOKER_KEY, REVISER_TUTORIAL_KEY } from "./profile";

export const DEMO_FLAG_KEY = "braise_demo";
export const DEMO_STASH_KEY = "braise_demo_stash";

/** Every key the demo may write or clear: the progress, plus the reminders and Réviser's first-run flags. */
export const DEMO_KEYS: readonly string[] = [
  ...BACKUP_KEYS,
  NOTIF_KEY,
  REVISER_TUTORIAL_KEY,
  REVISER_JOKER_KEY,
];

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function isDemo(storage: Store = localStorage): boolean {
  try {
    return storage.getItem(DEMO_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

/** Turns the demo on (or starts it over, if it is already on). The student's own data is set aside the
 *  first time only, so starting the demo over never overwrites it with demo data. */
export function enterDemo(storage: Store = localStorage, now: number = Date.now()): void {
  if (storage.getItem(DEMO_STASH_KEY) === null) {
    const stash: Record<string, string | null> = {};
    for (const key of DEMO_KEYS) stash[key] = storage.getItem(key);
    storage.setItem(DEMO_STASH_KEY, JSON.stringify(stash));
  }
  const data = buildDemoData(now);
  for (const key of DEMO_KEYS) {
    if (key in data) storage.setItem(key, data[key]);
    else storage.removeItem(key);
  }
  storage.setItem(DEMO_FLAG_KEY, "1");
}

/** Turns the demo off and gives the student back what they had (nothing, on a device that had nothing). */
export function leaveDemo(storage: Store = localStorage): void {
  let stash: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(storage.getItem(DEMO_STASH_KEY) ?? "{}");
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      stash = parsed as Record<string, unknown>;
    }
  } catch {
    /* an unreadable stash restores nothing: the demo data is still cleared below */
  }
  for (const key of DEMO_KEYS) {
    const value = stash[key];
    if (typeof value === "string") storage.setItem(key, value);
    else storage.removeItem(key);
  }
  storage.removeItem(DEMO_STASH_KEY);
  storage.removeItem(DEMO_FLAG_KEY);
}

export type DemoRequest = "enter" | "leave" | null;

/** What the address asks for: `?demo` or `?demo=1` enters, `?demo=off` (or 0, false, non) leaves. */
export function demoRequest(search: string): DemoRequest {
  const params = new URLSearchParams(search);
  if (!params.has("demo")) return null;
  const value = (params.get("demo") ?? "").trim().toLowerCase();
  return ["off", "0", "false", "non", "quitter"].includes(value) ? "leave" : "enter";
}

/** Acts on the address, once, at startup. Returns true if the stored data changed, so the caller reloads
 *  the page without `?demo` and every part of the app reads the new data from the start. */
export function applyDemoRequest(
  search: string,
  storage: Store = localStorage,
  now: number = Date.now(),
): boolean {
  const request = demoRequest(search);
  if (request === "enter") {
    enterDemo(storage, now);
    return true;
  }
  if (request === "leave" && isDemo(storage)) {
    leaveDemo(storage);
    return true;
  }
  return false;
}

/** The address without the `demo` parameter. */
export function withoutDemoParam(href: string): string {
  const url = new URL(href);
  url.searchParams.delete("demo");
  return url.pathname + (url.search || "") + url.hash;
}
