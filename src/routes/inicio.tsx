import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, BookOpen, CircleCheck, NotebookPen } from "lucide-react";
import { Shell } from "@/components/shell";
import { SectionTitle, cx } from "@/components/ui";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { BOOKS, ORIGINAL, SECTIONS, SECTION_TONE, bookById, bookLang } from "@/lib/bible/catalog";
import { GUIDES } from "@/lib/bible/guides";
import { activeMarks, useStudy } from "@/lib/study/store";

export const Route = createFileRoute("/inicio")({
  head: () => ({ meta: [{ title: "Início · Bíblia Origens" }] }),
  component: Inicio,
});

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
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

  return (
    <Shell>
      <main className="mx-auto w-full max-w-3xl px-4 pt-6 pb-10 sm:px-6 md:pt-12">
        <p className="text-muted">{greeting()}{firstName ? `, ${firstName}` : ""}.</p>
        <h1 className="mt-1 text-[2rem] leading-tight font-bold tracking-tight sm:text-[2.5rem]">
          Shalom. O que vamos ler hoje?
        </h1>

        {/* Continuar leitura — o cartão principal */}
        <div className="mt-6">
          {!ready ? (
            <div className="h-44 animate-pulse rounded-[28px] bg-surface" />
          ) : (
            <ContinueCard
              bookId={book?.id ?? "gn"}
              chapter={book && position ? position.chapter : 1}
              verse={book && position ? position.verse : 0}
              fresh={!book}
            />
          )}
        </div>

        {/* As partes da Bíblia: Torá, Profetas e Escritos (o Tanakh) e o Novo Testamento */}
        <section className="mt-10">
          <SectionTitle
            action={
              <Link to="/ler" className="text-sm font-medium text-tekhelet hover:underline">
                Todos os livros
              </Link>
            }
          >
            As partes da Bíblia
          </SectionTitle>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {SECTIONS.map((section) => {
              const tone = SECTION_TONE[section.id];
              const count = BOOKS.filter((row) => row.section === section.id).length;
              return (
                <Link
                  key={section.id}
                  to="/ler"
                  search={{ secao: section.id }}
                  className={cx(
                    "group flex flex-col justify-between rounded-3xl border bg-surface p-3.5 transition-colors sm:p-5",
                    tone.border,
                    "hover:bg-raised/70",
                  )}
                >
                  <span
                    className={cx(
                      ORIGINAL[section.lang].font,
                      section.lang === "he" ? "text-right text-2xl sm:text-4xl" : "text-left text-xl sm:text-2xl",
                      "leading-none",
                      tone.text,
                    )}
                    lang={ORIGINAL[section.lang].lang}
                    dir={ORIGINAL[section.lang].dir}
                  >
                    {section.nameHe}
                  </span>
                  <span className="mt-6 block">
                    <span className="block font-semibold sm:text-lg">{section.title}</span>
                    <span className="block text-xs text-muted sm:text-sm">{section.subtitle}</span>
                    <span className="block text-xs text-muted sm:text-sm">{count} livros</span>
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
              <Link to="/estudos" className="text-sm font-medium text-tekhelet hover:underline">
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
                  className="relative flex w-44 shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-line bg-surface p-4 transition-colors hover:border-tekhelet/40"
                >
                  <span className={cx("absolute inset-x-0 top-0 h-1", tone.dot)} aria-hidden />
                  <span className={cx("text-sm font-medium", tone.text)}>{guide.kicker}</span>
                  <span className="mt-1 text-lg leading-snug font-semibold">{guide.title}</span>
                  <span className="mt-auto flex items-center justify-between pt-4 text-sm text-muted">
                    {guideBook ? `${guideBook.namePt} ${guide.chapter}` : ""}
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
                <Link to="/conta" className="text-sm font-medium text-tekhelet hover:underline">
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
            <ul className="overflow-hidden rounded-3xl border border-line bg-surface">
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
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-shani/14 text-shani">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium">
                          {markBook.namePt} {mark.chapter}
                          {mark.verse > 0 ? `:${mark.verse}` : ""}
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
  const pct = Math.max(4, Math.round((chapter / book.chapters) * 100));

  return (
    <Link
      to="/ler/$book/$chapter"
      params={{ book: book.id, chapter: String(chapter) }}
      hash={verse > 1 ? `v${verse}` : undefined}
      className="group relative block overflow-hidden rounded-[28px] border border-tekhelet/30 bg-gradient-to-br from-tekhelet/25 via-surface to-argaman/15 p-5 shadow-float sm:p-7"
    >
      <span
        className={cx(
          ORIGINAL[bookLang(book)].font,
          "pointer-events-none absolute -top-3 right-3 text-[4.25rem] leading-none whitespace-nowrap text-zahav/15 select-none sm:right-6 sm:text-[7rem]",
        )}
        lang={ORIGINAL[bookLang(book)].lang}
        dir={ORIGINAL[bookLang(book)].dir}
        aria-hidden
      >
        {book.nameHe}
      </span>
      <span className="relative block">
        <span className="text-sm font-medium text-soft">{fresh ? "Comece pelo princípio" : "Continuar leitura"}</span>
        <span className="mt-12 flex items-end justify-between gap-4 sm:mt-16">
          <span>
            <span className="block text-3xl font-bold tracking-tight sm:text-4xl">
              {book.namePt} {chapter}
            </span>
            <span className="mt-1 block text-soft">
              {book.nameTranslit}
              {!fresh && verse > 1 ? `, versículo ${verse}` : ""}
            </span>
          </span>
          <span className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-tekhelet px-5 font-semibold text-on-accent transition-transform group-hover:scale-[1.03]">
            <BookOpen className="size-5" aria-hidden />
            {fresh ? "Ler" : "Continuar"}
          </span>
        </span>
        <span className="mt-5 block">
          <span className="block h-1.5 overflow-hidden rounded-full bg-sunken/70">
            <span className="block h-full rounded-full bg-zahav" style={{ width: `${pct}%` }} />
          </span>
          <span className="mt-1.5 block text-xs text-muted">
            Capítulo {chapter} de {book.chapters}
          </span>
        </span>
      </span>
    </Link>
  );
}
