import confetti from "canvas-confetti";

const DOPAMINE_COLORS = ["#F97316", "#FFC24B", "#3B82F6", "#10B981"];

// "Réduire les animations" and the dyslexia mode stop every animation (DESIGN_RULES.md); confetti is
// a canvas, not a CSS animation, so it has to ask. The callers already skip it for the system's
// setting; the dyslexia mode is only known from the page.
function motionAllowed(): boolean {
  if (typeof document === "undefined") return false;
  if (document.querySelector(".dyslexia-mode")) return false;
  return !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function fireConfetti() {
  if (!motionAllowed()) return;
  confetti({
    particleCount: 90,
    spread: 72,
    startVelocity: 38,
    ticks: 200,
    origin: { y: 0.3 },
    colors: DOPAMINE_COLORS,
    zIndex: 9999,
  });
}

// A small burst from a point on screen (0–1 viewport fractions) — the per-card "you got it"
// micro-celebration, sized to punctuate a verdict rather than to end a session. `big` is the
// Super Braise version: same origin, twice the particles, a touch more spread.
export function fireMicroConfetti(x: number, y: number, big = false) {
  if (!motionAllowed()) return;
  confetti({
    particleCount: big ? 48 : 22,
    spread: big ? 70 : 52,
    startVelocity: big ? 32 : 24,
    gravity: 1.1,
    ticks: 120,
    scalar: 0.8,
    origin: { x, y },
    colors: DOPAMINE_COLORS,
    zIndex: 9999,
  });
}
