# La méthode Déclic — ce sur quoi elle tient

`LE-DECLIC.md` dit **quelle forme** a un Déclic. Ce document dit **pourquoi cette forme**, en
partant des études, et surtout : **où la méthode actuelle se trompe**.

Il est écrit après avoir cherché les effets mesurés sur l'apprentissage des mathématiques au
secondaire, pas l'apprentissage en général. La distinction n'est pas un détail : c'est elle qui
retourne deux décisions du produit.

---

## 0. Ce que « marcher à 99 % » peut vouloir dire

Il n'existe pas de méthode qui fasse réussir 99 % des élèves, et aucune étude ne permettra jamais de
l'écrire. Les effets mesurés en éducation se comptent en écarts-types de 0,2 à 0,8 : réels, utiles,
jamais des garanties. **Et ils ne s'additionnent pas** — empiler cinq effets de 0,4 ne donne pas 2,0,
parce qu'ils passent en partie par le même canal (l'élève fait attention, l'élève revient).

Ce qui se promet, se vérifie et vaut la peine :

> **99 % de ce que fait l'application repose sur un mécanisme dont l'effet a été mesuré, et aucun
> mécanisme mesuré au-dessus de 0,3 au secondaire en maths n'est laissé de côté.**

C'est une cible atteignable, et aujourd'hui **elle n'est pas atteinte** : sur les huit mécanismes du
§1, BRAISE en utilise quatre pleinement, deux à moitié, en détourne un, et **ignore le plus grand
des huit**. Le reste du document corrige ça.

---

## 1. Les huit mécanismes, et ce qu'ils valent vraiment

Lecture : `d` et `g` sont des écarts-types. 0,2 petit · 0,4 moyen · 0,8 grand. La dernière colonne
dit sur quoi porte le chiffre, parce que c'est là que se cachent les mauvaises surprises.

| #   | Mécanisme                                                                           | Effet                                                                      | Base                                                                                                      | Porte sur                                                             |
| --- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | **Entraînement entremêlé** — mélanger les types de problèmes au lieu de les grouper | **d = 0,83** IC [0,68 ; 0,97]                                              | essai randomisé par classes, **54 classes de 5ᵉ**, test surprise à 1 mois (61 % vs 38 %), tenu 5 à 6 mois | **maths, secondaire**                                                 |
| 2   | **Exemple entièrement résolu** — montrer la solution complète, étape par étape      | **g = 0,48**                                                               | méta-analyse, 43 articles, 55 études, 181 effets                                                          | **maths**                                                             |
| 3   | **Retour d'information**                                                            | **d = 0,48**                                                               | méta-analyse, 435 études (k = 994)                                                                        | toutes matières ; l'effet dépend surtout du **contenu d'information** |
| 4   | **Comparer le correct et l'incorrect côte à côte**                                  | gains conceptuels **et** procéduraux supérieurs au correct seul            | essai randomisé, N = 74, décimaux ; **non modéré par le niveau de départ**                                | maths, primaire                                                       |
| 5   | **Pré-test** — répondre avant tout enseignement, même en se trompant                | **g = 0,34** (45 études) à **g = 0,54** (97 études)                        | deux méta-analyses                                                                                        | général ; **aucun chiffre en maths**                                  |
| 6   | **Chercher avant qu'on explique** (productive failure)                              | **g = 0,36** IC [0,20 ; 0,51] ; 0,37 à 0,58 quand le dispositif est fidèle | méta-analyse, 53 études, 166 comparaisons                                                                 | général, plutôt collège-lycée et au-delà                              |
| 7   | **Espacement**                                                                      | **g = 0,28**, robuste                                                      | méta-analyse, 27 études                                                                                   | **maths**                                                             |
| 8   | **Se tester** (rappel actif)                                                        | **g = 0,18, l'intervalle de confiance passe par zéro**                     | méta-analyse, 7 études                                                                                    | **maths : non concluant**                                             |

### Les trois choses que ce tableau dit et qu'on n'attendait pas

**a) Se tester n'est pas le levier qu'on croyait, en maths.** C'est le mécanisme le plus célèbre de
la littérature, et il ne tient pas ici : g = 0,18 avec un intervalle qui traverse zéro, et les
auteurs écrivent eux-mêmes que la littérature actuelle ne permet pas de conclure. La méta-analyse de
classe le dit autrement, et c'est plus précis encore : l'effet du rappel est net sur les
**connaissances factuelles** (g = 0,53) et **non significatif sur le conceptuel et le procédural**.

Autrement dit : se tester marche très bien pour **les mots, les notations, les énoncés vrais ou
faux**. Pas pour _savoir faire_. Or la méthode v0.1 posait « se tester bat relire » comme son
fondement, et Réviser est bâti là-dessus.

**b) Les effets sont plus petits au secondaire qu'à l'université.** La méta-analyse en classes
réelles note que les effets du test, de l'espacement et de l'entremêlement sont **plus faibles —
parfois négatifs — au primaire et au secondaire** qu'en enseignement supérieur. La plupart des
chiffres rassurants de la littérature viennent d'étudiants. Il faut donc lire ce tableau en
décroissant les attentes, sauf la ligne 1, mesurée précisément sur des collégiens.

**c) Un seul mécanisme sort du lot, et c'est celui qu'on n'utilise pas.** d = 0,83, sur des élèves
du même âge, en maths, en classe, avec un test surprise un mois après et un effet encore là cinq
mois plus tard. Il n'y a rien d'autre de cette taille dans tout ce qui précède.

---

## 2. Le bulletin de BRAISE

| Mécanisme                | Dans l'app                                                       | Verdict                                |
| ------------------------ | ---------------------------------------------------------------- | -------------------------------------- |
| 1 · Entremêlement        | nulle part dans l'apprentissage d'une notion                     | ❌ **absent — et c'est le plus grand** |
| 2 · Exemple résolu       | C02, C04, C06 **expliquent** au lieu de **dérouler**             | ⚠️ à moitié                            |
| 3 · Retour d'information | feedback ≥ 24 car. qui nomme l'erreur avant de corriger          | ✅                                     |
| 4 · Correct vs incorrect | C05 existe, mais le contraste est **successif**, pas côte à côte | ⚠️ à moitié                            |
| 5 · Pré-test             | C01 : agir avant qu'on explique                                  | ✅                                     |
| 6 · Chercher avant       | le cycle C01 → C02, trois fois                                   | ✅                                     |
| 7 · Espacement           | SM-2 dans `progress.ts` : 1 jour, 3 jours, puis × facilité       | ✅                                     |
| 8 · Se tester            | Carré/Intox, **appliqué au procédural**, là où il ne marche pas  | ⚠️ détourné                            |

Quatre pleins, deux moitiés, un détournement, une absence. **Les corrections du §3 ferment les
quatre dernières lignes.** Rien dans la forme des onze cartes n'est à jeter : ce qui a convergé tout
seul se trouve être, carte par carte, ce que les études soutiennent le mieux.

---

## 3. Les cinq corrections

### Correction 1 — Construire l'entraînement entremêlé (le seul vrai manque)

**Ce que dit l'étude.** Dans l'essai de 5ᵉ, les deux groupes ont fait **exactement les mêmes
exercices**, en même quantité. Seul l'ordre changeait : groupés par type pour l'un, mélangés pour
l'autre. 61 % contre 38 % un mois plus tard. Ce n'est pas un contenu supplémentaire, **c'est un
ordre**.

**Pourquoi ça marche, et pourquoi ça compte ici.** Quand les exercices sont groupés, l'élève sait
d'avance quelle méthode appliquer : l'énoncé ne sert plus à rien, il n'exécute. Mélangés, il doit
d'abord **reconnaître de quel genre de problème il s'agit**. C'est ce geste-là qui manque en
contrôle, et c'est exactement celui qu'un chapitre groupé n'entraîne jamais.

**Ce que fait BRAISE aujourd'hui, vérifié dans le code.**

- Dans un Déclic, C07, C08, C09 portent la **même** notion. Normal et juste : pendant l'acquisition,
  le groupé est le bon régime. Ce n'est pas là qu'est le problème.
- `dueCards(deck, …)` prend **un deck**, c'est-à-dire **un Déclic**, et `engine.ts` les trie du plus
  facile au plus dur. La révision d'une notion est donc groupée, et dans l'ordre le plus confortable
  possible.
- `courseCards.ts` fait passer **au plus 3 cartes** de cours dans une session Réviser, et seulement
  **si quelque chose a mal tourné** (`THRESHOLD = 1.5`). Une élève qui réussit tout ne voit jamais
  ses notions mélangées.
- Et surtout : les cartes Carré/Intox demandent de **juger si une affirmation est vraie**. Elles ne
  demandent jamais de **choisir une méthode**. Le geste que l'entremêlement entraîne n'existe pas
  dans le produit.

**La conclusion est dure et nette : le mode révision de BRAISE, tel qu'il est construit, ne peut pas
produire l'effet de 0,83.** Pas « le produit mal », pas « partiellement » : le geste mesuré n'y est
pas.

**Ce qu'il faut construire — « le tri ».** Un mode d'entraînement dont l'unité n'est plus le Déclic
mais le **chapitre**, voire deux chapitres voisins :

1. Un énoncé court tombe. Il vient d'un Déclic quelconque déjà joué.
2. La question n'est pas « combien ça fait », c'est **« c'est lequel ? »** — quelle notion, quelle
   méthode, quel outil. Deux à quatre réponses, les autres notions du chapitre comme leurres.
3. Puis seulement, s'il y a lieu, la réponse.
4. Les énoncés consécutifs ne sont **jamais** de la même notion. C'est la seule règle qui fait
   l'effet ; c'est elle qu'il faut garder quoi qu'il arrive au reste.

C'est peu de moteur : la forme est celle d'une carte à choix, qui existe. Ce qui manque est un
**ordre de tirage** (jamais deux fois la même notion de suite) et, côté données, **un nom court par
Déclic** — `chapter.json` porte bien les notions voisines, mais sous forme d'exigences du BO
(« Déterminer si un entier naturel a est multiple d'un entier naturel b ») et de titres de Déclic,
ni l'un ni l'autre utilisable tel quel comme réponse à choisir. Un champ `notion` de trois mots par
Déclic suffit, et il se remplit en même temps que les Déclics restants.

**Deux honnêtetés.** L'effet est mesuré sur quatre mois d'exercices en classe, pas sur une appli de
cinq minutes. Et les enseignants de l'essai ont signalé que les devoirs mélangés **prenaient plus de
temps** : à temps constant, l'effet serait plus petit que 0,83.

### Correction 2 — Les révélations deviennent des exemples déroulés

g = 0,48 porte sur un **exemple entièrement résolu** : un cas concret dont toutes les étapes sont
visibles, dans l'ordre, sans trou. Ce n'est pas un paragraphe qui explique la règle.

Les cartes qui portent du pseudo-code le font déjà (D05-C08, D07-C06 : chaque ligne est une étape).
Les autres révélations, non : elles énoncent la règle avec de bons mots.

> **Règle.** Une carte `reveal` déroule **un cas**, étape par étape, jusqu'au résultat. La règle
> générale vient après les étapes, comme leur résumé — jamais à leur place.

C'est aussi, accessoirement, la carte la plus courte à écrire : des lignes, pas de la prose. Et ça
aide le contrat d'écran (§3 de `LE-DECLIC.md`), parce qu'une suite d'étapes courtes se lit mieux
qu'un bloc.

### Correction 3 — C05 met les deux méthodes côte à côte

Deux résultats qui se complètent, et dont l'ordre importe :

- Comparer un exemple correct **et** un incorrect bat comparer deux corrects, sur le conceptuel
  comme sur le procédural — et l'avantage ne dépend pas du niveau de départ de l'élève.
- Mais dans la méta-analyse en maths, les exemples **incorrects seuls** font moins bien que les
  corrects seuls.

La leçon n'est donc pas « montre des erreurs ». C'est : **l'erreur n'enseigne que mise en regard de
la méthode juste, avec le point de différence nommé.** Le mécanisme proposé par les auteurs est
précisément celui-là : la comparaison dirige l'attention sur ce qui distingue la bonne méthode de
l'erreur.

> **Règle.** Le feedback de C05 montre **les deux chemins l'un sous l'autre** et nomme en une phrase
> **l'endroit exact** où ils divergent. Pas « non, c'est l'inverse » : les deux lignes, et le mot qui
> les sépare.

C05 devient ainsi la carte la mieux soutenue de tout le Déclic — à condition d'être écrite comme une
comparaison, et pas comme une sanction.

### Correction 4 — Carré/Intox est rendu à ce qu'il sait faire

Se tester : g = 0,53 sur le factuel, non significatif sur le conceptuel et le procédural. Carré/Intox
est **un excellent outil mal employé**.

> **Règle.** Une carte Carré/Intox porte sur **un mot, une notation, une affirmation vraie ou
> fausse, un cas limite**. Jamais sur « sait-elle faire ». Savoir faire s'entraîne au §3,
> correction 1.

Ce n'est pas une rétrogradation. Le vocabulaire et la notation sont une vraie part du programme et
une vraie part de ce qui coûte des points en contrôle, et c'est le registre où le rappel actif est le
plus efficace de toute la littérature. On arrête juste de lui demander l'autre métier.

### Correction 5 — Le retour d'information arrive sans délai, donc à l'écran

Le gain du pré-test **diminue à mesure que le délai entre l'erreur et la correction augmente**. Et
l'effet du retour d'information dépend d'abord de son **contenu d'information** — ce que les
feedbacks du Déclic font déjà bien.

Or la mesure de `declic:play` a trouvé que la réaction de Braise s'ajoute **sous** les réponses et
pousse le bouton hors de l'écran, sur treize cartes dans six Déclics sur sept. Un feedback qu'il faut
aller chercher en faisant défiler est un feedback retardé.

L'étude et la mesure disent la même chose. **La décision ouverte (a) de `LE-DECLIC.md` est tranchée :
quand la réaction apparaît, elle vient à l'écran.**

---

## 4. Les onze cartes, mécanisme par mécanisme

La forme n'a pas été dessinée d'après les études — elle a convergé seule sur cinq Déclics. Le
rapprochement, fait après coup, tombe presque juste. C'est la meilleure nouvelle de ce document.

| Carte     | Ce qu'elle fait                                      | Mécanisme                            | Effet                                |
| --------- | ---------------------------------------------------- | ------------------------------------ | ------------------------------------ |
| C01       | répondre avant tout enseignement                     | pré-test + chercher avant            | 0,34 – 0,54 · 0,36                   |
| C02       | Braise déroule ce qui vient de se passer             | exemple résolu                       | 0,48                                 |
| C03       | le cas qui ne marche pas                             | contraste (la frontière)             | —                                    |
| C04       | la règle, après deux cas vécus                       | exemple résolu, résumé               | 0,48                                 |
| C05       | l'erreur tentante, puis les deux chemins côte à côte | correct vs incorrect                 | gains conceptuels **et** procéduraux |
| C06       | le mot, la notation, le bord                         | factuel → le registre de Carré/Intox | 0,53 (factuel)                       |
| C07       | seule, même contexte                                 | pratique guidée retirée              | —                                    |
| C08       | seule, autre forme                                   | variation de surface                 | —                                    |
| C09       | transfert, autre contexte, variantes                 | transfert                            | —                                    |
| C10       | validation en 3 étapes, corrections après les trois  | retour d'information, non contaminé  | 0,48                                 |
| C11       | ce qu'on garde                                       | consolidation                        | —                                    |
| **après** | **le tri, mélangé, à l'échelle du chapitre**         | **entremêlement**                    | **0,83** ❌ **à construire**         |

Deux précisions que les études imposent sur des cartes existantes :

**C01 a le droit d'être difficile.** Le bénéfice du pré-test ne vient pas de la bonne réponse — dans
la plupart de ces études, les élèves ne la trouvent presque jamais. Il vient de ce que la question
**prépare à recevoir** l'explication qui suit. Et l'effet **grandit avec le délai** avant le test
final : c'est un mécanisme de mémoire longue, pas une mise en jambes.

Donc la règle du §3 de `LE-DECLIC.md` se précise : **C01 est la carte la plus courte à lire, pas la
plus facile à résoudre.** Deux lignes, des réponses d'une ligne, des leurres vraiment tentants.

**C10 a raison de corriger après les trois étapes.** Corriger l'étape 1 tout de suite donnerait
l'étape 2. Mais c'est un délai, et le délai coûte (correction 5). Le compromis tient parce que les
trois étapes sont une seule tâche : la correction arrive à la fin de **la tâche**, pas le lendemain.

---

## 5. La contrainte qui annule tout le reste

Un effet de 0,83 multiplié par zéro séance vaut zéro. Et la donnée la plus brutale de toute cette
recherche n'est pas un effet d'apprentissage :

> **La plupart des utilisateurs d'une application éducative décrochent en quelques semaines.**
> (essai randomisé, 10 000 élèves, 2026 — rétention à 12 semaines autour de 19 % dans le groupe
> témoin.)

Ce chiffre reclasse tout. Aucune des optimisations de ce document ne compte si l'élève ne rouvre pas
l'application au jour 3. C'est pour ça que les règles qui ont l'air d'être du confort — pas de
classement, pas de punition, pas de « Faux », l'action sous le pouce, cinq minutes — ne sont pas du
confort : **elles sont la condition d'existence de tous les effets du §1.**

Et c'est pour ça que l'essai cité est équivoque pour nous : ce qui a tenu l'engagement, chez eux,
c'est un concours avec classement. BRAISE a décidé de ne jamais faire ça, pour une raison qui tient
toujours — un classement rebâtit exactement la pression que l'app existe pour retirer, et notre
cible est celle que la façon classique met déjà en échec. **On refuse donc le levier d'engagement le
mieux mesuré, et on doit en trouver un autre.** C'est une dette assumée, pas un oubli.

> **Règle.** La question « est-ce qu'elle rouvre demain ? » passe avant « est-ce qu'elle a appris ? »
> dans toute décision de conception. Pas parce qu'elle compte plus, parce qu'elle compte **d'abord**.

---

## 6. Les deux décisions que les études tranchent

**(a) Le bouton sous la ligne de flottaison → il vient à l'écran.** Le délai entre l'erreur et la
correction réduit le bénéfice du pré-test. Mesuré sur treize cartes, soutenu par l'étude. Tranché.

**(b) La carte reformulation → elle ne revient pas.** Et la raison n'est pas « taper au clavier est
pénible » ; elle est plus intéressante : dans la méta-analyse en maths, **ajouter des invites
d'auto-explication aux exemples résolus est un modérateur négatif**. Les conditions avec invites
faisaient _moins_ bien que celles sans. Le résultat est discuté — des études isolées trouvent un
bénéfice — mais sur le registre qui nous concerne, maths et exemples résolus, le signe est contre.

Deux raisons indépendantes pointent donc dans le même sens, ce qui est le cas le plus confortable
pour fermer une question. **La reformulation est retirée du catalogue.** Ce qu'elle cherchait à
vérifier — « est-ce qu'elle a compris, ou est-ce qu'elle a deviné » — est le travail de C09 et de
C10, sans clavier.

**(c) La relecture par un professeur de maths reste ouverte**, et rien ici ne la remplace. Les huit
mécanismes du §1 disent comment présenter une idée juste. Aucun ne détecte une idée fausse.

---

## 7. Ce qu'on mesurera avec les premiers testeurs

Les études disent où chercher ; elles ne disent pas si ça marche **ici**, pour **cette cible**. Trois
mesures, et rien de plus, parce qu'avec huit à douze élèves on lit des tendances.

| Question                       | Comment                                               | Ce qui compterait                                                                 |
| ------------------------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| Est-ce qu'elle revient ?       | ouverture au jour 1 et au jour 3, sans relance        | la seule mesure qui invalide tout le reste                                        |
| Est-ce que l'idée tient ?      | C09 d'un Déclic joué, reposé à J+3 sans aide          | réussi sans avoir rouvert C04                                                     |
| Est-ce que le tri discrimine ? | mélangé vs groupé, deux notions comparables par élève | l'écart, s'il existe, va dans le sens du groupé à court terme — c'est **attendu** |

Ce dernier point est un piège qu'il faut connaître d'avance : **l'entremêlement rend l'entraînement
moins confortable et les résultats immédiats moins bons.** L'avantage n'apparaît qu'au test différé.
Un test à J+0 conclurait exactement le contraire de la vérité. Si on ne mesure qu'à J+0, il ne faut
pas mesurer du tout.

---

## 8. Ce qui reste inconnu, et qu'on n'inventera pas

- **Aucun chiffre pour notre cible.** Les élèves « que la façon classique met en échec » ne sont pas
  une population isolée dans ces méta-analyses. L'effet du contraste correct/incorrect est le seul
  qui soit explicitement **non modéré par le niveau de départ** — c'est maigre, et c'est la seule
  ligne qu'on puisse citer sur ce point.
- **Rien sur les troubles dys ou TDAH en rappel actif**, déjà noté en octobre 2026 ; rien trouvé
  depuis.
- **Les chiffres du §1 viennent de résumés et d'abrégés** pour la plupart. Les quatre qui portent une
  décision de ce document (l'entremêlement 0,83 ; l'exemple résolu 0,48 ; le modérateur négatif des
  invites d'auto-explication ; le rappel non concluant en maths) doivent être lus dans l'article
  complet avant d'être écrits dans un document public ou dans un dossier PÉPITE.
- **Un effet mesuré sur quatre mois de devoirs en classe n'est pas un effet mesuré sur une appli de
  cinq minutes dans le bus.** Toute cette construction fait le pari que le mécanisme se transporte.
  C'est un pari raisonné ; ça reste un pari.
- **« 99 % » reste une façon de parler.** Ce qui se vérifie, c'est le §2 : le nombre de mécanismes
  mesurés que le produit utilise réellement. Il est de quatre sur huit. Les cinq corrections du §3 le
  portent à huit sur huit, dont une — l'entremêlement — demande du code.

---

## Sources

1. Méta-analyse en classes réelles du rappel, de l'espacement et de l'entremêlement (2026) — 53 études, 7 303 participants · <https://link.springer.com/article/10.1007/s10648-026-10225-5>
2. Méta-analyse espacement et rappel en mathématiques, _Educational Psychology Review_ (2025) · <https://eric.ed.gov/?id=EJ1478558>
3. Rohrer, Dedrick, Hartwig & Cheung — essai randomisé de l'entraînement entremêlé en maths (2020) · <https://files.eric.ed.gov/fulltext/ED595322.pdf>
4. Barbieri et al. — méta-analyse de l'effet de l'exemple résolu en maths (2023) · <https://www.researchgate.net/publication/367544801_A_Meta-analysis_of_the_Worked_Examples_Effect_on_Mathematics_Performance>
5. Durkin & Rittle-Johnson — comparer exemples corrects et incorrects (2012) · <https://www.researchgate.net/publication/257408490_The_effectiveness_of_using_incorrect_examples_to_support_learning_about_decimal_magnitude>
6. Sinha & Kapur — méta-analyse « chercher avant qu'on explique » (2021) · <https://journals.sagepub.com/doi/full/10.3102/00346543211019105>
7. Wisniewski, Zierer & Hattie — _The Power of Feedback Revisited_ (2020) · <https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/pdf>
8. Effet de pré-test, robustesse et méta-analyses (2025) · <https://par.nsf.gov/servlets/purl/10620790>
9. Pré-test : effet du délai entre l'erreur et la correction · <https://pmc.ncbi.nlm.nih.gov/articles/PMC12292081/>
10. Concours, ludification et engagement durable en technologie éducative (2026) — 10 000 élèves · <https://link.springer.com/article/10.1007/s11129-026-09311-3>
