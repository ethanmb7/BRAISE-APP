import { Moon, Type, Volume2, Bell, Globe, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { TopBar } from '@/components/TopBar';
import { Switch } from '@/components/Switch';
import { LEVELS } from '@/data';
import type { Level } from '@/types';

export function SettingsView() {
  const { state, goBack, toggleDark, toggleDyslexia, toggleSound, setUser } = useApp();

  const handleLevel = (l: Level) => {
    sfx.tap(state.soundOn);
    setUser({ ...state.user, level: l.id, levelLabel: l.label });
  };

  return (
    <div>
      <TopBar title="Paramètres" onBack={goBack} />
      <div className="view is-active">
        {/* Affichage */}
        <div className="settings-label">Affichage</div>
        <div className="settings-group">
          <div className="settings-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Moon size={18} color="var(--ink-soft)" />
              Mode sombre
            </span>
            <Switch checked={state.darkMode} onChange={toggleDark} aria-label="Mode sombre" />
          </div>
          <div className="settings-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Type size={18} color="var(--ink-soft)" />
              Mode dyslexie
            </span>
            <Switch checked={state.dyslexiaMode} onChange={toggleDyslexia} aria-label="Mode dyslexie" />
          </div>
        </div>

        {/* Audio */}
        <div className="settings-label">Audio</div>
        <div className="settings-group">
          <div className="settings-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Volume2 size={18} color="var(--ink-soft)" />
              Sons et effets
            </span>
            <Switch checked={state.soundOn} onChange={toggleSound} aria-label="Sons" />
          </div>
          <div className="settings-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bell size={18} color="var(--ink-soft)" />
              Notifications
            </span>
            <Switch checked={true} onChange={() => sfx.tap(state.soundOn)} aria-label="Notifications" />
          </div>
        </div>

        {/* Compte */}
        <div className="settings-label">Compte</div>
        <div className="settings-group">
          <div className="settings-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Globe size={18} color="var(--ink-soft)" />
              Niveau
            </span>
            <select
              value={state.user.level}
              onChange={(e) => {
                const l = LEVELS.find((x) => x.id === e.target.value);
                if (l) handleLevel(l);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-soft)',
                fontSize: '0.84rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              {LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <button className="settings-row" style={{ width: '100%', textAlign: 'left', color: 'var(--ink)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={18} color="var(--ink-soft)" />
              Confidentialité
            </span>
          </button>
          <button className="settings-row" style={{ width: '100%', textAlign: 'left', color: 'var(--ink)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <HelpCircle size={18} color="var(--ink-soft)" />
              Aide & support
            </span>
          </button>
          <button
            className="settings-row"
            style={{ width: '100%', textAlign: 'left', color: 'var(--coral-2)' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LogOut size={18} color="var(--coral-2)" />
              Se déconnecter
            </span>
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: '0.72rem', marginTop: 20 }}>
          SAPIE v1.0 · Fait avec 🔥 par Braise
        </p>
      </div>
    </div>
  );
}
