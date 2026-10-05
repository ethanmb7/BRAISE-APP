import { useCallback } from "react";
import { useApp } from "@/store";
import { pickLine, toned, type Lines, type ToneVariants } from "@/lib/tone";
import type { Personality } from "@/types";

/** The student's tone, plus the two ways to turn a tone-aware line into text: `t` for a line from
 *  lib/copy.ts, `authored` for lesson text that may carry `@savage` overrides. */
export function useTone(): {
  personality: Personality;
  t: (lines: Lines) => string;
  authored: (base: string, variants?: ToneVariants) => string;
} {
  const { state } = useApp();
  const personality = state.user.personality;
  const t = useCallback((lines: Lines) => pickLine(personality, lines), [personality]);
  const authored = useCallback(
    (base: string, variants?: ToneVariants) => toned(base, variants, personality),
    [personality],
  );
  return { personality, t, authored };
}
