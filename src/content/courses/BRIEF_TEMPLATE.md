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

### B2. Le rythme d'un Déclic : je te montre, on le fait, à toi

Un Déclic enchaîne un ou deux **cycles**, un par idée. Un cycle retire l'aide petit à petit :

1. **Je te montre** (`reveal`, temps `show`) : une situation concrète, expliquée simplement par Braise,
   avec le mot officiel à la fin (« Traduction prof : … »). Une idée, une quarantaine de mots.
2. **On le fait ensemble** (`choice`, temps `together`) : même genre de situation, l'élève fait l'étape
   clé (« 30 = 5 × … ? »), Braise conclut.
3. **À toi** (`choice`, temps `you`) : même idée sans aide, avec un feedback précis par choix.

Autour : une ou deux questions « essaie » avant la première explication quand la notion est intuitive
(sans temps, l'étiquette est « Tente »), **le piège** (`trap`) où la mauvaise idée est la tentante, un
transfert (3 versions), la validation, le résumé. Règles, contrôlées par `npm run course:check` :

- jamais deux cartes d'explication d'affilée : une explication est toujours suivie d'une question ;
- une question n'a qu'une réponse attendue, chaque choix a son feedback ;
- une image qui donne la réponse n'apparaît qu'**après** la réponse (`visualTiming: after-answer`).

```
CARTE <M2-ARI-D02-C05>
Type: choice
Temps: <on le fait ensemble>   (je te montre | on le fait ensemble | à toi | le piège ; facultatif)
```

### B2 bis. Cartes (dans l'ordre, jusqu'au résumé final)

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
Image: <voir « Les images » plus bas>   (facultatif)
Variantes: <V2, V3>   (facultatif : surtout pour les cartes de transfert, voir « Variantes » plus bas)
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
Corrections: <après les trois étapes>   (valeur à toujours mettre pour la validation : l'élève répond aux
                                         trois items, puis voit les trois corrections ; sinon « après chaque étape »)
ÉTAPE 1
Question: <72 = 8 × 9. Quelle phrase est juste ?>   (ou, à la place, un élément affiché)
Élément affiché: <23>   (facultatif si la question est donnée)
Boutons: <ℕ> | <ℤ> | <Aucune>
Réponse attendue: <ℕ>
Discriminante: <oui>        (oui = réussir cette étape sépare vraiment les notions enseignées)
Concept testé: <inclusion_N_Z>   (un concept du deck de révision ; sert aux situations de rattrapage)
Exemple à revoir si ratée: <rejouer les cartes C04 à C05>   (cartes précédentes, dans l'ordre ; voir « Nouvel essai »)
Image: <voir « Les images »>   (facultatif)
Feedback si <ℕ>: « <…> »
Feedback si <ℤ>: « <…> »
Feedback si <Aucune>: « <…> »
ÉTAPE 2
<…>
RÈGLE D'ÉVALUATION
Compris si: <score ≥ 2 sur 3> ET <au moins une étape discriminante réussie>
À renforcer sinon.
Message « compris »: « <…> »
Message « à renforcer »: « <🔥 T’as l’idée générale, mais … on revoit l’exemple et on retente.> »
Situations de rattrapage proposées: <2>
```

**Variantes de la validation** (au moins 2 en plus de la première, pour le nouvel essai) : même nombre
d'étapes, mêmes objectifs, **autres nombres et autre situation**. L'étape n°i d'une variante teste le
même objectif que l'étape n°i de la première : elle reprend son concept et son exemple à revoir, sauf
si tu en indiques d'autres. Chaque variante a sa propre étape discriminante, ses boutons, sa réponse
attendue et ses feedbacks complets.

```
VARIANTE <V2> de <M2-ARI-D01-C14>
ÉTAPE 1 <M2-ARI-D01-C14-T1>
Élément affiché: <58>
Boutons: <…>
Réponse attendue: <…>
Discriminante: <non>
Feedback si <…>: « <…> »
ÉTAPE 2 <M2-ARI-D01-C14-T2>
<…>
```

**Nouvel essai** : sous 2/3 ou sans l'étape discriminante, l'élève voit **« Revoir l'exemple, puis
réessayer »** : on rejoue sans note les cartes indiquées pour l'étape ratée (la discriminante en
priorité), puis la validation revient avec la variante suivante. Chaque essai est enregistré à part ;
un essai sur une variante déjà vue compte comme de l'entraînement et ne change aucun statut. Il n'y a
donc de nouvel essai que s'il reste une variante jamais vue : prévoir au moins 2 variantes.

**Variantes d'une carte de transfert** (facultatif, une carte `choice` de transfert) : un deuxième
énoncé complet (texte, choix, feedbacks), joué quand l'élève refait le Déclic. Les cartes qui
construisent l'idée n'ont pas besoin de variantes.

```
VARIANTE <V2> de <M2-ARI-D01-C12>
Texte Braise: « <…> »
Choix: A — « <…> » ; B — « <…> » ; C — « <…> »
Feedback A / B / C: « <…> »
Réponse attendue: <B>
Image: <…>   (facultatif ; une variante n'hérite pas de l'image de la première)
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

#### Les images

Une image se décrit en données, jamais en dessin. Elle peut accompagner une carte, une étape de
validation ou un choix. **Chaque image a une phrase pour un lecteur d'écran** (obligatoire).
Trois sont disponibles :

```
Image: boîtes imbriquées
  ariaLabel: « ℕ est dans ℤ »
  boîtes: [ ℕ ] [ ℤ [ ℕ ] ]            (les crochets imbriqués montrent qui est dans qui)

Image: droite graduée
  ariaLabel: « Droite de –5 à 6, avec –3 et 2 marqués »
  de: <–5>  à: <6>  pas: <1>           (le pas est facultatif, 1 par défaut ; 60 graduations au plus)
  points: <–3 « –3 »> ; <2 « 2 »>     (valeur et étiquette facultative)
  marques: <0>                         (graduations mises en relief : multiples, par exemple)
  borne: <4>                           (une limite en pointillés, facultative)

Image: groupes
  ariaLabel: « Treize points en groupes de quatre, il en reste un »
  total: <13>  taille d'un groupe: <4>  (40 objets au plus)
  objet: <🔥>                          (facultatif : une lettre, un emoji ; un point par défaut)

Image: groupes, partagés entre N personnes
  ariaLabel: « 24 parts de pizza entre 5 potes : 4 chacun, 4 restent sur la table »
  total: <24>  partagé entre: <5>      (N groupes égaux, puis le reste en pointillés)
```

Une image peut n'apparaître qu'après la réponse : `Apparition: après la réponse` (par défaut elle est
là dès le début de la carte).

Le reste d'une division (ici 1) est toujours dessiné à part, en pointillés : c'est le propos de
l'image. Des paires avec un seul isolé : `taille d'un groupe: 2`. Si une image manque pour un Déclic
(barre partagée, grille, schéma entrée → sortie, bloc de code, preuve à trous), le dire dans la fiche :
je l'ajoute avant d'intégrer le lot, plutôt que de contourner.

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

