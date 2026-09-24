import { useEffect, useState } from 'react';
import type { Level } from '@/types';
import { LEVELS } from '@/data';

type Props = {
  open: boolean;
  current: string;
  onSelect: (level: Level) => void;
  onClose: () => void;
};

export function LevelSheet({ open, current, onSelect, onClose }: Props) {
  const [render, setRender] = useState(open);

  useEffect(() => {
    if (open) setRender(true);
    else {
      const t = setTimeout(() => setRender(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!render) return null;

  return (
    <>
      <div
        className="level-sheet-backdrop"
        style={{ opacity: open ? 1 : 0, transition: 'opacity 0.2s' }}
        onClick={onClose}
      />
      <div
        className="level-sheet"
        style={{
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        <div className="level-sheet-handle" />
        <h2 style={{ fontSize: '1.1rem', marginBottom: 14 }}>Choisis ton niveau</h2>
        {/* Un seul groupe réel (Lycée) depuis que le collège a été retiré — liste plate, même
            simplification que dans OnboardingView. */}
        <div className="level-list">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              className={`level-item ${current === l.id ? 'is-selected' : ''}`}
              onClick={() => onSelect(l)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
