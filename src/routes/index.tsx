import { createFileRoute } from "@tanstack/react-router";
import { LANDING_HEAD, LandingPage } from "@/components/landing";

/** Endereço principal: apresentação pública do app (exigência do Google para o login). */
export const Route = createFileRoute("/")({
  head: () => LANDING_HEAD,
  component: LandingPage,
});
