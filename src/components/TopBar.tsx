import { ChevronLeft } from "lucide-react";

type Props = {
  title: React.ReactNode;
  onBack?: () => void;
  right?: React.ReactNode;
  /** A second row inside the bar (it sticks with it): the subject strip of an archipelago. */
  below?: React.ReactNode;
};

export function TopBar({ title, onBack, right, below }: Props) {
  return (
    <header className="topbar">
      {onBack && (
        <button className="topbar-back" onClick={onBack} aria-label="Retour">
          <ChevronLeft size={20} />
        </button>
      )}
      <h1 className="min-w-0 flex-1 truncate">{title}</h1>
      {right && <div className="flex flex-shrink-0 items-center">{right}</div>}
      {below && <div className="topbar-below">{below}</div>}
    </header>
  );
}
