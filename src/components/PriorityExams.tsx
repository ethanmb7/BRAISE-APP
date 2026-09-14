import { AlertCircle } from 'lucide-react';

export interface PriorityExamItem {
  id: string;
  title: string;
  subjectName: string;
  subjectEmoji: string;
  subjectColor: string;
  mastery: number;
  reinforce: boolean;
}

interface PriorityExamsProps {
  items: PriorityExamItem[];
  onSelect: (id: string) => void;
}

const RING_SIZE = 44;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// A circular mastery gauge, not a "dans 2 j" countdown badge — there's no exam-date field
// anywhere in the data model, so a due-date badge would mean displaying an invented date as
// fact. Mastery % is the real per-chapter signal already tracked, so the ring shows that
// instead: the lower the ring, the more urgent — same "what needs attention" read, honest data.
function MasteryRing({ pct, color }: { pct: number; color: string }) {
  const offset = RING_CIRCUMFERENCE * (1 - pct / 100);
  return (
    <div className="relative h-11 w-11 flex-shrink-0">
      <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} className="-rotate-90">
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} fill="none" stroke="var(--line)" strokeWidth={RING_STROKE} />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[0.6rem] font-bold text-[var(--ink)]">
        {pct}%
      </span>
    </div>
  );
}

// Horizontal snap carousel — every subject's active chapter, weakest mastery first, swipeable
// rather than a flat grid. scroll-snap keeps each card centered on release; nothing here is
// hidden, just reachable by a swipe instead of stacked vertically.
export function PriorityExams({ items, onSelect }: PriorityExamsProps) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="flex w-44 flex-shrink-0 snap-center flex-col gap-2 rounded-2xl border-2 border-black bg-[var(--paper)] p-3 text-left shadow-[3px_3px_0_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#000]"
        >
          <div className="flex items-center justify-between">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black text-base"
              style={{ background: item.subjectColor }}
            >
              {item.subjectEmoji}
            </span>
            <MasteryRing pct={item.mastery} color={item.subjectColor} />
          </div>
          <div>
            <b className="block truncate font-display text-sm font-extrabold text-[var(--ink)]">{item.title}</b>
            <span className="font-mono text-[0.66rem] text-[var(--ink-soft)]">{item.subjectName}</span>
          </div>
          {item.reinforce && (
            <span className="flex w-fit items-center gap-1 rounded-full border border-black bg-sapie-coral px-2 py-0.5 text-[0.6rem] font-extrabold uppercase text-white">
              <AlertCircle size={10} /> À renforcer
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
