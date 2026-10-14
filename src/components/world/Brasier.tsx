import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";
import { MOUND, countWarmth, moundPlaces, moundRows, type Ember } from "@/lib/world/brasier";

const FLAME =
  "M12 2 C14.3 5.6 17 8.2 17 12.8 C17 17.4 14.8 20.5 12 20.5 C8.6 20.5 6 17.6 6 13.4 C6 11 7.3 9.4 7.9 7.6 C8.3 9.7 9.2 10.2 9.8 9.3 C8.9 6.3 9.8 3.4 12 2 Z";
const FLAME_HEART =
  "M12.2 10.6 C13.4 12.6 14.2 14.1 14.2 16 C14.2 17.7 13.2 18.8 12 18.8 C10.5 18.8 9.5 17.7 9.5 16.1 C9.5 14.8 10.4 14 11 13 C11.3 14.1 11.9 14.3 12.2 13.5 C11.6 12 11.6 11.3 12.2 10.6 Z";
const FLAME_SCALE = 1.5;
const STONE_Y = MOUND.baseY + 10;

/** What sits between the Pioche and "Tes mondes": the student's fire. Each notion already touched is an
 *  ember (hot when fresh, "couve" when it is starting to fade); the button relights the ones that smoulder
 *  with a short session of Réviser; when the day has had its activity, a flame lights above the fire and
 *  the day has an end. No number, no percentage, no timer: the heap says it. */
export function Brasier({
  embers,
  lit,
  goalMet,
  onRallumer,
  onKeep,
}: {
  embers: Ember[];
  /** The day has had some activity: the flame is lit. */
  lit: boolean;
  /** The day's goal is reached too: the +20 XP bonus is named. */
  goalMet: boolean;
  onRallumer: () => void;
  /** Keep the moment (the share card): offered once everything is warm and the flame is lit. */
  onKeep: () => void;
}) {
  const { t } = useTone();
  const count = countWarmth(embers);
  const empty = embers.length === 0;
  const places = moundPlaces(embers.length);
  const rows = Math.max(1, moundRows(embers.length));
  const topY = MOUND.baseY - (rows - 1) * MOUND.rise;
  const flameH = 24 * FLAME_SCALE;
  const flameY = topY - 13 - flameH;
  const top = Math.floor(flameY - 3);
  const height = STONE_Y + 18 - top;

  const line = empty
    ? COPY.brasier.empty
    : lit
      ? goalMet
        ? COPY.brasier.litBonus
        : COPY.brasier.lit
      : count.couve > 0
        ? COPY.brasier.couve
        : COPY.brasier.warm;

  // Said out loud, since colour is not enough: how many embers of each kind.
  const spoken = empty
    ? "Ton brasier est vide."
    : `Ton brasier : ${count.hot + count.warm} braise${count.hot + count.warm > 1 ? "s" : ""} au chaud, ${count.couve} qui couve${count.couve > 1 ? "nt" : ""}.`;

  return (
    <section
      className={`bras${lit ? " is-lit" : ""}${empty ? " is-empty" : ""}`}
      aria-label="Ton brasier"
    >
      <div className="bras-head">
        <h3 className="bras-title">{t(COPY.brasier.title)}</h3>
        {!lit && !empty && (
          <button type="button" className="bras-btn" onClick={onRallumer}>
            {t(COPY.brasier.rallumer)}
          </button>
        )}
      </div>
      <p className="bras-say">{t(line)}</p>
      <svg
        className="bras-pit"
        viewBox={`0 ${top} ${MOUND.width} ${height}`}
        role="img"
        aria-label={spoken}
      >
        {empty && (
          <path
            className="bras-twigs"
            d={`M96 ${STONE_Y} L150 ${STONE_Y - 36} M204 ${STONE_Y} L150 ${STONE_Y - 36} M118 ${STONE_Y} L150 ${STONE_Y - 24} M182 ${STONE_Y} L150 ${STONE_Y - 24}`}
          />
        )}
        {embers.map((ember, i) => (
          <g key={ember.key} transform={`translate(${places[i].x},${places[i].y})`}>
            <g className={`bras-em is-${ember.warmth}`}>
              <circle className="bras-em-body" r="11.5" />
              <circle className="bras-em-core" r={ember.warmth === "hot" ? 4.5 : 3} />
            </g>
          </g>
        ))}
        {empty && (
          <g transform={`translate(${MOUND.width / 2},${MOUND.baseY})`}>
            <g className="bras-em is-couve">
              <circle className="bras-em-body" r="11.5" />
            </g>
          </g>
        )}
        {Array.from({ length: 10 }, (_, k) => (
          <rect
            key={k}
            className="bras-stone"
            x={22 + k * 28}
            y={STONE_Y}
            width="26"
            height="15"
            rx="6"
          />
        ))}
        <g
          transform={`translate(${MOUND.width / 2 - 12 * FLAME_SCALE},${flameY}) scale(${FLAME_SCALE})`}
        >
          <g className="bras-flame">
            <path d={FLAME} className="bras-flame-body" />
            <path d={FLAME_HEART} className="bras-flame-heart" />
          </g>
        </g>
      </svg>
      {lit && count.couve === 0 && !empty && (
        <button type="button" className="bras-keep" onClick={onKeep}>
          {t(COPY.home.keepMoment)}
        </button>
      )}
    </section>
  );
}
