import { LEVELS } from '@/data';
import type { AgeGroup, Personality } from '@/types';

export function getAgeGroup(levelId: string | null | undefined): AgeGroup {
  const lvl = LEVELS.find((l) => l.id === levelId);
  return lvl?.group === 'Lycée' ? 'lycee' : 'college';
}

export type VoiceCtx = { personality: Personality; age: AgeGroup };

function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

/** key = `${personality}-${age}` */
function byCombo(ctx: VoiceCtx, table: Record<string, string[]>): string {
  return pick(table[`${ctx.personality}-${ctx.age}`]);
}

export function quizCorrect(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-college': ['Nickel, bien joué ! 🎉', 'Yes ! T\'as capté du premier coup.', 'Trop bien, continue comme ça !'],
    'chill-lycee': ['Clean. T\'as le niveau.', 'Bien vu, c\'est du solide.', 'Nickel, tu maîtrises le sujet.'],
    'savage-college': ['Ah quand même, j\'commençais à stresser.', 'Pas mal pour un mardi.', 'Ok là je suis bluffé, avoue.'],
    'savage-lycee': ['Tiens, un neurone qui bosse. Respect.', 'Correct. Le bac te dit merci.', 'Bon ok, t\'as le droit d\'être fier de toi.'],
  });
}

// The "aïe" case — the student called INTOX on a claim that was actually true — used to be a
// single hardcoded line ("Le piège était là, celle-là était pourtant bonne.") with no variation
// at all, the one spot in the judge() flow that never rotated. Same byCombo system as
// quizWrong, its sibling for the other kind of miss (falling for an actual trap).
export function missedTruth(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-college': ['Pas de piège cette fois, celle-là était vraie !', 'Fausse alerte : elle était bonne, en fait.', 'Aucune intox ici, tu as flairé un piège qui n\'existait pas.'],
    'chill-lycee': ['Pas de piège, celle-là était correcte.', 'Fausse alerte, cette fois c\'était la vérité.', 'Tu as flairé un piège qui n\'était pas là.'],
    'savage-college': ['Ah non, celle-là était clean, fallait me faire confiance.', 'Trop de méfiance : elle était vraie, cette fois.', 'Raté, y\'avait pas d\'arnaque sur ce coup.'],
    'savage-lycee': ['Celle-là était réglo, fallait valider.', 'Excès de méfiance : elle était vraie.', 'Pas d\'embrouille ici, juste la vérité toute simple.'],
  });
}

export function quizWrong(ctx: VoiceCtx, topic?: string): string {
  const t = topic ? ` sur ${topic}` : '';
  return byCombo(ctx, {
    'chill-college': [`Pas grave${t}, on retient juste l'astuce pour la prochaine fois !`, 'Oups, ça arrive à tout le monde. On regarde pourquoi ?', 'Aucun stress, c\'est comme ça qu\'on progresse.'],
    'chill-lycee': [`Raté${t}, mais c'est un classique. On décortique.`, 'Pas de souci, c\'est exactement le genre de piège à repérer.', 'Ok, petite erreur — regardons ce qui a coincé.'],
    'savage-college': [`Aïe${t}... on va dire que c'était un tir d'échauffement.`, 'Bon, celle-là on l\'efface de ta mémoire, ok ?', 'Areuh. Même Braise a mal pour toi là.'],
    'savage-lycee': [`Sérieux${t}, tu m'as fait mal au cœur là...`, 'Alors ça, c\'est ce qu\'on appelle un classique du contrôle raté.', 'Le correcteur du bac aurait pleuré. On corrige, vite.'],
  });
}

export function lessonComplete(ctx: VoiceCtx, name: string): string {
  return byCombo(ctx, {
    'chill-college': [`Trop bien, "${name}" est pliée ! T'as géré.`, `"${name}" dans la poche, bravo à toi.`],
    'chill-lycee': [`"${name}" bouclée. Beau travail, sérieusement.`, `Chapitre "${name}" validé. Tu tiens le rythme.`],
    'savage-college': [`"${name}" terminée. J'avoue, j'suis fier (un peu).`, `Ok t'as survécu à "${name}". Pas si nul finalement.`],
    'savage-lycee': [`"${name}" pliée. Le bac recule d'un pas, terrifié.`, `Bon, "${name}" c'est réglé. On efface, on passe à la suite.`],
  });
}

/** Short, visible hookline for the hero card — the chapter title and subject already have their
 *  own slots there, so unlike `dailyPickLine` this never repeats them; it only has to carry the
 *  personality/age tone in a few words. Onboarding's own first question justifies asking for a
 *  first name with "Braise a besoin d'un prénom pour te parler comme un vrai pote" — it was never
 *  actually used anywhere on Home, so that promise went unkept on the one screen seen the most.
 *  `userName` sits right at the start of every variant, not the end: this line is `truncate`d to
 *  one line in a narrow card, and CSS ellipsis always cuts from the end — if anything has to get
 *  clipped for a long name, it should be the flavour text, never the name itself. */
export function dailyHookLine(ctx: VoiceCtx, userName: string): string {
  return byCombo(ctx, {
    'chill-college': [`Salut ${userName} ! Ta pioche du jour est prête 🧠`, `${userName}, ton casse-tête du jour t'attend 🧠`],
    'chill-lycee': [`${userName}, ta session du jour, tranquille 🧠`, `Salut ${userName}, pioche du jour à ton rythme 🧠`],
    'savage-college': [`${userName}, le sort a tranché. Bouge-toi 🔥`, `${userName}, ta pioche du jour. Pas d'échappatoire 🔥`],
    'savage-lycee': [`${userName}, tirage du jour. Le hasard ne négocie pas 🔥`, `${userName}, pioche du jour, aucune excuse 🔥`],
  });
}

/** The line under Braise's transformation when a real rank threshold (getRankInfo) is crossed —
 *  same tone system as everywhere else, so the app's one big celebratory moment doesn't suddenly
 *  drop into generic copy. */
export function rankUpLine(ctx: VoiceCtx, rankName: string): string {
  return byCombo(ctx, {
    'chill-college': [`Nouveau rang débloqué : ${rankName} ! Trop fort.`, `Tu passes ${rankName} ! Continue comme ça.`],
    'chill-lycee': [`Rang ${rankName} débloqué. Beau parcours.`, `Nouveau rang : ${rankName}. Bien joué.`],
    'savage-college': [`${rankName} débloqué. Même moi je suis impressionné.`, `Rang ${rankName}. Pas mal pour un mardi.`],
    'savage-lycee': [`Rang ${rankName}. Le classement tremble.`, `${rankName} débloqué. Le bac recule encore d'un pas.`],
  });
}

// The standing instruction over the verdict buttons on every flashcard. "Vrai ou Faux ?"
// used to exist only as a first-card tutorial chip — after that, nothing on the screen said
// what the student was supposed to do with Braise's message. Phrased as Braise daring you to
// call him out, not as an exercise header.
export function judgePrompt(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-college': ['Je dis vrai ou je raconte n\'importe quoi ?', 'Tu me crois, ou pas ?'],
    'chill-lycee': ['Vrai, ou je raconte n\'importe quoi ?', 'Tu valides ou tu me cales ?'],
    'savage-college': ['Alors, je bluffe ou pas ?', 'Ose me dire que c\'est faux.'],
    'savage-lycee': ['Je bluffe, ou pas ?', 'Vas-y, cale-moi si tu peux.'],
  });
}

// The short tag chip on the verdict bar (Réviser) — used to be four hardcoded strings, always
// the same one per outcome. On a 15-card session that's the same "💯 C'EST CARRÉ" read eight or
// nine times identically; Braise's own line underneath already rotates, the tag it sits next to
// didn't. Same byCombo system as the rest of this file, so the tag's energy tracks the chosen
// personality/age too, not just the outcome.
export function verdictTag(ctx: VoiceCtx, kind: 'carre' | 'super' | 'aie' | 'grille'): string {
  const tables: Record<typeof kind, Record<string, string[]>> = {
    carre: {
      'chill-college': ["💯 C'est carré", '🎯 Dans le mille', '🔥 Nickel', '✅ Carton plein'],
      'chill-lycee': ["💯 C'est carré", '🎯 En plein dans le mille', '✅ Solide', '🔥 Propre'],
      'savage-college': ["💯 C'est carré", '🎯 Boum, dans le mille', '😎 Pas mal du tout', '🔥 Ça envoie'],
      'savage-lycee': ["💯 C'est carré", '🎯 Dans le mille', '😏 Pas si nul finalement', '🔥 Ça poutre'],
    },
    super: {
      'chill-college': ['⚡ Super Braise', '⚡ Double ou rien, gagné', '⚡ Boum, ×2'],
      'chill-lycee': ['⚡ Super Braise', '⚡ Coup double réussi', '⚡ ×2, propre'],
      'savage-college': ['⚡ Super Braise', '⚡ Coup critique !', "⚡ Boum, ×2, t'as osé"],
      'savage-lycee': ['⚡ Super Braise', '⚡ Coup critique', '⚡ ×2 assumé'],
    },
    aie: {
      'chill-college': ['🙈 Aïe', '😬 Raté de peu', "🙊 Dommage, c'était vrai"],
      'chill-lycee': ['🙈 Aïe', '😬 Presque', '🙊 Celle-là était bonne pourtant'],
      'savage-college': ['🙈 Aïe', '😬 Tu doutes trop', '🙊 Fallait me faire confiance'],
      'savage-lycee': ['🙈 Aïe', '😬 Trop de méfiance, là', '🙊 Elle était clean pourtant'],
    },
    grille: {
      'chill-college': ['💀 Grillé', '🎭 Dans le panneau', '🙃 Roulé'],
      'chill-lycee': ['💀 Grillé', '🎭 Piégé en beauté', '🙃 Roulé dans la farine'],
      'savage-college': ['💀 Grillé', '🎭 Direct dans le panneau', '😵 Piégé comme un débutant'],
      'savage-lycee': ['💀 Grillé', '🎭 Tombé dans le panneau', '😵 Roulé sans forcer'],
    },
  };
  return byCombo(ctx, tables[kind]);
}

export function dailyPickLine(ctx: VoiceCtx, userName: string, subjectName: string, chapterTitle: string): string {
  return byCombo(ctx, {
    'chill-college': [`Salut ${userName} ! Aujourd'hui, Braise a pioché "${chapterTitle}" (${subjectName}) pour toi. 3 min, zéro pression.`],
    'chill-lycee': [`${userName}, pioche du jour : "${chapterTitle}" en ${subjectName}. 3 minutes, tranquille.`],
    'savage-college': [`${userName}, le sort en a décidé : "${chapterTitle}" (${subjectName}). Tu peux pas fuir, désolé.`],
    'savage-lycee': [`${userName}, tirage au sort du jour : "${chapterTitle}" en ${subjectName}. Le hasard ne négocie pas.`],
  });
}

export function duelIntro(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-college': ['Petit défi entre nous : qui répond juste le plus vite ?', 'On fait la course ? Toi contre moi, 60 secondes.'],
    'chill-lycee': ['Un petit duel chrono, histoire de pimenter la révision ?', '60 secondes, toi contre Braise. Prêt ?'],
    'savage-college': ['Duel officiel : toi vs moi. Spoiler, je gagne souvent.', 'On va voir si t\'as vraiment révisé ou juste ouvert le cahier.'],
    'savage-lycee': ['Duel chrono. Si tu perds contre une IA, on n\'en parle à personne.', '60 secondes pour me prouver que t\'as pas juste scrollé tes révisions.'],
  });
}

export function duelResult(ctx: VoiceCtx, won: boolean): string {
  if (won) {
    return byCombo(ctx, {
      'chill-college': ['T\'as gagné, franchement bien joué !', 'GG ! Tu m\'as mis une belle raclée.'],
      'chill-lycee': ['Victoire méritée, bien joué.', 'GG, la révision a payé.'],
      'savage-college': ['Ok ok tu gagnes. Cette fois.', 'Bon d\'accord, t\'es fort. Content ?'],
      'savage-lycee': ['Tu gagnes. Je vais recalculer mes probabilités.', 'GG. Le bac a intérêt à se méfier.'],
    });
  }
  return byCombo(ctx, {
    'chill-college': ['Perdu de peu, on retente ?', 'Presque ! Encore un petit effort.'],
    'chill-lycee': ['Défaite honorable, on refait un round ?', 'Pas cette fois, mais c\'était serré.'],
    'savage-college': ['J\'ai gagné. Sans surprise, mais gg quand même.', 'Perdu ! Bon, c\'était couru d\'avance.'],
    'savage-lycee': ['Victoire de Braise. La machine ne dort jamais.', 'Perdu. Le café ce soir, tu le mérites pas.'],
  });
}

/** Closing check-in line after Braise proactively opens a lesson conversation. */
export function lessonOpenerCheckIn(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-college': ['Ça te parle ou tu veux que je réexplique un bout ?', 'Dis-moi si un truc est flou, on reprend ensemble.'],
    'chill-lycee': ['Ça va, t\'as suivi ? Dis-moi si un point mérite d\'être creusé.', 'Tout est clair ou il y a un passage à revoir ?'],
    'savage-college': ['Bon, t\'as suivi ou je parle dans le vide ?', 'Alors, ça capte ou faut un dessin ?'],
    'savage-lycee': ['T\'as capté ou faut que je répète comme si t\'avais 6 ans ?', 'Bon spoiler : c\'est pas si dur. T\'en es où ?'],
  });
}

/** Invitation for the student to explain a concept back to Braise in their own words (Feynman technique). */
export function feynmanInvite(ctx: VoiceCtx, topic: string): string {
  return byCombo(ctx, {
    'chill-college': [`Fais comme si j'avais 10 ans et que je connaissais rien à "${topic}" — tu m'expliques ?`],
    'chill-lycee': [`Explique-moi "${topic}" comme si je découvrais complètement le sujet, vas-y je t'écoute.`],
    'savage-college': [`Allez, prouve-moi que t'as pas juste zappé le cours. Explique-moi "${topic}" façon débutant total.`],
    'savage-lycee': [`Vas-y, convaincs-moi que t'as vraiment compris "${topic}" — explique comme si j'avais zéro base.`],
  });
}

/** Braise's take on the Profil page — real rank/streak/badge facts, never a generic filler line.
 *  Branches on streak (active or not) so the reaction actually changes with what's true right
 *  now, giving a real reason to check back instead of a static caption. */
export function profileReactionLine(
  ctx: VoiceCtx,
  facts: { rankName: string; streak: number; badgesUnlocked: number; badgesTotal: number }
): string {
  const { rankName, streak, badgesUnlocked, badgesTotal } = facts;
  if (streak > 0) {
    return byCombo(ctx, {
      'chill-college': [
        `${rankName}, ${streak} jour${streak > 1 ? 's' : ''} de suite, ${badgesUnlocked}/${badgesTotal} badges. Tu construis un truc solide.`,
        `Série de ${streak} jour${streak > 1 ? 's' : ''} en cours, rang ${rankName}. J'suis fan de la régularité.`,
      ],
      'chill-lycee': [
        `Rang ${rankName}, ${streak} jour${streak > 1 ? 's' : ''} d'affilée. La régularité paie, continue.`,
        `${badgesUnlocked}/${badgesTotal} badges, série de ${streak}. Beau parcours jusqu'ici.`,
      ],
      'savage-college': [
        `${streak} jour${streak > 1 ? 's' : ''} de suite et rang ${rankName}. Ok, je suis un peu impressionné.`,
        `${rankName}, série de ${streak}. T'as pas lâché, respect.`,
      ],
      'savage-lycee': [
        `Rang ${rankName}, ${streak} jour${streak > 1 ? 's' : ''} de suite. Le bac commence à avoir peur.`,
        `${badgesUnlocked}/${badgesTotal} badges, série de ${streak} jours. Pas mal pour quelqu'un qui prétend s'en ficher.`,
      ],
    });
  }
  return byCombo(ctx, {
    'chill-college': [
      `Rang ${rankName}, ${badgesUnlocked}/${badgesTotal} badges. Une petite série et ce profil devient encore plus stylé.`,
      `${rankName} avec ${badgesUnlocked}/${badgesTotal} badges déjà en poche. Prêt pour une nouvelle série ?`,
    ],
    'chill-lycee': [
      `Rang ${rankName}, ${badgesUnlocked}/${badgesTotal} badges au compteur. Une série active et le tableau serait complet.`,
      `${badgesUnlocked}/${badgesTotal} badges, rang ${rankName}. Il manque juste une série en cours.`,
    ],
    'savage-college': [
      `${rankName}, ${badgesUnlocked}/${badgesTotal} badges, zéro série active. On peut faire mieux, non ?`,
      `Rang ${rankName} mais aucune série en cours. Le profil est bon, l'assiduité un peu moins.`,
    ],
    'savage-lycee': [
      `${rankName}, ${badgesUnlocked}/${badgesTotal} badges, mais aucune série active. Dommage, le reste est propre.`,
      `Rang ${rankName} sans série en cours. T'as le niveau, il manque la régularité.`,
    ],
  });
}

/** Personalized advice on "Ton Aura", based on the student's actual weakest chapter (if any). */
export function progressAdvice(ctx: VoiceCtx, weakSubject?: string, weakTopic?: string): string {
  if (weakSubject && weakTopic) {
    return byCombo(ctx, {
      'chill-college': [`T'assures sur le reste ! Cette semaine, donne 10 min par jour à "${weakTopic}" en ${weakSubject}, ça va vite débloquer.`],
      'chill-lycee': [`Belle régularité. Concentre 10 min par jour sur "${weakTopic}" (${weakSubject}) cette semaine, c'est ton point de bascule.`],
      'savage-college': [`Pas mal dans l'ensemble. Mais "${weakTopic}" en ${weakSubject}... on va dire que ça mérite un peu plus d'attention.`],
      'savage-lycee': [`Solide globalement. "${weakTopic}" (${weakSubject}) reste ton talon d'Achille — 10 min par jour et c'est réglé.`],
    });
  }
  return byCombo(ctx, {
    'chill-college': ['Aucun point faible détecté, tu gères tout ! Continue comme ça, petit à petit.'],
    'chill-lycee': ['Rien à signaler côté points faibles — belle régularité, garde le rythme.'],
    'savage-college': ['Aucun point faible pour l\'instant. Je note, j\'ai les yeux ouverts.'],
    'savage-lycee': ['Zéro point faible détecté. Impressionnant — ou alors t\'as pas encore essayé les trucs durs.'],
  });
}

/** Extra instructions appended to the Mistral system prompt so free-text chat matches the chosen tone. */
export function toneSystemPrompt(ctx: VoiceCtx): string {
  const ageLine =
    ctx.age === 'college'
      ? 'L\'élève est au collège (6ème-3ème) : mots simples, analogies très visuelles (jeux, snacks, réseaux sociaux), phrases courtes.'
      : 'L\'élève est au lycée (2nde-Terminale) : ton un peu plus mature, références un peu plus fines, mais toujours décontracté et jamais scolaire.';
  const personaLine =
    ctx.personality === 'savage'
      ? 'Mode "Coach Savage" activé : second degré assumé, petites piques amicales et sarcasme léger quand l\'élève se trompe, mais jamais méchant ni décourageant — ça reste un pote qui charrie, pas un prof qui humilie.'
      : 'Mode "Pote Chill" activé : encourageant, doux, décontracté, zéro pression, toujours bienveillant même face à une erreur.';
  return `${ageLine}\n${personaLine}`;
}
