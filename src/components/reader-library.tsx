import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";
import { cx } from "@/components/ui";
import { SECTION_TONE, bookLang, bookRef, originalProps, parseRef, sectionById, type Book } from "@/lib/bible/catalog";
import { isChapterPublished, useAcervoIndex } from "@/lib/bible/use-acervo";
import { activeMarks, useStudy } from "@/lib/study/store";

/**
 * Biblioteca na lateral do leitor (tablet e desktop): ir direto a uma
 * referência, o livro aberto com a grade de capítulos e os guardados do capítulo.
 */
export function ReaderLibrary({ book, chapter }: { book: Book; chapter: number }) {
  const navigate = useNavigate();
  const acervo = useAcervoIndex();
  const marks = useStudy((state) => state.marks);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const tone = SECTION_TONE[book.section];
  const saved = activeMarks(marks)
    .filter((mark) => mark.bookId === book.id && mark.chapter === chapter && mark.verse > 0)
    .sort((a, b) => a.verse - b.verse);

  // "/" leva à busca, como em muitos leitores.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const ref = parseRef(query);
    if (!ref) {
      toast("Referência não encontrada", { description: "Tente, por exemplo, “Gn 12:3” ou “Salmos 23”." });
      return;
    }
    setQuery("");
    inputRef.current?.blur();
    if (!ref.chapter) {
      void navigate({ to: "/ler/$book", params: { book: ref.book.id } });
      return;
    }
    void navigate({
      to: "/ler/$book/$chapter",
      params: { book: ref.book.id, chapter: String(ref.chapter) },
      hash: ref.verse ? `v${ref.verse}` : undefined,
    });
  };

  return (
    <div className="mt-6 flex min-h-0 flex-col gap-3">
      <div className="mx-2 h-px bg-line" aria-hidden />
      <p className="px-3 text-xs font-bold text-muted">Biblioteca</p>
      <form onSubmit={onSubmit} role="search">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-field bg-sunken px-3 text-muted focus-within:border-tekhelet/70">
          <Search className="size-4 shrink-0" aria-hidden />
          <span className="sr-only">Ir para um livro ou versículo</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ir para… Gn 12:3"
            aria-keyshortcuts="/"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
          />
          <kbd className="grid h-6 min-w-6 place-items-center rounded-md border border-line px-1 text-[11px] font-bold text-soft" aria-hidden>
            /
          </kbd>
        </label>
      </form>

      <div className="rounded-2xl border border-line bg-surface p-3">
        <Link
          to="/ler"
          className="flex min-h-11 items-center justify-between gap-2 rounded-xl px-2 hover:bg-raised"
          aria-label={`Trocar de livro (agora: ${book.namePt})`}
        >
          <span className="min-w-0">
            <span className="block truncate font-read text-[1.05rem] font-semibold text-fg">{book.namePt}</span>
            <span className="block text-xs text-muted">
              {sectionById(book.section).title} · {book.chapters} cap.
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            <span {...originalProps(bookLang(book), cx("text-lg leading-none", tone.text))}>{book.nameHe}</span>
            <ChevronRight className="size-4 text-muted" aria-hidden />
          </span>
        </Link>
        <ol className="mt-2 grid grid-cols-7 gap-0.5" aria-label={`Capítulos de ${book.namePt}`}>
          {Array.from({ length: book.chapters }, (_, index) => index + 1).map((n) => {
            const current = n === chapter;
            const published = isChapterPublished(acervo, book.id, n);
            return (
              <li key={n}>
                <Link
                  to="/ler/$book/$chapter"
                  params={{ book: book.id, chapter: String(n) }}
                  aria-current={current ? "page" : undefined}
                  aria-label={`Capítulo ${n}${published ? "" : ", em tradução"}`}
                  className={cx(
                    "grid h-8 place-items-center rounded-lg text-[13px] font-semibold tabular-nums",
                    current
                      ? "bg-tekhelet text-on-accent"
                      : published
                        ? "text-soft hover:bg-raised hover:text-fg"
                        : "text-muted/60 hover:bg-raised",
                  )}
                >
                  {n}
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="rounded-2xl border border-line bg-raised/60 px-3.5 py-3">
        <p className="text-xs text-muted">Guardados neste capítulo</p>
        {saved.length === 0 ? (
          <p className="mt-1 text-sm text-soft">Nenhum ainda.</p>
        ) : (
          <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {saved.map((mark) => (
              <li key={mark.id}>
                <a
                  href={`#v${mark.verse}`}
                  className="inline-flex min-h-8 items-center text-sm font-semibold text-fg tabular-nums hover:text-tekhelet"
                >
                  {bookRef(book.id, chapter, mark.verse)}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
