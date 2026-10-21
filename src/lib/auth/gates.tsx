import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { resolveSignInGateState } from "./sign-in-gate";
import { useCurrentUserState } from "./use-current-user";

/**
 * Componentes de estado do login, em volta de `useCurrentUserState()`. Enquanto
 * a sessão carrega, os que dependem de "sem conta" não mostram nada, para não
 * piscar a tela de login num recarregamento.
 */

/** Para onde `RedirectToSignIn` manda quem não entrou. */
export const SIGN_IN_PATH = "/login";

/** Mostra o conteúdo só com usuário presente. */
export function SignedIn({ children }: { children: ReactNode }) {
  const { user } = useCurrentUserState();
  return user ? <>{children}</> : null;
}

/** Mostra o conteúdo só quando já se sabe que ninguém entrou. */
export function SignedOut({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending || user) return null;
  return <>{children}</>;
}

/** Vai para o login sem recarregar a página (navegação do TanStack Router). */
export function RedirectToSignIn({ to = SIGN_IN_PATH }: { to?: string }) {
  return <Navigate to={to} />;
}

/** Mostra o conteúdo para quem entrou; senão, `fallback` ou o login. */
export function SignInGate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const state = resolveSignInGateState({ isPending, hasUser: user !== null });
  if (state === "pending") return null;
  if (state === "signed_in") return <>{children}</>;
  return <>{fallback ?? <RedirectToSignIn />}</>;
}
