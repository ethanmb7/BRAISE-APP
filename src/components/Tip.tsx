import { BraiseMascot } from "@/components/BraiseMascot";
import { useSeenOnce } from "@/lib/useSeenOnce";

/** A tip from Braise, shown the first time only: it explains a word the first time the student meets
 *  it, then never comes back. */
export function Tip({ id, children }: { id: string; children: string }) {
  const { show, dismiss } = useSeenOnce(`braise_tip_${id}`);
  if (!show) return null;
  return (
    <aside className="ui-tip" role="note">
      <span aria-hidden="true">
        <BraiseMascot size={40} mood="happy" />
      </span>
      <p>{children}</p>
      <button type="button" onClick={dismiss}>
        OK
      </button>
    </aside>
  );
}
