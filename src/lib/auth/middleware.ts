import { createMiddleware } from "@tanstack/react-start";

/**
 * Middleware das funções do servidor: o jeito padrão de obter o id verificado
 * de quem chama. A sessão vem no cookie, que segue sozinho em todo pedido.
 *
 *   import { createServerFn } from "@tanstack/react-start";
 *   import { authMiddleware } from "@/lib/auth/middleware";
 *
 *   export const listar = createServerFn({ method: "GET" })
 *     .middleware([authMiddleware])
 *     .handler(async ({ context }) => {
 *       // context.userId é o usuário da sessão; filtre toda consulta por ele.
 *     });
 *
 * Sem sessão, lança `UnauthorizedError` (veja `verify.server.ts`).
 */
export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  // Importe só módulos `*.server` aqui, para o Vite não mandar código de
  // servidor ao navegador.
  const { assertSameSiteRequest } = await import("./isolation.server");
  const { requireUserId } = await import("./verify.server");
  // Recusa pedidos feitos por script a partir de outro site antes de tocar nos
  // dados do usuário.
  assertSameSiteRequest();
  const userId = await requireUserId();
  return next({ context: { userId } });
});
