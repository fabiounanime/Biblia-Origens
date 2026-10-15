import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Page, Shell } from "@/components/shell";
import { cx } from "@/components/ui";
import {
  BOOKS,
  SECTIONS,
  SECTION_TONE,
  bookLang,
  foldText,
  isSectionId,
  originalProps,
  type SectionId,
} from "@/lib/bible/catalog";
import { useStudy } from "@/lib/study/store";

type LerSearch = { secao?: SectionId };

export const Route = createFileRoute("/ler/")({
  validateSearch: (search: Record<string, unknown>): LerSearch => ({
    secao: isSectionId(search.secao) ? search.secao : undefined,
  }),
  head: () => ({ meta: [{ title: "Ler · Bíblia Origens" }] }),
  component: LerPage,
});

function LerPage() {
  const { secao } = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const position = useStudy((state) => state.position);
  const needle = foldText(query);

  const books = useMemo(
    () =>
      BOOKS.filter((book) => {
        if (secao && book.section !== secao) return false;
        if (!needle) return true;
        return (
          foldText(book.namePt).includes(needle) ||
          foldText(book.nameTranslit).includes(needle) ||
          book.nameHe.includes(query.trim())
        );
      }),
    [needle, query, secao],
  );

  const filters: { id: SectionId | undefined; label: string; dot?: string }[] = [
    { id: undefined, label: "Todos" },
    ...SECTIONS.map((section) => ({ id: section.id, label: section.title, dot: SECTION_TONE[section.id].dot })),
  ];

  return (
    <Shell>
      <Page title="Livros" lead="Os 66 livros: o Tanakh na ordem do cânon hebraico e, depois, o Novo Testamento.">
        {/* Busca e filtros ficam presos ao topo enquanto a lista rola */}
        <div className="glass sticky top-14 z-20 -mx-4 border-b border-line/60 px-4 pt-1 pb-3 sm:-mx-6 sm:px-6 md:top-0 md:pt-4">
          <label className="relative block">
            <span className="sr-only">Buscar livro</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar livro (ex.: Salmos, Tehillim)"
              className="h-12 w-full rounded-2xl border border-line bg-surface pr-11 pl-12 text-base placeholder:text-muted focus:border-tekhelet/60 focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-raised hover:text-fg"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </label>
          <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto" role="tablist" aria-label="Parte do Tanakh">
            {filters.map((filter) => {
              const active = filter.id === secao;
              return (
                <button
                  key={filter.label}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => void navigate({ to: "/ler", search: { secao: filter.id }, replace: true })}
                  className={cx(
                    "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                    active ? "border-fg bg-fg text-bg" : "border-line text-soft hover:border-muted",
                  )}
                >
                  {filter.dot ? <span className={cx("size-2 rounded-full", filter.dot)} aria-hidden /> : null}
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {SECTIONS.map((section) => {
          const rows = books.filter((book) => book.section === section.id);
          if (rows.length === 0) return null;
          const tone = SECTION_TONE[section.id];
          return (
            <section key={section.id} className="mt-8">
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-semibold tracking-tight">
                  {section.title} <span className="font-normal text-muted">{section.subtitle}</span>
                </h2>
                <span {...originalProps(section.lang, cx(section.lang === "he" ? "text-xl" : "text-lg", tone.text))}>
                  {section.nameHe}
                </span>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {rows.map((book) => {
                  const reading = position?.bookId === book.id;
                  return (
                    <li key={book.id}>
                      <Link
                        to="/ler/$book"
                        params={{ book: book.id }}
                        className="group flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 transition-colors hover:border-muted/60 hover:bg-raised/50"
                      >
                        <span className={cx("h-9 w-1 shrink-0 rounded-full", tone.dot)} aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate font-semibold">{book.namePt}</span>
                            {reading ? (
                              <span className="rounded-full bg-tekhelet/15 px-2 py-0.5 text-xs font-medium text-tekhelet">
                                Lendo
                              </span>
                            ) : null}
                          </span>
                          <span className="block truncate text-sm text-muted">
                            {book.nameTranslit}, {book.chapters} {book.chapters === 1 ? "capítulo" : "capítulos"}
                          </span>
                        </span>
                        <span
                          {...originalProps(
                            bookLang(book),
                            cx(bookLang(book) === "he" ? "shrink-0 text-2xl" : "max-w-[45%] truncate text-lg", tone.text),
                          )}
                        >
                          {book.nameHe}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        {books.length === 0 ? (
          <div className="mt-10 text-center text-muted">
            <p>Nenhum livro encontrado para “{query.trim()}”.</p>
            <button type="button" onClick={() => setQuery("")} className="mt-3 font-medium text-tekhelet">
              Limpar busca
            </button>
          </div>
        ) : null}
      </Page>
    </Shell>
  );
}
