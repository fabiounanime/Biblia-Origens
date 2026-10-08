import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/ler/$book")({
  component: () => <Outlet />,
});
