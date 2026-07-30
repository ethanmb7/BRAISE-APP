import { Home, BookOpen, Layers, TrendingUp, User } from 'lucide-react';
import type { TabId } from '@/types';

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'matieres', label: 'Matières', icon: BookOpen },
  { id: 'revisions', label: 'Réviser', icon: Layers },
  { id: 'progres', label: 'Progrès', icon: TrendingUp },
  { id: 'profile', label: 'Profil', icon: User },
];

export function TabBar({ active, onChange }: Props) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            className={`tab-btn ${isActive ? 'is-active' : ''}`}
            onClick={() => onChange(t.id)}
          >
            <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
