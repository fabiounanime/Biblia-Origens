import { useCallback, useEffect, useId, useRef, useState, type ReactNode, type Ref, type TouchEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  ScrollText,
  X,
} from "lucide-react";
import { Page, Shell } from "@/components/shell";
import { ReadingSettings } from "@/components/reading-settings";
import { Sheet, cx } from "@/components/ui";
import { SECTION_TONE, bookById, neighborChapter, type Book, type ChapterRef } from "@/lib/bible/catalog";
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
import { LAYERS, useLayers } from "@/lib/reader/layers";
import { SCALE_LABEL, SCALE_ORDER, usePinchFont } from "@/lib/reader/use-pinch-font";
import type { FontScale } from "@/lib/study/types";
import { findMark, useStudy } from "@/lib/study/store";

export const Route = createFileRoute("/ler/$book/$chapter")({
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
  const touch = useRef<{ x: number; y: number } | null>(null);
  const multiTouch = useRef(false);
  const mainRef = useRef<HTMLElement>(null);
  const pinchPreview = usePinchFont(mainRef, valid);

  const previous = valid ? neighborChapter(bookId, chapter, -1) : null;
  const next = valid ? neighborChapter(bookId, chapter, 1) : null;

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
  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length > 1) {
      multiTouch.current = true;
      touch.current = null;
      return;
    }
    const point = event.touches[0];
    touch.current = point ? { x: point.clientX, y: point.clientY } : null;
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
    if (!start || !point) return;
    if (window.getSelection()?.toString()) return;
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
    go(dx < 0 ? next : previous);
  };

  const tone = SECTION_TONE[book.section];

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
        onTouchEnd={onTouchEnd}
      >
        <ChapterHero book={book} chapter={chapter} />

        {verses === "loading" ? <VerseSkeleton /> : null}
        {verses === null || (Array.isArray(verses) && verses.length === 0) ? (
          <EmptyChapter bookId={book.id} chapter={chapter} onNote={() => setNoteFor(0)} />
        ) : null}
        {Array.isArray(verses) && verses.length > 0 ? (
          <>
            <p className="mb-2 text-center text-sm text-muted">
              Toque no número para guardar, anotar ou copiar. Toque numa palavra em hebraico ou no transliterado para ver o significado.
              <span className="block md:hidden">Use dois dedos em pinça para ajustar a letra.</span>
            </p>
            <div>
              {verses.map((verse) => (
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
                  words={words === "loading" || words === null ? words : (words[verse.v - 1] ?? null)}
                />
              ))}
            </div>
            <ChapterNotes chapter={chapter} notes={notes} />
            <SourceNote />
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
        <ChapterGrid book={book} chapter={chapter} onPick={() => setSheet(null)} />
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
                  "rounded-full transition-all",
                  id === scale ? "h-2 w-5 bg-tekhelet" : "size-2 bg-line",
                )}
              />
            ))}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function ChapterHero({ book, chapter }: { book: Book; chapter: number }) {
  const tone = SECTION_TONE[book.section];
  const layers = useLayers();
  const marks = useStudy((state) => state.marks);
  const toggleBookmark = useStudy((state) => state.toggleBookmark);
  const saved = !!findMark(marks, book.id, chapter, 0, "bookmark");

  return (
    <header data-anchor className="pt-8 pb-6 text-center sm:pt-12">
      <p className={cx("he text-5xl leading-tight sm:text-6xl", tone.text)} lang="he" dir="rtl">
        {book.nameHe}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {book.namePt} {chapter}
      </h1>
      <p className="mt-1 text-muted">
        {book.nameTranslit}, capítulo {chapter} de {book.chapters}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <div className="flex rounded-full border border-line bg-surface p-1" role="group" aria-label="Camadas do texto">
          {LAYERS.map((layer) => {
            const on = layers[layer.id];
            return (
              <button
                key={layer.id}
                type="button"
                aria-pressed={on}
                onClick={() => layers.toggle(layer.id)}
                title={on ? `Ocultar ${layer.label.toLowerCase()}` : `Mostrar ${layer.label.toLowerCase()}`}
                className={cx(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors",
                  on ? "bg-raised text-fg" : "text-muted line-through decoration-muted/60",
                )}
              >
                <span className={cx("size-2 rounded-full", layer.dot, !on && "opacity-40")} aria-hidden />
                {layer.id.toUpperCase()}
                <span className="sr-only">{layer.label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => toggleBookmark(book.id, chapter, 0)}
          aria-pressed={saved}
          className={cx(
            "inline-flex h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors",
            saved ? "border-shani/50 bg-shani/12 text-shani" : "border-line text-soft hover:border-muted",
          )}
        >
          {saved ? <BookmarkCheck key="on" className="pop size-4" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
          {saved ? "Capítulo guardado" : "Guardar capítulo"}
        </button>
      </div>
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

  async function copy() {
    const lines = [`${book.namePt} ${chapter}:${verse.v}`, verse.pt, verse.he, verse.tr].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article
      id={`v${verse.v}`}
      data-verse={verse.v}
      className={cx(
        "relative -mx-3 scroll-mt-20 rounded-3xl px-3 py-5 transition-colors",
        open && "bg-surface ring-1 ring-line",
      )}
    >
      <div className="flex gap-3.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`Versículo ${verse.v}: ações`}
          className={cx(
            "mt-1 grid h-8 min-w-8 shrink-0 place-items-center self-start rounded-full px-1.5 text-sm font-bold tabular-nums transition-colors",
            saved
              ? "bg-shani text-on-accent"
              : open
                ? "bg-tekhelet text-on-accent"
                : "bg-raised text-soft hover:bg-tekhelet/20 hover:text-fg",
          )}
        >
          {verse.v}
        </button>
        <div className="min-w-0 flex-1 space-y-3">
          {layers.pt ? (
            <p className="read-pt">
              <PtWithNotes text={verse.pt} notes={notes.filter((note) => note.verse === verse.v)} />
            </p>
          ) : null}
          {layers.he ? (
            <GlossLine
              layer="he"
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
          {layers.tr ? (
            <GlossLine
              layer="tr"
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
            <div className="flex flex-wrap gap-2 pt-1">
              <ActionButton
                onClick={() => toggleBookmark(book.id, chapter, verse.v)}
                active={saved}
                icon={saved ? <BookmarkCheck className="pop size-4" /> : <Bookmark className="size-4" />}
                label={saved ? "Guardado" : "Guardar"}
              />
              <ActionButton
                onClick={onNote}
                active={!!note}
                icon={<NotebookPen className="size-4" />}
                label={note ? "Editar nota" : "Nota"}
              />
              <ActionButton
                onClick={() => void copy()}
                active={copied}
                icon={copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                label={copied ? "Copiado" : "Copiar"}
              />
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
        className={cx(layer === "he" ? "read-he" : "read-tr", "gloss-line")}
        {...(layer === "he" ? { lang: "he", dir: "rtl" } : {})}
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
      {active !== null ? (
        <WordBubble
          ref={bubbleRef}
          id={id}
          layer={layer}
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
  return (
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-label={`Significado de ${heWord}`}
      className={cx("gloss-bubble", layer === "he" ? "gloss-bubble-he" : "gloss-bubble-tr")}
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold tracking-[0.14em] text-tekhelet uppercase">Palavra</span>
        <span className="text-xs text-muted tabular-nums">
          {reference} · {index + 1} de {count}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="-mr-1.5 ml-auto grid size-8 place-items-center rounded-full text-muted hover:bg-raised hover:text-fg"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="he text-[1.7rem] leading-snug text-zahav" lang="he" dir="rtl">
          {heWord}
        </span>
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
              <span className="he text-base text-soft" lang="he" dir="rtl">
                {info.l}
              </span>
            </p>
          ) : null}
        </>
      )}

      {showVerse ? (
        <p className="gloss-text mt-3 border-t border-line pt-2.5">
          <PtText text={translation} />
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-1.5" dir={layer === "he" ? "rtl" : "ltr"}>
        <button
          type="button"
          onClick={() => onMove(-1)}
          aria-label="Palavra anterior"
          className="grid size-9 place-items-center rounded-full border border-line text-soft hover:text-fg"
        >
          {layer === "he" ? <ChevronRight className="size-4" aria-hidden /> : <ChevronLeft className="size-4" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          aria-label="Próxima palavra"
          className="grid size-9 place-items-center rounded-full border border-line text-soft hover:text-fg"
        >
          {layer === "he" ? <ChevronLeft className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={() => setShowVerse(!showVerse)}
          aria-expanded={showVerse}
          className="ms-auto inline-flex h-9 items-center rounded-full px-3 text-sm font-semibold text-tekhelet hover:bg-raised"
        >
          {showVerse ? "Ocultar versículo" : "Versículo inteiro"}
        </button>
      </div>
    </div>
  );
}

/** Palavras [entre colchetes] não existem no hebraico: aparecem mais claras e em itálico. */
function PtText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("[") && part.endsWith("]") ? (
          <span key={index} className="added-word" title="Acrescentado pelo sentido; não está no hebraico">
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
    parts.push(<PtText key={`t${note.letter}`} text={text.slice(from, note.at)} />);
    parts.push(
      <button
        key={note.letter}
        id={`chamada-${note.letter}`}
        type="button"
        className="note-call"
        aria-label={`Nota ${note.letter}`}
        onClick={() => focusById(`nota-${note.letter}`)}
      >
        {note.letter}
      </button>,
    );
    from = note.at;
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
      <h2 id="notas-titulo" className="text-xs font-bold tracking-[0.16em] text-muted uppercase">
        Notas
      </h2>
      <ol className="mt-3 space-y-2.5">
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
function SourceNote() {
  return (
    <aside className="mt-8 rounded-2xl border border-line bg-surface/60 px-4 py-3.5 text-[13px] leading-relaxed text-muted">
      <p>
        <span className="font-semibold text-soft">Tradução direta do hebraico.</span> Palavras em{" "}
        <span className="added-word">itálico claro</span> não estão no hebraico e foram acrescentadas pelo sentido. O nome
        divino{" "}
        <span lang="he" dir="rtl" className="he">
          יהוה
        </span>{" "}
        aparece como YHWH.
      </p>
    </aside>
  );
}

function ActionButton({
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
        "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors",
        active ? "border-shani/50 bg-shani/12 text-shani" : "border-line bg-bg text-soft hover:border-muted hover:text-fg",
      )}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </button>
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

function EmptyChapter({ bookId, chapter, onNote }: { bookId: string; chapter: number; onNote: () => void }) {
  const marks = useStudy((state) => state.marks);
  const note = findMark(marks, bookId, chapter, 0, "note");
  return (
    <div className="rounded-[28px] border border-dashed border-line bg-surface/60 px-5 py-8 text-center sm:px-8">
      <div className="mx-auto flex w-fit gap-2" aria-hidden>
        {LAYERS.map((layer) => (
          <span key={layer.id} className={cx("size-2.5 rounded-full", layer.dot)} />
        ))}
      </div>
      <h2 className="mt-4 text-xl font-semibold">Este capítulo ainda não chegou ao acervo</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">
        A tradução direta, o hebraico e o transliterado aparecem aqui assim que forem publicados. Enquanto isso, você pode guardar o
        capítulo ou escrever uma nota.
      </p>
      {note?.body ? (
        <p className="mx-auto mt-5 max-w-md rounded-2xl border-l-[3px] border-shani bg-shani/8 px-4 py-3 text-left text-sm whitespace-pre-line text-soft">
          {note.body}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onNote}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-tekhelet px-5 font-semibold text-on-accent"
      >
        <NotebookPen className="size-4" aria-hidden />
        {note ? "Editar nota do capítulo" : "Escrever nota do capítulo"}
      </button>
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
          className="flex min-h-16 items-center gap-2 rounded-2xl border border-line bg-surface px-3 transition-colors hover:border-tekhelet/50"
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
          className="flex min-h-16 items-center justify-end gap-2 rounded-2xl bg-tekhelet px-3 text-right text-on-accent transition-transform hover:scale-[1.01]"
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
        <span />
      )}
    </nav>
  );
}

function ChapterGrid({ book, chapter, onPick }: { book: Book; chapter: number; onPick: () => void }) {
  return (
    <ol className="grid grid-cols-6 gap-2 sm:grid-cols-8">
      {Array.from({ length: book.chapters }, (_, index) => index + 1).map((n) => (
        <li key={n}>
          <Link
            to="/ler/$book/$chapter"
            params={{ book: book.id, chapter: String(n) }}
            onClick={onPick}
            aria-current={n === chapter ? "page" : undefined}
            className={cx(
              "grid h-11 place-items-center rounded-xl text-sm font-semibold tabular-nums transition-colors",
              n === chapter ? "bg-tekhelet text-on-accent" : "bg-raised/70 hover:bg-raised",
            )}
          >
            {n}
          </Link>
        </li>
      ))}
    </ol>
  );
}

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

  useEffect(() => {
    if (verse !== null) setDraft(note?.body ?? "");
    // Só ao abrir: não sobrescreve o que está sendo digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse]);

  const ref = verse === null ? "" : verse === 0 ? `${bookName} ${chapter}` : `${bookName} ${chapter}:${verse}`;

  return (
    <Sheet
      open={verse !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={verse === 0 ? "Nota do capítulo" : "Nota"}
      description={ref}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (verse === null) return;
          saveNote(bookId, chapter, verse, draft);
          onClose();
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
            className="w-full resize-y rounded-2xl border border-line bg-bg px-4 py-3 text-base leading-relaxed placeholder:text-muted focus:border-tekhelet/60 focus:outline-none"
          />
        </label>
        <p className="mt-1 text-right text-xs text-muted tabular-nums">{draft.length}/4000</p>
        <div className="mt-4 flex gap-2">
          {note ? (
            <button
              type="button"
              onClick={() => {
                if (verse === null) return;
                saveNote(bookId, chapter, verse, "");
                onClose();
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
