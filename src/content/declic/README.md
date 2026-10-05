# Écrire une notion pour Le Déclic

Un fichier `.txt` par notion, dans ce dossier. Pas besoin de savoir coder — juste respecter la
structure ci-dessous. Une ligne vide sépare chaque carte.

## Le format d'une notion, en bref

- **8 à 12 cartes**, jamais plus. Chaque carte tient sur un écran, un seul tap (ou une phrase
  courte pour la reformulation) suffit pour avancer.
- **1 à 3 minutes** pour tout le parcours. Si en l'écrivant vous dépassez ça, la notion est trop
  grosse — découpez-la en deux fichiers plutôt que d'allonger celui-ci.
- **Une idée par carte.** Jamais un pavé de texte, jamais deux questions sur le même écran.
- Le nom scolaire, la définition ou la formule n'apparaissent **qu'après** que l'élève a déjà
  compris le principe à travers une situation et un choix — jamais avant.

## Avant d'écrire, répondez à ces questions

Ça évite d'écrire une carte CHOIX qui ressemble à un quiz déguisé plutôt qu'à une vraie
progression.

- **Objectif** — qu'est-ce que l'élève doit réellement comprendre à la fin, en une phrase ?
- **Erreur fréquente** — quelle confusion classique font les lycéens sur cette notion ? C'est
  l'option fausse de votre carte CHOIX, pas une distraction inventée au hasard.
- **Situation d'entrée** — quel exemple concret fait naître la question naturellement, sans dire
  le nom de la notion ? C'est votre première carte SITUATION.
- **Validation** — quelle situation NOUVELLE (différente de la première) prouve que l'élève sait
  réutiliser l'idée, pas juste répéter la définition qu'on vient de lui donner ? C'est le "à toi".

## Squelette

```
NOTION: m1
CARTE_REVISION: fc2
ACCROCHE: Deux pizzas coupées différemment… et pourtant t'as mangé pareil ?

SITUATION
Braise plante le décor en une phrase.

CHOIX
La question posée à l'élève, avant toute explication.
- Une mauvaise réponse => Ce que Braise répond, sans jamais dire juste "faux".
~ Une explication vraiment différente, montrée seulement si l'élève dit ne pas avoir compris.
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

## Donner une voix Savage à un texte (facultatif)

L'élève choisit son Braise : **Chill** (doux, rassurant) ou **Savage** (direct, second degré, piques
amicales). Le texte écrit tel quel dans le fichier sert pour les deux. Pour qu'un passage sonne
différemment en Savage, ajoutez juste en dessous une ligne `@savage` :

```
SITUATION
Imagine une pizza coupée en 2 parts égales. Tu manges 1 part.
@savage Une pizza, 2 parts, t'en manges 1. Rien de compliqué (pour l'instant).

CHOIX
Combien de parts pour manger pareil sur une pizza coupée en 4 ?
- 1 part => Pas tout à fait : sur 4 parts, 1 seule c'est moins que sur 2.
@savage Une seule part sur 4 ? Elle est deux fois plus petite que ta moitié.
~ Une explication vraiment différente, montrée si l'élève ne comprend pas.
- [correct] 2 parts => Exactement !

DECLIC
Voilà. Maintenant t'as capté les fractions équivalentes.
@savage Fractions équivalentes : captées. Les pizzas te remercient.
```

- Une ligne `@savage` (ou `@chill`, pour réécrire la version douce) se met **juste sous** le texte
  qu'elle remplace : une SITUATION, la question d'un CHOIX, la réaction d'une option (avant ou
  après son `~`), une REVELATION, une REFORMULATION, le DECLIC. Pas de ligne vide entre les deux.
- **Seule la voix de Braise change.** Les explications (`~`), le titre de la REVELATION et la FICHE
  restent un seul texte : un fait ne change pas avec l'humeur. Une réaction Savage chambre la
  situation, jamais l'élève ni son erreur.
- Aucune obligation de tout traduire : un passage sans ligne `@savage` garde son texte pour les
  deux tons. Seule exigence : **le DECLIC final doit avoir sa ligne `@savage`**, pour que le ton se
  sente dans chaque chapitre (vérifié par les tests).
- `m1.txt` est l'exemple complet.

## Règles

- **`NOTION: <id>`** doit être la toute première ligne (l'identifiant du chapitre — demandez-le
  si vous ne le connaissez pas).
- **`CARTE_REVISION: <id>`** est optionnel mais fortement recommandé : c'est l'identifiant d'une
  carte déjà existante dans `src/data.ts` qui teste la même notion. Sans lui, le Déclic
  n'alimente jamais la révision espacée de l'élève plus tard.
- **`ACCROCHE: <question>`** est optionnel mais fortement recommandé : une question courte,
  non-scolaire, affichée à la place du nom du chapitre quand l'élève parcourt la matière (le vrai
  nom reste affiché juste en dessous, en plus petit). Pas « Chapitre 2 — Fonctions affines » mais
  « Comment prévoir ce que tu vas payer ? ». Gardez-la courte : elle s'affiche sous un petit rond,
  pas sur une pleine largeur.
- **`CHOIX`** : toujours au moins 2 options, et **exactement une** marquée `[correct]`. Chaque
  option doit avoir une réaction après `=>` — jamais un simple "faux".
- Une ligne **`~ <explication>`** juste après une option ajoute une deuxième explication,
  vraiment différente de la première (pas juste redite plus lentement). Elle n'apparaît que si
  l'élève tape "J'ai toujours pas compris" après avoir vu la réaction — ajoutez-la sur les
  options fausses les plus fréquentes, ce n'est pas obligatoire sur chacune.
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

## Avant de considérer une notion terminée

- **Pédagogie** — l'erreur ciblée dans CHOIX est-elle une vraie confusion, pas une distraction
  inventée ? Le contenu est-il exact ?
- **Rythme** — chaque carte tient-elle sur un écran, sans pavé de texte ni double question ?
- **Ton** — Braise ne dit jamais "faux" sec, ni ne force un ton "jeune" à chaque phrase. Relisez à
  voix haute : ça doit sonner comme un pote qui explique, pas comme un prof ni comme quelqu'un qui
  essaie trop.
- **Accroche** — les 5 premières secondes (la première carte SITUATION) donnent-elles vraiment
  envie de savoir la suite, sans citer le nom de la notion ?
- **Validation** — le "à toi" utilise-t-il une situation vraiment différente de la première, ou
  juste les mêmes mots reformulés ?

Si un point de cette liste échoue, la notion n'est pas terminée.

## Vérifier son fichier

```bash
npm run declic:check
```

Ce script relit tous les fichiers de ce dossier et signale, ligne par ligne, tout ce qui ne
respecte pas le format (une carte CHOIX sans bonne réponse marquée, un fichier qui ne termine
pas par FICHE, etc.).
