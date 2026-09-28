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
          "Tes cours de lycée, expliqués comme par un pote. Braise t'aide à comprendre, puis à retenir.",
      },
      { property: "og:title", content: "BRAISE — Révise en 2 minutes par jour" },
      {
        property: "og:description",
        content:
          "Pour les lycéens : Braise t'explique tes cours comme un pote et t'aide à les retenir.",
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
