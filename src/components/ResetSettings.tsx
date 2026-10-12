import { useState } from "react";
import { Eraser } from "lucide-react";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { isDemo } from "@/lib/demo/demo";

// "Recommencer" in Réglages: erases everything the app keeps on this device. Two steps, because it
// cannot be undone (the backup code above is the way to keep a copy). Hidden while the demo is on: the
// student's own data is set aside then, and erasing now would erase that too.
export function ResetSettings() {
  const { state } = useApp();
  const [inDemo] = useState(() => isDemo());
  const [confirming, setConfirming] = useState(false);
  if (inDemo) return null;
  return (
    <>
      <div className="settings-label">Recommencer</div>
      <div className="settings-group">
        <div className="settings-row">
          <span className="settings-row-main">
            <span className="settings-row-icon" aria-hidden="true">
              <Eraser size={18} />
            </span>
            Tout effacer
          </span>
          {!confirming && (
            <button
              type="button"
              className="settings-btn"
              onClick={() => {
                sfx.tap(state.soundOn);
                setConfirming(true);
              }}
            >
              Effacer mes données
            </button>
          )}
        </div>
        {confirming && (
          <div className="settings-panel">
            <p className="settings-hint" role="alert">
              <b>Ça efface toute ta progression sur cet appareil.</b> Points, cartes, cours, rappels
              : tout. Impossible de revenir en arrière, à moins d’avoir copié ton code de sauvegarde
              juste au-dessus.
            </p>
            <div className="settings-actions">
              <button
                type="button"
                className="settings-btn settings-btn--primary"
                onClick={() => {
                  sfx.tap(state.soundOn);
                  // Erased on a fresh start (see lib/startup.ts), so nothing in memory can save the
                  // old progress back over the empty device.
                  window.location.assign("/?reset");
                }}
              >
                Oui, tout effacer
              </button>
              <button type="button" className="settings-btn" onClick={() => setConfirming(false)}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
