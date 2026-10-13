import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { TopBar } from "@/components/TopBar";
import { BraiseMascot } from "@/components/BraiseMascot";
import { Archipelago } from "@/components/world/Archipelago";
import { Dock } from "@/components/world/Dock";
import { CONTENT_LEVEL_NOTE, SUBJECTS } from "@/data";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";
import { useCourseProgress } from "@/lib/course/useCourseProgress";
import { scrollMemory } from "@/lib/world/scroll";
import { useReveal, useScrollMemory } from "@/lib/world/useScroll";
import { buildLibrary, type LibraryEntry } from "@/lib/catalog/catalog";

/** A subject as a map: an archipelago, one island per course. It shows everything, nothing is locked,
 *  and Braise points at one course in the strip under the map. */
export function SubjectView() {
  const { state, goBack, openLesson } = useApp();
  const { t } = useTone();
  const courseProgress = useCourseProgress();
  const subject = SUBJECTS.find((s) => s.id === state.currentSubjectId);
  const scrollKey = subject ? `subject:${subject.id}` : null;
  // Whether this screen has been seen before: if not, it opens on Braise's suggestion, not at the top.
  const [firstVisit] = useState(() => !scrollKey || !scrollMemory.has(scrollKey));
  useScrollMemory(scrollKey);

  const library = useMemo(
    () =>
      subject
        ? buildLibrary(subject.id, {
            completedChapters: state.completedChapters,
            cardReviews: state.cardReviews,
            course: courseProgress,
            now: Date.now(),
          })
        : null,
    [subject, state.completedChapters, state.cardReviews, courseProgress],
  );

  // The island that was open when the student left for a course is open again when they come back
  // (and the one Home pointed at is open when they arrive from there).
  const [selectedKey, setSelectedKey] = useState<string | null>(
    () => library?.entries.find((e) => e.chapterId === state.currentChapterId)?.key ?? null,
  );

  const suggestedKey = library?.resume?.entry.key ?? null;
  useReveal(
    selectedKey ?? (firstVisit ? suggestedKey : null),
    (key) => `[data-island="${key.replace(/"/g, '\\"')}"]`,
  );

  // Escape puts the strip back to Braise's suggestion.
  useEffect(() => {
    if (!selectedKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedKey(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedKey]);

  if (!subject || !library) {
    return (
      <div>
        <TopBar title={t(COPY.world.title)} onBack={goBack} />
        <div className="view is-active lib-view">
          <p className="lib-allset">
            <BraiseMascot size={44} mood="hesitant" />
            <span>Je ne trouve pas cette matière. Retourne au choix des matières.</span>
          </p>
        </div>
      </div>
    );
  }

  const open = (entry: LibraryEntry) => {
    sfx.tap(state.soundOn);
    openLesson(subject.id, entry.chapterId);
  };

  const selected = library.entries.find((e) => e.key === selectedKey) ?? null;
  return (
    <div>
      {/* The bar says where the back button goes ("Où on va ?"); the page says where we are. */}
      <TopBar title={t(COPY.world.title)} onBack={goBack} />
      <Archipelago
        color={subject.color}
        entries={library.entries}
        suggestedKey={suggestedKey}
        selectedKey={selected?.key ?? null}
        onSelect={(key) => {
          sfx.tap(state.soundOn);
          setSelectedKey((current) => (current === key ? null : key));
        }}
        header={
          <div className="world-title">
            <div>
              <p>L’archipel</p>
              <h2>{subject.name}</h2>
            </div>
          </div>
        }
        soon={
          <>
            <b>{t(COPY.library.moreComing)}</b>
            <span>{CONTENT_LEVEL_NOTE}</span>
          </>
        }
        dock={
          <Dock
            resume={library.resume}
            selected={selected}
            onOpen={open}
            onClose={() => setSelectedKey(null)}
          />
        }
      />
    </div>
  );
}
