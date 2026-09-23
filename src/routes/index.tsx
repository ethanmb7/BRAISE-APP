import { createFileRoute } from "@tanstack/react-router";
import App from "@/App";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "BRAISE — Révise en 2 minutes par jour" },
      {
        name: "description",
        content:
          "BRAISE transforme tes cours en cartes Vrai/Faux à swiper. Séries, XP, gemmes et ligues : la révision devient un jeu.",
      },
      { property: "og:title", content: "BRAISE — Révise en 2 minutes par jour" },
      {
        property: "og:description",
        content:
          "Micro-learning pour collégiens et lycéens : swipe Vrai/Faux, garde ta flamme, monte en ligue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BraiseApp,
});

function BraiseApp() {
  return (
    <div className="app-root">
      <App />
    </div>
  );
}
