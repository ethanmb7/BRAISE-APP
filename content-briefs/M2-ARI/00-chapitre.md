# BRAISE — Fiche chapitre M2-ARI

## 1. Identité et statut

- `chapterId` : `M2-ARI`
- Matière : mathématiques.
- Niveau : seconde générale et technologique.
- Titre : **Arithmétique — entiers, divisibilité, parité et fractions**.
- Public : lycéens ; aucune réponse rédigée ou saisie au clavier dans l'application.
- Version du plan : `0.1.0`.
- Date : `2026-10-05`.
- Année scolaire de référence : `2026-2027`.
- Statut : **plan proposé pour contrôle par Claude, avant rédaction des cartes**.
- Livraison présente : fiche chapitre uniquement. Les scénarios ci-dessous sont des intentions de conception, pas des cartes prêtes à importer.
- Format : Markdown structuré selon les consignes transmises. La conformité exacte à `BRIEF_TEMPLATE.md` reste à contrôler avec ce fichier, absent du présent espace de travail.

## 2. Source officielle et périmètre

- Source : ministère de l'Éducation nationale, BO n° 14 du 2 avril 2026.
- NOR : `MENE2602914A`.
- Arrêté : 26 février 2026 ; JO du 27 mars 2026.
- Application : rentrée scolaire 2026-2027.
- Page officielle : https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602914A
- Annexe officielle : https://www.education.gouv.fr/sites/default/files/document/Annexe%20%E2%80%93%20Programme%20d%26%23039%3Benseignement%20de%20math%C3%A9matiques%20de%20la%20classe%20de%20seconde%20g%C3%A9n%C3%A9rale%20et%20technologique-515402.pdf
- Chemin dans l'annexe : `Programme > Nombres et calculs, algèbre > Arithmétique`.
- Localisation : page 7 du PDF de 13 pages ; index de page 6 pour un lecteur indexant depuis zéro.
- Consultation : 5 octobre 2026.

Le plan couvre la rubrique **Arithmétique**. Les exigences ci-dessous sont reformulées et parfois décomposées pour permettre leur suivi. Leurs identifiants sont des identifiants éditoriaux BRAISE, pas des codes attribués par le ministère.

Les nombres premiers et l'algorithme de primalité figuraient dans la rubrique de 2019, mais ne figurent plus dans celle de 2026. Ils ne sont donc pas ajoutés comme attendus obligatoires de ce chapitre. Une méthode par facteurs premiers pourrait rester un complément, sans être nécessaire au parcours proposé.

Les ensembles ℝ, 𝔻, ℚ, les intervalles et les irrationnels appartiennent à la rubrique voisine « Nombres réels » ; ils relèveront d'un autre chapitre. Le présent document ne revendique aucune couverture de l'ensemble du programme annuel.

L'appartenance, l'inclusion, le contre-exemple et la distinction entre exemple et preuve sont travaillés en situation. Ils contribuent aux objectifs transversaux de logique, sans les couvrir intégralement. Les manipulations de code contribuent à l'algorithmique ; elles ne certifient pas la capacité à programmer seul.

## 3. Registre des exigences du chapitre

Les deux exemples d'algorithme sont suivis distinctement ; leur statut reste celui d'exemples proposés par le BO.

| `requirementId` | Catégorie | Attendu reformulé | Déclics prévus |
|---|---|---|---|
| M2-ARI-BO-01 | Contenu | Employer ℕ et ℤ. | D01 |
| M2-ARI-BO-02 | Contenu | Définir un multiple par une égalité avec un facteur entier. | D02 |
| M2-ARI-BO-03 | Contenu | Définir un diviseur. | D02 |
| M2-ARI-BO-04 | Contenu | Définir un entier pair. | D03 |
| M2-ARI-BO-05 | Contenu | Définir un entier impair. | D03 |
| M2-ARI-BO-06 | Capacité | Modéliser et résoudre un problème de multiples ou diviseurs. | D04, D05 |
| M2-ARI-BO-07 | Capacité | Modéliser et résoudre un problème de parité. | D03 |
| M2-ARI-BO-08 | Capacité | Donner une fraction irréductible. | D06, D07 |
| M2-ARI-BO-09 | Démonstration | Prouver la stabilité d'une somme de multiples pour un facteur numérique fixé. | D08 |
| M2-ARI-BO-10 | Démonstration | Prouver qu'un carré d'entier impair est impair. | D09 |
| M2-ARI-BO-11 | Exemple d'algorithme | Tester si un naturel est multiple d'un autre. | D10 |
| M2-ARI-BO-12 | Exemple d'algorithme | Trouver le plus grand multiple sous une borne donnée. | D05 |

Les exigences BO-02 à BO-05 détaillent une même ligne de contenus ; BO-06 et BO-07 détaillent une même capacité. BO-09 et BO-10 restent bien deux démonstrations, pas des observations numériques.

## 4. Contrat pédagogique commun aux futurs Déclics

### Expérience élève

- Une idée centrale par Déclic ; durée cible souple de 4 à 7 minutes, à tester auprès des élèves. Une preuve peut demander davantage de temps.
- Une entrée concrète et courte, issue d'une situation de jeu, de sport, de réseau social ou de vie de classe.
- Un exemple correct expliqué, avec une représentation simple, avant le défi autonome.
- Une définition ou une propriété explicite ; l'élève ne doit pas deviner indéfiniment une règle implicite.
- Des décisions par boutons : résultat, justification, contre-exemple, étape manquante ou fragment de code. Aucun champ de texte libre, aucune saisie numérique.
- Une difficulté qui évolue : application proche, distinction de raisonnements, puis réutilisation dans une situation différente.
- Un pont vers le contrôle : une justification modèle et, lorsque pertinent, une phrase à compléter par sélection.
- Un rappel d'une notion antérieure au début de certains Déclics. Le mode Réviser reste un complément facultatif, distinct du parcours d'apprentissage.

### Variantes et feedbacks

- Chaque carte `choice` et `multi_step_validation` contient **deux variantes complètes au minimum**, trois si la variation apporte un intérêt réel.
- Chaque variante possède son énoncé, ses choix identifiés, la réponse attendue et un feedback pour chaque choix.
- Chaque choix incorrect porte un `misconceptionId` précis, issu du registre ci-dessous.
- Le feedback explique pourquoi le raisonnement échoue ou réussit. Pas de feedback réduit à « Faux », « Bravo » ou à une lettre de réponse.
- Les variantes changent les données et les situations. À l'échelle du Déclic, les tâches varient aussi : choisir un résultat ne remplace pas choisir une justification.
- Un distracteur suggère une conception erronée ; une seule réponse ne constitue pas un diagnostic certain.
- Deux tons, même contenu mathématique : **Chill**, encourageant et calme ; **Savage**, second degré sur la situation ou la stratégie, jamais sur l'intelligence de l'élève.
- Des visuels statiques ou des états avant/après suffisent. Pas de glisser-déposer, de simulation complexe ou d'IA conversationnelle indispensable.

### Validation et progression

- Une validation finale à trois étapes : appliquer, sélectionner une justification, transférer vers un problème nouveau.
- Mêmes objectifs, difficulté comparable et même nombre d'étapes entre variantes.
- Barème proposé : un point par étape correcte au premier envoi, total sur trois. Les trois réponses sont recueillies avant l'affichage des corrections pour éviter que celles-ci donnent les réponses suivantes.
- À trois points : **validation immédiate réussie**. En dessous : retour ciblé vers l'exemple concerné, puis nouvelle tentative si une autre variante est disponible.
- Un nouvel essai est enregistré séparément. Si toutes les variantes ont été vues, un essai recyclé reste de l'entraînement, pas une preuve nouvelle de maîtrise.
- Séparer la fin du parcours, la réussite immédiate et la rétention différée. Ne pas afficher « maîtrisé durablement » à partir d'un seul passage.
- Une activité ultérieure avec des items inédits peut mesurer la rétention. La production autonome d'une rédaction de contrôle doit être évaluée autrement, en dehors de ce parcours à boutons.

Les noms de champs et les quatre types de carte seront repris exactement depuis `BRIEF_TEMPLATE.md` ou `types.ts`. Le présent plan ne remplace pas le contrat technique de l'application.

## 5. Plan des Déclics

### M2-ARI-D01 — Un nombre, quelle famille ?

- **Idée centrale** : classer un nombre dans ℕ et ℤ en regardant sa valeur.
- **Objectif observable** : distinguer entier naturel, entier relatif négatif et nombre non entier ; traiter correctement zéro.
- **Entrée prévue** : quantité de messages et variation d'un score ; ces deux usages rendent visibles les entiers positifs, zéro et les négatifs.
- **Visualisation** : ensembles imbriqués et quelques points sur une droite graduée.
- **Formalisation** : ℕ contient zéro et les entiers positifs ; ℤ contient aussi les entiers négatifs. Appartenance et inclusion restent au service de ce classement.
- **Transfert prévu** : classer des valeurs issues d'une température ou d'une profondeur, puis reconnaître que 4,0 vaut 4.
- **Prérequis** : sens du signe négatif et distinction entier/non entier.
- **Couverture** : M2-ARI-BO-01.
- **Identité** : D01 existe déjà ; conserver tous ses identifiants de cartes lors de la réécriture. Les exemples locaux attestent notamment C08 et C14, sans fournir l'inventaire complet du dépôt.

### M2-ARI-D02 — Ça tombe juste

- **Idée centrale** : « a est multiple de b » et « b est diviseur de a » décrivent la même relation dans deux sens.
- **Objectif observable** : reconnaître une répartition exacte et traduire une égalité de produit dans les deux formulations.
- **Entrée prévue** : 24 joueurs répartis en équipes de 6 ; comparaison avec une répartition comportant un reste.
- **Visualisation** : groupes complets et éléments restants.
- **Formalisation** : a = b × k, avec k entier ; le quotient doit être entier. Dans les tâches de partage, b est strictement positif.
- **Transfert prévu** : albums de photos ou rangées de sièges ; une variante mobilisera ensuite des entiers négatifs hors contexte de partage.
- **Prérequis** : D01 et tables de multiplication.
- **Couverture** : M2-ARI-BO-02, M2-ARI-BO-03.
- **Découpage** : le titre antérieurement envisagé « Multiples, diviseurs et parité » est resserré ; la parité devient D03, sous réserve des identifiants déjà publiés dans le dépôt.

### M2-ARI-D03 — Tout le monde a son binôme ?

- **Idée centrale** : la parité décrit la possibilité de former uniquement des paires.
- **Objectif observable** : reconnaître pairs et impairs, y compris zéro et les négatifs, et interpréter un reste de un.
- **Entrée prévue** : composition de binômes pour une activité de classe.
- **Visualisation** : paires et élément isolé ; puis écritures 2k et 2k + 1.
- **Formalisation** : un entier pair s'écrit 2k ; un entier impair s'écrit 2k + 1, avec k entier.
- **Transfert prévu** : quantité de jetons ou alternance de places ; passage à une écriture littérale simple.
- **Prérequis** : D02 ; lecture d'une multiplication avec une lettre, rappelée par un exemple numérique.
- **Couverture** : M2-ARI-BO-04, M2-ARI-BO-05, M2-ARI-BO-07.

### M2-ARI-D04 — Des lots vraiment identiques

- **Idée centrale** : une taille de lot compatible doit diviser chaque quantité à répartir.
- **Objectif observable** : traduire deux contraintes de partage en une condition de divisibilité commune et choisir une solution qui les satisfait.
- **Entrée prévue** : préparer des lots contenant les mêmes quantités de deux objets, sans reste.
- **Visualisation** : deux rangées de quantités et leurs regroupements ; listes courtes de diviseurs positifs.
- **Formalisation** : chaque quantité doit être divisible par le nombre de lots choisi.
- **Transfert prévu** : organisation de plusieurs catégories de participants. La notion de PGCD n'est pas exigée ; les données permettent une recherche courte.
- **Prérequis** : D02.
- **Couverture** : M2-ARI-BO-06.

### M2-ARI-D05 — Le maximum sans dépasser

- **Idée centrale** : trouver le dernier multiple autorisé sous une borne.
- **Objectif observable** : déterminer ce multiple et vérifier que le suivant dépasse la borne.
- **Entrée prévue** : acheter le maximum de packs identiques avec une réserve de crédits entière.
- **Visualisation** : multiples successifs sur une droite et borne visible.
- **Formalisation** : pour a > 0 et b ≥ 0 entiers, prendre le quotient entier q de b par a ; le résultat est a × q. Vérifier a × q ≤ b < a × (q + 1).
- **Transfert prévu** : capacité de stockage ou rangées complètes ; lecture puis complétion par boutons d'un court algorithme calculant ce résultat.
- **Prérequis** : D02 ; division avec quotient et reste, réactivée en situation. La division entière Python est expliquée si elle est utilisée.
- **Couverture** : M2-ARI-BO-06, M2-ARI-BO-12.

### M2-ARI-D06 — Même fraction, autres nombres

- **Idée centrale** : diviser numérateur et dénominateur par un même facteur non nul conserve la valeur.
- **Objectif observable** : choisir une transformation valide et écarter une modification de la seule partie haute ou basse.
- **Entrée prévue** : afficher une progression accomplie sous deux écritures fractionnaires équivalentes.
- **Visualisation** : une même barre partagée de deux façons, avec les facteurs indiqués.
- **Formalisation** : pour simplifier une fraction d'entiers, diviser ses deux termes par un même diviseur commun positif. Le dénominateur reste non nul.
- **Transfert prévu** : rapport de quantités ; mêmes valeurs avec des partitions différentes.
- **Prérequis** : D02 ; sens d'une fraction, réactivé par le visuel.
- **Couverture** : M2-ARI-BO-08, préparation nécessaire mais insuffisante sans D07.

### M2-ARI-D07 — Simplifiée jusqu'au bout ?

- **Idée centrale** : une fraction irréductible n'a plus de diviseur commun positif supérieur à un.
- **Objectif observable** : poursuivre une simplification et justifier son arrêt ; distinguer « simplifiée » et « irréductible ».
- **Entrée prévue** : comparer des affichages d'une même progression, dont un est simplifié mais encore réductible.
- **Visualisation** : diviseurs communs qui disparaissent au fil de la simplification.
- **Formalisation** : tester les diviseurs communs du numérateur et du dénominateur ; utiliser la valeur absolue du numérateur si celui-ci est négatif. Pour zéro, 0/1 est la forme normalisée proposée.
- **Transfert prévu** : fraction issue d'un partage ou d'un calcul simple ; données sans recherche interminable.
- **Prérequis** : D04, D06.
- **Couverture** : M2-ARI-BO-08.

### M2-ARI-D08 — Deux multiples, une preuve

- **Idée centrale** : expliquer pourquoi la somme de deux multiples d'un facteur fixé reste un multiple de ce facteur.
- **Objectif observable** : reconnaître puis compléter une preuve, avec un facteur numérique fixé et des multiplicateurs entiers quelconques.
- **Entrée prévue** : réunir deux réserves constituées de packs d'une même taille.
- **Visualisation** : regroupement de packs, puis facteur commun mis en évidence.
- **Formalisation prévue** : pour le facteur fixé 6, u = 6k et v = 6l donnent u + v = 6(k + l) ; k + l est entier. Les variantes pourront fixer d'autres facteurs numériques.
- **Transfert prévu** : départager un exemple numérique et une justification valable pour tous les multiples du facteur fixé.
- **Prérequis** : D02 ; distributivité et factorisation simple, issues du collège et réactivées par un exemple.
- **Couverture** : M2-ARI-BO-09.

### M2-ARI-D09 — Un carré impair, toujours ?

- **Idée centrale** : passer d'une conjecture sur quelques nombres à une preuve pour tous les entiers impairs.
- **Objectif observable** : suivre et compléter la preuve que le carré d'un impair est impair.
- **Entrée prévue** : observer des grilles carrées avec un côté de longueur impaire.
- **Visualisation** : carré décomposé en régions, puis correspondance avec l'expression algébrique.
- **Formalisation prévue** : n = 2k + 1 ; n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1 ; la quantité entre parenthèses est entière.
- **Transfert prévu** : choisir la justification générale et repérer pourquoi quelques essais ne suffisent pas. La preuve couvre aussi les entiers impairs négatifs.
- **Prérequis** : D03 ; identité (x + y)² et calcul littéral élémentaire. Si ces acquis manquent, prévoir un lien vers leur ressource d'algèbre avant ce Déclic ; ne pas les supposer maîtrisés à partir d'un quiz de parité.
- **Couverture** : M2-ARI-BO-10.

### M2-ARI-D10 — Le filtre anti-reste

- **Idée centrale** : automatiser la vérification d'une divisibilité par le reste.
- **Objectif observable** : prédire le résultat d'un test et compléter sa condition par sélection.
- **Entrée prévue** : un filtre vérifie automatiquement si une inscription permet des équipes complètes.
- **Visualisation** : entrée, quotient/reste, décision ; code très court expliqué.
- **Formalisation** : pour a ≥ 0 et b > 0 entiers, le test est vrai exactement lorsque le reste de a par b vaut zéro.
- **Transfert prévu** : choisir la bonne condition de code et prédire son résultat sur une entrée nouvelle. `%`, `==` et le booléen sont expliqués ; aucune saisie de code n'est demandée.
- **Prérequis** : D02 ; sens du reste, illustré avant l'activité.
- **Couverture** : M2-ARI-BO-11.

## 6. Registre des conceptions erronées

Les identifiants ci-dessous sont proposés. Avant intégration, Claude doit réutiliser tout identifiant équivalent déjà présent dans le dépôt plutôt que créer un doublon conceptuel.

| `misconceptionId` | Raisonnement à distinguer | Déclic de rencontre prévu |
|---|---|---|
| excludes_zero_from_naturals | Compter commence à un, donc zéro serait exclu de ℕ. | D01 |
| believes_positive_numbers_are_naturals | Être positif suffirait pour être naturel, même sans être entier. | D01 |
| believes_integers_are_only_negative | ℤ contiendrait seulement les entiers négatifs. | D01 |
| believes_decimal_notation_excludes_integer | Une virgule exclurait un nombre entier, même si 4,0 = 4. | D01 |
| confuses_element_set_symbols | Employer l'inclusion pour un nombre ou l'appartenance pour la relation ℕ/ℤ. | D01 |
| reverses_membership_direction | Inverser le nombre et l'ensemble dans une appartenance. | D01 |
| reverses_multiple_divisor_roles | Dire que 6 est multiple de 24 à partir de 24 = 6 × 4. | D02 |
| accepts_non_integer_multiplier | Un quotient décimal quelconque suffirait à établir la divisibilité. | D02, D10 |
| excludes_zero_as_multiple | Zéro ne pourrait être multiple d'un entier non nul. | D02, D10 |
| excludes_negative_multiples | Les multiples seraient uniquement positifs. | D02 |
| treats_zero_as_odd | Zéro serait impair ou sans parité. | D03 |
| believes_negative_integers_have_no_parity | Un entier négatif ne pourrait être pair ou impair. | D03 |
| swaps_even_odd_forms | Inverser les rôles des écritures 2k et 2k + 1. | D03, D09 |
| ignores_one_grouping_constraint | Vérifier le partage d'une seule des deux quantités. | D04 |
| confuses_common_divisor_with_common_multiple | Chercher un multiple commun pour répartir exactement des stocks existants. | D04 |
| rounds_up_bounded_multiple | Arrondir vers le haut et dépasser la limite. | D05 |
| confuses_integer_quotient_with_multiple | Donner le nombre de packs plutôt que la quantité totale constituée. | D05 |
| simplifies_only_one_fraction_term | Modifier le numérateur ou le dénominateur seul. | D06 |
| simplifies_fraction_by_subtraction | Soustraire la même quantité aux deux termes conserverait la valeur. | D06 |
| equates_simplified_with_irreducible | Une première simplification suffirait toujours. | D07 |
| confuses_common_with_individual_divisors | Exiger que chaque terme n'ait aucun diviseur, au lieu d'aucun diviseur commun > 1. | D07 |
| treats_examples_as_general_proof | Quelques essais prouveraient une propriété générale. | D08, D09 |
| loses_common_factor_in_sum | Additionner les multiplicateurs en oubliant le facteur commun. | D08 |
| squares_sum_termwise | Écrire (2k + 1)² = 4k² + 1 en omettant le terme croisé. | D09 |
| confuses_quotient_with_remainder | Tester le quotient au lieu du reste. | D10 |
| reverses_modulo_operands | Calculer b % a au lieu de a % b pour tester a multiple de b. | D10 |

## 7. Précisions mathématiques pour la rédaction

- Convention : 0 ∈ ℕ et ℕ ⊂ ℤ. Dire « entier positif ou nul » ou « zéro et entiers strictement positifs » sans ambiguïté.
- La valeur prime sur l'apparence : 4,0 = 4. Les nombres non entiers ne sont ni dans ℕ ni dans ℤ, sans être dépourvus d'autre famille numérique.
- Dans ℤ, a multiple de b signifie qu'un entier k vérifie a = bk. Les coefficients peuvent être négatifs ; les situations de partage utilisent seulement des quantités naturelles.
- Pour éviter les ambiguïtés autour de zéro, les tâches de diviseur, de quotient et de reste imposent un diviseur non nul. Chaque entier non nul divise zéro. Ne pas calculer une division ou un modulo par zéro. Le cas « multiple de zéro » ne donne pas lieu à une tâche de partage.
- Zéro est pair ; les entiers négatifs ont également une parité.
- Les listes de diviseurs utilisées pour les lots et les fractions sont des listes de diviseurs positifs.
- D04 donne la signification de la contrainte, pas une simple chasse à la réponse dans une liste.
- D08 ne remplace pas la preuve par des additions particulières. D09 ne remplace pas la preuve par plusieurs carrés calculés.
- Aucun exemple de fraction ne comporte un dénominateur nul. Le signe est traité sans changer la valeur.
- Une difficulté algébrique repérée dans D09 est distinguée d'une incompréhension de la parité.

## 8. Livraison après contrôle du plan

| Étape | Livrables envisagés | Condition |
|---|---|---|
| Plan | `00-chapitre.md` — présent document | Contrôle du périmètre, des identifiants et des prérequis par Claude. |
| Lot 1 | `D01.md` à `D03.md` et leurs decks Carré / Intox | Après retour sur le plan ; D01 est réécrit par ses identifiants existants. |
| Lot 2 | `D04.md` à `D07.md` et leurs decks | Après intégration du premier lot. |
| Lot 3 | `D08.md` à `D10.md` et leurs decks | Après intégration du deuxième lot. |
| Clôture | Deck de 30 cartes, bilan, entraînement A à D | Après les trois lots et contrôle des couvertures effectives. |

Pour chaque fiche Déclic : identité, cartes ordonnées, variantes, choix et feedbacks dans les deux tons, validation et score, résumé/menu, deck Carré / Intox. Les contenus seront entièrement rédigés, sans texte à compléter par l'intégrateur.

Les decks de révision utilisent une décision active avant correction : « Carré / Intox » porte sur une affirmation examinée, pas sur le simple souhait de passer à la carte suivante.

Répartition proposée du deck final de 30 cartes : D01 (3), D02 (4), D03 (4), D04 (3), D05 (3), D06 (3), D07 (3), D08 (2), D09 (3), D10 (2). Total : 30. Chaque carte interactive conservera ses variantes.

Entraînement prévu : A — reconnaissance et applications proches ; B — explications et transformations ; C — problèmes nouveaux et contraintes ; D — preuves et algorithmes guidés. Ces lettres sont des paliers de travail, pas des notes ou une certification de niveau.

## 9. Conservation des identifiants et historique

- Ne modifier aucun identifiant déjà livré ou publié, y compris lors d'une réécriture de D01.
- Les identifiants D02 à D10 de ce plan sont des propositions à confronter à l'inventaire du dépôt. Si un identifiant désigne déjà un autre contenu, préserver son sens et attribuer un identifiant neuf au contenu ajouté. L'ordre pédagogique ne doit pas dépendre d'une renumérotation.
- Ne pas réutiliser l'identifiant d'une carte supprimée. Une carte nouvelle reçoit un identifiant inédit ; une carte réécrite garde le sien.
- Réutiliser les identifiants d'exigences et d'erreurs existants lorsqu'ils désignent le même attendu ; conserver un mapping en cas d'alias nécessaires.
- La version `0.1.0` est celle du plan. La version des Déclics existants est à lire dans le dépôt puis à augmenter selon sa convention ; elle n'est pas remise à zéro.
- Les corrections futures seront données par identifiant de carte et consignées dans `corrections.md` lors de l'intégration.

## 10. Contrôle effectué et retour attendu

Contrôle éditorial local : les douze exigences listées ont un emplacement prévu ; les vingt-six conceptions erronées ont au moins un Déclic de rencontre ; les dépendances internes respectent l'ordre proposé. D09 comporte un prérequis d'algèbre externe explicitement signalé.

Ce contrôle établit une **couverture prévue**, pas une couverture effectivement enseignée ou une validation institutionnelle. Les cartes, leurs variantes et le niveau d'autonomie seront contrôlés lors des prochaines livraisons.

Contrôle technique non effectué : `npm run course:check`, tests, lint et build ne sont pas exécutables ici sans le dépôt. Aucun fichier de cours existant n'a été remplacé et aucun push n'a été effectué.

Message à transmettre avec cette fiche :

> Plan M2-ARI prêt pour contrôle. Vérifie la couverture de la rubrique Arithmétique du BO 2026, l'unicité des idées, les prérequis et les erreurs suivies. Vérifie aussi les identifiants déjà présents avant de réserver D02 à D10. Renvoie les écarts éventuels et le modèle exact avant la rédaction du lot D01 à D03.

Fichiers à fournir pour les lots suivants : `BRIEF_TEMPLATE.md` ; si une livraison JSON directe est souhaitée, `types.ts` et le fichier JSON actuel de `M2-ARI-D01`, avec l'inventaire du chapitre. Aucun importeur nouveau n'est nécessaire pour rédiger le contenu.
