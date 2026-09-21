import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ChevronRight, Check, Pencil, X } from 'lucide-react';
import { useApp, computeUnlockedBadges, countDoneChapters } from '@/store';
import { sfx } from '@/lib/sound';
import { getRankInfo, badgeRemainingLabel } from '@/lib/aura';
import { getAgeGroup, profileReactionLine } from '@/lib/braiseVoice';
import { getBadgeUnlockedAtMap } from '@/lib/celebrations';
import { TopBar } from '@/components/TopBar';
import { StreakFlameIcon } from '@/components/StreakFlameIcon';
import { BadgeIcon } from '@/components/BadgeIcon';
import { SubjectIcon } from '@/components/SubjectIcon';
import { BraiseMascot } from '@/components/BraiseMascot';
import { BADGES, SUBJECTS, AVATARS } from '@/data';
import type { Badge, Personality } from '@/types';

const PERSONAS: { id: Personality; title: string; sub: string }[] = [
  { id: 'chill', title: 'Pote Chill', sub: 'Encourageant, doux, zéro pression.' },
  { id: 'savage', title: 'Coach Savage', sub: 'Second degré, piques amicales assumées.' },
];

// b1/b5 (3j/7j de série) and b2/b6 (100/1000 XP) are already two tiers of the same achievement
// in the underlying data — the badge grid just never showed that relationship, displaying all 6
// as unrelated flat cards. Grouping them visually (à la Khan Academy's tiered badges) needed no
// new data, just this pairing made explicit. b3/b4 have no second tier, so they stay standalone.
const BADGE_TIERS: { title: string; ids: [string, string] }[] = [
  { title: 'Série', ids: ['b1', 'b5'] },
  { title: 'XP', ids: ['b2', 'b6'] },
];
const STANDALONE_BADGE_IDS = ['b3', 'b4'];

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

function BadgeTile({
  badge,
  unlocked,
  unlockedAt,
  remainingLabel,
}: {
  badge: Badge;
  unlocked: boolean;
  unlockedAt?: number;
  remainingLabel?: string | null;
}) {
  const condText = unlocked
    ? unlockedAt
      ? `Débloqué le ${formatShortDate(unlockedAt)}`
      : badge.cond
    : (remainingLabel ?? badge.cond);
  return (
    <div className={`badge ${unlocked ? '' : 'locked'}`}>
      <div className="ring" style={unlocked ? { background: '#eff3ff' } : {}}>
        <BadgeIcon badgeId={badge.id} size={26} />
      </div>
      <span>{badge.name}</span>
      <span className="cond">{condText}</span>
    </div>
  );
}

// Last two raw platform glyphs (☕⚡) left on this page once badges/streak/XP were already
// vectorial — same flat-fill + #151821-stroke construction as SubjectIcon/BadgeIcon. The bolt
// reuses the exact path already established for XP/b2/b6 rather than drawing a new one.
function PersonaIcon({ id }: { id: Personality }) {
  if (id === 'savage') {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 1.5 3.5 13.8h6.2l-1 8.7L19.5 9h-6.4l1.2-7.5Z" fill="#ffc700" stroke="#151821" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9 L19 9 L18 18 C17.8 19.6 16.5 20.5 15 20.5 L9 20.5 C7.5 20.5 6.2 19.6 6 18 Z" fill="#c9915a" stroke="#151821" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M19 10.3 C22.2 10.3 22.2 15.8 19 15.8" fill="none" stroke="#151821" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.3 7 C8.8 6 9.3 5 8.8 4" fill="none" stroke="#151821" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M14.3 7 C13.8 6 14.3 5 13.8 4" fill="none" stroke="#151821" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function ProfileView() {
  const { state, setView, setPersonality, setUser } = useApp();
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
  const badgeUnlockedAt = useMemo(() => getBadgeUnlockedAtMap(), [badgeUnlocked]);
  const rankName = getRankInfo(state.xp).current.name;

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

  return (
    <div>
      <TopBar title="Profil" onBack={() => setView(state.tab)} />
      <motion.div className="view is-active" variants={staggerContainer} initial="hidden" animate="show">
        {/* Avatar + name */}
        {!editingIdentity ? (
          <motion.div className="profile-identity" variants={staggerItem}>
            <button type="button" className="profile-avatar" onClick={openIdentityEdit} aria-label="Modifier ton avatar et ton prénom">
              {state.user.avatar}
              <span className="profile-avatar-edit" aria-hidden="true">
                <Pencil size={11} />
              </span>
            </button>
            <h2 className="profile-name">{state.user.name}</h2>
            <p className="profile-sub">
              {state.user.levelLabel} · {state.user.goal}
            </p>
            {state.user.joinedAt && <p className="profile-joined">Membre depuis le {formatShortDate(state.user.joinedAt)}</p>}
          </motion.div>
        ) : (
          <div className="profile-identity-edit">
            <div className="profile-avatar-picker">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`profile-avatar-option ${draftAvatar === a ? 'is-selected' : ''}`}
                  onClick={() => {
                    sfx.tap(state.soundOn);
                    setDraftAvatar(a);
                  }}
                  aria-label={`Choisir l'avatar ${a}`}
                >
                  {a}
                </button>
              ))}
            </div>
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
              <button type="button" className="profile-identity-cancel" onClick={() => setEditingIdentity(false)}>
                <X size={15} /> Annuler
              </button>
              <button type="button" className="profile-identity-save" onClick={saveIdentity}>
                <Check size={15} /> Enregistrer
              </button>
            </div>
          </div>
        )}

        {/* Braise's take — real facts (rank/série/badges), never generic filler; changes when
            they actually change, so there's a real reason to come back and see what he says now. */}
        <motion.div className="profile-braise-take" variants={staggerItem}>
          <span className="profile-braise-take-icon" aria-hidden="true">
            <BraiseMascot size={34} mood={state.streak > 0 ? 'proud' : 'happy'} />
          </span>
          <p className="profile-braise-take-text">{braiseTake}</p>
        </motion.div>

        {/* Stats */}
        <motion.div className="profile-stats" variants={staggerItem}>
          <div className="pstat">
            <b>{state.streak}</b>
            <span className="flex items-center justify-center gap-1">
              jours <StreakFlameIcon size={13} />
            </span>
          </div>
          <div className="pstat">
            <b>{state.xp}</b>
            <span className="flex items-center justify-center gap-1">
              XP
              <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13 1.5 3.5 13.8h6.2l-1 8.7L19.5 9h-6.4l1.2-7.5Z" fill="#ffc700" stroke="#151821" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <div className="pstat">
            <b>{cardsSeenCount}</b>
            <span className="flex items-center justify-center gap-1">
              cartes vues
              <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 6.5 C10.3 5 7.7 4.7 5 5.6 L5 18.1 C7.7 17.2 10.3 17.5 12 19 C13.7 17.5 16.3 17.2 19 18.1 L19 5.6 C16.3 4.7 13.7 5 12 6.5 Z"
                  fill="#818cf8"
                  stroke="#151821"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <div className="pstat">
            <b>{chaptersDone}</b>
            <span>chapitres</span>
          </div>
        </motion.div>

        {/* Personality */}
        <motion.div variants={staggerItem}>
          <span className="profile-tag">Personnalité de Braise</span>
          <div className="persona-grid">
            {PERSONAS.map((p) => {
              const active = state.user.personality === p.id;
              return (
                <button
                  key={p.id}
                  className={`persona-card ${active ? 'is-active' : ''}`}
                  onClick={() => {
                    sfx.tap(state.soundOn);
                    setPersonality(p.id);
                  }}
                >
                  {active && (
                    <span className="persona-check">
                      <Check size={11} />
                    </span>
                  )}
                  <span className="persona-emoji"><PersonaIcon id={p.id} /></span>
                  <b>{p.title}</b>
                  <span className="persona-sub">{p.sub}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Badges — b1/b5 and b2/b6 grouped as tiers of one achievement (see BADGE_TIERS above)
            instead of 6 unrelated flat cards; real unlock dates once available. */}
        <motion.div variants={staggerItem}>
          <span className="profile-tag">Mes badges</span>
          <div className="profile-tier-groups">
            {BADGE_TIERS.map((group) => (
              <div className="profile-tier-row" key={group.title}>
                <span className="profile-tier-title">{group.title}</span>
                <div className="profile-tier-nodes">
                  {group.ids.map((id, i) => {
                    const badge = BADGES.find((b) => b.id === id)!;
                    return (
                      <div className="profile-tier-node-wrap" key={id}>
                        <BadgeTile
                          badge={badge}
                          unlocked={badgeUnlocked[id]}
                          unlockedAt={badgeUnlockedAt[id]}
                          remainingLabel={badgeRemainingLabel(id, { streak: state.streak, xp: state.xp })}
                        />
                        {i === 0 && <span className="profile-tier-arrow" aria-hidden="true">→</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="profile-standalone-badges">
            {STANDALONE_BADGE_IDS.map((id) => {
              const badge = BADGES.find((b) => b.id === id)!;
              return <BadgeTile key={id} badge={badge} unlocked={badgeUnlocked[id]} unlockedAt={badgeUnlockedAt[id]} />;
            })}
          </div>
        </motion.div>

        {/* Subjects — real toggles, not a static recap: these picks weight which cards come up
            more often in Réviser (see RevisionsView's priority scoring), so showing them as
            inert text would hide a real effect from the one person it affects. */}
        <motion.div variants={staggerItem}>
        <span className="profile-tag" style={{ marginTop: 20 }}>
          Mes matières ({subjectsCount})
        </span>
        <p className="profile-subjects-hint">Favorisées pendant tes révisions — touche pour changer.</p>
        <div className="profile-subject-chips">
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
        </motion.div>

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
    </div>
  );
}
