type Listener = (totalMs: number) => void;

const listeners = new Set<Listener>();

/** Fired by HeroPiocheCard right as it starts its delayed navigation into the chapter — never
 *  called directly by a view-switch, so this stays a "Pioche opens a mission" moment and doesn't
 *  become a generic transition every navigation in the app has to think about. `totalMs` is the
 *  real chest-ceremony length (900ms first-open, 420ms same-day reopen — see HeroPiocheCard), so
 *  the veil's own fade timing always tracks the real ceremony instead of a hardcoded guess that
 *  could drift out of sync with it. */
export function firePiocheReveal(totalMs: number): void {
  listeners.forEach((fn) => fn(totalMs));
}

/** PiocheRevealVeil (mounted once in App.tsx, outside the view switch so it survives the swap)
 *  is the only real subscriber — a plain Set instead of React context because the veil has no
 *  other reason to sit inside AppProvider's tree, and a module-level event avoids threading a
 *  new prop through Screen/App just for one component to talk to another two levels away. */
export function onPiocheReveal(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Single source of truth for the veil's proportions, shared by HeroPiocheCard (which needs to
 *  know how long BEFORE navigation to actually fire the event, so the fade-in lands exactly on
 *  the cut) and PiocheRevealVeil (which needs the same split to build its own keyframes) — the
 *  two were previously at real risk of drifting out of sync if each guessed its own numbers.
 *  Proportional to the real ceremony length rather than fixed: a 420ms quick reopen gets a
 *  proportionally snappier veil than the 900ms first-open, instead of the same flash either way. */
export function getPiocheRevealTiming(totalMs: number) {
  const fadeInMs = Math.round(totalMs * 0.25);
  const holdMs = Math.min(40, Math.round(totalMs * 0.08));
  const fadeOutMs = Math.round(totalMs * 0.2);
  return { fadeInMs, holdMs, fadeOutMs, veilTotalMs: fadeInMs + holdMs + fadeOutMs };
}
