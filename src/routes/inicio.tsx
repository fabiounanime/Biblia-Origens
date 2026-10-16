import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, BookOpen, CircleCheck, NotebookPen } from "lucide-react";
import { Shell } from "@/components/shell";
import { SectionTitle, cx } from "@/components/ui";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { BOOKS, ORIGINAL, SECTIONS, SECTION_TONE, bookById, bookLang, originalProps } from "@/lib/bible/catalog";
import { displayHebrew, loadIndex, loadVerse, type AcervoIndex, type Verse } from "@/lib/bible/corpus";
import { GUIDES } from "@/lib/bible/guides";
import { activeMarks, useStudy } from "@/lib/study/store";

export const Route = createFileRoute("/inicio")({
  head: () => ({ meta: [{ title: "Início · Bíblia Origens" }] }),
  component: Inicio,
});

/**
 * Versículos do dia: só referências. O texto vem sempre do acervo publicado,
 * então qualquer revisão da tradução aparece aqui sem mexer nesta lista.
 */
const VERSE_OF_DAY: { bookId: string; chapter: number; verse: number }[] = [
  { bookId: "gn", chapter: 1, verse: 1 },
  { bookId: "gn", chapter: 1, verse: 3 },
  { bookId: "gn", chapter: 1, verse: 27 },
  { bookId: "gn", chapter: 12, verse: 1 },
  { bookId: "gn", chapter: 15, verse: 6 },
  { bookId: "gn", chapter: 28, verse: 15 },
  { bookId: "ex", chapter: 3, verse: 14 },
  { bookId: "ex", chapter: 14, verse: 14 },
  { bookId: "ex", chapter: 20, verse: 2 },
  { bookId: "lv", chapter: 19, verse: 18 },
  { bookId: "nm", chapter: 6, verse: 24 },
  { bookId: "nm", chapter: 6, verse: 25 },
  { bookId: "nm", chapter: 6, verse: 26 },
  { bookId: "dt", chapter: 6, verse: 4 },
  { bookId: "dt", chapter: 6, verse: 5 },
  { bookId: "dt", chapter: 31, verse: 6 },
  { bookId: "js", chapter: 1, verse: 9 },
  { bookId: "js", chapter: 24, verse: 15 },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

/** Dia do ano no fuso do aparelho: o versículo muda à meia-noite. */
function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

/** Referência curta em fonte mono, como "GN 12:4". */
function shortRef(bookId: string, chapter: number, verse?: number): string {
  return `${bookId.toUpperCase()} ${chapter}${verse && verse > 0 ? `:${verse}` : ""}`;
}

function Inicio() {
  const user = useCurrentUser();
  const ready = useStudy((state) => state.ready);
  const position = useStudy((state) => state.position);
  const marks = useStudy((state) => state.marks);
  const guides = useStudy((state) => state.guides);
  const book = ready && position ? bookById(position.bookId) : undefined;
  const firstName = (user?.displayName ?? "").trim().split(/\s+/)[0];
  const recent = activeMarks(marks)
    .slice()
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 4);

  const [index, setIndex] = useState<AcervoIndex | null | "loading">("loading");
  useEffect(() => {
    let cancel = false;
    void loadIndex()
      .catch(() => null)
      .then((rows) => {
        if (!cancel) setIndex(rows);
      });
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <Shell>
      <main className="mx-auto w-full max-w-3xl px-4 pt-6 pb-10 sm:px-6 md:pt-12">
        <p className="text-muted">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}.
        </p>
        <h1 className="mt-1 text-[1.85rem] leading-tight font-extrabold tracking-tight sm:text-[2.5rem]">
          Shalom. O que vamos ler hoje?
        </h1>

        {/* Grade principal: continuar, versículo do dia e as partes da Bíblia */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {!ready ? (
              <div className="h-52 animate-pulse rounded-3xl bg-surface" />
            ) : (
              <ContinueCard
                bookId={book?.id ?? "gn"}
                chapter={book && position ? position.chapter : 1}
                verse={book && position ? position.verse : 0}
                fresh={!book}
              />
            )}
          </div>
          <div className="sm:col-span-2">
            <VerseOfDay />
          </div>
        </div>

        {/* As partes da Bíblia: Torá, Profetas e Escritos (o Tanakh) e o Novo Testamento */}
        <section className="mt-10">
          <SectionTitle
            action={
              <Link to="/ler" className="text-sm font-semibold text-tekhelet hover:underline">
                Todos os livros
              </Link>
            }
          >
            As partes da Bíblia
          </SectionTitle>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {SECTIONS.map((section) => {
              const tone = SECTION_TONE[section.id];
              const ids = BOOKS.filter((row) => row.section === section.id).map((row) => row.id);
              const published = index === "loading" || !index ? null : ids.filter((id) => index[id]).length;
              const pct = published === null ? 0 : Math.round((published / ids.length) * 100);
              return (
                <Link
                  key={section.id}
                  to="/ler"
                  search={{ secao: section.id }}
                  className="group flex flex-col gap-3 rounded-3xl border border-line bg-surface p-3.5 shadow-edge transition-colors hover:bg-raised/70 sm:p-4"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className={cx("size-2 shrink-0 rounded-full", tone.dot)} aria-hidden />
                    <span
                      className={cx(
                        ORIGINAL[section.lang].font,
                        section.lang === "he" ? "text-2xl sm:text-3xl" : "text-base sm:text-lg",
                        "truncate leading-none",
                        tone.text,
                      )}
                      lang={ORIGINAL[section.lang].lang}
                      dir={ORIGINAL[section.lang].dir}
                    >
                      {section.nameHe}
                    </span>
                  </span>
                  <span className="mt-auto block">
                    <span className="block font-bold sm:text-lg">{section.title}</span>
                    <span className="block text-xs text-muted sm:text-sm">
                      {section.subtitle} · {ids.length} livros
                    </span>
                  </span>
                  <span className="block">
                    <span className="block h-1 overflow-hidden rounded-full bg-sunken">
                      <span className={cx("block h-full rounded-full", tone.dot)} style={{ width: `${pct}%` }} />
                    </span>
                    <span className="mt-1.5 block font-mono text-[10px] tracking-wider text-muted uppercase">
                      {published === null ? "…" : `${published}/${ids.length} no acervo`}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Guias de estudo — faixa horizontal */}
        <section className="mt-10">
          <SectionTitle
            action={
              <Link to="/estudos" className="text-sm font-semibold text-tekhelet hover:underline">
                Ver guias
              </Link>
            }
          >
            Guias de estudo
          </SectionTitle>
          <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
            {GUIDES.map((guide) => {
              const guideBook = bookById(guide.bookId);
              const tone = SECTION_TONE[guideBook?.section ?? "torah"];
              const done = guides.some((row) => row.guideId === guide.id && row.status === "done");
              return (
                <Link
                  key={guide.id}
                  to="/estudos/$guideId"
                  params={{ guideId: guide.id }}
                  className="relative flex w-44 shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-line bg-surface p-4 shadow-edge transition-colors hover:border-tekhelet/40"
                >
                  <span className={cx("flex items-center gap-2 text-sm font-semibold", tone.text)}>
                    <span className={cx("size-1.5 rounded-full", tone.dot)} aria-hidden />
                    {guide.kicker}
                  </span>
                  <span className="mt-1 text-lg leading-snug font-bold">{guide.title}</span>
                  <span className="mt-auto flex items-center justify-between pt-4 font-mono text-xs text-muted">
                    {guideBook ? shortRef(guideBook.id, guide.chapter) : ""}
                    {done ? <CircleCheck className="size-4 text-tekhelet" aria-label="Lido" /> : null}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Guardados recentes */}
        <section className="mt-10">
          <SectionTitle
            action={
              recent.length > 0 ? (
                <Link to="/conta" className="text-sm font-semibold text-tekhelet hover:underline">
                  Ver tudo
                </Link>
              ) : undefined
            }
          >
            Seus guardados
          </SectionTitle>
          {recent.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line px-5 py-6 text-muted">
              Toque no número de um versículo para guardá-lo ou escrever uma nota. Eles aparecem aqui.
            </div>
          ) : (
            <ul className="overflow-hidden rounded-3xl border border-line bg-surface shadow-edge">
              {recent.map((mark) => {
                const markBook = bookById(mark.bookId);
                if (!markBook) return null;
                const Icon = mark.kind === "note" ? NotebookPen : Bookmark;
                return (
                  <li key={mark.id} className="border-b border-line last:border-b-0">
                    <Link
                      to="/ler/$book/$chapter"
                      params={{ book: markBook.id, chapter: String(mark.chapter) }}
                      hash={mark.verse > 0 ? `v${mark.verse}` : undefined}
                      className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-raised/50"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-shani/14 text-shani">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-baseline gap-2 font-semibold">
                          {markBook.namePt} {mark.chapter}
                          {mark.verse > 0 ? `:${mark.verse}` : ""}
                          <span className="font-mono text-[11px] font-medium text-muted">
                            {shortRef(markBook.id, mark.chapter, mark.verse)}
                          </span>
                        </span>
                        <span className="block truncate text-sm text-muted">
                          {mark.kind === "note" ? mark.body : mark.verse > 0 ? "Versículo guardado" : "Capítulo guardado"}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </Shell>
  );
}

/** Anel de progresso do livro (capítulo atual sobre o total). */
function ProgressRing({ value, label }: { value: number; label: string }) {
  const radius = 26;
  const length = 2 * Math.PI * radius;
  const filled = Math.max(0.02, Math.min(1, value)) * length;
  return (
    <span className="relative grid size-16 shrink-0 place-items-center" aria-hidden>
      <svg viewBox="0 0 64 64" className="absolute inset-0 size-16 -rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="6" className="stroke-sunken" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${length}`}
          className="stroke-zahav"
        />
      </svg>
      <span className="font-mono text-[11px] font-semibold text-soft">{label}</span>
    </span>
  );
}

function ContinueCard({
  bookId,
  chapter,
  verse,
  fresh,
}: {
  bookId: string;
  chapter: number;
  verse: number;
  fresh: boolean;
}) {
  const book = bookById(bookId);
  if (!book) return null;

  return (
    <Link
      to="/ler/$book/$chapter"
      params={{ book: book.id, chapter: String(chapter) }}
      hash={verse > 1 ? `v${verse}` : undefined}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-tekhelet/30 bg-surface p-5 shadow-edge sm:p-6"
    >
      <span
        className={cx(
          ORIGINAL[bookLang(book)].font,
          "pointer-events-none absolute -top-2 right-4 text-[4rem] leading-none whitespace-nowrap text-zahav/12 select-none sm:right-6 sm:text-[6rem]",
        )}
        lang={ORIGINAL[bookLang(book)].lang}
        dir={ORIGINAL[bookLang(book)].dir}
        aria-hidden
      >
        {book.nameHe}
      </span>
      <span className="relative flex items-center gap-2">
        <span className="rounded-lg bg-tekhelet/12 px-2 py-1 font-mono text-[11px] font-semibold tracking-wider text-tekhelet">
          {shortRef(book.id, chapter, fresh ? 0 : verse)}
        </span>
        <span className="text-sm font-medium text-soft">{fresh ? "Comece pelo princípio" : "Continuar leitura"}</span>
      </span>
      <span className="relative flex items-center justify-between gap-4">
        <span className="min-w-0">
          <span className="block text-3xl font-extrabold tracking-tight sm:text-4xl">
            {book.namePt} {chapter}
          </span>
          <span className="mt-1 block text-soft">
            {book.nameTranslit}
            {!fresh && verse > 1 ? ` · versículo ${verse}` : ""}
          </span>
        </span>
        <ProgressRing value={chapter / book.chapters} label={`${chapter}/${book.chapters}`} />
      </span>
      <span className="relative inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-tekhelet px-5 font-bold text-on-accent transition-transform group-hover:scale-[1.01]">
        <BookOpen className="size-5" aria-hidden />
        {fresh ? "Ler" : "Continuar"}
      </span>
      <span className="sr-only">
        Capítulo {chapter} de {book.chapters}
      </span>
    </Link>
  );
}

/** Versículo do dia nas três camadas, tirado do acervo publicado. */
function VerseOfDay() {
  const showNiqqud = useStudy((state) => state.showNiqqud);
  const [state, setState] = useState<{ ref: (typeof VERSE_OF_DAY)[number]; verse: Verse | null } | "loading">("loading");

  useEffect(() => {
    let cancel = false;
    const ref = VERSE_OF_DAY[dayOfYear(new Date()) % VERSE_OF_DAY.length];
    void loadVerse(ref.bookId, ref.chapter, ref.verse)
      .catch(() => null)
      .then((verse) => {
        if (!cancel) setState({ ref, verse });
      });
    return () => {
      cancel = true;
    };
  }, []);

  if (state === "loading") return <div className="h-40 animate-pulse rounded-3xl bg-surface" role="status" aria-label="Abrindo o versículo do dia" />;
  // Sem rede ou versículo ainda não publicado: o cartão some, sem mensagem de erro no Início.
  if (!state.verse) return null;
  const book = bookById(state.ref.bookId);
  if (!book) return null;
  const lang = bookLang(book);
  const { verse, ref } = state;

  return (
    <Link
      to="/ler/$book/$chapter"
      params={{ book: book.id, chapter: String(ref.chapter) }}
      hash={`v${ref.verse}`}
      className="flex flex-col gap-2 rounded-3xl border border-line bg-surface p-5 shadow-edge transition-colors hover:border-tekhelet/40 sm:p-6"
    >
      <span className="font-mono text-[11px] font-semibold tracking-wider text-muted uppercase">
        Versículo do dia · {shortRef(book.id, ref.chapter, ref.verse)}
      </span>
      <span className="font-read text-[1.15rem] leading-relaxed">
        {verse.pt.split(/(\[[^\]]+\])/).map((part, i) =>
          part.startsWith("[") && part.endsWith("]") ? (
            <span key={i} className="added-word">
              {part.slice(1, -1)}
            </span>
          ) : (
            part
          ),
        )}
      </span>
      <span {...originalProps(lang, cx(ORIGINAL[lang].read, "block text-[1.45rem]! leading-relaxed!"))}>
        {lang === "he" ? displayHebrew(verse.he, showNiqqud) : verse.he}
      </span>
      <span className="read-tr block text-[0.95rem]!">{verse.tr}</span>
    </Link>
  );
}
