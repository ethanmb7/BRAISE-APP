import { useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { TopBar } from "@/components/TopBar";
import { BraiseMascot } from "@/components/BraiseMascot";
import { Archipelago } from "@/components/world/Archipelago";
import { Dock } from "@/components/world/Dock";
import { requestTheme } from "@/lib/revision/themeSession";
import { SubjectStrip } from "@/components/world/SubjectStrip";
import { SoonSheet } from "@/components/SoonSheet";
import { activeSoon } from "@/lib/world/soon";
import type { HubWorld } from "@/components/world/Hub";
import { CONTENT_LEVEL_NOTE, SUBJECTS, SUBJECT_SHORT_NAMES } from "@/data";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";
import { useCourseProgress } from "@/lib/course/useCourseProgress";
import { scrollMemory } from "@/lib/world/scroll";
import { useReveal, useScrollMemory } from "@/lib/world/useScroll";
import { buildLibrary, type Library, type LibraryEntry } from "@/lib/catalog/catalog";
import { dueInLibrary } from "@/lib/world/resume";
import { emblemFor } from "@/lib/world/emblems";

/** A subject as a map: an archipelago, one island per course. It shows everything, nothing is locked,
 *  and Braise points at one course in the strip under the map. */
export function SubjectView() {
  const { state } = useApp();
  // Another subject from the strip is a new screen: its own open island, its own place in the page.
  return <Archipel key={state.currentSubjectId} />;
}

function Archipel() {
  const { state, goBack, openLesson, openSubject, setSoon, setTab } = useApp();
  const [soonOpen, setSoonOpen] = useState(false);
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
        <TopBar title="Oups" onBack={goBack} />
        <div className="view is-active lib-view">
          <p className="lib-allset">
            <BraiseMascot size={44} mood="hesitant" />
            <span>Je ne trouve pas cette matière. Retourne à l’accueil.</span>
          </p>
        </div>
      </div>
    );
  }

  const open = (entry: LibraryEntry) => {
    sfx.tap(state.soundOn);
    openLesson(subject.id, entry.chapterId);
  };

  // "Déjà vu en cours ?": Réviser gets a series of this chapter's cards, tried before any lesson.
  const test = (entry: LibraryEntry) => {
    sfx.tap(state.soundOn);
    requestTheme({ subjectId: subject.id, chapterId: entry.chapterId, title: entry.title });
    setTab("revisions");
  };

  const worlds: HubWorld[] = SUBJECTS.map((s) => ({
    id: s.id,
    name: s.name,
    shortName: SUBJECT_SHORT_NAMES[s.id] ?? s.name,
    color: s.color,
    due: dueInLibrary(
      buildLibrary(s.id, {
        completedChapters: state.completedChapters,
        cardReviews: state.cardReviews,
        course: courseProgress,
        now: Date.now(),
      }) as Library,
    ),
  }));

  // Said only to the students the content does not reach yet (Première, Terminale).
  const beyondContent = state.user.level === "1ere" || state.user.level === "term";

  const soonActive = subject.id in activeSoon(state.soonBy, Date.now());
  const selected = library.entries.find((e) => e.key === selectedKey) ?? null;
  return (
    <div>
      {/* The bar names the subject and holds the way to any other one: nothing else repeats it. */}
      <TopBar
        title={subject.name}
        onBack={goBack}
        right={
          <button
            type="button"
            className="soon-btn"
            onClick={() => {
              sfx.tap(state.soundOn);
              setSoonOpen(true);
            }}
            aria-label={
              soonActive ? "Un truc important bientôt : prévu" : "Un truc important bientôt ?"
            }
            aria-haspopup="dialog"
          >
            <CalendarClock size={20} strokeWidth={2.6} aria-hidden="true" />
            {soonActive && <i aria-hidden="true" />}
          </button>
        }
        below={
          <SubjectStrip
            worlds={worlds}
            currentId={subject.id}
            onSelect={(id) => {
              sfx.tap(state.soundOn);
              openSubject(id);
            }}
          />
        }
      />
      <Archipelago
        color={subject.color}
        entries={library.entries}
        suggestedKey={suggestedKey}
        selectedKey={selected?.key ?? null}
        onSelect={(key) => {
          sfx.tap(state.soundOn);
          setSelectedKey((current) => (current === key ? null : key));
        }}
        soon={
          <>
            <b>{t(COPY.library.moreComing)}</b>
            {beyondContent && <span>{CONTENT_LEVEL_NOTE}</span>}
          </>
        }
        dock={
          <Dock
            resume={library.resume}
            selected={selected}
            onOpen={open}
            onTest={test}
            onClose={() => setSelectedKey(null)}
            emblemOf={(entry) =>
              emblemFor(
                entry.chapterId,
                library.entries.findIndex((e) => e.key === entry.key),
              )
            }
          />
        }
      />
      {soonOpen && (
        <SoonSheet
          subjectName={subject.name}
          active={soonActive}
          onChoose={(days) => {
            sfx.tap(state.soundOn);
            setSoon(subject.id, days);
            setSoonOpen(false);
          }}
          onClear={() => {
            sfx.tap(state.soundOn);
            setSoon(subject.id, null);
            setSoonOpen(false);
          }}
          onClose={() => setSoonOpen(false)}
        />
      )}
    </div>
  );
}
