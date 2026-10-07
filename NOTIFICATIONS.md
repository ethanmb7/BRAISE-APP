# Les rappels de Braise

Braise passe voir l'élève de temps en temps. Elle n'est pas une alarme. Ce document dit ce qu'elle envoie,
quand, et surtout ce qu'elle ne fera jamais. Le code est dans `src/lib/notifications/`.

## Ce que cherche BRAISE, et ce que ça impose

| Ce que cherche l'app                        | Ce que ça impose aux rappels                                                                                                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Revoir une notion juste avant de l'oublier  | Un rappel n'existe que s'il y a **quelque chose de vrai** à rafraîchir, calculé sur l'appareil à partir des dates de rappel déjà dans l'app. Jamais « pour faire du bruit ». |
| Aucune pression, aucune culpabilité         | Pas de « tu vas perdre ta série », pas de jours d'absence comptés, pas de « retard ». On invite, on ne menace pas.                                                           |
| Un pote, pas une alarme                     | Le ton est celui de Braise (Chill ou Savage) : les faits sont identiques, seule la voix change. Le second degré ne vise jamais l'élève.                                      |
| L'élève décide                              | Rien ne part sans son accord. Il choisit **son moment** et **son rythme**, et peut tout couper en un tap.                                                                    |
| Un lycéen reçoit déjà trop de notifications | **Une par jour au plus**, jamais la nuit, et Braise se tait toute seule si on ne lui répond pas.                                                                             |
| Pas de serveur                              | Tout se calcule et se planifie **sur le téléphone**. Rien n'est envoyé nulle part.                                                                                           |

## Ce que Braise envoie (trois sortes, pas plus)

1. **Rappel** : « 2 notions à rafraîchir : 2 minutes, quand tu veux. » Il part quand au moins deux notions
   sont dues au moment choisi. Il nomme un vrai sujet.
2. **Suite d'un Déclic** : le lendemain d'un Déclic, « Je te remontre « Ça tombe pile » : 3 cartes, 2
   minutes. » Elle tient la promesse faite à la fin du Déclic. Une seule fois par Déclic.
3. **Retrouvailles** : après quelques jours sans venir, un message chaleureux qui ne parle **jamais** de
   l'absence, puis un second bien plus tard, puis rien tant que l'élève n'est pas revenu.

Rien d'autre : pas de « nouveau cours », pas d'invitation à partager, pas de félicitations par notification
(les célébrations vivent dans l'app).

## Les règles qui ne bougent pas

- **Jamais avant 7 h ni après 21 h 30**, quoi que l'élève choisisse.
- **Une notification par jour au plus.** Un écart minimum entre deux, selon le rythme choisi :
  Tranquille (2 par semaine au plus, 4 jours d'écart), Régulier (4 par semaine, 2 jours), À fond (7 par
  semaine, 1 jour). Le rythme par défaut reprend celui choisi à l'onboarding.
- **Trois sans réponse, et Braise se tait.** Une notification est « répondue » si l'élève ouvre l'app dans
  les 24 h. Après trois sans réponse, plus rien n'est planifié et, à la prochaine ouverture, Braise
  demande : « Je me suis faite discrète. Tu veux que je revienne, moins souvent ? »
- **Zéro culpabilité.** Un test échoue si un message contient « retard », « perdu », « échec », « série »,
  « vite », « urgent » ou nomme une absence.
- **Mêmes faits dans les deux tons.** Chill et Savage disent la même chose (les mêmes nombres, les mêmes
  noms) ; un test le vérifie.
- **Transparent.** L'élève voit à l'avance les messages de sa semaine (Paramètres › Braise passe te voir),
  et peut en tester un.

## Comment c'est planifié

À chaque ouverture de l'app (et quand la progression change), l'app recalcule le plan des 14 prochains
jours et le remet à l'appareil. Si l'élève revient avant l'heure d'un message, le plan est refait : un
rappel pour des notions déjà révisées ne part donc jamais.

## Ce qui est construit, et ce qui attend

- **Construit et testé** : le modèle (qui, quand, quoi, et les règles ci-dessus), les textes dans les deux
  tons, le choix du moment et du rythme, l'invitation, le frein automatique, l'aperçu de la semaine.
- **Attend l'enveloppe native** : la livraison réelle d'une notification quand l'app est fermée. Dans le
  navigateur, rien ne peut être planifié à l'avance. Le code de livraison (`delivery.ts`) est prêt à
  recevoir les notifications locales d'une enveloppe native ; **à vérifier lors de sa mise en place**
  (permissions Android 13, alarmes exactes Android 12, limites d'iOS).

## Ce que disent les études, et leurs limites

Les effets de rappels bien faits sont **modestes** (de l'ordre de quelques points) ; le cadrage « perte » ou
« gain » compte très peu ; un langage qui laisse le choix vaut mieux qu'un langage qui presse ; les
adolescents reçoivent déjà beaucoup de notifications. Aucune étude trouvée ne porte sur les rappels d'une
appli de révision pour lycéens. **Ce modèle est une hypothèse à tester** avec de vrais lycéens : taux
d'acceptation, d'ouverture, de désactivation, retour à 7 jours, contre un groupe sans rappel.
