// What the address can ask for when the app opens, before anything reads the stored data:
//   ?reset      erase everything on this device (see reset.ts)
//   ?demo       show the demo profile, ?demo=off to leave it (see demo/demo.ts)
// Both change the stored data, so the page is reloaded without the parameter and every part of the app
// then starts from the new data.
import { applyDemoRequest } from "@/lib/demo/demo";
import { resetEverything, resetRequest } from "@/lib/reset";

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;

const PARAMS = ["reset", "demo"] as const;

/** The address without the startup parameters. */
export function withoutStartupParams(href: string): string {
  const url = new URL(href);
  for (const name of PARAMS) url.searchParams.delete(name);
  return url.pathname + (url.search || "") + url.hash;
}

/** Acts on the address. Returns where to go next (the same address without the parameters) when the
 *  stored data was changed, or null when there is nothing to do. */
export function applyStartupRequests(
  href: string,
  storage: Store = localStorage,
  now: number = Date.now(),
): string | null {
  const search = new URL(href).search;
  let changed = false;
  if (resetRequest(search)) {
    resetEverything(storage);
    changed = true;
  }
  if (applyDemoRequest(search, storage, now)) changed = true;
  return changed ? withoutStartupParams(href) : null;
}
