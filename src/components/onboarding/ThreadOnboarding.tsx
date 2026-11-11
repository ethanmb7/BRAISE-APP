import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import type { OnbModel } from "./model";

// Skin "thread": the onboarding as the conversation it claims to be. Braise's lines arrive on the
// left on paper, the student's answers land on the right in flat yellow, and the whole exchange
// stays on screen and scrolls — at the end the student can read back the first conversation they
// had with the app. The answers are offered the way a messaging app offers quick replies: chips
// above the keyboard line, in the composer, not tiles in the middle of a form.
//
// Why this and not a form: the app's own promise is "comme si tu parlais à un pote". No other
// screen in BRAISE looks like a thread, and nothing says "this is not school" faster than a
// conversation you can scroll.
export function ThreadOnboarding({ model }: { model: OnbModel }) {
  const endRef = useRef<HTMLDivElement>(null);
  const { stepId, line, options, history, name, pass, canContinue, ctaLabel } = model;

  // Every new message pins the thread to its bottom, like any messaging app.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [history.length, line.text]);

  const isName = stepId === "name";
  const isReady = stepId === "ready";

  return (
    <div className="onbt">
      <header className="onbt-top">
        <button
          type="button"
          className="onbt-back"
          onClick={model.onBack}
          aria-label="Retour"
          disabled={model.step === 0}
        >
          <ArrowLeft size={19} strokeWidth={2.6} />
        </button>
        <span className="onbt-face" aria-hidden="true">
          <BraiseMascot size={34} mood={line.mood} />
        </span>
        <span className="onbt-who">
          <b>Braise</b>
          <small>ton pote de révisions</small>
        </span>
        <span className="onbt-pips" aria-hidden="true">
          {Array.from({ length: model.questionCount }, (_, i) => (
            <span key={i} className={i < model.step ? "is-done" : ""} />
          ))}
        </span>
      </header>

      <div className="onbt-thread">
        {history.map((h) => (
          <div key={h.id} className="onbt-turn">
            <Said text={h.braise} />
            <motion.p
              className="onbt-mine"
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              {h.student}
            </motion.p>
          </div>
        ))}

        <Said key={line.text} text={line.text} live />

        {/* Braise's messages can carry something: the card to judge, then the finished pass. */}
        {isReady && (
          <motion.dl
            className="onbt-attach onbt-pass"
            initial={{ opacity: 0, y: 24, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -1.2 }}
            transition={{ type: "spring", stiffness: 380, damping: 26, delay: 0.2 }}
          >
            <span className="onbt-pass-kicker">Ton pass Braise</span>
            {pass.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </motion.dl>
        )}
        <div ref={endRef} />
      </div>

      {/* The composer: where a messaging app puts the keyboard and its suggested replies. */}
      <footer className="onbt-composer">
        {isName ? (
          <div className="onbt-field">
            <input
              type="text"
              value={name.value}
              onChange={(e) => name.onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canContinue) model.onNext();
              }}
              placeholder="Ton prénom"
              aria-label="Ton prénom"
              maxLength={24}
              autoComplete="given-name"
              autoFocus
            />
            <button
              type="button"
              onClick={model.onNext}
              disabled={!canContinue}
              aria-label="Envoyer mon prénom"
            >
              <Send size={18} strokeWidth={2.6} />
            </button>
          </div>
        ) : options.length > 0 ? (
          <div className="onbt-replies">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`onbt-reply ${o.selected ? "is-selected" : ""}`}
                aria-pressed={o.selected}
                // The chip shows a picture and a short label; the full answer is said here, since
                // the picture alone was all a screen reader could announce.
                aria-label={o.desc ? `${o.title} — ${o.desc}` : o.title}
                onClick={o.onSelect}
              >
                <span aria-hidden="true" className="onbt-reply-aside">
                  {o.aside}
                </span>
                <span aria-hidden="true">{o.title}</span>
              </button>
            ))}
          </div>
        ) : null}

        {(!isName || !canContinue) && (
          <button type="button" className="onbt-cta" onClick={model.onNext} disabled={!canContinue}>
            {ctaLabel}
          </button>
        )}
      </footer>
    </div>
  );
}

/** One of Braise's messages. The live one types itself in, the ones above are already settled. */
function Said({ text, live = false }: { text: string; live?: boolean }) {
  return (
    <motion.p
      className="onbt-said"
      initial={live ? { opacity: 0, y: 10, scale: 0.96 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      {text}
    </motion.p>
  );
}
