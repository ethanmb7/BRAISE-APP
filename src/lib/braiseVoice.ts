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

export function dailyPickLine(ctx: VoiceCtx, subjectName: string, chapterTitle: string): string {
  return byCombo(ctx, {
    'chill-college': [`Aujourd'hui, Braise a pioché "${chapterTitle}" (${subjectName}) pour toi. 3 min, zéro pression.`],
    'chill-lycee': [`Pioche du jour : "${chapterTitle}" en ${subjectName}. 3 minutes, tranquille.`],
    'savage-college': [`Le sort en a décidé : "${chapterTitle}" (${subjectName}). Tu peux pas fuir, désolé.`],
    'savage-lycee': [`Tirage au sort du jour : "${chapterTitle}" en ${subjectName}. Le hasard ne négocie pas.`],
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
