import { useEffect, useState } from "react";
import { Bell, CalendarDays, Send } from "lucide-react";
import { MomentSheet } from "@/components/notifications/Reminders";
import { permissionLine, useReminders } from "@/components/notifications/useReminders";
import { Switch } from "@/components/Switch";
import { useApp } from "@/store";
import { getDelivery, type Permission } from "@/lib/notifications/delivery";
import { renderNotification } from "@/lib/notifications/copy";
import {
  FREQUENCIES,
  MOMENTS,
  frequencyFromGoal,
  formatMinutes,
  momentMinutes,
  type NotifPrefs,
} from "@/lib/notifications/model";
import { useNotifState } from "@/lib/notifications/useNotifState";

const dayLabel = (at: number) =>
  new Date(at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const hourLabel = (at: number) =>
  formatMinutes(new Date(at).getHours() * 60 + new Date(at).getMinutes());

function momentSummary(prefs: NotifPrefs): string {
  const when =
    prefs.moment === "custom"
      ? `à ${formatMinutes(momentMinutes(prefs))}`
      : MOMENTS[prefs.moment].label.toLowerCase();
  return `${when}, rythme ${FREQUENCIES[prefs.frequency].label.toLowerCase()}`;
}

/** The "Braise passe te voir" group of Paramètres: on and off, the moment and the rhythm, the week she has
 *  in mind (so the student sees what she would send, before she sends it), and a try. */
export function NotificationSettings() {
  const { state } = useApp();
  const notif = useNotifState();
  const { enable, disable } = useReminders();
  const [sheet, setSheet] = useState(false);
  const [permission, setPermission] = useState<Permission>("default");
  const [weekOpen, setWeekOpen] = useState(false);
  const [tried, setTried] = useState<string | null>(null);
  const delivery = getDelivery();

  useEffect(() => {
    let alive = true;
    void getDelivery()
      .permission()
      .then((p) => alive && setPermission(p));
    return () => {
      alive = false;
    };
  }, [notif.prefs.enabled]);

  const sheetPrefs: NotifPrefs = notif.prefs.enabled
    ? notif.prefs
    : { ...notif.prefs, frequency: frequencyFromGoal(state.user.goal) };

  const tryOne = async () => {
    const { body } = renderNotification({
      kind: "rappel",
      tone: state.user.personality,
      name: state.user.name,
      seed: Math.floor(Date.now() / 86_400_000),
      count: 3,
      minutes: 1,
      topic: "Pythagore",
    });
    setTried(body);
    await delivery.showNow("Braise", body);
  };

  return (
    <>
      <div className="settings-label">Braise passe te voir</div>
      <div className="settings-group">
        <div className="settings-row">
          <span className="settings-row-main">
            <span className="settings-row-icon" aria-hidden="true">
              <Bell size={18} />
            </span>
            Rappels de Braise
          </span>
          <Switch
            checked={notif.prefs.enabled}
            onChange={(on) => (on ? setSheet(true) : disable())}
            aria-label="Rappels de Braise"
          />
        </div>

        {notif.prefs.enabled && (
          <>
            <div className="settings-row">
              <span className="settings-row-main">
                <span className="settings-row-icon" aria-hidden="true">
                  <CalendarDays size={18} />
                </span>
                <span>
                  Ton moment
                  <small className="settings-val" style={{ display: "block" }}>
                    {momentSummary(notif.prefs)}
                  </small>
                </span>
              </span>
              <button type="button" className="settings-btn" onClick={() => setSheet(true)}>
                Changer
              </button>
            </div>

            <div className="settings-row">
              <span className="settings-row-main">
                <span className="settings-row-icon" aria-hidden="true">
                  <Send size={18} />
                </span>
                Essayer une notification
              </span>
              <button type="button" className="settings-btn" onClick={tryOne}>
                Essayer
              </button>
            </div>
            {tried && (
              <p className="nt-note" role="status" style={{ padding: "0 14px 12px" }}>
                Voilà à quoi ça ressemble : « {tried} »
              </p>
            )}

            <div className="settings-row">
              <span className="settings-row-main">La semaine de Braise</span>
              <button
                type="button"
                className="settings-btn"
                aria-expanded={weekOpen}
                onClick={() => setWeekOpen((v) => !v)}
              >
                {weekOpen ? "Masquer" : "Voir"}
              </button>
            </div>
            {weekOpen &&
              (notif.plan.length > 0 ? (
                <ul className="nt-week">
                  {notif.plan.slice(0, 5).map((p) => (
                    <li key={p.id}>
                      <time dateTime={new Date(p.at).toISOString()}>
                        {dayLabel(p.at)} · {hourLabel(p.at)}
                      </time>
                      {p.body}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="nt-note" style={{ padding: "0 14px 14px" }}>
                  Rien de prévu pour l’instant : Braise ne parle que s’il y a quelque chose de vrai
                  à dire.
                </p>
              ))}
          </>
        )}
      </div>
      {notif.prefs.enabled && (
        <p className="settings-note">{permissionLine(permission, delivery.kind)}</p>
      )}

      {sheet && (
        <MomentSheet
          initial={sheetPrefs}
          confirmLabel={notif.prefs.enabled ? "Enregistrer" : "Activer les rappels"}
          onClose={() => setSheet(false)}
          onConfirm={(prefs) => {
            setSheet(false);
            void enable(prefs).then(setPermission);
          }}
        />
      )}
    </>
  );
}
