import { useState } from "react";
import { LogOut } from "lucide-react";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { isDemo } from "@/lib/demo/demo";

// Shown in Réglages only while the demo profile is on (see lib/demo/demo.ts): the way back to the
// student's own progress, which was set aside when the demo started.
export function DemoSettings() {
  const { state } = useApp();
  // Read once: the demo flag only changes by opening the app with ?demo or ?demo=off.
  const [on] = useState(() => isDemo());
  if (!on) return null;
  return (
    <>
      <div className="settings-label">Démonstration</div>
      <div className="settings-group">
        <div className="settings-row">
          <span className="settings-row-main">
            <span className="settings-row-icon" aria-hidden="true">
              <LogOut size={18} />
            </span>
            Profil de démo en cours
          </span>
          <button
            type="button"
            className="settings-btn"
            onClick={() => {
              sfx.tap(state.soundOn);
              // Leaving happens on a fresh start (see store.tsx), so nothing in memory can save the demo
              // back over the student's own progress.
              window.location.assign("/?demo=off");
            }}
          >
            Quitter la démo
          </button>
        </div>
        <div className="settings-panel">
          <p className="settings-hint">
            Ta propre progression a été mise de côté : elle revient en quittant la démo.
          </p>
        </div>
      </div>
    </>
  );
}
