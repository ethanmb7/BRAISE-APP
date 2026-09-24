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

// Étape 2 ("positionnement") de la boucle Capte : dire honnêtement "je ne sais pas" n'est pas une
// erreur à corriger, c'est l'information la plus utile que l'élève puisse donner à Braise — la
// voix doit donc rester clairement distincte de quizWrong, jamais une variante déguisée de "raté".
export function quizDontKnow(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-college': ["Pas de souci, on regarde ça ensemble.", "Aucun problème, c'est fait pour ça.", 'Ok, on découvre ça ensemble alors !'],
    'chill-lycee': ["Pas de souci, c'est exactement pour ça qu'on est là.", 'Ok, on regarde ça calmement.', "Aucun stress, c'est une vraie question à creuser."],
    'savage-college': ["Honnête, j'aime ça. On répare le trou tout de suite.", 'Ok, au moins tu triches pas. On regarde.', "Assumé. On corrige ça vite fait."],
    'savage-lycee': ["Au moins t'es honnête. On répare ça maintenant.", "Ok, pas de bluff. On regarde ce qui coince.", "Assumé, c'est déjà bien. On creuse."],
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

/** The one word above the student's own name in HeaderHUD — rendered on every single visit to
 *  Aujourd'hui, so it has to survive being seen many times a day without ever reading as a script.
 *  "Bonjour" (the previous, hardcoded value) was neutral to the point of institutional — the kind
 *  of greeting a bank app gives, not a pote. Deliberately short (the name sits right underneath,
 *  no need to repeat it here) and time-agnostic, since a session can happen at any hour. */
export function headerGreeting(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-college': ['Salut', 'Coucou', 'Hey'],
    'chill-lycee': ['Salut', 'Hey', 'Yo'],
    'savage-college': ['Alors', 'Tiens', 'Bon'],
    'savage-lycee': ['Alors', 'Tiens donc', 'Bon'],
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

// Same 3 ranks that unlock a new avatar option on Profil (see AVATARS in data.ts) — kept here
// too rather than importing it, since data.ts's minRankId is per-avatar plumbing and this
// only needs "what unlocks at this rank", a much smaller fact. Les Flambés : la fuse (Or),
// la glace (Platine), le phénix (Légende).
const AVATAR_UNLOCK_BY_RANK: Record<string, string> = {
  or: 'la fuse',
  platine: 'la glace',
  legende: 'le phénix',
};

/** The line under Braise's transformation when a real rank threshold (getRankInfo) is crossed —
 *  same tone system as everywhere else, so the app's one big celebratory moment doesn't suddenly
 *  drop into generic copy. Ranks that also unlock a new avatar (rankId, optional) say so here —
 *  without this, the moment a dragon/lion/unicorn actually becomes available went completely
 *  unannounced, so nobody who doesn't already think to reopen the avatar picker would ever find
 *  out it exists. */
export function rankUpLine(ctx: VoiceCtx, rankName: string, rankId?: string): string {
  const avatarUnlock = rankId ? AVATAR_UNLOCK_BY_RANK[rankId] : undefined;
  if (avatarUnlock) {
    return byCombo(ctx, {
      'chill-college': [
        `Nouveau rang débloqué : ${rankName} ! Et ${avatarUnlock} pour ton avatar en bonus.`,
        `Tu passes ${rankName} ! Va vite jeter un œil à ton avatar, ${avatarUnlock} t'attend.`,
      ],
      'chill-lycee': [
        `Rang ${rankName} débloqué, avec ${avatarUnlock} pour ton avatar en prime.`,
        `Nouveau rang : ${rankName}. Ton avatar vient de gagner ${avatarUnlock}.`,
      ],
      'savage-college': [
        `${rankName} débloqué, et ${avatarUnlock} avec. Même moi je suis impressionné.`,
        `Rang ${rankName}. Ton avatar récupère ${avatarUnlock} au passage.`,
      ],
      'savage-lycee': [
        `Rang ${rankName}. Le classement tremble, et ton avatar aussi — ${avatarUnlock} t'attend.`,
        `${rankName} débloqué. Ton avatar gagne ${avatarUnlock}, le bac recule encore d'un pas.`,
      ],
    });
  }
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
    'chill-college': [
      'Je dis vrai ou je raconte n\'importe quoi ?',
      'Tu me crois, ou pas ?',
      'Vrai ou pas vrai, à toi de voir.',
      'T\'en penses quoi, c\'est du lourd ?',
    ],
    'chill-lycee': [
      'Vrai, ou je raconte n\'importe quoi ?',
      'Tu valides ou tu me cales ?',
      'C\'est du solide ou pas, selon toi ?',
      'Vrai ou pas, qu\'est-ce que tu en dis ?',
    ],
    'savage-college': [
      'Alors, je bluffe ou pas ?',
      'Ose me dire que c\'est faux.',
      'Je te tends un piège, ou pas ?',
      'T\'es sûr de toi, là ?',
    ],
    'savage-lycee': [
      'Je bluffe, ou pas ?',
      'Vas-y, cale-moi si tu peux.',
      'Je te tends un piège, ou pas ?',
      'T\'es sûr de toi ou tu doutes ?',
    ],
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

export function dailyPickLine(ctx: VoiceCtx, userName: string, subjectName: string, chapterTitle: string, duration: number): string {
  return byCombo(ctx, {
    'chill-college': [
      `Salut ${userName} ! Aujourd'hui, Braise a pioché "${chapterTitle}" (${subjectName}) pour toi. ${duration} min, zéro pression.`,
      `${userName}, ta pioche du jour : "${chapterTitle}" (${subjectName}). ${duration} min, on y va tranquille.`,
    ],
    'chill-lycee': [
      `${userName}, pioche du jour : "${chapterTitle}" en ${subjectName}. ${duration} minutes, tranquille.`,
      `Salut ${userName} ! Aujourd'hui c'est "${chapterTitle}" en ${subjectName}, ${duration} minutes top chrono.`,
    ],
    'savage-college': [
      `${userName}, le sort en a décidé : "${chapterTitle}" (${subjectName}). Tu peux pas fuir, désolé.`,
      `${userName}, aujourd'hui c'est "${chapterTitle}" (${subjectName}). Le hasard a parlé, obéis.`,
    ],
    'savage-lycee': [
      `${userName}, tirage au sort du jour : "${chapterTitle}" en ${subjectName}. Le hasard ne négocie pas.`,
      `${userName}, la pioche a choisi "${chapterTitle}" en ${subjectName}. Aucune négociation possible.`,
    ],
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
    'chill-college': [
      'Ça te parle ou tu veux que je réexplique un bout ?',
      'Dis-moi si un truc est flou, on reprend ensemble.',
      'T\'as des questions ou on est bon ?',
    ],
    'chill-lycee': [
      'Ça va, t\'as suivi ? Dis-moi si un point mérite d\'être creusé.',
      'Tout est clair ou il y a un passage à revoir ?',
      'Un truc à reclarifier avant qu\'on avance ?',
    ],
    'savage-college': [
      'Bon, t\'as suivi ou je parle dans le vide ?',
      'Alors, ça capte ou faut un dessin ?',
      'J\'espère que t\'as suivi, parce que je répète pas trois fois.',
    ],
    'savage-lycee': [
      'T\'as capté ou faut que je répète comme si t\'avais 6 ans ?',
      'Bon spoiler : c\'est pas si dur. T\'en es où ?',
      'T\'as capté ou je perds mon temps ?',
    ],
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
  // Streak at 0 used to close on a judgment with nowhere to go ("Dommage, le reste est
  // propre.") — real feedback: it read as a diss, not a friend. Every line here still states
  // the real fact (no active streak) but always ends on an open door, never a closed one; the
  // savage tone keeps its edge without losing the exit. Pairs with BraiseMascot's `sleepy` mood
  // (already built, just never wired to this state) and a real "reprendre" action in the UI —
  // resting, not disappointed.
  return byCombo(ctx, {
    'chill-college': [
      `Rang ${rankName}, ${badgesUnlocked}/${badgesTotal} badges. Une carte suffit pour relancer une série.`,
      `${rankName} avec ${badgesUnlocked}/${badgesTotal} badges déjà en poche. Prêt pour une nouvelle série ?`,
    ],
    'chill-lycee': [
      `Rang ${rankName}, ${badgesUnlocked}/${badgesTotal} badges au compteur. Une carte suffit pour relancer une série.`,
      `${badgesUnlocked}/${badgesTotal} badges, rang ${rankName}. Une série de plus et le tableau est complet.`,
    ],
    'savage-college': [
      `${rankName}, ${badgesUnlocked}/${badgesTotal} badges, aucune série en cours. Une carte, et on repart.`,
      `Rang ${rankName}, zéro série active. Une carte suffit pour la relancer.`,
    ],
    'savage-lycee': [
      `${rankName}, ${badgesUnlocked}/${badgesTotal} badges, aucune série active. Une carte, et c'est reparti.`,
      `Rang ${rankName} sans série en cours. T'as le niveau — une carte pour la relancer.`,
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

/** "Ce que Braise a remarqué" (Ton Aura) — the positive counterpart to progressAdvice's weak-point
 *  branch, only ever called with a real subject the student has actually mastered at least half of
 *  (see computeBraiseInsight in aura.ts) — never a generic "bravo", always the real subject name
 *  and the real "X/Y cartes" count. */
export function strongSubjectLine(ctx: VoiceCtx, subjectName: string, masteredCount: number, totalCount: number): string {
  return byCombo(ctx, {
    'chill-college': [`En ${subjectName}, t'es solide : ${masteredCount}/${totalCount} cartes maîtrisées. Ça se voit que ça rentre.`],
    'chill-lycee': [`${subjectName} : ${masteredCount}/${totalCount} cartes maîtrisées. Cette matière-là, tu la tiens.`],
    'savage-college': [`${masteredCount}/${totalCount} cartes maîtrisées en ${subjectName}. Ok, là je suis obligé d'admettre que tu gères.`],
    'savage-lycee': [`${subjectName}, ${masteredCount}/${totalCount} cartes. C'est le genre de matière où tu peux plus jouer la modestie.`],
  });
}

// BraiseRecap (Réviser's end-of-session screen) was the one real gap found when auditing where
// the tone system should apply but didn't: every line on it was hardcoded, completely ignoring
// personality/age, even though the session leading up to it (quizCorrect/quizWrong/verdictTag)
// is fully tone-branched — the one screen every Réviser session actually ends on suddenly went
// generic right at the payoff moment.

/** BraiseRecap's "cards" slide — reacts to whether the session was flawless (0 wrong) or not. */
export function recapCardsLine(ctx: VoiceCtx, wrongCount: number): string {
  if (wrongCount === 0) {
    return byCombo(ctx, {
      'chill-college': ['Sans-faute, direct !', 'Zéro erreur, trop fort.', 'Aucune erreur, direct.'],
      'chill-lycee': ['Sans-faute. Du solide.', 'Zéro erreur, bien joué.', 'Aucune faute, bien joué.'],
      'savage-college': ['Sans-faute ? Ok là je suis bluffé.', 'Zéro erreur. Suspect, mais bravo.', 'Zéro faute ? Ok, respect.'],
      'savage-lycee': ['Sans-faute. Le bac peut trembler.', "Zéro erreur, même moi j'avoue.", 'Aucune erreur. Le bac s\'inquiète.'],
    });
  }
  return byCombo(ctx, {
    'chill-college': ['Pas grave, on progresse.', 'Ça arrive à tout le monde, continue.', 'On note l\'erreur et on avance.'],
    'chill-lycee': ["Pas de souci, c'est comme ça qu'on apprend.", 'Ça arrive, on garde le rythme.', 'Ça arrive, on retient et on continue.'],
    'savage-college': ["Bon, personne n'est parfait. Sauf moi.", 'Quelques loupés, on efface et on repart.', 'Bon, on va dire que c\'était un échauffement.'],
    'savage-lycee': ["Y'a du déchet, mais on avance.", "Pas parfait, mais t'as pas lâché.", 'Pas net, mais t\'as tenu bon.'],
  });
}

/** BraiseRecap's "combo" slide — reacts to the real max combo streak that session. */
export function recapComboLine(ctx: VoiceCtx, maxCombo: number): string {
  if (maxCombo >= 4) {
    return byCombo(ctx, {
      'chill-college': ['INARRÊTABLE.', 'T\'ÉTAIS EN FEU.', 'T\'ÉTAIS DÉCHAÎNÉ.'],
      'chill-lycee': ['INARRÊTABLE.', 'DU LOURD.', 'SANS ARRÊT.'],
      'savage-college': ['OK LÀ J\'AVOUE.', 'MÊME MOI J\'AI EU PEUR.', 'BON, JE RECONNAIS.'],
      'savage-lycee': ['LE BAC A TREMBLÉ.', 'INARRÊTABLE, ÇA FAIT PEUR.', 'ÇA, C\'EST DU LOURD.'],
    });
  }
  return byCombo(ctx, {
    'chill-college': ['EN FEU.', 'BEAU RYTHME.', 'SOLIDE.'],
    'chill-lycee': ['EN FEU.', 'SOLIDE ENCHAÎNEMENT.', 'RÉGULIER.'],
    'savage-college': ['PAS MAL.', 'ÇA VA, ÇA VA.', 'PAS DÉGUEU.'],
    'savage-lycee': ['CORRECT.', 'ON A VU MIEUX, ON A VU PIRE.', 'ÇA PASSE.'],
  });
}

/** BraiseRecap's final trophy card — title + closing line. "Série", not "streak": the rest of
 *  the app (TodayStrip, Profil) never uses the English loanword, this line shouldn't be the one
 *  exception. */
export function recapTrophyLine(ctx: VoiceCtx): { title: string; sub: string } {
  return {
    title: byCombo(ctx, {
      'chill-college': ["C'EST DANS LA POCHE.", 'SESSION VALIDÉE.', 'BOUCLÉ.'],
      'chill-lycee': ["C'EST DANS LA POCHE.", 'SESSION BOUCLÉE.', 'NICKEL, C\'EST FAIT.'],
      'savage-college': ["BON, C'EST FAIT.", "VOILÀ, C'EST RÉGLÉ.", 'VOILÀ, T\'AS SURVÉCU.'],
      'savage-lycee': ["C'EST PLIÉ.", 'ENCORE UNE DE FAITE.', 'PLIÉ EN VITESSE.'],
    }),
    sub: byCombo(ctx, {
      'chill-college': ["Reviens demain, ta série t'attend.", 'À demain pour la suite !', 'On se voit demain.'],
      'chill-lycee': ["Reviens demain, ta série t'attend.", 'Rendez-vous demain pour continuer.', 'On se retrouve demain.'],
      'savage-college': ['Demain, même heure. Je compte les jours.', 'Reviens demain, sinon je le saurai.', 'Demain, rebelote.'],
      'savage-lycee': ['Demain, sans excuse.', 'Reviens demain — ta série te surveille.', 'Demain, même heure, sans excuse.'],
    }),
  };
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
