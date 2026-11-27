# Le Déclic — la forme définitive

`BRIEF_TEMPLATE.md` dit **comment livrer** un Déclic. Ce document dit **ce qu'est** un Déclic : sa
forme, son contrat d'écran, son catalogue de cartes. Il existe pour qu'une centaine de Déclics ne
soient pas une centaine d'inventions.

Rien ici n'est inventé pour l'occasion. La forme a convergé toute seule : **les Déclics D03, D04,
D05, D06 et D07 ont exactement la même structure**, onze cartes dans le même ordre, écrits à des
semaines d'intervalle sans que ce soit une consigne. Ce document la nomme, dit pourquoi chaque
position est là, et la rend vérifiable par une machine.

---

## 1. Ce qu'est un Déclic

> **Une idée, une fois, en cinq à sept minutes, sans jamais se faire humilier.**

Un Déclic n'est pas un cours, ni un exercice, ni un quiz. C'est une conversation courte qui amène
une élève à **faire** quelque chose avant qu'on lui explique quoi que ce soit, puis qui retire
l'aide jusqu'à ce qu'elle le fasse seule.

Trois propriétés le définissent, et elles tiennent ensemble :

**L'élève agit avant qu'on lui dise.** La première carte est une question, jamais une définition.
Elle peut se tromper — c'est même prévu. L'explication qui suit répond à quelque chose qu'elle
vient de vivre, pas à une question qu'elle ne s'est pas posée.

**L'aide se retire, elle ne s'ajoute pas.** « On le fait ensemble » puis « à toi » : le même geste,
avec de moins en moins de soutien. À la fin, la validation se joue sans filet et sans correction
intermédiaire.

**Se tromper produit de l'information, jamais un jugement.** Chaque mauvaise réponse a été écrite
exprès, elle correspond à une conception erronée identifiée, et son feedback explique _pourquoi on
a pu la choisir_ avant de corriger. C'est la différence entre « Faux » et un pote qui dit « ah
ouais, je vois ce que t'as fait ».

### Ce qu'un Déclic ne fait jamais

Ces règles ne se discutent pas Déclic par Déclic. Elles sont le produit, pas des préférences.

| Jamais                              | Pourquoi                                                                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Comparer deux élèves                | Un classement reconstruit exactement la pression que l'app existe pour retirer. Aucun score comparatif, nulle part. Gardé par `voice-guard.test.ts`. |
| Punir une erreur                    | Pas de vies, pas de pénalité, pas de « tu as perdu ». Le mot « échec » est interdit dans les données, et le validateur le refuse.                    |
| Dire « Faux » et s'arrêter          | Un feedback fait au moins 24 caractères et nomme l'idée à corriger. Refusé par le validateur sinon.                                                  |
| Deux explications d'affilée         | C'est un cours magistral. Refusé par le validateur.                                                                                                  |
| Faire taper au clavier dans Réviser | Trop lourd sur un téléphone, pour un geste censé durer deux minutes. (Dans le Déclic, voir la décision ouverte §7.)                                  |
| Mettre l'action loin du pouce       | Les réponses et le bouton restent en bas de l'écran. Mesuré, voir §3.                                                                                |

---

## 2. La forme : onze cartes

```
C01  choice   on le fait ensemble   la situation qui marche
C02  reveal   je te montre          ce qui vient de se passer
C03  choice   on le fait ensemble   le cas qui ne marche pas
C04  reveal   je te montre          la règle générale
C05  choice   le piège              l'erreur tentante, de face
C06  reveal   je te montre          le mot, la notation, le bord
C07  choice   à toi                 seule, même contexte
C08  choice   à toi                 seule, autre forme
C09  choice   à toi                 transfert — avec variantes
C10  multi-step-choice              la validation, 3 étapes, 2 versions
C11  declic-summary                 ce qu'on garde
```

Trois cycles _montre → fais_, puis trois cartes seule, puis la validation. Chaque position a un
travail, et aucune n'est là pour faire du volume.

**C01 — la situation qui marche.** Une scène concrète où la réponse attendue est atteignable sans
rien connaître du cours. L'élève s'engage. C'est la carte qui décide si elle reste.

**C02 — ce qui vient de se passer.** Braise nomme ce que l'élève vient de faire. L'explication est
_méritée_ : elle répond à une action, pas à une page blanche.

**C03 — le cas qui ne marche pas.** Le contraste. Une seule situation ne fait pas une idée ; c'est
la paire « ça marche / ça ne marche pas » qui dessine la frontière.

**C04 — la règle générale.** Maintenant seulement. La règle arrive quand elle résume deux choses
déjà vécues, pas quand elle les annonce.

**C05 — le piège.** La carte la plus importante du Déclic. On met en face la mauvaise idée la plus
tentante, au moment où l'idée juste est fraîche mais pas encore automatique. Se tromper ici ne
coûte rien et vaccine durablement.

**C06 — le mot, la notation, le bord.** Le vocabulaire officiel, l'écriture attendue en contrôle,
ou le cas limite. C'est la carte « traduction prof ».

**C07 — seule, même contexte.** Première fois sans aide, dans le décor déjà connu.

**C08 — seule, autre forme.** La même idée sous un autre habillage : lire un algorithme, choisir la
phrase qui prouve, reconnaître une écriture. Vérifie que l'élève a compris l'idée, pas la mise en
scène.

**C09 — le transfert.** Un contexte entièrement différent. **Cette carte porte des variantes** : au
deuxième passage, ce n'est pas la même question.

**C10 — la validation.** Trois étapes, corrections **après les trois** (sinon la première correction
donne la suivante). Une étape est marquée _discriminante_ : celle qui sépare vraiment les notions.
Deux versions au minimum, pour qu'un nouvel essai ne soit pas une redite.

**C11 — ce qu'on garde.** La règle, sa vérification, et le piège de contrôle. Plus un menu pour
rejouer le point qui coince.

### Les écarts connus

| Déclic | Forme                                      | État                                                                                                                                                                                       |
| ------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D01    | 15 cartes, `C C R C R C C C C C C C C V S` | hors forme : la révélation arrive en 3ᵉ, aucun temps « piège », aucune variante. Une v2.0 attend hors dépôt.                                                                               |
| D02    | 16 cartes, commence par une révélation     | hors forme : le cours parle avant que l'élève ait agi. Une v1.0 attend hors dépôt.                                                                                                         |
| D07    | 11 cartes                                  | ✅ remis en forme : C09 était un cas limite sans variante, c'est maintenant un vrai transfert (un bus toutes les 12 minutes, à 6 h 00 pile) qui porte le cas de zéro, avec deux variantes. |

Restent **deux dettes de forme**, D01 et D02, et elles doivent être payées **avant le premier
testeur** : changer un identifiant de carte après coup efface la progression de qui l'a jouée.

### Ce que la forme n'impose pas

Onze cartes est le **patron**, pas une loi. Un Déclic peut porter deux idées jumelles et monter à
treize cartes ; ce qui ne change jamais, c'est l'ordre (agir avant d'expliquer, le piège après la
règle, le transfert avant la validation) et les trois dernières cartes.

---

## 3. Le contrat d'écran

Un Déclic est lu sur un téléphone tenu d'une main, souvent dans le bus. Trois règles, et elles se
mesurent — `npm run declic:play <id>` joue le Déclic en entier à 360 × 780 et photographie chaque
carte.

**Une idée par écran.** Une carte ne porte qu'une chose. Quand il n'y a qu'un geste possible
(« Continuer »), l'idée se centre dans l'espace libre plutôt que de se coller en haut.

**Le geste reste sous le pouce.** Les réponses et le bouton vivent en bas. Un bouton qu'il faut
aller chercher en faisant défiler n'est plus sous le pouce.

**Une ligne de pseudo-code ne se coupe jamais.** Une instruction coupée en deux n'est plus une
instruction. Et compter les caractères ne suffit pas : `si r = 0 alors « multiple »` et
`r ← reste de a divisé par b` font tous les deux 27 caractères, et un seul des deux déborde. C'est
une largeur en pixels, dans la vraie police — donc on mesure dans le navigateur.

### Ce que la mesure a trouvé

Les sept Déclics joués à 360 × 780, carte par carte :

| Déclic | Cartes où le bouton passe sous la ligne de flottaison |
| ------ | ----------------------------------------------------- |
| D01    | C01, C02, C06, C07, C11, C13                          |
| D02    | C02                                                   |
| D03    | C01, C03, C05, C09                                    |
| D04    | C01, C03                                              |
| D05    | C01, C07, C08                                         |
| D06    | **aucune**                                            |
| D07    | C01                                                   |

(D02 à D05 ont été relevés avant que le lecteur sache aller au bout d'un Déclic : leurs chiffres
sont un plancher, pas un total.)

Une fois la réponse donnée, la réaction de Braise s'ajoute **sous** les réponses et pousse le
bouton dehors. Deux lectures, et les deux sont vraies :

- **C'est le gabarit** : rien ne garantit que le geste suivant reste atteignable. Six Déclics sur
  sept sont touchés.
- **C'est aussi le contenu** : D06 n'a aucun défaut, parce que ses cartes sont plus courtes. Et
  **C01 est touchée dans cinq Déclics sur sept** — la carte d'entrée porte systématiquement trop :
  une mise en situation longue, une image, trois réponses de deux lignes, puis la réaction.

D'où deux règles, et une décision (§7) :

> **La carte d'entrée est la plus courte du Déclic, pas la plus longue.** Une question qui tient en
> deux lignes, des réponses d'une ligne. C'est la carte qui décide si l'élève reste ; elle doit
> s'encaisser d'un coup d'œil.

> **Une image sur une carte à choix se paie.** Elle pousse tout vers le bas. Si la carte porte déjà
> trois réponses longues, c'est l'un ou l'autre.

---

## 4. Les règles d'écriture

**La voix.** Un pote qui a compris, pas un prof qui récite. Tutoiement, phrases courtes, zéro
condescendance. Deux tons existent (`chill` et `savage`) : le `savage` est plus sec, jamais plus
dur avec l'élève.

**Les mauvaises réponses sont le vrai travail.** Une mauvaise réponse qui ne tente personne ne sert
à rien. Chacune doit être une erreur qu'une élève de seconde fait vraiment, et porter son
`misconceptionId`. Trois choix, dont deux pièges réels, valent mieux que quatre dont trois sont du
remplissage.

**Un feedback explique avant de corriger.** Il nomme ce que l'élève a probablement pensé, puis
rétablit. Une bonne réponse aussi apporte quelque chose : elle ne dit pas « bravo », elle dit
_pourquoi_ c'est juste.

**Les chiffres sont vrais.** Toute égalité écrite dans un feedback est vérifiée. Un Déclic qui se
trompe de calcul perd plus de crédit qu'il n'en gagne en dix cartes réussies.

**Le résumé est une fiche, pas un adieu.** Ce qu'on garde, l'écriture attendue en contrôle, et le
piège. Le surlignage `==…==` marque ce que l'œil doit attraper en premier — et il peut contenir une
égalité (`==a = kb==`), c'est même le cas normal en maths.

**Le concret n'est pas un décor.** Les crédits d'un jeu, les parts de pizza, les soldes : ils sont
là parce que la notion y vit vraiment, pas pour faire jeune. Un contexte plaqué s'entend.

---

## 5. Le catalogue : ce qui existe, ce qui manque

### Les cartes

| Type                               | Rôle                                                      | État                                        |
| ---------------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| `choice`                           | une question, deux à quatre réponses, un feedback chacune | ✅                                          |
| `reveal`                           | Braise explique, un seul geste pour continuer             | ✅                                          |
| `multi-step-choice`                | la validation, plusieurs étapes, un score                 | ✅                                          |
| `declic-summary`                   | la dernière carte, avec son menu de rattrapage            | ✅                                          |
| **preuve à remettre dans l'ordre** | les étapes d'une démonstration, mélangées                 | ❌ **bloque 10 exigences dans 7 chapitres** |

Le format `.txt` historique portait aussi une carte **reformulation** (« dis-le avec tes mots »,
une zone de saisie). Le format de cours ne l'a pas reprise. Décision ouverte, §7.

### Les images

Une image se décrit en données, jamais en dessin, et porte toujours sa phrase pour lecteur d'écran.

| Image                       | Couvre                                   | État                                    |
| --------------------------- | ---------------------------------------- | --------------------------------------- |
| `number-line`               | droite graduée, multiples, bornes, sauts | ✅ — sert aussi aux intervalles (`REE`) |
| `groups`                    | partages, lots, restes, parité           | ✅                                      |
| `nested-boxes`              | ensembles emboîtés (ℕ ⊂ ℤ)               | ✅                                      |
| **repère**                  | points, vecteurs, droites, courbes       | ❌                                      |
| **tableau**                 | variations, signes, effectifs            | ❌                                      |
| **diagrammes statistiques** | histogramme, boîte à moustaches, nuage   | ❌                                      |
| **barre de proportion**     | pourcentages, évolutions                 | ❌                                      |

### L'ordre de construction, par exigences débloquées

C'est le classement qui compte, et il tient à une observation : **Vecteurs, Droites, Fonctions et
Variations ne sont pas quatre problèmes de dessin, c'en est un seul** — un plan repéré sur lequel
on pose des points, des flèches, des droites et des courbes.

| À construire                                      | Exigences débloquées | Chapitres                                            |
| ------------------------------------------------- | -------------------- | ---------------------------------------------------- |
| **Le repère** (points, flèches, droites, courbes) | **~65**              | Vecteurs 22, Droites 14, Fonctions 12, Variations 17 |
| **La preuve à remettre dans l'ordre**             | **10**               | 7 chapitres sur 11, dont Arithmétique                |
| **Les diagrammes statistiques**                   | **~12**              | Statistiques, Croiser deux variables                 |
| **Le tableau** (variations, signes)               | **~10**              | Fonctions, Variations                                |
| **La barre de proportion**                        | **~8**               | Proportions et évolutions                            |
| _rien à construire_                               | **~34**              | Calcul et équations 19, Nombres réels 15             |

Deux conséquences directes :

1. **Le repère est le seul gros investissement du projet.** Un composant bien conçu ouvre près de
   40 % du programme de seconde. Tout le reste est du contenu.
2. **On peut écrire 34 exigences dès maintenant** sans toucher au moteur : _Nombres réels_ avec la
   droite graduée existante, _Calcul et équations_ avec du texte et des choix. C'est là que va le
   travail tant que le repère n'existe pas.

---

## 6. Ce que la machine vérifie, et ce qu'elle ne vérifie pas

| Vérifié                                                                     | Par quoi                   |
| --------------------------------------------------------------------------- | -------------------------- |
| Identifiants, ordres, préfixes, doublons                                    | `npm run course:check`     |
| Exactement une réponse attendue par question                                | `course:check`             |
| Feedback ≥ 24 caractères, jamais « Faux » seul, jamais le mot « échec »     | `course:check`             |
| Jamais deux explications d'affilée ; résumé en dernière carte               | `course:check`             |
| Rattrapages qui pointent vers des cartes antérieures, dans l'ordre          | `course:check`             |
| Chaque concept de la validation présent dans le deck de révision            | `course:check`             |
| Images : bornes, nombre de graduations, totaux, phrase pour lecteur d'écran | `course:check`             |
| Qu'une couverture pointe vers une exigence qui existe                       | `course:check`             |
| Pseudo-code qui déborde, texte rogné, bouton hors écran                     | `npm run declic:play <id>` |
| Le Déclic se joue de bout en bout sans se bloquer                           | `declic:play`              |

**Ce que personne ne vérifie encore :**

- **L'exactitude mathématique.** Aucun professeur de seconde n'a lu ce contenu. C'est le premier
  risque du projet, et aucun script ne le couvrira.
- **Si les mauvaises réponses tentent vraiment.** Cela se mesure avec des élèves, pas avec un lint.
- **Si l'idée passe.** Le vrai test est qu'une lycéenne réussisse C09 sans avoir lu C04 deux fois.
- **Qu'une exigence du programme soit couverte.** `course:check` **liste** qui couvre quoi, à la
  fin de son rapport, mais ne refuse rien : un chapitre qui laisse une exigence de côté passe. Le
  suivi se fait à la main, dans `content-briefs/maths-seconde/00-carte-programme.md` et dans la
  base Notion.

---

## 7. Les décisions ouvertes

Trois, et aucune ne doit être tranchée en silence dans un Déclic.

**a) Le bouton sous la ligne de flottaison après une réponse (§3).** Mesuré sur treize cartes dans
six Déclics sur sept. Raccourcir les cartes d'entrée réglera une partie du problème, mais pas le
gabarit : rien ne garantira jamais que le geste suivant est atteignable. _Recommandation : faire
venir le bouton à l'écran quand la réaction apparaît._ C'est le plus petit geste qui respecte la
règle du pouce — mais il touche la sensation, donc il se décide en le voyant bouger, pas sur
papier.

**b) La carte reformulation.** Écrire une phrase avec ses mots est le test de compréhension le moins
cher qui existe, et l'app sait déjà la stocker. Mais taper sur un téléphone est pénible, et la règle
« pas de clavier » est acquise pour Réviser. _Recommandation : la garder pour le Déclic seulement,
facultative, jamais bloquante, jamais notée_ — et la retirer pour de bon si les testeurs la sautent.

**c) Les Déclics sous licence d'un professeur.** Rien ne sera publié tant que le contenu de maths
n'a pas été relu par quelqu'un dont c'est le métier. _Ce n'est pas une option de calendrier._

---

## 8. La boucle d'écriture

```
 1. la fiche            Notion, base « Déclics » — une ligne par Déclic, le squelette dans la page
 2. le JSON             conversion fidèle, sans retoucher le texte
 3. course:check        structure, feedbacks, couverture du BO
 4. declic:play <id>    joué en entier, photographié, mesuré sur un écran de 360 px
 5. les tests, le lint, le build
 6. le statut           remis à jour dans Notion, avec ce qui a été corrigé
```

L'étape 4 n'est pas une formalité : elle a trouvé une ligne de pseudo-code coupée dans D05 et le
bouton hors écran dans six Déclics, et aucune des deux n'était visible dans les données. La
planche-contact qu'elle produit (`store/declic/<id>/planche.png`) se relit en dix secondes.

## 9. Le Déclic de référence

`maths-seconde/arithmetique/M2-ARI-D05.json` — « Le maximum sans dépasser ».

C'est celui à ouvrir avant d'en écrire un nouveau : forme respectée, piège réel, algorithme lu sans
clavier, validation à deux versions, résumé avec piège de contrôle. `M2-ARI-D07` est le même patron
appliqué une deuxième fois, et ses deux défauts de mise en page sont documentés dans son rapport
`declic:play`.
