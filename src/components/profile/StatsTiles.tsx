import { BookOpen, Layers, Zap } from 'lucide-react';
import { useCountUp } from '@/lib/useCountUp';
import { StreakFlameIcon } from '@/components/StreakFlameIcon';
import { countMasteredCards } from '@/lib/aura';
import { countDoneChapters } from '@/store';
import type { AppState } from '@/types';

// The page's quick-glance scoreboard — four real numbers straight from AppState, one per tile,
// each with its own pastel medal like the Réviser recap's own stat chips. Count-up on mount so
// the numbers "arrive" like every other big number in the app (XP on the old hero did the same).
// "Cartes maîtrisées" is the SM-2 definition (repetitions >= 2, see aura.ts) — cards actually
// known, not just seen; raw volume ("cartes vues") deliberately lives nowhere on this page
// anymore, mastery is the number worth flexing.
export function StatsTiles({ state }: { state: AppState }) {
  const streak = useCountUp(state.streak);
  const xp = useCountUp(state.xp);
  const mastered = useCountUp(countMasteredCards(state.cardReviews));
  const chapters = useCountUp(countDoneChapters(state.completedChapters));

  const tiles = [
    { id: 'streak', medal: '#ffd166', icon: <StreakFlameIcon size={18} />, num: streak, lbl: 'Jours de série' },
    { id: 'xp', medal: '#c4b5fd', icon: <Zap size={16} />, num: xp, lbl: 'XP total' },
    { id: 'mastered', medal: '#a7f3d0', icon: <Layers size={16} />, num: mastered, lbl: 'Cartes maîtrisées' },
    { id: 'chapters', medal: '#dbeeff', icon: <BookOpen size={16} />, num: chapters, lbl: 'Chapitres finis' },
  ];

  return (
    <div className="pstat-grid" role="list" aria-label="Tes stats">
      {tiles.map((t) => (
        <div className="pstat-tile" key={t.id} role="listitem">
          <span className="pstat-medal" style={{ background: t.medal }}>
            {t.icon}
          </span>
          <span className="pstat-body">
            <b className="pstat-num">{t.num}</b>
            <span className="pstat-lbl">{t.lbl}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
