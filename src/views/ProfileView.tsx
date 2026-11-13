import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Lock,
  Pencil,
  Settings,
  X,
} from "lucide-react";
import { GlossarySheet } from "@/components/GlossarySheet";
import { useApp } from "@/store";
import { sfx, setHaptics } from "@/lib/sound";
import { getRankInfo, RANKS } from "@/lib/aura";
import { GOAL_TARGETS } from "@/lib/progress";
import { TopBar } from "@/components/TopBar";
import { AvatarGlyph } from "@/components/AvatarGlyph";
import { getAvatarName } from "@/components/avatarGlyphs";
import { Switch } from "@/components/Switch";
import { AVATARS, CONTENT_LEVEL_NOTE, GOALS, LEVELS } from "@/data";
import type { Level, Personality, TextSize } from "@/types";

// Ce que cette page est, et ce qu'elle n'est pas.
//
// Moi tient deux choses, et rien d'autre : **qui tu es** (ton prénom, ta classe, la tête que tu
// portes, ta collection) et **comment l'app se comporte avec toi** (le ton de Braise, ton rythme,
// ta façon de lire, le son, tes matières). La progression — XP, série, rang chiffré, badges —
// vit entièrement sur Aura ; aucune de ces valeurs n'apparaît ici, et le rang n'est cité qu'à un
// seul endroit : sur une tête verrouillée, pour dire ce qui l'ouvre.
//
// Décisions explicites, prises avec le propriétaire, pour que personne ne les "répare" plus tard :
//   · aucun bouton d'action en bas — l'onglet Réviser est déjà dans la barre juste en dessous ;
//   · aucune mascotte Braise sur cette page — il parle déjà sur Aujourd'hui et sur Aura, et ici
//     c'est TA tête qu'on regarde, pas la sienne ;
//   · chaque réglage se change sur place, sans ouvrir d'écran : un réglage derrière un chevron
//     est un réglage qu'on ne change jamais ;
//   · taille du texte, dyslexie, sombre, sons et vibrations ont quitté Paramètres pour venir ici.
//     Ce sont les réglages de l'élève que le cours classique a déjà perdu : ils ne peuvent pas
//     rester à deux écrans de profondeur. Paramètres garde la plomberie (notifications,
//     sauvegarde, tout effacer, démo).

const PERSONAS: { id: Personality; title: string }[] = [
  { id: "chill", title: "Chill" },
  { id: "savage", title: "Cash" },
];

// `preview` est en px à dessein : les "Aa" témoins ne doivent pas grandir avec le réglage
// qu'ils commandent.
const TEXT_SIZES: { id: TextSize; label: string; preview: string }[] = [
  { id: "normal", label: "Texte normal", preview: "13px" },
  { id: "large", label: "Texte grand", preview: "16px" },
  { id: "xlarge", label: "Texte très grand", preview: "19px" },
];

// Safari sur iPhone n'a pas d'API de vibration : l'interrupteur n'y ferait rien, on ne l'affiche
// donc pas (même règle que l'ancien écran Paramètres).
const CAN_VIBRATE = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

/** Un avatar verrouillé par rang s'ouvre dès que le compte atteint ce rang ou un rang plus haut,
 *  et ne se re-verrouille jamais (même comparaison d'index que RankRail sur Aura). */
function isAvatarUnlocked(minRankId: string | undefined, currentRankId: string): boolean {
  if (!minRankId) return true;
  const minIdx = RANKS.findIndex((r) => r.id === minRankId);
  const currentIdx = RANKS.findIndex((r) => r.id === currentRankId);
  return currentIdx >= minIdx;
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.03 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const } },
};

export function ProfileView() {
  const {
    state,
    setView,
    setPersonality,
    setUser,
    toggleDark,
    toggleDyslexia,
    setTextSize,
    toggleSound,
    toggleHaptics,
  } = useApp();
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(state.user.name);
  const [lexiconOpen, setLexiconOpen] = useState(false);

  const rank = getRankInfo(state.xp).current;
  const wornName = getAvatarName(state.user.avatar);
  const goalIndex = Math.max(
    0,
    GOALS.findIndex((g) => g.id === state.user.goal),
  );
  const goalTargetXp = GOAL_TARGETS[state.user.goal];

  const tap = () => sfx.tap(state.soundOn);

  const saveName = () => {
    tap();
    setUser({ ...state.user, name: draftName.trim() || state.user.name });
    setEditingName(false);
  };

  const chooseAvatar = (id: string) => {
    tap();
    setUser({ ...state.user, avatar: id });
  };

  const chooseGoal = (id: string) => {
    tap();
    setUser({ ...state.user, goal: id });
  };

  const chooseLevel = (l: Level) => {
    tap();
    setUser({ ...state.user, level: l.id, levelLabel: l.label });
  };

  // La collection : un écran à part entière, pas un rail de 32 px coupé au bord. C'est le seul
  // ressort de jeu de la page, et le seul compatible avec "aucune comparaison entre élèves" —
  // c'est toi contre le parcours, il n'y a rien à acheter et personne à battre.
  if (collectionOpen) {
    return (
      <div>
        <TopBar
          title="Ma collection"
          onBack={() => {
            tap();
            setCollectionOpen(false);
          }}
        />
        <div className="view is-active">
          <div className="moi-plate">
            {AVATARS.map((a) => {
              const unlocked = isAvatarUnlocked(a.minRankId, rank.id);
              const requiredRank = a.minRankId ? RANKS.find((r) => r.id === a.minRankId) : null;
              const worn = state.user.avatar === a.emoji;
              return (
                <button
                  key={a.emoji}
                  type="button"
                  className={`moi-head-card ${worn ? "is-worn" : ""} ${unlocked ? "" : "is-locked"}`}
                  disabled={!unlocked}
                  aria-pressed={worn}
                  aria-label={
                    unlocked
                      ? `Porter ${getAvatarName(a.emoji)}`
                      : `${getAvatarName(a.emoji)} — débloqué au rang ${requiredRank?.name}`
                  }
                  onClick={() => chooseAvatar(a.emoji)}
                >
                  {unlocked ? (
                    <AvatarGlyph id={a.emoji} rankId={rank.id} size={52} />
                  ) : (
                    <span className="moi-head-locked" aria-hidden="true">
                      <Lock size={20} />
                    </span>
                  )}
                  <b>{getAvatarName(a.emoji)}</b>
                  {worn && <em>Portée</em>}
                  {!unlocked && <em>{requiredRank?.name}</em>}
                </button>
              );
            })}
          </div>
          <p className="moi-note">
            Les dernières arrivent avec le rang. Rien à acheter, personne à battre.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        className="view is-active moi"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* 1 · Qui tu es.
            La zone d'identité sort des marges et touche les bords de l'écran : c'est
            l'architecture commune aux références rassemblées par le propriétaire (l'app de
            quiz bleue, l'écran de série au pingouin, et son propre pass d'onboarding). Le
            personnage est posé dans un éclat de flamme, le prénom vit SUR la couleur, et le
            reste de la page remonte par-dessus sur une feuille crème arrondie. */}
        <motion.header className="moi-top" variants={staggerItem}>
          <button
            type="button"
            className="moi-gear"
            onClick={() => {
              tap();
              setView("settings");
            }}
            aria-label="Paramètres"
          >
            <Settings size={19} />
          </button>

          <button
            type="button"
            className="moi-portrait"
            onClick={() => {
              tap();
              setCollectionOpen(true);
            }}
            aria-label={`${wornName} — changer de tête`}
          >
            <span className="moi-rays" aria-hidden="true">
              <svg viewBox="0 0 220 220">
                <g stroke="#151821" strokeWidth="6.5" strokeLinecap="round" opacity="0.42">
                  <path d="M110 2v26M110 192v26M2 110h26M192 110h26" />
                  <path d="M31 31l19 19M170 170l19 19M189 31l-19 19M50 170l-19 19" />
                </g>
              </svg>
            </span>
            <span className="moi-portrait-ring">
              <AvatarGlyph id={state.user.avatar} rankId={rank.id} size={112} />
              <span className="moi-portrait-edit" aria-hidden="true">
                <Pencil size={15} />
              </span>
            </span>
          </button>

          {editingName ? (
            <div className="moi-rename">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") setEditingName(false);
                }}
                maxLength={20}
                aria-label="Ton prénom"
                autoFocus
              />
              <button type="button" onClick={saveName} aria-label="Enregistrer ton prénom">
                <Check size={17} />
              </button>
              <button
                type="button"
                className="is-ghost"
                onClick={() => setEditingName(false)}
                aria-label="Annuler"
              >
                <X size={17} />
              </button>
            </div>
          ) : (
            <h1 className="moi-name">
              {state.user.name}
              <button
                type="button"
                className="moi-rename-btn"
                onClick={() => {
                  tap();
                  setDraftName(state.user.name);
                  setEditingName(true);
                }}
                aria-label="Modifier ton prénom"
              >
                <Pencil size={14} />
              </button>
            </h1>
          )}

          <div className="moi-tags">
            <button
              type="button"
              className={`moi-tag is-button ${levelOpen ? "is-open" : ""}`}
              onClick={() => {
                tap();
                setLevelOpen(!levelOpen);
              }}
              aria-expanded={levelOpen}
            >
              {state.user.levelLabel}
              <ChevronDown size={14} />
            </button>
          </div>
          {levelOpen && (
            <div className="moi-level">
              <div className="moi-chips" role="group" aria-label="Ta classe">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={`moi-chip ${state.user.level === l.id ? "is-active" : ""}`}
                    aria-pressed={state.user.level === l.id}
                    onClick={() => {
                      chooseLevel(l);
                      setLevelOpen(false);
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <p className="moi-level-note">{CONTENT_LEVEL_NOTE}</p>
            </div>
          )}
        </motion.header>

        {/* La feuille crème remonte sur la couleur, et la pastille de collection est posée à
            cheval sur la couture — le seul endroit où l'œil doit s'arrêter entre les deux. */}
        <div className="moi-sheet">
          {/* 2 · Comment l'app se comporte avec toi. Tout se règle ici, sur place. */}
          <motion.section variants={staggerItem}>
            <h2 className="moi-section">
              <span>Comment il te parle</span>
            </h2>
            <div className="moi-rows">
              <div className="moi-row">
                <span className="moi-row-main">
                  <b>Son ton</b>
                  <small>
                    {state.user.personality === "savage"
                      ? "Il te chambre quand tu te plantes."
                      : "Encourageant, zéro pression."}
                  </small>
                </span>
                <div className="moi-seg" role="group" aria-label="Le ton de Braise">
                  <span
                    className="moi-seg-thumb"
                    style={{
                      left: `calc(3px + ${PERSONAS.findIndex((p) => p.id === state.user.personality)} * (100% - 6px) / ${PERSONAS.length})`,
                      width: `calc((100% - 6px) / ${PERSONAS.length})`,
                    }}
                    aria-hidden="true"
                  />
                  {PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`moi-seg-opt ${state.user.personality === p.id ? "is-active" : ""}`}
                      aria-pressed={state.user.personality === p.id}
                      onClick={() => {
                        tap();
                        setPersonality(p.id);
                      }}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Le rythme : la question posée à l'onboarding qu'on ne pouvait plus jamais
                rouvrir. Elle fixe l'objectif quotidien, alors elle l'affiche. */}
              <div className="moi-row is-stacked">
                <span className="moi-row-main">
                  <b>Ton rythme</b>
                  <small>
                    {GOALS[goalIndex]?.desc}
                    {goalTargetXp ? ` Objectif ${goalTargetXp} XP par jour.` : ""}
                  </small>
                </span>
                <div className="moi-seg is-wide" role="group" aria-label="Ton rythme">
                  <span
                    className="moi-seg-thumb"
                    style={{
                      left: `calc(3px + ${goalIndex} * (100% - 6px) / ${GOALS.length})`,
                      width: `calc((100% - 6px) / ${GOALS.length})`,
                    }}
                    aria-hidden="true"
                  />
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`moi-seg-opt ${state.user.goal === g.id ? "is-active" : ""}`}
                      aria-pressed={state.user.goal === g.id}
                      onClick={() => chooseGoal(g.id)}
                    >
                      {g.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section variants={staggerItem}>
            <h2 className="moi-section">
              <span>Comment tu lis</span>
            </h2>
            <div className="moi-rows">
              <div className="moi-row">
                <span className="moi-row-main">
                  <b>Taille du texte</b>
                </span>
                <div className="moi-sizes" role="group" aria-label="Taille du texte">
                  {TEXT_SIZES.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      className={`moi-size ${state.textSize === size.id ? "is-active" : ""}`}
                      style={{ fontSize: size.preview }}
                      aria-pressed={state.textSize === size.id}
                      aria-label={size.label}
                      onClick={() => {
                        tap();
                        setTextSize(size.id);
                      }}
                    >
                      Aa
                    </button>
                  ))}
                </div>
              </div>
              <div className="moi-row">
                <span className="moi-row-main">
                  <b>Mode dyslexie</b>
                  <small>Lettres espacées, lignes aérées.</small>
                </span>
                <Switch
                  checked={state.dyslexiaMode}
                  onChange={toggleDyslexia}
                  aria-label="Mode dyslexie"
                />
              </div>
              <div className="moi-row">
                <span className="moi-row-main">
                  <b>Mode sombre</b>
                </span>
                <Switch checked={state.darkMode} onChange={toggleDark} aria-label="Mode sombre" />
              </div>
            </div>
          </motion.section>

          <motion.section variants={staggerItem}>
            <h2 className="moi-section">
              <span>Ce qu'on entend</span>
            </h2>
            <div className="moi-rows">
              <div className="moi-row">
                <span className="moi-row-main">
                  <b>Sons</b>
                </span>
                <Switch checked={state.soundOn} onChange={toggleSound} aria-label="Sons" />
              </div>
              {CAN_VIBRATE && (
                <div className="moi-row">
                  <span className="moi-row-main">
                    <b>Vibrations</b>
                  </span>
                  <Switch
                    checked={state.hapticsOn}
                    onChange={() => {
                      toggleHaptics();
                      // Un seul buzz à l'allumage, pour montrer ce que c'est. Jamais à l'extinction.
                      if (!state.hapticsOn) {
                        setHaptics(true);
                        sfx.tap(false);
                      }
                    }}
                    aria-label="Vibrations"
                  />
                </div>
              )}
            </div>
          </motion.section>

          {/* 3 · Les deux sorties, discrètes, puis la ligne sur les données. Aucun bouton
            d'action : l'onglet Réviser est déjà dans la barre, juste en dessous. */}
          <motion.div className="moi-doors" variants={staggerItem}>
            <button
              type="button"
              className="moi-door"
              onClick={() => {
                tap();
                setLexiconOpen(true);
              }}
            >
              <span>
                <HelpCircle size={18} color="var(--ink-soft)" />
                Le lexique de Braise
              </span>
              <ChevronRight size={18} color="var(--ink-soft)" />
            </button>
          </motion.div>

          <motion.p className="moi-privacy" variants={staggerItem}>
            Tout reste sur ton téléphone
          </motion.p>
        </div>
      </motion.div>
      {lexiconOpen && <GlossarySheet onClose={() => setLexiconOpen(false)} />}
    </div>
  );
}
