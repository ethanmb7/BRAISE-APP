# Écrire une notion pour Le Déclic

Un fichier `.txt` par notion, dans ce dossier. Pas besoin de savoir coder — juste respecter la
structure ci-dessous. Une ligne vide sépare chaque carte.

## Squelette

```
NOTION: m1
CARTE_REVISION: fc2

SITUATION
Braise plante le décor en une phrase.

CHOIX
La question posée à l'élève, avant toute explication.
- Une mauvaise réponse => Ce que Braise répond, sans jamais dire juste "faux".
- [correct] La bonne réponse => Ce que Braise répond quand c'est juste.
- Une autre mauvaise réponse => Une autre réaction.

REVELATION: 🔥 Le nom ou la règle
Le texte qui donne enfin le nom de la notion — seulement après que l'élève l'a déjà comprise
à travers les cartes CHOIX précédentes.

REFORMULATION
La consigne pour que l'élève réexplique avec ses propres mots.

SITUATION
À toi maintenant : une situation NOUVELLE, différente de celle du début, pour vérifier que
l'élève sait réutiliser l'idée — pas juste répéter la définition.

CHOIX
La question sur cette nouvelle situation.
- Une mauvaise réponse => Réaction de Braise.
- [correct] La bonne réponse => Réaction de Braise.

DECLIC
La phrase finale de Braise, au moment de la récompense.

FICHE: Le nom de la notion
RETENIR
Ce qu'il faut savoir pour le contrôle ou le bac, en une ou deux phrases.
PIEGE
Une confusion fréquente à éviter (facultatif — enlevez tout le bloc PIEGE si aucun piège net).
```

## Règles

- **`NOTION: <id>`** doit être la toute première ligne (l'identifiant du chapitre — demandez-le
  si vous ne le connaissez pas).
- **`CARTE_REVISION: <id>`** est optionnel mais fortement recommandé : c'est l'identifiant d'une
  carte déjà existante dans `src/data.ts` qui teste la même notion. Sans lui, le Déclic
  n'alimente jamais la révision espacée de l'élève plus tard.
- **`CHOIX`** : toujours au moins 2 options, et **exactement une** marquée `[correct]`. Chaque
  option doit avoir une réaction après `=>` — jamais un simple "faux".
- **`REVELATION:`** : le titre court se met sur la même ligne, après les deux points.
- Après la **`REFORMULATION`**, ajoutez toujours une nouvelle paire **`SITUATION` / `CHOIX`** —
  le "à toi" : une situation différente de celle du début, pour vérifier que l'élève sait
  réutiliser l'idée ailleurs, pas seulement redire la définition qu'on vient de lui donner.
- Le fichier doit toujours se terminer par une carte **`FICHE:`**, et contenir au moins une
  carte **`DECLIC`** et une carte **`REFORMULATION`** avant elle.
- **`FICHE: <titre>`** est le pont vers le bac — la carte que l'élève pourrait garder pour
  réviser. Elle est toujours suivie de **`RETENIR`** (obligatoire) puis, en option, de
  **`PIEGE`** (une confusion fréquente ; omettez tout le bloc s'il n'y en a pas de nette).
- Une **`VISUEL: timeline`** optionnelle peut précéder une carte SITUATION/CHOIX/REVELATION pour
  y attacher une frise chronologique :
  ```
  VISUEL: timeline
  - 1789: Prise de la Bastille
  - 1793: Exécution de Louis XVI

  REVELATION: 🔥 1789 ≠ 1793
  ...
  ```

## Vérifier son fichier

```bash
npm run declic:check
```

Ce script relit tous les fichiers de ce dossier et signale, ligne par ligne, tout ce qui ne
respecte pas le format (une carte CHOIX sans bonne réponse marquée, un fichier qui ne termine
pas par FICHE, etc.).
