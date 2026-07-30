let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

type Tone = { f: number; d: number; t?: OscillatorType; delay?: number };

function playTones(tones: Tone[], enabled: boolean) {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  tones.forEach((tone) => {
    const start = now + (tone.delay ?? 0);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = tone.t ?? 'sine';
    osc.frequency.setValueAtTime(tone.f, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.d);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + tone.d);
  });
}

function haptic(pattern: number | number[]) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}

export const sfx = {
  tap: (on: boolean) => {
    playTones([{ f: 880, d: 0.06, t: 'sine' }], on);
    haptic(8);
  },
  flip: (on: boolean) => {
    playTones([{ f: 660, d: 0.08, t: 'triangle' }], on);
    haptic(12);
  },
  correct: (on: boolean) => {
    playTones(
      [
        { f: 660, d: 0.1, t: 'sine' },
        { f: 880, d: 0.12, t: 'sine', delay: 0.1 },
        { f: 1320, d: 0.16, t: 'sine', delay: 0.22 },
      ],
      on
    );
    haptic([10, 30, 10]);
  },
  wrong: (on: boolean) => {
    playTones(
      [
        { f: 300, d: 0.12, t: 'sawtooth' },
        { f: 200, d: 0.16, t: 'sawtooth', delay: 0.12 },
      ],
      on
    );
    haptic([20, 40, 20]);
  },
  complete: (on: boolean) => {
    playTones(
      [
        { f: 523, d: 0.12, t: 'sine' },
        { f: 659, d: 0.12, t: 'sine', delay: 0.12 },
        { f: 784, d: 0.12, t: 'sine', delay: 0.24 },
        { f: 1047, d: 0.2, t: 'sine', delay: 0.36 },
      ],
      on
    );
    haptic([15, 50, 15, 50, 30]);
  },
  streak: (on: boolean) => {
    playTones(
      [
        { f: 784, d: 0.08, t: 'square' },
        { f: 1047, d: 0.12, t: 'square', delay: 0.08 },
      ],
      on
    );
    haptic([10, 30, 20]);
  },
  whoosh: (on: boolean) => {
    if (!on) return;
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.2);
    haptic(8);
  },
};
