import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Shell } from "@/components/shell";
import { BOOKS, SECTIONS } from "@/lib/bible/catalog";

export const Route = createFileRoute("/ler/")({
  head: () => ({ meta: [{ title: "Ler · Bíblia Origens" }] }),
  component: LerPage,
});

function LerPage() {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const books = useMemo(
    () =>
      BOOKS.filter((book) => {
        if (!needle) return true;
        return (
          book.namePt.toLowerCase().includes(needle) ||
          book.nameTranslit.toLowerCase().includes(needle) ||
          book.nameHe.includes(query.trim())
        );
      }),
    [needle, query],
  );

  return (
    <Shell>
      <Page kicker="Tanakh · 39 livros" title="Ler">
        <p className="text-muted">
          Ordem do cânon hebraico. O texto de cada capítulo entra com o acervo, sempre nesta ordem: português, hebraico, transliterado.
        </p>
        <label className="mt-6 block">
          <span className="sr-only">Buscar livro</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar livro"
            className="w-full rounded-2xl border border-line bg-surface px-4 py-3 placeholder:text-muted"
          />
        </label>
        {SECTIONS.map((section) => {
          const rows = books.filter((book) => book.section === section.id);
          if (rows.length === 0) return null;
          return (
            <section key={section.id} className="mt-10">
              <h2 className="text-sm uppercase tracking-widest text-gold">
                {section.title}
                <span className="ml-2 text-muted normal-case tracking-normal">{section.subtitle}</span>
              </h2>
              <ul className="mt-2">
                {rows.map((book) => (
                  <li key={book.id} className="border-b border-line">
                    <Link to="/ler/$book" params={{ book: book.id }} className="flex min-h-16 items-center justify-between gap-4 py-3">
                      <span>
                        <span className="block text-2xl">{book.namePt}</span>
                        <span className="text-muted italic">{book.nameTranslit}</span>
                      </span>
                      <span className="he text-gold" lang="he" dir="rtl">
                        {book.nameHe}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {books.length === 0 ? <p className="mt-8 text-muted">Nenhum livro com esse nome.</p> : null}
      </Page>
    </Shell>
  );
}
