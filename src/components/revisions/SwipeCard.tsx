import { motion, useTransform, animate, type PanInfo, type MotionValue } from "framer-motion";

// Swipe verdicts — shared with SwipeDeck, which decides what each one does.
export type Verdict = "accept" | "reject";
export type FlyDir = "left" | "right" | "up";

export function SwipeCard({
  x,
  y,
  judged,
  judgedMode,
  typing,
  flying,
  flyDir,
  onDragJudge,
  onDragArm,
  onDragNext,
  onFlyComplete,
  onDragStart,
  onTap,
  children,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  judged: boolean;
  judgedMode: Verdict | null;
  typing: boolean;
  flying: boolean;
  flyDir: FlyDir;
  onDragJudge: (mode: Verdict) => void;
  onDragArm: () => void;
  onDragNext: (dir: FlyDir) => void;
  onFlyComplete: () => void;
  onDragStart?: () => void;
  onTap?: () => void;
  children: React.ReactNode;
}) {
  // Tilt is a pure function of the current horizontal drag offset, nothing else — rotate is
  // fully derived from x, so whenever x is animated back to 0 rotate follows it to exactly 0
  // automatically, with nothing separate left to reset or go stale.
  const rotate = useTransform(x, [-200, 200], [-16, 16]);

  // Border tints green/red as the drag leans toward accept/reject, fully saturated well
  // before the 90px release threshold so the color itself previews the outcome.
  const borderColor = useTransform(x, [-140, 0, 140], ["#E8564B", "#000000", "#0F9E6E"]);
  // Full-card color wash layered on top of the content (see .fc-swipe-wash) — the border tint
  // alone reads as a thin accent; this makes the whole stage visibly lean red/green as you
  // drag. Together with the dock button lifting (SwipeDeck), that's the whole drag preview:
  // nothing is written over the cards while the student is moving them.
  const washColor = useTransform(
    x,
    [-140, 0, 140],
    ["rgba(232, 86, 75, 0.28)", "rgba(0, 0, 0, 0)", "rgba(15, 158, 110, 0.28)"],
  );

  const springBack = () => {
    // Released without crossing a threshold. With dragMomentum off and no dragConstraints,
    // framer freezes x/y wherever the finger lifted — forcing the spring back explicitly is
    // what keeps an aborted swipe from leaving the card stuck off-center and tilted.
    animate(x, 0, { type: "spring", stiffness: 420, damping: 32 });
    animate(y, 0, { type: "spring", stiffness: 420, damping: 32 });
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    // Release threshold: 90px covers a comfortable thumb flick without being so short that
    // a small readjustment mid-read accidentally commits a verdict.
    const vertical = offset.y < -90 && Math.abs(offset.y) > Math.abs(offset.x);
    if (judged) {
      // After the verdict the swipe never blocks: any direction past the threshold moves on,
      // flying the card out the way it was thrown.
      if (vertical) onDragNext("up");
      else if (offset.x > 90) onDragNext("right");
      else if (offset.x < -90) onDragNext("left");
      else springBack();
      return;
    }
    if (vertical) {
      // Up = arm the joker for this card (a declaration, not a verdict), then settle back.
      onDragArm();
      springBack();
    } else if (offset.x > 90) {
      onDragJudge("accept");
    } else if (offset.x < -90) {
      onDragJudge("reject");
    } else {
      springBack();
    }
  };

  // Verdict lock: once a direction is committed, the card animates to a fixed off-screen
  // target rather than continuing on drag momentum — the outcome (and its color) needs to
  // be deterministic, not dependent on exactly how hard the release throw was.
  const verdictColor =
    judgedMode === "accept" ? "#0F9E6E" : judgedMode === "reject" ? "#E8564B" : "#000000";
  const target = !flying
    ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, borderColor: "#000000" }
    : flyDir === "up"
      ? { x: 0, y: -700, rotate: 0, scale: 1, opacity: 0, borderColor: verdictColor }
      : flyDir === "left"
        ? { x: -480, y: -30, rotate: -22, scale: 1, opacity: 0, borderColor: verdictColor }
        : { x: 480, y: -30, rotate: 22, scale: 1, opacity: 0, borderColor: verdictColor };

  return (
    <motion.div
      className={`flashcard ${judged ? "is-judged" : ""}`}
      style={{ x, y, rotate, borderColor }}
      // Draggable before AND after the verdict — post-verdict drags advance instead of judging
      // (see handleDragEnd). Only the typing beat is off-limits.
      drag={!typing && !flying}
      // Commits to whichever axis the gesture starts on and holds it for the rest of that
      // drag, instead of letting x and y drift together — a swipe that starts slightly
      // diagonal used to blend the verdict tilt/colour-wash (driven by x) with the up-swipe
      // check (driven by y), reading as "mushy" rather than a clean, single-direction swipe.
      // It also means handleDragEnd's own vertical/horizontal branches see a cleaner signal:
      // whichever axis is locked stays near 0 on the other, so the two checks can't both
      // nearly-fire on the same ambiguous diagonal release.
      dragDirectionLock
      // 0.55 = the physical "resistance": at 1 the card would track the finger 1:1 with no
      // give, at 0 it wouldn't move past the origin at all.
      dragElastic={0.55}
      // Momentum is off deliberately — release-throw physics are replaced by the fixed
      // `target` animation above once a verdict is locked.
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={handleDragEnd}
      // Each new card mounts fresh (key={card.id}), so this initial state is what makes it
      // arrive with a soft pop rather than snapping straight to rest.
      initial={{ scale: 0.92, opacity: 0 }}
      animate={target}
      transition={
        flying
          ? { duration: 0.4, ease: [0.5, 0, 0.85, 0.35] }
          : { type: "spring", stiffness: 420, damping: 32 }
      }
      onAnimationComplete={() => {
        if (flying) onFlyComplete();
      }}
      onClick={onTap}
    >
      <motion.div className="fc-swipe-wash" style={{ background: washColor }} aria-hidden="true" />
      {children}
    </motion.div>
  );
}
