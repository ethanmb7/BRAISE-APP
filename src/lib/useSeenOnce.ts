import { useCallback, useState } from "react";

/** A thing shown to the student once, then never again: a tip, an explanation. The flag lives in this
 *  device's storage; if storage is unavailable the tip is simply not shown (never nagged). */
export function useSeenOnce(key: string): { show: boolean; dismiss: () => void } {
  const [seen, setSeen] = useState(() => {
    try {
      return localStorage.getItem(key) === "1";
    } catch {
      return true;
    }
  });
  const dismiss = useCallback(() => {
    setSeen(true);
    try {
      localStorage.setItem(key, "1");
    } catch {
      /* the tip may come back next time; harmless */
    }
  }, [key]);
  return { show: !seen, dismiss };
}
