import { BookOpen, CalendarDays, Layers, User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TabId } from '@/types';

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

const TABS: { id: TabId; label: string; icon: typeof CalendarDays }[] = [
  { id: 'home', label: 'Aujourd’hui', icon: CalendarDays },
  { id: 'subjects', label: 'Matières', icon: BookOpen },
  { id: 'revisions', label: 'Réviser', icon: Layers },
  { id: 'profile', label: 'Moi', icon: User },
];

// Calm floating navigation: it stays recognisably BRAISE through the orange active pill, but the
// chrome is intentionally quieter than learning content. The selected state moves as one spring,
// while labels remain visible at all times for immediate comprehension.
export function TabBar({ active, onChange }: Props) {
  return (
    <nav
      className="absolute inset-x-3 z-40 flex items-center rounded-[24px] border border-black/10 bg-[var(--paper)]/92 p-1.5 shadow-[0_12px_32px_rgba(21,24,33,0.16)] backdrop-blur-md"
      style={{ bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}
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
            className={`relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[18px] px-1 font-display text-[0.66rem] font-extrabold tracking-wide transition-colors ${
              // --ink-soft/--ink, not text-black/60 — this bar is shared chrome on every screen
              // (Home, Aura, Profil too), so unlike Réviser's own cards it should actually
              // follow the app's light/dark toggle rather than opt out of it.
              isActive ? 'text-[#151821]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="tab-puck"
                className="absolute inset-0 rounded-[18px] border-2 border-black bg-[#FF6B35] shadow-[2px_2px_0_#000]"
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              />
            )}
            <Icon size={20} strokeWidth={isActive ? 2.7 : 2.2} className="relative" />
            <span className="relative">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
