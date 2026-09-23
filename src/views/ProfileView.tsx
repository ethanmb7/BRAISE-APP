import { useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, ChevronRight, Flame, Pencil, Settings, Share2, Sparkles, Target, X, Check } from 'lucide-react';
import { useApp, computeUnlockedBadges, countDoneChapters } from '@/store';
import { sfx } from '@/lib/sound';
import { getRankInfo, countMasteredCards, nextBadgeHint, badgeRemainingLabel, RANKS } from '@/lib/aura';
import { useCountUp } from '@/lib/useCountUp';
import { getAgeGroup, profileReactionLine } from '@/lib/braiseVoice';
import { getBadgeUnlockedAtMap } from '@/lib/celebrations';
import { TopBar } from '@/components/TopBar';
import { BraiseMascot } from '@/components/BraiseMascot';
import { RankIcon } from '@/components/RankIcon';
import { BadgeIcon } from '@/components/BadgeIcon';
import { SubjectIcon } from '@/components/SubjectIcon';
import { ShareAuraModal } from '@/components/ShareAuraModal';
import { BADGES, SUBJECTS, AVATARS, FLASHCARDS } from '@/data';
import type { Personality } from '@/types';

const PERSONAS: { id: Personality; title: string; sub: string }[] = [
  { id: 'chill', title: 'Pote chill', sub: 'Encourageant, sans pression.' },
  { id: 'savage', title: 'Coach savage', sub: 'Le petit kick quand il faut.' },
];
const ease = [0.16, 1, 0.3, 1] as const;
const listMotion = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const itemMotion = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease } } };

function unlocked(minRankId: string | undefined, currentRankId: string) {
  if (!minRankId) return true;
  return RANKS.findIndex((r) => r.id === currentRankId) >= RANKS.findIndex((r) => r.id === minRankId);
}

export function ProfileView() {
  const { state, setView, setTab, setPersonality, setUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(state.user.name);
  const [avatar, setAvatar] = useState(state.user.avatar);
  const [shareOpen, setShareOpen] = useState(false);
  const rankInfo = getRankInfo(state.xp);
  const rank = rankInfo.current;
  const xp = useCountUp(state.xp);
  const chaptersDone = countDoneChapters(state.completedChapters);
  const cardsSeen = Object.keys(state.cardReviews).length;
  const mastery = countMasteredCards(state.cardReviews);
  const unlockedBadges = computeUnlockedBadges(state);
  const badgeCount = Object.values(unlockedBadges).filter(Boolean).length;
  const unlockedAt = useMemo(() => getBadgeUnlockedAtMap(), [unlockedBadges]);
  const nextBadge = useMemo(() => nextBadgeHint(state, unlockedBadges), [state, unlockedBadges]);
  const voice = useMemo(() => profileReactionLine({ personality: state.user.personality, age: getAgeGroup(state.user.level) }, { rankName: rank.name, streak: state.streak, badgesUnlocked: badgeCount, badgesTotal: BADGES.length }), [state.user.personality, state.user.level, rank.name, state.streak, badgeCount]);
  const reviewedSubjects = new Set(Object.keys(state.cardReviews).map((id) => FLASHCARDS.find((c) => c.id === id)?.subject).filter(Boolean)).size;

  const editProfile = () => { sfx.tap(state.soundOn); setName(state.user.name); setAvatar(state.user.avatar); setEditing(true); };
  const saveProfile = () => { sfx.tap(state.soundOn); setUser({ ...state.user, name: name.trim() || state.user.name, avatar }); setEditing(false); };
  const goReview = () => { sfx.tap(state.soundOn); setTab('revisions'); };

  return (
    <div>
      <TopBar title="Profil" onBack={() => setView(state.tab)} />
      <motion.main className="view is-active profile-new" variants={listMotion} initial="hidden" animate="show">
        <motion.section className="profile-new-hero" variants={itemMotion}>
          <div className="profile-new-hero-top">
            <div>
              <span className="profile-new-kicker">TON ESPACE</span>
              <h1>{state.user.name}, t&apos;es dans le game.</h1>
              <p>Tout ce qui te ressemble et te fait avancer, au même endroit.</p>
            </div>
            <button type="button" className="profile-new-edit" onClick={editProfile} aria-label="Modifier mon profil"><Pencil /></button>
          </div>
          {editing ? (
            <div className="profile-new-editor">
              <div className="profile-avatar-picker">{AVATARS.map((a) => { const canUse = unlocked(a.minRankId, rank.id); return <button type="button" key={a.emoji} disabled={!canUse} className={`profile-avatar-option ${avatar === a.emoji ? 'is-selected' : ''} ${!canUse ? 'is-locked' : ''}`} onClick={() => canUse && setAvatar(a.emoji)}>{a.emoji}</button>; })}</div>
              <input className="profile-name-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} aria-label="Ton prénom" autoFocus />
              <div className="profile-new-editor-actions"><button type="button" onClick={() => setEditing(false)}><X /> Annuler</button><button type="button" className="primary-action" onClick={saveProfile}><Check /> Garder ça</button></div>
            </div>
          ) : (
            <div className="profile-new-identity">
              <div className="profile-new-avatar" style={{ '--rank-color': rank.colorFrom } as CSSProperties}>{state.user.avatar}<span><RankIcon rankId={rank.id} color="#fff" size={13} /></span></div>
              <div className="profile-new-identity-copy"><strong>{rank.name}</strong><span>{xp} XP · {state.streak} jour{state.streak > 1 ? 's' : ''} de série</span></div>
              <div className="profile-new-voice"><BraiseMascot size={31} mood={state.streak ? 'proud' : 'sleepy'} /><p>{voice}</p></div>
            </div>
          )}
          <div className="profile-new-xp"><div><span>Prochain niveau</span><strong>{rankInfo.next ? rankInfo.next.name : 'Rang max'}</strong></div><b>{rankInfo.next ? `${rankInfo.next.min - state.xp} XP` : 'Complet'}</b><div className="profile-new-progress"><span style={{ width: `${rankInfo.pct}%`, background: `linear-gradient(90deg, ${rank.colorFrom}, ${rank.colorTo})` }} /></div></div>
        </motion.section>

        <motion.section className="profile-new-stats" variants={itemMotion} aria-label="Mes repères"><div><Flame /><b>{state.streak}</b><span>série</span></div><div><BookOpen /><b>{cardsSeen}</b><span>cartes vues</span></div><div><Award /><b>{badgeCount}/{BADGES.length}</b><span>badges</span></div></motion.section>

        <motion.section className="profile-new-next" variants={itemMotion}><div className="profile-new-next-icon"><Target /></div><div><span>Le move du jour</span><strong>{state.streak ? 'Garde ta série en vie' : 'Relance ta série tranquille'}</strong><p>{state.streak ? 'Une mini session suffit pour rester lancé.' : 'Une carte, zéro pression. Juste pour repartir.'}</p></div><button type="button" onClick={goReview} aria-label="Commencer une session"><ChevronRight /></button></motion.section>

        <motion.section className="profile-new-section" variants={itemMotion}><div className="profile-new-section-heading"><div><span className="profile-new-kicker">TES VICTOIRES</span><h2>Les moments où t&apos;as assuré</h2></div><span className="profile-new-count">{badgeCount}/{BADGES.length}</span></div><div className="profile-new-badges">{BADGES.map((badge) => <div className={`profile-new-badge ${unlockedBadges[badge.id] ? '' : 'is-muted'}`} key={badge.id}><BadgeIcon badgeId={badge.id} size={22} /><strong>{badge.name}</strong><small>{unlockedBadges[badge.id] ? (unlockedAt[badge.id] ? new Date(unlockedAt[badge.id]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Débloqué') : (nextBadge?.badgeId === badge.id ? badgeRemainingLabel(badge.id, state) ?? 'Bientôt' : 'À débloquer')}</small></div>)}</div></motion.section>

        <motion.section className="profile-new-section profile-new-preferences" variants={itemMotion}><div className="profile-new-section-heading"><div><span className="profile-new-kicker">À TA SAUCE</span><h2>Personnalise ton expérience</h2></div><Sparkles /></div><div className="profile-new-setting"><div><strong>Le ton de Braise</strong><span>{PERSONAS.find((p) => p.id === state.user.personality)?.sub}</span></div><div className="profile-new-toggle">{PERSONAS.map((p) => <button type="button" key={p.id} className={state.user.personality === p.id ? 'is-active' : ''} aria-pressed={state.user.personality === p.id} onClick={() => { sfx.tap(state.soundOn); setPersonality(p.id); }}>{p.title}</button>)}</div></div><div className="profile-new-setting profile-new-subjects"><div><strong>Mes matières</strong><span>Celles qui remontent dans tes révisions</span></div><div className="profile-new-subject-list">{SUBJECTS.map((subject) => { const active = state.user.subjects.includes(subject.id); return <button type="button" key={subject.id} className={active ? 'is-active' : ''} aria-pressed={active} onClick={() => setUser({ ...state.user, subjects: active ? state.user.subjects.filter((id) => id !== subject.id) : [...state.user.subjects, subject.id] })}><SubjectIcon subjectId={subject.id} color={subject.color} size={14} />{subject.name}</button>; })}</div></div></motion.section>

        <motion.div className="profile-new-footer-actions" variants={itemMotion}><button type="button" onClick={() => setShareOpen(true)}><Share2 /> Partager mon profil</button><button type="button" onClick={() => setView('settings')}><Settings /> Paramètres <ChevronRight /></button></motion.div>
      </motion.main>
      {shareOpen && <ShareAuraModal rank={rank} streak={state.streak} xp={state.xp} subjectsCount={reviewedSubjects} masteredCards={mastery} onClose={() => setShareOpen(false)} />}
    </div>
  );
}

export default ProfileView;
