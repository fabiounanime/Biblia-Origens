import { useCallback, useEffect, useId, useRef, useState, type ReactNode, type Ref, type TouchEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ALargeSmall,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  NotebookPen,
  Rows3,
  ScrollText,
  Share2,
  X,
} from "lucide-react";
import { Page, Shell } from "@/components/shell";
import { ReadingSettings } from "@/components/reading-settings";
import { Sheet, cx } from "@/components/ui";
import {
  ORIGINAL,
  SECTION_TONE,
  bookById,
  bookLang,
  bookRef,
  originalProps,
  type Book,
  type ChapterRef,
  type OriginalLang,
} from "@/lib/bible/catalog";
import {
  chapterNotes,
  displayHebrew,
  loadChapter,
  loadWords,
  splitWords,
  type LetteredNote,
  type Verse,
  type WordInfo,
} from "@/lib/bible/corpus";
import { isChapterPublished, publishedNeighbor, useAcervoIndex } from "@/lib/bible/use-acervo";
import { LAYERS, useLayers } from "@/lib/reader/layers";
import { SCALE_LABEL, SCALE_ORDER, usePinchFont } from "@/lib/reader/use-pinch-font";
import type { FontScale } from "@/lib/study/types";
import { findMark, useStudy } from "@/lib/study/store";

export const Route = createFileRoute("/ler/$book/$chapter")({
  head: ({ params }) => {
    const book = bookById(params.book);
    return { meta: [{ title: book ? `${book.namePt} ${params.chapter} · Bíblia Origens` : "Bíblia Origens" }] };
  },
  component: ChapterPage,
});

type SheetName = "chapters" | "settings" | null;
/** Linha tocada para ver a tradução num balão: hebraico ou transliterado. */
type GlossLayer = "he" | "tr";
type Gloss = { verse: number; layer: GlossLayer; word: number } | null;

function ChapterPage() {
  const { book: bookId, chapter: chapterParam } = Route.useParams();
  const chapter = Number(chapterParam);
  const book = bookById(bookId);
  const valid = !!book && Number.isInteger(chapter) && chapter >= 1 && chapter <= (book?.chapters ?? 0);
  const navigate = useNavigate();
  const setPosition = useStudy((state) => state.setPosition);
  const [verses, setVerses] = useState<Verse[] | null | "loading">("loading");
  const [sheet, setSheet] = useState<SheetName>(null);
  const [noteFor, setNoteFor] = useState<number | null>(null);
  const [openVerse, setOpenVerse] = useState<number | null>(null);
  const [gloss, setGloss] = useState<Gloss>(null);
  const [words, setWords] = useState<WordInfo[][] | "loading" | null>("loading");
  const notes = Array.isArray(verses) ? chapterNotes(verses) : [];
  const progressRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number; t: number; dragging: boolean } | null>(null);
  const multiTouch = useRef(false);
  const mainRef = useRef<HTMLElement>(null);
  const pinchPreview = usePinchFont(mainRef, valid);

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

  // Ponto de leitura: o capítulo aberto (o versículo é atualizado ao rolar).
  useEffect(() => {
    if (!valid) return;
    const current = useStudy.getState().position;
    if (!current || current.bookId !== bookId || current.chapter !== chapter) {
      setPosition(bookId, chapter, 0);
    }
  }, [valid, bookId, chapter, setPosition]);

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

  // Versículo mais alto visível vira o ponto de leitura.
  useEffect(() => {
    if (!Array.isArray(verses) || verses.length === 0) return;
    const visible = new Set<number>();
    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const v = Number((entry.target as HTMLElement).dataset.verse);
          if (entry.isIntersecting) visible.add(v);
          else visible.delete(v);
        }
        if (visible.size === 0) return;
        const top = Math.min(...visible);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          const current = useStudy.getState().position;
          if (current?.bookId === bookId && current.chapter === chapter && current.verse === top) return;
          setPosition(bookId, chapter, top);
        }, 900);
      },
      { rootMargin: "-72px 0px -55% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-verse]").forEach((node) => observer.observe(node));
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [verses, bookId, chapter, setPosition]);

  // Barra de progresso do capítulo, sem re-render.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${ratio})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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

  // Deslizar para os lados troca de capítulo (como virar a página).
  // Com dois dedos é pinça (tamanho da letra), não troca de capítulo.
  // A página acompanha o dedo com resistência; um arraste longo ou um gesto rápido troca de capítulo.
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const settle = () => {
    const node = mainRef.current;
    if (!node) return;
    node.style.transition = "transform 200ms var(--ease-out), opacity 200ms var(--ease-out)";
    node.style.transform = "";
    node.style.opacity = "";
  };
  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length > 1) {
      multiTouch.current = true;
      touch.current = null;
      settle();
      return;
    }
    const point = event.touches[0];
    touch.current = point ? { x: point.clientX, y: point.clientY, t: performance.now(), dragging: false } : null;
  };
  const onTouchMove = (event: TouchEvent) => {
    const start = touch.current;
    const point = event.touches[0];
    const node = mainRef.current;
    if (!start || !point || !node || multiTouch.current || reduceMotion()) return;
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    if (!start.dragging) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
      start.dragging = true;
    }
    // Sem capítulo daquele lado, resiste mais.
    const blocked = (dx < 0 && !next) || (dx > 0 && !previous);
    const pull = Math.sign(dx) * Math.pow(Math.abs(dx), blocked ? 0.6 : 0.8);
    node.style.transition = "none";
    node.style.transform = `translateX(${pull}px)`;
    node.style.opacity = String(1 - Math.min(Math.abs(pull) / 600, 0.25));
  };
  const onTouchEnd = (event: TouchEvent) => {
    if (multiTouch.current) {
      if (event.touches.length === 0) multiTouch.current = false;
      touch.current = null;
      return;
    }
    const start = touch.current;
    const point = event.changedTouches[0];
    touch.current = null;
    settle();
    if (!start || !point) return;
    if (window.getSelection()?.toString()) return;
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    if (Math.abs(dx) < Math.abs(dy) * 1.8) return;
    const velocity = Math.abs(dx) / Math.max(1, performance.now() - start.t);
    if (Math.abs(dx) < 80 && !(velocity > 0.11 && Math.abs(dx) > 30)) return;
    go(dx < 0 ? next : previous);
  };

  const tone = SECTION_TONE[book.section];
  const hasText = Array.isArray(verses) && verses.length > 0;

  return (
    <Shell bare immersive>
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
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => {
          touch.current = null;
          settle();
        }}
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

/** Aviso flutuante durante a pinça: mostra o tamanho em que o texto vai encaixar. */
function PinchIndicator({ scale }: { scale: FontScale | null }) {
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
function ChapterBookmark({ book, chapter }: { book: Book; chapter: number }) {
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

function ChapterHero({ book, chapter, controls }: { book: Book; chapter: number; controls: boolean }) {
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

function VerseBlock({
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

/**
 * Linha em hebraico ou transliterada, palavra por palavra: um toque numa
 * palavra abre, logo abaixo da linha, um balão com o significado dela.
 */
function GlossLine({
  layer,
  lang,
  text,
  he,
  tr,
  display,
  active,
  echo,
  onPick,
  onClose,
  reference,
  translation,
  words,
}: {
  layer: GlossLayer;
  /** Idioma do original do livro (hebraico ou grego). */
  lang: OriginalLang;
  /** Linha desta camada, como está no acervo. */
  text: string;
  /** As duas linhas completas, para mostrar a palavra nas duas escritas no balão. */
  he: string;
  tr: string;
  display: (word: string) => string;
  /** Palavra aberta nesta linha (índice), ou null. */
  active: number | null;
  /** Palavra aberta na outra linha: fica marcada aqui também. */
  echo: number | null;
  onPick: (index: number | null) => void;
  onClose: () => void;
  reference: string;
  translation: string;
  words: WordInfo[] | "loading" | null;
}) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const parts = splitWords(text, layer);
  const count = Math.ceil(parts.length / 2);

  useEffect(() => {
    if (active === null) return;
    const bubble = bubbleRef.current;
    if (!bubble) return;
    // A ponta do balão aponta para a palavra tocada.
    const target = bubble.parentElement?.querySelector<HTMLElement>(`[data-word="${active}"]`);
    if (target) {
      const center = target.offsetLeft + target.offsetWidth / 2 - bubble.offsetLeft;
      const tip = Math.min(Math.max(center, 18), bubble.offsetWidth - 18);
      bubble.style.setProperty("--tip", `${tip}px`);
    }
    // Se o balão abriu perto do fim da tela, rola só o necessário para vê-lo.
    const rect = bubble.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 16) {
      window.scrollBy({ top: rect.bottom - window.innerHeight + 24, behavior: "smooth" });
    }
  }, [active]);

  return (
    <div className="relative" data-gloss>
      <p
        className={cx(layer === "he" ? ORIGINAL[lang].read : "read-tr", "gloss-line")}
        {...(layer === "he" ? { lang: ORIGINAL[lang].lang, dir: ORIGINAL[lang].dir } : {})}
      >
        {parts.map((part, index) => {
          if (index % 2 === 1) return part === " " ? part : null;
          const word = index / 2;
          const on = active === word;
          const joiner = parts[index + 1];
          const button = (
            <button
              key={index}
              type="button"
              data-word={word}
              className={cx("gloss-word", on && "gloss-word-on", echo === word && "gloss-word-echo")}
              aria-expanded={on}
              aria-controls={on ? id : undefined}
              aria-label={`${display(part)}: ver o significado`}
              onClick={() => {
                if (window.getSelection()?.toString()) return;
                onPick(on ? null : word);
              }}
            >
              {display(part)}
            </button>
          );
          // O hífen (e o maqaf) fica colado à palavra anterior: a linha pode
          // quebrar depois dele, nunca antes.
          if (!joiner || joiner === " ") return button;
          return (
            <span key={index} className="whitespace-nowrap">
              {button}
              {joiner}
            </span>
          );
        })}
      </p>
      {/* Anuncia o significado para leitores de tela quando o balão abre ou muda de palavra. */}
      <span className="sr-only" aria-live="polite">
        {active !== null && Array.isArray(words) && words[active]
          ? `${display(parts[active * 2] ?? "")}: ${words[active].g.replace(/\*/g, "")}`
          : ""}
      </span>
      {active !== null ? (
        <WordBubble
          ref={bubbleRef}
          id={id}
          layer={layer}
          lang={lang}
          index={active}
          count={count}
          heWord={display(splitWords(he, "he")[active * 2] ?? "")}
          trWord={splitWords(tr, "tr")[active * 2]?.replace(/[.]$/, "") ?? ""}
          info={Array.isArray(words) ? words[active] : words}
          reference={reference}
          translation={translation}
          onMove={(step) => onPick((active + step + count) % count)}
          onClose={onClose}
        />
      ) : null}
    </div>
  );
}

/** Balão do significado de uma palavra, com a tradução do versículo a um toque. */
function WordBubble({
  ref,
  id,
  layer,
  lang,
  index,
  count,
  heWord,
  trWord,
  info,
  reference,
  translation,
  onMove,
  onClose,
}: {
  ref: Ref<HTMLDivElement>;
  id: string;
  layer: GlossLayer;
  lang: OriginalLang;
  index: number;
  count: number;
  heWord: string;
  trWord: string;
  info: WordInfo | "loading" | null | undefined;
  reference: string;
  translation: string;
  onMove: (step: 1 | -1) => void;
  onClose: () => void;
}) {
  const [showVerse, setShowVerse] = useState(false);
  // Só o hebraico corre da direita para a esquerda; o grego e o transliterado, não.
  const rtl = layer === "he" && ORIGINAL[lang].dir === "rtl";
  return (
    <div
      ref={ref}
      id={id}
      role="region"
      aria-label={`Significado de ${heWord}`}
      className={cx("gloss-bubble", rtl ? "gloss-bubble-he" : "gloss-bubble-tr")}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-tekhelet">Palavra</span>
        <span className="text-xs text-muted tabular-nums">
          {reference} · {index + 1} de {count}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="-my-1.5 -mr-3 ml-auto grid size-11 place-items-center rounded-full text-muted hover:bg-raised hover:text-fg"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span {...originalProps(lang, "text-[1.7rem] leading-snug text-zahav")}>{heWord}</span>
        <span className="font-read text-[0.95rem] text-tekhelet italic">{trWord}</span>
      </div>

      {info === "loading" ? (
        <p className="mt-2 text-sm text-muted" role="status">
          Abrindo o significado…
        </p>
      ) : !info ? (
        <p className="mt-2 text-sm text-muted">O significado desta palavra não pôde ser aberto agora.</p>
      ) : (
        <>
          <p className="gloss-meaning mt-1.5">
            <NoteText text={info.g} />
          </p>
          {info.o ? (
            <p className="mt-0.5 text-sm text-soft">
              Também: <NoteText text={info.o} />
            </p>
          ) : null}
          <p className="mt-2 text-[13px] leading-snug text-muted">{info.m}</p>
          {info.l ? (
            <p className="mt-1 text-[13px] text-muted">
              Dicionário:{" "}
              <span {...originalProps(lang, "text-base text-soft")}>{info.l}</span>
            </p>
          ) : null}
        </>
      )}

      {showVerse ? (
        <p className="gloss-text mt-3 border-t border-line pt-2.5">
          <PtText text={translation} />
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-1.5" dir={rtl ? "rtl" : "ltr"}>
        <button
          type="button"
          onClick={() => onMove(-1)}
          aria-label="Palavra anterior"
          className="grid size-11 place-items-center rounded-full border border-line text-soft hover:text-fg"
        >
          {rtl ? <ChevronRight className="size-4" aria-hidden /> : <ChevronLeft className="size-4" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          aria-label="Próxima palavra"
          className="grid size-11 place-items-center rounded-full border border-line text-soft hover:text-fg"
        >
          {rtl ? <ChevronLeft className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={() => setShowVerse(!showVerse)}
          aria-expanded={showVerse}
          className="ms-auto inline-flex h-11 items-center rounded-full px-3 text-sm font-semibold text-tekhelet hover:bg-raised"
        >
          {showVerse ? "Ocultar versículo" : "Versículo inteiro"}
        </button>
      </div>
    </div>
  );
}

/** Palavras [entre colchetes] não existem no original: aparecem mais claras e em itálico. */
function PtText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("[") && part.endsWith("]") ? (
          <span key={index} className="added-word" title="Acrescentado pelo sentido; não está no original">
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** Texto do versículo com as chamadas das notas do tradutor (a, b, c…) nos lugares certos. */
function PtWithNotes({ text, notes }: { text: string; notes: LetteredNote[] }) {
  if (notes.length === 0) return <PtText text={text} />;
  const parts: ReactNode[] = [];
  let from = 0;
  for (const note of notes) {
    // A última palavra, a chamada e a pontuação logo depois ficam na mesma linha.
    const before = text.slice(Math.min(from, note.at), note.at);
    const openBracket = (before.match(/\[/g)?.length ?? 0) > (before.match(/\]/g)?.length ?? 0);
    const lastWord = openBracket ? "" : (before.match(/\S+$/)?.[0] ?? "");
    const punct = text.slice(Math.max(from, note.at)).match(/^[,.;:!?)»”]+/)?.[0] ?? "";
    parts.push(<PtText key={`t${note.letter}`} text={before.slice(0, before.length - lastWord.length)} />);
    const call = (
      <button
        key={note.letter}
        id={`chamada-${note.letter}`}
        type="button"
        className="note-call"
        aria-label={`Nota ${note.letter}`}
        onClick={() => focusById(`nota-${note.letter}`)}
      >
        {note.letter}
      </button>
    );
    parts.push(
      <span key={`n${note.letter}`} className="whitespace-nowrap">
        <PtText text={lastWord} />
        {call}
        {punct}
      </span>,
    );
    from = Math.max(from, note.at) + punct.length;
  }
  parts.push(<PtText key="fim" text={text.slice(from)} />);
  return <>{parts}</>;
}

/** Leva até um elemento e o destaca por um instante. */
function focusById(id: string) {
  const node = document.getElementById(id);
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "center" });
  node.classList.remove("note-flash");
  void node.offsetWidth;
  node.classList.add("note-flash");
}

/** *Asteriscos* no texto da nota viram itálico (palavras hebraicas transliteradas). */
function NoteText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/);
  return (
    <>
      {parts.map((part, index) =>
        part.length > 2 && part.startsWith("*") && part.endsWith("*") ? <em key={index}>{part.slice(1, -1)}</em> : part,
      )}
    </>
  );
}

/** Notas do tradutor ao fim do capítulo, como no rodapé de uma Bíblia impressa. */
function ChapterNotes({ chapter, notes }: { chapter: number; notes: LetteredNote[] }) {
  if (notes.length === 0) return null;
  return (
    <section aria-labelledby="notas-titulo" className="mt-10 border-t border-line pt-6">
      <h2 id="notas-titulo" className="text-base font-semibold text-soft">
        Notas do tradutor
      </h2>
      <ol className="mt-3 max-w-[38rem] space-y-2.5">
        {notes.map((note) => (
          <li key={note.letter} id={`nota-${note.letter}`} className="note-item rounded-xl px-2 py-1 -mx-2 text-[0.94rem] leading-relaxed text-soft">
            <button
              type="button"
              onClick={() => focusById(`chamada-${note.letter}`)}
              aria-label={`Voltar ao versículo ${chapter}:${note.verse}`}
              className="mr-1 font-semibold text-fg tabular-nums hover:text-tekhelet"
            >
              <sup className="mr-0.5 text-tekhelet">{note.letter}</sup>
              {chapter}:{note.verse}
            </button>{" "}
            <NoteText text={note.t} />
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Como ler a tradução, ao fim de cada capítulo publicado. */
function SourceNote({ lang }: { lang: OriginalLang }) {
  const original = ORIGINAL[lang].label.toLowerCase();
  return (
    <aside className="mt-8 rounded-2xl border border-line bg-surface/60 px-4 py-3.5 text-[13px] leading-relaxed text-muted">
      <p>
        <span className="font-semibold text-soft">Tradução direta {ORIGINAL[lang].from}.</span> Palavras em{" "}
        <span className="added-word">itálico claro</span> não estão no {original} e foram acrescentadas pelo sentido.
        {lang === "he" ? (
          <>
            {" "}
            O nome divino{" "}
            <span lang="he" dir="rtl" className="he">
              יהוה
            </span>{" "}
            aparece como YHWH.
          </>
        ) : null}
      </p>
    </aside>
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

const HINT_KEY = "bo-dica-leitor-v1";
const HINT_EVENT = "bo-dica-leitor";

/** Traz a dica de volta (botão nos ajustes de leitura). */
function showReaderHint() {
  try {
    localStorage.removeItem(HINT_KEY);
  } catch {
    // Sem armazenamento: a dica aparece só nesta visita.
  }
  window.dispatchEvent(new Event(HINT_EVENT));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Como usar o leitor: aparece até a pessoa tocar em "Entendi", e não volta mais neste aparelho. */
function ReaderHint({ lang }: { lang: OriginalLang }) {
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
        Toque numa palavra em {ORIGINAL[lang].label.toLowerCase()} para ver o significado, e no versículo para guardar ou
        anotar.
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

/**
 * Versículo palavra por palavra: cada palavra do original com o transliterado
 * e o significado embaixo. Um toque mostra a gramática e a forma de dicionário.
 */
function InterlinearLine({
  lang,
  he,
  tr,
  showTr,
  display,
  words,
}: {
  lang: OriginalLang;
  he: string;
  tr: string;
  showTr: boolean;
  display: (word: string) => string;
  words: WordInfo[] | "loading" | null;
}) {
  const [active, setActive] = useState<number | null>(null);
  const heWords = splitWords(he, "he").filter((_, index) => index % 2 === 0);
  const trWords = splitWords(tr, "tr").filter((_, index) => index % 2 === 0);
  const info = active === null || !Array.isArray(words) ? null : words[active];

  return (
    <div>
      <ol className="flex flex-wrap gap-2" dir={ORIGINAL[lang].dir} aria-label="Palavra por palavra">
        {heWords.map((word, index) => {
          const on = active === index;
          const gloss = Array.isArray(words) ? words[index]?.g : undefined;
          return (
            <li key={index}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setActive(on ? null : index)}
                className={cx("inter-word", on && "inter-word-on")}
              >
                <span {...originalProps(lang, "inter-original")}>{display(word)}</span>
                {showTr ? (
                  <span className="inter-tr" dir="ltr">
                    {(trWords[index] ?? "").replace(/[.,;:!?]+$/, "")}
                  </span>
                ) : null}
                <span className="inter-gloss" dir="ltr">
                  {words === "loading" ? "…" : gloss ? <NoteText text={gloss} /> : "—"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {active !== null ? (
        <div className="mt-3 rounded-2xl border border-line bg-sunken/60 px-4 py-3" aria-live="polite">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-semibold text-muted tabular-nums">
              Palavra {active + 1} de {heWords.length}
            </span>
            <span {...originalProps(lang, "text-2xl leading-tight text-zahav")}>{display(heWords[active] ?? "")}</span>
          </div>
          {info ? (
            <>
              <p className="gloss-meaning mt-1">
                <NoteText text={info.g} />
              </p>
              {info.o ? (
                <p className="mt-0.5 text-sm text-soft">
                  Também: <NoteText text={info.o} />
                </p>
              ) : null}
              <p className="mt-2 text-[13px] leading-snug text-muted">{info.m}</p>
              {info.l ? (
                <p className="mt-1 text-[13px] text-muted">
                  Dicionário: <span {...originalProps(lang, "text-base text-soft")}>{info.l}</span>
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">
              {words === "loading" ? "Abrindo o significado…" : "O significado desta palavra não pôde ser aberto agora."}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function VerseSkeleton() {
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

function EmptyChapter({
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

function ChapterPager({ previous, next }: { previous: ChapterRef | null; next: ChapterRef | null }) {
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

function ChapterGrid({
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

/** Rascunhos não salvos, por versículo: fechar a gaveta sem salvar não perde o texto. */
const noteDrafts = new Map<string, string>();

function NoteSheet({
  bookId,
  bookName,
  chapter,
  verse,
  onClose,
}: {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number | null;
  onClose: () => void;
}) {
  const marks = useStudy((state) => state.marks);
  const saveNote = useStudy((state) => state.saveNote);
  const note = verse === null ? undefined : findMark(marks, bookId, chapter, verse, "note");
  const [draft, setDraft] = useState("");
  const draftKey = `${bookId}/${chapter}/${verse}`;

  useEffect(() => {
    if (verse !== null) setDraft(noteDrafts.get(draftKey) ?? note?.body ?? "");
    // Só ao abrir: não sobrescreve o que está sendo digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse]);

  const close = (saved: boolean) => {
    if (saved || draft === (note?.body ?? "")) noteDrafts.delete(draftKey);
    else noteDrafts.set(draftKey, draft);
    onClose();
  };

  const ref = verse === null ? "" : verse === 0 ? `${bookName} ${chapter}` : `${bookName} ${chapter}:${verse}`;

  return (
    <Sheet
      open={verse !== null}
      onOpenChange={(open) => {
        if (!open) close(false);
      }}
      title={verse === 0 ? "Nota do capítulo" : "Nota"}
      description={ref}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (verse === null) return;
          saveNote(bookId, chapter, verse, draft);
          close(true);
        }}
      >
        <label className="block">
          <span className="sr-only">Texto da nota</span>
          <textarea
            value={draft}
            maxLength={4000}
            onChange={(event) => setDraft(event.target.value)}
            rows={6}
            placeholder="Escreva o que você percebeu neste texto…"
            className="w-full resize-y rounded-2xl border border-field bg-bg px-4 py-3 text-base leading-relaxed placeholder:text-muted focus:border-tekhelet/60 focus:outline-none"
          />
        </label>
        <p className="mt-1 text-right text-xs text-muted tabular-nums">{draft.length}/4000</p>
        <div className="mt-4 flex gap-2">
          {note ? (
            <button
              type="button"
              onClick={() => {
                if (verse === null || !note) return;
                const body = note.body ?? "";
                saveNote(bookId, chapter, verse, "");
                close(true);
                toast("Nota apagada", {
                  description: ref,
                  action: { label: "Desfazer", onClick: () => saveNote(bookId, chapter, verse, body) },
                });
              }}
              className="h-12 rounded-full border border-line px-5 font-semibold text-shani"
            >
              Apagar nota
            </button>
          ) : null}
          <button type="submit" className="h-12 flex-1 rounded-full bg-tekhelet font-semibold text-on-accent">
            Salvar nota
          </button>
        </div>
      </form>
    </Sheet>
  );
}
