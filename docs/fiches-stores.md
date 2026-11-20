# Publier la version test de BRAISE

Tout ce qui se tape dans App Store Connect et dans la Play Console, écrit d'avance. Ce qui reste
à décider est marqué **À COMPLÉTER**.

Les règles des deux stores changent souvent : les montants, les délais et les formulaires cités
ici sont à revérifier sur les pages officielles au moment de s'en servir.

---

## 1 · Identité de l'app

|                                    |                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| Nom (30 car. max)                  | `BRAISE`                                                                              |
| Sous-titre App Store (30 car. max) | `Tes cours, version pote`                                                             |
| Titre court Play (30 car. max)     | `BRAISE — réviser sans forcer`                                                        |
| Identifiant (définitif)            | `fr.mearim.braise`                                                                    |
| Catégorie principale               | Éducation                                                                             |
| Catégorie secondaire               | Références                                                                            |
| Langue                             | Français (France)                                                                     |
| Version                            | `0.1.0` — build `1`                                                                   |
| Prix                               | Gratuit, sans achat intégré                                                           |
| Éditeur                            | **À COMPLÉTER** (nom affiché publiquement dans les deux stores)                       |
| URL d'assistance                   | **À COMPLÉTER** (obligatoire)                                                         |
| URL de confidentialité             | **À COMPLÉTER** — la page est écrite : `docs/confidentialite.html`, à mettre en ligne |

> Le nom affiché et l'adresse de l'éditeur sont **publics** dans l'Union européenne dès que l'app
> est distribuée comme professionnel. Si tu publies en nom propre, c'est ton nom et ton adresse
> qui s'affichent. Déclarer le statut « non-professionnel » est possible tant que l'app est
> gratuite et sans monétisation — à trancher avant de remplir le formulaire, parce que ça
> engage.

## 2 · Mots-clés App Store (100 caractères, séparés par des virgules, sans espaces)

```
lycee,seconde,2nde,revision,maths,cours,fiches,memoire,quiz,reviser,apprendre,arithmetique
```

Ne pas y remettre « BRAISE » ni « éducation » : le nom et la catégorie sont déjà indexés. Plus de
« premiere » ni « terminale » : attirer un élève dont l'app ne couvre pas le programme, c'est
acheter une mauvaise note.

## 3 · Description

### Texte promotionnel (170 car., modifiable sans nouvelle version)

```
Deux minutes par jour, et le cours rentre. Braise t'explique, te teste, et revient te voir
pile quand tu allais oublier.
```

### Description complète

```
Tes cours de lycée, expliqués comme par un pote.

BRAISE, ce n'est pas un cours en ligne de plus. C'est Braise : il t'explique une notion en
deux minutes, te laisse te planter sans jamais te juger, et revient te la redemander au moment
exact où tu allais l'oublier.

LE DÉCLIC
Une notion, une conversation. Une situation concrète, une question, ton choix, puis
l'explication. Jamais plus d'une idée par écran, jamais une page de cours à avaler. À la fin,
une fiche courte : ce qu'il faut retenir, et le piège classique.

RÉVISER
Les notions reviennent toutes seules, espacées dans le temps. Tu dis si tu sais ou pas, d'un
geste. C'est la mémorisation espacée, celle qui marche, sans que tu aies à t'organiser.

TON AURA
Ta progression, tes paliers, ce que tu as vraiment en poche. Aucun classement, aucune
comparaison avec les autres : c'est toi contre le programme, personne d'autre.

CE QUE BRAISE NE FAIT PAS
Pas de compte à créer. Pas de pub. Pas de données qui partent sur un serveur : tout reste sur
ton téléphone, et l'app fonctionne sans réseau. Pas de classement entre élèves, jamais.

POUR QUI
Les élèves de seconde. Maths, français, histoire-géo, SVT, physique-chimie, anglais.

BRAISE est en test : les cours suivent le programme de seconde et s'étoffent. Les autres
niveaux viendront après.
```

### Nouveautés de cette version (What's New)

```
Première version de test. Les Déclics de 25 chapitres, la révision espacée, les rappels de
Braise et ton Aura. Dis-nous ce qui coince : c'est exactement pour ça que tu es là.
```

## 4 · Captures d'écran

Six captures prêtes, 1290 × 2796 (format 6,9 pouces, accepté par les deux stores) :
`npm run store:shots` les refabrique dans `store/captures/` depuis l'app qui tourne.

| Fichier         | Ce qu'elle montre          | Légende suggérée                    |
| --------------- | -------------------------- | ----------------------------------- |
| `01-aujourdhui` | La Pioche du jour          | Une seule chose à faire aujourd'hui |
| `02-declic`     | La révélation d'un Déclic  | Il explique, tu comprends           |
| `03-reviser`    | Une carte de révision      | Deux minutes, et ça rentre          |
| `04-aura`       | Le parcours et les paliers | Ta progression, sans comparaison    |
| `05-matieres`   | L'archipel d'une matière   | Tes chapitres, comme une carte      |
| `06-moi`        | Les réglages de l'élève    | Il te parle comme tu veux           |

App Store demande au moins une capture au format 6,9 pouces ; Play en demande au moins deux,
plus une image de présentation 1024 × 500. **À COMPLÉTER** : cette bannière Play n'est pas
fabriquée (l'icône sur fond crème avec le nom ferait l'affaire).

## 5 · Confidentialité : ce qu'il faut répondre

Les deux stores posent la même question sous deux formes. La réponse est la même, et elle est
vraie — vérifié en observant le réseau de l'app embarquée : elle ne fait aucune requête sortante,
pas une seule.

**App Store — « App Privacy »** : _Aucune donnée collectée._ Ne cocher aucune catégorie.

**Play — « Sécurité des données »** :

- Collecte de données : **non**
- Partage de données : **non**
- Données chiffrées en transit : sans objet (aucune donnée en transit)
- Suppression des données : l'app propose d'effacer toutes les données localement
- Collecte obligatoire : sans objet

**Classement par âge** — répondre « aucun / jamais » à tout : pas de violence, pas de contenu
sexuel, pas de jeu d'argent, pas de produits réglementés, pas d'achats, pas de publicité, pas de
contenu généré par les utilisateurs, pas de messagerie, pas de partage de position. Résultat
attendu : 4+ côté Apple, PEGI 3 / Tous publics côté Play.

> Deux pièges dans ces questionnaires :
> — « Made for Kids » / « Conçu pour les familles » : répondre **non**. BRAISE s'adresse à des
> 15-18 ans ; se déclarer app pour enfants impose un régime bien plus strict sans rien apporter.
> — Le partage de la carte Aura utilise le menu de partage du système, pas un réseau interne :
> ce n'est pas du contenu généré ni de l'interaction entre utilisateurs.

**Chiffrement à l'export (Apple)** : l'app n'utilise pas de chiffrement — répondre non, ou
« exempt » si seul HTTPS est proposé comme choix.

**Suppression de compte (Apple)** : sans objet, l'app n'a pas de comptes.

## 6 · TestFlight : ce que lisent les testeurs

### Description de la version bêta

```
BRAISE est une app de révision pour les élèves de seconde. Tu l'utilises comme tu veux, quand
tu veux : il n'y a rien à rendre et rien à réussir. Tout reste sur ton téléphone.
```

### Ce qu'on te demande de tester

```
Utilise l'app normalement pendant deux semaines, sans te forcer.

Ce qui nous intéresse vraiment :
· Est-ce que tu y reviens tout seul, et quand ?
· Est-ce que tu comprends ce que Braise t'explique ?
· Les rappels : utiles, ou pénibles ?
· Qu'est-ce qui t'a agacé, ennuyé ou paru bizarre ?

S'il y a un bug : dis ce que tu faisais juste avant, c'est le plus utile.
```

### Informations de revue (Beta App Review)

```
Aucun compte n'est nécessaire : l'app s'ouvre directement sur son onboarding et tout le contenu
est accessible immédiatement. Pas de réseau requis, l'app fonctionne hors-ligne.
```

## 7 · L'ordre des opérations

**Ce qui prend du temps, à lancer en premier**

1. Créer le compte Apple Developer (~99 €/an) et le compte Play Console (~25 € une fois).
2. Vérification d'identité des deux comptes. C'est le poste le plus long, et rien n'avance sans.
3. Installer Xcode depuis le Mac App Store (~15 Go) et Android Studio. Pas besoin de CocoaPods :
   Capacitor 8 passe par Swift Package Manager.

**Ce qui est prêt**

4. L'app se construit : `npm run build:native && npx cap sync`, puis `npx cap open ios` ou
   `npx cap open android`.
5. Icônes, écran de lancement, captures, textes, page de confidentialité : dans ce dépôt.

**Ce qui reste à faire une fois les comptes ouverts**

6. Mettre en ligne la page de confidentialité (`docs/confidentialite.html`) et récupérer son URL.
7. iOS : créer l'app dans App Store Connect, régler la signature dans Xcode, envoyer un build,
   remplir la fiche, lancer un test externe TestFlight (passe par une revue allégée).
8. Android : générer une clé de signature (**à garder précieusement : la perdre interdit toute
   mise à jour**), produire un bundle `.aab`, créer un test fermé, y inscrire les testeurs.
9. Inviter les élèves. Côté Play, un test fermé d'une douzaine de personnes sur quatorze jours
   est ce qui ouvre ensuite l'accès à la production : ton test utilisateurs sert deux fois.

## 8 · Le périmètre du test

**Seconde uniquement**, décidé le 20 novembre 2026. L'app l'écrivait déjà à deux endroits
(`CONTENT_LEVEL_NOTE`, visible dans Moi), mais pas là où ça compte : l'onboarding proposait les
trois niveaux sans rien dire. C'est corrigé — la phrase se lit maintenant sous les trois classes,
au moment où l'élève choisit la sienne.

Ce que ça implique ailleurs : recruter des 2ndes, le dire dans la fiche (fait ci-dessus), et
concentrer l'écriture sur un seul chapitre mené jusqu'au bout plutôt que sur une couverture
large. Les trois niveaux restent proposés dans l'app : un élève de 1ère qui installe quand même
doit pouvoir entrer et juger — simplement, il sait avant.

## 9 · Ce qui reste ouvert

- **L'identifiant `fr.mearim.braise`** : définitif dès la première publication.
- **Le fond de l'icône** : crème pour l'instant, trois versions dans `scratch-icons/`.
- **Le statut d'éditeur** (professionnel ou non) et l'adresse publique qui va avec.
- **La bannière Play 1024 × 500.**
- **La politique de confidentialité doit être relue** par quelqu'un dont c'est le métier avant
  publication : elle décrit fidèlement ce que fait l'app, ce n'est pas un avis juridique.
