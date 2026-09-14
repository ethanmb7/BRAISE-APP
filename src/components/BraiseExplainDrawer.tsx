import { useEffect, useRef, useState } from 'react';
import { X, Send } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { sendChatMessage } from '@/lib/chat';
import { getAgeGroup } from '@/lib/braiseVoice';
import { BraiseMascot } from '@/components/BraiseMascot';
import type { Flashcard, ChatMessage } from '@/types';

type Msg = { from: 'braise' | 'me'; text: string };

type Props = {
  card: Flashcard;
  soundOn: boolean;
  onClose: () => void;
};

export function BraiseExplainDrawer({ card, soundOn, onClose }: Props) {
  const { state } = useApp();
  const voiceCtx = { personality: state.user.personality, age: getAgeGroup(state.user.level) };
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const prompt = `J'ai une carte de révision : "${card.q}" (réponse : ${card.a}). Explique-moi ça simplement avec une analogie du quotidien, comme si t'étais mon pote.`;
    sendChatMessage([{ role: 'user', text: prompt }], null, card.subject, voiceCtx).then((res) => {
      setTyping(false);
      if ('text' in res) {
        setMessages([{ from: 'braise', text: res.text }]);
      } else {
        setMessages([{ from: 'braise', text: res.error }]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card]);

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;
    sfx.tap(soundOn);
    const nextMessages: Msg[] = [...messages, { from: 'me', text }];
    setMessages(nextMessages);
    setInput('');
    setTyping(true);

    const apiMessages: ChatMessage[] = nextMessages.map((m) => ({
      role: (m.from === 'me' ? 'user' : 'model') as 'user' | 'model',
      text: m.text,
    }));

    const res = await sendChatMessage(apiMessages, null, card.subject, voiceCtx);
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
              <b>Explications de Braise</b>
              <span>{card.topic}</span>
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

        <div className="peer-input-row" style={{ background: 'var(--paper)' }}>
          <input
            type="text"
            placeholder="Pose une question à Braise..."
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
    </div>
  );
}
