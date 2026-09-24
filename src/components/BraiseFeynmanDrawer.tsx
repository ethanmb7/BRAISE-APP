import { useEffect, useRef, useState } from 'react';
import { X, Send, WifiOff } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { sendChatMessage } from '@/lib/chat';
import { getAgeGroup, feynmanInvite } from '@/lib/braiseVoice';
import { BraiseMascot } from '@/components/BraiseMascot';
import { useOnlineStatus } from '@/lib/useOnlineStatus';
import type { ChatMessage } from '@/types';

type Msg = { from: 'braise' | 'me'; text: string };

/** Notion to reformulate. Deliberately generic (not `Flashcard`) — a real question/answer/topic
 *  is everything the Feynman check needs, whether it comes from a Réviser card or, e.g., a
 *  lesson quiz question (LessonView), which has no Flashcard id/chapterId/level to offer. */
type Props = {
  topic: string;
  subject: string;
  question: string;
  answer: string;
  soundOn: boolean;
  onClose: () => void;
  /** Fired once, the moment the student sends their first real reformulation — not on open, not
   *  on Braise's reply. Attempting to explain it back is the engagement worth recognizing;
   *  grading whether the explanation was *correct* would make the AI's reaction the judge of a
   *  reward, which is exactly the fragile design this avoids. */
  onEngaged?: () => void;
};

export function BraiseFeynmanDrawer({ topic, subject, question, answer, soundOn, onClose, onEngaged }: Props) {
  const { state } = useApp();
  const voiceCtx = { personality: state.user.personality, age: getAgeGroup(state.user.level) };
  const [messages, setMessages] = useState<Msg[]>(() => [{ from: 'braise', text: feynmanInvite(voiceCtx, topic) }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = async () => {
    const text = input.trim();
    if (!text || typing || !isOnline) return;
    sfx.tap(soundOn);
    const nextMessages: Msg[] = [...messages, { from: 'me', text }];
    setMessages(nextMessages);
    setInput('');
    setTyping(true);
    onEngaged?.();

    const apiMessages: ChatMessage[] = nextMessages.map((m) => ({
      role: (m.from === 'me' ? 'user' : 'model') as 'user' | 'model',
      text: m.text,
    }));

    const groundTruth = `Vérité de référence pour évaluer l'élève (ne la recopie jamais telle quelle) : la question était "${question}", la bonne réponse est "${answer}". L'élève vient de t'expliquer ce concept avec ses mots pour vérifier qu'il a compris (technique Feynman). Réagis à SON explication : dis ce qu'il a bien capté, et s'il manque un point important ou une erreur, pointe-la du doigt sans donner la réponse toute faite — pousse-le à préciser ou corriger lui-même.`;

    const res = await sendChatMessage(apiMessages, null, subject, voiceCtx, groundTruth);
    setTyping(false);
    if ('text' in res) {
      sfx.correct(soundOn);
      setMessages((m) => [...m, { from: 'braise', text: res.text }]);
    } else {
      setMessages((m) => [...m, { from: 'braise', text: res.error }]);
    }
  };

  return (
    <div className="level-sheet-backdrop" onClick={onClose}>
      <div className="explain-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="level-sheet-handle" />
        <div className="explain-head">
          <div className="explain-head-info">
            <BraiseMascot size={30} mood="happy" />
            <div>
              <b>Explique à Braise</b>
              <span>{topic}</span>
            </div>
          </div>
          <button className="intro-close" onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        <div ref={scrollRef} className="explain-scroll">
          <div className="peer-chat">
            {messages.map((m, i) => (
              <div key={i} className={`peer-msg ${m.from === 'me' ? 'me' : ''}`}>
                {m.from === 'braise' && (
                  <div className="peer-avatar" style={{ background: 'var(--orange)' }}>
                    <BraiseMascot size={20} mood="happy" />
                  </div>
                )}
                <div className="peer-bubble">{m.text}</div>
              </div>
            ))}
            {typing && (
              <div className="peer-msg">
                <div className="peer-avatar" style={{ background: 'var(--orange)' }}>
                  <BraiseMascot size={20} />
                </div>
                <div className="peer-bubble">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!isOnline && (
          <p
            role="status"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: '0.74rem',
              color: 'var(--ink-soft)',
              padding: '0 16px 6px',
            }}
          >
            <WifiOff size={13} />
            Hors-ligne · réessaie une fois reconnecté
          </p>
        )}
        <div className="peer-input-row" style={{ background: 'var(--paper)' }}>
          <input
            type="text"
            placeholder="Explique avec tes mots..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            disabled={typing || !isOnline}
          />
          <button className="peer-send" onClick={send} disabled={typing || !input.trim() || !isOnline}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
