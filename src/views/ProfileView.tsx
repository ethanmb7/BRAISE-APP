import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ChevronRight, Check, Pencil, X } from 'lucide-react';
import { useApp, computeUnlockedBadges, countDoneChapters } from '@/store';
import { sfx } from '@/lib/sound';
import { getRankInfo, RANKS } from '@/lib/aura';
import { useCountUp } from '@/lib/useCountUp';
import { getAgeGroup, profileReactionLine } from '@/lib/braiseVoice';
import { TopBar } from '@/components/TopBar';
import { RankIcon } from '@/components/RankIcon';
import { SubjectIcon } from '@/components/SubjectIcon';
import { BraiseMascot } from '@/components/BraiseMascot';
import { AvatarGlyph, getAvatarName } from '@/components/AvatarGlyph';
import { BADGES, SUBJECTS, AVATARS } from '@/data';
import type { Personality } from '@/types';

const PERSONAS: { id: Personality; title: string; sub: string }[] = [
  { id: 'chill', title: 'Pote Chill', sub: 'Encourageant, doux, zéro pression.' },
  { id: 'savage', title: 'Coach Savage', sub: 'Second degré, piques amicales assumées.' },
];

// Same rank-index comparison RankRail already uses (ProfilAuraView.tsx) — a rank-gated avatar
// unlocks the moment the account reaches that rank or any higher one, never re-locks later.
function isAvatarUnlocked(minRankId: string | undefined, currentRankId: string): boolean {
  if (!minRankId) return true;
  const minIdx = RANKS.findIndex((r) => r.id === minRankId);
  const currentIdx = RANKS.findIndex((r) => r.id === currentRankId);
  return currentIdx >= minIdx;
}

function formatShortDate(ts: number): string {
  return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const } },
};

export function ProfileView() {
  const { state, setView, setTab, setPersonality, setUser } = useApp();
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [draftName, setDraftName] = useState(state.user.name);
  const [draftAvatar, setDraftAvatar] = useState(state.user.avatar);

  const subjectsCount = state.user.subjects.length;
  const chaptersDone = countDoneChapters(state.completedChapters);
  // Distinct from "cartes maîtrisées" (shown on Aura) — this is raw effort, every card ever
  // opened in Réviser, mastered or not. Real apps show volume and mastery as two separate
  // numbers; until now this page only ever showed the second one.
  const cardsSeenCount = Object.keys(state.cardReviews).length;
  const badgeUnlocked = computeUnlockedBadges(state);
  const badgeUnlockedCount = Object.values(badgeUnlocked).filter(Boolean).length;
  const rankInfo = getRankInfo(state.xp);
  const rank = rankInfo.current;
  const animatedXp = useCountUp(state.xp);
  const rankName = rank.name;

  // Prochain avatar à débloquer — sert de sous-titre au rail : une raison de revenir, sans
  // recopier un seul chiffre de l'Aura.
  const nextAvatarHint = useMemo(() => {
    const next = AVATARS.find((a) => a.minRankId && !isAvatarUnlocked(a.minRankId, rank.id));
    if (!next) return null;
    const required = RANKS.find((r) => r.id === next.minRankId);
    return `${getAvatarName(next.emoji)} se débloque au rang ${required?.name}.`;
  }, [rank.id]);


  // Memoized on the real facts it depends on, not re-rolled on every render (e.g. opening the
  // identity editor or toggling a subject chip) — only changes when something Braise would
  // actually react to differently changes.
  const braiseTake = useMemo(
    () =>
      profileReactionLine(
        { personality: state.user.personality, age: getAgeGroup(state.user.level) },
        { rankName, streak: state.streak, badgesUnlocked: badgeUnlockedCount, badgesTotal: BADGES.length }
      ),
    [state.user.personality, state.user.level, rankName, state.streak, badgeUnlockedCount]
  );

  const openIdentityEdit = () => {
    sfx.tap(state.soundOn);
    setDraftName(state.user.name);
    setDraftAvatar(state.user.avatar);
    setEditingIdentity(true);
  };

  const saveIdentity = () => {
    sfx.tap(state.soundOn);
    setUser({ ...state.user, name: draftName.trim() || state.user.name, avatar: draftAvatar });
    setEditingIdentity(false);
  };

  const toggleUserSubject = (id: string) => {
    sfx.tap(state.soundOn);
    const has = state.user.subjects.includes(id);
    const next = has ? state.user.subjects.filter((s) => s !== id) : [...state.user.subjects, id];
    setUser({ ...state.user, subjects: next });
  };

  return (
    <div>
      <TopBar title="Profil" onBack={() => setView(state.tab)} />
      <motion.div className="view is-active" variants={staggerContainer} initial="hidden" animate="show">
        {!editingIdentity ? (
          <motion.div className="profile-hero-card" variants={staggerItem}>
            {/* Le "pass BRAISE" : une vraie carte d'accès plutôt qu'un bandeau décoratif —
                bande perforée en haut (les deux trous suggèrent le cordon), identité alignée
                à gauche comme sur un badge, rien de centré ni de générique. */}
            <div className="profile-pass-strip" style={{ background: `linear-gradient(125deg, ${rank.colorFrom}, ${rank.colorTo})` }}>
              <span className="profile-pass-punch" aria-hidden="true" />
              <span className="profile-hero-overline">Pass BRAISE</span>
              <span className="profile-hero-rank-pill">
                <RankIcon rankId={rank.id} color="#fff" size={12} />
                {rank.name}
              </span>
            </div>
            <div className="profile-hero-body">

              <div className="profile-hero-identity">
                <div className="profile-hero-avatar-stage">
                  <div
                    className="profile-hero-avatar-glow"
                    style={{ background: `radial-gradient(circle, ${rank.colorTo}80, transparent 70%)` }}
                  />
                  <button type="button" className="profile-hero-avatar" onClick={openIdentityEdit} aria-label="Modifier ton avatar et ton prénom">
                    <AvatarGlyph id={state.user.avatar} rankId={rank.id} size={58} />
                    <span className="profile-hero-edit-badge" aria-hidden="true">
                      <Pencil size={11} />
                    </span>
                  </button>
                </div>
                <div className="profile-hero-identity-main">
                  <h2 className="profile-hero-name">{state.user.name}</h2>
                  {state.user.joinedAt && <p className="profile-joined">Membre depuis le {formatShortDate(state.user.joinedAt)}</p>}
                </div>
              </div>


              {/* Braise's take — real facts (rank/série/badges), never generic filler; changes
                  when they actually change, so there's a real reason to come back and see what
                  he says now. `sleepy` at streak 0 (not `happy`) — resting and waiting for you,
                  never disappointed; the copy in profileReactionLine was rewritten to match
                  (always ends on an open door, never a flat diss). The "reprendre" link is the
                  actual door: a real jump into Révisions, not just a line with nowhere to go. */}
              <div className="profile-hero-bubble">
                <span className="profile-hero-bubble-icon" aria-hidden="true">
                  <BraiseMascot size={26} mood={state.streak > 0 ? 'proud' : 'sleepy'} />
                </span>
                <div>
                  <p>{braiseTake}</p>
                  {state.streak === 0 && (
                    <button
                      type="button"
                      className="profile-hero-bubble-cta"
                      onClick={() => {
                        sfx.tap(state.soundOn);
                        setTab('revisions');
                      }}
                    >
                      Réviser une carte →
                    </button>
                  )}
                </div>
              </div>

              {/* Un seul renvoi vers Aura — ni XP géant, ni ligne de stats ici : la progression
                  (XP, série, cartes, badges, rang) vit entièrement sur Ton Aura. Profil garde
                  l'identité et les réglages qui changent le comportement de l'appli. */}
              <button
                type="button"
                className="profile-aura-link"
                onClick={() => {
                  sfx.tap(state.soundOn);
                  setTab('progres');
                }}
              >
                <span className="profile-aura-link-badge" aria-hidden="true">
                  <RankIcon rankId={rank.id} color={rank.colorFrom} size={16} />
                </span>
                <span className="profile-aura-link-main">
                  <span className="profile-aura-link-label">Rang {rank.name}</span>
                  <span className="profile-aura-link-sub">{animatedXp} XP · voir ton parcours</span>
                </span>
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>

        ) : (
          <div className="profile-identity-edit">
            <div className="profile-avatar-picker">
              {AVATARS.map((a) => {
                const unlocked = isAvatarUnlocked(a.minRankId, rank.id);
                const requiredRank = a.minRankId ? RANKS.find((r) => r.id === a.minRankId) : null;
                return (
                  <button
                    key={a.emoji}
                    type="button"
                    className={`profile-avatar-option ${draftAvatar === a.emoji ? 'is-selected' : ''} ${unlocked ? '' : 'is-locked'}`}
                    onClick={() => {
                      if (!unlocked) return;
                      sfx.tap(state.soundOn);
                      setDraftAvatar(a.emoji);
                    }}
                    disabled={!unlocked}
                    aria-label={unlocked ? `Choisir l'avatar ${getAvatarName(a.emoji)}` : `Avatar verrouillé — débloqué au rang ${requiredRank?.name}`}
                  >
                    <AvatarGlyph id={a.emoji} rankId={rank.id} size={30} />
                    {!unlocked && (
                      <span className="profile-avatar-option-lock" aria-hidden="true">
                        <RankIcon rankId="" color="" locked size={11} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {(() => {
              const nextLockedAvatar = AVATARS.find((a) => a.minRankId && !isAvatarUnlocked(a.minRankId, rank.id));
              if (!nextLockedAvatar) return null;
              const requiredRank = RANKS.find((r) => r.id === nextLockedAvatar.minRankId);
              return (
                <p className="profile-avatar-unlock-hint">
                  {getAvatarName(nextLockedAvatar.emoji)} débloqué au rang {requiredRank?.name}
                </p>
              );
            })()}
            <input
              type="text"
              className="profile-name-input"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Ton prénom"
              maxLength={20}
              autoFocus
            />
            <div className="profile-identity-actions">
              <button
                type="button"
                className="profile-identity-cancel"
                onClick={() => {
                  sfx.tap(state.soundOn);
                  setEditingIdentity(false);
                }}
              >
                <X size={15} /> Annuler
              </button>
              <button type="button" className="profile-identity-save" onClick={saveIdentity}>
                <Check size={15} /> Enregistrer
              </button>
            </div>
          </div>
        )}

        {/* Unified card — badges/ton de Braise/matières as quiet settings-style rows instead of
            three separately bordered+shadowed blocks. Only the hero above gets the bold-border
            treatment; everything here stays deliberately calm by comparison. */}
        {/* No rank-progress bar and no "Parcours" badge timeline here anymore — both moved to
            Ton Aura, the one place progression/achievement now lives. Profil's own job is
            identity + how the app behaves for you, not a second copy of "how am I doing". */}
        {/* Choix de tête — sorti de la carte de réglages : c'est de l'identité, ça appartient
            juste sous le pass. Les avatars verrouillés montrent qu'il y a quelque chose à
            gagner en montant de rang, sans recopier un chiffre de l'Aura. */}
        <motion.section className="profile-face-card" variants={staggerItem}>
          <div className="profile-face-head">
            <span className="profile-face-label">Ta tête</span>
            <span className="profile-face-sub">{nextAvatarHint ?? 'Tout est débloqué. Respect.'}</span>
          </div>
          <div className="profile-avatar-rail">
            {AVATARS.map((a) => {
              const unlocked = isAvatarUnlocked(a.minRankId, rank.id);
              const requiredRank = a.minRankId ? RANKS.find((r) => r.id === a.minRankId) : null;
              return (
                <button
                  key={a.emoji}
                  type="button"
                  className={`profile-avatar-option ${state.user.avatar === a.emoji ? 'is-selected' : ''} ${unlocked ? '' : 'is-locked'}`}
                  onClick={() => {
                    if (!unlocked) return;
                    sfx.tap(state.soundOn);
                    setUser({ ...state.user, avatar: a.emoji });
                  }}
                  disabled={!unlocked}
                  aria-label={unlocked ? `Choisir l'avatar ${getAvatarName(a.emoji)}` : `Avatar verrouillé — débloqué au rang ${requiredRank?.name}`}
                >
                  <AvatarGlyph id={a.emoji} rankId={rank.id} size={32} />
                  {!unlocked && (
                    <span className="profile-avatar-option-lock" aria-hidden="true">
                      <RankIcon rankId="" color="" locked size={11} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.section>

        <motion.div className="uni-card" variants={staggerItem}>
          <div className="uni-row">
            <div className="uni-row-main">
              <span className="uni-row-label">Ton Braise</span>
              <span className="uni-row-sub">{PERSONAS.find((p) => p.id === state.user.personality)?.sub}</span>
            </div>
            <div className="seg-track">
              <div className={`seg-thumb ${state.user.personality === 'savage' ? 'is-right' : ''}`} aria-hidden="true" />
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`seg-opt ${state.user.personality === p.id ? 'is-active' : ''}`}
                  onClick={() => {
                    sfx.tap(state.soundOn);
                    setPersonality(p.id);
                  }}
                  aria-pressed={state.user.personality === p.id}
                >
                  {p.id === 'chill' ? 'Chill' : 'Savage'}
                </button>
              ))}
            </div>
          </div>

          {/* Matières — real toggles, not a static recap: these picks weight which cards come up
              more often in Réviser (see RevisionsView's priority scoring), so showing them as
              inert text would hide a real effect from the one person it affects. */}
          <div className="uni-row stacked">
            <div className="uni-row-main">
              <span className="uni-row-label">Mes matières ({subjectsCount})</span>
              <span className="uni-row-sub">Favorisées pendant tes révisions — touche pour changer.</span>
            </div>
            <div className="uni-chips">
              {SUBJECTS.map((s) => {
                const active = state.user.subjects.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`profile-subject-chip ${active ? 'is-active' : ''}`}
                    onClick={() => toggleUserSubject(s.id)}
                    aria-pressed={active}
                  >
                    <SubjectIcon subjectId={s.id} color={s.color} size={15} /> {s.name}
                  </button>
                );
              })}
            </div>
          </div>

        </motion.div>


        {/* Settings link — the one bridge Profil keeps: Paramètres is the deeper configuration
            layer (son, thème, dyslexie), Profil itself only holds identity + the two preferences
            that affect Braise directly (ton, matières). Sharing moved to Aura too — showing off
            what you've accomplished belongs with the page that IS accomplishment, not here. */}
        <motion.div variants={staggerItem}>
          <button type="button" className="profile-settings-link" onClick={() => { sfx.tap(state.soundOn); setView('settings'); }}>
            <span className="profile-settings-link-label">
              <Settings size={18} color="var(--ink-soft)" />
              Paramètres
            </span>
            <ChevronRight size={18} color="var(--ink-soft)" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
