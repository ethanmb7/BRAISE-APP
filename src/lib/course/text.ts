import { toned } from "@/lib/tone";
import type { Personality } from "@/types";
import type { Text } from "./types";

/** The text for the student's tone: a plain string serves both, the object form can carry a Savage
 *  version (same mechanism as `@savage` lines in the older .txt Déclics). */
export function resolveText(text: Text, personality: Personality): string {
  return typeof text === "string" ? text : toned(text.text, text.variants, personality);
}
