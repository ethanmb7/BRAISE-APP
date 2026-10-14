import { useMemo, useState } from "react";
import { Hub, type HubWorld } from "@/components/world/Hub";
import { WorldSheet } from "@/components/world/WorldSheet";
import { PageHeader } from "@/components/PageHeader";
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
import { sheetRows } from "@/lib/world/sheet";

/** The voluntary choice: Home recommends (the Pioche); "Où on va ?" lets the student choose a subject and
 *  a chapter. Each subject is a world, nothing is locked, and there is no button here but the worlds:
 *  touching one opens its chapters, and the line of a chapter launches it. Braise does not give her
 *  advice in a card: she waits on the world she suggests, with the verb she would use, and her line is
 *  in that world's sheet. */
export function SubjectsView() {
  const { state, openSubject, openLesson } = useApp();
  const { t } = useTone();
  const courseProgress = useCourseProgress();
  useScrollMemory("hub");
  const [openId, setOpenId] = useState<string | null>(null);

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
        <div className="view is-active subjects-view">
          <PageHeader kicker={t(COPY.world.kicker)} title={t(COPY.world.title)} />
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
    suggestion:
      global?.subjectId === s.id
        ? { verb: verbFor(global.resume), chapter: global.resume.entry.title }
        : undefined,
  }));
  const dueTotal = worlds.reduce((sum, w) => sum + w.due, 0);
  // Said before going in, to the students the content does not reach yet.
  const beyondSeconde = state.user.level === "1ere" || state.user.level === "term";

  const reason = global?.resume.reason;
  const braiseMood = !global ? "proud" : reason === "next" ? "eager" : "happy";

  // The sheet of the world that was touched: its chapters, and Braise's line if it is the one she suggests.
  const index = SUBJECTS.findIndex((s) => s.id === openId);
  const openWorld = index >= 0 ? worlds[index] : null;
  const suggestedHere = !!openWorld && global?.subjectId === openWorld.id;
  const says =
    suggestedHere && global
      ? global.resume.reason === "review"
        ? t(COPY.library.reviewSays(global.resume.entry.dueCount))
        : t(COPY.library.resumeSays[global.resume.reason])
      : null;

  // The page: one title, one line that says what the number on a world means (or that all is set), and
  // the worlds. There is no bar with a title or a back button: this is a main screen (see
  // DESIGN_RULES.md), the tab bar leads back to Aujourd'hui.
  return (
    <div>
      <div className="view is-active subjects-view">
        <PageHeader kicker={t(COPY.world.kicker)} title={t(COPY.world.title)} />
        {beyondSeconde && <p className="info-note">{t(COPY.world.levelNote)}</p>}
        {dueTotal > 0 ? (
          <p className="hub-legend">{t(COPY.world.legendDue)}</p>
        ) : !global ? (
          <p className="hub-legend">{t(COPY.world.saysAllSet)}</p>
        ) : null}
        <Hub
          worlds={worlds}
          braiseMood={braiseMood}
          onSelect={(id) => {
            sfx.tap(state.soundOn);
            setOpenId(id);
          }}
        />
      </div>
      {openWorld && (
        <WorldSheet
          key={openWorld.id}
          name={openWorld.name}
          subjectId={openWorld.id}
          color={openWorld.color}
          due={openWorld.due}
          says={says}
          rows={sheetRows(libraries[index], suggestedHere ? global!.resume.entry.key : null)}
          onOpenChapter={(row) => {
            sfx.tap(state.soundOn);
            openLesson(openWorld.id, row.entry.chapterId);
          }}
          onOpenAll={() => open(openWorld.id)}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
