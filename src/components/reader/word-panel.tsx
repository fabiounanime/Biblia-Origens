import { useState } from "react";
import { Bookmark, BookmarkCheck, Check, ChevronLeft, ChevronRight, Copy, NotebookPen, X } from "lucide-react";
import { cx } from "@/components/ui";
import { ORIGINAL, bookLang, bookRef, originalProps, type Book } from "@/lib/bible/catalog";
import type { Verse, WordInfo } from "@/lib/bible/corpus";
import { findMark, useStudy } from "@/lib/study/store";
import { NoteText } from "@/components/reader/chapter-text";

/** Painel da palavra: ao lado do texto (desktop) ou compacto, preso na base (tablet). */
export function WordPanel({
  compact,
  book,
  chapter,
  verse,
  word,
  count,
  original,
  translit,
  info,
  onMove,
  onClose,
  onNote,
}: {
  compact: boolean;
  book: Book;
  chapter: number;
  verse: Verse;
  word: number;
  count: number;
  original: string;
  translit: string;
  info: WordInfo | "loading" | undefined;
  onMove: (step: 1 | -1) => void;
  onClose: () => void;
  onNote: () => void;
}) {
  const lang = bookLang(book);
  const rtl = ORIGINAL[lang].dir === "rtl";
  const marks = useStudy((state) => state.marks);
  const toggleBookmark = useStudy((state) => state.toggleBookmark);
  const saved = !!findMark(marks, book.id, chapter, verse.v, "bookmark");
  const note = findMark(marks, book.id, chapter, verse.v, "note");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText([`${book.namePt} ${chapter}:${verse.v}`, verse.pt, verse.he, verse.tr].join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const meaning =
    info === "loading" ? (
      <p className="text-sm text-muted" role="status">
        Abrindo o significado…
      </p>
    ) : !info ? (
      <p className="text-sm text-muted">O significado desta palavra não pôde ser aberto agora.</p>
    ) : (
      <>
        <p className="font-read text-[1.45rem] leading-snug font-semibold text-fg" aria-live="polite">
          <NoteText text={info.g} />
        </p>
        {info.o ? (
          <p className="mt-0.5 text-sm text-soft">
            Também: <NoteText text={info.o} />
          </p>
        ) : null}
        <p className={cx("mt-2 text-sm leading-relaxed text-soft", compact && "line-clamp-1")}>{info.m}</p>
      </>
    );

  const stepper = (
    <div className="flex items-center gap-1.5" dir={rtl ? "rtl" : "ltr"}>
      <button
        type="button"
        onClick={() => onMove(-1)}
        aria-label="Palavra anterior (J)"
        className="grid size-11 place-items-center rounded-full border border-line text-soft hover:bg-raised hover:text-fg"
      >
        {rtl ? <ChevronRight className="size-5" aria-hidden /> : <ChevronLeft className="size-5" aria-hidden />}
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        aria-label="Próxima palavra (K)"
        className="grid size-11 place-items-center rounded-full border border-line text-soft hover:bg-raised hover:text-fg"
      >
        {rtl ? <ChevronLeft className="size-5" aria-hidden /> : <ChevronRight className="size-5" aria-hidden />}
      </button>
    </div>
  );

  const reference = `${bookRef(book.id, chapter, verse.v)} · palavra ${word + 1} de ${count}`;

  if (compact) {
    return (
      <section className="relative flex items-center gap-5 rounded-3xl border border-line bg-surface py-3.5 ps-5 pe-14 shadow-float">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar (Esc)"
          className="absolute top-1.5 right-1.5 grid size-11 place-items-center rounded-full text-muted hover:bg-raised hover:text-fg"
        >
          <X className="size-5" aria-hidden />
        </button>
        <p {...originalProps(lang, "shrink-0 text-[2.6rem] leading-tight text-zahav")}>{original}</p>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-muted tabular-nums">{reference}</p>
          {meaning}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5 self-end">
          {stepper}
          <button
            type="button"
            onClick={() => toggleBookmark(book.id, chapter, verse.v)}
            aria-pressed={saved}
            className={cx("text-xs font-semibold", saved ? "text-shani" : "text-tekhelet")}
          >
            {saved ? `${bookRef(book.id, chapter, verse.v)} guardado` : `Guardar ${bookRef(book.id, chapter, verse.v)}`}
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <section className="rounded-3xl border border-line bg-surface px-5 pt-5 pb-4">
        <p className="text-[13px] font-bold text-muted tabular-nums">{reference}</p>
        <p {...originalProps(lang, "mt-3 text-center text-[3.75rem] leading-[1.15] text-zahav")}>{original}</p>
        <p className="text-center font-read text-lg text-[color-mix(in_srgb,var(--c-tekhelet)_62%,var(--c-muted))] italic">
          {translit}
        </p>
        <div className="mt-4">{meaning}</div>
        {info && info !== "loading" && info.l ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-sunken px-3.5 py-2.5">
            <span className="text-[13px] text-soft">Forma de dicionário</span>
            <span {...originalProps(lang, "text-[1.35rem] text-soft")}>{info.l}</span>
          </div>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
          <span className="text-[13px] text-soft">{rtl ? "Lê da direita para a esquerda" : "Palavra por palavra"}</span>
          {stepper}
        </div>
      </section>
      <section className="rounded-3xl border border-line bg-surface px-4 pt-4 pb-4">
        <p className="text-[13px] font-bold text-muted">
          {book.namePt} {chapter}:{verse.v}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => toggleBookmark(book.id, chapter, verse.v)}
            aria-pressed={saved}
            className={cx("desk-act", saved && "text-shani")}
          >
            {saved ? <BookmarkCheck key="on" className="pop size-5" aria-hidden /> : <Bookmark className="size-5" aria-hidden />}
            {saved ? "Guardado" : "Guardar"}
          </button>
          <button type="button" onClick={onNote} className={cx("desk-act", note && "text-shani")}>
            <NotebookPen className="size-5" aria-hidden />
            {note ? "Editar nota" : "Nota"}
          </button>
          <button type="button" onClick={() => void copy()} className={cx("desk-act", copied && "text-tekhelet")}>
            {copied ? <Check className="size-5" aria-hidden /> : <Copy className="size-5" aria-hidden />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </section>
    </div>
  );
}
