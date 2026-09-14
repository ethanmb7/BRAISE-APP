export interface Deck {
  id: string;
  name: string;
  emoji: string;
  color: string;
  pct: number;
  reinforce: boolean;
}

interface DecksGridProps {
  decks: Deck[];
  onSelect: (id: string) => void;
}

// Pastel Pop — each card's background is computed straight from the subject's own saturated
// colour (color-mix, same technique already used for Ton Aura's rank-tinted cards), not a
// near-white tint, so the grid actually pops instead of reading as administrative.
export function DecksGrid({ decks, onSelect }: DecksGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {decks.map((deck) => (
        <button
          key={deck.id}
          onClick={() => onSelect(deck.id)}
          className="relative flex flex-col gap-1.5 rounded-2xl border-2 border-black p-3 text-left shadow-[3px_3px_0_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#000]"
          style={{ background: `color-mix(in srgb, ${deck.color} 40%, #fff)` }}
        >
          {deck.reinforce && (
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-sapie-coral shadow-[0_0_0_1.5px_#000]" />
          )}
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black text-sm"
            style={{ background: deck.color }}
          >
            {deck.emoji}
          </span>
          <b className="font-display text-sm font-extrabold text-[var(--neo-ink)]">{deck.name}</b>
          <div className="flex items-center gap-1.5">
            <div className="h-2 flex-1 overflow-hidden rounded-full border border-black bg-black/10">
              <div className="h-full rounded-full" style={{ width: `${deck.pct}%`, background: deck.color }} />
            </div>
            <span className="font-mono text-[0.62rem] font-bold text-black/65">{deck.pct}%</span>
          </div>
        </button>
      ))}
    </div>
  );
}
