// BRAISE's tone system, in one place. The student picks a Braise at onboarding (and can change it
// in Moi): "Pote Chill" (soft, no pressure) or "Coach Savage" (direct, second degree, friendly
// jabs). This file is the mechanism; what each tone SAYS lives in lib/copy.ts (the app's own
// lines), lib/braiseVoice.ts (reactions that vary and are drawn at random) and, for lessons, in
// the optional `@savage` lines of src/content/declic/*.txt.
//
// What the tone applies to — Braise SPEAKING: bubbles, reactions, banners, closing lines, the
// nudge on the Home strip. What it never touches: facts and explanations (a fiche says the same
// thing in both tones), settings, errors, legal and accessibility text. A joke is welcome in a
// reaction and out of place in "Ta progression est enregistrée sur cet appareil".
import type { Personality } from "@/types";

/** One line, written once per tone. A `Record` on purpose: adding a tone to `Personality`
 *  makes every line that lacks it a compile error instead of a silent fallback. */
export type Lines = Record<Personality, string>;

/** Optional per-tone overrides for a piece of authored text. Missing tone = use the base text, so
 *  content can gain a Savage voice one line at a time instead of all at once. */
export type ToneVariants = Partial<Record<Personality, string>>;

export const DEFAULT_TONE: Personality = "chill";

/** The line for this tone. Tolerates an unknown value (a stale save, a future tone) like
 *  braiseVoice does, rather than crashing the screen it is on. */
export function pickLine(personality: Personality, lines: Lines): string {
  return lines[personality] ?? lines[DEFAULT_TONE];
}

/** Authored text with optional tone overrides: the override for this tone, else the base. */
export function toned(
  base: string,
  variants: ToneVariants | undefined,
  personality: Personality,
): string {
  return variants?.[personality] ?? base;
}
