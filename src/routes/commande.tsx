import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/commande")({
  beforeLoad: () => {
    throw redirect({ to: "/panier" });
  },
});
