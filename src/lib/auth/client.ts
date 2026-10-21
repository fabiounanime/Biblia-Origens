import { createAuthClient } from "better-auth/react";

/**
 * Cliente do Better Auth no navegador. Fala com o próprio app em `/api/auth/*`
 * (mesma origem), e a sessão vai no cookie.
 *
 * Login: e-mail e senha (`authClient.signIn.email` / `signUp.email`) e Google
 * direto (`authClient.signIn.social({ provider: "google" })`).
 */
export const authClient = createAuthClient();

/**
 * Login ligado. Só fica desligado com `VITE_AUTH_ENABLED=false`, que entra com
 * um usuário de desenvolvimento (veja `use-current-user`).
 */
export const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== "false";

/**
 * Encerra a sessão no servidor e vai para `redirectTo`.
 *
 * Rejeita se o servidor não confirmar: o cookie de sessão é HttpOnly e só o
 * servidor pode apagá-lo, então redirecionar mesmo assim mostraria uma saída
 * que não aconteceu. Quem chama deve permitir tentar de novo.
 */
export async function signOut(redirectTo = "/"): Promise<void> {
  const { error } = await authClient.signOut();
  if (error) throw new Error(error.message ?? "Sign-out failed");
  window.location.href = redirectTo;
}
