import { useMemo, useState } from "react";
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

/** Les trois mises en page de Moi, commutables comme les peaux de l'onboarding :
 *  `localStorage.braise_moi` = "poster" (par défaut) | "pass" | "tableau".
 *  Même contenu, même règles, trois architectures — on tranche sur le téléphone, pas sur
 *  une maquette. */
export const MOI_SKIN_KEY = "braise_moi";
type MoiSkin = "poster" | "pass" | "tableau";
function readMoiSkin(): MoiSkin {
  try {
    const v = localStorage.getItem(MOI_SKIN_KEY);
    return v === "pass" || v === "tableau" ? v : "poster";
  } catch {
    return "poster";
  }
}

/** Le contrôle segmenté, à N options : la pastille se place en pourcentage, donc le même
 *  composant sert au ton (2 options) et au rythme (3). */
function Seg({
  options,
  activeId,
  onPick,
  label,
}: {
  options: { id: string; title: string }[];
  activeId: string;
  onPick: (id: string) => void;
  label: string;
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.id === activeId),
  );
  return (
    <div className="moi-seg is-wide" role="group" aria-label={label}>
      <span
        className="moi-seg-thumb"
        style={{
          left: `calc(3px + ${index} * (100% - 6px) / ${options.length})`,
          width: `calc((100% - 6px) / ${options.length})`,
        }}
        aria-hidden="true"
      />
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`moi-seg-opt ${o.id === activeId ? "is-active" : ""}`}
          aria-pressed={o.id === activeId}
          onClick={() => onPick(o.id)}
        >
          {o.title}
        </button>
      ))}
    </div>
  );
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
  // Un seul volet ouvert à la fois : deux contrôles dépliés en même temps font perdre le fil
  // de ce qu'on était venu changer.
  const [openTile, setOpenTile] = useState<null | "ton" | "rythme">(null);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(state.user.name);
  const [lexiconOpen, setLexiconOpen] = useState(false);
  const [skin] = useState<MoiSkin>(readMoiSkin);

  const rank = getRankInfo(state.xp).current;
  const wornName = getAvatarName(state.user.avatar);
  const unlockedCount = useMemo(
    () => AVATARS.filter((a) => isAvatarUnlocked(a.minRankId, rank.id)).length,
    [rank.id],
  );
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

  const personaTitle = PERSONAS.find((p) => p.id === state.user.personality)?.title;
  const personaDesc =
    state.user.personality === "savage"
      ? "Il te chambre quand tu te plantes."
      : "Encourageant, zéro pression.";

  // Les briques partagées par les trois architectures : mêmes contrôles, mêmes libellés,
  // seule leur mise en scène change.
  const tonSeg = (
    <Seg
      options={PERSONAS}
      activeId={state.user.personality}
      label="Le ton de Braise"
      onPick={(id) => {
        tap();
        setPersonality(id as Personality);
      }}
    />
  );
  const rythmeSeg = (
    <Seg options={GOALS} activeId={state.user.goal} label="Ton rythme" onPick={chooseGoal} />
  );

  const nameBlock = editingName ? (
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
  );

  const tagsBlock = (
    <>
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
        <span className="moi-tag is-sticker">{wornName}</span>
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
    </>
  );

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
          <p className="moi-kicker">Ta collection</p>
          <h2 className="moi-collection-title">
            {unlockedCount} Flambés sur {AVATARS.length}
          </h2>
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
        {/* Les trois architectures partagent le contenu arrêté avec le propriétaire et
            toutes les règles : aucun chiffre de progression, aucune comparaison, le rang cité
            uniquement sur une tête verrouillée, et chaque réglage manipulable sur place.
            Elles ne diffèrent que par la façon dont l'identité et les deux réglages qui
            définissent la relation sont mis en scène. */}

        {/* ---- A · LE POSTER — le personnage dans un éclat, le prénom sur la couleur.
             Emprunté à l'écran de série au pingouin et à l'app de quiz bleue. ---- */}
        {skin === "poster" && (
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
            {nameBlock}
            {tagsBlock}
          </motion.header>
        )}

        {/* ---- B · LE PASS — l'objet construit pendant l'onboarding, devenu la page.
             Chaque ligne porte sa valeur en étiquette et s'ouvre sur place. ---- */}
        {skin === "pass" && (
          <motion.header className="moi-top is-pass" variants={staggerItem}>
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
              className="moi-pass-head"
              onClick={() => {
                tap();
                setCollectionOpen(true);
              }}
              aria-label={`${wornName} — changer de tête`}
            >
              <AvatarGlyph id={state.user.avatar} rankId={rank.id} size={96} />
              <span className="moi-portrait-edit" aria-hidden="true">
                <Pencil size={14} />
              </span>
            </button>
            <div className="moi-pass">
              <div className="moi-pass-k">
                <span>Ton pass Braise</span>
                <b>
                  {unlockedCount}/{AVATARS.length}
                </b>
              </div>
              <div className="moi-pass-row">
                <dt>ton prénom</dt>
                {editingName ? (
                  nameBlock
                ) : (
                  <button
                    type="button"
                    className="moi-stick"
                    onClick={() => {
                      tap();
                      setDraftName(state.user.name);
                      setEditingName(true);
                    }}
                  >
                    {state.user.name}
                    <Pencil size={13} />
                  </button>
                )}
              </div>
              <div className="moi-pass-row">
                <dt>ta classe</dt>
                <button
                  type="button"
                  className="moi-stick"
                  aria-expanded={levelOpen}
                  onClick={() => {
                    tap();
                    setLevelOpen(!levelOpen);
                    setOpenTile(null);
                  }}
                >
                  {state.user.levelLabel}
                  <ChevronDown size={13} />
                </button>
              </div>
              {levelOpen && (
                <div className="moi-pass-body">
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
              <div className="moi-pass-row">
                <dt>il te parle</dt>
                <button
                  type="button"
                  className="moi-stick"
                  aria-expanded={openTile === "ton"}
                  onClick={() => {
                    tap();
                    setOpenTile(openTile === "ton" ? null : "ton");
                    setLevelOpen(false);
                  }}
                >
                  {personaTitle}
                  <ChevronDown size={13} />
                </button>
              </div>
              {openTile === "ton" && <div className="moi-pass-body">{tonSeg}</div>}
              <div className="moi-pass-row">
                <dt>ton rythme</dt>
                <button
                  type="button"
                  className="moi-stick"
                  aria-expanded={openTile === "rythme"}
                  onClick={() => {
                    tap();
                    setOpenTile(openTile === "rythme" ? null : "rythme");
                    setLevelOpen(false);
                  }}
                >
                  {GOALS[goalIndex]?.title}
                  <ChevronDown size={13} />
                </button>
              </div>
              {openTile === "rythme" && (
                <div className="moi-pass-body">
                  {rythmeSeg}
                  <p className="moi-level-note is-dark">Objectif {goalTargetXp} XP par jour.</p>
                </div>
              )}
              <div className="moi-pass-row is-last">
                <dt>ta tête</dt>
                <button
                  type="button"
                  className="moi-stick is-sticker"
                  onClick={() => {
                    tap();
                    setCollectionOpen(true);
                  }}
                >
                  {wornName}
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </motion.header>
        )}

        {/* ---- C · LE TABLEAU — en-tête compact, puis un bloc coloré qui groupe les deux
             réglages de la relation en tuiles. Emprunté à la carte « Track your streak »
             et à la rangée de tuiles de l'app de quiz. ---- */}
        {skin === "tableau" && (
          <motion.header className="moi-compact" variants={staggerItem}>
            <button
              type="button"
              className="moi-compact-head"
              onClick={() => {
                tap();
                setCollectionOpen(true);
              }}
              aria-label={`${wornName} — changer de tête`}
            >
              <AvatarGlyph id={state.user.avatar} rankId={rank.id} size={52} />
              <span className="moi-portrait-edit" aria-hidden="true">
                <Pencil size={12} />
              </span>
            </button>
            <div className="moi-compact-main">
              {nameBlock}
              {tagsBlock}
            </div>
            <button
              type="button"
              className="moi-gear is-static"
              onClick={() => {
                tap();
                setView("settings");
              }}
              aria-label="Paramètres"
            >
              <Settings size={19} />
            </button>
          </motion.header>
        )}

        <div className={`moi-sheet ${skin !== "poster" ? "is-flat" : ""}`}>
          {skin !== "pass" && (
            <motion.button
              type="button"
              className="moi-collection-link"
              variants={staggerItem}
              onClick={() => {
                tap();
                setCollectionOpen(true);
              }}
            >
              <b>
                {unlockedCount} Flambés sur {AVATARS.length}
              </b>
              <ChevronRight size={17} />
            </motion.button>
          )}

          {skin === "poster" && (
            <>
              <motion.h2 className="moi-section" variants={staggerItem}>
                <span>Braise avec toi</span>
              </motion.h2>
              <motion.div className="moi-tiles" variants={staggerItem}>
                <div className={`moi-tile ${openTile === "ton" ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="moi-tile-head"
                    aria-expanded={openTile === "ton"}
                    onClick={() => {
                      tap();
                      setOpenTile(openTile === "ton" ? null : "ton");
                    }}
                  >
                    <span className="moi-tile-k">Il te parle</span>
                    <span className="moi-tile-v">{personaTitle}</span>
                    <span className="moi-tile-d">{personaDesc}</span>
                    <span className="moi-tile-chev" aria-hidden="true">
                      <ChevronDown size={20} />
                    </span>
                  </button>
                  {openTile === "ton" && <div className="moi-tile-body">{tonSeg}</div>}
                </div>
                <div className={`moi-tile ${openTile === "rythme" ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="moi-tile-head"
                    aria-expanded={openTile === "rythme"}
                    onClick={() => {
                      tap();
                      setOpenTile(openTile === "rythme" ? null : "rythme");
                    }}
                  >
                    <span className="moi-tile-k">Tu viens le voir</span>
                    <span className="moi-tile-v">{GOALS[goalIndex]?.title}</span>
                    <span className="moi-tile-d">Objectif {goalTargetXp} XP par jour.</span>
                    <span className="moi-tile-chev" aria-hidden="true">
                      <ChevronDown size={20} />
                    </span>
                  </button>
                  {openTile === "rythme" && <div className="moi-tile-body">{rythmeSeg}</div>}
                </div>
              </motion.div>
            </>
          )}

          {skin === "tableau" && (
            <motion.div className="moi-group" variants={staggerItem}>
              <p className="moi-group-k">Braise avec toi</p>
              <div className="moi-duo">
                <button
                  type="button"
                  className={`moi-duo-tile ${openTile === "ton" ? "is-open" : ""}`}
                  aria-expanded={openTile === "ton"}
                  onClick={() => {
                    tap();
                    setOpenTile(openTile === "ton" ? null : "ton");
                  }}
                >
                  <span className="moi-tile-k">Il te parle</span>
                  <span className="moi-tile-v">{personaTitle}</span>
                </button>
                <button
                  type="button"
                  className={`moi-duo-tile ${openTile === "rythme" ? "is-open" : ""}`}
                  aria-expanded={openTile === "rythme"}
                  onClick={() => {
                    tap();
                    setOpenTile(openTile === "rythme" ? null : "rythme");
                  }}
                >
                  <span className="moi-tile-k">Tu viens le voir</span>
                  <span className="moi-tile-v">{GOALS[goalIndex]?.title}</span>
                </button>
              </div>
              {openTile === "ton" && (
                <div className="moi-group-body">
                  <p className="moi-tile-d">{personaDesc}</p>
                  {tonSeg}
                </div>
              )}
              {openTile === "rythme" && (
                <div className="moi-group-body">
                  <p className="moi-tile-d">Objectif {goalTargetXp} XP par jour.</p>
                  {rythmeSeg}
                </div>
              )}
            </motion.div>
          )}

          {/* La strate machine, identique dans les trois : volontairement plus calme, ces
              réglages se font une fois et s'oublient. */}
          <motion.p className="moi-strata" variants={staggerItem}>
            Les réglages
          </motion.p>
          <motion.div className="moi-card" variants={staggerItem}>
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
          </motion.div>

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
