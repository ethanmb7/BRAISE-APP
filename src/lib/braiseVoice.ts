import type { AgeGroup, Personality } from '@/types';

// BRAISE se concentre sur le lycée (2024) — le collège n'est plus un niveau sélectionnable nulle
// part (voir LEVELS dans data.ts). Cette fonction ne fait donc plus de lookup, elle affirme
// directement le seul âge réel que l'app connaît désormais. `AgeGroup` garde 'college' comme
// valeur de type possible uniquement parce que RevisionsView.tsx compare encore `age === 'college'`
// dans sa logique de pondération des cartes (ligne volontairement non modifiée, à la demande
// explicite de ne pas toucher cette page) — cette branche ne s'exécute simplement plus jamais,
// ce n'est pas un oubli.
export function getAgeGroup(_levelId?: string | null): AgeGroup {
  return 'lycee';
}

export type VoiceCtx = { personality: Personality; age: AgeGroup };

function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

/** key = `${personality}-${age}` — `age` n'est plus jamais que 'lycee' (voir getAgeGroup
 *  ci-dessus), donc seules les entrées '-lycee' de chaque table ci-dessous sont encore
 *  atteignables ; les variantes '-college' ont été retirées plutôt que laissées mortes. */
function byCombo(ctx: VoiceCtx, table: Record<string, string[]>): string {
  return pick(table[`${ctx.personality}-${ctx.age}`]);
}

export function quizCorrect(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-lycee': ['Clean. T\'as le niveau.', 'Bien vu, c\'est du solide.', 'Nickel, tu maîtrises le sujet.'],
    'savage-lycee': ['Tiens, un neurone qui bosse. Respect.', 'Correct. Le bac te dit merci.', 'Bon ok, t\'as le droit d\'être fier de toi.'],
  });
}

// The "aïe" case — the student called INTOX on a claim that was actually true — used to be a
// single hardcoded line ("Le piège était là, celle-là était pourtant bonne.") with no variation
// at all, the one spot in the judge() flow that never rotated. Same byCombo system as
// quizWrong, its sibling for the other kind of miss (falling for an actual trap).
export function missedTruth(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-lycee': ['Pas de piège, celle-là était correcte.', 'Fausse alerte, cette fois c\'était la vérité.', 'Tu as flairé un piège qui n\'était pas là.'],
    'savage-lycee': ['Celle-là était réglo, fallait valider.', 'Excès de méfiance : elle était vraie.', 'Pas d\'embrouille ici, juste la vérité toute simple.'],
  });
}

// Étape 2 ("positionnement") de la boucle Capte : dire honnêtement "je ne sais pas" n'est pas une
// erreur à corriger, c'est l'information la plus utile que l'élève puisse donner à Braise — la
// voix doit donc rester clairement distincte de quizWrong, jamais une variante déguisée de "raté".
export function quizDontKnow(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-lycee': ["Pas de souci, c'est exactement pour ça qu'on est là.", 'Ok, on regarde ça calmement.', "Aucun stress, c'est une vraie question à creuser."],
    'savage-lycee': ["Au moins t'es honnête. On répare ça maintenant.", "Ok, pas de bluff. On regarde ce qui coince.", "Assumé, c'est déjà bien. On creuse."],
  });
}

export function quizWrong(ctx: VoiceCtx, topic?: string): string {
  const t = topic ? ` sur ${topic}` : '';
  return byCombo(ctx, {
    'chill-lycee': [`Raté${t}, mais c'est un classique. On décortique.`, 'Pas de souci, c\'est exactement le genre de piège à repérer.', 'Ok, petite erreur — regardons ce qui a coincé.'],
    'savage-lycee': [`Sérieux${t}, tu m'as fait mal au cœur là...`, 'Alors ça, c\'est ce qu\'on appelle un classique du contrôle raté.', 'Le correcteur du bac aurait pleuré. On corrige, vite.'],
  });
}

export function lessonComplete(ctx: VoiceCtx, name: string): string {
  return byCombo(ctx, {
    'chill-lycee': [`"${name}" bouclée. Beau travail, sérieusement.`, `Chapitre "${name}" validé. Tu tiens le rythme.`],
    'savage-lycee': [`"${name}" pliée. Le bac recule d'un pas, terrifié.`, `Bon, "${name}" c'est réglé. On efface, on passe à la suite.`],
  });
}

/** "Ton rythme du jour" (TodayStrip) — Braise's real daily-mood read on Aujourd'hui, the screen
 *  seen more than any other, and until now the one place on Home with zero personality branching:
 *  flat narration, same two lines for every student regardless of the ton they chose in Moi.
 *  Five real states, highest-priority first, resolved by the caller (TodayStrip) — never a
 *  templated "come back!" line, only what's actually true right now:
 *  - `freeze-danger`: the last gel de série is already spent (see toggleFreeze in store.tsx) and
 *    today isn't done yet — a heads-up, never a threat (PRODUCT_VISION.md explicitly bans
 *    streak-pressure guilt: this states the real fact and the real fix, nothing about "losing
 *    everything").
 *  - `returning`: streak at 0 but the device has real history (xp or completedChapters) — a real
 *    gap since the last session, not a brand-new account. A warm restart, not a scolding — same
 *    "resting, not disappointed" principle as BraiseMascot's `sleepy` mood everywhere else.
 *  - `goal-met-streak` / `goal-met-fresh`: today's goal is real and done — split so a student
 *    building day one of a fresh streak doesn't get "ta série continue" about a streak that isn't
 *    one yet.
 *  - `progressing`: the honest default — the real remaining count, nothing invented. */
export function todayRhythmLine(
  ctx: VoiceCtx,
  kind: 'freeze-danger' | 'returning' | 'goal-met-streak' | 'goal-met-fresh' | 'progressing',
  remaining = 0
): string {
  const s = remaining > 1 ? 's' : '';
  if (kind === 'freeze-danger') {
    return byCombo(ctx, {
      'chill-lycee': [`Plus de gel en réserve — une carte aujourd'hui garde ta série intacte.`],
      'savage-lycee': [`T'as plus de gel. Une carte aujourd'hui, et le sujet est clos.`],
    });
  }
  if (kind === 'returning') {
    return byCombo(ctx, {
      'chill-lycee': [`Ça faisait un bail. Une carte, et c'est reparti.`],
      'savage-lycee': [`Ah, te revoilà. Une carte et on efface l'absence.`],
    });
  }
  if (kind === 'goal-met-streak') {
    return byCombo(ctx, {
      'chill-lycee': [`Belle régularité : ta série continue.`],
      'savage-lycee': [`Objectif réglé, série intacte. Le bac recule.`],
    });
  }
  if (kind === 'goal-met-fresh') {
    return byCombo(ctx, {
      'chill-lycee': [`Ton objectif du jour est validé.`],
      'savage-lycee': [`Objectif réglé. Reste à voir si tu reviens demain.`],
    });
  }
  return byCombo(ctx, {
    'chill-lycee': [`Encore ${remaining} étape${s} avant de boucler.`],
    'savage-lycee': [`Il te reste ${remaining} étape${s}. Le bac attend.`],
  });
}

/** The one word above the student's own name in HeaderHUD — rendered on every single visit to
 *  Aujourd'hui, so it has to survive being seen many times a day without ever reading as a script.
 *  "Bonjour" (the previous, hardcoded value) was neutral to the point of institutional — the kind
 *  of greeting a bank app gives, not a pote. Deliberately short (the name sits right underneath,
 *  no need to repeat it here) and time-agnostic, since a session can happen at any hour. */
export function headerGreeting(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-lycee': ['Salut', 'Hey', 'Yo'],
    'savage-lycee': ['Alors', 'Tiens donc', 'Bon'],
  });
}

/** Short, visible hookline for the hero card — the chapter title and subject already have their
 *  own slots there, so unlike `dailyPickLine` this never repeats them; it only has to carry the
 *  personality tone in a few words. Onboarding's own first question justifies asking for a
 *  first name with "Braise a besoin d'un prénom pour te parler comme un vrai pote" — it was never
 *  actually used anywhere on Home, so that promise went unkept on the one screen seen the most.
 *  `userName` sits right at the start of every variant, not the end: this line is `truncate`d to
 *  one line in a narrow card, and CSS ellipsis always cuts from the end — if anything has to get
 *  clipped for a long name, it should be the flavour text, never the name itself. */
export function dailyHookLine(ctx: VoiceCtx, userName: string): string {
  return byCombo(ctx, {
    'chill-lycee': [`${userName}, ta session du jour, tranquille 🧠`, `Salut ${userName}, pioche du jour à ton rythme 🧠`],
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
      'chill-lycee': [
        `Rang ${rankName} débloqué, avec ${avatarUnlock} pour ton avatar en prime.`,
        `Nouveau rang : ${rankName}. Ton avatar vient de gagner ${avatarUnlock}.`,
      ],
      'savage-lycee': [
        `Rang ${rankName}. Le classement tremble, et ton avatar aussi — ${avatarUnlock} t'attend.`,
        `${rankName} débloqué. Ton avatar gagne ${avatarUnlock}, le bac recule encore d'un pas.`,
      ],
    });
  }
  return byCombo(ctx, {
    'chill-lycee': [`Rang ${rankName} débloqué. Beau parcours.`, `Nouveau rang : ${rankName}. Bien joué.`],
    'savage-lycee': [`Rang ${rankName}. Le classement tremble.`, `${rankName} débloqué. Le bac recule encore d'un pas.`],
  });
}

// The standing instruction over the verdict buttons on every flashcard. "Vrai ou Faux ?"
// used to exist only as a first-card tutorial chip — after that, nothing on the screen said
// what the student was supposed to do with Braise's message. Phrased as Braise daring you to
// call him out, not as an exercise header.
export function judgePrompt(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-lycee': [
      'Vrai, ou je raconte n\'importe quoi ?',
      'Tu valides ou tu me cales ?',
      'C\'est du solide ou pas, selon toi ?',
      'Vrai ou pas, qu\'est-ce que tu en dis ?',
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
// personality too, not just the outcome.
export function verdictTag(ctx: VoiceCtx, kind: 'carre' | 'super' | 'aie' | 'grille'): string {
  const tables: Record<typeof kind, Record<string, string[]>> = {
    carre: {
      'chill-lycee': ["💯 C'est carré", '🎯 En plein dans le mille', '✅ Solide', '🔥 Propre'],
      'savage-lycee': ["💯 C'est carré", '🎯 Dans le mille', '😏 Pas si nul finalement', '🔥 Ça poutre'],
    },
    super: {
      'chill-lycee': ['⚡ Super Braise', '⚡ Coup double réussi', '⚡ ×2, propre'],
      'savage-lycee': ['⚡ Super Braise', '⚡ Coup critique', '⚡ ×2 assumé'],
    },
    aie: {
      'chill-lycee': ['🙈 Aïe', '😬 Presque', '🙊 Celle-là était bonne pourtant'],
      'savage-lycee': ['🙈 Aïe', '😬 Trop de méfiance, là', '🙊 Elle était clean pourtant'],
    },
    grille: {
      'chill-lycee': ['💀 Grillé', '🎭 Piégé en beauté', '🙃 Roulé dans la farine'],
      'savage-lycee': ['💀 Grillé', '🎭 Tombé dans le panneau', '😵 Roulé sans forcer'],
    },
  };
  return byCombo(ctx, tables[kind]);
}

export function dailyPickLine(ctx: VoiceCtx, userName: string, subjectName: string, chapterTitle: string, duration: number): string {
  return byCombo(ctx, {
    'chill-lycee': [
      `${userName}, pioche du jour : "${chapterTitle}" en ${subjectName}. ${duration} minutes, tranquille.`,
      `Salut ${userName} ! Aujourd'hui c'est "${chapterTitle}" en ${subjectName}, ${duration} minutes top chrono.`,
    ],
    'savage-lycee': [
      `${userName}, tirage au sort du jour : "${chapterTitle}" en ${subjectName}. Le hasard ne négocie pas.`,
      `${userName}, la pioche a choisi "${chapterTitle}" en ${subjectName}. Aucune négociation possible.`,
    ],
  });
}

export function duelIntro(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-lycee': ['Un petit duel chrono, histoire de pimenter la révision ?', '60 secondes, toi contre Braise. Prêt ?'],
    'savage-lycee': ['Duel chrono. Si tu perds contre une IA, on n\'en parle à personne.', '60 secondes pour me prouver que t\'as pas juste scrollé tes révisions.'],
  });
}

export function duelResult(ctx: VoiceCtx, won: boolean): string {
  if (won) {
    return byCombo(ctx, {
      'chill-lycee': ['Victoire méritée, bien joué.', 'GG, la révision a payé.'],
      'savage-lycee': ['Tu gagnes. Je vais recalculer mes probabilités.', 'GG. Le bac a intérêt à se méfier.'],
    });
  }
  return byCombo(ctx, {
    'chill-lycee': ['Défaite honorable, on refait un round ?', 'Pas cette fois, mais c\'était serré.'],
    'savage-lycee': ['Victoire de Braise. La machine ne dort jamais.', 'Perdu. Le café ce soir, tu le mérites pas.'],
  });
}

/** Closing check-in line after Braise proactively opens a lesson conversation. */
export function lessonOpenerCheckIn(ctx: VoiceCtx): string {
  return byCombo(ctx, {
    'chill-lycee': [
      'Ça va, t\'as suivi ? Dis-moi si un point mérite d\'être creusé.',
      'Tout est clair ou il y a un passage à revoir ?',
      'Un truc à reclarifier avant qu\'on avance ?',
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
    'chill-lycee': [`Explique-moi "${topic}" comme si je découvrais complètement le sujet, vas-y je t'écoute.`],
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
      'chill-lycee': [
        `Rang ${rankName}, ${streak} jour${streak > 1 ? 's' : ''} d'affilée. La régularité paie, continue.`,
        `${badgesUnlocked}/${badgesTotal} badges, série de ${streak}. Beau parcours jusqu'ici.`,
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
    'chill-lycee': [
      `Rang ${rankName}, ${badgesUnlocked}/${badgesTotal} badges au compteur. Une carte suffit pour relancer une série.`,
      `${badgesUnlocked}/${badgesTotal} badges, rang ${rankName}. Une série de plus et le tableau est complet.`,
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
      'chill-lycee': [`Belle régularité. Concentre 10 min par jour sur "${weakTopic}" (${weakSubject}) cette semaine, c'est ton point de bascule.`],
      'savage-lycee': [`Solide globalement. "${weakTopic}" (${weakSubject}) reste ton talon d'Achille — 10 min par jour et c'est réglé.`],
    });
  }
  return byCombo(ctx, {
    'chill-lycee': ['Rien à signaler côté points faibles — belle régularité, garde le rythme.'],
    'savage-lycee': ['Zéro point faible détecté. Impressionnant — ou alors t\'as pas encore essayé les trucs durs.'],
  });
}

/** "Ce que Braise a remarqué" (Ton Aura) — the positive counterpart to progressAdvice's weak-point
 *  branch, only ever called with a real subject the student has actually mastered at least half of
 *  (see computeBraiseInsight in aura.ts) — never a generic "bravo", always the real subject name
 *  and the real "X/Y cartes" count. */
export function strongSubjectLine(ctx: VoiceCtx, subjectName: string, masteredCount: number, totalCount: number): string {
  return byCombo(ctx, {
    'chill-lycee': [`${subjectName} : ${masteredCount}/${totalCount} cartes maîtrisées. Cette matière-là, tu la tiens.`],
    'savage-lycee': [`${subjectName}, ${masteredCount}/${totalCount} cartes. C'est le genre de matière où tu peux plus jouer la modestie.`],
  });
}

// BraiseRecap (Réviser's end-of-session screen) was the one real gap found when auditing where
// the tone system should apply but didn't: every line on it was hardcoded, completely ignoring
// personality, even though the session leading up to it (quizCorrect/quizWrong/verdictTag)
// is fully tone-branched — the one screen every Réviser session actually ends on suddenly went
// generic right at the payoff moment.

/** BraiseRecap's "cards" slide — reacts to whether the session was flawless (0 wrong) or not. */
export function recapCardsLine(ctx: VoiceCtx, wrongCount: number): string {
  if (wrongCount === 0) {
    return byCombo(ctx, {
      'chill-lycee': ['Sans-faute. Du solide.', 'Zéro erreur, bien joué.', 'Aucune faute, bien joué.'],
      'savage-lycee': ['Sans-faute. Le bac peut trembler.', "Zéro erreur, même moi j'avoue.", 'Aucune erreur. Le bac s\'inquiète.'],
    });
  }
  return byCombo(ctx, {
    'chill-lycee': ["Pas de souci, c'est comme ça qu'on apprend.", 'Ça arrive, on garde le rythme.', 'Ça arrive, on retient et on continue.'],
    'savage-lycee': ["Y'a du déchet, mais on avance.", "Pas parfait, mais t'as pas lâché.", 'Pas net, mais t\'as tenu bon.'],
  });
}

/** BraiseRecap's "combo" slide — reacts to the real max combo streak that session. */
export function recapComboLine(ctx: VoiceCtx, maxCombo: number): string {
  if (maxCombo >= 4) {
    return byCombo(ctx, {
      'chill-lycee': ['INARRÊTABLE.', 'DU LOURD.', 'SANS ARRÊT.'],
      'savage-lycee': ['LE BAC A TREMBLÉ.', 'INARRÊTABLE, ÇA FAIT PEUR.', 'ÇA, C\'EST DU LOURD.'],
    });
  }
  return byCombo(ctx, {
    'chill-lycee': ['EN FEU.', 'SOLIDE ENCHAÎNEMENT.', 'RÉGULIER.'],
    'savage-lycee': ['CORRECT.', 'ON A VU MIEUX, ON A VU PIRE.', 'ÇA PASSE.'],
  });
}

/** BraiseRecap's final trophy card — title + closing line. "Série", not "streak": the rest of
 *  the app (TodayStrip, Profil) never uses the English loanword, this line shouldn't be the one
 *  exception. */
export function recapTrophyLine(ctx: VoiceCtx): { title: string; sub: string } {
  return {
    title: byCombo(ctx, {
      'chill-lycee': ["C'EST DANS LA POCHE.", 'SESSION BOUCLÉE.', 'NICKEL, C\'EST FAIT.'],
      'savage-lycee': ["C'EST PLIÉ.", 'ENCORE UNE DE FAITE.', 'PLIÉ EN VITESSE.'],
    }),
    sub: byCombo(ctx, {
      'chill-lycee': ["Reviens demain, ta série t'attend.", 'Rendez-vous demain pour continuer.', 'On se retrouve demain.'],
      'savage-lycee': ['Demain, même heure. Je compte les jours.', 'Reviens demain, sinon je le saurai.', 'Demain, rebelote.'],
    }),
  };
}

/** Extra instructions appended to the Mistral system prompt so free-text chat matches the chosen
 *  tone. Age no longer branches (BRAISE est lycée uniquement) — une seule ligne fixe plutôt qu'un
 *  ternaire qui ne pouvait plus jamais prendre sa seconde branche. */
export function toneSystemPrompt(ctx: VoiceCtx): string {
  const ageLine = 'L\'élève est au lycée (2nde-Terminale) : ton décontracté et direct, jamais scolaire, sans mots enfantins.';
  const personaLine =
    ctx.personality === 'savage'
      ? 'Mode "Coach Savage" activé : second degré assumé, petites piques amicales et sarcasme léger quand l\'élève se trompe, mais jamais méchant ni décourageant — ça reste un pote qui charrie, pas un prof qui humilie.'
      : 'Mode "Pote Chill" activé : encourageant, doux, décontracté, zéro pression, toujours bienveillant même face à une erreur.';
  return `${ageLine}\n${personaLine}`;
}
