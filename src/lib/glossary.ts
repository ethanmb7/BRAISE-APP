// The words BRAISE invented, said once in plain language. Every place that uses one of them can point
// here, so a new student is never left to guess what a "Déclic" or a "Pioche" is. Plain French, no
// jargon in the definitions, and never a threat: a review is "to refresh", not "overdue".

export type TermId = "pioche" | "declic" | "carre-intox" | "rafraichir" | "aura" | "rang";

export type Term = {
  id: TermId;
  label: string;
  /** One line, for a list. */
  short: string;
  /** Two or three sentences, for the sheet that opens on this term. */
  long: string;
};

export const GLOSSARY: Term[] = [
  {
    id: "declic",
    label: "Un Déclic",
    short: "Un mini-cours raconté par Braise.",
    long: "Braise te raconte une situation, tu essaies avant qu’on t’explique, puis ça fait « clic ». À la fin, tu gardes une fiche avec l’essentiel.",
  },
  {
    id: "pioche",
    label: "La Pioche du jour",
    short: "Ta révision du jour, choisie par Braise.",
    long: "Chaque jour, Braise pioche pour toi un chapitre qui vaut le coup d’être revu. C’est court : quelques minutes. Tu peux aussi choisir ce que tu veux dans tes cours.",
  },
  {
    id: "carre-intox",
    label: "Carré ou Intox",
    short: "Vrai ou faux, en un swipe.",
    long: "Une affirmation s’affiche. Si elle est vraie, c’est Carré, tu swipes à droite. Si elle est fausse, c’est Intox, tu swipes à gauche. Sans clavier.",
  },
  {
    id: "rafraichir",
    label: "À rafraîchir",
    short: "Une notion qui revient avant que tu l’oublies.",
    long: "Revoir une notion juste avant de l’oublier, c’est ce qui l’ancre le mieux. Braise te la remontre au bon moment, jamais pour te mettre la pression.",
  },
  {
    id: "aura",
    label: "Ton Aura",
    short: "Ta progression, à toi seul.",
    long: "Elle grandit quand tu retiens, pas quand tu restes longtemps. Tu y vois ton rang, ta série et les notions que tu as retenues. Aucun classement entre élèves.",
  },
  {
    id: "rang",
    label: "Un rang",
    short: "Bronze, Argent, Or, Platine, Légende.",
    long: "Tu gagnes de l’XP en révisant. À chaque palier, ton rang monte et Braise change de forme. Tu ne te compares qu’à toi-même.",
  },
];

export function termById(id: TermId): Term {
  return GLOSSARY.find((t) => t.id === id) ?? GLOSSARY[0];
}
