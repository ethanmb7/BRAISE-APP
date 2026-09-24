import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ChevronRight, Check, Pencil, X, MessageCircle, BookOpen, GraduationCap } from 'lucide-react';
import { useApp, computeUnlockedBadges } from '@/store';
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
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(state.user.name);

  const subjectsCount = state.user.subjects.length;
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
  // name editor or toggling a subject chip) — only changes when something Braise would
  // actually react to differently changes.
  const braiseTake = useMemo(
    () =>
      profileReactionLine(
        { personality: state.user.personality, age: getAgeGroup(state.user.level) },
        { rankName, streak: state.streak, badgesUnlocked: badgeUnlockedCount, badgesTotal: BADGES.length }
      ),
    [state.user.personality, state.user.level, rankName, state.streak, badgeUnlockedCount]
  );

  const openNameEdit = () => {
    sfx.tap(state.soundOn);
    setDraftName(state.user.name);
    setEditingName(true);
  };

  const saveName = () => {
    sfx.tap(state.soundOn);
    setUser({ ...state.user, name: draftName.trim() || state.user.name });
    setEditingName(false);
  };

  const cancelName = () => {
    sfx.tap(state.soundOn);
    setEditingName(false);
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
      <motion.div className="view is-active profile-view" variants={staggerContainer} initial="hidden" animate="show">
        {/* Le "pass BRAISE" — même coque que les cartes de Ton Aura (bordure 2.5px, rayon 22px,
            ombre dure 4px) pour que les deux écrans lisent comme une seule famille. L'édition du
            prénom se fait dans la carte : elle ne disparaît plus au profit d'un second
            sélecteur d'avatar (le rail « Ta tête » juste dessous suffit). */}
        <motion.div className="profile-hero-card" variants={staggerItem}>
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
                <div className="profile-hero-avatar">
                  <AvatarGlyph id={state.user.avatar} rankId={rank.id} size={58} />
                </div>
              </div>

              <div className="profile-hero-identity-main">
                {editingName ? (
                  <form
                    className="profile-name-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveName();
                    }}
                  >
                    <label htmlFor="profile-name" className="sr-only">
                      Ton prénom
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      className="profile-name-input"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') cancelName();
                      }}
                      placeholder="Ton prénom"
                      maxLength={20}
                      autoFocus
                    />
                    <div className="profile-identity-actions">
                      <button type="button" className="profile-identity-cancel" onClick={cancelName} aria-label="Annuler">
                        <X size={16} />
                      </button>
                      <button type="submit" className="profile-identity-save">
                        <Check size={16} /> OK
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="profile-hero-name-row">
                      <h2 className="profile-hero-name">{state.user.name}</h2>
                      <button type="button" className="profile-hero-edit" onClick={openNameEdit} aria-label="Modifier ton prénom">
                        <Pencil size={13} />
                      </button>
                    </div>
                    <div className="profile-hero-meta">
                      {state.user.levelLabel && (
                        <span className="profile-hero-chip">
                          <GraduationCap size={13} aria-hidden="true" />
                          {state.user.levelLabel}
                        </span>
                      )}
                      {state.user.joinedAt && <span className="profile-joined">Depuis le {formatShortDate(state.user.joinedAt)}</span>}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Braise's take — real facts (rank/série/badges), never generic filler; changes
                when they actually change. `sleepy` at streak 0 (not `happy`) — resting and
                waiting for you, never disappointed. The "reprendre" link is the actual door: a
                real jump into Révisions, not just a line with nowhere to go. */}
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

            {/* Un seul renvoi vers Aura — la progression (XP, série, cartes, badges, rang) vit
                entièrement sur Ton Aura. Profil garde l'identité et les réglages qui changent le
                comportement de l'appli. */}
            <button
              type="button"
              className="profile-link-row profile-aura-link"
              onClick={() => {
                sfx.tap(state.soundOn);
                setView('progres');
              }}
            >
              <span className="profile-aura-link-badge" aria-hidden="true">
                <RankIcon rankId={rank.id} color={rank.colorFrom} size={16} />
              </span>
              <span className="profile-link-main">
                <span className="profile-link-label">Rang {rank.name}</span>
                <span className="profile-link-sub">{animatedXp} XP · voir ton parcours</span>
              </span>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </motion.div>

        {/* Choix de tête — même coque et même onglet orange que les sections de Ton Aura
            (« Maîtrise par matière », « Ce que Braise a remarqué »). Les avatars verrouillés
            montrent qu'il y a quelque chose à gagner en montant de rang. */}
        <motion.section className="profile-section" variants={staggerItem} aria-labelledby="profile-face-title">
          <span id="profile-face-title" className="profile-section-tab">Ta tête</span>
          <p className="profile-section-sub">{nextAvatarHint ?? 'Tout est débloqué. Respect.'}</p>
          <div className="profile-avatar-rail">
            {AVATARS.map((a) => {
              const unlocked = isAvatarUnlocked(a.minRankId, rank.id);
              const requiredRank = a.minRankId ? RANKS.find((r) => r.id === a.minRankId) : null;
              const selected = state.user.avatar === a.emoji;
              return (
                <button
                  key={a.emoji}
                  type="button"
                  className={`profile-avatar-option ${selected ? 'is-selected' : ''} ${unlocked ? '' : 'is-locked'}`}
                  onClick={() => {
                    if (!unlocked) return;
                    sfx.tap(state.soundOn);
                    setUser({ ...state.user, avatar: a.emoji });
                  }}
                  disabled={!unlocked}
                  aria-pressed={selected}
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

        {/* Préférences — ce qui change réellement le comportement de Braise. Rangées au format
            de Paramètres (tuile d'icône orange, libellé lisible), dans la coque des cartes Aura. */}
        <motion.section className="profile-section" variants={staggerItem} aria-labelledby="profile-prefs-title">
          <span id="profile-prefs-title" className="profile-section-tab">Tes préférences</span>

          <div className="profile-pref-row">
            <span className="settings-row-icon" aria-hidden="true">
              <MessageCircle size={18} />
            </span>
            <div className="profile-pref-main">
              <span className="profile-pref-label">Ton de Braise</span>
              <span className="profile-pref-sub">{PERSONAS.find((p) => p.id === state.user.personality)?.sub}</span>
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
              more often in Réviser (see RevisionsView's priority scoring). */}
          <div className="profile-pref-row is-stacked">
            <div className="profile-pref-head">
              <span className="settings-row-icon" aria-hidden="true">
                <BookOpen size={18} />
              </span>
              <div className="profile-pref-main">
                <span className="profile-pref-label">
                  Mes matières <span className="profile-pref-count">{subjectsCount}</span>
                </span>
                <span className="profile-pref-sub">Favorisées pendant tes révisions.</span>
              </div>
            </div>
            <div className="profile-chips">
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
        </motion.section>

        {/* Paramètres — la couche de configuration plus profonde (son, thème, dyslexie, niveau),
            même rangée-lien que le renvoi vers l'Aura. */}
        <motion.div variants={staggerItem}>
          <button
            type="button"
            className="profile-link-row"
            onClick={() => {
              sfx.tap(state.soundOn);
              setView('settings');
            }}
          >
            <span className="settings-row-icon" aria-hidden="true">
              <Settings size={18} />
            </span>
            <span className="profile-link-main">
              <span className="profile-link-label">Paramètres</span>
              <span className="profile-link-sub">Thème, sons, dyslexie, niveau</span>
            </span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
