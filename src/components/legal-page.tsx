import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BrandMark, Wordmark, cx } from "@/components/ui";

/** Contato de quem responde pelo app (o mesmo e-mail de suporte do login com Google). */
export const CONTACT_EMAIL = "fabiounanime@gmail.com";
export const LEGAL_UPDATED_AT = "14 de outubro de 2026";

/**
 * Página pública de texto (privacidade, termos): abre sem login, porque o Google
 * e qualquer visitante precisam poder ler.
 */
export function LegalPage({
  title,
  lead,
  current,
  children,
}: {
  title: string;
  lead: string;
  current: "privacidade" | "termos";
  children: ReactNode;
}) {
  return (
    <div className="app-backdrop min-h-dvh text-fg">
      <header className="glass sticky top-0 z-30 border-b border-line/70">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark className="size-8" />
            <Wordmark className="text-[1.2rem] leading-none" />
          </Link>
          <Link to="/login" className="text-sm font-semibold text-tekhelet hover:underline">
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16 sm:px-6 md:pt-12">
        <h1 className="text-[2rem] leading-tight font-bold tracking-tight sm:text-[2.5rem]">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{lead}</p>
        <p className="mt-1 text-sm text-muted">Última atualização: {LEGAL_UPDATED_AT}.</p>

        <article className="legal mt-8 rounded-3xl border border-line bg-surface p-5 sm:p-8">{children}</article>

        <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Documentos">
          <Link
            to="/privacidade"
            className={cx("font-medium hover:underline", current === "privacidade" ? "text-fg" : "text-tekhelet")}
          >
            Política de Privacidade
          </Link>
          <Link to="/termos" className={cx("font-medium hover:underline", current === "termos" ? "text-fg" : "text-tekhelet")}>
            Termos de Serviço
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-tekhelet hover:underline">
            Contato
          </a>
        </nav>
      </main>
    </div>
  );
}

/** Seção numerada: os documentos são lidos em ordem e citados por número. */
export function LegalSection({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="border-b border-line py-6 first:pt-0 last:border-b-0 last:pb-0">
      <h2 className="flex items-baseline gap-3 text-lg font-semibold tracking-tight">
        <span className="text-zahav tabular-nums">{n}.</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-soft">{children}</div>
    </section>
  );
}
