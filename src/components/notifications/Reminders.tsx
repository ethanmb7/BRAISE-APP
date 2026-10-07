import { useState } from "react";
import { Backpack, Bus, Clock3, Moon, X } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";
import {
  EARLIEST_MINUTES,
  FREQUENCIES,
  LATEST_MINUTES,
  MOMENTS,
  formatMinutes,
  momentMinutes,
  type Frequency,
  type MomentId,
  type NotifPrefs,
} from "@/lib/notifications/model";
import { answerBrake, dismissInvite, notifStore } from "@/lib/notifications/store";

const MOMENT_ICON = { "after-school": Backpack, evening: Moon, morning: Bus } as const;

/** The sheet where the student chooses when Braise comes, and how often. Nothing is saved until they
 *  press the button, and the quiet hours (no message before 7:00 or after 21:30) are said out loud. */
export function MomentSheet({
  initial,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  initial: NotifPrefs;
  confirmLabel: string;
  onConfirm: (prefs: NotifPrefs) => void;
  onClose: () => void;
}) {
  const [moment, setMoment] = useState<NotifPrefs["moment"]>(initial.moment);
  const [time, setTime] = useState(initial.time);
  const [frequency, setFrequency] = useState<Frequency>(initial.frequency);

  const confirm = () => {
    const next: NotifPrefs = { ...initial, moment, time, frequency };
    // What is saved is what Braise will really do: a custom time outside the quiet hours is brought back.
    const minutes = momentMinutes(next);
    onConfirm({
      ...next,
      time: moment === "custom" ? formatMinutes(minutes) : MOMENTS[moment].time,
    });
  };

  return (
    <>
      <div className="ui-backdrop" onClick={onClose} aria-hidden="true" />
      <section
        className="ui-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Quand Braise passe te voir"
      >
        <header className="ui-sheet-head">
          <span aria-hidden="true">
            <BraiseMascot size={44} mood="happy" />
          </span>
          <h2>Quand Braise passe te voir ?</h2>
          <button type="button" className="ui-sheet-close" onClick={onClose} aria-label="Fermer">
            <X size={20} strokeWidth={3} />
          </button>
        </header>

        <div className="nt-opts" role="radiogroup" aria-label="Ton moment">
          {(Object.keys(MOMENTS) as MomentId[]).map((id) => {
            const Icon = MOMENT_ICON[id];
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={moment === id}
                className={`nt-opt${moment === id ? " is-on" : ""}`}
                onClick={() => setMoment(id)}
              >
                <span className="nt-opt-ic" aria-hidden="true">
                  <Icon size={22} strokeWidth={2.6} />
                </span>
                <span>
                  <b>{MOMENTS[id].label}</b>
                  <small>{MOMENTS[id].hint}</small>
                </span>
              </button>
            );
          })}
          <div
            role="radio"
            aria-checked={moment === "custom"}
            tabIndex={0}
            className={`nt-opt${moment === "custom" ? " is-on" : ""}`}
            onClick={() => setMoment("custom")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setMoment("custom")}
          >
            <span className="nt-opt-ic" aria-hidden="true">
              <Clock3 size={22} strokeWidth={2.6} />
            </span>
            <span className="nt-opt-time">
              <b>Une autre heure</b>
              <input
                type="time"
                className="nt-time"
                value={time}
                min={formatMinutes(EARLIEST_MINUTES)}
                max={formatMinutes(LATEST_MINUTES)}
                onChange={(e) => {
                  setTime(e.target.value);
                  setMoment("custom");
                }}
                aria-label="Heure choisie, entre 7 h et 21 h 30"
              />
            </span>
          </div>
        </div>

        <div className="nt-freq" role="radiogroup" aria-label="Le rythme">
          {(Object.keys(FREQUENCIES) as Frequency[]).map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={frequency === f}
              className={`nt-chip${frequency === f ? " is-on" : ""}`}
              onClick={() => setFrequency(f)}
            >
              <b>{FREQUENCIES[f].label}</b>
              <small>{FREQUENCIES[f].hint}</small>
            </button>
          ))}
        </div>

        <p className="nt-note">
          Jamais avant 7 h ni après 21 h 30, jamais plus d’une par jour. Tu peux tout couper quand
          tu veux.
        </p>
        <button type="button" className="ui-primary" onClick={confirm}>
          {confirmLabel}
        </button>
      </section>
    </>
  );
}

/** On Aujourd'hui, to someone who has had a taste of the app: Braise asks if she can come and see them. */
export function NotifInvite({ onAccept }: { onAccept: () => void }) {
  const { t } = useTone();
  return (
    <section className="nt-card" aria-label="Les rappels de Braise">
      <div className="nt-card-top">
        <span aria-hidden="true">
          <BraiseMascot size={52} mood="eager" />
        </span>
        <div>
          <b>{t(COPY.notif.inviteTitle)}</b>
          <p>{t(COPY.notif.inviteBody)}</p>
        </div>
      </div>
      <button type="button" className="ui-primary" onClick={onAccept}>
        {t(COPY.notif.inviteYes)}
      </button>
      <button
        type="button"
        className="nt-link"
        onClick={() => notifStore.update((s) => dismissInvite(s, Date.now()))}
      >
        {t(COPY.notif.inviteNo)}
      </button>
    </section>
  );
}

/** When three messages in a row got no answer, Braise went quiet: she says so, and asks. */
export function BrakeCard() {
  const { t } = useTone();
  return (
    <section className="nt-card" aria-label="Braise s'est faite discrète">
      <div className="nt-card-top">
        <span aria-hidden="true">
          <BraiseMascot size={52} mood="hesitant" />
        </span>
        <div>
          <b>{t(COPY.notif.brakeTitle)}</b>
          <p>{t(COPY.notif.brakeBody)}</p>
        </div>
      </div>
      <button
        type="button"
        className="ui-primary"
        onClick={() => notifStore.update((s) => answerBrake(s, true))}
      >
        {t(COPY.notif.brakeYes)}
      </button>
      <button
        type="button"
        className="nt-link"
        onClick={() => notifStore.update((s) => answerBrake(s, false))}
      >
        {t(COPY.notif.brakeNo)}
      </button>
    </section>
  );
}
