import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Headphones, MessageCircle, Send, Check, X, Flame, MessageSquare } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { TopBar } from '@/components/TopBar';
import { BraiseMascot } from '@/components/BraiseMascot';
import { sendChatMessage } from '@/lib/chat';
import { SUBJECTS, STORIES, AUDIO_TRANSCRIPTS, PEER_CHAT_SEED } from '@/data';
import type { QuizQuestion, ChatMessage } from '@/types';

type Mode = 'vocal' | 'echanger';

export function LessonView() {
  const { state, goBack, completeChapter, setView, bridgeToChat } = useApp();
  const [mode, setMode] = useState<Mode>(state.currentLessonMode);
  const subject = SUBJECTS.find((s) => s.id === state.currentSubjectId);
  const chapter = subject?.chapters.find((c) => c.id === state.currentChapterId);

  // Sync mode when store changes (e.g. quiz bridge)
  useEffect(() => {
    setMode(state.currentLessonMode);
  }, [state.currentLessonMode]);

  if (!subject || !chapter) return null;

  const storyData = STORIES[chapter.id];
  const transcript = AUDIO_TRANSCRIPTS[chapter.id];

  const handleComplete = () => {
    sfx.complete(state.soundOn);
    completeChapter(chapter.id);
    setView('complete');
  };

  return (
    <div>
      <TopBar title={chapter.title} onBack={goBack} />
      <div className="view is-active">
        <div className="lesson-progress">
          <span style={{ width: '35%' }} />
        </div>

        <div className="lesson-modes">
          <button
            className={`lesson-mode-btn ${mode === 'vocal' ? 'is-on' : ''}`}
            onClick={() => {
              sfx.tap(state.soundOn);
              setMode('vocal');
            }}
          >
            <Headphones size={13} />
            Vocal Animé
          </button>
          <button
            className={`lesson-mode-btn ${mode === 'echanger' ? 'is-on' : ''}`}
            onClick={() => {
              sfx.tap(state.soundOn);
              setMode('echanger');
            }}
          >
            <MessageCircle size={13} />
            Échanger
          </button>
        </div>

        {mode === 'vocal' && storyData && (
          <div className="lesson-panel is-on">
            <VocalMode
              slides={storyData.slides}
              transcript={transcript}
              soundOn={state.soundOn}
              checkpoint={storyData.checkpoint}
            />
          </div>
        )}

        {mode === 'echanger' && (
          <div className="lesson-panel is-on">
            <ChatMode
              chapterId={chapter.id}
              subjectId={subject.id}
              soundOn={state.soundOn}
              bridgeMessage={state.chatBridgeMessage}
            />
          </div>
        )}

        {storyData && mode === 'vocal' && (
          <div style={{ marginTop: 24 }}>
            <div className="section-title">Vérifie tes acquis</div>
            <Quiz
              questions={storyData.quiz}
              soundOn={state.soundOn}
              onComplete={handleComplete}
              onBridge={(question: string, userAnswer: string) =>
                bridgeToChat(subject.id, chapter.id, `J'ai répondu "${userAnswer}" à cette question mais j'ai faux : ${question}. Tu peux m'expliquer le piège ?`)
              }
            />
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
    [slides, clearTimers, soundOn, checkpointIndex, checkpointAnswered]
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
                {['Faux', 'Vrai'].map((label, i) => (
                  <button key={i} className="checkpoint-opt" onClick={() => answerCheckpoint(i)}>
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className={`checkpoint-fb ${checkpointCorrect ? 'ok' : 'ko'}`}>
                  {checkpointCorrect ? 'Bien vu ! ' : 'Pas grave, retiens ça : '}
                  {checkpoint[0].explain}
                </div>
                <button className="btn-block blue" style={{ marginTop: 14 }} onClick={continueAfterCheckpoint}>
                  Continuer
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="story-stage" style={{ background: slides[idx].bg }}>
        <div className="story-progress-row">
          {slides.map((_, i) => (
            <div key={i} className={`story-seg ${i < idx ? 'done' : ''}`}>
              <span
                style={{
                  width: i < idx ? '100%' : i === idx && playing ? `${progressPct}%` : '0%',
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
          <div className="story-emoji">{slides[idx].emoji}</div>
          <div className="story-text">{slides[idx].text}</div>
        </div>
        <div className="story-hint">
          {playing ? 'Touche gauche/droite pour naviguer' : "Touche play pour lancer l'animation"}
        </div>
      </div>

      {/* Audio bar */}
      <div className="audio-bar">
        <button className="audio-play-btn" onClick={toggle}>
          {playing ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 3 }} />}
        </button>
        <div className={`audio-wave ${playing ? 'is-playing' : ''}`}>
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} style={{ animationPlayState: playing ? 'running' : 'paused' }} />
          ))}
        </div>
        <span className="audio-meta">
          {Math.floor(elapsed / 1000)}s / {Math.floor(totalDuration / 1000)}s
        </span>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="audio-transcript" style={{ background: 'var(--blue-pale)', borderRadius: 14, padding: '14px 16px' }}>
          <div
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.66rem',
              textTransform: 'uppercase',
              color: 'var(--ink-soft)',
              marginBottom: 8,
            }}
          >
            Transcription
          </div>
          <div style={{ fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--ink)' }}>{transcript}</div>
        </div>
      )}
    </div>
  );
}

/* ===== Échanger — Chat with Braise (Gemini RAG) ===== */
type Msg = { from: 'braise' | 'me'; text: string };

function ChatMode({
  chapterId,
  subjectId,
  soundOn,
  bridgeMessage,
}: {
  chapterId: string;
  subjectId: string;
  soundOn: boolean;
  bridgeMessage: string | null;
}) {
  const [messages, setMessages] = useState<Msg[]>(PEER_CHAT_SEED[chapterId] ?? []);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bridgeHandled = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  // Handle quiz→chat bridge: auto-send the bridge message
  useEffect(() => {
    if (bridgeMessage && !bridgeHandled.current) {
      bridgeHandled.current = true;
      setMessages((m) => [...m, { from: 'me', text: bridgeMessage }]);
      setInput('');
      setTyping(true);
      setError(null);

      const apiMessages: ChatMessage[] = [
        ...(PEER_CHAT_SEED[chapterId] ?? []).map((m) => ({
          role: (m.from === 'me' ? 'user' : 'model') as 'user' | 'model',
          text: m.text,
        })),
        { role: 'user' as const, text: bridgeMessage },
      ];

      sendChatMessage(apiMessages, chapterId, subjectId).then((res) => {
        setTyping(false);
        if ('text' in res) {
          sfx.correct(soundOn);
          setMessages((m) => [...m, { from: 'braise', text: res.text }]);
        } else {
          setError(res.error);
          setMessages((m) => [
            ...m,
            { from: 'braise', text: "Oups, j'ai eu un petit bug. Tu peux reformuler ?" },
          ]);
        }
      });
    }
  }, [bridgeMessage, chapterId, subjectId, soundOn]);

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;
    sfx.tap(soundOn);
    setError(null);
    setMessages((m) => [...m, { from: 'me', text }]);
    setInput('');
    setTyping(true);

    const apiMessages: ChatMessage[] = [
      ...(PEER_CHAT_SEED[chapterId] ?? []).map((m) => ({
        role: (m.from === 'me' ? 'user' : 'model') as 'user' | 'model',
        text: m.text,
      })),
      ...messages
        .filter((m) => !(PEER_CHAT_SEED[chapterId] ?? []).includes(m))
        .map((m) => ({
          role: (m.from === 'me' ? 'user' : 'model') as 'user' | 'model',
          text: m.text,
        })),
      { role: 'user' as const, text },
    ];

    const res = await sendChatMessage(apiMessages, chapterId, subjectId);
    setTyping(false);
    if ('text' in res) {
      sfx.correct(soundOn);
      setMessages((m) => [...m, { from: 'braise', text: res.text }]);
    } else {
      setError(res.error);
      setMessages((m) => [
        ...m,
        { from: 'braise', text: "Oups, j'ai eu un petit bug. Tu peux reformuler ?" },
      ]);
    }
  };

  return (
    <div>
      <div
        ref={scrollRef}
        style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto', marginBottom: 12 }}
      >
        <div className="peer-chat">
          {messages.map((m, i) => (
            <div key={i} className={`peer-msg ${m.from === 'me' ? 'me' : ''}`}>
              {m.from === 'braise' && (
                <div className="peer-avatar" style={{ background: 'var(--coral)' }}>
                  <BraiseMascot size={20} mood="happy" />
                </div>
              )}
              <div className="peer-bubble">{m.text}</div>
            </div>
          ))}
          {typing && (
            <div className="peer-msg">
              <div className="peer-avatar" style={{ background: 'var(--coral)' }}>
                <BraiseMascot size={20} />
              </div>
              <div className="peer-bubble">
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                  Braise réfléchit... 🔥
                </span>
                <div className="typing-dots" style={{ marginTop: 4 }}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>
        {error && (
          <p style={{ fontSize: '0.76rem', color: 'var(--coral-2)', textAlign: 'center', marginTop: 8 }}>
            {error}
          </p>
        )}
      </div>
      <div className="peer-input-row">
        <input
          type="text"
          placeholder="Pose ta question à Braise..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={typing}
        />
        <button className="peer-send" onClick={send} disabled={typing || !input.trim()}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

/* ===== Quiz with quiz→chat bridge ===== */
function Quiz({
  questions,
  soundOn,
  onComplete,
  onBridge,
}: {
  questions: QuizQuestion[];
  soundOn: boolean;
  onComplete: () => void;
  onBridge: (question: string, userAnswer: string) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [done, setDone] = useState(false);
  const [xpPop, setXpPop] = useState<{ x: number; y: number } | null>(null);

  const q = questions[idx];

  const handleAnswer = (optIdx: number, event: React.MouseEvent) => {
    if (selected !== null) return;
    setSelected(optIdx);
    const correct = optIdx === q.answer;
    if (correct) {
      sfx.correct(soundOn);
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
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const parentRect = (event.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
      setXpPop({
        x: rect.left - (parentRect?.left ?? 0) + rect.width / 2,
        y: rect.top - (parentRect?.top ?? 0),
      });
      setTimeout(() => setXpPop(null), 900);
    } else {
      sfx.wrong(soundOn);
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
    }
  };

  if (done) {
    const stars = score >= questions.length ? '★★★' : score >= questions.length * 0.6 ? '★★' : '★';
    return (
      <div className="quiz-summary2">
        <div className="stars">{stars}</div>
        <div className="big-score">
          {score}/{questions.length}
        </div>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
          {score >= questions.length * 0.6 ? 'Beau travail !' : 'Continue, tu vas progresser !'}
        </p>
        <button className="btn-block blue" style={{ marginTop: 20 }} onClick={onComplete}>
          Terminer la leçon
        </button>
      </div>
    );
  }

  const userAnswerText =
    q.type === 'mcq' && q.options ? q.options[selected ?? -1] ?? '' : selected === 1 ? 'Vrai' : 'Faux';

  return (
    <div className="quiz-card" style={{ position: 'relative' }}>
      {xpPop && (
        <div className="xp-pop" style={{ left: xpPop.x, top: xpPop.y }}>
          +10 XP
        </div>
      )}
      <div className="quiz-head">
        <div className="quiz-dots">
          {questions.map((_, i) => (
            <span key={i} className={i < idx ? 'done' : i === idx ? 'now' : ''} />
          ))}
        </div>
        <div className={`quiz-streak-badge ${showStreak ? 'show' : ''}`}>
          <Flame size={14} /> {streak} de suite !
        </div>
      </div>
      <div className="quiz-tag2">Question {idx + 1}</div>
      <div className="quiz-q2">{q.q}</div>

      {q.type === 'mcq' && q.options && (
        <div>
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`quiz-opt2 ${
                selected !== null && i === q.answer ? 'correct' : selected === i ? 'wrong' : ''
              }`}
              onClick={(e) => handleAnswer(i, e)}
              disabled={selected !== null}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {q.type === 'vf' && (
        <div className="quiz-vf2">
          <button
            className={selected !== null && q.answer === 1 ? 'correct' : selected === 1 ? 'wrong' : ''}
            onClick={(e) => handleAnswer(1, e)}
            disabled={selected !== null}
          >
            <Check size={16} />
            Vrai
          </button>
          <button
            className={selected !== null && q.answer === 0 ? 'correct' : selected === 0 ? 'wrong' : ''}
            onClick={(e) => handleAnswer(0, e)}
            disabled={selected !== null}
          >
            <X size={16} />
            Faux
          </button>
        </div>
      )}

      <div className={`quiz-fb2 ${selected === q.answer ? 'ok' : ''}`}>
        {selected !== null && (selected === q.answer ? '✓ Correct !' : 'Pas de panique ! C\'est un piège classique.')}
      </div>

      <div className={`braise-explain ${showExplain ? 'show' : ''}`}>
        <BraiseMascot size={34} mood={selected !== null && selected !== q.answer ? 'hesitant' : 'happy'} />
        <div>
          <div className="bx-title">Braise t'explique</div>
          <div className="bx-text">{q.explain}</div>
          {selected !== null && selected !== q.answer && (
            <button
              className="quiz-bridge-btn"
              onClick={() => onBridge(q.q, userAnswerText)}
            >
              <MessageSquare size={15} />
              Comprendre ce piège avec Braise
            </button>
          )}
        </div>
      </div>

      {showExplain && (
        <button className="btn-block blue" style={{ marginTop: 16 }} onClick={next}>
          {idx + 1 >= questions.length ? 'Voir mon score' : 'Question suivante'}
        </button>
      )}
    </div>
  );
}
