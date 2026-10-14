import { useCallback, useEffect, useState, type ReactElement } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleCheck, CircleX, RefreshCw, TriangleAlert } from "lucide-react";
import { BrandMark, Wordmark, cx } from "@/components/ui";
import type { Diagnosis, DiagnosisCheck } from "@/lib/diagnostics";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({ meta: [{ title: "Diagnóstico · Bíblia Origens" }, { name: "robots", content: "noindex" }] }),
  component: DiagnosticoPage,
});

type State = { kind: "loading" } | { kind: "done"; data: Diagnosis } | { kind: "failed"; message: string };

const ICON = {
  ok: <CircleCheck className="size-5 text-tekhelet" aria-label="Funcionando" />,
  warn: <TriangleAlert className="size-5 text-zahav" aria-label="Atenção" />,
  error: <CircleX className="size-5 text-shani" aria-label="Com problema" />,
} satisfies Record<DiagnosisCheck["status"], ReactElement>;

function DiagnosticoPage() {
  const [state, setState] = useState<State>({ kind: "loading" });

  const run = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const response = await fetch("/api/diagnostico", { cache: "no-store" });
      const body = (await response.json()) as Diagnosis | { error: string };
      if ("error" in body) setState({ kind: "failed", message: body.error });
      else setState({ kind: "done", data: body });
    } catch (err) {
      setState({ kind: "failed", message: err instanceof Error ? err.message : "Sem resposta do servidor." });
    }
  }, []);

  useEffect(() => {
    void run();
  }, [run]);

  const problems = state.kind === "done" ? state.data.checks.filter((check) => check.status === "error").length : 0;

  return (
    <main className="app-backdrop min-h-dvh px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <BrandMark className="size-10" />
          <Wordmark className="text-[1.35rem] leading-none" />
        </div>
        <h1 className="mt-8 text-[2rem] leading-tight font-bold tracking-tight">Diagnóstico do login</h1>
        <p className="mt-2 text-muted">
          Confere se o servidor tem o que precisa para criar contas e entrar. Nenhum segredo aparece aqui.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void run()}
            disabled={state.kind === "loading"}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-tekhelet px-5 font-semibold text-on-accent disabled:opacity-60"
          >
            <RefreshCw className={cx("size-4", state.kind === "loading" && "animate-spin")} aria-hidden />
            {state.kind === "loading" ? "Verificando…" : "Verificar de novo"}
          </button>
          <Link to="/login" className="inline-flex h-11 items-center rounded-full border border-line px-5 font-semibold text-soft">
            Ir para o login
          </Link>
        </div>

        {state.kind === "loading" ? (
          <div className="mt-8 space-y-3" role="status" aria-label="Verificando">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-20 animate-pulse rounded-3xl bg-surface" />
            ))}
          </div>
        ) : null}

        {state.kind === "failed" ? (
          <p role="alert" className="mt-8 rounded-3xl border border-shani/40 bg-shani/10 p-5 text-shani">
            O diagnóstico não respondeu: {state.message}
          </p>
        ) : null}

        {state.kind === "done" ? (
          <>
            <p
              className={cx(
                "mt-8 rounded-2xl px-4 py-3 font-semibold",
                problems ? "bg-shani/12 text-shani" : "bg-tekhelet/12 text-tekhelet",
              )}
            >
              {problems
                ? `${problems} ${problems === 1 ? "item impede" : "itens impedem"} o login de funcionar.`
                : "Nada impede o login de funcionar."}
            </p>
            <ul className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface">
              {state.data.checks.map((check) => (
                <li key={check.id} className="flex gap-3 border-b border-line px-4 py-4 last:border-b-0">
                  <span className="mt-0.5 shrink-0">{ICON[check.status]}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{check.label}</span>
                    <span className="mt-0.5 block text-sm break-words text-muted">{check.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">
              Verificado em {new Date(state.data.checkedAt).toLocaleString("pt-BR")} para {state.data.origin}.
            </p>
          </>
        ) : null}
      </div>
    </main>
  );
}
