import type { DotState, EntrySource } from "@/lib/catalog/catalog";

const DOT_LABEL: Record<DotState, string> = {
  empty: "pas encore",
  half: "commencé",
  full: "compris",
  gold: "acquis",
  warn: "à renforcer",
};

/** One pastille per step of a course: a Déclic for a chapter of the programme, or the lesson then
 *  each Réviser card for an older chapter. The lesson of an older chapter is drawn a little larger
 *  so it reads as "the lesson, then its cards". Decorative: the card's own label says the state. */
export function Dots({ dots, source }: { dots: DotState[]; source: EntrySource }) {
  return (
    <span
      className="lib-dots"
      role="img"
      aria-label={dots.map((d, i) => `${i + 1} ${DOT_LABEL[d]}`).join(", ")}
    >
      {dots.map((d, i) => (
        <i
          key={i}
          className={`lib-dot lib-dot--${d}${source === "legacy" && i === 0 ? " lib-dot--lesson" : ""}`}
        />
      ))}
    </span>
  );
}
