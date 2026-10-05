import { CalendarDays, Layers, TrendingUp, User } from "lucide-react";
import { motion } from "framer-motion";
import type { TabId } from "@/types";

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

const TABS: { id: TabId; label: string; icon: typeof CalendarDays }[] = [
  { id: "home", label: "Aujourd’hui", icon: CalendarDays },
  { id: "revisions", label: "Réviser", icon: Layers },
  { id: "progres", label: "Aura", icon: TrendingUp },
  { id: "profile", label: "Moi", icon: User },
];

export function TabBar({ active, onChange }: Props) {
  return (
    <nav className="braise-tabbar" aria-label="Navigation principale">
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-current={isActive ? "page" : undefined}
            className={`braise-tab ${isActive ? "is-active" : ""}`}
          >
            {isActive && (
              <motion.span
                layoutId="tab-puck"
                className="braise-tab-puck"
                transition={{ type: "spring", stiffness: 560, damping: 32, mass: 0.72 }}
              />
            )}
            <motion.span
              className="braise-tab-icon"
              animate={isActive ? { y: [0, -2, 0], rotate: [0, -3, 0] } : { y: 0, rotate: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            >
              <Icon size={22} strokeWidth={isActive ? 2.9 : 2.35} />
            </motion.span>
            <span className="braise-tab-label">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
