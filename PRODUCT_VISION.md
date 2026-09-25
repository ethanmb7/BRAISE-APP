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

La navigation principale comporte quatre espaces : **Aujourd'hui, Réviser, Aura, Moi.** Cette
liste (et l'ordre Aujourd'hui → Réviser → Aura → Moi) est une décision produit tranchée
directement par le porteur du projet, pas une proposition à réévaluer à chaque itération —
toute future refonte de la navigation doit partir de ces quatre espaces, jamais les remplacer
par un cinquième (« Matières », « Apprendre » ou autre) sans que ce document soit d'abord
corrigé à la main par le porteur du projet lui-même.

### Aujourd'hui

Le point d'entrée quotidien. L'écran ne montre que :

1. la prochaine action recommandée ;
2. la Pioche du Jour, proposition secondaire courte ;
3. le rythme du jour ;
4. une reprise simple si l'élève revient après une absence.

### Réviser

Un outil complémentaire : revoir ses erreurs, consolider les notions dues ou choisir une matière.
Le swipe est un mode de rappel actif, pas la méthode principale.

### Aura

**Une destination principale à part entière, pas un sous-écran de Moi.** C'est la preuve de
progrès et le pilier d'identité de BRAISE — rangs, série, notions maîtrisées par matière, badges
réels et prochain palier. Aucune donnée inventée, jamais de classement entre élèves.

### Moi

Identité, préférences (ton de Braise, matières favorites), accessibilité et réglages. Édition,
pas consultation de la progression — Aura reste l'endroit où on va pour voir son parcours.

### Idée non tranchée : une conversation guidée de type « Apprendre »

Un mode conversationnel où BRAISE part de ce que l'élève pense avoir compris, détecte le
blocage, explique autrement puis demande une reformulation, correspond au vrai trou identifié
dans le parcours actuel (le « moment Eureka »). C'est une piste sérieuse — mais une
fonctionnalité à l'intérieur d'un espace existant (probablement Réviser), pas un cinquième
onglet, et pas un remplacement d'Aura ou de la navigation validée ci-dessus.

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

### Réviser

- « À consolider » en premier ;
- « Revoir mes erreurs » ;
- « Choisir une matière » ;
- session courte annoncée avant de commencer ;
- feedback explicatif après chaque décision ;
- future piste « Apprendre » (voir section 3) : une conversation guidée, si elle se construit un
  jour, vit comme un mode à l'intérieur de cet espace, pas comme un onglet séparé.

### Résultat

Ordre obligatoire :

1. ce qui est maintenant compris ;
2. ce qui reste fragile ;
3. ce que BRAISE reproposera ;
4. récompenses et série seulement ensuite.

### Aura

- rangs, série et notions maîtrisées par matière ;
- badges réels (jamais un compteur inventé) et prochain palier une fois le rang maximum atteint ;
- observation personnalisée tirée du vrai historique de révision ;
- le partage de son parcours vit ici, nulle part ailleurs.

### Moi

- identité (avatar, prénom) ;
- ton de Braise, matières favorites ;
- préférences de lecture, audio et mouvement ;
- données, confidentialité et compte ;
- lien vers Aura pour la progression — jamais dupliquée ici.

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

## 11. Réunion architecture fonctionnelle — décisions

L'accueil n'est pas un tableau de bord. Il montre la meilleure action disponible, puis donne accès
au reste sans répéter les mêmes informations.

### Placement de chaque fonction

codex/analyser-l-application-pour-ameliorer-l-education-yelgdt
=======
codex/analyser-l-application-pour-ameliorer-l-education-f1gxx5
main
| Fonction                     | Lieu principal      | Rappel autorisé sur Aujourd'hui                |
| ---------------------------- | ------------------- | ---------------------------------------------- |
| Activité en cours            | Matière ou activité | Carte prioritaire « Reprendre »                |
| Pioche du Jour               | Aujourd'hui         | Carte compacte si rien n'est en cours          |
| Objectif quotidien           | Aujourd'hui         | Ligne de progression légère                    |
| Notions dues                 | Réviser             | Une relance « À consolider » si nécessaire     |
| Matières et chapitres        | Apprendre           | Aperçu limité et accès « Tout voir »           |
| Série                        | Moi                 | Compteur compact dans l'en-tête                |
| Aura et rang                 | Moi                 | Résumé discret lié au profil                   |
| Joker de série               | Moi > Série         | Seulement lorsqu'il est consommé ou nécessaire |
| Badges et apparences         | Moi                 | Célébration au déblocage                       |
| Préférences et accessibilité | Moi > Mon confort   | Aucun raccourci permanent sur l'accueil        |
| Partage                      | Résultat ou Moi     | Jamais comme action concurrente sur l'accueil  |
codex/analyser-l-application-pour-ameliorer-l-education-yelgdt
=======
=======
| Fonction | Lieu principal | Rappel autorisé sur Aujourd'hui |
| --- | --- | --- |
| Activité en cours | Matière ou activité | Carte prioritaire « Reprendre » |
| Pioche du Jour | Aujourd'hui | Carte compacte si rien n'est en cours |
| Objectif quotidien | Aujourd'hui | Ligne de progression légère |
| Notions dues | Réviser | Une relance « À consolider » si nécessaire |
| Matières et chapitres | Aujourd'hui (aperçu) | Aperçu limité et accès « Tout voir » |
| Série | Aura | Compteur compact dans l'en-tête |
| Aura et rang | Aura | Destination principale, jamais un sous-écran de Moi |
| Joker de série | Moi > Série | Seulement lorsqu'il est consommé ou nécessaire |
| Badges et apparences | Moi | Célébration au déblocage |
| Préférences et accessibilité | Moi > Mon confort | Aucun raccourci permanent sur l'accueil |
| Partage | Résultat ou Moi | Jamais comme action concurrente sur l'accueil |
main
main

### Priorité contextuelle d'Aujourd'hui

Une seule carte domine selon cet ordre :

1. activité déjà commencée ;
2. consolidation arrivée à échéance ;
3. Pioche du Jour ;
4. découverte d'une matière.

Les autres propositions restent dans leur espace dédié. Elles ne sont pas empilées sous forme de
plusieurs grandes cartes concurrentes.

### Fonctions à inventer avant d'élargir le catalogue

- **Reprendre** : restaurer exactement une activité interrompue ;
- **À consolider** : réunir les notions réellement arrivées à échéance ;
- **Objectif flexible** : léger, normal ou intense, sans pression temporelle ;
- **Favoris** : conserver une explication, une astuce ou une notion ;
- **Recherche** : retrouver une notion, un chapitre ou une matière ;
- **Mon confort** : texte, audio, mouvement, contraste, durée et ton de Braise ;
- **Mon activité** : historique utile des acquis et prochaines consolidations ;
- **Échéances** : préparer un contrôle uniquement lorsque de vraies dates sont renseignées.

### Accueil validé pour la prochaine itération

1. en-tête compact : avatar, prénom, série et résumé de progression ;
2. prochaine action contextuelle ;
3. progression quotidienne légère ;
4. une relance utile au maximum ;
5. aperçu des matières ;
6. navigation persistante.

Le joker, le bouton Réviser, les réglages et les statistiques détaillées ne vivent plus dans le
HUD. La Pioche conserve Braise à 88 px mais place matière, titre, durée, volume et CTA dans une
composition horizontale compacte.
codex/analyser-l-application-pour-ameliorer-l-education-yelgdt
=======
codex/analyser-l-application-pour-ameliorer-l-education-f1gxx5
=======

« Navigation persistante » ci-dessus désigne les quatre onglets de la section 3 (Aujourd'hui,
Réviser, Aura, Moi) — pas une cinquième destination à inventer.
main
main
