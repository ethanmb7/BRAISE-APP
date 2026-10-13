import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// How long "Braise réfléchit…" holds before her reply appears — long enough to read as a real pause,
// short enough to never feel like waiting on the app.
export const THINK_MS = 550;

/** True for a beat after the student commits to an answer (`key` turns from null to something), so
 *  Braise's reply lands like a reply and not like text that was already there. The tile itself
 *  answers at once (that is the tap's own feedback); only her words wait. Never under reduced
 *  motion. A new `key` starts a new beat; `null` ends it. */
export function useReplyBeat(key: string | null): boolean {
  const reducedMotion = useReducedMotion();
  const [over, setOver] = useState<string | null>(null);
  useEffect(() => {
    if (!key || reducedMotion) return;
    const timer = setTimeout(() => setOver(key), THINK_MS);
    return () => clearTimeout(timer);
  }, [key, reducedMotion]);
  return !!key && !reducedMotion && over !== key;
}
