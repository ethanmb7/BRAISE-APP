import { useEffect, useLayoutEffect } from "react";
import { deltaToReveal, scrollMemory } from "@/lib/world/scroll";

const container = () => document.querySelector<HTMLElement>(".app-content");

/** Gives a screen its own scroll position: it opens where the student left it (at the top the first
 *  time), and keeps it while they are away. A null key means "always open at the top". */
export function useScrollMemory(key: string | null, enabled = true): void {
  useLayoutEffect(() => {
    if (!enabled) return;
    const el = container();
    if (!el) return;
    el.scrollTop = key ? (scrollMemory.get(key) ?? 0) : 0;
    if (!key) return;
    const onScroll = () => scrollMemory.set(key, el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [key, enabled]);
}

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scrolls the thing matching `selector` into the band between the top bar and the pinned strip, when
 *  `trigger` changes (and is not null). Waits a frame so the strip has its final height. */
export function useReveal(trigger: string | null, selectorFor: (key: string) => string): void {
  useEffect(() => {
    if (!trigger) return;
    const frame = requestAnimationFrame(() => {
      const el = container();
      const target = el?.querySelector<HTMLElement>(selectorFor(trigger));
      if (!el || !target) return;
      const dock = el.querySelector<HTMLElement>(".dock");
      const top =
        document.querySelector<HTMLElement>(".topbar")?.getBoundingClientRect().bottom ?? 0;
      const bottom = dock ? dock.getBoundingClientRect().top : window.innerHeight;
      const delta = deltaToReveal(target.getBoundingClientRect(), { top, bottom });
      if (delta !== 0) el.scrollBy({ top: delta, behavior: reduced() ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
    // The selector builder is a stable lookup, not a reason to scroll again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
}
