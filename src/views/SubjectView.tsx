import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { TopBar } from "@/components/TopBar";
import { BraiseMascot } from "@/components/BraiseMascot";
import { CourseCard } from "@/components/library/CourseCard";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { ResumeBanner } from "@/components/library/ResumeBanner";
import { Archipelago } from "@/components/world/Archipelago";
import { Dock } from "@/components/world/Dock";
import { CONTENT_LEVEL_NOTE, SUBJECTS } from "@/data";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";
import { useCourseProgress } from "@/lib/course/useCourseProgress";
import { scrollMemory } from "@/lib/world/scroll";
import { useReveal, useScrollMemory } from "@/lib/world/useScroll";
import {
  availableFilters,
  buildLibrary,
  matchesFilter,
  type LibraryEntry,
  type LibraryFilter,
} from "@/lib/catalog/catalog";

type Mode = "map" | "list";
const MODE_KEY = "braise_subject_view";

function readMode(): Mode {
  try {
    return localStorage.getItem(MODE_KEY) === "list" ? "list" : "map";
  } catch {
    return "map";
  }
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const rise = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

/** A subject, two ways to see the same courses: a map (an archipelago, one island per course) and a
 *  list (cards grouped by theme, with filters). The student picks, and the choice is remembered. Both
 *  show everything, nothing is locked, and Braise points at one course in each. */
export function SubjectView() {
  const { state, goBack, openLesson } = useApp();
  const { t } = useTone();
  const courseProgress = useCourseProgress();
  const [mode, setMode] = useState<Mode>(readMode);
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const subject = SUBJECTS.find((s) => s.id === state.currentSubjectId);
  const scrollKey = subject ? `subject:${subject.id}:${mode}` : null;
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
    mode === "map" ? (selectedKey ?? (firstVisit ? suggestedKey : null)) : null,
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
        <TopBar title="Matières" onBack={goBack} />
        <div className="view is-active lib-view">
          <p className="lib-allset">
            <BraiseMascot size={44} mood="hesitant" />
            <span>Je ne trouve pas cette matière. Retourne au choix des matières.</span>
          </p>
        </div>
      </div>
    );
  }

  const switchTo = (next: Mode) => {
    sfx.tap(state.soundOn);
    setMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      /* the choice just is not remembered */
    }
  };

  const open = (entry: LibraryEntry) => {
    sfx.tap(state.soundOn);
    openLesson(subject.id, entry.chapterId);
  };

  const switcher = (
    <div className="wd-seg" role="group" aria-label="Façon de voir les cours">
      <button type="button" aria-pressed={mode === "map"} onClick={() => switchTo("map")}>
        Carte
      </button>
      <button type="button" aria-pressed={mode === "list"} onClick={() => switchTo("list")}>
        Liste
      </button>
    </div>
  );

  if (mode === "map") {
    const selected = library.entries.find((e) => e.key === selectedKey) ?? null;
    return (
      <div>
        <TopBar title="Matières" onBack={goBack} />
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
                <p>{subject.name}</p>
                <h2>L’archipel</h2>
              </div>
              {switcher}
            </div>
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

  const filters = availableFilters(library.entries);
  // A filter that no longer exists (the last card of a state just moved on) falls back to "all".
  const active: LibraryFilter = filters.some((f) => f.filter === filter) ? filter : "all";
  const themes = library.themes
    .map((theme) => ({ ...theme, entries: theme.entries.filter((e) => matchesFilter(e, active)) }))
    .filter((theme) => theme.entries.length > 0);

  return (
    <div>
      <TopBar title="Matières" onBack={goBack} />
      <div className="view is-active lib-view">
        <motion.div variants={stagger} initial="hidden" animate="show" className="lib-stack">
          <motion.div variants={rise} className="world-title">
            <div>
              <p>{subject.name}</p>
              <h2>Tous les cours</h2>
            </div>
            {switcher}
          </motion.div>

          <motion.div variants={rise}>
            {library.resume ? (
              <ResumeBanner
                subject={subject}
                resume={library.resume}
                onOpen={() => open(library.resume!.entry)}
              />
            ) : (
              <p className="lib-allset">
                <BraiseMascot size={44} mood="proud" />
                <span>{t(COPY.library.allSet)}</span>
              </p>
            )}
          </motion.div>

          {filters.length > 0 && (
            <motion.div variants={rise}>
              <LibraryFilters filters={filters} value={active} onChange={setFilter} />
            </motion.div>
          )}

          {themes.map((theme) => (
            <motion.section
              key={theme.id}
              variants={rise}
              className="lib-theme"
              aria-label={theme.label}
            >
              <header className="lib-theme-head">
                <h3>{theme.label}</h3>
                <span>{theme.caption}</span>
              </header>
              <div className="lib-grid">
                {theme.entries.map((entry, i) => (
                  <CourseCard
                    key={entry.key}
                    entry={entry}
                    color={subject.color}
                    onOpen={() => open(entry)}
                    wide={i === theme.entries.length - 1 && theme.entries.length % 2 === 1}
                  />
                ))}
              </div>
            </motion.section>
          ))}

          <motion.p variants={rise} className="lib-more">
            <b>{t(COPY.library.moreComing)}</b>
            <span>{CONTENT_LEVEL_NOTE}</span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
