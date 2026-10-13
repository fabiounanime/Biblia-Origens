import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";
import { ensureSchema } from "@/lib/db";

/** Cria as tabelas de login na primeira requisição, se ainda não existirem. */
async function handle(request: Request): Promise<Response> {
  try {
    await ensureSchema();
  } catch (err) {
    // O Better Auth responde com o erro do banco; o diagnóstico mostra a causa.
    console.error("[auth] não foi possível preparar o banco:", err);
  }
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
