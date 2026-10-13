import { FLAG } from "@/components/world/flags";
import type { LibraryEntry } from "@/lib/catalog/catalog";

type Status = LibraryEntry["status"];

// What a flag on an island says, in words, in the order a student moves through them. "En cours" and
// "Vu" share a flag (pale), so they share a line.
const ROWS: { statuses: Status[]; label: string; color: string }[] = [
  { statuses: ["in_progress", "discovered"], label: "Vu", color: FLAG.discovered! },
  { statuses: ["understood"], label: "Compris", color: FLAG.understood! },
  { statuses: ["mastered"], label: "Acquis", color: FLAG.mastered! },
  { statuses: ["needs_reinforcement"], label: "À renforcer", color: FLAG.needs_reinforcement! },
];

/** The key to the flags and the flame of a map, drawn with the same colours as the islands. It lists
 *  only what is on this map (a map with nothing started has no key), so it is never more than a line or
 *  two. The colour is never the only signal: every island also carries a word. */
export function StateKey({ entries }: { entries: LibraryEntry[] }) {
  const rows = ROWS.filter((row) => entries.some((e) => row.statuses.includes(e.status)));
  const flame = entries.some((e) => e.dueCount > 0);
  if (rows.length === 0 && !flame) return null;
  return (
    <ul className="state-key" aria-label="Ce que disent les drapeaux">
      {rows.map((row) => (
        <li key={row.label}>
          <svg viewBox="0 0 24 22" width="18" height="16" aria-hidden="true">
            <path d="M5 20V2" stroke="#151821" strokeWidth="3" strokeLinecap="round" />
            <path
              d="M5 2L21 8L5 14Z"
              fill={row.color}
              stroke="#151821"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
          {row.label}
        </li>
      ))}
      {flame && (
        <li>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M12 21c-5 0-8-3.3-8-7.3 0-3 1.7-4.8 3.3-6.4C9 5.6 10.4 4.4 10.7 2c3.7 2.1 7.3 5.7 7.3 10.2C18 17.7 15.5 21 12 21z"
              fill="#ff4500"
              stroke="#151821"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          À rafraîchir
        </li>
      )}
    </ul>
  );
}
