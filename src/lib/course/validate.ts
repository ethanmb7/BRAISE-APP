// Content integrity for the course service. It runs three ways, from the same code: as a CI step
// (`npm run course:check`, also before every build), inside the tests, and when the registry loads
// the content at runtime. A broken Déclic must be caught by one of them, never by a student.
//
// Standalone on purpose: only `import type` from sibling files (erased at runtime), so Node can run
// it directly with no build step, like scripts/check-declic-content.ts.
import { BASE_VARIANT } from "./variants.ts";
import type {
  CardDef,
  ChapterDef,
  Choice,
  CoverageLevel,
  DeclicDef,
  MultiStepCard,
  Remediation,
  ReviewDeckDef,
  Step,
  Text,
  Visual,
} from "./types.ts";

const BARE_FEEDBACK =
  /^\s*(?:🔥\s*)?(faux|bravo|incorrect|échec|raté|mauvaise réponse)\s*[.!]*\s*$/i;
const FORBIDDEN_WORDS = /échec/i;
const MIN_FEEDBACK_CHARS = 24;
// A picture is drawn in a few centimetres of a phone: past these it is unreadable, not just busy.
const MAX_LINE_TICKS = 60;
const MAX_GROUP_ITEMS = 40;

function textOf(t: Text): string {
  return typeof t === "string" ? t : t.text;
}

/** Everything wrong with a chapter, its Déclics and their decks. Empty = valid. */
export function validateChapter(
  chapter: ChapterDef,
  declics: DeclicDef[],
  decks: ReviewDeckDef[],
): string[] {
  const errors: string[] = [];
  const err = (where: string, msg: string) => errors.push(`${where}: ${msg}`);

  // --- chapter
  const mappingIds = new Set<string>();
  for (const m of chapter.mappings) {
    if (mappingIds.has(m.id)) err(chapter.id, `identifiant de mapping en double "${m.id}"`);
    mappingIds.add(m.id);
    if (!m.requirement.trim()) err(chapter.id, `le mapping "${m.id}" n'a pas d'exigence`);
  }
  const misconceptionIds = new Set<string>();
  for (const m of chapter.misconceptions) {
    if (misconceptionIds.has(m.id)) err(chapter.id, `conception en double "${m.id}"`);
    misconceptionIds.add(m.id);
  }
  const declicById = new Map(declics.map((d) => [d.id, d]));
  for (const id of chapter.declicIds) {
    if (!declicById.has(id)) err(chapter.id, `le Déclic "${id}" est listé mais introuvable`);
  }
  for (const d of declics) {
    if (!chapter.declicIds.includes(d.id)) err(d.id, `absent de la liste declicIds du chapitre`);
  }

  for (const d of declics) validateDeclic(d, chapter, decks, misconceptionIds, mappingIds, err);
  return errors;
}

function validateDeclic(
  d: DeclicDef,
  chapter: ChapterDef,
  decks: ReviewDeckDef[],
  misconceptionIds: Set<string>,
  mappingIds: Set<string>,
  err: (where: string, msg: string) => void,
) {
  const at = (cardId?: string) => (cardId ? `${d.id} › ${cardId}` : d.id);
  if (d.chapterId !== chapter.id) err(d.id, `chapterId "${d.chapterId}" ≠ "${chapter.id}"`);
  if (!d.version.trim()) err(d.id, "version manquante");
  if (!(d.targetDurationSec[0] > 0 && d.targetDurationSec[0] <= d.targetDurationSec[1])) {
    err(d.id, "durée cible incohérente");
  }
  if (!d.objective.trim()) err(d.id, "objectif élève manquant");
  if (d.coverage.length === 0) err(d.id, "aucune couverture du programme officiel");
  for (const c of d.coverage) {
    if (!mappingIds.has(c.mappingId)) err(d.id, `couvre un mapping inconnu "${c.mappingId}"`);
  }
  for (const id of d.misconceptionIds) {
    if (!misconceptionIds.has(id)) err(d.id, `conception inconnue "${id}"`);
  }

  // --- cards
  const cardIds = new Set<string>();
  let lastOrder = 0;
  for (const card of d.cards) {
    if (cardIds.has(card.id)) err(at(card.id), "identifiant de carte en double");
    cardIds.add(card.id);
    if (!card.id.startsWith(`${d.id}-`))
      err(at(card.id), `l'identifiant doit commencer par "${d.id}-"`);
    if (card.order <= lastOrder) err(at(card.id), "ordre non strictement croissant");
    lastOrder = card.order;
    validateCard(card, d, misconceptionIds, err, at);
  }
  if (d.cards.length === 0) err(d.id, "aucune carte");
  else if (d.cards[d.cards.length - 1].type !== "declic-summary") {
    err(d.id, "la dernière carte doit être le résumé Déclic (declic-summary)");
  }

  // --- assessment
  const a = d.assessment;
  const assessed = d.cards.find((c) => c.id === a.cardId);
  if (!assessed) err(d.id, `l'évaluation vise une carte inconnue "${a.cardId}"`);
  else if (assessed.type !== "multi-step-choice") {
    err(at(a.cardId), "la carte d'évaluation doit être de type multi-step-choice");
  } else {
    const maxScore = assessed.steps.length;
    if (a.understoodMinScore < 1 || a.understoodMinScore > maxScore) {
      err(d.id, `seuil de compréhension ${a.understoodMinScore} hors de 1..${maxScore}`);
    }
    // Every version of the validation is graded by the same rule, so each must be able to pass it.
    if (a.requireDiscriminatingStep) {
      for (const v of versionsOf(assessed)) {
        if (!v.steps.some((s) => s.discriminating)) {
          err(
            at(a.cardId),
            `la règle exige une étape discriminante mais aucune n'est marquée${v.id === BASE_VARIANT ? "" : ` (version "${v.id}")`}`,
          );
        }
      }
    }
    if (a.followUpCount < 0) err(d.id, "followUpCount négatif");
  }
  for (const m of [a.understoodMessage, a.needsReinforcementMessage]) {
    if (!m.trim()) err(d.id, "message d'évaluation vide");
    if (FORBIDDEN_WORDS.test(m))
      err(d.id, `le message d'évaluation emploie le mot "échec" : "${m}"`);
  }

  // --- mastery
  if (!(d.mastery.requiredDeferredSuccesses >= 1))
    err(d.id, "requiredDeferredSuccesses doit être ≥ 1");
  if (!(d.mastery.requiredCardRatio > 0 && d.mastery.requiredCardRatio <= 1)) {
    err(d.id, "requiredCardRatio doit être dans ]0, 1]");
  }

  // --- summary remediation targets
  for (const card of d.cards) {
    if (card.type !== "declic-summary") continue;
    for (const item of card.menu) {
      const r = item.remediation;
      if (!r) continue;
      const from = d.cards.find((c) => c.id === r.fromCardId);
      const to = d.cards.find((c) => c.id === r.toCardId);
      if (!from || !to) err(at(card.id), `la remédiation "${item.id}" vise une carte inconnue`);
      else if (from.order > to.order || to.order >= card.order) {
        err(
          at(card.id),
          `la remédiation "${item.id}" doit rejouer des cartes précédentes, dans l'ordre`,
        );
      }
    }
  }

  // --- deck
  const deck = decks.find((x) => x.id === d.deckId);
  if (!deck) {
    err(d.id, `deck "${d.deckId}" introuvable`);
    return;
  }
  if (deck.declicId !== d.id) err(deck.id, `declicId "${deck.declicId}" ≠ "${d.id}"`);
  if (deck.chapterId !== chapter.id)
    err(deck.id, `chapterId "${deck.chapterId}" ≠ "${chapter.id}"`);
  if (deck.cards.length === 0) err(deck.id, "deck vide");
  const reviewIds = new Set<string>();
  const concepts = new Set<string>();
  for (const c of deck.cards) {
    const where = `${deck.id} › ${c.id}`;
    if (reviewIds.has(c.id)) err(where, "identifiant en double");
    reviewIds.add(c.id);
    concepts.add(c.concept);
    if (!c.id.startsWith(`${deck.id}-`))
      err(where, `l'identifiant doit commencer par "${deck.id}-"`);
    if (!c.statement.trim()) err(where, "affirmation vide");
    if (!c.concept.trim()) err(where, "concept manquant");
    if (c.answer !== "carre" && c.answer !== "intox") err(where, `réponse "${c.answer}" invalide`);
    if (c.answer === "intox" && !c.correction?.trim()) {
      err(where, "une carte Intox doit porter la version vraie de l'affirmation (correction)");
    }
    if (c.misconceptionId && !misconceptionIds.has(c.misconceptionId)) {
      err(where, `conception inconnue "${c.misconceptionId}"`);
    }
    for (const [kind, text] of [
      ["correct", c.feedback.correct],
      ["incorrect", c.feedback.incorrect],
    ] as const) {
      checkFeedback(text, `${where} (feedback ${kind})`, err);
    }
  }
  // Every step of the validation points at a concept the deck can follow up on.
  if (assessed?.type === "multi-step-choice") {
    for (const s of versionsOf(assessed).flatMap((v) => v.steps)) {
      if (s.conceptId && !concepts.has(s.conceptId)) {
        err(at(assessed.id), `l'étape "${s.id}" vise le concept "${s.conceptId}", absent du deck`);
      }
    }
  }
}

function checkFeedback(t: Text, where: string, err: (where: string, msg: string) => void) {
  const text = textOf(t);
  if (BARE_FEEDBACK.test(text)) err(where, `feedback réduit à un mot ("${text.trim()}")`);
  else if (text.trim().length < MIN_FEEDBACK_CHARS) {
    err(where, `feedback trop court pour expliquer (${text.trim().length} caractères)`);
  }
}

function validateChoices(
  choices: Choice[],
  where: string,
  misconceptionIds: Set<string>,
  err: (where: string, msg: string) => void,
) {
  if (choices.length < 2) err(where, "une question a besoin d'au moins 2 choix");
  const ids = new Set<string>();
  let correct = 0;
  for (const c of choices) {
    if (ids.has(c.id)) err(where, `identifiant de choix en double "${c.id}"`);
    ids.add(c.id);
    if (!c.label.trim()) err(where, `le choix "${c.id}" n'a pas de libellé`);
    if (c.correct) correct++;
    if (c.misconceptionId && !misconceptionIds.has(c.misconceptionId)) {
      err(where, `le choix "${c.id}" vise une conception inconnue "${c.misconceptionId}"`);
    }
    checkFeedback(c.feedback, `${where} (choix ${c.id})`, err);
    checkVisual(c.visual, `${where} (choix ${c.id})`, err);
  }
  if (correct !== 1) err(where, `exactement une réponse attendue (trouvé ${correct})`);
}

/** The versions of a validation card: its own steps, then each variant's. */
function versionsOf(card: MultiStepCard): { id: string; steps: Step[] }[] {
  return [
    { id: BASE_VARIANT, steps: card.steps },
    ...(card.variants ?? []).map((v) => ({ id: v.id, steps: v.steps })),
  ];
}

function checkVisual(
  v: Visual | undefined,
  where: string,
  err: (where: string, msg: string) => void,
) {
  if (!v) return;
  if (!v.ariaLabel.trim()) err(where, "un visuel doit avoir un libellé pour les lecteurs d'écran");
  if (v.kind === "number-line") {
    const step = v.step ?? 1;
    if (!(v.min < v.max)) err(where, "droite graduée : min doit être inférieur à max");
    else if (!(step > 0)) err(where, "droite graduée : le pas doit être positif");
    else {
      if ((v.max - v.min) / step > MAX_LINE_TICKS)
        err(
          where,
          `droite graduée : plus de ${MAX_LINE_TICKS} graduations, illisible sur un téléphone`,
        );
      const inside = (n: number) => n >= v.min && n <= v.max;
      if ((v.points ?? []).some((p) => !inside(p.value)))
        err(where, "droite graduée : un point est hors de la droite");
      if ((v.marks ?? []).some((m) => !inside(m)))
        err(where, "droite graduée : une marque est hors de la droite");
      if (v.bound !== undefined && !inside(v.bound))
        err(where, "droite graduée : la borne est hors de la droite");
    }
  } else if (v.kind === "groups") {
    if (!(Number.isInteger(v.total) && v.total >= 1 && v.total <= MAX_GROUP_ITEMS))
      err(where, `groupes : total entier entre 1 et ${MAX_GROUP_ITEMS}`);
    if (!(Number.isInteger(v.groupSize) && v.groupSize >= 1))
      err(where, "groupes : la taille d'un groupe doit être un entier positif");
  }
}

/** Where a remediation sends the student must be earlier cards, in order, before `card`. */
function checkRemediation(
  r: Remediation,
  card: CardDef,
  d: DeclicDef,
  where: string,
  err: (where: string, msg: string) => void,
) {
  const from = d.cards.find((c) => c.id === r.fromCardId);
  const to = d.cards.find((c) => c.id === r.toCardId);
  if (!from || !to) err(where, "la remédiation vise une carte inconnue");
  else if (from.order > to.order || to.order >= card.order) {
    err(where, "la remédiation doit rejouer des cartes précédentes, dans l'ordre");
  }
}

function validateCard(
  card: CardDef,
  d: DeclicDef,
  misconceptionIds: Set<string>,
  err: (where: string, msg: string) => void,
  at: (cardId?: string) => string,
) {
  const where = at(card.id);
  if (!textOf(card.text).trim()) err(where, "texte vide");
  checkVisual(card.visual, where, err);
  switch (card.type) {
    case "choice": {
      validateChoices(card.choices, where, misconceptionIds, err);
      const seen = new Set([BASE_VARIANT]);
      for (const v of card.variants ?? []) {
        const vwhere = `${where} › variante ${v.id}`;
        if (seen.has(v.id)) err(where, `identifiant de variante en double ou réservé "${v.id}"`);
        seen.add(v.id);
        if (!textOf(v.text).trim()) err(vwhere, "texte vide");
        validateChoices(v.choices, vwhere, misconceptionIds, err);
        checkVisual(v.visual, vwhere, err);
      }
      break;
    }
    case "reveal":
      if (!card.continueLabel.trim()) err(where, "libellé du bouton manquant");
      break;
    case "multi-step-choice": {
      if (card.steps.length === 0) err(where, "aucune étape");
      const stepIds = new Set<string>();
      const versionIds = new Set([BASE_VARIANT]);
      for (const [position, v] of versionsOf(card).entries()) {
        const isVariant = position > 0; // the card's own steps come first
        const vwhere = isVariant ? `${where} › variante ${v.id}` : where;
        if (isVariant) {
          if (versionIds.has(v.id))
            err(where, `identifiant de variante en double ou réservé "${v.id}"`);
          versionIds.add(v.id);
          if (v.steps.length !== card.steps.length) {
            err(
              vwhere,
              `une variante a le même nombre d'étapes que la carte (${card.steps.length})`,
            );
          }
        }
        for (const s of v.steps) {
          // Ids are unique across every version, so a saved answer names exactly one step.
          if (stepIds.has(s.id)) err(where, `étape en double "${s.id}"`);
          stepIds.add(s.id);
          if (!s.id.startsWith(`${d.id}-`))
            err(where, `l'étape "${s.id}" doit commencer par "${d.id}-"`);
          validateChoices(s.options, `${vwhere} › ${s.id}`, misconceptionIds, err);
          checkVisual(s.visual, `${vwhere} › ${s.id}`, err);
          if (s.remediation) checkRemediation(s.remediation, card, d, `${vwhere} › ${s.id}`, err);
        }
      }
      break;
    }
    case "declic-summary": {
      if (!card.actions.some((a) => a.kind === "complete"))
        err(where, "il faut une action qui termine le Déclic");
      const menuActions = card.actions.filter((a) => a.kind === "menu");
      if (menuActions.length > 0 && card.menu.length === 0)
        err(where, "action de menu sans entrée de menu");
      break;
    }
    default: {
      const unknown: never = card;
      err(where, `type de carte inconnu "${(unknown as { type: string }).type}"`);
    }
  }
}

/** For each BO mapping of the chapter: which Déclics cover it, and how completely. */
export function coverageReport(
  chapter: ChapterDef,
  declics: DeclicDef[],
): {
  mappingId: string;
  requirement: string;
  coveredBy: { declicId: string; coverage: CoverageLevel }[];
}[] {
  return chapter.mappings.map((m) => ({
    mappingId: m.id,
    requirement: m.requirement,
    coveredBy: declics.flatMap((d) =>
      d.coverage
        .filter((c) => c.mappingId === m.id)
        .map((c) => ({ declicId: d.id, coverage: c.coverage })),
    ),
  }));
}
