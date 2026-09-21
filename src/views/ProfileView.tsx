import { useState } from 'react';
import { Settings, ChevronRight, Check, Pencil, X } from 'lucide-react';
import { useApp, computeUnlockedBadges, countDoneChapters } from '@/store';
import { sfx } from '@/lib/sound';
import { TopBar } from '@/components/TopBar';
import { StreakFlameIcon } from '@/components/StreakFlameIcon';
import { BadgeIcon } from '@/components/BadgeIcon';
import { BADGES, SUBJECTS, AVATARS } from '@/data';
import type { Personality } from '@/types';

const PERSONAS: { id: Personality; emoji: string; title: string; sub: string }[] = [
  { id: 'chill', emoji: '☕', title: 'Pote Chill', sub: 'Encourageant, doux, zéro pression.' },
  { id: 'savage', emoji: '⚡', title: 'Coach Savage', sub: 'Second degré, piques amicales assumées.' },
];

export function ProfileView() {
  const { state, setView, setPersonality, setUser } = useApp();
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [draftName, setDraftName] = useState(state.user.name);
  const [draftAvatar, setDraftAvatar] = useState(state.user.avatar);

  const subjectsCount = state.user.subjects.length;
  const chaptersDone = countDoneChapters(state.completedChapters);
  const badgeUnlocked = computeUnlockedBadges(state);

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
      <div className="view is-active">
        {/* Avatar + name */}
        {!editingIdentity ? (
          <div className="profile-identity">
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
          </div>
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

        {/* Stats */}
        <div className="profile-stats">
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
            <b>{chaptersDone}</b>
            <span>chapitres</span>
          </div>
        </div>

        {/* Personality */}
        <div className="section-title">Personnalité de Braise</div>
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
                <span className="persona-emoji">{p.emoji}</span>
                <b>{p.title}</b>
                <span className="persona-sub">{p.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Badges */}
        <div className="section-title">Mes badges</div>
        <div className="badges">
          {BADGES.map((b) => {
            const unlocked = badgeUnlocked[b.id];
            return (
            <div className={`badge ${unlocked ? '' : 'locked'}`} key={b.id}>
              <div className="ring" style={unlocked ? { background: '#eff3ff' } : {}}>
                <BadgeIcon badgeId={b.id} size={26} />
              </div>
              <span>{b.name}</span>
              <span className="cond">{b.cond}</span>
            </div>
            );
          })}
        </div>

        {/* Subjects — real toggles, not a static recap: these picks weight which cards come up
            more often in Réviser (see RevisionsView's priority scoring), so showing them as
            inert text would hide a real effect from the one person it affects. */}
        <div className="section-title" style={{ marginTop: 20 }}>
          Mes matières ({subjectsCount})
        </div>
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
                {s.emoji} {s.name}
              </button>
            );
          })}
        </div>

        {/* Settings link */}
        <button type="button" className="profile-settings-link" onClick={() => { sfx.tap(state.soundOn); setView('settings'); }}>
          <span className="profile-settings-link-label">
            <Settings size={18} color="var(--ink-soft)" />
            Paramètres
          </span>
          <ChevronRight size={18} color="var(--ink-soft)" />
        </button>
      </div>
    </div>
  );
}
