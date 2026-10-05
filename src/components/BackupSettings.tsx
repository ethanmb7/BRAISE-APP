import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { applyBackup, createBackupCode, parseBackupCode, type ParsedBackup } from "@/lib/backup";

type ValidBackup = Extract<ParsedBackup, { ok: true }>;

// "Ta progression" in Réglages. Progress lives only on this device, so this is the one way to keep
// it through a new phone, a cleared browser or a reinstall — see lib/backup.ts.
export function BackupSettings() {
  const { state } = useApp();
  const [saved, setSaved] = useState<{ code: string; copied: boolean } | null>(null);
  const [saveError, setSaveError] = useState("");
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<ValidBackup | null>(null);
  const [restoreError, setRestoreError] = useState("");

  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleSave = async () => {
    sfx.tap(state.soundOn);
    setSaveError("");
    try {
      const code = await createBackupCode();
      let copied = false;
      try {
        await navigator.clipboard.writeText(code);
        copied = true;
      } catch {
        // Clipboard can be refused; the code stays visible below to copy by hand.
      }
      setSaved({ code, copied });
    } catch (e) {
      setSaved(null);
      setSaveError(e instanceof Error ? e.message : "La sauvegarde a échoué.");
    }
  };

  const handleShare = async () => {
    if (!saved) return;
    try {
      await navigator.share({ title: "Ma sauvegarde BRAISE", text: saved.code });
    } catch {
      // Closing the share sheet rejects; nothing to report.
    }
  };

  const handleCheck = async () => {
    sfx.tap(state.soundOn);
    setRestoreError("");
    setPending(null);
    const result = await parseBackupCode(input);
    if (result.ok) setPending(result);
    else setRestoreError(result.reason);
  };

  const handleRestore = () => {
    if (!pending) return;
    sfx.tap(state.soundOn);
    applyBackup(pending.data);
    // A reload, not a state update: the store would otherwise write its in-memory state back over
    // what was just restored on its next save.
    window.location.reload();
  };

  const cancelRestore = () => {
    sfx.tap(state.soundOn);
    setPending(null);
    setRestoreError("");
    setInput("");
    setRestoreOpen(false);
  };

  const summaryDate = pending?.summary.at
    ? new Date(pending.summary.at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
    : "";

  return (
    <>
      <div className="settings-label">Ta progression</div>
      <div className="settings-group">
        <div className="settings-row">
          <span className="settings-row-main">
            <span className="settings-row-icon" aria-hidden="true">
              <Save size={18} />
            </span>
            Sauvegarder
          </span>
          <button type="button" className="settings-btn" onClick={handleSave}>
            Copier le code
          </button>
        </div>

        {saveError && (
          <div className="settings-panel">
            <p className="settings-error" role="alert">
              {saveError}
            </p>
          </div>
        )}

        {saved && (
          <div className="settings-panel">
            <p className="settings-hint" role="status">
              {saved.copied ? "Code copié. " : "Copie ce code. "}
              Envoie-le-toi (message, notes…) : sur un autre téléphone, il te rend toute ta
              progression.
            </p>
            <textarea
              className="settings-textarea"
              readOnly
              rows={3}
              value={saved.code}
              aria-label="Ton code de sauvegarde"
              onFocus={(e) => e.currentTarget.select()}
            />
            {canShare && (
              <button type="button" className="settings-btn" onClick={handleShare}>
                Envoyer…
              </button>
            )}
          </div>
        )}

        <div className="settings-row">
          <span className="settings-row-main">
            <span className="settings-row-icon" aria-hidden="true">
              <RotateCcw size={18} />
            </span>
            Restaurer
          </span>
          {!restoreOpen && (
            <button
              type="button"
              className="settings-btn"
              onClick={() => {
                sfx.tap(state.soundOn);
                setRestoreOpen(true);
              }}
            >
              Coller un code
            </button>
          )}
        </div>

        {restoreOpen && !pending && (
          <div className="settings-panel">
            <textarea
              className="settings-textarea"
              rows={3}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setRestoreError("");
              }}
              placeholder="BRAISE1:…"
              aria-label="Ton code de sauvegarde à restaurer"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {restoreError && (
              <p className="settings-error" role="alert">
                {restoreError}
              </p>
            )}
            <div className="settings-actions">
              <button
                type="button"
                className="settings-btn settings-btn--primary"
                onClick={handleCheck}
                disabled={input.trim() === ""}
              >
                Vérifier
              </button>
              <button type="button" className="settings-btn" onClick={cancelRestore}>
                Annuler
              </button>
            </div>
          </div>
        )}

        {pending && (
          <div className="settings-panel">
            <p className="settings-hint" role="status">
              <b>
                {pending.summary.name ? `${pending.summary.name} · ` : ""}
                {pending.summary.xp} XP · série de {pending.summary.streak} jour
                {pending.summary.streak > 1 ? "s" : ""}
              </b>
              {summaryDate && ` (sauvegarde du ${summaryDate})`}
              <br />
              Ça remplace la progression de cet appareil.
            </p>
            <div className="settings-actions">
              <button
                type="button"
                className="settings-btn settings-btn--primary"
                onClick={handleRestore}
              >
                Remplacer ma progression
              </button>
              <button type="button" className="settings-btn" onClick={cancelRestore}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="settings-note">
        Ta progression est enregistrée sur cet appareil seulement. Sauvegarde-la pour la retrouver
        si tu changes de téléphone.
      </p>
    </>
  );
}
