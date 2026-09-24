import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Settings, ChevronRight, Check, Pencil, X, MessageCircle, BookOpen, GraduationCap } from 'lucide-react';
import { useApp, computeUnlockedBadges } from '@/store';
import { sfx } from '@/lib/sound';
import { fireMicroConfetti } from '@/lib/confetti';
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

// Micro-confettis partis du centre d'un élément réel à l'écran (avatar, prénom) — même
// célébration que la bonne réponse en Réviser, à la même échelle.
function burstFrom(el: Element | null) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  fireMicroConfetti((r.left + r.width / 2) / window.innerWidth, (r.top + r.height / 2) / window.innerHeight);
}

// Braise « parle » : la réplique se tape lettre par lettre à chaque vrai changement (rang, série,
// ton choisi). Coupé net en mouvement réduit.
function useTypewriter(text: string, enabled: boolean): string {
  const [count, setCount] = useState(enabled ? 0 : text.length);
  useEffect(() => {
    if (!enabled) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(id);
    }, 22);
    return () => window.clearInterval(id);
  }, [text, enabled]);
  return text.slice(0, count);
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};
const pop = { type: 'spring' as const, stiffness: 420, damping: 18 };

export function ProfileView() {
  const { state, setView, setTab, setPersonality, setUser } = useApp();
  const reduceMotion = useReducedMotion() ?? false;
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(state.user.name);
  const [nameBump, setNameBump] = useState(0);
  const [lockedTap, setLockedTap] = useState<string | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  const subjectsCount = state.user.subjects.length;
  const badgeUnlocked = computeUnlockedBadges(state);
  const badgeUnlockedCount = Object.values(badgeUnlocked).filter(Boolean).length;
  const rankInfo = getRankInfo(state.xp);
  const rank = rankInfo.current;
  const animatedXp = useCountUp(state.xp);
  const rankName = rank.name;

  // ----- Pass 3D : la carte suit le doigt / la souris, un reflet holographique glisse dessus.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const tiltSpring = { stiffness: 170, damping: 16, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), tiltSpring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), tiltSpring);
  const sheenX = useTransform(px, (v) => `${v * 100}%`);
  const sheenY = useTransform(py, (v) => `${v * 100}%`);
  const sheenOpacity = useSpring(0, { stiffness: 120, damping: 20 });
  const sheen = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.55), rgba(255,255,255,0) 55%)`;

  const onPassMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    sheenOpacity.set(1);
  };
  const onPassLeave = () => {
    px.set(0.5);
    py.set(0.5);
    sheenOpacity.set(0);
  };

  // Prochain avatar à débloquer — sous-titre du rail. Un avatar verrouillé touché prend la main
  // sur ce texte le temps de dire ce qu'il demande.
  const nextAvatarHint = useMemo(() => {
    const next = AVATARS.find((a) => a.minRankId && !isAvatarUnlocked(a.minRankId, rank.id));
    if (!next) return null;
    const required = RANKS.find((r) => r.id === next.minRankId);
    return `${getAvatarName(next.emoji)} se débloque au rang ${required?.name}.`;
  }, [rank.id]);
  const lockedHint = useMemo(() => {
    if (!lockedTap) return null;
    const a = AVATARS.find((x) => x.emoji === lockedTap);
    const required = a?.minRankId ? RANKS.find((r) => r.id === a.minRankId) : null;
    return a && required ? `${getAvatarName(a.emoji)} t'attend au rang ${required.name}. Continue !` : null;
  }, [lockedTap]);
  useEffect(() => {
    if (!lockedTap) return;
    const id = window.setTimeout(() => setLockedTap(null), 2200);
    return () => window.clearTimeout(id);
  }, [lockedTap]);

  // Memoized on the real facts it depends on, not re-rolled on every render — only changes when
  // something Braise would actually react to differently changes (and is then re-typed).
  const braiseTake = useMemo(
    () =>
      profileReactionLine(
        { personality: state.user.personality, age: getAgeGroup(state.user.level) },
        { rankName, streak: state.streak, badgesUnlocked: badgeUnlockedCount, badgesTotal: BADGES.length }
      ),
    [state.user.personality, state.user.level, rankName, state.streak, badgeUnlockedCount]
  );
  const typedTake = useTypewriter(braiseTake, !reduceMotion);
  const typing = typedTake.length < braiseTake.length;

  const openNameEdit = () => {
    sfx.tap(state.soundOn);
    setDraftName(state.user.name);
    setEditingName(true);
  };

  const saveName = () => {
    const next = draftName.trim() || state.user.name;
    const changed = next !== state.user.name;
    setUser({ ...state.user, name: next });
    setEditingName(false);
    if (changed) {
      sfx.correct(state.soundOn);
      setNameBump((n) => n + 1);
      // Le titre n'existe qu'après le rendu qui ferme le formulaire.
      requestAnimationFrame(() => burstFrom(nameRef.current));
    } else {
      sfx.tap(state.soundOn);
    }
  };

  const cancelName = () => {
    sfx.tap(state.soundOn);
    setEditingName(false);
  };

  const pickAvatar = (emoji: string, unlocked: boolean) => {
    if (!unlocked) {
      sfx.wrong(state.soundOn);
      setLockedTap(emoji);
      return;
    }
    if (emoji === state.user.avatar) return;
    sfx.flip(state.soundOn);
    setUser({ ...state.user, avatar: emoji });
    burstFrom(avatarRef.current);
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
        {/* Le "pass BRAISE" — une vraie carte qu'on a envie de toucher : inclinaison 3D qui suit
            le doigt, reflet holographique sous le pointeur, balayage lumineux sur la bande de rang.
            Même coque que les cartes de Ton Aura. */}
        <motion.div variants={staggerItem} className="profile-pass-stage">
          <motion.div
            className="profile-hero-card"
            style={reduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
            onPointerMove={onPassMove}
            onPointerLeave={onPassLeave}
            onPointerCancel={onPassLeave}
          >
            <motion.div className="profile-pass-sheen" style={{ background: sheen, opacity: sheenOpacity }} aria-hidden="true" />
            <div className="profile-pass-strip" style={{ background: `linear-gradient(125deg, ${rank.colorFrom}, ${rank.colorTo})` }}>
              <span className="profile-pass-punch" aria-hidden="true" />
              <span className="profile-hero-overline">Pass BRAISE</span>
              <span className="profile-hero-rank-pill">
                <span className="profile-rank-twinkle">
                  <RankIcon rankId={rank.id} color="#fff" size={12} />
                </span>
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
                  <div className="profile-hero-avatar" ref={avatarRef}>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={state.user.avatar}
                        className="profile-hero-avatar-float"
                        initial={{ scale: 0.2, rotate: -30, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0.2, rotate: 30, opacity: 0 }}
                        transition={pop}
                      >
                        <span className="profile-avatar-bob">
                          <AvatarGlyph id={state.user.avatar} rankId={rank.id} size={58} />
                        </span>
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="profile-hero-identity-main">
                  <AnimatePresence mode="wait" initial={false}>
                    {editingName ? (
                      <motion.form
                        key="edit"
                        className="profile-name-form"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16 }}
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
                      </motion.form>
                    ) : (
                      <motion.div
                        key="view"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16 }}
                      >
                        <div className="profile-hero-name-row">
                          <motion.h2
                            key={nameBump}
                            ref={nameRef}
                            className="profile-hero-name"
                            initial={nameBump ? { scale: 1.25 } : false}
                            animate={{ scale: 1 }}
                            transition={pop}
                          >
                            {state.user.name}
                          </motion.h2>
                          <motion.button
                            type="button"
                            className="profile-hero-edit"
                            onClick={openNameEdit}
                            aria-label="Modifier ton prénom"
                            whileHover={{ rotate: -12 }}
                            whileTap={{ scale: 0.85 }}
                          >
                            <Pencil size={13} />
                          </motion.button>
                        </div>
                        <div className="profile-hero-meta">
                          {state.user.levelLabel && (
                            <span className="profile-hero-chip">
                              <GraduationCap size={13} aria-hidden="true" />
                              {state.user.levelLabel}
                            </span>
                          )}
                          {state.user.joinedAt && (
                            <span className="profile-joined">Depuis le {formatShortDate(state.user.joinedAt)}</span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Braise's take — real facts (rank/série/badges), never generic filler. Typed out
                  live; the invisible full line reserves the height so nothing below jumps. */}
              <div className="profile-hero-bubble">
                <span className="profile-hero-bubble-icon" aria-hidden="true">
                  <BraiseMascot size={28} mood={state.streak > 0 ? 'proud' : 'sleepy'} />
                </span>
                <div className="profile-hero-bubble-main">
                  <p className="profile-typewriter">
                    <span className="sr-only">{braiseTake}</span>
                    <span className="profile-typewriter-ghost" aria-hidden="true">
                      {braiseTake}
                    </span>
                    <span className="profile-typewriter-live" aria-hidden="true">
                      {typedTake}
                      {typing && <span className="profile-typewriter-caret" />}
                    </span>
                  </p>
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

              {/* Un seul renvoi vers Aura — la progression vit entièrement sur Ton Aura. */}
              <motion.button
                type="button"
                className="profile-link-row profile-aura-link"
                whileTap={{ scale: 0.97 }}
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
                  <span className="profile-link-sub">
                    <b className="profile-xp">{animatedXp} XP</b> · voir ton parcours
                  </span>
                </span>
                <ChevronRight size={18} aria-hidden="true" className="profile-link-chevron" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Choix de tête — l'anneau orange glisse d'un avatar à l'autre (layoutId), le nouvel
            avatar tourne sur lui-même dans le pass avec une gerbe de confettis. Un avatar
            verrouillé secoue la tête et dit ce qu'il demande, au lieu de ne rien faire. */}
        <motion.section className="profile-section" variants={staggerItem} aria-labelledby="profile-face-title">
          <span id="profile-face-title" className="profile-section-tab">
            Ta tête
          </span>
          <div className="profile-section-sub-wrap" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={lockedHint ?? 'default'}
                className={`profile-section-sub ${lockedHint ? 'is-alert' : ''}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {lockedHint ?? nextAvatarHint ?? 'Tout est débloqué. Respect.'}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="profile-avatar-rail">
            {AVATARS.map((a) => {
              const unlocked = isAvatarUnlocked(a.minRankId, rank.id);
              const requiredRank = a.minRankId ? RANKS.find((r) => r.id === a.minRankId) : null;
              const selected = state.user.avatar === a.emoji;
              return (
                <motion.button
                  key={a.emoji}
                  type="button"
                  className={`profile-avatar-option ${selected ? 'is-selected' : ''} ${unlocked ? '' : 'is-locked'}`}
                  onClick={() => pickAvatar(a.emoji, unlocked)}
                  aria-disabled={!unlocked}
                  aria-pressed={selected}
                  aria-label={
                    unlocked ? `Choisir l'avatar ${getAvatarName(a.emoji)}` : `Avatar verrouillé — débloqué au rang ${requiredRank?.name}`
                  }
                  whileTap={unlocked ? { scale: 0.86 } : undefined}
                  animate={lockedTap === a.emoji ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {selected && (
                    <motion.span layoutId="profile-avatar-ring" className="profile-avatar-ring" transition={pop} aria-hidden="true" />
                  )}
                  <AvatarGlyph id={a.emoji} rankId={rank.id} size={32} />
                  {!unlocked && (
                    <span className="profile-avatar-option-lock" aria-hidden="true">
                      <RankIcon rankId="" color="" locked size={11} />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* Préférences — ce qui change réellement le comportement de Braise. Changer de ton fait
            réécrire sa réplique en direct dans le pass juste au-dessus. */}
        <motion.section className="profile-section" variants={staggerItem} aria-labelledby="profile-prefs-title">
          <span id="profile-prefs-title" className="profile-section-tab">
            Tes préférences
          </span>

          <div className="profile-pref-row">
            <span className="settings-row-icon" aria-hidden="true">
              <MessageCircle size={18} />
            </span>
            <div className="profile-pref-main">
              <span className="profile-pref-label">Ton de Braise</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={state.user.personality}
                  className="profile-pref-sub"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.16 }}
                >
                  {PERSONAS.find((p) => p.id === state.user.personality)?.sub}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="seg-track">
              <div className={`seg-thumb ${state.user.personality === 'savage' ? 'is-right' : ''}`} aria-hidden="true" />
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`seg-opt ${state.user.personality === p.id ? 'is-active' : ''}`}
                  onClick={() => {
                    if (state.user.personality === p.id) return;
                    sfx.flip(state.soundOn);
                    setPersonality(p.id);
                  }}
                  aria-pressed={state.user.personality === p.id}
                >
                  {p.id === 'chill' ? 'Chill' : 'Savage'}
                </button>
              ))}
            </div>
          </div>

          {/* Matières — real toggles: these picks weight which cards come up more often in
              Réviser (see RevisionsView's priority scoring). */}
          <div className="profile-pref-row is-stacked">
            <div className="profile-pref-head">
              <span className="settings-row-icon" aria-hidden="true">
                <BookOpen size={18} />
              </span>
              <div className="profile-pref-main">
                <span className="profile-pref-label">
                  Mes matières
                  <motion.span
                    key={subjectsCount}
                    className="profile-pref-count"
                    initial={{ scale: 1.6 }}
                    animate={{ scale: 1 }}
                    transition={pop}
                  >
                    {subjectsCount}
                  </motion.span>
                </span>
                <span className="profile-pref-sub">Favorisées pendant tes révisions.</span>
              </div>
            </div>
            <div className="profile-chips">
              {SUBJECTS.map((s) => {
                const active = state.user.subjects.includes(s.id);
                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    layout
                    className={`profile-subject-chip ${active ? 'is-active' : ''}`}
                    onClick={() => toggleUserSubject(s.id)}
                    aria-pressed={active}
                    whileTap={{ scale: 0.92 }}
                    transition={pop}
                  >
                    <SubjectIcon subjectId={s.id} color={s.color} size={15} />
                    {s.name}
                    <AnimatePresence initial={false}>
                      {active && (
                        <motion.span
                          className="profile-chip-check"
                          initial={{ width: 0, opacity: 0, scale: 0 }}
                          animate={{ width: 16, opacity: 1, scale: 1 }}
                          exit={{ width: 0, opacity: 0, scale: 0 }}
                          transition={pop}
                          aria-hidden="true"
                        >
                          <Check size={14} strokeWidth={3} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Paramètres — la couche de configuration plus profonde (son, thème, dyslexie, niveau). */}
        <motion.div variants={staggerItem}>
          <motion.button
            type="button"
            className="profile-link-row"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sfx.tap(state.soundOn);
              setView('settings');
            }}
          >
            <span className="settings-row-icon profile-gear" aria-hidden="true">
              <Settings size={18} />
            </span>
            <span className="profile-link-main">
              <span className="profile-link-label">Paramètres</span>
              <span className="profile-link-sub">Thème, sons, dyslexie, niveau</span>
            </span>
            <ChevronRight size={18} aria-hidden="true" className="profile-link-chevron" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
