let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** One note: pitch (Hz), length (s), waveform, start offset (s) and loudness (default 0.18). */
export type Tone = { f: number; d: number; t?: OscillatorType; delay?: number; v?: number };

/** A cue is what the student hears and what the phone does, told together: they say the same thing. */
export type Cue = { tones: Tone[]; haptic: number | number[] };

/** Every sound of the app, and the buzz that goes with it (see "Son et vibration" in DESIGN_RULES.md).
 *  A table, not scattered code, so the rules in sound.test.ts can look at all of them. */
export const CUES = {
  tap: { tones: [{ f: 880, d: 0.06 }], haptic: 8 },
  flip: { tones: [{ f: 660, d: 0.08, t: "triangle" }], haptic: 12 },
  // The answer expected. Two kinds of "not quite" exist on purpose: `wrong` is a verdict (a Réviser
  // card swiped the wrong way, a graded quiz), `soft` is a conversation (a Déclic: Braise reacts to
  // what you picked, she never buzzes at you).
  correct: {
    tones: [
      { f: 660, d: 0.1 },
      { f: 880, d: 0.12, delay: 0.1 },
      { f: 1320, d: 0.16, delay: 0.22 },
    ],
    haptic: [10, 30, 10],
  },
  wrong: {
    tones: [
      { f: 300, d: 0.12, t: "sawtooth" },
      { f: 200, d: 0.16, t: "sawtooth", delay: 0.12 },
    ],
    haptic: [20, 40, 20],
  },
  soft: {
    tones: [
      { f: 440, d: 0.1, v: 0.12 },
      { f: 349, d: 0.18, delay: 0.09, v: 0.1 },
    ],
    haptic: 12,
  },
  // The idea gets its name (the "Déclic" card's setup): a small rising pair, quieter than a chime.
  reveal: {
    tones: [
      { f: 784, d: 0.09, v: 0.12 },
      { f: 1175, d: 0.18, delay: 0.08, v: 0.12 },
    ],
    haptic: 14,
  },
  // The signature of the app: a mechanical click (the "déclic" itself), then a warm rise and a
  // shimmer. Nothing else in BRAISE sounds like it, so it always means "you got it".
  declic: {
    tones: [
      { f: 1900, d: 0.02, t: "square", v: 0.07 },
      { f: 523, d: 0.12, delay: 0.05 },
      { f: 659, d: 0.12, delay: 0.17 },
      { f: 784, d: 0.12, delay: 0.29 },
      { f: 1047, d: 0.22, delay: 0.41 },
      { f: 1568, d: 0.3, delay: 0.5, v: 0.06 },
    ],
    haptic: [16, 50, 10, 50, 26],
  },
  // A small sparkle when points land.
  xp: {
    tones: [
      { f: 1319, d: 0.06, v: 0.1 },
      { f: 1760, d: 0.1, delay: 0.07, v: 0.1 },
    ],
    haptic: 6,
  },
  complete: {
    tones: [
      { f: 523, d: 0.12 },
      { f: 659, d: 0.12, delay: 0.12 },
      { f: 784, d: 0.12, delay: 0.24 },
      { f: 1047, d: 0.2, delay: 0.36 },
    ],
    haptic: [15, 50, 15, 50, 30],
  },
  rankCharge: {
    tones: [
      { f: 196, d: 0.12, t: "triangle" },
      { f: 262, d: 0.12, t: "triangle", delay: 0.2 },
      { f: 392, d: 0.16, t: "triangle", delay: 0.4 },
    ],
    haptic: [10, 180, 14, 180, 20],
  },
  rankImpact: {
    tones: [
      { f: 110, d: 0.12, t: "square" },
      { f: 784, d: 0.18, delay: 0.04 },
      { f: 1175, d: 0.2, delay: 0.1 },
    ],
    haptic: [24, 28, 48],
  },
  rankReveal: {
    tones: [
      { f: 523, d: 0.16 },
      { f: 659, d: 0.18, delay: 0.1 },
      { f: 784, d: 0.24, delay: 0.2 },
    ],
    haptic: 18,
  },
  streak: {
    tones: [
      { f: 784, d: 0.08, t: "square" },
      { f: 1047, d: 0.12, t: "square", delay: 0.08 },
    ],
    haptic: [10, 30, 20],
  },
  // Follows the chest's own 6-beat choreography (HeroPiocheCard/BraiseChest): a low creak at the
  // anticipation squash, a sharp crack at the lid-pop, and a bright two-note "ding" at the
  // dépassement overshoot — three distinct transients, not one flat cue, so the sound reads the
  // same beats the animation does instead of just marking "something happened" once. The buzz
  // matches the same moments: a light tap, a pause, a slightly stronger pop, a longer pause, then
  // the "ding" pulse.
  chestOpen: {
    tones: [
      { f: 180, d: 0.06, t: "sawtooth" },
      { f: 520, d: 0.08, t: "square", delay: 0.12 },
      { f: 1046, d: 0.16, delay: 0.58 },
      { f: 1568, d: 0.14, delay: 0.6 },
    ],
    haptic: [10, 110, 14, 440, 18],
  },
  // Abbreviated pair for a repeat "pioche" open later the same day (see getLastPiocheOpenDate) —
  // the full ceremony is for the day's first draw; replaying it every time would just be noise by
  // the third or fourth open.
  chestOpenQuick: {
    tones: [
      { f: 480, d: 0.05, t: "square" },
      { f: 1200, d: 0.1, delay: 0.13 },
    ],
    haptic: [10, 70, 12],
  },
} satisfies Record<string, Cue>;

// The buzz is the student's to switch off ("Vibrations" in the settings), and it never runs when
// the phone itself asks for less motion. Sound has its own switch; the two are independent, so a
// student in class can keep the buzz and lose the sound, or the other way round.
let hapticsOn = true;

/** Told by the app shell: the student's switch, and the system's "reduce motion". */
export function setHaptics(on: boolean) {
  hapticsOn = on;
}

function playTones(tones: Tone[], enabled: boolean) {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  tones.forEach((tone) => {
    const start = now + (tone.delay ?? 0);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = tone.t ?? "sine";
    osc.frequency.setValueAtTime(tone.f, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(tone.v ?? 0.18, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.d);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + tone.d);
  });
}

function haptic(pattern: number | number[]) {
  if (!hapticsOn) return;
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}

const play = (cue: Cue, on: boolean) => {
  playTones(cue.tones, on);
  haptic(cue.haptic);
};

export const sfx = {
  tap: (on: boolean) => play(CUES.tap, on),
  flip: (on: boolean) => play(CUES.flip, on),
  correct: (on: boolean) => play(CUES.correct, on),
  wrong: (on: boolean) => play(CUES.wrong, on),
  soft: (on: boolean) => play(CUES.soft, on),
  reveal: (on: boolean) => play(CUES.reveal, on),
  declic: (on: boolean) => play(CUES.declic, on),
  xp: (on: boolean) => play(CUES.xp, on),
  complete: (on: boolean) => play(CUES.complete, on),
  rankCharge: (on: boolean) => play(CUES.rankCharge, on),
  rankImpact: (on: boolean) => play(CUES.rankImpact, on),
  rankReveal: (on: boolean) => play(CUES.rankReveal, on),
  streak: (on: boolean) => play(CUES.streak, on),
  chestOpen: (on: boolean) => play(CUES.chestOpen, on),
  chestOpenQuick: (on: boolean) => play(CUES.chestOpenQuick, on),
  whoosh: (on: boolean) => {
    if (!on) return;
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
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
