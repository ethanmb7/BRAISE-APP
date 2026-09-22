import { useEffect, useRef, useState } from 'react';

// Counts a displayed number up to its target over `duration`ms using a single rAF loop — cheap,
// touches nothing but a text node, cancels cleanly on unmount or if the target changes mid-flight.
// Every reward number on Aura and Profil uses this so a change reads as a small win instead of a
// silent text swap.
export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  useEffect(() => {
    const from = valueRef.current;
    if (from === target) return;
    let rafId: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (target - from) * eased);
      valueRef.current = next;
      setValue(next);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return value;
}
