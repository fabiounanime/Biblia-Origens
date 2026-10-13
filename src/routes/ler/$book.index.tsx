import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { BackLabel, Page, Shell } from "@/components/shell";
import { cx } from "@/components/ui";
import { SECTION_TONE, bookById, sectionById } from "@/lib/bible/catalog";
import { activeMarks, useStudy } from "@/lib/study/store";

export const Route = createFileRoute("/ler/$book/")({
  component: BookPage,
});

function BookPage() {
  const { book: bookId } = Route.useParams();
  const book = bookById(bookId);
  const position = useStudy((state) => state.position);
  const marks = useStudy((state) => state.marks);

  if (!book) {
    return (
      <Shell>
        <Page title="Livro não encontrado" lead="Este endereço não corresponde a nenhum livro do Tanakh.">
          <Link to="/ler" className="font-medium text-tekhelet">
            Ver todos os livros
          </Link>
        </Page>
      </Shell>
    );
  }

  const section = sectionById(book.section);
  const tone = SECTION_TONE[book.section];
  const current = position?.bookId === book.id ? position.chapter : null;
  const marked = new Set(activeMarks(marks).filter((mark) => mark.bookId === book.id).map((mark) => mark.chapter));
  const startChapter = current ?? 1;

  return (
    <Shell>
      <Page
        top={
          <Link to="/ler">
            <BackLabel>Livros</BackLabel>
          </Link>
        }
        title={book.namePt}
        lead={`${book.nameTranslit}. ${section.title}, ${book.chapters} ${book.chapters === 1 ? "capítulo" : "capítulos"}.`}
        action={
          <span className={cx("he text-5xl leading-none sm:text-6xl", tone.text)} lang="he" dir="rtl">
            {book.nameHe}
          </span>
        }
      >
        <Link
          to="/ler/$book/$chapter"
          params={{ book: book.id, chapter: String(startChapter) }}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-tekhelet px-6 font-semibold text-on-accent transition-transform hover:scale-[1.02]"
        >
          <BookOpen className="size-5" aria-hidden />
          {current ? `Continuar no capítulo ${current}` : "Começar a ler"}
        </Link>

        <div className="mt-8 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Capítulos</h2>
          {marked.size > 0 ? (
            <span className="flex items-center gap-1.5 text-sm text-muted">
              <span className="size-2 rounded-full bg-shani" aria-hidden /> com marcas ou notas
            </span>
          ) : null}
        </div>
        <ol className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {Array.from({ length: book.chapters }, (_, index) => index + 1).map((chapter) => {
            const isCurrent = chapter === current;
            return (
              <li key={chapter}>
                <Link
                  to="/ler/$book/$chapter"
                  params={{ book: book.id, chapter: String(chapter) }}
                  aria-label={`Capítulo ${chapter}${isCurrent ? ", onde você parou" : ""}`}
                  className={cx(
                    "relative grid h-12 place-items-center rounded-2xl border text-base font-semibold tabular-nums transition-colors",
                    isCurrent
                      ? "border-tekhelet bg-tekhelet text-on-accent"
                      : "border-line bg-surface hover:border-tekhelet/50 hover:bg-raised/60",
                  )}
                >
                  {chapter}
                  {marked.has(chapter) ? (
                    <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-shani" aria-hidden />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ol>
      </Page>
    </Shell>
  );
}
