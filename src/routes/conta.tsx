import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Cloud, CloudOff, LogOut, NotebookPen, RefreshCw } from "lucide-react";
import { Page, Shell } from "@/components/shell";
import { ReadingSettings } from "@/components/reading-settings";
import { Avatar, SectionTitle, Segmented, cx } from "@/components/ui";
import { authEnabled, signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { bookById, bookLang, originalProps } from "@/lib/bible/catalog";
import { activeMarks, useStudy } from "@/lib/study/store";

export const Route = createFileRoute("/conta")({
  head: () => ({ meta: [{ title: "Conta · Bíblia Origens" }] }),
  component: ContaPage,
});

type Filter = "all" | "bookmark" | "note";

function ContaPage() {
  const { user, isPending } = useCurrentUserState();
  const marks = useStudy((state) => state.marks);
  const cursor = useStudy((state) => state.cursor);
  const syncing = useStudy((state) => state.syncing);
  const syncError = useStudy((state) => state.syncError);
  const sync = useStudy((state) => state.sync);
  const [filter, setFilter] = useState<Filter>("all");
  const [signingOut, setSigningOut] = useState(false);

  const all = activeMarks(marks)
    .slice()
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const shown = filter === "all" ? all : all.filter((mark) => mark.kind === filter);
  const name = user?.displayName ?? user?.primaryEmail ?? "Leitor";

  return (
    <Shell>
      <Page title="Conta">
        {/* Perfil */}
        <section className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 sm:p-5">
          {isPending || !user ? (
            <div className="h-14 w-full animate-pulse rounded-2xl bg-raised" />
          ) : (
            <>
              <Avatar name={name} image={user.profileImageUrl} className="size-14 text-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold">{user.displayName ?? "Leitor"}</p>
                {user.primaryEmail ? <p className="truncate text-sm text-muted">{user.primaryEmail}</p> : null}
              </div>
              {authEnabled ? (
                <button
                  type="button"
                  disabled={signingOut}
                  onClick={() => {
                    setSigningOut(true);
                    void signOut("/login").catch(() => setSigningOut(false));
                  }}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-soft hover:border-muted disabled:opacity-60"
                >
                  <LogOut className="size-4" aria-hidden />
                  {signingOut ? "Saindo…" : "Sair"}
                </button>
              ) : null}
            </>
          )}
        </section>

        {/* Sincronização */}
        <section className="mt-4 flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 sm:p-5">
          <span
            className={cx(
              "grid size-11 shrink-0 place-items-center rounded-2xl",
              syncError ? "bg-shani/14 text-shani" : "bg-tekhelet/14 text-tekhelet",
            )}
          >
            {syncError ? <CloudOff className="size-5" aria-hidden /> : <Cloud className="size-5" aria-hidden />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Sincronização</p>
            <p className={cx("text-sm", syncError ? "text-shani" : "text-muted")}>
              {syncError ??
                (cursor
                  ? `Última vez: ${new Date(cursor).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}`
                  : "Este aparelho ainda não enviou nada para a conta.")}
            </p>
          </div>
          <button
            type="button"
            disabled={syncing || isPending || !user}
            onClick={() => void sync()}
            aria-label="Sincronizar agora"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-tekhelet px-4 text-sm font-semibold text-on-accent disabled:opacity-60"
          >
            <RefreshCw className={cx("size-4", syncing && "animate-spin")} aria-hidden />
            <span className="hidden sm:inline">{syncing ? "Sincronizando…" : "Sincronizar"}</span>
          </button>
        </section>

        {/* Leitura */}
        <section className="mt-10">
          <SectionTitle>Leitura</SectionTitle>
          <div className="rounded-3xl border border-line bg-surface p-4 sm:p-5">
            <ReadingSettings />
          </div>
        </section>

        {/* Guardados */}
        <section className="mt-10">
          <SectionTitle>Guardados e notas</SectionTitle>
          <Segmented<Filter>
            label="Filtrar guardados"
            value={filter}
            onChange={setFilter}
            options={[
              { id: "all", label: `Tudo (${all.length})` },
              { id: "bookmark", label: "Guardados" },
              { id: "note", label: "Notas" },
            ]}
          />
          {shown.length === 0 ? (
            <div className="mt-3 rounded-3xl border border-dashed border-line px-5 py-6 text-muted">
              {filter === "note"
                ? "Nenhuma nota ainda. No leitor, toque no número de um versículo e escolha Nota."
                : "Nada guardado ainda. No leitor, toque no número de um versículo e escolha Guardar."}
            </div>
          ) : (
            <ul className="mt-3 overflow-hidden rounded-3xl border border-line bg-surface">
              {shown.map((mark) => {
                const book = bookById(mark.bookId);
                if (!book) return null;
                const Icon = mark.kind === "note" ? NotebookPen : Bookmark;
                return (
                  <li key={mark.id} className="border-b border-line last:border-b-0">
                    <Link
                      to="/ler/$book/$chapter"
                      params={{ book: book.id, chapter: String(mark.chapter) }}
                      hash={mark.verse > 0 ? `v${mark.verse}` : undefined}
                      className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-raised/50"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-shani/14 text-shani">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">
                          {book.namePt} {mark.chapter}
                          {mark.verse > 0 ? `:${mark.verse}` : ""}
                        </span>
                        <span className="block truncate text-sm text-muted">
                          {mark.kind === "note" ? mark.body : mark.verse > 0 ? "Versículo guardado" : "Capítulo guardado"}
                        </span>
                      </span>
                      <span {...originalProps(bookLang(book), "shrink-0 text-lg text-soft")}>{book.nameHe}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Documentos">
          <Link to="/privacidade" className="font-medium text-tekhelet hover:underline">
            Política de Privacidade
          </Link>
          <Link to="/termos" className="font-medium text-tekhelet hover:underline">
            Termos de Serviço
          </Link>
        </nav>
        {/* Atribuições exigidas pelas licenças das fontes do texto hebraico e do grego. */}
        <p className="mt-4 text-xs text-muted">
          Texto hebraico: Códice de Leningrado, pela Open Scriptures Hebrew Bible (CC BY 4.0). Texto grego: SBL Greek New
          Testament, © 2010 Society of Biblical Literature e Logos Bible Software (CC BY 4.0), com a análise morfológica da
          MorphGNT (CC BY-SA 3.0).
        </p>
      </Page>
    </Shell>
  );
}
