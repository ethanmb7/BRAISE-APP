# Fiche de contenu : le modèle à remplir pour un nouveau Déclic

C'est la forme dans laquelle livrer un cours : texte brut, lisible par un humain, assez régulier
pour que je (ou un script) le transforme en données sans rien deviner. Une fiche = un Déclic et son
deck de révision. La fiche **chapitre** est à fournir **une seule fois**, avant les Déclics.

Règles de remplissage :

- Tout ce qui est entre `<…>` est à remplacer. Rien n'est facultatif sauf ce qui est marqué
  « (facultatif) ».
- Chaque question a **exactement une** réponse attendue, et **chaque choix a son feedback**.
- Pas de feedback réduit à un mot (« Faux », « Bravo ») : il explique pourquoi on a pu choisir cette
  réponse et corrige cette idée précise.
- Les identifiants se préfixent toujours par l'ID du Déclic : `M2-ARI-D01-C01`, `M2-ARI-D01-REV-01`.
- Les symboles s'écrivent en Unicode normal (ℕ ℤ ∈ ∉ ⊂ –3), sans balises.
- Les sauts de ligne dans un texte de Braise sont conservés tels quels.

---

## A. Fiche chapitre (une fois par chapitre)

```
CHAPITRE
ID: <M2-ARI>
Matière: <Mathématiques>
Niveau: <Seconde générale et technologique>
Titre: <Arithmétique>

SOURCE
Autorité: <Ministère de l’Éducation nationale>
Programme: <Mathématiques, Seconde générale et technologique>
Année d’application: <2026-2027>
Bulletin officiel: <BO n°14 du 2 avril 2026>
NOR: <MENE2602914A>
Chemin: <Programme de mathématiques → Nombres et calculs, algèbre → Arithmétique → Contenus → …>

EXIGENCES DU BO (toutes celles que le chapitre doit couvrir)
- <BO26-M2-ARI-CONT-01> | <Notations ℕ et ℤ> | direct
- <BO26-M2-VEL-APP-01> | <notions d’élément d’un ensemble et d’appartenance ; symbole ∈> | transversal

CONCEPTIONS ERRONÉES À SUIVRE (un identifiant court + une phrase)
- <n_starts_at_1> | <croire que ℕ commence obligatoirement à 1>

PLAN DU CHAPITRE (les Déclics, dans l'ordre, et ce que chacun couvre)
- <M2-ARI-D01> | <Tous les nombres ne vivent pas dans la même boîte> | couvre : <BO26-M2-ARI-CONT-01 (full), BO26-M2-VEL-APP-01 (introduced_and_practised)>
- <M2-ARI-D02> | <titre> | couvre : <…>
```

Valeurs de couverture : `full` · `introduced` · `introduced_and_practised`.

---

## B. Fiche Déclic

### B1. Identité

```
DÉCLIC
ID: <M2-ARI-D01>
Chapitre: <M2-ARI>
Numéro: <01>
Titre: <Tous les nombres ne vivent pas dans la même boîte>
Version: <1.0>
Durée cible: <150 à 210 secondes>
Difficulté: <niveau 1 · introduction>
Objectif élève: <« Je sais reconnaître … et utiliser … sans les confondre. »>
Prérequis: <reconnaître un nombre entier> ; <lire un nombre décimal>
Objectifs détaillés:
- <identifier les entiers naturels>
- <…>
Conceptions suivies par ce Déclic: <n_starts_at_1, z_only_negatives, …>
Couvre: <BO26-M2-ARI-CONT-01 (full)>, <BO26-M2-VEL-APP-01 (introduced_and_practised)>
```

### B2. Cartes (dans l'ordre, jusqu'au résumé final)

Quatre types de carte. Copier le bloc voulu autant de fois que nécessaire.

**Question à choix** (`choice`) : Braise pose une situation, l'élève choisit.

```
CARTE <M2-ARI-D01-C01>
Type: choice
Rôle: <ce que cette carte fait faire à l'élève, en une phrase (jamais montré)>
Texte Braise:
« <… plusieurs lignes possibles …> »
Choix:
A — « <libellé> »
B — « <libellé> »
C — « <libellé> »
Feedback A:
« <explique pourquoi A a pu être choisi et corrige cette idée> »
Feedback B:
« <…> »
Feedback C:
« <…> »
Réponse attendue: <C>
Conception visée: A → <single_set_only> ; B → <…>   (facultatif, seulement pour les mauvaises réponses)
Bouton après feedback: « <Continuer> »   (facultatif)
Note: <« ne pas afficher les autres choix comme mauvais »>   (facultatif : question d'accroche non notée)
```

**Révélation** (`reveal`) : on nomme la notion ou la règle, une fois l'idée construite.

```
CARTE <M2-ARI-D01-C03>
Type: reveal
Rôle: <…>
Texte:
« <… le nom, la notation, la règle …> »
Bouton: « <OK, mais –3 alors ?> »
```

**Validation en plusieurs étapes** (`multi-step-choice`) : plusieurs petits items d'affilée, un score.
Il faut **une seule** carte de ce type par Déclic : c'est elle qui décide « compris » ou « à renforcer ».

```
CARTE <M2-ARI-D01-C14>
Type: multi-step-choice
Rôle: <validation finale sans aide>
Texte:
« <consigne> »
ÉTAPE 1
Élément affiché: <23>
Boutons: <ℕ> | <ℤ> | <Aucune>
Réponse attendue: <ℕ>
Discriminante: <oui>        (oui = réussir cette étape sépare vraiment les notions enseignées)
Concept testé: <inclusion_N_Z>   (un concept du deck de révision ; sert aux situations de rattrapage)
Feedback si <ℕ>: « <…> »
Feedback si <ℤ>: « <…> »
Feedback si <Aucune>: « <…> »
ÉTAPE 2
<…>
RÈGLE D'ÉVALUATION
Compris si: <score ≥ 2 sur 3> ET <au moins une étape discriminante réussie>
À renforcer sinon.
Message « compris »: « <…> »
Message « à renforcer »: « <🔥 T’as l’idée générale, mais … Je te remets deux situations rapides et on verrouille ça.> »
Situations de rattrapage proposées: <2>
```

**Résumé du Déclic** (`declic-summary`) : toujours la **dernière** carte.

```
CARTE <M2-ARI-D01-C15>
Type: declic-summary
Texte:
« <le résumé : ce qu'il faut retenir, la notation, le piège de contrôle> »
Boutons: « <J’ai capté 🔥> » (termine le Déclic) | « <Revoir le point qui me piège> » (ouvre le menu)
Menu « Revoir »:
- « <ℕ / ℤ> » → rejouer les cartes <C03> à <C06>
- « <∈ / ⊂> » → rejouer les cartes <C08> à <C09>
```

Une question visuelle (ex. des boîtes dans des boîtes) se décrit en une ligne par choix :
`A — [ ℕ ] [ ℤ ] (deux boîtes séparées)` · `B — [ ℤ [ ℕ ] ] (ℕ dans ℤ)` · `C — [ ℕ [ ℤ ] ]`.
Ajouter une phrase qui décrit l'image pour un lecteur d'écran.

### B3. Deck de révision (Carré / Intox)

```
DECK <M2-ARI-D01-REV>
Titre: <Révision : ℕ, ℤ, ∈ et ⊂>

REV-01
Affirmation: « <–7 appartient à ℤ.> »
Réponse: <Carré>            (Carré = c'est vrai · Intox = c'est faux)
Concept: <Z_membership>
Difficulté: <1>             (1, 2 ou 3)
Tags: <Z, appartenance, entiers-negatifs>
Feedback correct: « <…> »
Feedback incorrect: « <…> »
Correction: « <0 ∈ ℕ> »     (obligatoire si la réponse est Intox : la version vraie de l'affirmation)
Conception visée: <n_starts_at_1>   (facultatif)
```

Un deck complet vise ~30 cartes, avec plusieurs cartes par concept testé.

---

## C. Ce que je fais d'une fiche

1. Je la transforme en fichiers de données (`src/content/courses/…`), sans modifier le texte.
2. Je lance `npm run course:check` : identifiants, réponses attendues, feedbacks, couverture du BO.
3. Je lance les tests, le lint et le build, puis je pousse.
4. Je te dis ce que j'ai dû compléter ou signaler (jamais en silence).

Je **ne valide pas le fond académique** : exactitude des maths, de l'histoire, de la langue… relève
de toi ou d'un enseignant. Je signale seulement ce qui me paraît faux ou ambigu, sans le corriger.

---

## D. Faire produire une fiche par une IA

À coller tel quel dans l'outil qui rédige le contenu, avec ce fichier et le Déclic d'exemple
(`maths-seconde/arithmetique/M2-ARI-D01.json` et son deck) en pièces jointes :

> Tu rédiges un Déclic pour l'application BRAISE (lycéens, « réviser comme on discute avec un
> pote »). Suis exactement le modèle `BRIEF_TEMPLATE.md`, section B, et le standard pédagogique :
> une seule idée assimilable en quelques minutes ; situation concrète → choix de l'élève →
> feedback personnalisé → construction intuitive → vocabulaire/règle → piège → transfert →
> reformulation → validation sans aide → résumé. Une mauvaise réponse n'est jamais « Faux » : le
> feedback comprend pourquoi l'élève a pu la choisir et corrige cette représentation précise. Une
> bonne réponse apporte aussi une information. Pas de classement, pas de pénalité, pas de
> formulation culpabilisante. Ton amical et léger, jamais au détriment de la précision. Chaque
> question a une seule réponse attendue ; chaque choix a son feedback ; le deck a une correction
> pour chaque carte Intox. Cite pour chaque exigence du BO le Déclic qui la couvre. Sujet : <…>.
> Exigences du BO à couvrir : <…>.

Variante si l'IA sait produire du JSON : lui donner `src/lib/course/types.ts` et le Déclic
d'exemple, et lui demander directement les fichiers JSON. `npm run course:check` dit tout de suite
ce qui ne respecte pas le standard.

