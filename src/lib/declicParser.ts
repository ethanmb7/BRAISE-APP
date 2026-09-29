// Parses ".declic" text files into a DeclicScript — the format that lets someone who isn't a
// developer (a teacher, a psychologist) write a notion without touching TypeScript. See
// src/content/declic/README.md for the format itself; this file is the parser + validator, not
// documentation.
import type { DeclicCard, DeclicChoiceOption, DeclicScript, DeclicVisual } from "@/lib/declic";

// Plain field assignments, not TypeScript's "parameter properties" shortcut: Node's native
// type-stripping (used by scripts/check-declic-content.mjs to run this file with no build step)
// doesn't support that shorthand.
export class DeclicParseError extends Error {
  source: string;
  line: number;
  constructor(source: string, line: number, message: string) {
    super(`${source}:${line} — ${message}`);
    this.source = source;
    this.line = line;
  }
}

function slugify(label: string): string {
  return (
    label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // strip accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "option"
  );
}

// A block is everything up to the next blank line (or an OPTION_RE / VISUAL_ITEM_RE line, which
// don't need a trailing blank line before the next keyword — lets an author skip the blank line
// after the last option/event without it being a formatting error).
const OPTION_RE = /^-\s*(\[correct\]\s*)?(.+?)\s*=>\s*(.+)$/;
const VISUAL_ITEM_RE = /^-\s*(\d{3,4})\s*:\s*(.+)$/;
// A second, different explanation for a wrong option — shown only if the student says the first
// reaction didn't land ("j'ai toujours pas compris"), never surfaced automatically.
const ALT_EXPLANATION_RE = /^~\s*(.+)$/;

export function parseDeclicScript(rawText: string, source: string): DeclicScript {
  const lines = rawText.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  const peek = () => lines[i] ?? "";
  const isBlank = (l: string) => l.trim() === "" || l.trim().startsWith("#");
  const skipBlank = () => {
    while (i < lines.length && isBlank(peek())) i++;
  };
  const err = (message: string): never => {
    throw new DeclicParseError(source, i + 1, message);
  };

  // Consumes lines as free text until a blank line, a new keyword, or an option/visual-item line
  // — whichever comes first — joining them with a space so an author can wrap long sentences.
  const readText = (): string => {
    const parts: string[] = [];
    while (i < lines.length) {
      const l = peek();
      if (
        l.trim() === "" ||
        KEYWORD_RE.test(l) ||
        OPTION_RE.test(l) ||
        VISUAL_ITEM_RE.test(l) ||
        ALT_EXPLANATION_RE.test(l)
      )
        break;
      parts.push(l.trim());
      i++;
    }
    if (parts.length === 0) err("attendu du texte ici, ligne vide trouvée à la place");
    return parts.join(" ");
  };

  const KEYWORD_RE =
    /^(NOTION|CARTE_REVISION|VISUEL|SITUATION|CHOIX|REVELATION|REFORMULATION|DECLIC|FICHE|RETENIR|PIEGE)\b/;

  skipBlank();
  const notionLine = peek();
  const notionMatch = notionLine.match(/^NOTION:\s*(\S+)/);
  if (!notionMatch) err('le fichier doit commencer par "NOTION: <identifiant-du-chapitre>"');
  const chapterId = notionMatch![1];
  i++;

  let reviewCardId: string | undefined;
  skipBlank();
  const reviewMatch = peek().match(/^CARTE_REVISION:\s*(\S+)/);
  if (reviewMatch) {
    reviewCardId = reviewMatch[1];
    i++;
  }

  const cards: DeclicCard[] = [];
  let pendingVisual: DeclicVisual | undefined;

  skipBlank();
  while (i < lines.length) {
    const line = peek();

    if (/^VISUEL:\s*timeline/.test(line)) {
      i++;
      const events: { year: number; label: string }[] = [];
      while (i < lines.length && VISUAL_ITEM_RE.test(peek())) {
        const m = peek().match(VISUAL_ITEM_RE)!;
        events.push({ year: Number(m[1]), label: m[2].trim() });
        i++;
      }
      if (events.length === 0)
        err('"VISUEL: timeline" doit être suivi d\'au moins une ligne "- <année>: <label>"');
      pendingVisual = { kind: "timeline", events };
      skipBlank();
      continue;
    }

    if (line === "SITUATION") {
      i++;
      const text = readText();
      cards.push({ kind: "situation", text, visual: pendingVisual });
      pendingVisual = undefined;
    } else if (line === "CHOIX") {
      i++;
      const prompt = readText();
      const options: DeclicChoiceOption[] = [];
      let correctCount = 0;
      const seenIds = new Set<string>();
      while (i < lines.length && OPTION_RE.test(peek())) {
        const m = peek().match(OPTION_RE)!;
        const correct = !!m[1];
        const label = m[2].trim();
        const reaction = m[3].trim();
        if (!label) err("une option ne peut pas avoir un intitulé vide");
        if (!reaction) err(`l'option "${label}" n'a pas de réaction après "=>"`);
        i++;
        let altExplanation: string | undefined;
        const altMatch = peek().match(ALT_EXPLANATION_RE);
        if (altMatch) {
          altExplanation = altMatch[1].trim();
          if (!altExplanation) err('"~" doit être suivi d\'une explication');
          i++;
        }
        let id = slugify(label);
        while (seenIds.has(id)) id += "-2";
        seenIds.add(id);
        if (correct) correctCount++;
        options.push({
          id,
          label,
          reaction,
          ...(correct ? { correct: true } : {}),
          ...(altExplanation ? { altExplanation } : {}),
        });
      }
      if (options.length < 2)
        err('une carte CHOIX doit avoir au moins 2 options ("- Label => Réaction")');
      if (correctCount !== 1)
        err(
          `une carte CHOIX doit avoir exactement une option marquée [correct] (trouvé ${correctCount})`,
        );
      cards.push({ kind: "choice", prompt, options, visual: pendingVisual });
      pendingVisual = undefined;
    } else if (/^REVELATION:/.test(line)) {
      const kicker = line.slice(line.indexOf(":") + 1).trim();
      if (!kicker) err('"REVELATION:" doit être suivi d\'un titre court sur la même ligne');
      i++;
      const text = readText();
      cards.push({ kind: "reveal", kicker, text, visual: pendingVisual });
      pendingVisual = undefined;
    } else if (line === "REFORMULATION") {
      i++;
      const prompt = readText();
      cards.push({ kind: "reformulation", prompt });
    } else if (line === "DECLIC") {
      i++;
      const declicLine = readText();
      cards.push({ kind: "declic", line: declicLine });
    } else if (/^FICHE:/.test(line)) {
      const title = line.slice(line.indexOf(":") + 1).trim();
      if (!title) err('"FICHE:" doit être suivi d\'un titre sur la même ligne');
      i++;
      skipBlank();
      if (peek() !== "RETENIR") err('une carte "FICHE:" doit être suivie de "RETENIR"');
      i++;
      const retenir = readText();
      skipBlank();
      let piege: string | undefined;
      if (peek() === "PIEGE") {
        i++;
        piege = readText();
      }
      cards.push({ kind: "fiche", title, retenir, ...(piege ? { piege } : {}) });
    } else {
      err(
        `mot-clé inconnu : "${line.trim()}" (attendu SITUATION, CHOIX, REVELATION:, REFORMULATION, DECLIC, FICHE: ou VISUEL: timeline)`,
      );
    }

    skipBlank();
  }

  if (cards.length === 0) err("le fichier ne contient aucune carte");
  const last = cards[cards.length - 1];
  if (last.kind !== "fiche")
    err(
      'le fichier doit se terminer par une carte "FICHE:" — le pont entre "j\'ai compris" et "je sais l\'écrire au contrôle"',
    );
  if (!cards.some((c) => c.kind === "declic")) err('le fichier doit contenir une carte "DECLIC"');
  if (!cards.some((c) => c.kind === "reformulation"))
    err(
      'le fichier doit contenir une carte "REFORMULATION" — c\'est la seule vraie preuve de compréhension de toute la boucle',
    );

  return { chapterId, cards, ...(reviewCardId ? { reviewCardId } : {}) };
}
