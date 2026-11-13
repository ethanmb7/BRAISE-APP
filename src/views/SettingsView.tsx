import { useApp } from "@/store";
import { TopBar } from "@/components/TopBar";
import { DemoSettings } from "@/components/DemoSettings";
import { ResetSettings } from "@/components/ResetSettings";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { BackupSettings } from "@/components/BackupSettings";

export function SettingsView() {
  const { goBack } = useApp();

  return (
    <div>
      <TopBar title="Paramètres" onBack={goBack} />
      <div className="view is-active">
        {/* Ce qui reste ici est de la plomberie : notifications, sauvegarde, effacer, démo.
            Tout ce qui décrit l'élève ou change la façon dont l'app lui parle — prénom, tête,
            classe, ton, rythme, taille du texte, dyslexie, mode sombre, sons, vibrations,
            matières — vit sur Moi, à un seul geste. Ne les ramenez pas ici. */}
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
    </div>
  );
}
