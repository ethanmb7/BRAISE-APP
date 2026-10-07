# Règles d'interface de BRAISE

Ces règles tiennent l'application cohérente d'un écran à l'autre. Elles sont vérifiées à la main sur les
écrans réels (390 px de large) et, quand c'est possible, par un test.

## Un seul style

Toute carte, groupe de lignes ou contrôle porte le même habit : **contour épais de 2,5 à 3 px en
`--neo-ink`**, **ombre dure décalée** (`3px 3px 0`), aplats saturés. Pas de filet gris fin, pas d'ombre
douce. Le style illustré de la carte des cours (îles, mondes) ne sert qu'à **naviguer** ; à l'intérieur
d'un Déclic ou d'une carte de révision, rien de décoratif ne détourne l'attention.

## Un seul en-tête par écran principal

Un écran principal (Aura, Moi, « Où on va ? ») s'ouvre sur `PageHeader` : le nom de l'espace en petites
lettres orange, puis le titre de la page. **Pas de bouton retour** : il n'y a nulle part où retourner. Un
écran ouvert depuis un autre (Paramètres, une matière, un cours) utilise `TopBar` avec son retour.

## Planchers

- **Zone tactile : 44 × 44 px minimum.** Si le dessin est plus petit, on élargit la zone de pression sans
  changer l'apparence (`::after` avec `inset` négatif).
- **Texte : 11,2 px (0,7 rem) minimum.** Les petites étiquettes en capitales n'y échappent pas.
- Tout ce qui est pressable a un nom pour les lecteurs d'écran et un cadre de focus visible.
- Aucun mouvement forcé : les animations s'arrêtent avec « réduire les animations » et le mode dyslexie.

## Un mot, un sens

| Mot            | Sens                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| Aura           | la page de progression (et son nom d'onglet)                                           |
| Rang           | le niveau : Bronze, Argent, Or, Platine, Légende. Braise change de forme à chaque rang |
| Déclic         | un mini-cours raconté par Braise                                                       |
| Pioche du jour | la révision du jour choisie par Braise                                                 |
| Carré ou Intox | vrai ou faux, en un swipe                                                              |
| À rafraîchir   | une notion qui revient avant d'être oubliée                                            |

Chaque mot est expliqué dans `src/lib/glossary.ts`, ouvert depuis le « ? » de la Pioche, depuis Moi
(« Le lexique de Braise ») et par une astuce au premier Déclic. Un seul mot par chose : pas de « Pass
BRAISE » ni de noms de formes qui doublent les rangs. Jamais de « classement » entre élèves.

## Le ton ne fait pas peur

Une notion « à rafraîchir » n'est jamais « en retard ». Un rappel est une invitation, jamais une alarme
ni un compte à rebours.

## La navigation

Quatre espaces (Aujourd'hui, Réviser, Aura, Moi), décision du porteur du projet (voir
`PRODUCT_VISION.md`). Les cours sont atteints depuis Aujourd'hui par « Tes cours » puis « Où on va ? ».
