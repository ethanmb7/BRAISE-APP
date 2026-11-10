import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { RichText } from "@/components/RichText";
import type { OnbModel } from "./model";

// Skin "pass": one object, built in front of the student. The member card is on stage from the
// second question, empty, its fields dotted lines; every answer is stamped onto it. There is no
// progress bar because the card IS the progress — how much of it is filled says where you are —
// and the last screen is not a summary of what was asked, it is the object that was just made.
//
// The opening card (Intox / Carré) comes first all the same: the app shows what it is worth before
// asking anything. The collector-card language is the one the islands of Matières already speak.
export function PassOnboarding({ model }: { model: OnbModel }) {
  const { stepId, line, options, name, demo, pass, canContinue, ctaLabel } = model;
  const isDemo = stepId === "demo";
  const isReady = stepId === "ready";
  const filled = pass.filter((f) => f.value).length;

  return (
    <div className={`onbp onbp--${stepId}`}>
      <header className="onbp-top">
        <button
          type="button"
          className="onbp-back"
          onClick={model.onBack}
          aria-label="Retour"
          disabled={model.step === 0}
        >
          <ArrowLeft size={19} strokeWidth={2.6} />
        </button>
        <motion.span
          className="onbp-face"
          animate={{ scale: [1, 1.06, 1] }}
          key={line.text}
          transition={{ duration: 0.34 }}
          aria-hidden="true"
        >
          <BraiseMascot size={40} mood={line.mood} />
        </motion.span>
        <p className="onbp-line">{line.text}</p>
      </header>

      <div className="onbp-stage">
        {isDemo ? (
          <motion.div
            className={`onbp-claim ${demo.picked ? "is-judged" : ""}`}
            initial={{ opacity: 0, y: 16, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            {demo.picked ? <RichText text={demo.truth} markClass="onb-mark" /> : demo.claim}
          </motion.div>
        ) : (
          <motion.dl
            className={`onbp-card ${isReady ? "is-sealed" : ""}`}
            initial={{ opacity: 0, y: 26, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -1.4 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
          >
            <span className="onbp-kicker">
              Ton pass Braise
              <b>
                {filled}/{pass.length}
              </b>
            </span>
            {pass.map((f) => (
              <div key={f.label} className={f.value ? "is-filled" : ""}>
                <dt>{f.label}</dt>
                <dd>
                  {f.value ? (
                    // Keyed by the value so a change re-plays the stamp, like a seal coming down.
                    <motion.span
                      key={f.value}
                      initial={{ scale: 1.7, rotate: -8, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 520, damping: 18 }}
                    >
                      {f.value}
                    </motion.span>
                  ) : (
                    <i aria-hidden="true" />
                  )}
                </dd>
              </div>
            ))}
            {isReady && (
              <motion.span
                className="onbp-seal"
                initial={{ scale: 2.2, rotate: -22, opacity: 0 }}
                animate={{ scale: 1, rotate: -11, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.25 }}
                aria-hidden="true"
              >
                Prêt
              </motion.span>
            )}
          </motion.dl>
        )}
      </div>

      <footer className="onbp-foot">
        {isDemo ? (
          <div className="onbp-verdicts">
            {(["intox", "carre"] as const).map((side) => (
              <button
                key={side}
                type="button"
                className={`onbp-verdict onbp-verdict--${side} ${
                  demo.picked && demo.picked !== side ? "is-dimmed" : ""
                }`}
                disabled={demo.picked !== null}
                onClick={() => demo.onPick(side)}
              >
                {side === "intox" ? "✖ Intox" : "✔ Carré"}
              </button>
            ))}
          </div>
        ) : stepId === "name" ? (
          <input
            className="onbp-input"
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
        ) : options.length > 0 ? (
          <div className="onbp-chips">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`onbp-chip ${o.selected ? "is-selected" : ""}`}
                aria-pressed={o.selected}
                aria-label={o.desc ? `${o.title} — ${o.desc}` : o.title}
                onClick={o.onSelect}
              >
                <span aria-hidden="true" className="onbp-chip-aside">
                  {o.aside}
                </span>
                <span aria-hidden="true">{o.title}</span>
              </button>
            ))}
          </div>
        ) : null}

        <button type="button" className="onbp-cta" onClick={model.onNext} disabled={!canContinue}>
          {ctaLabel}
        </button>
      </footer>
    </div>
  );
}
