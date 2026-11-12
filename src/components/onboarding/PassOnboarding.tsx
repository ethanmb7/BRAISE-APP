import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { BraiseLogo } from "@/components/BraiseLogo";
import { BraiseMascot } from "@/components/BraiseMascot";
import { RichText } from "@/components/RichText";
import type { OnbModel } from "./model";

// Skin "pass" : un seul objet, construit devant l'élève. La carte de membre est à l'écran dès la
// première question ; la ligne qu'on remplit s'ouvre dans la carte et pose sa question, les lignes
// déjà remplies gardent leur réponse en sticker, les autres attendent. Il n'y a pas de barre de
// progression parce que la carte EST la progression : à chaque information demandée, on avance
// dedans — c'est tout ce que l'écran raconte.
//
// Et ce que « sympathique » veut dire ici, dans l'ordre d'importance : Braise reste sur scène (il
// passe la tête derrière la carte), les étiquettes parlent comme lui (« ta classe », pas
// « CLASSE »), les réponses sont surlignées au marqueur jaune comme dans les Déclics plutôt que
// saisies dans un champ, et les lignes vides sont des emplacements arrondis, pas les pointillés
// d'un formulaire. Le papier est crème chaud : sur l'orange de la marque, le blanc cassé faisait
// document administratif.
export function PassOnboarding({ model }: { model: OnbModel }) {
  const { stepId, line, options, name, reaction, pass, canContinue, ctaLabel } = model;
  const isReady = stepId === "ready";
  const filled = pass.filter((f) => f.value).length;
  const firstName = pass.find((f) => f.step === "name")?.value ?? "";

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
        {/* Sur l'écran final seulement, Braise vient saluer depuis le haut. Pendant les
            questions il se tait ici : c'est la carte qui pose la question, et lui se contente de
            la regarder par-dessus l'épaule. Un seul Braise par écran, toujours.

            Deux mots, pas trois lignes : « Ton Braise est prêt » répétait ce que le tampon PRÊT
            dit déjà sur la carte, et la phrase entière partait sur trois lignes à côté d'une tête
            de 40 px. Le prénom suffit à faire la fête. */}
        {isReady && (
          <>
            <motion.span
              className="onbp-face"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.34 }}
              aria-hidden="true"
            >
              <BraiseMascot size={40} mood={line.mood} />
            </motion.span>
            <h1 className="onbp-hello">Bienvenue, {firstName || "toi"}&nbsp;!</h1>
          </>
        )}
      </header>

      <div className="onbp-stage">
        {
          <motion.div
            className={`onbp-wrap ${isReady ? "is-sealed" : ""}`}
            initial={{ opacity: 0, y: 26, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -1.4 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
          >
            <dl className="onbp-card">
              <span className="onbp-kicker">
                Ton pass Braise
                <b>
                  {filled}/{pass.length}
                </b>
              </span>

              {pass.map((f) => {
                const open = f.step === stepId;
                return (
                  <div
                    key={f.step}
                    className={`onbp-row ${open ? "is-open" : ""} ${f.value ? "is-filled" : ""}`}
                  >
                    <dt>{open ? f.ask : f.label}</dt>
                    {open ? (
                      <dd
                        className="onbp-answers"
                        // Autant de colonnes égales que de réponses : trois tuiles alignées
                        // plutôt qu'une rangée qui déborde et en renvoie une seule à la ligne.
                        style={{
                          gridTemplateColumns: `repeat(${Math.max(1, options.length)}, minmax(0, 1fr))`,
                        }}
                      >
                        {stepId === "name" ? (
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
                        ) : (
                          options.map((o) => (
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
                              <span aria-hidden="true" className="onbp-chip-label">
                                {o.title}
                              </span>
                            </button>
                          ))
                        )}
                      </dd>
                    ) : (
                      <dd>
                        {f.value ? (
                          // Collée, pas saisie : la réponse arrive comme un sticker un peu de
                          // travers, et le ressort dépasse avant de se poser.
                          <motion.span
                            key={f.value}
                            className="onbp-sticker"
                            initial={{ scale: 1.6, rotate: -9, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 520, damping: 18 }}
                          >
                            {f.emoji && <i aria-hidden="true">{f.emoji}</i>}
                            {f.value}
                          </motion.span>
                        ) : (
                          <span className="onbp-slot" aria-hidden="true" />
                        )}
                      </dd>
                    )}
                  </div>
                );
              })}

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
            </dl>

            {/* Braise passe la tête derrière la carte : il n'a pas besoin d'une bulle pour être
                là. Il disparaît sur l'écran final, où c'est lui qui parle depuis le haut. */}
            {!isReady && (
              <span className="onbp-peek" aria-hidden="true">
                <BraiseLogo size={74} />
              </span>
            )}

            {/* Braise réagit à ce qui vient d'être répondu, depuis sa place : la carte pose les
                questions, lui commente. Les deux ne se disputent jamais le même espace. */}
            {!isReady && reaction && (
              <motion.p
                key={reaction}
                className="onbp-react"
                initial={{ opacity: 0, y: 8, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 440, damping: 26 }}
              >
                {reaction}
              </motion.p>
            )}
          </motion.div>
        }
      </div>

      <footer className="onbp-foot">
        <button type="button" className="onbp-cta" onClick={model.onNext} disabled={!canContinue}>
          {ctaLabel}
        </button>
      </footer>
    </div>
  );
}
