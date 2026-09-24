import { ChevronLeft } from 'lucide-react';

type Props = {
  title: React.ReactNode;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function TopBar({ title, onBack, right }: Props) {
  return (
    <header className="topbar">
      {onBack && (
        <button className="topbar-back" onClick={onBack} aria-label="Retour">
          <ChevronLeft size={20} />
        </button>
      )}
      <h1 className="min-w-0 flex-1 truncate">{title}</h1>
      {right && <div className="flex flex-shrink-0 items-center">{right}</div>}
    </header>
  );
}
