import confetti from 'canvas-confetti';

const DOPAMINE_COLORS = ['#F97316', '#FFC24B', '#3B82F6', '#10B981'];

export function fireConfetti() {
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
