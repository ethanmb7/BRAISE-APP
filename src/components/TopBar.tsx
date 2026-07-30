import { ChevronLeft } from 'lucide-react';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function TopBar({ title, onBack, right }: Props) {
  return (
    <div className="topbar">
      {onBack && (
        <button className="topbar-back" onClick={onBack} aria-label="Retour">
          <ChevronLeft size={20} />
        </button>
      )}
      <h1 style={{ flex: 1 }}>{title}</h1>
      {right}
    </div>
  );
}
