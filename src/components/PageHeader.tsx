import type { ReactNode } from "react";

/** The header of a main screen (Aura, Moi, "Où on va ?"): the name of the space in small orange letters,
 *  then the page's own title. Main screens have no back button, because there is nowhere to go back to;
 *  a screen opened from another one uses TopBar instead. */
export function PageHeader({
  kicker,
  title,
  right,
}: {
  kicker: string;
  title: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="page-header-kicker">{kicker}</p>
        <h1 className="page-header-title">{title}</h1>
      </div>
      {right}
    </header>
  );
}
