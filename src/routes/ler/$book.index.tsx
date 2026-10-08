import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Shell } from "@/components/shell";
import { bookById } from "@/lib/bible/catalog";

export const Route = createFileRoute("/ler/$book/")({
  component: BookPage,
});

function BookPage() {
  const { book: bookId } = Route.useParams();
  const book = bookById(bookId);

  if (!book) {
    return (
      <Shell>
        <Page title="Livro não encontrado">
          <Link to="/ler" className="text-gold">
            Voltar aos livros
          </Link>
        </Page>
      </Shell>
    );
  }

  return (
    <Shell>
      <Page kicker={book.nameTranslit} title={book.namePt}>
        <p className="he text-3xl text-gold" lang="he" dir="rtl">
          {book.nameHe}
        </p>
        <p className="mt-3 text-muted">{book.chapters} capítulos</p>
        <div className="mt-8 grid grid-cols-5 gap-2 sm:grid-cols-8">
          {Array.from({ length: book.chapters }, (_, index) => index + 1).map((chapter) => (
            <Link
              key={chapter}
              to="/ler/$book/$chapter"
              params={{ book: book.id, chapter: String(chapter) }}
              className="grid h-11 place-items-center rounded-full border border-line tabular-nums"
            >
              {chapter}
            </Link>
          ))}
        </div>
      </Page>
    </Shell>
  );
}
