import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { Hub, type HubWorld } from "@/components/world/Hub";
import { TopBar } from "@/components/TopBar";
import { useScrollMemory } from "@/lib/world/useScroll";
import { SubjectDecks, type SubjectDeckItem } from "@/components/SubjectDecks";
import { SUBJECT_SHORT_NAMES, SUBJECTS } from "@/data";
import { sfx } from "@/lib/sound";
import { useApp } from "@/store";
import { resolveChapters } from "@/lib/progress";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";
import { useCourseProgress } from "@/lib/course/useCourseProgress";
import { buildLibrary, type Library } from "@/lib/catalog/catalog";
import { HUB_CAPACITY } from "@/lib/world/layout";
import { dueInLibrary, pickGlobalResume, verbFor } from "@/lib/world/resume";

/** The voluntary exploration space: Home recommends; "Où on va ?" lets the student choose a subject.
 *  Braise stands in the middle, each subject is a world around her, and nothing is locked. */
export function SubjectsView() {
  const { state, goBack, openSubject, openLesson } = useApp();
  const { t } = useTone();
  const courseProgress = useCourseProgress();
  useScrollMemory("hub");

  const libraries = useMemo(() => {
    const now = Date.now();
    return SUBJECTS.map(
      (s) =>
        buildLibrary(s.id, {
          completedChapters: state.completedChapters,
          cardReviews: state.cardReviews,
          course: courseProgress,
          now,
        }) as Library,
    );
  }, [state.completedChapters, state.cardReviews, courseProgress]);

  const global = pickGlobalResume(libraries, state.lastSubjectId);
  const open = (id: string) => {
    sfx.tap(state.soundOn);
    openSubject(id);
  };

  // More subjects than the scene has places for: the plain grid of decks takes over.
  if (SUBJECTS.length > HUB_CAPACITY) {
    const decks: SubjectDeckItem[] = SUBJECTS.map((subject) => {
      const chapters = resolveChapters(subject.chapters, state.completedChapters);
      const doneCount = chapters.filter((chapter) => chapter.status === "done").length;
      const currentIndex = chapters.findIndex((chapter) => chapter.status === "current");
      const current = currentIndex >= 0 ? chapters[currentIndex] : null;
      return {
        id: subject.id,
        name: subject.name,
        color: subject.color,
        pct: Math.round((doneCount / chapters.length) * 100),
        level: currentIndex >= 0 ? currentIndex + 1 : chapters.length,
        chapterLabel: current?.title.replace(/^(les |la |le |l')/i, "") ?? "Parcours terminé",
      };
    });
    return (
      <div>
        <TopBar title="Matières" onBack={goBack} />
        <div className="view is-active subjects-view">
          <SubjectDecks items={decks} onSelect={open} />
        </div>
      </div>
    );
  }

  const worlds: HubWorld[] = SUBJECTS.map((s, i) => ({
    id: s.id,
    name: s.name,
    shortName: SUBJECT_SHORT_NAMES[s.id] ?? s.name,
    color: s.color,
    due: dueInLibrary(libraries[i]),
    suggested: global?.subjectId === s.id,
  }));

  const reason = global?.resume.reason;
  const says = !global
    ? t(COPY.world.saysAllSet)
    : reason === "resume"
      ? t(COPY.world.saysResume)
      : reason === "reinforce"
        ? t(COPY.world.saysReinforce)
        : reason === "review"
          ? t(COPY.world.saysReview(global.resume.entry.dueCount))
          : t(COPY.world.saysNext);

  return (
    <div>
      <TopBar title="Matières" onBack={goBack} />
      <div className="view is-active subjects-view">
        <header className="world-title">
          <div>
            <p>{t(COPY.world.kicker)}</p>
            <h1 className="hub-title">{t(COPY.world.title)}</h1>
          </div>
        </header>
        <Hub
          worlds={worlds}
          braiseMood={!global ? "proud" : reason === "next" ? "eager" : "happy"}
          onSelect={open}
        />
        <section className="dock dock--hub" aria-label="Braise">
          <p className="dock-says">{says}</p>
          {global && (
            <button
              type="button"
              className="dock-cta"
              onClick={() => {
                sfx.tap(state.soundOn);
                openLesson(global.subjectId, global.resume.entry.chapterId);
              }}
            >
              <span>
                {verbFor(global.resume)} <small>{global.resume.entry.title}</small>
              </span>
              <ArrowRight size={18} strokeWidth={3} />
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
