import { ALargeSmall, Moon, Type, Volume2, Globe } from "lucide-react";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { TopBar } from "@/components/TopBar";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { Switch } from "@/components/Switch";
import { BackupSettings } from "@/components/BackupSettings";
import { CONTENT_LEVEL_NOTE, LEVELS } from "@/data";
import type { Level, TextSize } from "@/types";

// `preview` is in px on purpose: the "Aa" samples must not grow with the setting they control.
const TEXT_SIZES: { id: TextSize; label: string; preview: string }[] = [
  { id: "normal", label: "Texte normal", preview: "13px" },
  { id: "large", label: "Texte grand", preview: "16px" },
  { id: "xlarge", label: "Texte très grand", preview: "19px" },
];

export function SettingsView() {
  const { state, goBack, toggleDark, toggleDyslexia, toggleSound, setTextSize, setUser } = useApp();

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
              <span className="settings-row-icon" aria-hidden="true">
                <Moon size={18} />
              </span>
              Mode sombre
            </span>
            <Switch checked={state.darkMode} onChange={toggleDark} aria-label="Mode sombre" />
          </div>
          <div className="settings-row">
            <span className="settings-row-main">
              <span className="settings-row-icon" aria-hidden="true">
                <ALargeSmall size={18} />
              </span>
              Taille du texte
            </span>
            <div className="settings-sizes" role="group" aria-label="Taille du texte">
              {TEXT_SIZES.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  className={`settings-size ${state.textSize === size.id ? "is-active" : ""}`}
                  style={{ fontSize: size.preview }}
                  aria-pressed={state.textSize === size.id}
                  aria-label={size.label}
                  onClick={() => {
                    sfx.tap(state.soundOn);
                    setTextSize(size.id);
                  }}
                >
                  Aa
                </button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <span className="settings-row-main">
              <span className="settings-row-icon" aria-hidden="true">
                <Type size={18} />
              </span>
              Mode dyslexie
            </span>
            <Switch
              checked={state.dyslexiaMode}
              onChange={toggleDyslexia}
              aria-label="Mode dyslexie"
            />
          </div>
        </div>

        {/* Audio */}
        <div className="settings-label">Audio</div>
        <div className="settings-group">
          <div className="settings-row">
            <span className="settings-row-main">
              <span className="settings-row-icon" aria-hidden="true">
                <Volume2 size={18} />
              </span>
              Sons et effets
            </span>
            <Switch checked={state.soundOn} onChange={toggleSound} aria-label="Sons" />
          </div>
        </div>

        <NotificationSettings />

        {/* Compte */}
        <div className="settings-label">Compte</div>
        <div className="settings-group">
          <div className="settings-row">
            <span className="settings-row-main">
              <span className="settings-row-icon" aria-hidden="true">
                <Globe size={18} />
              </span>
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
        <p className="settings-note">{CONTENT_LEVEL_NOTE}</p>

        <BackupSettings />

        <p
          style={{
            textAlign: "center",
            color: "var(--ink-soft)",
            fontSize: "0.72rem",
            marginTop: 20,
          }}
        >
          BRAISE v1.0 · Pensée pour apprendre autrement
        </p>
      </div>
    </div>
  );
}
