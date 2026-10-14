import { createFileRoute, redirect } from "@tanstack/react-router";

/** Endereço antigo da apresentação: agora ela é a página inicial. */
export const Route = createFileRoute("/sobre")({
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
