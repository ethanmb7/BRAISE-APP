# Règles d'interface de BRAISE

Ces règles tiennent l'application cohérente d'un écran à l'autre. Elles sont vérifiées à la main sur les
écrans réels (390 px de large) et, quand c'est possible, par un test.

## Un seul style

Toute carte, groupe de lignes ou contrôle porte le même habit : **contour épais de 2,5 à 3 px en
`--neo-ink`**, **ombre dure décalée** (`3px 3px 0`), aplats saturés. Pas de filet gris fin, pas d'ombre
douce. Le style illustré de la carte des cours (îles, mondes) ne sert qu'à **naviguer** ; à l'intérieur
d'un Déclic ou d'une carte de révision, rien de décoratif ne détourne l'attention.

**La hiérarchie vient du poids, pas de l'absence d'habit** (c'est la règle qui fait foi, la vision
produit s'y aligne) : une seule surface en couleur pleine par écran, les cartes secondaires gardent le
même contour et la même ombre en étant plus petites et sans couleur pleine. Ce qui dit « tu peux agir »
est le geste : un objet qu'on touche s'enfonce de la hauteur de son ombre.

## Un seul en-tête par écran principal

Un écran principal (Aura, Moi, « Où on va ? ») s'ouvre sur `PageHeader` : le nom de l'espace en petites
lettres orange, puis le titre de la page. **Pas de bouton retour** : il n'y a nulle part où retourner. Un
écran ouvert depuis un autre (Paramètres, une matière, un cours) utilise `TopBar` avec son retour.

## Planchers

- **Zone tactile : 44 × 44 px minimum.** Si le dessin est plus petit, on élargit la zone de pression sans
  changer l'apparence (`::after` avec `inset` négatif).
- **Texte : 11,2 px (0,7 rem) minimum.** Les petites étiquettes en capitales n'y échappent pas.
- Tout ce qui est pressable a un nom pour les lecteurs d'écran et un cadre de focus visible.
- Aucun mouvement forcé : les animations s'arrêtent avec « réduire les animations » et le mode dyslexie
  (les confettis aussi : c'est un canvas, il le demande lui-même). Les vibrations suivent leur propre
  réglage et « réduire les animations » du téléphone.
- **Contraste** : 4,5:1 au moins pour un texte (3:1 pour un grand texte, de 24 px, ou 18,7 px en gras,
  et pour une icône). Voir la section suivante.

## Contraste

L'orange vif de la marque (`--neo-orange`, #ff4500) ne passe pas 4,5:1 : 3,4:1 avec du blanc, 3,2:1 sur
le crème. Il sert donc aux **formes** (cartes, onglet actif, planètes, halos, icônes) et jamais à un petit
texte. Les mots et les boutons utilisent le même orange rendu juste assez profond :

| Jeton                           | Sert à                                                | Mesure                                                                                         |
| ------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `--orange-fill` + `--on-orange` | un bouton plein à étiquette blanche                   | 5,1:1                                                                                          |
| `--orange-text`                 | un mot orange sur une surface (surtitre, petit titre) | 5,4:1 sur le crème, 5,6:1 sur la carte, 4,8:1 sur le halo orange ; mode sombre : 5,7:1 et plus |
| texte encre sur `--neo-orange`  | la carte Pioche, l'onglet actif                       | 5,2:1                                                                                          |

Sur la couleur d'une matière (un en-tête teinté en bleu, violet…), le surtitre prend encore plus d'encre.
Une règle : un texte à couleur fixe ne se pose jamais sur une surface qui suit le thème (et
inversement), car le mode sombre inverse l'une et pas l'autre. `contrast.test.ts` lit les jetons dans
`braise.css`, calcule les ratios et refuse une règle qui remet du blanc sur l'orange vif ; `npm run
audit:contrast` mesure l'application réelle (clair et sombre) et sort en erreur s'il reste un texte
sous le seuil.

## Son et vibration

Un son et une vibration vont ensemble et disent la même chose que l'écran. Tout est dans une table
(`CUES`, `src/lib/sound.ts`) pour qu'un test puisse la regarder en entier.

| Signal                                     | Quand                                                                 | Son                                        | Vibration          |
| ------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------ | ------------------ |
| `tap`                                      | un appui                                                              | un « tic »                                 | 8 ms               |
| `correct`                                  | la réponse attendue                                                   | trois notes qui montent                    | 10-30-10 ms        |
| `soft`                                     | un choix qui n'est pas celui attendu, **dans un Déclic ou un cours**  | un « hm » doux qui descend, jamais de buzz | 12 ms              |
| `wrong`                                    | un verdict dans Réviser (Carré ou Intox, quiz)                        | un buzz                                    | 20-40-20 ms        |
| `reveal`                                   | l'idée prend son nom                                                  | deux notes douces qui montent              | 14 ms              |
| `declic`                                   | **le moment du Déclic**, le seul signal à avoir un « clic » mécanique | un clic, puis une montée chaude            | 16-50-10-50-26 ms  |
| `xp`                                       | des points arrivent                                                   | un scintillement                           | 6 ms               |
| `complete`, `rank*`, `chestOpen`, `streak` | fin de séance, rang, Pioche, série                                    | cérémonies existantes                      | selon la cérémonie |

Règles, tenues par `sound.test.ts` :

- **Dans une conversation (Déclic, cours), Braise ne buzze jamais** : un choix « autre piste » reçoit le
  signal doux, pas le verdict. Le buzz de verdict appartient à Réviser.
- Aucune note au-dessus de 0,2 de volume, aucune note de plus de 0,6 s, aucune vibration de plus de
  80 ms cumulées ni de plus d'une seconde au total.
- Le **son** et la **vibration** ont chacun leur interrupteur (Moi, Réglages, Audio) et sont
  indépendants : un élève en classe garde la vibration et coupe le son. La vibration est aussi coupée
  quand le téléphone demande moins de mouvement.
- La réponse de Braise arrive après un court temps de réflexion (trois points, 0,55 s) : la tuile répond
  tout de suite, ce sont ses mots qui attendent. Jamais sous « réduire les animations ».
- Le moment du Déclic : deux balancements de Braise puis elle se pose, un seul tir de confettis. Rien ne bouge en boucle à côté d'un texte à lire.

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

## Matières : « Où on va ? » et l'archipel d'une matière

- **Deux écrans, deux en-têtes.** « Où on va ? » est un écran principal : `PageHeader`, ni barre ni retour
  (l'onglet Aujourd'hui ramène). L'archipel d'une matière est un écran ouvert depuis lui : `TopBar` dont le
  titre dit où va le retour (« Où on va ? »), pendant que la page dit où l'on est (« L'archipel »,
  « Mathématiques »). Le mot « Matières » n'apparaît plus : l'app dit « mondes ».
- **La décision d'abord.** Sur le hub, le conseil de Braise et son bouton viennent avant les mondes : l'action
  est à l'écran dès l'arrivée sur tout téléphone (320 à 430 px, texte normal), les mondes passent dessous.
  Rien n'est fixé par-dessus le contenu.
- **Un seul avis.** Le hub, l'archipel et la Pioche de l'accueil lisent la même fonction (`pickResume`,
  `pickGlobalResume`, `resumeRank`) : un Déclic touché depuis moins de deux jours (« Reprendre »), des notions
  à retrouver, un point qui se mélange, un ancien Déclic, puis du nouveau. Aucun tirage au hasard.
- **Au repos, deux choses bougent au plus.** Hub : la lente dérive des mondes et la lune du monde conseillé.
  Archipel : seule l'île conseillée flotte. Ni rayons qui tournent, ni étoiles qui scintillent, ni orbite qui
  défile. La vie vient de l'arrivée (les mondes entrent l'un après l'autre, une fois) et du toucher : Braise
  est un bouton, elle saute et montre le monde qu'elle conseille (un anneau, un instant, même sans mouvement).
- **Les mondes ont tous la même taille** ; seul le monde conseillé est plus grand : une taille dit une
  importance, jamais un hasard.
- **Jamais la couleur seule.** Chaque île dit son état en un mot (« À découvrir », « Compris », « Acquis »…),
  teinté comme son drapeau, et la légende des drapeaux en haut de la carte liste ce qu'il y a sur cette carte
  (rien tant que rien n'est commencé). Le chiffre rouge d'un monde est expliqué une fois, sous le conseil.
- **Dire ce que BRAISE couvre avant d'entrer.** Un élève de 1ère ou de Terminale le lit en haut du hub ; tout
  le monde le relit sous la dernière île.
- **Pas de recherche** tant que la carte tient en une vingtaine de chapitres : elle ne ferait que répondre
  « rien » (à réévaluer quand le catalogue grandit).

## La navigation

Quatre espaces (Aujourd'hui, Réviser, Aura, Moi), décision du porteur du projet (voir
`PRODUCT_VISION.md`). Les cours sont atteints depuis Aujourd'hui par « Tes cours » puis « Où on va ? ».
