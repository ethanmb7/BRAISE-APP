// TEMPORARY: lets the suggestion card at the bottom of a subject be compared in four designs while one is
// being chosen. "a" is the one that exists today. Switch with
//   localStorage.setItem("braise_dock", "b"); window.dispatchEvent(new Event("braise-dock"));
// Delete this file, and the variants that lose, once a design is picked.
import { useSyncExternalStore } from "react";

export type DockVariant = "a" | "b" | "c" | "d" | "e";
const KEY = "braise_dock";
const EVENT = "braise-dock";

function read(): DockVariant {
  try {
    const v = localStorage.getItem(KEY);
    return v === "b" || v === "c" || v === "d" || v === "e" ? v : "a";
  } catch {
    return "a";
  }
}

export function useDockVariant(): DockVariant {
  return useSyncExternalStore(
    (notify) => {
      window.addEventListener(EVENT, notify);
      return () => window.removeEventListener(EVENT, notify);
    },
    read,
    () => "a",
  );
}
