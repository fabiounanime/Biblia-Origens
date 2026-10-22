import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ALargeSmall, ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "@/components/ui";
import { ORIGINAL, SECTION_TONE, bookLang, originalProps, type Book, type ChapterRef } from "@/lib/bible/catalog";
import { displayHebrew, splitWords, type LetteredNote, type Verse, type WordInfo } from "@/lib/bible/corpus";
import { useLayers } from "@/lib/reader/layers";
import { SCALE_ORDER } from "@/lib/reader/use-pinch-font";
import { useMediaQuery } from "@/lib/use-media-query";
import { useStudy } from "@/lib/study/store";
import { PtWithNotes, NoteText, ChapterNotes, SourceNote } from "@/components/reader/chapter-text";
import {
  ChapterBookmark,
  ReaderHint,
  VerseSkeleton,
  EmptyChapter,
  ChapterPager,
} from "@/components/reader/chapter-chrome";
import { WordPanel } from "@/components/reader/word-panel";

/** Palavra escolhida no leitor do tablet e do desktop. */
type WordPick = { verse: number; word: number };

/** Palavras do original e do transliterado de um versículo, alinhadas pela posição. */
function verseWords(verse: Verse) {
  const he = splitWords(verse.he, "he").filter((_, index) => index % 2 === 0);
  const tr = splitWords(verse.tr, "tr")
    .filter((_, index) => index % 2 === 0)
    .map((word) => word.replace(/[.,;:!?]+$/, ""));
  return { he, tr };
}

/**
 * Leitor do tablet e do desktop (a partir de 768px): cada versículo palavra por
 * palavra, com o transliterado embaixo e o português depois. Tocar numa palavra
 * mostra o significado no painel ao lado (a partir de 1280px) ou numa folha
 * presa na base da tela. O celular continua com o leitor de sempre.
 */
export function DesktopReader({
  book,
  chapter,
  verses,
  words,
  notes,
  previous,
  next,
  onNote,
  onSettings,
}: {
  book: Book;
  chapter: number;
  verses: Verse[] | null | "loading";
  words: WordInfo[][] | "loading" | null;
  notes: LetteredNote[];
  previous: ChapterRef | null;
  next: ChapterRef | null;
  onNote: (verse: number) => void;
  onSettings: () => void;
}) {
  const layers = useLayers();
  const showNiqqud = useStudy((state) => state.showNiqqud);
  const fontScale = useStudy((state) => state.fontScale);
  const setFontScale = useStudy((state) => state.setFontScale);
  const wide = useMediaQuery("(min-width: 1280px)");
  const [pick, setPick] = useState<WordPick | null>(null);
  const [dockOpen, setDockOpen] = useState(false);
  const lang = bookLang(book);
  const original = ORIGINAL[lang];
  const list = Array.isArray(verses) ? verses : [];
  const hasText = list.length > 0;

  // Capítulo novo: volta à primeira palavra e fecha a folha.
  useEffect(() => {
    setPick(null);
    setDockOpen(false);
  }, [book.id, chapter]);

  const current = pick ?? (list[0] ? { verse: list[0].v, word: 0 } : null);
  const index = current ? list.findIndex((row) => row.v === current.verse) : -1;
  const verse = index >= 0 ? list[index] : null;
  const parts = verse ? verseWords(verse) : { he: [], tr: [] };
  const info = current && Array.isArray(words) ? words[index]?.[current.word] : undefined;
  const display = (word: string) => (lang === "he" ? displayHebrew(word, showNiqqud) : word);

  const choose = (verseNumber: number, word: number) => {
    setPick({ verse: verseNumber, word });
    setDockOpen(true);
  };

  // Próxima ou anterior palavra, atravessando os versículos.
  const move = (step: 1 | -1) => {
    if (!current || index < 0) return;
    const count = verseWords(list[index]).he.length;
    const word = current.word + step;
    if (word >= 0 && word < count) return setPick({ verse: current.verse, word });
    const other = list[index + step];
    if (!other) return;
    setPick({ verse: other.v, word: step === 1 ? 0 : verseWords(other).he.length - 1 });
  };
  const moveRef = useRef(move);
  moveRef.current = move;

  // J e K andam pelas palavras; Esc fecha a folha.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.metaKey || event.ctrlKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (event.key === "Escape") setDockOpen(false);
      if (event.key === "j" || event.key === "J") moveRef.current(-1);
      if (event.key === "k" || event.key === "K") moveRef.current(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scaleIndex = SCALE_ORDER.indexOf(fontScale);
  const stepScale = (step: number) => {
    const nextScale = SCALE_ORDER[Math.min(SCALE_ORDER.length - 1, Math.max(0, scaleIndex + step))];
    if (nextScale) setFontScale(nextScale);
  };

  const wordPanel =
    current && verse ? (
      <WordPanel
        compact={!wide}
        book={book}
        chapter={chapter}
        verse={verse}
        word={current.word}
        count={parts.he.length}
        original={display(parts.he[current.word] ?? "")}
        translit={parts.tr[current.word] ?? ""}
        info={words === "loading" ? "loading" : info}
        onMove={move}
        onClose={() => setDockOpen(false)}
        onNote={() => onNote(verse.v)}
      />
    ) : null;

  return (
    <div className="mx-auto grid w-full max-w-[1120px] gap-7 px-6 pt-6 pb-40 lg:px-8 xl:grid-cols-[minmax(0,45rem)_21rem] xl:justify-center xl:pb-16">
      <main className="min-w-0">
        <header className="flex items-center gap-1.5 pb-4">
          {previous ? (
            <Link
              to="/ler/$book/$chapter"
              params={{ book: previous.book.id, chapter: String(previous.chapter) }}
              aria-label={`Anterior: ${previous.book.namePt} ${previous.chapter} (←)`}
              className="grid size-11 shrink-0 place-items-center rounded-full text-soft hover:bg-raised hover:text-fg"
            >
              <ChevronLeft className="size-6" aria-hidden />
            </Link>
          ) : (
            <span className="grid size-11 shrink-0 place-items-center text-muted/40" aria-hidden>
              <ChevronLeft className="size-6" />
            </span>
          )}
          <div className="min-w-0 flex-1 ps-1">
            <h1 className="font-read text-[1.9rem] leading-tight font-semibold tracking-tight">
              {book.namePt} {chapter}
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              <span {...originalProps(lang, cx("text-base", SECTION_TONE[book.section].text))}>{book.nameHe}</span> ·{" "}
              {book.nameTranslit} · capítulo {chapter} de {book.chapters}
            </p>
          </div>
          {hasText ? <ChapterBookmark book={book} chapter={chapter} /> : null}
          <button
            type="button"
            onClick={onSettings}
            aria-label="Ajustes de leitura"
            aria-haspopup="dialog"
            className="grid size-11 shrink-0 place-items-center rounded-full text-soft hover:bg-raised hover:text-fg"
          >
            <ALargeSmall className="size-6" />
          </button>
          {next ? (
            <Link
              to="/ler/$book/$chapter"
              params={{ book: next.book.id, chapter: String(next.chapter) }}
              aria-label={`Próximo: ${next.book.namePt} ${next.chapter} (→)`}
              className="grid size-11 shrink-0 place-items-center rounded-full text-soft hover:bg-raised hover:text-fg"
            >
              <ChevronRight className="size-6" aria-hidden />
            </Link>
          ) : null}
        </header>

        {verses === "loading" ? <VerseSkeleton /> : null}
        {verses === null || (Array.isArray(verses) && verses.length === 0) ? (
          <EmptyChapter bookId={book.id} chapter={chapter} lang={lang} next={next} onNote={() => onNote(0)} />
        ) : null}

        {hasText ? (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="flex gap-0.5 rounded-2xl border border-line bg-sunken p-[3px]" role="group" aria-label="Camadas do texto">
                <DeskToggle on={layers.tr} onClick={() => layers.toggle("tr")} dot="bg-tekhelet" label="Transliterado" />
                <DeskToggle on={layers.inter} onClick={layers.toggleInter} dot="bg-soft" label="Significado" />
                <DeskToggle on={layers.pt} onClick={() => layers.toggle("pt")} dot="bg-fg" label="Português" />
              </div>
              <span className="flex-1" />
              <div className="flex gap-0.5 rounded-2xl border border-line bg-sunken p-[3px]" role="group" aria-label="Tamanho da letra">
                <button
                  type="button"
                  onClick={() => stepScale(-1)}
                  disabled={scaleIndex <= 0}
                  aria-label="Diminuir a letra"
                  className="grid h-11 w-11 place-items-center rounded-xl font-read text-[13px] text-soft hover:text-fg disabled:opacity-40"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => stepScale(1)}
                  disabled={scaleIndex >= SCALE_ORDER.length - 1}
                  aria-label="Aumentar a letra"
                  className="grid h-11 w-11 place-items-center rounded-xl font-read text-[19px] text-soft hover:text-fg disabled:opacity-40"
                >
                  A
                </button>
              </div>
            </div>

            <ReaderHint
              lang={lang}
              text={`Toque numa palavra em ${original.label.toLowerCase()} para ver o significado e a gramática; no número, para guardar ou anotar.`}
            />

            <div className="flex flex-col gap-3">
              {list.map((row, rowIndex) => {
                const on = current?.verse === row.v;
                const rowWords = verseWords(row);
                const glosses = Array.isArray(words) ? words[rowIndex] : null;
                return (
                  <article
                    key={row.v}
                    id={`v${row.v}`}
                    data-verse={row.v}
                    className={cx("desk-verse scroll-mt-6", on && "desk-verse-on")}
                  >
                    <button
                      type="button"
                      onClick={() => choose(row.v, 0)}
                      aria-label={`Versículo ${row.v}`}
                      aria-pressed={on}
                      className="-ms-2.5 -me-1.5 mt-1 grid size-11 shrink-0 place-items-center rounded-2xl"
                    >
                      <span className="desk-verse-num">{row.v}</span>
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-x-1 gap-y-0.5" dir={original.dir} lang={original.lang}>
                        {rowWords.he.map((word, wordIndex) => {
                          const picked = on && current?.word === wordIndex;
                          const gloss = glosses?.[wordIndex]?.g;
                          return (
                            <button
                              key={wordIndex}
                              type="button"
                              onClick={() => choose(row.v, wordIndex)}
                              aria-pressed={picked}
                              aria-label={`${rowWords.tr[wordIndex] || display(word)}, palavra ${wordIndex + 1}: ver o significado`}
                              className={cx("desk-word", picked && "desk-word-on")}
                            >
                              <span className={cx(original.font, "desk-word-original")}>{display(word)}</span>
                              {layers.tr ? (
                                <span className="desk-word-tr" dir="ltr">
                                  {rowWords.tr[wordIndex]}
                                </span>
                              ) : null}
                              {layers.inter ? (
                                <span className="desk-word-gloss" dir="ltr">
                                  {words === "loading" ? "…" : gloss ? <NoteText text={gloss} /> : "—"}
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                      {layers.pt ? (
                        <p className="read-pt mt-3.5 max-w-[62ch] border-t border-line pt-3.5">
                          <PtWithNotes text={row.pt} notes={notes.filter((note) => note.verse === row.v)} />
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
            <ChapterNotes chapter={chapter} notes={notes} />
            <SourceNote lang={lang} />
          </>
        ) : null}

        <ChapterPager previous={previous} next={next} />
        <p className="mt-4 text-center text-sm text-muted">
          <kbd className="desk-kbd">←</kbd> <kbd className="desk-kbd">→</kbd> capítulo · <kbd className="desk-kbd">J</kbd>{" "}
          <kbd className="desk-kbd">K</kbd> palavra · <kbd className="desk-kbd">/</kbd> ir para
        </p>
      </main>

      {wordPanel && wide ? (
        <aside className="sticky top-6 self-start" aria-label="Palavra escolhida">
          {wordPanel}
        </aside>
      ) : null}
      {wordPanel && !wide && dockOpen ? (
        <aside
          className="fixed inset-x-6 bottom-5 z-40 mx-auto max-w-[45rem] md:left-[calc(16rem+1.5rem)]"
          aria-label="Palavra escolhida"
        >
          {wordPanel}
        </aside>
      ) : null}
    </div>
  );
}

function DeskToggle({ on, onClick, dot, label }: { on: boolean; onClick: () => void; dot: string; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cx(
        "inline-flex h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold",
        on ? "bg-raised text-fg" : "text-muted hover:text-soft",
      )}
    >
      <span className={cx("size-2 rounded-full", dot, !on && "opacity-40")} aria-hidden />
      {label}
    </button>
  );
}
