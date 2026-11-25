# Carte du programme — Mathématiques, seconde générale et technologique

**Ce document est la référence de tout le contenu maths de BRAISE.** Il relève le programme
officiel ligne par ligne, donne à chaque exigence un identifiant stable, et dit en face ce que
l'app couvre déjà. Aucune fiche de chapitre ne devrait être écrite sans s'y rattacher.

## La source

|             |                                                                              |
| ----------- | ---------------------------------------------------------------------------- |
| Texte       | Programme de mathématiques de la classe de seconde générale et technologique |
| Arrêté      | du 26 février 2026 — JO du 27 mars 2026                                      |
| NOR         | MENE2602914A                                                                 |
| Publication | BO n° 14 du 2 avril 2026                                                     |
| Application | rentrée 2026-2027                                                            |
| Remplace    | l'annexe de l'arrêté du 17 janvier 2019                                      |

L'arrêté est sur [Légifrance](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000053723219) et au
[BO](https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602914A), mais **ni l'un ni l'autre ne
publie le programme lui-même** : il n'existe qu'en annexe PDF, chez education.gouv.fr. Cette
annexe est archivée ici : `content-briefs/_sources/BO26-maths-seconde.pdf` (13 pages, 327 Ko,
téléchargée le 23 novembre 2026). C'est elle qui fait foi, pas ce document — qui n'en est qu'un
relevé, et qui peut contenir une erreur de transcription.

> Une série fait exception : la **STHR** garde son ancien programme de mathématiques. Hors
> périmètre pour BRAISE.

## Comment lire les identifiants

`BO26-M2-ARI-CONT-02` = programme 2026, Maths Seconde, section Arithmétique, deuxième
« Contenu ». Les types sont ceux du texte officiel :

- `CONT` — Contenus
- `CAP` — Capacités attendues
- `DEM` — Démonstrations (le programme en identifie « quelques-unes, exemplaires »)
- `ALG` — Exemples d'algorithme
- `APF` — Approfondissements possibles (**jamais obligatoires**, dit le texte)

Trois identifiants déjà utilisés par le chapitre Arithmétique ne suivent pas ce schéma
(`BO26-M2-VEL-APP-01`, `-INC-01`, `-NUMSET-01`) : ils restent tels quels, changer un identifiant
déjà posé dans du contenu publié casserait son rattachement. Ils sont signalés plus bas.

---

## L'architecture du programme

Le texte s'organise en **quatre parties thématiques** et **trois parties transversales**. Et il
dit lui-même ce qu'il faut en faire :

> « Cette organisation n'est cependant pas un plan de cours : il est essentiel d'exploiter les
> interactions entre les différentes parties […] en adoptant un enseignement en spirale. »

Les parties transversales « ne donnent pas lieu à des séquences de cours spécifiques mais font
cependant l'objet d'un enseignement explicite ».

| Partie                                              | Sections                                                                                    | Code      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------- |
| _Transversale_ — Vocabulaire ensembliste et logique | —                                                                                           | `VEL`     |
| _Transversale_ — Algorithmique et programmation     | Variables et instructions élémentaires                                                      | `APR-VAR` |
|                                                     | Notion de fonction                                                                          | `APR-FON` |
| _Transversale_ — Automatismes                       | 7 blocs (calcul, proportions, évolutions, fonctions, géométrie, statistiques, probabilités) | `AUT-*`   |
| Nombres et calculs, algèbre                         | Arithmétique                                                                                | `ARI`     |
|                                                     | Nombres réels                                                                               | `REE`     |
|                                                     | Algèbre                                                                                     | `ALG`     |
| Géométrie                                           | Vecteurs et problèmes de géométrie                                                          | `VEC`     |
|                                                     | Droites du plan                                                                             | `DRO`     |
| Fonctions                                           | Représentation algébrique et graphique des fonctions                                        | `FON`     |
|                                                     | Variations et extrémums d'une fonction                                                      | `VEX`     |
| Statistiques et probabilités                        | Information chiffrée et statistique descriptive                                             | `ICS`     |
|                                                     | Croisement de deux variables qualitatives                                                   | `CVQ`     |
|                                                     | Probabilités                                                                                | `PRB`     |

---

# Le registre des exigences

## Nombres et calculs, algèbre

### Arithmétique — `ARI`

| id                    | exigence                                                                                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BO26-M2-ARI-CONT-01` | Notations ℕ et ℤ.                                                                                                                                                                                           |
| `BO26-M2-ARI-CONT-02` | Définition des notions de multiple, de diviseur, de nombre pair, de nombre impair : a est multiple de b s'il existe un entier k tel que a = kb.                                                             |
| `BO26-M2-ARI-CAP-01`  | Modéliser et résoudre des problèmes mobilisant les notions de multiple, de diviseur, de nombre pair, de nombre impair.                                                                                      |
| `BO26-M2-ARI-CAP-02`  | Présenter les fractions sous forme irréductible. ⚠️ Dans `chapter.json`, `CAP-02` était déjà attribué à « problème de parité » : la capacité « fractions irréductibles » y porte donc `BO26-M2-ARI-CAP-03`. |
| `BO26-M2-ARI-DEM-01`  | Pour une valeur numérique de a, la somme de deux multiples de a est multiple de a.                                                                                                                          |
| `BO26-M2-ARI-DEM-02`  | Le carré d'un nombre impair est impair.                                                                                                                                                                     |
| `BO26-M2-ARI-ALG-01`  | Déterminer si un entier naturel a est multiple d'un entier naturel b.                                                                                                                                       |
| `BO26-M2-ARI-ALG-02`  | Pour des entiers a et b donnés, déterminer le plus grand multiple de a inférieur ou égal à b.                                                                                                               |

> Le chapitre BRAISE `M2-ARI` a découpé le `CONT-02` officiel en cinq exigences distinctes
> (`CONT-02` multiple, `CONT-03` diviseur, `CONT-04` pair, `CONT-05` impair). C'est un découpage
> **pédagogique**, pas une lecture différente du texte : une définition par Déclic. À conserver
> tel quel — il est déjà publié — mais à savoir quand on compare la couverture au programme.

### Nombres réels — `REE`

| id                    | exigence                                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `BO26-M2-REE-CONT-01` | Ensemble ℝ des nombres réels, droite numérique.                                                                                     |
| `BO26-M2-REE-CONT-02` | Intervalles de ℝ. Représentation graphique, notations du type [a, +∞[, ]–∞, a], [a, b], etc.                                        |
| `BO26-M2-REE-CONT-03` | Notation en valeur absolue \|a\| pour la distance de a à 0. Distance entre deux nombres réels.                                      |
| `BO26-M2-REE-CONT-04` | Inéquation du type \|x – a\| ⩽ r. Représentation graphique des solutions, intervalle [a – r, a + r].                                |
| `BO26-M2-REE-CONT-05` | Ensemble 𝔻 des nombres décimaux. Encadrement décimal d'un nombre réel à 10⁻ⁿ près.                                                  |
| `BO26-M2-REE-CONT-06` | Ensemble ℚ des nombres rationnels. Nombres irrationnels ; exemples fournis par la géométrie, par exemple √2 et π.                   |
| `BO26-M2-REE-CAP-01`  | Lire l'abscisse d'un nombre réel sur une droite graduée et placer un nombre réel d'abscisse donnée.                                 |
| `BO26-M2-REE-CAP-02`  | Représenter un intervalle de la droite numérique. Déterminer si un nombre réel appartient à un intervalle donné.                    |
| `BO26-M2-REE-CAP-03`  | Donner un encadrement, d'amplitude donnée, d'un nombre réel par des décimaux.                                                       |
| `BO26-M2-REE-CAP-04`  | Dans le cadre de la résolution de problèmes, arrondir en donnant le nombre de chiffres significatifs adapté à la situation étudiée. |
| `BO26-M2-REE-DEM-01`  | Le nombre rationnel 1/3 n'est pas décimal.                                                                                          |
| `BO26-M2-REE-DEM-02`  | Le nombre réel √2 est irrationnel.                                                                                                  |
| `BO26-M2-REE-ALG-01`  | Déterminer par balayage un encadrement de √2 d'amplitude inférieure ou égale à 10⁻ⁿ.                                                |
| `BO26-M2-REE-APF-01`  | Développement décimal illimité d'un nombre réel.                                                                                    |
| `BO26-M2-REE-APF-02`  | Observation, sur des exemples, de la périodicité du développement décimal de nombres rationnels.                                    |

> Le texte précise que la valeur absolue sert **uniquement** à exprimer une distance et à
> caractériser les intervalles de centre donné : « Toute autre utilisation est hors programme. »

### Algèbre — `ALG`

| id                    | exigence                                                                                                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BO26-M2-ALG-CONT-01` | Règles de calcul sur les puissances entières relatives, sur les racines carrées. Relation √(a²) = \|a\|.                                                                                                               |
| `BO26-M2-ALG-CONT-02` | Exemples simples de calcul sur des expressions algébriques, en particulier sur des expressions fractionnaires.                                                                                                         |
| `BO26-M2-ALG-CONT-03` | Somme d'inégalités. Produit d'une inégalité par un réel positif, négatif, en liaison avec le sens de variation d'une fonction affine.                                                                                  |
| `BO26-M2-ALG-CONT-04` | Comparaison additive (par différence), comparaison multiplicative (par rapport, pour deux nombres strictement positifs).                                                                                               |
| `BO26-M2-ALG-CONT-05` | Ensemble des solutions des équations du type ax + b = 0, et des inéquations de la forme ax + b > 0.                                                                                                                    |
| `BO26-M2-ALG-CONT-06` | Équation de la forme A(x)B(x) = 0 (équation produit nul).                                                                                                                                                              |
| `BO26-M2-ALG-CONT-07` | En liaison avec la section « Fonctions », étude du signe des expressions de la forme A(x)B(x) et A(x)/B(x).                                                                                                            |
| `BO26-M2-ALG-CONT-08` | Équation A(x)/B(x) = k (équation quotient) en lien avec l'ensemble de définition d'une expression.                                                                                                                     |
| `BO26-M2-ALG-CAP-01`  | Effectuer des calculs numériques ou littéraux mettant en jeu des puissances, des racines carrées, des écritures fractionnaires.                                                                                        |
| `BO26-M2-ALG-CAP-02`  | Sur des cas simples de relations entre variables (par exemple U = RI, d = vt, S = πr², V = abc, V = πr²h), exprimer une variable en fonction des autres. Cas d'une relation du premier degré ax + by = c.              |
| `BO26-M2-ALG-CAP-03`  | Choisir la forme la plus adaptée (factorisée, développée réduite) d'une expression en vue de la résolution d'un problème.                                                                                              |
| `BO26-M2-ALG-CAP-04`  | Comparer deux quantités en utilisant leur différence, ou leur rapport (ratio) dans le cas de quantités positives. Interpréter, selon le contexte, cette comparaison en termes de variation additive ou multiplicative. |
| `BO26-M2-ALG-CAP-05`  | Modéliser un problème par une inéquation.                                                                                                                                                                              |
| `BO26-M2-ALG-CAP-06`  | Donner l'ensemble des solutions d'une équation du premier degré du type ax = b, a + x = b, ax + b = cx + d, d'une inéquation du premier degré, d'une équation du type x² = a.                                          |
| `BO26-M2-ALG-DEM-01`  | Quels que soient les réels positifs a et b, on a √(ab) = √a √b.                                                                                                                                                        |
| `BO26-M2-ALG-ALG-01`  | Déterminer la première puissance d'un nombre positif donné supérieure ou inférieure à une valeur donnée.                                                                                                               |
| `BO26-M2-ALG-APF-01`  | Développement de (a + b + c)².                                                                                                                                                                                         |
| `BO26-M2-ALG-APF-02`  | Développement de (a + b)³.                                                                                                                                                                                             |
| `BO26-M2-ALG-APF-03`  | Inégalité entre moyennes géométrique et arithmétique de deux réels strictement positifs.                                                                                                                               |

## Géométrie

### Vecteurs et problèmes de géométrie — `VEC`

| id                    | exigence                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `BO26-M2-VEC-CONT-01` | Égalité de deux vecteurs. Notation u⃗. Vecteur nul.                                                                          |
| `BO26-M2-VEC-CONT-02` | Représentants d'un vecteur.                                                                                                  |
| `BO26-M2-VEC-CONT-03` | Produit d'un vecteur par un nombre réel. Colinéarité de deux vecteurs.                                                       |
| `BO26-M2-VEC-CONT-04` | Représentation d'un vecteur comme combinaison de deux vecteurs non colinéaires.                                              |
| `BO26-M2-VEC-CONT-05` | Base orthonormée. Coordonnées d'un vecteur. Expression de la norme d'un vecteur.                                             |
| `BO26-M2-VEC-CONT-06` | Expression des coordonnées de AB⃗ en fonction de celles de A et de B.                                                        |
| `BO26-M2-VEC-CONT-07` | Déterminant de deux vecteurs dans une base orthonormée, critère de colinéarité. Application à l'alignement, au parallélisme. |
| `BO26-M2-VEC-CONT-08` | Caractérisation vectorielle du milieu d'un segment.                                                                          |
| `BO26-M2-VEC-CAP-01`  | Représenter la somme de deux vecteurs à partir de représentants de même origine.                                             |
| `BO26-M2-VEC-CAP-02`  | Représenter un vecteur dont on connait les coordonnées. Lire les coordonnées d'un vecteur.                                   |
| `BO26-M2-VEC-CAP-03`  | Calculer les coordonnées d'une somme de vecteurs, d'un produit d'un vecteur par un nombre réel.                              |
| `BO26-M2-VEC-CAP-04`  | Calculer la distance entre deux points. Calculer les coordonnées du milieu d'un segment.                                     |
| `BO26-M2-VEC-CAP-05`  | Caractériser alignement et parallélisme par la colinéarité de vecteurs.                                                      |
| `BO26-M2-VEC-CAP-06`  | Résoudre des problèmes en utilisant la représentation la plus adaptée des vecteurs.                                          |
| `BO26-M2-VEC-CAP-07`  | Résoudre des problèmes avec des méthodes diverses (méthodes vectorielles, repérées ou non, méthodes géométriques).           |
| `BO26-M2-VEC-DEM-01`  | Caractérisations de la colinéarité de deux vecteurs non nuls : nullité du déterminant ; proportionnalité des coordonnées.    |
| `BO26-M2-VEC-APF-01`  | Barycentre de deux ou trois points.                                                                                          |
| `BO26-M2-VEC-APF-02`  | Formule permettant le calcul des coordonnées du milieu d'un segment.                                                         |
| `BO26-M2-VEC-APF-03`  | Démontrer que les hauteurs d'un triangle sont concourantes.                                                                  |
| `BO26-M2-VEC-APF-04`  | Expression de l'aire d'un triangle : ½ ab sin C.                                                                             |
| `BO26-M2-VEC-APF-05`  | Démontrer que l'isobarycentre de trois points non alignés est l'intersection des médianes.                                   |
| `BO26-M2-VEC-APF-06`  | Démontrer que le point de concours des médiatrices est le centre du cercle circonscrit.                                      |

### Droites du plan — `DRO`

| id                    | exigence                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `BO26-M2-DRO-CONT-01` | Vecteur directeur d'une droite.                                                                                      |
| `BO26-M2-DRO-CONT-02` | Équation de droite : équation cartésienne, équation réduite.                                                         |
| `BO26-M2-DRO-CONT-03` | Pente (ou coefficient directeur) d'une droite non parallèle à l'axe des ordonnées.                                   |
| `BO26-M2-DRO-CAP-01`  | Déterminer une équation de droite à partir de deux points, un point et un vecteur directeur ou un point et la pente. |
| `BO26-M2-DRO-CAP-02`  | Déterminer la pente ou un vecteur directeur d'une droite donnée par une équation ou une représentation graphique.    |
| `BO26-M2-DRO-CAP-03`  | Tracer une droite connaissant son équation cartésienne ou réduite.                                                   |
| `BO26-M2-DRO-CAP-04`  | Établir que trois points sont alignés ou non.                                                                        |
| `BO26-M2-DRO-CAP-05`  | Déterminer si deux droites sont parallèles ou sécantes.                                                              |
| `BO26-M2-DRO-CAP-06`  | Déterminer le point d'intersection de deux droites sécantes données par leur équation réduite.                       |
| `BO26-M2-DRO-DEM-01`  | En utilisant le déterminant, établir la forme générale d'une équation de droite.                                     |
| `BO26-M2-DRO-ALG-01`  | Étudier l'alignement de trois points dans le plan.                                                                   |
| `BO26-M2-DRO-ALG-02`  | Déterminer une équation de droite passant par deux points donnés.                                                    |
| `BO26-M2-DRO-APF-01`  | Ensemble des points équidistants d'un point et de l'axe des abscisses.                                               |
| `BO26-M2-DRO-APF-02`  | Représentation, sur des exemples, de parties du plan décrites par des inégalités sur les coordonnées.                |

## Fonctions

### Représentation algébrique et graphique des fonctions — `FON`

| id                    | exigence                                                                                                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BO26-M2-FON-CONT-01` | Fonction à valeurs réelles définie sur un intervalle ou une réunion finie d'intervalles de ℝ.                                                                                          |
| `BO26-M2-FON-CONT-02` | Recherche de domaine d'étude (ensemble de définition).                                                                                                                                 |
| `BO26-M2-FON-CONT-03` | Courbe représentative : la courbe d'équation y = f(x) est l'ensemble des points du plan dont les coordonnées (x, y) vérifient y = f(x).                                                |
| `BO26-M2-FON-CONT-04` | Signe d'une fonction affine et des fonctions de référence.                                                                                                                             |
| `BO26-M2-FON-CONT-05` | Tableau de signes pour une fonction produit ou quotient.                                                                                                                               |
| `BO26-M2-FON-CAP-01`  | Exploiter l'équation y = f(x) d'une courbe : appartenance, calcul de coordonnées.                                                                                                      |
| `BO26-M2-FON-CAP-02`  | Modéliser par des fonctions des situations issues des mathématiques, des autres disciplines ou de la vie courante ou citoyenne.                                                        |
| `BO26-M2-FON-CAP-03`  | Fonctions valeur absolue, carré, inverse : définitions et courbes représentatives.                                                                                                     |
| `BO26-M2-FON-CAP-04`  | Résoudre une équation ou une inéquation du type f(x) = k, f(x) < k, en choisissant une méthode adaptée : graphique, algébrique, logicielle.                                            |
| `BO26-M2-FON-CAP-05`  | Résoudre une équation ou une inéquation de la forme f(x) = 0, f(x) > 0 à l'aide d'un tableau de signes, lorsque f est un produit ou un quotient.                                       |
| `BO26-M2-FON-CAP-06`  | Résoudre, graphiquement ou à l'aide d'un outil numérique, une équation ou inéquation du type f(x) = g(x), f(x) < g(x).                                                                 |
| `BO26-M2-FON-CAP-07`  | Pour les fonctions affines, valeur absolue, carré, inverse, racine carrée et cube, résoudre graphiquement ou algébriquement une équation ou une inéquation du type f(x) = k, f(x) < k. |

### Variations et extrémums d'une fonction — `VEX`

| id                    | exigence                                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BO26-M2-VEX-CONT-01` | Croissance, décroissance, monotonie d'une fonction définie sur un intervalle. Tableau de variations.                                                           |
| `BO26-M2-VEX-CONT-02` | Maximum, minimum d'une fonction sur un intervalle.                                                                                                             |
| `BO26-M2-VEX-CONT-03` | Pour une fonction affine donnée par f(x) = mx + p, interprétation de m comme taux d'accroissement et de p comme ordonnée à l'origine.                          |
| `BO26-M2-VEX-CONT-04` | Variations d'une fonction affine selon le signe du coefficient directeur.                                                                                      |
| `BO26-M2-VEX-CAP-01`  | Relier représentation graphique et tableau de variations.                                                                                                      |
| `BO26-M2-VEX-CAP-02`  | Déterminer graphiquement les extrémums d'une fonction sur un intervalle.                                                                                       |
| `BO26-M2-VEX-CAP-03`  | Exploiter un logiciel de géométrie dynamique ou de calcul formel, la calculatrice ou Python pour décrire les variations d'une fonction donnée par une formule. |
| `BO26-M2-VEX-CAP-04`  | Pour une fonction affine, relier sens de variation, signe de la fonction et droite représentative.                                                             |
| `BO26-M2-VEX-CAP-05`  | Traiter de problèmes d'optimisation.                                                                                                                           |
| `BO26-M2-VEX-CAP-06`  | Fonctions valeur absolue, carré : signe et variations.                                                                                                         |
| `BO26-M2-VEX-CAP-07`  | Pour deux nombres a et b donnés et une fonction de référence f, comparer f(a) et f(b) numériquement ou graphiquement.                                          |
| `BO26-M2-VEX-DEM-01`  | Variations des fonctions affines.                                                                                                                              |
| `BO26-M2-VEX-DEM-02`  | Position relative des courbes d'équation y = x, y = x², pour x ⩾ 0.                                                                                            |
| `BO26-M2-VEX-DEM-03`  | Variations des fonctions carré, inverse.                                                                                                                       |
| `BO26-M2-VEX-ALG-01`  | Pour une fonction dont le tableau de variations est donné, algorithmes d'approximation numérique d'un extrémum (balayage, dichotomie).                         |
| `BO26-M2-VEX-ALG-02`  | Algorithme de calcul approché de longueur d'une portion de courbe représentative de fonction.                                                                  |
| `BO26-M2-VEX-APF-01`  | Relier les courbes représentatives de la fonction racine carrée et de la fonction carré sur ℝ⁺.                                                                |

## Statistiques et probabilités

### Information chiffrée et statistique descriptive — `ICS`

| id                    | exigence                                                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BO26-M2-ICS-CONT-01` | _Proportions_ — Ensembles de référence inclus les uns dans les autres : pourcentage de pourcentage.                                                                                                                |
| `BO26-M2-ICS-CONT-02` | _Évolution_ — variation absolue V₂ – V₁, coefficient multiplicateur V₂/V₁, variation relative (V₂ – V₁)/V₁ (taux d'évolution).                                                                                     |
| `BO26-M2-ICS-CONT-03` | _Évolution_ — Évolutions successives, évolution réciproque : relation sur les coefficients multiplicateurs (produit, inverse).                                                                                     |
| `BO26-M2-ICS-CONT-04` | _Statistiques à une variable_ — Linéarité de la moyenne.                                                                                                                                                           |
| `BO26-M2-ICS-CONT-05` | _Statistiques à une variable_ — Indicateurs de dispersion : écart type.                                                                                                                                            |
| `BO26-M2-ICS-CONT-06` | _Statistiques à une variable_ — Influence sur la moyenne, la médiane de l'ajout ou de la suppression d'une valeur dans la série.                                                                                   |
| `BO26-M2-ICS-CONT-07` | _Regroupement par classes_ — Représentation graphique : histogramme, polygone des fréquences cumulées.                                                                                                             |
| `BO26-M2-ICS-CONT-08` | _Regroupement par classes_ — Calcul de la moyenne à partir de la moyenne et des effectifs de chaque classe (moyenne pondérée) ; cas particulier où la répartition est uniforme dans chaque classe.                 |
| `BO26-M2-ICS-CONT-09` | _Regroupement par classes_ — Détermination de la classe médiane à partir des effectifs des classes ; estimation de la médiane dans le cas de répartition uniforme dans la classe médiane.                          |
| `BO26-M2-ICS-CAP-01`  | Exploiter la relation entre effectifs, proportions et pourcentages.                                                                                                                                                |
| `BO26-M2-ICS-CAP-02`  | Traiter des situations simples mettant en jeu des pourcentages de pourcentages.                                                                                                                                    |
| `BO26-M2-ICS-CAP-03`  | Exploiter la relation entre deux valeurs successives et leur taux d'évolution.                                                                                                                                     |
| `BO26-M2-ICS-CAP-04`  | Calculer le taux d'évolution global à partir des taux d'évolution successifs. Calculer un taux d'évolution réciproque.                                                                                             |
| `BO26-M2-ICS-CAP-05`  | Pour une série statistique regroupée en classes : calculer la moyenne pondérée ; déterminer la classe médiane et estimer la médiane.                                                                               |
| `BO26-M2-ICS-CAP-06`  | Décrire les différences entre deux séries statistiques, en s'appuyant sur des indicateurs ou couples d'indicateurs (moyenne-écart type / médiane-écart interquartile), sur des représentations graphiques données. |

### Croisement de deux variables qualitatives — `CVQ`

| id                    | exigence                                                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BO26-M2-CVQ-CONT-01` | Tableau croisé d'effectifs.                                                                                                                                            |
| `BO26-M2-CVQ-CONT-02` | Fréquence conditionnelle, fréquence marginale.                                                                                                                         |
| `BO26-M2-CVQ-CAP-01`  | Calculer des fréquences conditionnelles et des fréquences marginales.                                                                                                  |
| `BO26-M2-CVQ-CAP-02`  | Compléter un tableau croisé par des raisonnements sur les effectifs ou en utilisant des fréquences conditionnelles.                                                    |
| `BO26-M2-CVQ-ALG-01`  | À partir de deux listes représentant deux caractères d'individus, déterminer un sous-ensemble d'individus répondant à un critère (filtre, utilisation de ET, OU, NON). |
| `BO26-M2-CVQ-ALG-02`  | Dresser le tableau croisé de deux variables qualitatives à partir du fichier des individus et calculer des fréquences conditionnelles ou marginales.                   |

### Probabilités — `PRB`

| id                    | exigence                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BO26-M2-PRB-CONT-01` | Version vulgarisée de la loi des grands nombres : « Lorsque n est grand, sauf exception, la fréquence observée est proche de la probabilité. »                |
| `BO26-M2-PRB-CONT-02` | Probabilité conditionnelle d'un évènement B sachant un évènement A de probabilité non nulle. Notation P_A(B).                                                 |
| `BO26-M2-PRB-CONT-03` | Arbres de probabilité, application au calcul de probabilités.                                                                                                 |
| `BO26-M2-PRB-CAP-01`  | Observer la loi des grands nombres à l'aide d'une simulation sur Python ou tableur.                                                                           |
| `BO26-M2-PRB-CAP-02`  | Construire un arbre pondéré ou un tableau en lien avec une situation donnée. Passer du registre de la langue naturelle au registre symbolique et inversement. |
| `BO26-M2-PRB-CAP-03`  | Calculer des probabilités conditionnelles lorsque les évènements sont présentés sous forme de tableau croisé d'effectifs ou d'un arbre de probabilité.        |
| `BO26-M2-PRB-CAP-04`  | Interpréter les pondérations de chaque branche d'un arbre en termes de probabilités, et notamment de probabilités conditionnelles.                            |
| `BO26-M2-PRB-CAP-05`  | Faire le lien entre la définition des probabilités conditionnelles et la multiplication des probabilités des branches du chemin correspondant.                |
| `BO26-M2-PRB-CAP-06`  | Distinguer en situation P_A(B) et P_B(A), par exemple dans des situations de type « faux positifs ».                                                          |

> **Limite explicite du texte** : « Le calcul de la probabilité d'un évènement connaissant ses
> probabilités conditionnelles relatives à une partition de l'univers n'est pas un attendu du
> programme. » (Autrement dit : pas de formule des probabilités totales.)

## Les trois parties transversales

### Vocabulaire ensembliste et logique — `VEL`

Pas de tableau « Contenus / Capacités » dans le texte : une liste de ce que les élèves doivent
connaitre et savoir faire, à travailler **en situation** dans tous les chapitres.

| id                    | exigence                                                                                                                                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BO26-M2-VEL-CONT-01` | Notions d'élément, de sous-ensemble, d'ensemble vide, d'appartenance, d'inclusion, de réunion, d'intersection, de complémentaire ; symboles Ø, ∈, ⊂, ∩, ∪, {…}, notation des ensembles de nombres et des intervalles. |
| `BO26-M2-VEL-CONT-02` | Notion de couple, produit cartésien de deux ensembles.                                                                                                                                                                |
| `BO26-M2-VEL-CONT-03` | Complémentaire : notation A̅ des probabilités, ou E \ A. Cardinal d'un ensemble fini : Card(A).                                                                                                                        |
| `BO26-M2-VEL-CAP-01`  | Reconnaitre ce qu'est une proposition mathématique, utiliser des variables pour écrire des propositions.                                                                                                              |
| `BO26-M2-VEL-CAP-02`  | Lire et écrire des propositions contenant les connecteurs « et », « ou ».                                                                                                                                             |
| `BO26-M2-VEL-CAP-03`  | Formuler la négation de propositions simples (sans implication ni quantificateurs).                                                                                                                                   |
| `BO26-M2-VEL-CAP-04`  | Mobiliser un contre-exemple pour montrer qu'une proposition est fausse.                                                                                                                                               |
| `BO26-M2-VEL-CAP-05`  | Formuler une implication, une équivalence logique, et les mobiliser dans un raisonnement simple.                                                                                                                      |
| `BO26-M2-VEL-CAP-06`  | Formuler la réciproque d'une implication, la contraposée.                                                                                                                                                             |
| `BO26-M2-VEL-CAP-07`  | Lire et écrire des propositions contenant une quantification universelle ou existentielle (**les symboles ∀ et ∃ sont hors programme**).                                                                              |
| `BO26-M2-VEL-CAP-08`  | Produire des raisonnements par disjonction des cas et par l'absurde.                                                                                                                                                  |

Identifiants hérités, déjà posés dans `M2-ARI` et à ne pas renommer : `BO26-M2-VEL-APP-01`
(appartenance, ∈), `BO26-M2-VEL-INC-01` (inclusion, ⊂), `BO26-M2-VEL-NUMSET-01` (notation des
ensembles de nombres). Ils sont des sous-ensembles de `VEL-CONT-01`.

### Algorithmique et programmation — `APR`

Le langage est imposé : **Python**. « Les élèves sont entrainés à passer du langage naturel à
Python et inversement. »

| id                        | exigence                                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `BO26-M2-APR-VAR-CONT-01` | Variables informatiques de type entier, booléen, flottant, chaine de caractères.                                                          |
| `BO26-M2-APR-VAR-CONT-02` | Affectation (notée ← en langage naturel).                                                                                                 |
| `BO26-M2-APR-VAR-CONT-03` | Séquence d'instructions.                                                                                                                  |
| `BO26-M2-APR-VAR-CONT-04` | Instruction conditionnelle.                                                                                                               |
| `BO26-M2-APR-VAR-CONT-05` | Boucle bornée (for), boucle non bornée (while).                                                                                           |
| `BO26-M2-APR-VAR-CAP-01`  | Choisir ou déterminer le type d'une variable (entier, flottant ou chaine de caractères).                                                  |
| `BO26-M2-APR-VAR-CAP-02`  | Concevoir et écrire une instruction d'affectation, une séquence d'instructions, une instruction conditionnelle.                           |
| `BO26-M2-APR-VAR-CAP-03`  | Écrire une formule permettant un calcul combinant des variables.                                                                          |
| `BO26-M2-APR-VAR-CAP-04`  | Programmer, dans des cas simples, une boucle bornée, une boucle non bornée.                                                               |
| `BO26-M2-APR-VAR-CAP-05`  | Dans des cas plus complexes : lire, comprendre, modifier ou compléter un algorithme ou un programme.                                      |
| `BO26-M2-APR-FON-CONT-01` | Fonctions à un ou plusieurs arguments.                                                                                                    |
| `BO26-M2-APR-FON-CONT-02` | Fonction renvoyant un nombre aléatoire. Série statistique obtenue par la répétition de l'appel d'une telle fonction.                      |
| `BO26-M2-APR-FON-CAP-01`  | Écrire des fonctions simples ; lire, comprendre, modifier, compléter des fonctions plus complexes. Appeler une fonction.                  |
| `BO26-M2-APR-FON-CAP-02`  | Lire et comprendre une fonction renvoyant une moyenne, un écart type. **Aucune connaissance sur les listes n'est exigée.**                |
| `BO26-M2-APR-FON-CAP-03`  | Écrire des fonctions renvoyant le résultat numérique d'une expérience aléatoire, d'une répétition d'expériences aléatoires indépendantes. |

### Automatismes — `AUT`

Sept blocs. Le texte est explicite sur leur statut : ils « n'ont pas vocation à faire l'objet d'un
chapitre d'enseignement spécifique », ils « relèvent d'un entrainement régulier privilégiant
l'activité mentale » et doivent « être travaillés tout au long de l'année ».

| bloc                           | code      | contenu                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Calcul numérique et algébrique | `AUT-CAL` | comparaison de deux nombres ; fractions simples ; puissances ; passage décimale/fractionnaire/pourcentage ; ordre de grandeur ; vraisemblance d'un résultat ; conversions d'unités ; calcul littéral élémentaire ; développement, factorisation, identités ; équations x² = a, ax + b = cx + d, a/x = b, inéquation du premier degré ; isoler une variable ; application numérique d'une formule |
| Proportions et pourcentages    | `AUT-PRO` | calculer, appliquer, exprimer une proportion sous différentes formes ; partie connaissant le tout et inversement                                                                                                                                                                                                                                                                                 |
| Évolutions et variations       | `AUT-EVO` | passer d'une formulation additive (« augmenter de 5 % ») à une formulation multiplicative (« multiplier par 1,05 »)                                                                                                                                                                                                                                                                              |
| Fonctions et représentations   | `AUT-FON` | images et antécédents graphiquement ; exploiter une équation de courbe ; reconnaitre une fonction linéaire, affine, et savoir que leur représentation est une droite                                                                                                                                                                                                                             |
| Géométrie                      | `AUT-GEO` | repérer un point sur une droite graduée ; coordonnées dans un repère orthogonal ; périmètres, aires, volumes ; Pythagore, Thalès ; cosinus, sinus, tangente                                                                                                                                                                                                                                      |
| Statistiques                   | `AUT-STA` | lire et commenter diagrammes en barres, circulaires, courbes et nuages de points ; moyenne, médiane, quartiles ; comparer des distributions avec des boites à moustaches                                                                                                                                                                                                                         |
| Probabilités                   | `AUT-PRB` | une probabilité est entre 0 et 1 ; évènement contraire ; somme des probabilités des issues ; P(A) = Card(A)/Card(Ω) en équiprobabilité                                                                                                                                                                                                                                                           |

Le détail du bloc `AUT-CAL` contient une longue liste de formules de calcul littéral que
l'extraction automatique du PDF rend mal (fractions imbriquées). **Se reporter à la page 5 du PDF
source** avant d'écrire du contenu dessus, plutôt qu'à ce tableau.

---

# Ce que ça implique pour BRAISE

## Le découpage en chapitres proposé

Onze chapitres couvrent les quatre parties thématiques. Les trois parties transversales ne sont
**pas** des chapitres — le programme l'interdit explicitement — elles se tissent dedans.

| #   | chapitre BRAISE           | sections du programme                 | état                                                  |
| --- | ------------------------- | ------------------------------------- | ----------------------------------------------------- |
| 1   | Arithmétique              | `ARI`                                 | **7 Déclics écrits sur 9** (`M2-ARI`) — porte le test |
| 2   | Nombres réels             | `REE`                                 | à écrire                                              |
| 3   | Calcul et équations       | `ALG`                                 | à écrire                                              |
| 4   | Vecteurs                  | `VEC`                                 | à écrire                                              |
| 5   | Droites du plan           | `DRO`                                 | à écrire                                              |
| 6   | Lire une fonction         | `FON`                                 | à écrire                                              |
| 7   | Variations et extrémums   | `VEX`                                 | à écrire                                              |
| 8   | Proportions et évolutions | `ICS` (proportions, évolution)        | à écrire                                              |
| 9   | Statistiques              | `ICS` (série à une variable, classes) | à écrire                                              |
| 10  | Croiser deux variables    | `CVQ`                                 | à écrire                                              |
| 11  | Probabilités              | `PRB`                                 | à écrire                                              |

Le découpage de `ICS` en deux chapitres n'est pas dans le texte : c'est un choix de volume (la
section est la plus chargée du programme) et de sens (une proportion et un écart type ne
répondent pas à la même question).

## L'ordre d'écriture

L'ordre du programme n'est pas un ordre d'enseignement, et encore moins un ordre d'écriture. Pour
BRAISE, trois critères : ce qu'un élève de seconde rencontre tôt dans l'année, ce qui se raconte
bien en Déclic, et ce que le moteur sait déjà afficher.

1. ~~Finir Arithmétique (D04 à D07)~~ — **fait les 23 et 25 novembre 2026.** Le chapitre tient
   sept Déclics : multiples et diviseurs, parité, lots identiques, maximum sous une limite,
   fractions, et le test de multiplicité lu comme un algorithme (`ALG-01`).

   Il n'en reste que **deux**, et non quatre : une fois les exigences relevées une à une, seules
   `DEM-01` et `DEM-02` ne sont pas couvertes. Le chapitre fait donc neuf Déclics, pas dix — le
   dixième annoncé plus haut n'avait aucune exigence derrière lui. Ces deux-là sont les
   démonstrations, et elles demandent au moteur une carte qui sache conduire un raisonnement
   (piste : remettre les étapes d'une preuve dans l'ordre, sans clavier). **À trancher avant
   d'écrire les fiches**, sinon on écrit pour rien.

2. **Proportions et évolutions** (`ICS`). Raconte le réel sans effort — soldes, augmentations,
   pièges de pourcentages — et ne demande au moteur aucun type de carte nouveau.
3. **Nombres réels** (`REE`). Intervalles et encadrements : visuellement très fort sur une droite
   graduée, et le moteur a déjà une image `number-line`.

À retarder : **Vecteurs** et **Droites**, qui demandent des figures géométriques interactives que
le moteur n'a pas. Écrire ces chapitres avant de construire ces cartes serait écrire pour rien.

## Trois décisions à prendre

**Python.** Le programme impose un langage et exige d'écrire et de modifier des programmes
(`APR-*`). BRAISE n'a aucune carte de code, et la règle « pas de saisie clavier dans Réviser »
rend l'exercice difficile. Trois sorties : ne pas couvrir l'algorithmique et le dire, la couvrir
en lecture seule (lire un programme et prédire ce qu'il affiche — ça, c'est tapable), ou
construire une carte de code.

**La deuxième a été essayée, et elle tient** : `M2-ARI-D05` fait lire un algorithme en langage naturel — avec la notation ← du programme — et fait choisir la ligne manquante entre trois candidates, dont le reste et le multiple qui dépasse. Aucun clavier, aucune carte nouvelle, et l'exigence `BO26-M2-ARI-ALG-02` est couverte. À reprendre tel quel pour les autres algorithmes du programme ; une carte de code ne devient nécessaire que pour faire _écrire_ du Python, ce que le texte demande aussi (`APR-VAR-CAP-02`) mais que rien n'oblige à couvrir pour un test.

**Les automatismes sont un cadeau.** Le programme réclame un « entrainement régulier privilégiant
l'activité mentale », « tout au long de l'année », sur des gestes courts. C'est exactement ce que
fait Réviser, et c'est le seul endroit où l'app fait déjà, nativement, ce que le texte officiel
demande. Il n'y a pas de Déclic à écrire pour ça : il y a des cartes de révision à produire, et
elles sont bien moins chères qu'un Déclic.

**Le volume.** Onze chapitres à une dizaine de Déclics chacun, c'est de l'ordre de **cent
Déclics** pour couvrir la seconde. Trois sont écrits. C'est le vrai chantier de BRAISE — pas le
code.

## Ce que ce document ne fait pas

Il ne valide rien sur le fond. Le relevé est fidèle au texte officiel autant que j'ai pu le faire,
mais il n'a été relu par personne dont c'est le métier, et le découpage en chapitres est une
proposition d'éditeur, pas une progression pédagogique validée par un professeur de seconde.
