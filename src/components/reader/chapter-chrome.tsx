import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, NotebookPen, Rows3 } from "lucide-react";
import { cx } from "@/components/ui";
import {
  ORIGINAL,
  SECTION_TONE,
  bookLang,
  originalProps,
  type Book,
  type ChapterRef,
  type OriginalLang,
} from "@/lib/bible/catalog";
import { isChapterPublished, useAcervoIndex } from "@/lib/bible/use-acervo";
import { LAYERS, useLayers } from "@/lib/reader/layers";
import { SCALE_LABEL, SCALE_ORDER } from "@/lib/reader/use-pinch-font";
import type { FontScale } from "@/lib/study/types";
import { findMark, useStudy } from "@/lib/study/store";
import { HINT_KEY, HINT_EVENT } from "@/lib/reader/hint";

/** Aviso flutuante durante a pinça: mostra o tamanho em que o texto vai encaixar. */
export function PinchIndicator({ scale }: { scale: FontScale | null }) {
  return (
    <div
      aria-live="polite"
      className={cx(
        "pointer-events-none fixed inset-x-0 top-[4.5rem] z-40 flex justify-center transition-opacity duration-200",
        scale ? "opacity-100" : "opacity-0",
      )}
    >
      {scale ? (
        <div className="glass flex items-center gap-3 rounded-full border border-line px-4 py-2 shadow-float">
          <span className="font-read text-lg font-semibold">Aa</span>
          <span className="text-sm font-semibold">{SCALE_LABEL[scale]}</span>
          <span className="flex items-center gap-1" aria-hidden>
            {SCALE_ORDER.map((id) => (
              <span
                key={id}
                className={cx(
                  "h-2 w-5 origin-center rounded-full transition-transform duration-150 ease-out",
                  id === scale ? "bg-tekhelet" : "scale-x-[0.4] bg-line",
                )}
              />
            ))}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** Guardar o capítulo: ícone no cabeçalho do leitor. */
export function ChapterBookmark({ book, chapter }: { book: Book; chapter: number }) {
  const marks = useStudy((state) => state.marks);
  const toggleBookmark = useStudy((state) => state.toggleBookmark);
  const saved = !!findMark(marks, book.id, chapter, 0, "bookmark");
  return (
    <button
      type="button"
      onClick={() => toggleBookmark(book.id, chapter, 0)}
      aria-pressed={saved}
      aria-label={saved ? "Capítulo guardado" : "Guardar capítulo"}
      className={cx(
        "grid size-11 shrink-0 place-items-center rounded-full hover:bg-raised",
        saved ? "text-shani" : "text-soft hover:text-fg",
      )}
    >
      {saved ? <BookmarkCheck key="on" className="pop size-6" aria-hidden /> : <Bookmark className="size-6" aria-hidden />}
    </button>
  );
}

export function ChapterHero({ book, chapter, controls }: { book: Book; chapter: number; controls: boolean }) {
  const tone = SECTION_TONE[book.section];
  const layers = useLayers();

  return (
    <header data-anchor className="pt-5 pb-5 text-center sm:pt-10 sm:pb-6">
      <p {...originalProps(bookLang(book), cx("text-4xl leading-tight sm:text-6xl", tone.text))}>{book.nameHe}</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:mt-2 sm:text-4xl">
        {book.namePt} {chapter}
      </h1>
      <p className="mt-0.5 text-sm text-muted sm:mt-1 sm:text-base">
        {book.nameTranslit} · capítulo {chapter} de {book.chapters}
      </p>

      {controls ? (
      <div className="mt-4 flex items-center justify-center gap-2 sm:mt-6">
        <div className="flex gap-1 rounded-2xl border border-line bg-surface p-1 shadow-edge" role="group" aria-label="Camadas do texto">
          {LAYERS.map((layer) => {
            const on = layers[layer.id];
            return (
              <button
                key={layer.id}
                type="button"
                aria-pressed={on}
                onClick={() => layers.toggle(layer.id)}
                title={`${on ? "Ocultar" : "Mostrar"} ${(layer.id === "he" ? ORIGINAL[bookLang(book)].label : layer.label).toLowerCase()}`}
                className={cx(
                  "inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors",
                  on ? "bg-raised text-fg shadow-edge" : "text-muted hover:text-soft",
                )}
              >
                <span className={cx("size-2 rounded-full transition-opacity", layer.dot, !on && "opacity-30")} aria-hidden />
                {layer.id === "he" ? ORIGINAL[bookLang(book)].short : layer.id.toUpperCase()}
                <span className="sr-only">{layer.id === "he" ? ORIGINAL[bookLang(book)].label : layer.label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={layers.toggleInter}
          aria-pressed={layers.inter}
          title={layers.inter ? "Voltar ao texto corrido" : "Ver palavra por palavra"}
          className={cx(
            "inline-flex h-13 items-center gap-1.5 rounded-2xl border px-3.5 text-sm font-semibold transition-colors",
            layers.inter ? "border-tekhelet/60 bg-tekhelet/12 text-tekhelet" : "border-line text-soft hover:border-muted",
          )}
        >
          <Rows3 className="size-4" aria-hidden />
          Interlinear
        </button>
      </div>
      ) : null}
    </header>
  );
}

/** Como usar o leitor: aparece até a pessoa tocar em "Entendi", e não volta mais neste aparelho. */
export function ReaderHint({ lang, text }: { lang: OriginalLang; text?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(localStorage.getItem(HINT_KEY) !== "1");
    } catch {
      setShow(true);
    }
    const again = () => setShow(true);
    window.addEventListener(HINT_EVENT, again);
    return () => window.removeEventListener(HINT_EVENT, again);
  }, []);
  if (!show) return null;
  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      // Sem armazenamento: a dica volta na próxima visita.
    }
  };
  return (
    <aside className="mb-2 flex items-center gap-3 rounded-2xl border border-line bg-surface py-1.5 ps-4 pe-1.5 text-sm text-soft shadow-edge">
      <p className="flex-1 leading-snug">
        {text ??
          `Toque numa palavra em ${ORIGINAL[lang].label.toLowerCase()} para ver o significado, e no versículo para guardar ou anotar.`}
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="inline-flex h-11 shrink-0 items-center rounded-xl px-3 font-semibold text-tekhelet hover:bg-raised"
      >
        Entendi
      </button>
    </aside>
  );
}

export function VerseSkeleton() {
  return (
    <div className="space-y-8 py-4" aria-label="Abrindo o capítulo" role="status">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex gap-3.5">
          <div className="size-8 shrink-0 animate-pulse rounded-full bg-raised" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-full animate-pulse rounded-full bg-raised" />
            <div className="h-4 w-11/12 animate-pulse rounded-full bg-raised" />
            <div className="ml-auto h-6 w-3/4 animate-pulse rounded-full bg-raised/70" />
            <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-raised/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyChapter({
  bookId,
  chapter,
  lang,
  next,
  onNote,
}: {
  bookId: string;
  chapter: number;
  lang: OriginalLang;
  /** Próximo capítulo já publicado, para não terminar num beco. */
  next: ChapterRef | null;
  onNote: () => void;
}) {
  const marks = useStudy((state) => state.marks);
  const note = findMark(marks, bookId, chapter, 0, "note");
  return (
    <div className="rounded-[28px] border border-dashed border-line bg-surface/60 px-5 py-8 text-center sm:px-8">
      <div className="mx-auto flex w-fit gap-2" aria-hidden>
        {LAYERS.map((layer) => (
          <span key={layer.id} className={cx("size-2.5 rounded-full", layer.dot)} />
        ))}
      </div>
      <h2 className="mt-4 text-xl font-semibold">Este capítulo ainda está em tradução</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">
        A tradução sai livro a livro. A tradução direta, o {ORIGINAL[lang].label.toLowerCase()} e o transliterado aparecem aqui
        assim que forem publicados.
      </p>
      {note?.body ? (
        <p className="mx-auto mt-5 max-w-md rounded-2xl border-l-[3px] border-shani bg-shani/8 px-4 py-3 text-left text-sm whitespace-pre-line text-soft">
          {note.body}
        </p>
      ) : null}
      <div className="mt-5 flex flex-col items-center gap-2">
        {next ? (
          <Link
            to="/ler/$book/$chapter"
            params={{ book: next.book.id, chapter: String(next.chapter) }}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-tekhelet px-5 font-semibold text-on-accent"
          >
            Ler {next.book.namePt} {next.chapter}
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <Link to="/ler" className="inline-flex h-12 items-center rounded-full bg-tekhelet px-5 font-semibold text-on-accent">
            Ver os livros publicados
          </Link>
        )}
        <button
          type="button"
          onClick={onNote}
          className="inline-flex h-11 items-center gap-2 rounded-full px-4 font-medium text-tekhelet hover:bg-raised"
        >
          <NotebookPen className="size-4" aria-hidden />
          {note ? "Editar nota do capítulo" : "Escrever nota do capítulo"}
        </button>
      </div>
    </div>
  );
}

export function ChapterPager({ previous, next }: { previous: ChapterRef | null; next: ChapterRef | null }) {
  return (
    <nav className="mt-10 grid grid-cols-2 gap-3" aria-label="Capítulos">
      {previous ? (
        <Link
          to="/ler/$book/$chapter"
          params={{ book: previous.book.id, chapter: String(previous.chapter) }}
          className="pressable flex min-h-16 items-center gap-2 rounded-2xl border border-line bg-surface px-3 hover:border-tekhelet/50"
        >
          <ChevronLeft className="size-5 shrink-0 text-muted" aria-hidden />
          <span className="min-w-0">
            <span className="block text-xs text-muted">Anterior</span>
            <span className="block truncate font-semibold">
              {previous.book.namePt} {previous.chapter}
            </span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          to="/ler/$book/$chapter"
          params={{ book: next.book.id, chapter: String(next.chapter) }}
          className="pressable flex min-h-16 items-center justify-end gap-2 rounded-2xl bg-tekhelet px-3 text-right text-on-accent"
        >
          <span className="min-w-0">
            <span className="block text-xs opacity-80">Próximo</span>
            <span className="block truncate font-semibold">
              {next.book.namePt} {next.chapter}
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0" aria-hidden />
        </Link>
      ) : (
        <span className="flex min-h-16 items-center justify-end rounded-2xl border border-dashed border-line px-3 text-right text-sm text-muted">
          Fim do que já foi publicado
        </span>
      )}
    </nav>
  );
}

export function ChapterGrid({
  book,
  chapter,
  acervo,
  onPick,
}: {
  book: Book;
  chapter: number;
  acervo: ReturnType<typeof useAcervoIndex>;
  onPick: () => void;
}) {
  return (
    <ol className="grid grid-cols-6 gap-2 sm:grid-cols-8">
      {Array.from({ length: book.chapters }, (_, index) => index + 1).map((n) => (
        <li key={n}>
          <Link
            to="/ler/$book/$chapter"
            params={{ book: book.id, chapter: String(n) }}
            onClick={onPick}
            aria-current={n === chapter ? "page" : undefined}
            aria-label={isChapterPublished(acervo, book.id, n) ? undefined : `Capítulo ${n}, em tradução`}
            className={cx(
              "grid h-11 place-items-center rounded-xl text-sm font-semibold tabular-nums transition-colors",
              n === chapter
                ? "bg-tekhelet text-on-accent"
                : isChapterPublished(acervo, book.id, n)
                  ? "bg-raised/70 hover:bg-raised"
                  : "border border-dashed border-line text-muted",
            )}
          >
            {n}
          </Link>
        </li>
      ))}
    </ol>
  );
}
