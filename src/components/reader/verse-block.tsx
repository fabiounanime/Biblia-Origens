import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bookmark, BookmarkCheck, Check, Copy, NotebookPen, Share2, X } from "lucide-react";
import { cx } from "@/components/ui";
import { bookLang, bookRef, type Book } from "@/lib/bible/catalog";
import { displayHebrew, type LetteredNote, type Verse, type WordInfo } from "@/lib/bible/corpus";
import { useLayers } from "@/lib/reader/layers";
import { findMark, useStudy } from "@/lib/study/store";
import { PtWithNotes } from "@/components/reader/chapter-text";
import { type GlossLayer, type Gloss, GlossLine, InterlinearLine } from "@/components/reader/gloss";

export function VerseBlock({
  book,
  chapter,
  verse,
  open,
  onToggle,
  onNote,
  notes,
  gloss,
  onGloss,
  words,
}: {
  book: Book;
  chapter: number;
  verse: Verse;
  open: boolean;
  onToggle: () => void;
  onNote: () => void;
  notes: LetteredNote[];
  gloss: Gloss;
  onGloss: (layer: GlossLayer, word: number | null) => void;
  words: WordInfo[] | "loading" | null;
}) {
  const layers = useLayers();
  const showNiqqud = useStudy((state) => state.showNiqqud);
  const marks = useStudy((state) => state.marks);
  const toggleBookmark = useStudy((state) => state.toggleBookmark);
  const saved = !!findMark(marks, book.id, chapter, verse.v, "bookmark");
  const note = findMark(marks, book.id, chapter, verse.v, "note");
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  // A barra de ações flutua na base da tela: rola o versículo para ela não cobri-lo.
  useEffect(() => {
    if (!open) return;
    const node = articleRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const limit = window.innerHeight - (window.matchMedia("(min-width: 768px)").matches ? 110 : 180);
    if (rect.bottom > limit) {
      const top = Math.min(rect.bottom - limit, rect.top - 72);
      if (top > 0) window.scrollBy({ top, behavior: "smooth" });
    }
  }, [open]);

  const lines = [`${book.namePt} ${chapter}:${verse.v}`, verse.pt, verse.he, verse.tr].filter(Boolean);
  // Compartilhar só aparece onde o aparelho oferece (celulares, em geral).
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function copy() {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function share() {
    try {
      await navigator.share({ title: `${book.namePt} ${chapter}:${verse.v}`, text: lines.join("\n") });
    } catch {
      // Cancelado pela pessoa ou indisponível: nada a fazer.
    }
  }

  return (
    <article
      ref={articleRef}
      id={`v${verse.v}`}
      data-verse={verse.v}
      className={cx(
        "relative -mx-3 scroll-mt-20 rounded-3xl px-3 py-5 transition-colors",
        open && "bg-surface shadow-edge ring-1 ring-tekhelet/30",
      )}
    >
      <div className="flex gap-3.5">
        {/* Alvo de 44px; o chip visível continua com 32px. */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`Versículo ${verse.v}: ações`}
          className="group/num -mx-1.5 -mt-0.5 grid size-11 shrink-0 place-items-center self-start rounded-2xl"
        >
          <span
            className={cx(
              "grid h-8 min-w-8 place-items-center rounded-xl px-1.5 text-xs font-semibold tabular-nums transition-colors",
              saved
                ? "bg-shani text-on-accent"
                : open
                  ? "bg-tekhelet text-on-accent"
                  : "bg-raised text-soft group-hover/num:bg-tekhelet/20 group-hover/num:text-fg",
            )}
          >
            {verse.v}
          </span>
        </button>
        <div className="min-w-0 flex-1 space-y-3">
          {layers.pt ? (
            // Tocar no texto também abre as ações (menos ao selecionar texto ou tocar numa nota).
            <p
              className="read-pt"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("button")) return;
                if (window.getSelection()?.toString()) return;
                onToggle();
              }}
            >
              <PtWithNotes text={verse.pt} notes={notes.filter((note) => note.verse === verse.v)} />
            </p>
          ) : null}
          {layers.inter ? (
            <InterlinearLine
              lang={bookLang(book)}
              he={verse.he}
              tr={verse.tr}
              showTr={layers.tr}
              display={(word) => displayHebrew(word, showNiqqud)}
              words={words}
            />
          ) : null}
          {layers.he && !layers.inter ? (
            <GlossLine
              layer="he"
              lang={bookLang(book)}
              text={verse.he}
              he={verse.he}
              tr={verse.tr}
              display={(word) => displayHebrew(word, showNiqqud)}
              active={gloss?.layer === "he" ? gloss.word : null}
              echo={gloss?.layer === "tr" ? gloss.word : null}
              onPick={(word) => onGloss("he", word)}
              onClose={() => onGloss("he", null)}
              reference={`${book.namePt} ${chapter}:${verse.v}`}
              translation={verse.pt}
              words={words}
            />
          ) : null}
          {layers.tr && !layers.inter ? (
            <GlossLine
              layer="tr"
              lang={bookLang(book)}
              text={verse.tr}
              he={verse.he}
              tr={verse.tr}
              display={(word) => word}
              active={gloss?.layer === "tr" ? gloss.word : null}
              echo={gloss?.layer === "he" ? gloss.word : null}
              onPick={(word) => onGloss("tr", word)}
              onClose={() => onGloss("tr", null)}
              reference={`${book.namePt} ${chapter}:${verse.v}`}
              translation={verse.pt}
              words={words}
            />
          ) : null}

          {note?.body ? (
            <button
              type="button"
              onClick={onNote}
              className="flex w-full items-start gap-2 rounded-2xl border-l-[3px] border-shani bg-shani/8 px-3 py-2 text-left text-sm text-soft"
            >
              <NotebookPen className="mt-0.5 size-4 shrink-0 text-shani" aria-hidden />
              <span className="line-clamp-3 whitespace-pre-line">{note.body}</span>
            </button>
          ) : null}

          {open ? (
            <div
              role="toolbar"
              aria-label={`Ações de ${book.namePt} ${chapter}:${verse.v}`}
              className="verse-bar glass fixed inset-x-3 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+4.75rem)] z-40 mx-auto flex max-w-md items-center gap-0.5 rounded-3xl border border-line px-1.5 py-1.5 shadow-float md:bottom-6 md:left-64"
            >
              <span className="ms-2 me-auto min-w-0 truncate text-sm font-semibold text-zahav tabular-nums">
                {bookRef(book.id, chapter, verse.v)}
              </span>
              <BarButton
                onClick={() => toggleBookmark(book.id, chapter, verse.v)}
                active={saved}
                icon={saved ? <BookmarkCheck className="pop size-5" /> : <Bookmark className="size-5" />}
                label={saved ? "Guardado" : "Guardar"}
              />
              <BarButton onClick={onNote} active={!!note} icon={<NotebookPen className="size-5" />} label={note ? "Editar" : "Nota"} />
              <BarButton
                onClick={() => void copy()}
                active={copied}
                icon={copied ? <Check className="size-5" /> : <Copy className="size-5" />}
                label={copied ? "Copiado" : "Copiar"}
              />
              {canShare ? (
                <BarButton onClick={() => void share()} active={false} icon={<Share2 className="size-5" />} label="Enviar" />
              ) : null}
              <button
                type="button"
                onClick={onToggle}
                aria-label="Fechar ações"
                className="grid size-11 shrink-0 place-items-center rounded-2xl text-muted hover:bg-raised hover:text-fg"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** Botão da barra de ações do versículo: ícone em cima, rótulo embaixo. */
function BarButton({
  onClick,
  active,
  icon,
  label,
}: {
  onClick: () => void;
  active: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex h-12 min-w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-1.5 text-[11px] font-semibold transition-colors",
        active ? "text-shani" : "text-soft hover:bg-raised hover:text-fg",
      )}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </button>
  );
}
