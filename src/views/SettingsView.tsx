import { useState } from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { GlossarySheet } from "@/components/GlossarySheet";
import { TopBar } from "@/components/TopBar";
import { DemoSettings } from "@/components/DemoSettings";
import { ResetSettings } from "@/components/ResetSettings";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { BackupSettings } from "@/components/BackupSettings";

export function SettingsView() {
  const { state, goBack } = useApp();
  const [lexiconOpen, setLexiconOpen] = useState(false);

  return (
    <div>
      <TopBar title="Paramètres" onBack={goBack} />
      <div className="view is-active">
        {/* Ce qui reste ici est de la plomberie : notifications, sauvegarde, effacer, démo.
            Tout ce qui décrit l'élève ou change la façon dont l'app lui parle — prénom, tête,
            classe, ton, rythme, taille du texte, dyslexie, mode sombre, sons, vibrations,
            matières — vit sur Moi, à un seul geste. Ne les ramenez pas ici. */}
        {/* Le lexique quitte la page Moi. Ses six mots — Déclic, Pioche du jour, Carré ou
            Intox, À rallumer, Ton Aura, Un rang — se croisent tous ailleurs, et aucun n'est
            sur un profil : le ranger là-bas, c'était classer la documentation dans le tiroir
            de l'administration. Ici, il est à sa place de référence, à côté de la sauvegarde.
            Le vrai chemin reste le « ? » posé à côté du mot lui-même (GlossaryButton), encore
            déployé à un seul endroit dans l'app. */}
        <div className="settings-label">Le lexique</div>
        <div className="settings-group">
          <button
            type="button"
            className="settings-row"
            style={{ width: "100%", textAlign: "left" }}
            onClick={() => {
              sfx.tap(state.soundOn);
              setLexiconOpen(true);
            }}
          >
            <span className="settings-row-main">
              <span className="settings-row-icon" aria-hidden="true">
                <BookOpen size={18} />
              </span>
              Le lexique de Braise
            </span>
            <ChevronRight size={18} color="var(--ink-soft)" />
          </button>
        </div>

        <NotificationSettings />

        <BackupSettings />

        <ResetSettings />

        <DemoSettings />

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
      {lexiconOpen && <GlossarySheet onClose={() => setLexiconOpen(false)} />}
    </div>
  );
}
