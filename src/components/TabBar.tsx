import { Home, Layers, TrendingUp, User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TabId } from '@/types';

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'revisions', label: 'Réviser', icon: Layers },
  { id: 'progres', label: 'Aura', icon: TrendingUp },
  { id: 'profile', label: 'Profil', icon: User },
];

// Floating dock — the app's tactile 3D construction (2.5px black border, hard offset shadow)
// with a "neo-glass" treatment on the fill: translucent paper + a blur of whatever's behind
// it, since this bar is chrome, not a reading surface, so it can afford the depth. An ink
// "puck" slides behind the active tab. Absolutely positioned inside .app-shell so the screen
// behind keeps its full height; .app-content reserves the dock's footprint.
export function TabBar({ active, onChange }: Props) {
  return (
    <nav
      className="absolute inset-x-4 z-40 flex items-center rounded-2xl border-[2.5px] border-black bg-[var(--paper)]/80 p-1.5 shadow-[4px_4px_0_#000] backdrop-blur-xl"
      style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
      aria-label="Navigation principale"
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 font-display text-[0.64rem] font-black tracking-wide transition-colors ${
              isActive ? 'text-white' : 'text-black/60 hover:text-black'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="tab-puck"
                className="absolute inset-0 rounded-xl border-2 border-black bg-black"
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              />
            )}
            <Icon size={21} strokeWidth={isActive ? 2.6 : 2.2} className="relative" />
            <span className="relative">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
