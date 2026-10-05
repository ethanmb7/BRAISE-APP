# Les fiches de contenu, telles qu'elles sont livrées

Ce dossier garde les fiches **telles qu'elles ont été fournies** (modèle :
`src/content/courses/BRIEF_TEMPLATE.md`). Il n'est pas embarqué dans l'application : c'est la
trace de la source, pour retrouver d'où vient un texte ou refaire une conversion.

```
content-briefs/
  M2-ARI/                    un dossier par chapitre (l'identifiant du chapitre)
    00-chapitre.md           la fiche chapitre : source, exigences du BO, conceptions, plan
    D01.md                   une fiche par Déclic (cartes + validation + résumé + deck)
    D02.md
    corrections.md           les corrections demandées après test, datées
```

## Livrer un chapitre en trois temps

**1. Le plan, d'abord.** `00-chapitre.md` seul : source officielle, **toutes** les exigences du BO,
les conceptions erronées, et la liste des Déclics avec ce que chacun couvre. Je renvoie un contrôle
avant que quiconque écrive une carte :
- chaque exigence du BO est couverte par au moins un Déclic (et laquelle ne l'est pas) ;
- chaque Déclic ne porte bien qu'une idée (trop d'objectifs = à couper en deux) ;
- l'ordre respecte les prérequis (un Déclic n'en suppose pas un qui vient après) ;
- chaque conception erronée a un Déclic où elle peut apparaître comme mauvaise réponse.

**2. Les Déclics, par lots de 3 à 5.** Une fiche par Déclic (`D01.md`, `D02.md`…), avec son deck.
Je les intègre, je lance les contrôles, je pousse, je dis ce que j'ai dû compléter ou signaler.

**3. Le reste du chapitre.** Le deck complet (~30 cartes), la fiche bilan, l'entraînement par
paliers A à D, avec le même principe de fiches.

Pour livrer : déposer les fichiers ici et écrire « chapitre M2-ARI prêt » (ou « D03 à D05 prêts »),
ou coller le texte dans la conversation, plusieurs fiches séparées par une ligne `=====` : je les
enregistre ici.

## Identifiants : ne jamais les changer après livraison

La progression de chaque élève est enregistrée **par identifiant** (carte, étape, carte de
révision). Renommer ou renuméroter après coup fait perdre leur avancement aux élèves qui l'ont déjà.
Donc :
- on garde l'identifiant d'une carte que l'on réécrit ;
- une carte nouvelle prend un **nouvel** identifiant (on n'en réutilise jamais un) ;
- une carte supprimée n'est jamais remplacée par une autre sous le même identifiant.

Convention de nommage : `<matière><niveau>-<chapitre sur 3 lettres>`, puis `-D<nn>` pour un Déclic,
`-C<nn>` pour une carte, `-REV-<nn>` pour une carte de révision. Exemple : `M2-ARI-D01-C08`
(M = mathématiques, 2 = Seconde). Matières : M, F (français), H (histoire-géo), S (SVT),
P (physique-chimie), A (anglais). Niveaux : 2, 1, T.

## Corrections après test

Après avoir joué un Déclic, envoyer les corrections **par identifiant de carte**, une par ligne :

```
M2-ARI-D01-C08, feedback B : « nouveau texte … »
M2-ARI-D01-C14, étape 3, feedback ℤ : « nouveau texte … »
M2-ARI-D01-REV-04, correction : « 4,2 ∉ ℤ »
M2-ARI-D01-C11, texte Braise : « … »
```

Je modifie la donnée, je passe `version` du Déclic de `1.0` à `1.1` (ou `2.0` si le sens change), et
je consigne la correction dans `corrections.md`. Les élèves gardent leur progression : seul le texte
change.
