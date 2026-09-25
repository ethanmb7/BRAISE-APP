import { useEffect, useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Clock3, Layers3 } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { sfx } from "@/lib/sound";
import { getLastPiocheOpenDate, setLastPiocheOpenDate } from "@/lib/celebrations";
import { firePiocheReveal, getPiocheRevealTiming } from "@/lib/piocheTransition";

interface HeroPiocheCardProps {
  /** Fuller sentence (from `dailyPickLine()`) announced to screen readers only — folds the
   *  personalised hook, chapter and subject into one flowing sentence, even though none of that
   *  shows as its own visible line in the card (matches the photo reference: a plain 3-line
   *  stack, no 4th hook line). */
  bubbleLine: string;
  subjectName?: string;
  /** A subject-owned colour used as a small identity signal, never as the CTA colour. */
  subjectColor?: string;
  chapterTitle: string;
  /** The real chapter's own `duration` field (data.ts) — minutes, never a guessed number. */
  duration: number;
  /** Real count of FLASHCARDS tagged with this chapter's id — not a fixed session size; every
   *  chapter has its own real deck. */
  cardCount: number;
  soundOn: boolean;
  onStart: () => void;
  variant?: "daily" | "resume";
}

// The daily pick is the Home screen's arcade cabinet: one oversized tactile block, a living
// Braise in the middle and one unmissable action. Supporting data stays in small game-like chips.
//
// The click fires the real audio/haptic sequence itself (sfx.chestOpen/chestOpenQuick, both new,
// each internally timed to the chest's own beats — see BraiseChest's file header) rather than a
// single whoosh at navigation time, and decides once, synchronously, whether this is the day's
// first "pioche" open (full ~900ms ceremony) or a same-day reopen (abbreviated ~420ms) — read and
// written here rather than lifted to HomeView because both the read and the write have to happen
// at the exact instant of the click, before the animation choice is made; HomeView's onStart prop
// only fires later, at the delayed navigation.
export function HeroPiocheCard({
  bubbleLine,
  subjectName,
  chapterTitle,
  duration,
  cardCount,
  soundOn,
  onStart,
  variant = "daily",
}: HeroPiocheCardProps) {
  const [hyped, setHyped] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [quick, setQuick] = useState(false);
  const launchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      if (launchTimer.current) clearTimeout(launchTimer.current);
      if (revealTimer.current) clearTimeout(revealTimer.current);
    },
    [],
  );

  const unhype = () => setHyped(false);

  const handleStart = () => {
    if (launching) return;
    if (variant === "resume") {
      sfx.tap(soundOn);
      onStart();
      return;
    }
    const firstToday = getLastPiocheOpenDate() !== new Date().toDateString();
    setLastPiocheOpenDate();
    setQuick(!firstToday);
    (firstToday ? sfx.chestOpen : sfx.chestOpenQuick)(soundOn);
    // The real navigation (onStart → openSubject) unmounts this component immediately, so it's
    // delayed just long enough for the chosen sequence to actually be seen before the screen
    // changes — the full ceremony needs ~900ms to land, the abbreviated repeat only ~420ms.
    const totalMs = firstToday ? 900 : 420;
    setLaunching(true);
    launchTimer.current = setTimeout(onStart, totalMs);
    // Fires PiocheRevealVeil's light burst timed to peak right as the view actually swaps — see
    // piocheTransition.ts for why this and launchTimer share one timing source instead of two
    // separately-guessed numbers.
    revealTimer.current = setTimeout(
      () => firePiocheReveal(totalMs),
      totalMs - getPiocheRevealTiming(totalMs).fadeInMs,
    );
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        className="relative min-h-[330px] overflow-hidden rounded-[28px] border-[3px] border-black bg-[#FF6B35] p-4 shadow-[6px_6px_0px_0px_#000]"
        aria-label={`${variant === "resume" ? "Reprendre" : "Pioche du jour"} : ${chapterTitle}`}
        animate={{ scale: launching ? 1.025 : 1 }}
        transition={{ duration: quick ? 0.22 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span
          className="absolute -right-10 -top-12 h-40 w-40 rounded-full border-[18px] border-[#FFD43B]/70"
          aria-hidden="true"
        />
        <span
          className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full border-[22px] border-[#7C3AED]/25"
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex -rotate-2 rounded-full border-[3px] border-black bg-[#FFD43B] px-3 py-1 font-mono text-[0.68rem] font-black uppercase tracking-[0.08em] shadow-[3px_3px_0px_0px_#000]">
              {variant === "resume" ? "RETOUR EN JEU" : "PIOCHE DU JOUR"}
            </p>
            <h2 className="mt-3 max-w-[210px] font-display text-[1.55rem] font-black leading-[0.95] text-[#151821]">
              {chapterTitle}
            </h2>
          </div>
          <span className="rounded-xl border-[3px] border-black bg-white px-2 py-1 font-mono text-[0.58rem] font-black uppercase shadow-[3px_3px_0px_0px_#000]">
            {subjectName ?? "SURPRISE"}
          </span>
        </div>

        <motion.div
          className="absolute bottom-[67px] left-1/2 z-0 -translate-x-1/2"
          animate={
            launching
              ? { y: [0, 8, -20], rotate: [0, 4, -5], scale: [1, 0.92, 1.14] }
              : hyped
                ? { y: -8, rotate: -3, scale: 1.06 }
                : { y: [0, -4, 0] }
          }
          transition={
            launching
              ? { duration: quick ? 0.35 : 0.7 }
              : hyped
                ? { type: "spring", stiffness: 500, damping: 18 }
                : { duration: 2.4, repeat: Infinity }
          }
          aria-hidden="true"
        >
          <BraiseMascot size={148} mood="cool" />
        </motion.div>

        <div className="absolute bottom-[76px] left-4 z-10 flex flex-col gap-2">
          <span className="flex items-center gap-1 rounded-lg border-2 border-black bg-white px-2 py-1 font-mono text-[0.6rem] font-black shadow-[2px_2px_0px_0px_#000]">
            <Clock3 size={13} strokeWidth={3} /> {duration} MIN
          </span>
          <span className="flex items-center gap-1 rounded-lg border-2 border-black bg-[#7C3AED] px-2 py-1 font-mono text-[0.6rem] font-black text-white shadow-[2px_2px_0px_0px_#000]">
            <Layers3 size={13} strokeWidth={3} /> {cardCount} CARTES
          </span>
        </div>

        <button
          type="button"
          onPointerEnter={() => setHyped(true)}
          onPointerDown={() => setHyped(true)}
          onPointerUp={unhype}
          onPointerLeave={unhype}
          onPointerCancel={unhype}
          onClick={handleStart}
          disabled={launching}
          className="absolute inset-x-4 bottom-4 z-20 flex min-h-14 items-center justify-center rounded-2xl border-[3px] border-black bg-[#FFD43B] px-4 font-display text-[1.05rem] font-black text-black shadow-[4px_4px_0px_0px_#000] transition-transform duration-100 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-95"
        >
          {launching ? "ÇA PART…" : variant === "resume" ? "JE REPRENDS !" : "JE PIOCHE !"}
        </button>

        <span className="sr-only">
          {bubbleLine} Cette mission contient {cardCount} carte{cardCount > 1 ? "s" : ""} et dure
          environ {duration} minutes.
        </span>
        {launching && (
          <span className="sr-only" role="status">
            Braise révèle ta mission.
          </span>
        )}
      </motion.section>
    </MotionConfig>
  );
}
