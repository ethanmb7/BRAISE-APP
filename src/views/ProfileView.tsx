import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ChevronRight, Check, Pencil, X, Share2 } from 'lucide-react';
import { useApp, computeUnlockedBadges, countDoneChapters } from '@/store';
import { sfx } from '@/lib/sound';
import { getRankInfo, badgeRemainingLabel, nextBadgeHint, countMasteredCards, RANKS } from '@/lib/aura';
import { useCountUp } from '@/lib/useCountUp';
import { getAgeGroup, profileReactionLine } from '@/lib/braiseVoice';
import { getBadgeUnlockedAtMap } from '@/lib/celebrations';
import { TopBar } from '@/components/TopBar';
import { BadgeIcon } from '@/components/BadgeIcon';
import { RankIcon } from '@/components/RankIcon';
import { SubjectIcon } from '@/components/SubjectIcon';
import { BraiseMascot } from '@/components/BraiseMascot';
import { ShareAuraModal } from '@/components/ShareAuraModal';
import { BADGES, SUBJECTS, AVATARS, FLASHCARDS } from '@/data';
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
  const [shareOpen, setShareOpen] = useState(false);

  const subjectsCount = state.user.subjects.length;
  const chaptersDone = countDoneChapters(state.completedChapters);
  // Distinct from "cartes maîtrisées" (shown on Aura) — this is raw effort, every card ever
  // opened in Réviser, mastered or not. Real apps show volume and mastery as two separate
  // numbers; until now this page only ever showed the second one.
  const cardsSeenCount = Object.keys(state.cardReviews).length;
  const badgeUnlocked = computeUnlockedBadges(state);
  const badgeUnlockedCount = Object.values(badgeUnlocked).filter(Boolean).length;
  const badgeUnlockedAt = useMemo(() => getBadgeUnlockedAtMap(), [badgeUnlocked]);
  const rankInfo = getRankInfo(state.xp);
  const rank = rankInfo.current;
  // A 12%-full bar and a 96%-full bar read as the same "in progress" state today — no
  // different treatment for the stretch where anticipation is actually highest. Real games and
  // Duolingo both intensify near a threshold; this mirrors that with data already computed
  // (rankInfo.pct), not a new mechanic. Foreshadows the NEXT rank's own colour (not the current
  // one) — a preview of what's about to unlock, the same idea as the badge timeline's ghost node.
  const isAlmostThere = Boolean(rankInfo.next) && rankInfo.pct >= 90;
  const animatedXp = useCountUp(state.xp);
  const rankName = rank.name;

  // The unified card's "Parcours" row — the single record of what happened, oldest first.
  // Badges unlocked before this session added real unlock-date tracking have no timestamp
  // (never fabricated), so they sort first and render without a date instead of a fake one.
  const unlockedBadgesSorted = useMemo(
    () => BADGES.filter((b) => badgeUnlocked[b.id]).sort((a, b) => (badgeUnlockedAt[a.id] ?? 0) - (badgeUnlockedAt[b.id] ?? 0)),
    [badgeUnlocked, badgeUnlockedAt]
  );
  // Same real "closest locked badge" data already used on Aura's own badge bridge — the
  // timeline's dashed ghost node, never a fabricated "coming soon".
  const nextHint = useMemo(() => nextBadgeHint({ streak: state.streak, xp: state.xp }, badgeUnlocked), [state.streak, state.xp, badgeUnlocked]);

  // Same derivation as Aura's own share button — real distinct-subjects-reviewed count, not a
  // second, possibly-diverging computation of "how many subjects".
  const reviewedSubjectsCount = useMemo(
    () =>
      new Set(
        Object.keys(state.cardReviews).map((id) => FLASHCARDS.find((c) => c.id === id)?.subject).filter(Boolean)
      ).size,
    [state.cardReviews]
  );
  const masteredCards = useMemo(() => countMasteredCards(state.cardReviews), [state.cardReviews]);

  // Memoized on the real facts it depends on, not re-rolled on every render (e.g. opening the
  // identity editor or toggling a subject chip) — only changes when something Braise would
  // actually react to differently changes.
  const braiseTake = useMemo(
    () =>
      profileReactionLine(
        { personality: state.user.personality, age: getAgeGroup(state.user.level) },
        { rankName, streak: state.streak, badgesUnlocked: badgeUnlockedCount, badgesTotal: BADGES.length }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleShareOpen = () => {
    sfx.tap(state.soundOn);
    if (navigator.vibrate) navigator.vibrate(10);
    setShareOpen(true);
  };
  const handleShareClose = () => setShareOpen(false);

  return (
    <div>
      <TopBar title="Profil" onBack={() => setView(state.tab)} />
      <motion.div className="view is-active" variants={staggerContainer} initial="hidden" animate="show">
        {!editingIdentity ? (
          <motion.div className="profile-hero-card" variants={staggerItem}>
            <div className="profile-hero-banner" style={{ background: `linear-gradient(125deg, ${rank.colorFrom}, ${rank.colorTo})` }}>
              <div className="profile-hero-rank-pill">
                <RankIcon rankId={rank.id} color={rank.colorFrom} size={14} />
                {rank.name}
              </div>
            </div>
            <div className="profile-hero-body">
              <div className="profile-hero-avatar-stage">
                <div
                  className="profile-hero-avatar-glow"
                  style={{ background: `radial-gradient(circle, ${rank.colorTo}80, transparent 70%)` }}
                />
                <div
                  className="profile-hero-avatar-ring"
                  style={{ background: `conic-gradient(${rank.colorFrom}, ${rank.colorTo}, ${rank.colorFrom})` }}
                />
                <button type="button" className="profile-hero-avatar" onClick={openIdentityEdit} aria-label="Modifier ton avatar et ton prénom">
                  {state.user.avatar}
                  <span className="profile-hero-edit-badge" aria-hidden="true">
                    <Pencil size={11} />
                  </span>
                </button>
              </div>
              <h2 className="profile-hero-name">{state.user.name}</h2>
              {state.user.joinedAt && <p className="profile-joined">Membre depuis le {formatShortDate(state.user.joinedAt)}</p>}

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

              <div className="profile-hero-num">{animatedXp}</div>
              <div className="profile-hero-lbl">XP</div>

              <div className="profile-hero-mini-row">
                <div className="profile-hero-mini">
                  <b>{state.streak}</b>
                  <span>jours</span>
                </div>
                <div className="profile-hero-mini">
                  <b>{cardsSeenCount}</b>
                  <span>cartes</span>
                </div>
                <div className="profile-hero-mini">
                  <b>{chaptersDone}</b>
                  <span>{chaptersDone > 1 ? 'chapitres' : 'chapitre'}</span>
                </div>
              </div>
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
                    aria-label={unlocked ? `Choisir l'avatar ${a.emoji}` : `Avatar verrouillé — débloqué au rang ${requiredRank?.name}`}
                  >
                    {a.emoji}
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
                  {nextLockedAvatar.emoji} débloqué au rang {requiredRank?.name}
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
        <motion.div className="uni-card" variants={staggerItem}>
          <div
            className="uni-row progress-row stacked"
            style={{
              background: isAlmostThere
                ? state.darkMode
                  ? `linear-gradient(120deg, ${rankInfo.next!.colorFrom}26, ${rankInfo.next!.colorTo}14)`
                  : `linear-gradient(120deg, ${rankInfo.next!.colorFrom}73, ${rankInfo.next!.colorTo}2b)`
                : state.darkMode
                  ? `linear-gradient(120deg, ${rank.colorFrom}1a, ${rank.colorTo}0f)`
                  : `linear-gradient(120deg, ${rank.colorFrom}59, ${rank.colorTo}1f)`,
            }}
          >
            <div className="rank-progress">
              <div className="rank-progress-head">
                <b>
                  {rankInfo.next ? `${rank.name} → ${rankInfo.next.name}` : `${rank.name} — rang maximum`}
                  {isAlmostThere && (
                    <span
                      className="rank-progress-almost"
                      style={{ background: `${rankInfo.next!.colorTo}38`, borderColor: rankInfo.next!.colorTo }}
                    >
                      Presque !
                    </span>
                  )}
                </b>
                <span>{rankInfo.next ? `${rankInfo.next.min - state.xp} XP restants` : 'Atteint'}</span>
              </div>
              <div className="rank-progress-track">
                <div
                  className="rank-progress-fill"
                  style={{
                    width: `${rankInfo.pct}%`,
                    background: `linear-gradient(90deg, ${rank.colorFrom}, ${rank.colorTo})`,
                    boxShadow: isAlmostThere ? `0 0 8px ${rankInfo.next!.colorTo}80` : 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Parcours — the single record of what happened (real unlock dates), ending in a
              dashed ghost node for what's next (real nextBadgeHint data). Replaces the old
              badges-count dot row, which said the same "x/6" this already shows. */}
          <div className="uni-row stacked">
            <div className="uni-row-main">
              <span className="uni-row-label">Parcours</span>
              <span className="uni-row-sub">
                {badgeUnlockedCount} badge{badgeUnlockedCount > 1 ? 's' : ''} débloqué{badgeUnlockedCount > 1 ? 's' : ''} sur {BADGES.length}
              </span>
            </div>
            <div className="timeline-row">
              {unlockedBadgesSorted.map((b) => (
                <div className="timeline-item" key={b.id}>
                  <div className="timeline-line" aria-hidden="true" />
                  <div className="timeline-dot">
                    <BadgeIcon badgeId={b.id} size={14} />
                  </div>
                  <span className="timeline-date">{badgeUnlockedAt[b.id] ? formatShortDate(badgeUnlockedAt[b.id]) : ''}</span>
                </div>
              ))}
              {nextHint && (
                <div className="timeline-item">
                  <div className="timeline-line" aria-hidden="true" />
                  <div className="timeline-dot ghost">
                    <BadgeIcon badgeId={nextHint.badgeId} size={14} />
                  </div>
                  <span className="timeline-date ghost">
                    {badgeRemainingLabel(nextHint.badgeId, { streak: state.streak, xp: state.xp }) ?? BADGES.find((b) => b.id === nextHint.badgeId)?.cond}
                  </span>
                </div>
              )}
            </div>
          </div>

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

        <motion.button type="button" className="profile-hero-cta" onClick={handleShareOpen} variants={staggerItem}>
          <Share2 size={16} />
          Partager mon profil
        </motion.button>

        {/* Settings link */}
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

      {shareOpen && (
        <ShareAuraModal
          rank={rank}
          streak={state.streak}
          xp={state.xp}
          subjectsCount={reviewedSubjectsCount}
          masteredCards={masteredCards}
          onClose={handleShareClose}
        />
      )}
    </div>
  );
}
