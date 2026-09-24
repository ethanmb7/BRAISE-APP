import { Moon, Type, Volume2, Globe } from 'lucide-react';
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
            <span className="settings-row-main">
              <span className="settings-row-icon" aria-hidden="true"><Moon size={18} /></span>
              Mode sombre
            </span>
            <Switch checked={state.darkMode} onChange={toggleDark} aria-label="Mode sombre" />
          </div>
          <div className="settings-row">
            <span className="settings-row-main">
              <span className="settings-row-icon" aria-hidden="true"><Type size={18} /></span>
              Mode dyslexie
            </span>
            <Switch checked={state.dyslexiaMode} onChange={toggleDyslexia} aria-label="Mode dyslexie" />
          </div>
        </div>

        {/* Audio */}
        <div className="settings-label">Audio</div>
        <div className="settings-group">
          <div className="settings-row">
            <span className="settings-row-main">
              <span className="settings-row-icon" aria-hidden="true"><Volume2 size={18} /></span>
              Sons et effets
            </span>
            <Switch checked={state.soundOn} onChange={toggleSound} aria-label="Sons" />
          </div>
        </div>

        {/* Compte */}
        <div className="settings-label">Compte</div>
        <div className="settings-group">
          <div className="settings-row">
            <span className="settings-row-main">
              <span className="settings-row-icon" aria-hidden="true"><Globe size={18} /></span>
              Niveau
            </span>
            <select
              value={state.user.level}
              onChange={(e) => {
                const l = LEVELS.find((x) => x.id === e.target.value);
                if (l) handleLevel(l);
              }}
              className="settings-select"
            >
              {LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: '0.72rem', marginTop: 20 }}>
          BRAISE v1.0 · Pensée pour apprendre autrement
        </p>
      </div>
    </div>
  );
}
