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

Un écran principal (Aura, Moi) s'ouvre sur `PageHeader` : le nom de l'espace en petites
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
| À rallumer     | un truc qui revient avant d'être oublié (la flamme de Braise qui s'éteint)             |

**L'échelle d'une notion** a trois affirmations distinctes, dites avec nos mots et jamais avec ceux d'un
bulletin (`src/lib/course/statusLabels.ts`) : **Vu** (j'ai fini la leçon), **Capté** (j'ai compris, c'est la
validation), **Dans la poche** (je le retrouve sans aide quelques jours après : le seul palier qui compte).
À côté : **Fragile** (il a glissé) et **À rallumer** (il va s'éteindre). Si on change un de ces mots, les trois
affirmations restent distinctes. Pas de « Acquis », « Compris », « À renforcer », « Programme officiel » dans
ce que lit l'élève ; ces mots restent pour l'adulte (page de programme, dossier).

**Parler comme un pote, c'est la structure avant l'argot :** court, un peu moqueur, jamais une leçon, la
voix avant le jargon. **Le nom d'un cours est son vrai nom** (« Arithmétique »), sur la Pioche comme partout : décision
du porteur, 14 oct. L'accroche amusante (« 24 parts, 5 potes : ça tombe pile ? ») vit dans le bandeau de la
matière, pas à la place du nom. On met peu
de mots à nous, toujours les mêmes, dans un seul endroit. L'argot de mème vieillit en quelques mois et fait un
adulte déguisé : on n'en met que de durable, et la liste se valide avec de vrais lycéens.

Chaque mot est expliqué dans `src/lib/glossary.ts`, ouvert depuis le « ? » de la Pioche, depuis Moi
(« Le lexique de Braise ») et par une astuce au premier Déclic. Un seul mot par chose : pas de « Pass
BRAISE » ni de noms de formes qui doublent les rangs. Jamais de « classement » entre élèves.

## Le ton ne fait pas peur

Une notion « à rafraîchir » n'est jamais « en retard ». Un rappel est une invitation, jamais une alarme
ni un compte à rebours.

## Matières : le système solaire de l'accueil et l'archipel d'une matière

- **Pas de page de choix.** Choisir une matière ne passe pas par un écran à part : un élève qui veut aller
  quelque part y arrive en **un tap** depuis l'accueil. Le système solaire vit sur Aujourd'hui, sous la
  Pioche (`Hub` en mode `compact`) ; toucher un monde ouvre **directement l'archipel** de la matière.
- **Un seul avis.** La Pioche, le monde marqué « Reprendre → » sur l'accueil et l'île conseillée de l'archipel
  lisent la même fonction (`pickResume`, `pickGlobalResume`, `resumeRank`) : un Déclic touché depuis moins de
  deux jours (« Reprendre »), des notions à retrouver, un point qui se mélange, un ancien Déclic, puis du
  nouveau. Aucun tirage au hasard.
- **Une seule Braise par écran.** Sur l'accueil elle est dans la Pioche : le soleil du système est une flamme.
  Le monde qu'elle conseille est plus grand, cerclé, avec sa lune, et un **verbe** collé au monde. Le verbe
  dit ce qui se passe (Reprendre, Renforcer, Retrouver, Commencer, Continuer) : **jamais « Réviser »**, nom d'un
  onglet (la session de cartes).
- **« Un truc important bientôt ? »** (bouton calendrier dans la barre de la matière, feuille à **trois taps** :
  Demain / Cette semaine / La semaine prochaine). Pas de calendrier à saisir. **Jamais de décompte, jamais de
  couleur d'urgence, aucune relance** : la date ne sert qu'à ce que Braise mette en avant (la Pioche choisit
  dans cette matière, Réviser en tire plus de cartes) et elle s'oublie un jour après (`lib/world/soon.ts`).
  Stockée sur l'appareil. L'adaptation fine de l'espacement à l'échéance n'est pas faite.
- **La carte du bas d'une matière est une carte à collectionner** (`Dock`) : l'emblème de l'île suggérée (le même
  dessin que sur la carte), le verbe en petit (« Commencer », « Reprendre »…), le vrai nom du chapitre, un bouton
  rond. **Pas de phrase** : la carte ne répète pas ce que dit déjà la carte (Braise est sur l'île). Elle fait
  90 px, au lieu de 107 avec sa phrase, et laisse voir la dernière île. **La carte d'une île touchée n'a qu'une mission :
  confirmer le choix et lancer. Elle est basse : 120 à 130 px à 390 px (jusqu'à 146 px à 320 px), contre 170 à
  212 px avant, soit environ 15 % de l'écran.** Une rangée pour le choix : le petit dessin de l'île (44 px), le
  **vrai nom** en titre avec ce que ça coûte (« 4 min ») et, s'il y en a, « 🔥 n à rallumer » en `--orange-text`
  (jamais de rouge d'urgence), puis le **bouton dont le verbe est écrit** (Commencer, Reprendre, Rejouer). Dessous,
  l'accroche sur deux lignes au plus (le texte entier reste lu aux lecteurs d'écran). Le bouton est orange
  (`--orange-fill`) quand il y a une raison d'y aller et **papier** pour un chapitre « Dans la poche » (rien
  d'urgent, une seule surface pleine). Sur un écran très étroit, il passe sous le nom plutôt que d'écraser le nom.
  La croix est posée sur le coin de la carte, hors de son cadre : elle ne prend aucune place (32 px dessinée, 44 px
  pressable). Aucune pastille d'état (l'île, son mot et le verbe le disent ; le nom lu aux lecteurs d'écran
  contient l'état), aucun niveau (« 2nde »), aucune ligne mono, aucun gain de points, nombre de cartes ou
  « vu il y a… ». Les points de progression n'y sont plus : l'île porte l'état (drapeau, mot), et la page du chapitre
  le détail. Le bouton ouvre le chapitre (pas la révision de ses cartes à rallumer).
- **Le nom de la matière n'est écrit qu'une fois :** dans la barre du haut de l'archipel (pas de second grand
  titre, pas de « Où on va ? »). Le texte qui répète ce que l'écran dit déjà est retiré : pas de légende sous le
  titre de « Tes mondes », pas de note de niveau pour un élève de 2nde (elle ne s'adresse qu'à Première et
  Terminale). Une demande de Braise (rappels) prend la place de la carte « À rafraîchir » tant qu'elle est
  ouverte : un seul bloc secondaire à la fois.
- **La bande de matières** (`SubjectStrip`) est dans la barre du haut de l'archipel, donc collée à l'écran :
  six disques, celui où l'on est cerclé, une pastille sur les autres qui ont des notions à rafraîchir. Toucher
  un autre disque ouvre son archipel sans repasser par l'accueil. Mêmes disques, même ordre que sur l'accueil.
  44 px au minimum (six tiennent à 320 px).
- **Jamais la couleur seule.** Chaque île dit son état en un mot, teinté comme le drapeau ; la légende des
  drapeaux, en haut de la carte, liste ce qu'il y a sur cette carte.
- **Au repos, deux choses bougent au plus.** Accueil : la lente dérive des mondes et la lune du monde conseillé.
  Archipel : seule l'île conseillée flotte. Ni rayons qui tournent, ni étoiles qui scintillent, ni orbite qui
  défile. La vie vient de l'arrivée (les mondes entrent l'un après l'autre, une fois) et du toucher. Rien de
  tout cela sous « réduire les animations » ni en mode dyslexie.
- **Les mondes ont tous la même taille** ; seul le monde conseillé est plus grand : une taille dit une
  importance, jamais un hasard. Le placement est piloté par la liste des matières, **jusqu'à dix** (`hubPlaces`,
  testé).
- **Aujourd'hui : l'espace entre la Pioche et Tes mondes prépare un contrôle** (`PrepareCard`, `PrepareSheet`).
  Rien de prévu : une phrase et un bouton « Je prépare » (clair : la Pioche reste la seule surface pleine).
  Prévu : le disque de la matière, « SVT : on prépare ensemble. », « Préparer », « Plus besoin ». Deux taps pour le
  dire (la matière, puis la date en trois choix), **jamais de date, de jours restants ni de décompte affichés**.
  Une seule Braise : celle de la Pioche ; les cartes de rappels prennent la flamme.
- **Tout est construit dans le flux** (jamais à des coordonnées dessinées) : un nom vit dans la même boîte que
  son image, donc de 320 à 430 px et en texte très grand rien ne se chevauche.

## La navigation

Quatre espaces (Aujourd'hui, Réviser, Aura, Moi), décision du porteur du projet (voir
`PRODUCT_VISION.md`). Les cours sont atteints depuis Aujourd'hui : un tap sur un monde de « Tes mondes » ouvre l'archipel de la matière.
