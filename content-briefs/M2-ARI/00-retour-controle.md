# M2-ARI — Retour de contrôle du plan `00-chapitre.md`

Contrôle fait le 2026-10-05, avec le dépôt sous les yeux et l'annexe officielle lue (page 7 du PDF
de 13 pages, rubrique « Arithmétique », texte extrait et relu). À transmettre à l'auteur du plan
avec `BRIEF_TEMPLATE.md`, `types.ts` et `M2-ARI-D01.json` (le plan dit ne pas les avoir eus).

## 1. Verdict

- **Couverture du programme officiel : complète.** Les 8 items de la rubrique sont tous traités et
  découpés en 12 exigences, sans trou ni ajout hors programme.
- **Unicité, ordre, erreurs suivies : bons**, avec 4 points à corriger (section 3).
- **Le plan suppose des fonctions que le moteur n'a pas** : variantes par carte, correction après
  les trois étapes, historique des essais, une dizaine de visuels (ramenables à cinq rendus),
  cartes de preuve à trous. Elles
  sont à construire **avant** de rédiger les lots (section 5), et 5 choix sont à trancher
  (section 6).

## 2. Contrôle contre l'annexe officielle

| Annexe officielle (rubrique Arithmétique) | Exigences du plan | Déclics |
| --- | --- | --- |
| Contenus — « Notations ℕ et ℤ » | BO-01 | D01 |
| Contenus — « Définition des notions de multiple, de diviseur, de nombre pair, de nombre impair : a est multiple de b s'il existe un entier k tel que a = kb » | BO-02, BO-03, BO-04, BO-05 | D02, D03 |
| Capacités — « Modéliser et résoudre des problèmes mobilisant les notions de multiple, de diviseur, de nombre pair, de nombre impair » | BO-06, BO-07 | D03, D04, D05 |
| Capacités — « Présenter les fractions sous forme irréductible » | BO-08 | D06, D07 |
| Démonstrations — « Pour une valeur numérique de a, la somme de deux multiples de a est multiple de a » | BO-09 | D08 |
| Démonstrations — « Le carré d'un nombre impair est impair » | BO-10 | D09 |
| Exemples d'algorithme — « Déterminer si un entier naturel a est multiple d'un entier naturel b » | BO-11 | D10 |
| Exemples d'algorithme — « … le plus grand multiple de a inférieur ou égal à b » | BO-12 | D05 |

Vérifié aussi : les nombres premiers ne figurent plus dans la rubrique (le plan a raison) ; ℝ, 𝔻, ℚ
et les intervalles sont bien dans la rubrique voisine « Nombres réels ».

Deux nuances, à garder explicites dans les fiches :
- Le programme parle d'un **entier naturel b** pour l'algorithme de multiple, donc b = 0 est permis.
  Le plan l'exclut (diviseur non nul) : choix défendable, mais c'est un **rétrécissement délibéré**
  à écrire comme tel.
- La notion de valeur absolue relève de la rubrique « Nombres réels » (voir le point 1 de la
  section 3).

## 3. Points à corriger dans le plan

1. **D07 emploie la valeur absolue** (« la valeur absolue du numérateur si celui-ci est négatif »).
   Le programme dit de la valeur absolue : « Toute autre utilisation est hors programme » que
   désigner la distance, et sa notion figure dans la rubrique suivante, « Nombres réels », pas dans
   celle-ci. À reformuler (« on ignore le
   signe pour chercher les diviseurs communs ») ou à écarter : numérateurs positifs dans le cœur du
   Déclic, négatifs en cartes de deck.
2. **D07 en fait trop** : poursuivre la simplification, irréductible vs simplifiée, numérateur
   négatif, 0/1. Garder les deux premiers ; renvoyer le négatif et zéro vers le deck.
3. **D09 suppose le calcul littéral** ((2k + 1)² développé) que ni D01 à D08 ni l'application ne
   couvrent. Soit une carte de rappel autonome du développement (cycle 4), soit le visuel de la grille
   décomposée portant seul le calcul. Ne pas renvoyer à une « ressource d'algèbre » qui n'existe
   pas dans l'app.
4. **Chevauchement D03 / D05 / D10** : D03 emploie le « reste de un » avant que D05 et D10 ne
   réactivent la division avec reste. Dire explicitement que D03 le traite en intuition (paires et
   un isolé), sans vocabulaire de division.

Vérifiés, sans remarque : une idée par Déclic pour D01, D02, D04, D05, D06, D08, D10 ; dépendances
sans cycle (D07 ← D04, D06 ; D03 ← D02 ; D09 ← D03) ; vingt-six conceptions, chacune avec au moins
un Déclic de rencontre.

## 4. Identifiants

### 4a. Exigences du BO : le dépôt a déjà son schéma

Le dépôt utilise `BO26-M2-ARI-CONT-01`, pas `M2-ARI-BO-01`. Les identifiants d'exigences ne sont
pas enregistrés dans la progression des élèves ; le choix est donc libre, mais il faut **un seul
schéma**. Proposition : garder celui du dépôt.

| Plan | Dépôt (existant ou proposé) |
| --- | --- |
| M2-ARI-BO-01 | `BO26-M2-ARI-CONT-01` (existe) |
| M2-ARI-BO-02, 03, 04, 05 | `BO26-M2-ARI-CONT-02` à `-05` |
| M2-ARI-BO-06, 07, 08 | `BO26-M2-ARI-CAP-01`, `-02`, `-03` |
| M2-ARI-BO-09, 10 | `BO26-M2-ARI-DEM-01`, `-02` |
| M2-ARI-BO-11, 12 | `BO26-M2-ARI-ALG-01`, `-02` |

Le chapitre garde aussi ses trois exigences transversales déjà tracées par D01 et pratiquées par
lui : `BO26-M2-VEL-APP-01` (appartenance, ∈), `BO26-M2-VEL-INC-01` (inclusion, ⊂),
`BO26-M2-VEL-NUMSET-01` (notation des ensembles de nombres). Elles viennent de la section
« Vocabulaire ensembliste et logique » de l'annexe (page 4), que le plan ne reprend pas. À ajouter si
D08 ou D09 pratiquent explicitement le contre-exemple : une exigence `BO26-M2-VEL-CEX-01`.

### 4b. Conceptions erronées : il y en a déjà 7 en base, utilisées par D01

Ces identifiants sont comptés dans la progression locale des élèves : **ne pas les renommer**.

| Existant (dépôt) | Équivalent dans le plan |
| --- | --- |
| `n_starts_at_1` | `excludes_zero_from_naturals` |
| `positive_means_natural` | `believes_positive_numbers_are_naturals` |
| `z_only_negatives` | `believes_integers_are_only_negative` |
| `membership_vs_inclusion` | `confuses_element_set_symbols` (+ `reverses_membership_direction` pour le sens inversé) |
| `single_set_only` | absent du plan : à ajouter (un nombre dans un seul ensemble) |
| `negative_in_n` | absent du plan : à ajouter (un négatif dans ℕ) |
| `positive_decimal_in_z` | absent du plan : à ajouter (un décimal positif dans ℤ) |

Les 19 autres identifiants du plan (D02 à D10, plus `believes_decimal_notation_excludes_integer`) sont
neufs : bons à prendre tels quels.

### 4c. Ce qui existe déjà, à conserver tel quel

- Chapitre `M2-ARI` ; Déclic `M2-ARI-D01`, version 1.0, 15 cartes.
- Cartes `M2-ARI-D01-C01` à `M2-ARI-D01-C15` (types : choice ×11, reveal ×2, multi-step-choice ×1,
  declic-summary ×1).
- Étapes de validation `M2-ARI-D01-C14-S1`, `-S2`, `-S3` ; entrées de menu du résumé `n-z`,
  `in-sub`, `decimals`.
- Deck `M2-ARI-D01-REV` : `M2-ARI-D01-REV-01` à `-06` (concepts `Z_membership`, `N_zero`,
  `inclusion_N_Z`, `integer_vs_positive`, `membership_vs_inclusion`, `N_vs_Z`).

**Réécrire D01 est possible, mais** : le D01 du plan (« Un nombre, quelle famille ? ») a une autre
entrée, ajoute la droite graduée et « 4,0 vaut 4 », et met ∈ et ⊂ au second plan, alors que le D01
actuel les enseigne. Chaque carte garde son identifiant ; son contenu peut changer ; la version passe
à `2.0`. Des élèves qui ont déjà joué gardent leur statut mais rejouent le nouveau texte.

## 5. Ce que le plan demande et que le moteur ne fait pas encore

| Demande du plan | État | À construire | Bloque |
| --- | --- | --- | --- |
| ≥ 2 variantes complètes par carte `choice` et par validation | absent : une carte = une question | variantes par carte et par étape, choix de la variante à chaque essai, mémorisation de la variante jouée, contrôles du validateur | lot 1 |
| Trois réponses recueillies avant d'afficher les corrections | le moteur corrige **après chaque étape** (c'est ce que le D01 actuel fait) | option `feedbackTiming` sur la validation | lot 1 |
| Retour ciblé vers l'exemple concerné, puis nouvel essai | le rattrapage actuel = deux cartes de deck ; rejouer des cartes n'existe que depuis le résumé | remédiation par étape, ré-essai avec une autre variante | lot 1 |
| Un nouvel essai enregistré séparément ; un essai recyclé = entraînement | on garde seulement le dernier résultat | historique des essais dans la progression | lot 1 |
| Visuels : droite graduée, groupes et restes, paires, barre partagée, carré décomposé, schéma entrée/quotient-reste, ensembles imbriqués | seul `nested-boxes` existe | un rendu par type de visuel, décrit en données (voir le détail ci-dessous) | lots 1, 2, 3 |
| Preuve ou phrase « à compléter par sélection » ; fragment de code | absent | nouveau type de carte (trous à réponses par boutons) et bloc de code | lots 2, 3 |
| Justification modèle « pont vers le contrôle » | possible dans un résumé | rien, sauf si on veut une carte dédiée | — |
| Tons Chill et Savage pour chaque feedback | le modèle les accepte (`variants.savage`), le validateur ne l'exige pas | éventuel contrôle « tout feedback a sa version Savage » | — |
| Deck d'environ 30 cartes, partagé entre Déclics | chaque Déclic a **son** deck (D01 : 6 cartes) ; le plan en prévoit 3 | choisir : decks par Déclic, ou deck de chapitre | lot 1 |
| Bilan de chapitre, entraînement A à D | absents | à concevoir après les lots | clôture |

Visuels nécessaires par Déclic : D01 droite graduée ; D02 groupes complets + restes ; D03 paires +
un isolé ; D04 deux rangées regroupées ; D05 multiples sur une droite avec borne ; D06 barre
partagée de deux façons ; D07 diviseurs qui disparaissent ; D08 packs regroupés ; D09 carré
décomposé en régions ; D10 schéma entrée → quotient/reste → décision. Je propose de les ramener à
cinq rendus paramétrables : droite graduée, groupes, barre/grille, schéma en flèches, bloc de code.

## 6. Décisions à prendre avant le lot 1

1. **Seuil de compréhension.** Le plan : 3/3 = validation réussie, moins = retour ciblé. La règle
   en place (celle de ton brief initial) : compris dès 2/3 avec une étape discriminante réussie.
2. **Moment de la correction** : après chaque étape (actuel) ou après les trois (plan).
3. **Variantes** : sur toutes les cartes (plan) ou seulement sur la validation et les cartes de
   transfert, là où elles servent aux ré-essais.
4. **Durée cible** : 150 à 210 s (D01 actuel) ou 4 à 7 minutes (plan).
5. **Decks** : un par Déclic ou un pour le chapitre.

## 7. Décisions prises et état du moteur (2026-10-05)

Décisions de l'équipe produit sur les points de la section 6 :

1. **Seuil de compréhension** : 2 sur 3 avec une étape discriminante réussie (règle en place). Sous le
   seuil, retour à l'exemple concerné puis nouvel essai avec une autre variante.
2. **Moment de la correction** : après les trois étapes (`feedbackTiming: "after-all"`).
3. **Variantes** : sur la validation et sur les cartes de transfert seulement. Les cartes qui
   construisent l'idée n'en ont pas.
4. **Durée cible** : laissée à chaque Déclic (`targetDurationSec`), pas de règle de chapitre.
5. **Decks** : un deck par Déclic. Le chapitre fera donc environ 33 cartes de révision au total
   (D01 en garde 6, les neuf autres Déclics en apportent 3 chacun).

Ce que le moteur sait faire maintenant (section 5) :

| Demande du plan | État |
| --- | --- |
| Variantes complètes par validation et par carte de transfert | **fait** : `variants`, version choisie à tour de rôle, version jouée enregistrée avec la réponse, contrôles du validateur |
| Trois réponses recueillies avant d'afficher les corrections | **fait** : `feedbackTiming: "after-all"` |
| Retour ciblé vers l'exemple concerné, puis nouvel essai | **fait** : `remediation` par étape, « Revoir l'exemple, puis réessayer », variante suivante |
| Un nouvel essai enregistré à part ; un essai recyclé = entraînement | **fait** : `attempts` (`evidence` / `practice`) |
| Droite graduée, groupes et restes, paires + un isolé, ensembles imbriqués | **fait** : `number-line`, `groups` (paires = taille 2), `nested-boxes` |
| Barre partagée, carré décomposé, schéma entrée → quotient/reste, diviseurs qui disparaissent, packs | **à faire avec le lot qui en a besoin** (lots 2 et 3) |
| Preuve ou phrase « à compléter par sélection » ; fragment de code | **à faire avec le lot qui en a besoin** (D08 à D10) |
| Tons Chill et Savage dans chaque feedback | accepté par le modèle, non exigé par le validateur |
| Bilan de chapitre, entraînement A à D | à concevoir après les lots |

Ce que l'auteur du plan doit savoir pour écrire le lot 1 (D01 à D03) : une validation = trois étapes ×
au moins trois versions (la première et deux variantes), une étape discriminante par version, des
corrections écrites pour être lues **après** les trois réponses (un feedback ne doit donc pas
dépendre de la réponse à l'étape précédente), un message « à renforcer » compatible avec le retour à
l'exemple, et, pour chaque étape, les cartes du Déclic à rejouer en cas d'erreur. Le format exact est
dans `src/content/courses/BRIEF_TEMPLATE.md`.
