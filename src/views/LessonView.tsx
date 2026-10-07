import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Check, X, Flame } from "lucide-react";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { TopBar } from "@/components/TopBar";
import { BraiseMascot } from "@/components/BraiseMascot";
import { getAgeGroup, quizCorrect, quizWrong } from "@/lib/braiseVoice";
import { SUBJECTS, STORIES, AUDIO_TRANSCRIPTS } from "@/data";
import { DECLIC_SCRIPTS } from "@/lib/declic";
import { DeclicMode } from "@/components/declic/DeclicMode";
import { ChapterView } from "@/views/ChapterView";
import { getCourseChapter } from "@/lib/course/registry";
import type { QuizQuestion } from "@/types";

function ScriptLessonView() {
  const { state, goBack, completeChapter, setView, reviewCard } = useApp();
  const subject = SUBJECTS.find((s) => s.id === state.currentSubjectId);
  const chapter = subject?.chapters.find((c) => c.id === state.currentChapterId);

  if (!subject || !chapter) return null;

  const storyData = STORIES[chapter.id];
  const transcript = AUDIO_TRANSCRIPTS[chapter.id];
  const declicScript = DECLIC_SCRIPTS[chapter.id];

  const handleComplete = () => {
    sfx.complete(state.soundOn);
    completeChapter(chapter.id);
    setView("complete");
  };

  // "Le Déclic" (PRODUCT_VISION.md, section 4) replaces Vocal Animé and the end-of-chapter quiz
  // entirely for any chapter with an authored script — it already covers explanation,
  // verification and the abstraction step the old quiz used to bolt on separately. Chapters
  // without a script yet (everything but the notions built end to end so far) keep the old
  // vocal/chat modes below; this is an authoring gap, not a design choice — see roadmap.md.
  if (declicScript) {
    const handleDeclicComplete = () => {
      // Real consolidation, not just a completed chapter: seeding a first "sure" review is what
      // schedules this exact notion to come back due in Réviser tomorrow, via the same SM-2
      // engine as every other card — see PRODUCT_VISION.md's "consolidation différée, sur le
      // même moteur que Réviser". Chapters authored before CARTE_REVISION existed skip this.
      // payXp false: the chapter's own 50 XP is the reward for this moment, and the Pioche card
      // promises exactly that — a hidden +10 for a card the student never saw would not match it.
      if (declicScript.reviewCardId) reviewCard(declicScript.reviewCardId, "sure", false);
      handleComplete();
    };
    return (
      <div>
        <TopBar title={chapter.title} onBack={goBack} />
        <div className="view is-active">
          <DeclicMode
            script={declicScript}
            soundOn={state.soundOn}
            onComplete={handleDeclicComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title={chapter.title} onBack={goBack} />
      <div className="view is-active">
        {storyData && (
          <div className="lesson-panel is-on">
            <VocalMode
              slides={storyData.slides}
              transcript={transcript}
              soundOn={state.soundOn}
              checkpoint={storyData.checkpoint}
            />
          </div>
        )}

        {storyData && (
          <div style={{ marginTop: 24 }}>
            <div className="section-title">Vérifie tes acquis</div>
            <Quiz questions={storyData.quiz} soundOn={state.soundOn} onComplete={handleComplete} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Vocal Animé — synced audio + story slides ===== */
function VocalMode({
  slides,
  transcript,
  soundOn,
  checkpoint,
}: {
  slides: { emoji: string; text: string; bg: string; duration: number }[];
  transcript: string | undefined;
  soundOn: boolean;
  checkpoint?: QuizQuestion[];
}) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [checkpointAnswered, setCheckpointAnswered] = useState(false);
  const [checkpointCorrect, setCheckpointCorrect] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const checkpointIndex = checkpoint && checkpoint.length > 0 ? Math.min(2, slides.length - 1) : -1;

  const playFrom = useCallback(
    (startIdx: number) => {
      clearTimers();
      setIdx(startIdx);
      setPlaying(true);
      let cumulative = 0;
      for (let i = startIdx; i < slides.length; i++) {
        cumulative += slides[i].duration;
        const isLast = i === slides.length - 1;
        const isCheckpoint = i === checkpointIndex && !checkpointAnswered;
        const timer = setTimeout(() => {
          if (isCheckpoint) {
            setPlaying(false);
            setShowCheckpoint(true);
          } else if (isLast) {
            setPlaying(false);
            sfx.complete(soundOn);
          } else {
            setIdx((c) => c + 1);
          }
        }, cumulative);
        timers.current.push(timer);
      }
    },
    [slides, clearTimers, soundOn, checkpointIndex, checkpointAnswered],
  );

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setElapsed((e) => {
        const total = slides.reduce((a, s) => a + s.duration, 0);
        return Math.min(e + 100, total);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playing, slides]);

  const toggle = () => {
    if (playing) {
      clearTimers();
      setPlaying(false);
    } else {
      sfx.tap(soundOn);
      playFrom(idx);
    }
  };

  const answerCheckpoint = (choice: number) => {
    if (!checkpoint || checkpoint.length === 0) return;
    const correct = choice === checkpoint[0].answer;
    setCheckpointCorrect(correct);
    setCheckpointAnswered(true);
    if (correct) sfx.correct(soundOn);
    else sfx.wrong(soundOn);
  };

  const continueAfterCheckpoint = () => {
    setShowCheckpoint(false);
    sfx.tap(soundOn);
    if (idx < slides.length - 1) {
      setIdx((c) => c + 1);
      playFrom(idx + 1);
    } else {
      sfx.complete(soundOn);
    }
  };

  const totalDuration = slides.reduce((a, s) => a + s.duration, 0);
  const progressPct = (elapsed / totalDuration) * 100;

  return (
    <div>
      {showCheckpoint && checkpoint && (
        <div className="checkpoint-overlay">
          <div className="checkpoint-card">
            <div className="checkpoint-badge">Micro-test rapide</div>
            <div className="checkpoint-q">{checkpoint[0].q}</div>
            {!checkpointAnswered ? (
              <div className="checkpoint-opts">
                {["Faux", "Vrai"].map((label, i) => (
                  <button key={i} className="checkpoint-opt" onClick={() => answerCheckpoint(i)}>
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className={`checkpoint-fb ${checkpointCorrect ? "ok" : "ko"}`}>
                  {checkpointCorrect ? "Bien vu ! " : "Pas grave, retiens ça : "}
                  {checkpoint[0].explain}
                </div>
                <button
                  className="btn-block blue"
                  style={{ marginTop: 14 }}
                  onClick={continueAfterCheckpoint}
                >
                  Continuer
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="story-stage">
        <div className="story-progress-row">
          {slides.map((_, i) => (
            <div key={i} className={`story-seg ${i < idx ? "done" : ""}`}>
              <span
                style={{
                  width: i < idx ? "100%" : i === idx && playing ? `${progressPct}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>
        <div
          className="story-tap-zone left"
          onClick={() => {
            if (idx > 0) {
              sfx.tap(soundOn);
              playFrom(idx - 1);
            }
          }}
        />
        <div
          className="story-tap-zone right"
          onClick={() => {
            if (idx < slides.length - 1) {
              sfx.tap(soundOn);
              playFrom(idx + 1);
            }
          }}
        />
        <div className="story-slide" key={idx}>
          <div className="story-emoji-badge" style={{ background: slides[idx].bg }}>
            <span className="story-emoji">{slides[idx].emoji}</span>
          </div>
          <div className="story-text">{slides[idx].text}</div>
        </div>
        <div className="story-hint">
          {playing ? "Touche gauche/droite pour naviguer" : "Touche play pour lancer l'animation"}
        </div>
      </div>

      {/* Audio bar */}
      <div className="audio-bar">
        <button className="audio-play-btn" onClick={toggle}>
          {playing ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 3 }} />}
        </button>
        <div className={`audio-wave ${playing ? "is-playing" : ""}`}>
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} style={{ animationPlayState: playing ? "running" : "paused" }} />
          ))}
        </div>
        <span className="audio-meta">
          {Math.floor(elapsed / 1000)}s / {Math.floor(totalDuration / 1000)}s
        </span>
      </div>

      {/* Transcript */}
      {transcript && (
        <div
          className="audio-transcript"
          style={{ background: "var(--blue-pale)", borderRadius: 14, padding: "14px 16px" }}
        >
          <div
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: "0.7rem",
              textTransform: "uppercase",
              color: "var(--ink-soft)",
              marginBottom: 8,
            }}
          >
            Transcription
          </div>
          <div style={{ fontSize: "0.86rem", lineHeight: 1.6, color: "var(--ink)" }}>
            {transcript}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Quiz ===== */
function Quiz({
  questions,
  soundOn,
  onComplete,
}: {
  questions: QuizQuestion[];
  soundOn: boolean;
  onComplete: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [done, setDone] = useState(false);
  const [feedbackLine, setFeedbackLine] = useState("");
  const { state } = useApp();
  const voiceCtx = { personality: state.user.personality, age: getAgeGroup(state.user.level) };

  const q = questions[idx];

  // No per-question XP here, on purpose: a quiz answer used to pop up "+10 XP" without ever
  // actually calling addXp — a real number the student never received. The one honest reward for
  // this chapter is completeChapter's flat amount at the end (see LessonView's handleComplete),
  // same as Le Déclic, which never gamified individual taps either.
  const handleAnswer = (optIdx: number) => {
    if (selected !== null) return;
    setSelected(optIdx);
    const correct = optIdx === q.answer;
    if (correct) {
      sfx.correct(soundOn);
      setFeedbackLine(quizCorrect(voiceCtx));
      setScore((s) => s + 1);
      setStreak((s) => {
        const ns = s + 1;
        if (ns >= 2) {
          setShowStreak(true);
          sfx.streak(soundOn);
          setTimeout(() => setShowStreak(false), 1800);
        }
        return ns;
      });
    } else {
      sfx.wrong(soundOn);
      setFeedbackLine(quizWrong(voiceCtx));
      setStreak(0);
    }
    setTimeout(() => setShowExplain(true), 400);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setDone(true);
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
      setShowExplain(false);
      setFeedbackLine("");
    }
  };

  if (done) {
    const stars = score >= questions.length ? "★★★" : score >= questions.length * 0.6 ? "★★" : "★";
    return (
      <div className="quiz-summary2">
        <div className="stars">{stars}</div>
        <div className="big-score">
          {score}/{questions.length}
        </div>
        <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
          {score >= questions.length * 0.6 ? "Beau travail !" : "Continue, tu vas progresser !"}
        </p>
        <button className="btn-block blue" style={{ marginTop: 20 }} onClick={onComplete}>
          Terminer la leçon
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-card" style={{ position: "relative" }}>
      <div className="quiz-head">
        <div className="quiz-dots">
          {questions.map((_, i) => (
            <span key={i} className={i < idx ? "done" : i === idx ? "now" : ""} />
          ))}
        </div>
        <div className={`quiz-streak-badge ${showStreak ? "show" : ""}`}>
          <Flame size={14} /> {streak} de suite !
        </div>
      </div>
      <div className="quiz-tag2">Question {idx + 1}</div>
      <div className="quiz-q2">{q.q}</div>

      {q.type === "mcq" && q.options && (
        <div>
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`quiz-opt2 ${
                selected !== null && i === q.answer ? "correct" : selected === i ? "wrong" : ""
              }`}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {q.type === "vf" && (
        <div className="quiz-vf2">
          <button
            className={
              selected !== null && q.answer === 1 ? "correct" : selected === 1 ? "wrong" : ""
            }
            onClick={() => handleAnswer(1)}
            disabled={selected !== null}
          >
            <Check size={16} />
            Vrai
          </button>
          <button
            className={
              selected !== null && q.answer === 0 ? "correct" : selected === 0 ? "wrong" : ""
            }
            onClick={() => handleAnswer(0)}
            disabled={selected !== null}
          >
            <X size={16} />
            Faux
          </button>
        </div>
      )}

      <div className={`quiz-fb2 ${selected === q.answer ? "ok" : ""}`}>
        {selected !== null && feedbackLine}
      </div>

      <div className={`braise-explain ${showExplain ? "show" : ""}`}>
        <BraiseMascot
          size={34}
          mood={selected !== null && selected !== q.answer ? "hesitant" : "happy"}
        />
        <div>
          <div className="bx-title">Braise t'explique</div>
          <div className="bx-text">{q.explain}</div>
        </div>
      </div>

      {showExplain && (
        <button className="btn-block blue" style={{ marginTop: 16 }} onClick={next}>
          {idx + 1 >= questions.length ? "Voir mon score" : "Question suivante"}
        </button>
      )}
    </div>
  );
}

/** A chapter of the official programme (course service) opens its chapter screen; every other
 *  chapter plays its older Déclic script. One tap from the path either way. */
export function LessonView() {
  const { state } = useApp();
  const courseChapter = getCourseChapter(state.currentChapterId);
  return courseChapter ? <ChapterView chapter={courseChapter} /> : <ScriptLessonView />;
}
