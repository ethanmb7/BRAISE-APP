# BRAISE — Vision produit et architecture de l'expérience

## 1. Décision fondatrice

BRAISE n'est pas une application scolaire rendue plus ludique. C'est un compagnon qui aide un
élève à comprendre un cours comme il le ferait dans une conversation avec une personne de
confiance : sans jugement, sans récitation et sans surcharge.

> **Promesse : tes cours, enfin expliqués comme par un pote.**

Le moment signature n'est ni le gain d'XP ni le swipe. C'est le passage de « je ne comprends pas »
à « ah oui, j'ai capté » après une explication adaptée et une reformulation de l'élève.

## 2. Comité produit simulé

Cette architecture rassemble les points de vue nécessaires avant toute nouvelle refonte d'écran :

- **Direction produit** : une action principale évidente et une boucle propriétaire ;
- **Product design mobile** : quatre espaces stables, peu de décisions et une hiérarchie calme ;
- **Sciences cognitives** : rappel actif, reformulation et consolidation espacée ;
- **Pédagogie** : contenu exact, progressif et validé par notion ;
- **Accessibilité DYS/TDAH** : une idée et une consigne à la fois, aucune vitesse imposée ;
- **Direction éditoriale** : langage naturel, durable et jamais humiliant ;
- **Ingénierie** : moteur pédagogique structuré, IA côté serveur et fonctionnement résilient ;
- **Data produit** : mesurer la compréhension différée, pas seulement le temps passé ;
- **Protection des mineurs** : collecte minimale, sécurité et absence de mécanique culpabilisante.

## 3. Architecture cible

La navigation principale comporte quatre espaces.

### Aujourd'hui

Le point d'entrée quotidien. L'écran ne montre que :

1. la prochaine action recommandée ;
2. la Pioche du Jour, proposition secondaire courte ;
3. le rythme du jour ;
4. une reprise simple si l'élève revient après une absence.

### Apprendre

Le cœur propriétaire de BRAISE. Une conversation guidée part de ce que l'élève pense avoir
compris, détecte le blocage, explique autrement, puis lui demande de reformuler.

### Réviser

Un outil complémentaire : revoir ses erreurs, consolider les notions dues ou choisir une matière.
Le swipe est un mode de rappel actif, pas la méthode principale.

### Moi

Le profil rassemble progression, Aura, rang, préférences, accessibilité et identité. « Aura » ne
doit plus être une destination concurrente du parcours d'apprentissage.

## 4. Boucle centrale « Capte » (nom de travail)

Une session dure de 90 secondes à 5 minutes.

1. **Accroche** — Braise pose une question courte sur une seule idée.
2. **Positionnement** — l'élève répond, hésite ou choisit explicitement « Je ne sais pas ».
3. **Diagnostic** — BRAISE identifie la confusion probable, sans afficher une sanction.
4. **Explication** — une formulation courte, un mot-clé et un exemple concret.
5. **Choix d'aide** — « Plus simple », « Un exemple », « Lis-le », « Pourquoi ? ».
6. **Reformulation** — l'élève explique avec ses mots, oralement ou par écrit.
7. **Validation** — Braise reconnaît l'idée comprise et corrige seulement ce qui reste flou.
8. **Ancrage** — une micro-question vérifie immédiatement la compréhension.
9. **Consolidation** — la notion revient plus tard selon la confiance et les aides utilisées.

L'IA adapte la formulation mais ne décide pas seule de la vérité pédagogique. Chaque notion
possède un objectif, des confusions fréquentes, des exemples, des formulations acceptables et une
question de vérification validés éditorialement.

## 5. Carte complète des écrans

### Premier lancement

- Démonstration immédiate du moment « j'ai compris » avant la création de compte ;
- choix du niveau, des matières et de la durée habituelle ;
- choix du ton de Braise ;
- réglages de lecture proposés sans étiqueter l'élève ;
- première mission terminée en moins de deux minutes.

### Aujourd'hui

- salutation discrète et reprise de contexte ;
- carte principale « Continuer mon parcours » ;
- Pioche du Jour compacte ;
- progression du jour ;
- aucune grille de tableaux de bord au-dessus de l'action principale.

### Apprendre

- une bulle ou une idée à la fois ;
- réponses rapides toujours disponibles ;
- saisie texte et voix optionnelles ;
- bouton permanent « Explique autrement » ;
- transcript et lecture audio ;
- aucune limite de temps par défaut.

### Réviser

- « À consolider » en premier ;
- « Revoir mes erreurs » ;
- « Choisir une matière » ;
- session courte annoncée avant de commencer ;
- feedback explicatif après chaque décision.

### Résultat

Ordre obligatoire :

1. ce qui est maintenant compris ;
2. ce qui reste fragile ;
3. ce que BRAISE reproposera ;
4. récompenses et série seulement ensuite.

### Moi

- progression par notions ;
- mémoire consolidée dans le temps ;
- Aura, rang et cosmétiques ;
- ton de Braise ;
- préférences de lecture, audio et mouvement ;
- données, confidentialité et compte.

## 6. Système d'interface

### Trois niveaux de surface

- **Primaire** : une seule surface forte par écran, réservée à l'action principale ;
- **Secondaire** : papier, bordure légère et contenu complémentaire ;
- **Discrète** : information sans ombre ni contour lourd.

Le néobrutalisme reste une signature, pas une règle appliquée à chaque boîte. Une ombre dure doit
signifier « tu peux agir », et non simplement décorer.

### Règles de densité

- une action principale visible sans faire défiler ;
- une seule idée ou consigne par étape ;
- trois niveaux typographiques maximum sur une carte ;
- aucune animation continue près d'un texte à lire ;
- célébrations brèves et réservées aux progrès réels ;
- durée, quantité et récompense toujours issues de vraies données.

### Langage

Deux tons peuvent changer l'énergie, jamais la bienveillance ou la précision :

- **Pote chill** : rassurant, direct et complice ;
- **Coach énergie** : rythmé et fier, mais ne taquine que le piège.

Sont interdits : moquerie sur l'intelligence, infantilisation, culpabilisation liée à une absence,
pression par la série et expressions adolescentes artificielles.

## 7. Personnalisation inclusive

Les réglages utiles sont accessibles à tous :

- taille et densité du texte ;
- interligne et largeur de lecture ;
- réduction des animations ;
- contraste ;
- lecture audio et vitesse ;
- texte court, normal ou détaillé ;
- réponse au toucher, au clavier, à la voix ou par swipe ;
- durée de session souhaitée.

Une action essentielle ne dépend jamais uniquement d'un geste, d'une couleur, du son ou de la
vitesse de lecture.

## 8. Progression et métrique principale

Une notion suit cinq états : découverte, en cours, comprise avec aide, comprise seul, consolidée.
Finir un chapitre ne signifie pas automatiquement le maîtriser.

La métrique principale de BRAISE est :

> **le nombre de notions comprises puis retrouvées sans aide quelques jours plus tard.**

Les métriques secondaires mesurent la réussite après reformulation, les aides nécessaires, la
confiance, les retours après absence et le sentiment « j'ai compris ». Le temps passé et les XP ne
sont pas des preuves d'apprentissage.

## 9. Ce que nous ne construisons pas maintenant

- classement mondial ;
- réseau social ;
- grande boutique ou plusieurs monnaies ;
- génération automatique non validée de cours ;
- multiplication des types de quiz ;
- nouvelles animations avant validation du parcours central.

## 10. Méthode de conception

Chaque parcours suit le même cycle :

1. prototype cliquable ;
2. test sans explication avec 5 à 8 élèves ;
3. inclusion de profils dyslexiques, TDAH, anxieux et de niveaux scolaires variés ;
4. mesure de la compréhension immédiate et différée ;
5. correction éditoriale et ergonomique ;
6. implémentation ;
7. contrôle accessibilité, performance et données réelles.

Une fonctionnalité n'entre dans le produit que si l'élève comprend son action en moins de trois
secondes et si elle rapproche réellement du moment « maintenant, j'ai compris ».

