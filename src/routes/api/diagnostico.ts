import { createFileRoute } from "@tanstack/react-router";

const NO_STORE = { "cache-control": "no-store" };

/**
 * GET /api/diagnostico            → verificação completa (inclui o banco)
 * GET /api/diagnostico?resumo=1   → só o modo do login com Google (tela de login)
 */
export const Route = createFileRoute("/api/diagnostico")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { diagnose, loginConfig } = await import("@/lib/diagnostics.server");
        const summary = new URL(request.url).searchParams.get("resumo") === "1";
        try {
          const body = summary ? await loginConfig(request) : await diagnose(request);
          return Response.json(body, { headers: NO_STORE });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return Response.json(
            { error: message.replace(/postgres(ql)?:\/\/\S+/gi, "[endereço do banco]").slice(0, 240) },
            { status: 500, headers: NO_STORE },
          );
        }
      },
    },
  },
});
