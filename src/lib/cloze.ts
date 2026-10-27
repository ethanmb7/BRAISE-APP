// "Complète la règle": a sentence with holes and tiles to put in them, before any lesson. Finding the word
// again (recall) is worth more than recognising it among choices, and tapping a tile needs no keyboard, so
// it stays inside the rule "no typing in Réviser". The sentences are written from each chapter's own
// "À retenir" (src/content/declic/*.txt) and every wrong tile says why it is wrong, with the chapter's own
// trap, never a bare "faux".
//
// A hole is written `{}` in the text. The holes are filled in order, left to right.
export const SLOT = "{}";

export type ClozeCard = {
  id: string;
  /** The chapter whose island card starts the series. */
  chapterId: string;
  text: string;
  /** What goes in each hole, in order. */
  answers: string[];
  /** The tiles that do not belong, each with the reason, said in Braise's voice. */
  distractors: Record<string, string>;
};

export const CLOZE_CARDS: ClozeCard[] = [
  {
    id: "cz-a1",
    chapterId: "a1",
    text: "Au present simple, on ajoute un {} au verbe à la {} personne du singulier (he/she/it).",
    answers: ["S", "3e"],
    distractors: {
      ED: "« -ed », c'est le passé des verbes réguliers.",
      ING: "« -ing » dit qu'une action est en cours, pas le présent simple.",
      "1re": "Avec « I », le verbe ne change pas.",
    },
  },
  {
    id: "cz-a2",
    chapterId: "a2",
    text: "Un verbe {} prend {} au past simple ; un verbe {} a sa propre forme à apprendre (go → went).",
    answers: ["régulier", "ED", "irrégulier"],
    distractors: {
      S: "Le S, c'est le présent simple à la 3e personne.",
      ING: "« -ing » n'est pas le past simple.",
      have: "« have » sert au present perfect.",
    },
  },
  {
    id: "cz-a3",
    chapterId: "a3",
    text: "Le present perfect se forme avec {} / has + le {} (I have eaten).",
    answers: ["have", "participe passé"],
    distractors: {
      infinitif: "Après have, on met le participe passé, pas l'infinitif.",
      was: "« was » est le passé de « be », pas un present perfect.",
      yesterday: "Avec « yesterday », on utilise le past simple.",
    },
  },
  {
    id: "cz-a4",
    chapterId: "a4",
    text: "{} + verbe = conseil ; {} = interdiction ; don't have to = {}.",
    answers: ["should", "mustn't", "pas obligé"],
    distractors: {
      must: "« must » est une obligation forte, pas un simple conseil.",
      obligatoire: "« don't have to » dit le contraire : ce n'est pas obligatoire.",
      interdit:
        "« Interdit », c'est mustn't. Don't have to dit seulement que ce n'est pas nécessaire.",
    },
  },
  {
    id: "cz-f1",
    chapterId: "f1",
    text: "Le {} est la voix fictive qui raconte l'histoire ; l'{} est la personne réelle qui a écrit le livre.",
    answers: ["narrateur", "auteur"],
    distractors: {
      personnage: "Un personnage vit dans l'histoire, il ne la raconte pas forcément.",
      lecteur: "Le lecteur lit le livre, il ne l'a pas écrit.",
      éditeur: "L'éditeur publie le livre, il ne l'a pas écrit.",
    },
  },
  {
    id: "cz-f2",
    chapterId: "f2",
    text: "Un alexandrin compte {} syllabes, un décasyllabe en compte {}. On compte les syllabes du {}, pas les mots.",
    answers: ["12", "10", "vers"],
    distractors: {
      "8": "8 syllabes, c'est un octosyllabe.",
      mots: "On compte les syllabes du vers, pas les mots.",
    },
  },
  {
    id: "cz-f3",
    chapterId: "f3",
    text: "Dans une pièce, les {} sont les paroles des personnages ; les {} sont les indications de l'auteur, jamais prononcées.",
    answers: ["répliques", "didascalies"],
    distractors: {
      monologues:
        "Un monologue est une réplique d'un personnage seul : ce n'est pas le mot général.",
      décors: "Le décor est décrit par les didascalies, mais ce n'est pas leur nom.",
      actes: "Un acte est une grande partie de la pièce, pas une parole.",
    },
  },
  {
    id: "cz-f4",
    chapterId: "f4",
    text: "Pour convaincre, on défend une {} avec des {} que l'on illustre chacun par un {}.",
    answers: ["thèse", "arguments", "exemple"],
    distractors: {
      opinion: "Une opinion seule ne prouve rien : il faut défendre une thèse avec des arguments.",
      connecteurs:
        "Les connecteurs (car, en effet) relient les étapes, ce ne sont pas les raisons.",
      conclusion:
        "La conclusion vient à la fin : ici, chaque argument est illustré par un exemple.",
    },
  },
  {
    id: "cz-h1",
    chapterId: "h1",
    text: "La prise de la Bastille, début de la Révolution, date de {} ; l'exécution de Louis XVI, {} ans plus tard, de 1793.",
    answers: ["1789", "4"],
    distractors: {
      "1793": "1793, c'est l'exécution de Louis XVI.",
      "1804": "1804, c'est Napoléon qui devient empereur.",
      "10": "Entre 1789 et 1793, il y a 4 ans.",
    },
  },
  {
    id: "cz-h2",
    chapterId: "h2",
    text: "Napoléon devient empereur en {} et crée le {}, encore en partie utilisé aujourd'hui.",
    answers: ["1804", "Code civil"],
    distractors: {
      "1789": "1789, c'est la prise de la Bastille.",
      "1793": "1793, c'est l'exécution de Louis XVI.",
      "Déclaration des droits":
        "La Déclaration des droits de l'homme date de 1789, ce n'est pas lui qui l'a créée.",
    },
  },
  {
    id: "cz-h3",
    chapterId: "h3",
    text: "Dans une {}, le chef de l'État n'est pas un monarque ; dans une {}, les citoyens choisissent librement leurs dirigeants ; dans une {}, le pouvoir est concentré sans contre-pouvoirs.",
    answers: ["république", "démocratie", "dictature"],
    distractors: {
      monarchie: "Dans une monarchie, le pouvoir se transmet par hérédité.",
      constitution: "Une constitution est un texte, pas un régime.",
    },
  },
  {
    id: "cz-h4",
    chapterId: "h4",
    text: "La mondialisation, c'est l'intensification des échanges de {}, de capitaux, d'informations et de {} à l'échelle du monde.",
    answers: ["marchandises", "personnes"],
    distractors: {
      "deux pays": "La mondialisation concerne le monde entier, pas seulement deux pays.",
      frontières: "Les frontières existent toujours : ce sont les échanges qui augmentent.",
      guerres: "Ce sont les échanges qui augmentent, pas les guerres.",
    },
  },
  {
    id: "cz-m1",
    chapterId: "m1",
    text: "Pour simplifier une fraction, on divise {} ET {} par {}.",
    answers: ["le haut", "le bas", "le même nombre"],
    distractors: {
      "seulement le haut": "Si tu ne changes qu'un côté, la quantité change.",
      "un nombre au hasard":
        "Il faut un nombre qui divise le haut et le bas, le même des deux côtés.",
      "2": "Ça dépend de la fraction : il faut un nombre qui divise le haut et le bas.",
    },
  },
  {
    id: "cz-m2",
    chapterId: "m2",
    text: "Dans un triangle {} seulement, a² + b² = c², où c est l'{}, le côté le plus long.",
    answers: ["rectangle", "hypoténuse"],
    distractors: {
      isocèle: "Un triangle isocèle a deux côtés égaux : ça ne suffit pas pour Pythagore.",
      équilatéral: "Un triangle équilatéral n'a pas d'angle droit : Pythagore ne s'applique pas.",
      diagonale: "Le côté le plus long, face à l'angle droit, s'appelle l'hypoténuse.",
    },
  },
  {
    id: "cz-m3",
    chapterId: "m3",
    text: "Une équation reste vraie si on fait {} opération {} du signe =.",
    answers: ["la même", "des deux côtés"],
    distractors: {
      "une autre": "Avec une autre opération de chaque côté, l'égalité casse.",
      "d'un seul côté": "D'un seul côté, l'égalité n'est plus vraie.",
      "au hasard": "Au hasard, l'égalité casse.",
    },
  },
  {
    id: "cz-m4",
    chapterId: "m4",
    text: "Une fonction affine s'écrit f(x) = ax + b : {} est le coefficient directeur et {} est la valeur de départ f(0).",
    answers: ["a", "b"],
    distractors: {
      x: "x est la variable, pas un coefficient.",
      f: "f est le nom de la fonction.",
      ax: "ax change avec x : seule la valeur de départ ne change pas.",
    },
  },
  {
    id: "cz-m5",
    chapterId: "m5",
    text: "La moyenne, c'est la somme des valeurs divisée par le {} de valeurs. La {} est la valeur du milieu, une fois les valeurs rangées par ordre {}.",
    answers: ["nombre", "médiane", "croissant"],
    distractors: {
      total: "Le total, c'est la somme : on divise par le nombre de valeurs.",
      moyenne: "La moyenne se calcule ; la valeur du milieu, c'est la médiane.",
      alphabétique: "Les valeurs se rangent par ordre croissant.",
    },
  },
  {
    id: "cz-p1",
    chapterId: "p1",
    text: "Un atome est composé d'un {} minuscule entouré d'un immense espace {}, où circulent les électrons.",
    answers: ["noyau", "vide"],
    distractors: {
      plein: "L'atome est surtout du vide, pas une bille pleine.",
      proton: "Le proton est dans le noyau, ce n'est pas le noyau entier.",
      neutre: "Neutre décrit l'atome entier, pas l'espace autour du noyau.",
    },
  },
  {
    id: "cz-p2",
    chapterId: "p2",
    text: "Dans une réaction chimique, la masse totale {} : les atomes se {}, ils n'apparaissent ni ne disparaissent.",
    answers: ["ne change pas", "réarrangent"],
    distractors: {
      augmente: "La masse totale ne change jamais.",
      diminue: "La masse totale ne change jamais.",
      disparaissent: "Les atomes ne disparaissent pas, ils se réarrangent.",
    },
  },
  {
    id: "cz-p3",
    chapterId: "p3",
    text: "Pour un conducteur ohmique, la tension U se calcule en multipliant la {} R par l'{} I.",
    answers: ["résistance", "intensité"],
    distractors: {
      tension: "U est la tension : c'est le résultat, pas ce qu'on multiplie.",
      puissance: "La puissance est un autre calcul (P = U × I).",
      énergie: "L'énergie se mesure en joules, elle n'entre pas dans U = R × I.",
    },
  },
  {
    id: "cz-p4",
    chapterId: "p4",
    text: "L'énergie ne se crée pas et ne disparaît pas : elle se {} d'une forme à une autre. Elle se mesure en {}.",
    answers: ["convertit", "joules"],
    distractors: {
      consomme: "Elle n'est pas consommée : elle est convertie.",
      perd: "Une partie est dispersée en chaleur, mais pas détruite.",
      watts: "Le watt mesure une puissance ; l'énergie se mesure en joules.",
    },
  },
  {
    id: "cz-s1",
    chapterId: "s1",
    text: "Respirer, c'est échanger des gaz au niveau des {} : l'O₂ entre, le {} sort.",
    answers: ["alvéoles pulmonaires", "CO₂"],
    distractors: {
      "intestin grêle": "L'intestin grêle sert à la digestion, pas à la respiration.",
      estomac: "L'estomac sert à la digestion, pas à la respiration.",
      "O₂": "L'O₂ entre ; c'est le CO₂ qui sort.",
    },
  },
  {
    id: "cz-s2",
    chapterId: "s2",
    text: "La digestion décompose les aliments surtout dans l'{}, mais l'absorption vers le sang se fait dans l'{}.",
    answers: ["estomac", "intestin grêle"],
    distractors: {
      alvéole: "Les alvéoles servent à la respiration.",
      "gros intestin": "L'absorption des nutriments se fait dans l'intestin grêle.",
    },
  },
  {
    id: "cz-s3",
    chapterId: "s3",
    text: "Un {} est une portion d'ADN qui détermine un caractère ; ses différentes versions sont les {}.",
    answers: ["gène", "allèles"],
    distractors: {
      chromosome: "Un chromosome contient beaucoup de gènes.",
      ADN: "L'ADN est la molécule entière ; un gène en est une portion.",
      caractère: "Le caractère, c'est ce que le gène détermine.",
    },
  },
  {
    id: "cz-s4",
    chapterId: "s4",
    text: "Un écosystème associe un milieu, le {}, et les êtres vivants qui y vivent, la {}.",
    answers: ["biotope", "biocénose"],
    distractors: {
      biosphère: "La biosphère, c'est l'ensemble de la planète vivante.",
      photosynthèse: "La photosynthèse est ce que font les végétaux, ce n'est pas un ensemble.",
      décomposeur: "Un décomposeur est un être vivant : il fait partie de la biocénose.",
    },
  },
];

export function clozeForChapter(chapterId: string): ClozeCard | undefined {
  return CLOZE_CARDS.find((c) => c.chapterId === chapterId);
}

/** The text between the holes (one more piece than there are holes). */
export function clozePieces(card: ClozeCard): string[] {
  return card.text.split(SLOT);
}

/** Every tile of a card, in a random order: the right words and the ones that do not belong. */
export function clozeTiles(card: ClozeCard, random: () => number = Math.random): string[] {
  const tiles = [...card.answers, ...Object.keys(card.distractors)];
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  return tiles;
}

export type TileCheck = { ok: true } | { ok: false; reason: string };

/** Whether `tile` is what the next empty hole (the one after `filled` holes) wants. A wrong tile always
 *  comes back with a reason: a word that belongs to the sentence but not here says so too. */
export function checkTile(card: ClozeCard, filled: number, tile: string): TileCheck {
  if (tile === card.answers[filled]) return { ok: true };
  if (card.answers.includes(tile)) {
    return {
      ok: false,
      reason: "Elle fait partie de la règle, mais pas à cet endroit : relis ce qui précède.",
    };
  }
  return { ok: false, reason: card.distractors[tile] ?? "Pas celle-ci." };
}
