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

DECLIC
La phrase finale de Braise, au moment de la récompense.
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
- Le fichier doit toujours se terminer par une carte **`DECLIC`**, et contenir au moins une
  carte **`REFORMULATION`** avant elle.
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
pas par DECLIC, etc.).
