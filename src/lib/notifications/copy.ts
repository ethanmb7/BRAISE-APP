// What Braise says in a reminder, in both tones. The facts are the same in both (the same numbers, the
// same names): only the voice changes. Nothing here may press, count the days away, or blame: a test
// checks every template against a list of words Braise never uses.
import type { Personality } from "@/types";

export type CopyKind = "rappel" | "declic-suite" | "retrouvailles";

export type CopyInput = {
  kind: CopyKind;
  tone: Personality;
  name: string;
  /** A day number, so the wording rotates from one day to the next without being random. */
  seed: number;
  count: number;
  minutes: number;
  topic?: string;
  declic?: string;
  /** For "retrouvailles": 0 the first word, 1 the second. */
  step?: number;
};

type Pools = Record<Personality, string[]>;

// Placeholders: {name} {n} (a count) {cartes} ("3 cartes") {min} {topic} {declic}. Same placeholders, in
// the same order of templates, in both tones.
export const POOLS: Record<string, Pools> = {
  rappel: {
    chill: [
      "{n} notions à rafraîchir : {min} min, quand tu veux.",
      "Petit rappel de Braise sur {topic}. {min} min, juste avant que ça s’efface.",
      "{name}, {n} notions n’attendent que toi, sans pression.",
    ],
    savage: [
      "{n} notions commencent à t’échapper. {min} min et c’est réglé.",
      "Ta mémoire m’a chargée de te parler de {topic}. {min} min, pas plus.",
      "{name}, {n} cartes te font de l’œil. Tu craques ?",
    ],
  },
  "declic-suite": {
    chill: [
      "Je te remontre « {declic} » : {cartes}, {min} min. Juste pour que ça reste.",
      "Ton Déclic « {declic} » a dormi une nuit. {cartes}, {min} min pour voir ce qu’il en reste.",
    ],
    savage: [
      "« {declic} », round 2 : {cartes}, {min} min. On voit ce qui a collé.",
      "« {declic} » a fait sa nuit. {cartes}, {min} min : qu’est-ce qui a survécu ?",
    ],
  },
  "retrouvailles-0": {
    chill: ["Rien ne presse, {name}. Quand tu veux, {min} min pour se remettre dedans ?"],
    savage: ["{name}, la porte est ouverte. {min} min pour se remettre dedans, ça te dit ?"],
  },
  "retrouvailles-1": {
    chill: ["Je suis là quand tu veux, {name}. Jamais de pression."],
    savage: ["Je ne te harcèle pas, {name}, promis. La porte reste ouverte."],
  },
};

/** What Braise must never say in a reminder. Tested against every template. */
export const NEVER =
  /retard|perdu|perdre|échec|raté|série|vite\b|urgent|dernière chance|manqu|absen|oubli|tu n.as pas|culpab|honte/i;

export function placeholdersOf(template: string): string[] {
  return [...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
}

export function renderNotification(input: CopyInput): { title: string; body: string } {
  const key = input.kind === "retrouvailles" ? `retrouvailles-${input.step ?? 0}` : input.kind;
  const pool = (POOLS[key] ?? POOLS.rappel)[input.tone] ?? POOLS[key].chill;
  const template = pool[Math.abs(input.seed) % pool.length];
  const body = fill(template, {
    name: input.name.trim() || "toi",
    n: String(input.count),
    cartes: `${input.count} carte${input.count > 1 ? "s" : ""}`,
    min: String(input.minutes),
    topic: input.topic ?? "ton cours",
    declic: input.declic ?? "ton Déclic",
  });
  return { title: "Braise", body };
}
