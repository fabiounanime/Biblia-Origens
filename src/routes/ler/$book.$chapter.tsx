import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ALargeSmall, ChevronDown, ChevronLeft, ScrollText } from "lucide-react";
import { Page, Shell } from "@/components/shell";
import { ReaderLibrary } from "@/components/reader-library";
import { ReadingSettings } from "@/components/reading-settings";
import { Sheet, cx } from "@/components/ui";
import { SECTION_TONE, bookById, bookLang, type ChapterRef } from "@/lib/bible/catalog";
import { chapterNotes, loadChapter, loadWords, type Verse, type WordInfo } from "@/lib/bible/corpus";
import { publishedNeighbor, useAcervoIndex } from "@/lib/bible/use-acervo";
import { usePinchFont } from "@/lib/reader/use-pinch-font";
import { useChapterSwipe } from "@/lib/reader/use-chapter-swipe";
import { useReadingPosition, useScrollProgress } from "@/lib/reader/use-reading-position";
import { useMediaQuery } from "@/lib/use-media-query";
import { ChapterNotes, SourceNote } from "@/components/reader/chapter-text";
import type { Gloss } from "@/components/reader/gloss";
import { VerseBlock } from "@/components/reader/verse-block";
import { showReaderHint } from "@/lib/reader/hint";
import {
  PinchIndicator,
  ChapterBookmark,
  ChapterHero,
  ReaderHint,
  VerseSkeleton,
  EmptyChapter,
  ChapterPager,
  ChapterGrid,
} from "@/components/reader/chapter-chrome";
import { NoteSheet } from "@/components/reader/note-sheet";
import { DesktopReader } from "@/components/reader/desktop-reader";

export const Route = createFileRoute("/ler/$book/$chapter")({
  head: ({ params }) => {
    const book = bookById(params.book);
    return { meta: [{ title: book ? `${book.namePt} ${params.chapter} · Bíblia Origens` : "Bíblia Origens" }] };
  },
  component: ChapterPage,
});

type SheetName = "chapters" | "settings" | null;

function ChapterPage() {
  const { book: bookId, chapter: chapterParam } = Route.useParams();
  const chapter = Number(chapterParam);
  const book = bookById(bookId);
  const valid = !!book && Number.isInteger(chapter) && chapter >= 1 && chapter <= (book?.chapters ?? 0);
  const navigate = useNavigate();
  const [verses, setVerses] = useState<Verse[] | null | "loading">("loading");
  const [sheet, setSheet] = useState<SheetName>(null);
  const [noteFor, setNoteFor] = useState<number | null>(null);
  const [openVerse, setOpenVerse] = useState<number | null>(null);
  const [gloss, setGloss] = useState<Gloss>(null);
  const [words, setWords] = useState<WordInfo[][] | "loading" | null>("loading");
  const notes = Array.isArray(verses) ? chapterNotes(verses) : [];
  const progressRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const pinchPreview = usePinchFont(mainRef, valid);
  // Tablet e desktop usam o leitor palavra por palavra; o celular, o de sempre.
  const desktop = useMediaQuery("(min-width: 768px)");

  // Anterior e próximo pulam os capítulos que ainda não chegaram ao acervo.
  const acervo = useAcervoIndex();
  const previous = valid ? publishedNeighbor(acervo, bookId, chapter, -1) : null;
  const next = valid ? publishedNeighbor(acervo, bookId, chapter, 1) : null;

  const go = useCallback(
    (ref: ChapterRef | null) => {
      if (!ref) return;
      void navigate({
        to: "/ler/$book/$chapter",
        params: { book: ref.book.id, chapter: String(ref.chapter) },
      });
    },
    [navigate],
  );

  useReadingPosition(valid, bookId, chapter, verses);
  useScrollProgress(progressRef, verses);
  const swipe = useChapterSwipe(mainRef, previous, next, go);

  useEffect(() => {
    if (!valid) return;
    let cancel = false;
    setVerses("loading");
    setOpenVerse(null);
    setGloss(null);
    setWords("loading");
    void loadWords(bookId, chapter)
      .catch(() => null)
      .then((rows) => {
        if (!cancel) setWords(rows);
      });
    void loadChapter(bookId, chapter)
      .catch(() => null)
      .then((rows) => {
        if (!cancel) setVerses(rows);
      });
    return () => {
      cancel = true;
    };
  }, [valid, bookId, chapter]);

  // Chegou com #v12: leva direto ao versículo.
  useEffect(() => {
    if (!Array.isArray(verses) || verses.length === 0) return;
    const hash = window.location.hash.slice(1);
    if (!/^v\d+$/.test(hash)) return;
    document.getElementById(hash)?.scrollIntoView({ block: "start" });
  }, [verses]);

  // Balão da tradução: fecha ao tocar fora dele ou com Esc.
  useEffect(() => {
    if (!gloss) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-gloss]")) return;
      setGloss(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGloss(null);
    };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [gloss]);

  // Setas do teclado trocam de capítulo.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (sheet || noteFor !== null || gloss || event.altKey || event.metaKey || event.ctrlKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (event.key === "ArrowRight") go(next);
      if (event.key === "ArrowLeft") go(previous);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, next, previous, sheet, noteFor, gloss]);

  if (!book || !valid) {
    return (
      <Shell>
        <Page title="Capítulo não encontrado" lead="Este livro não tem esse capítulo.">
          <Link to="/ler" className="font-medium text-tekhelet">
            Ver todos os livros
          </Link>
        </Page>
      </Shell>
    );
  }

  const tone = SECTION_TONE[book.section];
  const hasText = Array.isArray(verses) && verses.length > 0;

  return (
    <Shell bare immersive sidebar={desktop ? <ReaderLibrary book={book} chapter={chapter} /> : undefined}>
      {desktop ? (
        <DesktopReader
          book={book}
          chapter={chapter}
          verses={verses}
          words={words}
          notes={notes}
          previous={previous}
          next={next}
          onNote={setNoteFor}
          onSettings={() => setSheet("settings")}
        />
      ) : (
      <>
      {/* Barra do leitor */}
      <header className="glass sticky top-0 z-30 border-b border-line/70">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-2 sm:px-4">
          <Link
            to="/ler/$book"
            params={{ book: book.id }}
            aria-label={`Voltar para ${book.namePt}`}
            className="grid size-11 shrink-0 place-items-center rounded-full text-soft hover:bg-raised hover:text-fg"
          >
            <ChevronLeft className="size-6" />
          </Link>
          <button
            type="button"
            onClick={() => setSheet("chapters")}
            className="mx-auto inline-flex h-10 min-w-0 items-center gap-1.5 rounded-full px-4 font-semibold hover:bg-raised"
            aria-haspopup="dialog"
          >
            <span className="truncate">
              {book.namePt} {chapter}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden />
          </button>
          {hasText ? <ChapterBookmark book={book} chapter={chapter} /> : null}
          <button
            type="button"
            onClick={() => setSheet("settings")}
            aria-label="Ajustes de leitura"
            aria-haspopup="dialog"
            className="grid size-11 shrink-0 place-items-center rounded-full text-soft hover:bg-raised hover:text-fg"
          >
            <ALargeSmall className="size-6" />
          </button>
        </div>
        <div
          ref={progressRef}
          className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-gradient-to-r from-tekhelet to-argaman"
          style={{ transform: "scaleX(0)" }}
          aria-hidden
        />
      </header>

      <main
        ref={mainRef}
        className="mx-auto w-full max-w-[42rem] [touch-action:pan-x_pan-y] px-4 pb-16 sm:px-6"
        {...swipe}
      >
        <ChapterHero book={book} chapter={chapter} controls={verses !== null && !(Array.isArray(verses) && verses.length === 0)} />

        {verses === "loading" ? <VerseSkeleton /> : null}
        {verses === null || (Array.isArray(verses) && verses.length === 0) ? (
          <EmptyChapter
            bookId={book.id}
            chapter={chapter}
            lang={bookLang(book)}
            next={next}
            onNote={() => setNoteFor(0)}
          />
        ) : null}
        {Array.isArray(verses) && verses.length > 0 ? (
          <>
            <ReaderHint lang={bookLang(book)} />
            <div>
              {verses.map((verse, index) => (
                <VerseBlock
                  key={verse.v}
                  book={book}
                  chapter={chapter}
                  verse={verse}
                  open={openVerse === verse.v}
                  onToggle={() => setOpenVerse(openVerse === verse.v ? null : verse.v)}
                  onNote={() => setNoteFor(verse.v)}
                  notes={notes}
                  gloss={gloss?.verse === verse.v ? gloss : null}
                  onGloss={(layer, word) => setGloss(word === null ? null : { verse: verse.v, layer, word })}
                  // O arquivo de palavras segue a ordem dos versículos (no NT há versículos
                  // que os manuscritos mais antigos não trazem, e a numeração pula).
                  words={words === "loading" || words === null ? words : (words[index] ?? null)}
                />
              ))}
            </div>
            <ChapterNotes chapter={chapter} notes={notes} />
            <SourceNote lang={bookLang(book)} />
          </>
        ) : null}

        <ChapterPager previous={previous} next={next} />
        <p className="mt-4 hidden text-center text-sm text-muted md:block">Use as setas ← → do teclado para trocar de capítulo.</p>
      </main>

      <PinchIndicator scale={pinchPreview} />
      </>
      )}

      <Sheet
        open={sheet === "chapters"}
        onOpenChange={(open) => setSheet(open ? "chapters" : null)}
        title={book.namePt}
        description={`${book.nameTranslit}, ${book.chapters} ${book.chapters === 1 ? "capítulo" : "capítulos"}`}
      >
        <ChapterGrid book={book} chapter={chapter} acervo={acervo} onPick={() => setSheet(null)} />
        <Link
          to="/ler"
          onClick={() => setSheet(null)}
          className={cx("mt-5 flex h-12 items-center justify-center gap-2 rounded-2xl border border-line font-medium", tone.text)}
        >
          <ScrollText className="size-5" aria-hidden />
          Escolher outro livro
        </Link>
      </Sheet>

      <Sheet open={sheet === "settings"} onOpenChange={(open) => setSheet(open ? "settings" : null)} title="Ajustes de leitura">
        <ReadingSettings />
        <button
          type="button"
          onClick={() => {
            showReaderHint();
            setSheet(null);
          }}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl border border-line font-medium text-soft hover:text-fg"
        >
          Rever como usar o leitor
        </button>
      </Sheet>

      <NoteSheet bookId={book.id} bookName={book.namePt} chapter={chapter} verse={noteFor} onClose={() => setNoteFor(null)} />
    </Shell>
  );
}
