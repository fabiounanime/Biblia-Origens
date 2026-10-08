import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Shell } from "@/components/shell";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { bookById } from "@/lib/bible/catalog";
import { activeMarks, useStudy } from "@/lib/study/store";
import type { FontScale } from "@/lib/study/types";

export const Route = createFileRoute("/conta")({
  head: () => ({ meta: [{ title: "Conta · Bíblia Origens" }] }),
  component: ContaPage,
});

const SCALES: { id: FontScale; label: string }[] = [
  { id: "sm", label: "Menor" },
  { id: "md", label: "Texto" },
  { id: "lg", label: "Maior" },
  { id: "xl", label: "Grande" },
];

function ContaPage() {
  const { user, isPending } = useCurrentUserState();
  const theme = useStudy((state) => state.theme);
  const fontScale = useStudy((state) => state.fontScale);
  const showNiqqud = useStudy((state) => state.showNiqqud);
  const setTheme = useStudy((state) => state.setTheme);
  const setFontScale = useStudy((state) => state.setFontScale);
  const setShowNiqqud = useStudy((state) => state.setShowNiqqud);
  const marks = useStudy((state) => state.marks);
  const cursor = useStudy((state) => state.cursor);
  const syncing = useStudy((state) => state.syncing);
  const syncError = useStudy((state) => state.syncError);
  const sync = useStudy((state) => state.sync);
  const saved = activeMarks(marks).filter((mark) => mark.kind === "bookmark");

  return (
    <Shell>
      <Page kicker="Aparelhos" title="Conta">
        <div className="min-h-12">
          {isPending ? <div className="h-8 w-40 animate-pulse rounded-full bg-surface" /> : null}
          {!isPending && user ? <UserButton /> : null}
          {!isPending && !user ? (
            <Link to="/login" className="inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-bg">
              Entrar ou criar conta
            </Link>
          ) : null}
        </div>
        <p className="mt-4 text-muted">
          Notas, capítulos guardados e o ponto de leitura ficam neste aparelho e sobem para a conta quando você sincroniza.
        </p>

        <section className="mt-10">
          <h2 className="text-sm uppercase tracking-widest text-gold">Aparência</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="min-h-11 rounded-full border border-line px-4"
            >
              {theme === "dark" ? "Modo escuro" : "Modo claro"}
            </button>
            {SCALES.map((scale) => (
              <button
                key={scale.id}
                type="button"
                onClick={() => setFontScale(scale.id)}
                className={`min-h-11 rounded-full border px-4 ${
                  fontScale === scale.id ? "border-gold text-gold" : "border-line"
                }`}
              >
                {scale.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowNiqqud(!showNiqqud)}
            className="mt-3 min-h-11 rounded-full border border-line px-4"
          >
            {showNiqqud ? "Nikud visível" : "Nikud oculto"}
          </button>
          <p className="mt-2 text-sm text-muted">Os sinais vocálicos aparecem quando o hebraico do acervo chegar.</p>
        </section>

        <section className="mt-10">
          <h2 className="text-sm uppercase tracking-widest text-gold">Sincronização</h2>
          <p className="mt-3 text-muted">
            {cursor
              ? `Última vez com a conta: ${new Date(cursor).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}.`
              : "Este aparelho ainda não enviou nada para a conta."}
          </p>
          {syncError ? <p className="mt-2 text-gold">{syncError}</p> : null}
          <button
            type="button"
            disabled={syncing || isPending || !user}
            onClick={() => void sync()}
            className="mt-4 min-h-11 rounded-full border border-gold px-5 text-gold disabled:opacity-50"
          >
            {syncing ? "Sincronizando…" : "Sincronizar agora"}
          </button>
        </section>

        <section className="mt-10">
          <h2 className="text-sm uppercase tracking-widest text-gold">Guardados</h2>
          {saved.length === 0 ? <p className="mt-3 text-muted">Nenhum capítulo guardado.</p> : null}
          <ul className="mt-2">
            {saved.map((mark) => {
              const book = bookById(mark.bookId);
              if (!book) return null;
              return (
                <li key={mark.id} className="border-b border-line">
                  <Link
                    to="/ler/$book/$chapter"
                    params={{ book: book.id, chapter: String(mark.chapter) }}
                    className="block min-h-14 py-3"
                  >
                    {book.namePt} {mark.chapter}
                    {mark.verse > 0 ? `:${mark.verse}` : ""}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </Page>
    </Shell>
  );
}
