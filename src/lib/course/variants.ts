// Which version of a question or of a validation is being played. A card carries its own content as
// the first version ("v1") and may carry others in `variants`; this module reads them uniformly, so
// the engine and the validator never special-case "a card with variants".
//
// Standalone on purpose, like validate.ts: only `import type`, so Node can run it with no build step.
import type { Choice, ChoiceCard, MultiStepCard, Step, Text, Visual } from "./types.ts";

/** The id of the version a card is written with; `variants` hold the others. */
export const BASE_VARIANT = "v1";

/** Every version of the card, base first. */
export function variantIds(card: ChoiceCard | MultiStepCard): string[] {
  return [BASE_VARIANT, ...(card.variants ?? []).map((v) => v.id)];
}

/** The version to play on turn `turn` (0 the first time): they take turns, so a second pass brings
 *  other numbers, and the cycle only repeats once every version has been seen. */
export function variantAtTurn(card: ChoiceCard | MultiStepCard, turn: number): string {
  const ids = variantIds(card);
  return ids[((turn % ids.length) + ids.length) % ids.length];
}

export type ChoiceContent = {
  variantId: string;
  text: Text;
  choices: Choice[];
  visual?: Visual;
};

/** What a choice card shows in the given version; an unknown id reads as the base version. A variant
 *  never inherits the base picture: other numbers need their own. */
export function choiceContent(card: ChoiceCard, variantId?: string): ChoiceContent {
  const variant = card.variants?.find((v) => v.id === variantId);
  if (variant) {
    return {
      variantId: variant.id,
      text: variant.text,
      choices: variant.choices,
      visual: variant.visual,
    };
  }
  return { variantId: BASE_VARIANT, text: card.text, choices: card.choices, visual: card.visual };
}

export type StepsContent = { variantId: string; text: Text; steps: Step[] };

/** The same for a validation card: the steps of the given version. The step at a given position
 *  tests the same objective in every version (the validator enforces the same number of steps), so
 *  a variant step that names no concept or example of its own takes those of the base step at its
 *  position, instead of each author repeating them. */
export function stepsContent(card: MultiStepCard, variantId?: string): StepsContent {
  const variant = card.variants?.find((v) => v.id === variantId);
  if (!variant) return { variantId: BASE_VARIANT, text: card.text, steps: card.steps };
  return {
    variantId: variant.id,
    text: variant.text ?? card.text,
    steps: variant.steps.map((s, i) => ({
      conceptId: card.steps[i]?.conceptId,
      remediation: card.steps[i]?.remediation,
      ...s,
    })),
  };
}

/** Every step of every version, to look one up by its id whichever version was played. */
export function allSteps(card: MultiStepCard): Step[] {
  return [...card.steps, ...(card.variants ?? []).flatMap((v) => stepsContent(card, v.id).steps)];
}
