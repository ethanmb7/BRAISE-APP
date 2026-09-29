# BRAISE — Vision produit et architecture de l'expérience

## 1. Décision fondatrice

BRAISE n'est pas une application scolaire rendue plus ludique. C'est un compagnon qui aide un
élève à comprendre un cours comme il le ferait dans une conversation avec une personne de
confiance : sans jugement, sans récitation et sans surcharge.

> **Promesse : tes cours, enfin expliqués comme par un pote.**

Le moment signature n'est ni le gain d'XP ni le swipe. C'est le passage de « je ne comprends pas »
à « ah oui, j'ai capté » après une explication adaptée et une reformulation de l'élève — BRAISE
nomme ce moment **le Déclic** (voir la boucle complète, section 4).

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

### Apprendre — la conversation guidée « Le Déclic »

Le trou identifié dans le parcours actuel (le « moment Eureka ») n'est plus une piste ouverte :
c'est la boucle **Le Déclic**, détaillée section 4, validée comme méthode d'apprentissage
principale de BRAISE. Construite et déployée sur les 6 matières : elle vit à l'intérieur du
parcours de leçon existant (`LessonView`), en remplacement de l'ancien Vocal Animé pour les
chapitres qui ont un script Déclic — pas un cinquième onglet, pas un remplacement d'Aura.

## 4. Boucle centrale « Le Déclic »

Le principe fondamental : BRAISE ne cherche pas seulement à savoir si une réponse est juste. Elle
cherche à faire comprendre — jamais en donnant la règle avant que l'élève ait dû se positionner
dessus. Une notion est une chaîne de petites cartes plein écran, jamais une page de cours suivie
d'un quiz : un seul tap, ou une courte phrase, entre deux battements. Elle dure 1 à 3 minutes.

1. **Situation** — Braise plante un décor concret, en une phrase.
2. **Choix** — avant toute explication, l'élève doit se positionner (2-3 options en tap). Braise
   réagit réellement à son choix, jamais un simple « faux ». Ce cycle situation/choix peut se
   répéter une ou deux fois pour complexifier le cas avant la révélation.
3. **Révélation** — le nom ou la règle n'apparaît qu'une fois l'idée déjà construite par les
   cartes précédentes.
4. **Reformulation** — l'élève réexplique avec ses propres mots. La seule étape conservée de
   l'ancienne méthode (diagnostic/explication/vérification) : c'est une vraie preuve de
   compréhension, un tap n'en est pas une. La phrase est conservée (« la mémoire du Déclic »,
   ci-dessous).
5. **À toi** — une situation nouvelle, différente de la première, vérifie que l'élève sait
   réutiliser l'idée ailleurs, pas seulement redire la définition qu'on vient de lui donner.
6. **Le Déclic** 🔥 — le moment où l'élève passe de « je ne comprends pas » à « ah oui, j'ai
   capté ». Carte plein écran, même poids théâtral quelle que soit la notion. C'est la récompense
   principale de BRAISE ; XP et badges peuvent l'accompagner, jamais la remplacer.
7. **Fiche** — « Ce que ton prof attend de toi » : titre, à retenir, piège éventuel. Le pont entre
   « j'ai compris » et « je sais l'écrire au contrôle » — toujours la dernière carte.

Terminer un Déclic déclenche ensuite une première révision « sûr » sur la carte de révision
associée à la notion : la consolidation se fait sur le même moteur de répétition espacée que
Réviser (SM-2), jamais un second système parallèle.

### Contenu : écrit à l'avance, jamais improvisé

Chaque notion est un fichier texte dans `src/content/declic/` (voir son README), écrit et validé
à l'avance — jamais généré à la volée par l'IA, pour la même raison que la génération non validée
est exclue en section 9 : une situation ou une explication fausse ne doit jamais atteindre un
élève sans relecture humaine. `npm run declic:check` valide la structure de chaque fichier avant
qu'il n'atteigne la production. C'est la décision qui, plus tôt, restait « à trancher » sur
l'origine des explications alternatives — tranchée dans ce sens.

### La mémoire du Déclic

Pour chaque notion et chaque élève, BRAISE conserve la dernière reformulation donnée (stockage
local, `sapie_declic_memory`) — un compagnon qui se souvient, pas un historique affiché tel quel.
**Non construit** : s'appuyer sur cette mémoire pour personnaliser une notion qui redevient floue
plus tard (« tu te rappelles notre histoire avec les pizzas ? »).

### Si l'explication ne suffit pas

Construit : une option de carte Choix peut porter une explication alternative (`altExplanation`,
`~ <texte>` dans le format `.txt`), jamais surfacée automatiquement. Un lien discret « J'ai
toujours pas compris » apparaît à côté de « Suite » seulement quand l'option choisie en a une ;
il disparaît une fois utilisé, pour éviter d'enchaîner les tentatives à l'infini. Volontairement
limité : pas de nouvelle carte, pas de deuxième tentative sur la bonne réponse, et seulement là
où un auteur a écrit une explication vraiment différente — jamais un filler générique. Encore
non construit : une vraie relance après cette deuxième explication si elle non plus ne suffit
pas ; à réévaluer une fois qu'un vrai chapitre aura tourné avec de vrais élèves.

### Pistes futures pour approfondir le format (non construites)

Une refonte plus ambitieuse a été étudiée : transformer chaque notion en « épisode » de 4-8
minutes avec un déroulé enrichi (accroche → prise de position → réaction → découverte → déclic →
nom du cours → à toi → conclusion), plusieurs épisodes par chapitre se terminant par un « Boss »
qui mélange les notions, des écrans centraux plus riches (graphique, formule, animation) plutôt
que uniquement des bulles de texte, et le swipe comme geste secondaire au tap.

Décision : ne pas construire maintenant. Le format actuel vient tout juste d'être étendu aux 6
matières et n'a encore été testé par aucun vrai élève sur un chapitre complet — multiplier le
contenu par 4-5 avant cette validation serait prématuré. Enrichir les visuels par écran contredit
aussi une discipline déjà validée par les tests m1/h1 : une coquille partagée + un widget
optionnel (comme la frise chronologique) suffit ; inventer une interface par notion recrée le
problème déjà écarté plus tôt. À réévaluer une fois qu'un chapitre complet aura tourné avec de
vrais élèves.

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
- la conversation guidée « Le Déclic » (sections 3 et 4), quand elle sera construite, vit comme
  un mode à l'intérieur de cet espace, pas comme un onglet séparé.

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
Finir un chapitre ne signifie pas automatiquement le maîtriser. Ces cinq états sont les jalons
mêmes de la boucle « Le Déclic » (section 4) : le Déclic amène « comprise avec aide », le retrait
progressif de l'aide mène à « comprise seul », la consolidation différée à « consolidée ».

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

« Navigation persistante » ci-dessus désigne les quatre onglets de la section 3 (Aujourd'hui,
Réviser, Aura, Moi) — pas une cinquième destination à inventer.
