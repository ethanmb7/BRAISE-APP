# Les cours du programme officiel

Ce dossier contient les cours écrits selon le **standard pédagogique BRAISE** : uniquement des
données (JSON), jamais de code. Le moteur, la validation et l'écran les lisent tels quels.

## Le standard

- 1 chapitre = plusieurs micro-Déclics qui couvrent ensemble 100 % du programme officiel, puis une
  fiche bilan, puis un deck de révision d'environ 30 cartes, puis un entraînement en paliers A à D.
- Chaque contenu porte les identifiants internes du Bulletin officiel qu'il couvre.
- Un Déclic = une seule idée assimilable en quelques minutes : situation concrète → choix →
  feedback personnalisé → construction intuitive → vocabulaire/règle → piège → transfert →
  reformulation → validation sans aide → résumé.
- Une mauvaise réponse n'est jamais un simple « Faux » : le feedback comprend pourquoi l'élève a pu
  choisir cette réponse et corrige cette représentation précise. Une bonne réponse apporte aussi une
  information.
- **Compris** et **acquis** sont deux états : une notion n'est jamais acquise juste après le cours,
  seulement après des rappels différés réussis dans le deck de révision.
- Aucun classement, aucune pénalité, aucune formulation culpabilisante (jamais « échec »).

Ce qui est construit aujourd'hui : l'architecture, le Déclic `M2-ARI-D01` et son deck de 6 cartes.
Le bilan de chapitre, les decks de 30 cartes et l'entraînement par paliers restent à faire.

Pour **livrer** un nouveau cours (le format à remplir, le prompt à donner à une IA), voir
`BRIEF_TEMPLATE.md`.

## Les fichiers

```
src/content/courses/<matière>-<niveau>/<chapitre>/
  chapter.json          le chapitre : source officielle, exigences du BO, conceptions à suivre
  <ID>-D01.json         un Déclic (une carte par entrée de "cards")
  <ID>-D01-REV.json     son deck de révision (cartes Carré / Intox)
```

Le type d'un fichier se reconnaît à sa forme : un chapitre a `declicIds`, un Déclic a
`assessment`, un deck a `declicId` et `cards`. Les types complets sont dans
`src/lib/course/types.ts`.

## Ajouter un Déclic à un chapitre

1. Copier `M2-ARI-D01.json` et `M2-ARI-D01-REV.json`, les renommer (`<chapitre>-D02`).
2. Changer `id`, `order`, `title`, `version`, `deckId` et préfixer **tous** les identifiants de
   cartes, d'étapes et de cartes de révision par le nouvel `id`.
3. Écrire les cartes. Types disponibles : `choice`, `reveal`, `multi-step-choice`,
   `declic-summary`. Chaque choix porte son feedback, `correct: true` sur la réponse attendue (une
   seule), et si besoin un `misconceptionId`.
4. Dans `coverage`, indiquer quelles exigences du BO ce Déclic couvre et jusqu'où.
5. Ajouter l'identifiant du Déclic à `declicIds` dans `chapter.json` (et ses nouvelles exigences
   dans `mappings`, ses nouvelles conceptions dans `misconceptions`).
6. `npm run course:check` : il refuse un identifiant en double, un feedback réduit à un mot, une
   réponse attendue manquante, le mot « échec », un deck sans correction pour une carte Intox, etc.,
   et affiche la couverture du programme.

Le Déclic apparaît seul dans l'écran du chapitre, avec son statut et son deck.

## Ajouter un nouveau type de carte

Un nouveau type (texte libre, curseur, classement, association…) demande trois ajouts, dans
cet ordre : le type dans `types.ts`, sa transition dans `engine.ts`, son rendu dans
`components/course/CoursePlayer.tsx`. Les Déclics existants ne changent pas.

## Progression (locale à l'appareil)

Trois statuts indépendants par Déclic, pour qu'un Déclic puisse être terminé **et** à renforcer :

| Statut | Valeurs |
| --- | --- |
| `completionStatus` | `not_started` · `in_progress` · `completed` |
| `understandingStatus` | `unknown` · `understood` · `needs_reinforcement` |
| `masteryStatus` | `not_mastered` · `mastered` |

- `understood` : au moins `understoodMinScore` sur la carte de validation **et**, si la règle
  l'exige, une étape marquée `discriminating` réussie. Sinon `needs_reinforcement`.
- `mastered` : jamais attribué par le Déclic lui-même. Il vient du deck : chaque carte doit être
  réussie `requiredDeferredSuccesses` fois de suite, chaque fois **après** son échéance, et assez de
  cartes (`requiredCardRatio`) doivent y être arrivées. Une erreur remet le compteur de la carte à zéro.
- Tout est enregistré sous la clé `sapie_course_progress` (reprise à la dernière carte, réponses,
  score, état du deck avec le calendrier SM-2). Rien n'est envoyé nulle part, et la sauvegarde par
  code de Réglages l'emporte avec le reste.
