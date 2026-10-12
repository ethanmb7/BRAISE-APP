# Braise Connector

@connector:github:"GitHub API" trouve le projet BRAISE-APP

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/22ded846-c3df-4c27-8420-3954bdea1b2b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Profil de démonstration

Pour montrer l'app avec une progression déjà bien remplie (Léa, trois semaines de révisions : rang Or,
série de 6, des cartes dans tous les états, un Déclic terminé et un commencé), ouvre l'app avec
`?demo` à la fin de l'adresse, par exemple `http://localhost:8080/?demo`.

- La vraie progression de l'appareil est mise de côté puis **rendue telle quelle** en quittant la démo.
- Pour quitter : Moi › Paramètres › « Quitter la démo », ou ouvre `?demo=off`.
- Ouvrir `?demo` pendant la démo la remet à zéro (la vraie progression reste à l'abri).
- Le profil est construit à partir des vraies cartes et des vrais Déclics (`src/lib/demo/profile.ts`) et de
  la date du jour : les cartes « à revoir » le sont toujours.
- Rien n'est envoyé nulle part, comme le reste de l'app.

## Repartir de zéro

Moi › Paramètres › « Tout effacer » (avec confirmation) efface tout ce que l'app garde sur l'appareil. Pour
enchaîner plusieurs élèves sur le même téléphone, ouvre simplement `?reset` à la fin de l'adresse : l'app
repart d'un appareil vide. Seule l'identité de l'appareil est conservée. Pendant la démo, le bouton est caché
(il effacerait aussi la progression mise de côté) ; `?reset` efface tout, démo et progression mise de côté
comprises.
