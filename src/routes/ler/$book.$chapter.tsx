import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Shell } from "@/components/shell";
import { bookById } from "@/lib/bible/catalog";
import { displayHebrew, loadChapter, type Verse } from "@/lib/bible/corpus";
import { findMark, useStudy } from "@/lib/study/store";

export const Route = createFileRoute("/ler/$book/$chapter")({
  component: ChapterPage,
});

function ChapterPage() {
  const { book: bookId, chapter: chapterParam } = Route.useParams();
  const chapter = Number(chapterParam);
  const book = bookById(bookId);
  const valid = !!book && Number.isInteger(chapter) && chapter >= 1 && chapter <= (book?.chapters ?? 0);
  const showNiqqud = useStudy((state) => state.showNiqqud);
  const marks = useStudy((state) => state.marks);
  const setPosition = useStudy((state) => state.setPosition);
  const [verses, setVerses] = useState<Verse[] | null | "loading">("loading");

  useEffect(() => {
    if (!valid) return;
    setPosition(bookId, chapter, 0);
  }, [valid, bookId, chapter, setPosition]);

  useEffect(() => {
    if (!valid) return;
    let cancel = false;
    setVerses("loading");
    void loadChapter(bookId, chapter).then((rows) => {
      if (!cancel) setVerses(rows);
    });
    return () => {
      cancel = true;
    };
  }, [valid, bookId, chapter]);

  if (!book || !valid) {
    return (
      <Shell>
        <Page title="Capítulo não encontrado">
          <Link to="/ler" className="text-gold">
            Voltar aos livros
          </Link>
        </Page>
      </Shell>
    );
  }

  const previous = chapter > 1 ? chapter - 1 : null;
  const next = chapter < book.chapters ? chapter + 1 : null;

  return (
    <Shell>
      <Page kicker={`${book.nameTranslit} · ${book.nameHe}`} title={`${book.namePt} ${chapter}`}>
        <div className="flex gap-3">
          {previous ? (
            <Link
              to="/ler/$book/$chapter"
              params={{ book: book.id, chapter: String(previous) }}
              className="inline-flex min-h-11 items-center rounded-full border border-line px-4"
            >
              Anterior
            </Link>
          ) : (
            <span className="inline-flex min-h-11 items-center px-4 text-muted">Anterior</span>
          )}
          {next ? (
            <Link
              to="/ler/$book/$chapter"
              params={{ book: book.id, chapter: String(next) }}
              className="inline-flex min-h-11 items-center rounded-full border border-line px-4"
            >
              Seguinte
            </Link>
          ) : (
            <span className="inline-flex min-h-11 items-center px-4 text-muted">Seguinte</span>
          )}
        </div>
        <p className="mt-6 text-sm uppercase tracking-widest text-muted">Português · hebraico · transliterado</p>

        {verses === "loading" ? <p className="mt-8 text-muted">Abrindo o capítulo…</p> : null}
        {verses === null || (Array.isArray(verses) && verses.length === 0) ? (
          <EmptyChapter bookId={book.id} chapter={chapter} />
        ) : null}
        {Array.isArray(verses)
          ? verses.map((verse) => (
              <article key={verse.v} className="border-b border-line py-8">
                <p className="text-sm text-gold tabular-nums">{verse.v}</p>
                <p className="mt-3 text-xl leading-relaxed">{verse.pt}</p>
                <p className="he mt-4" lang="he" dir="rtl">
                  {displayHebrew(verse.he, showNiqqud)}
                </p>
                <p className="mt-3 text-muted italic">{verse.tr}</p>
                <VerseTools bookId={book.id} chapter={chapter} verse={verse.v} />
              </article>
            ))
          : null}
        <p className="mt-6 text-sm text-muted">
          {findMark(marks, book.id, chapter, 0, "bookmark") ? "Capítulo guardado neste aparelho." : "Nada guardado ainda neste capítulo."}
        </p>
      </Page>
    </Shell>
  );
}

function EmptyChapter({ bookId, chapter }: { bookId: string; chapter: number }) {
  return (
    <div className="mt-8 border-y border-line py-8">
      <p className="text-xs uppercase tracking-widest text-gold">Português</p>
      <p className="mt-3 text-lg text-muted">A tradução direta deste capítulo ainda não entrou no acervo.</p>
      <p className="mt-8 text-xs uppercase tracking-widest text-gold">Hebraico</p>
      <p className="he mt-3 text-muted" lang="he" dir="rtl">
        —
      </p>
      <p className="mt-8 text-xs uppercase tracking-widest text-gold">Transliterado</p>
      <p className="mt-3 text-muted italic">—</p>
      <VerseTools bookId={bookId} chapter={chapter} verse={0} chapterLevel />
    </div>
  );
}

function VerseTools({
  bookId,
  chapter,
  verse,
  chapterLevel,
}: {
  bookId: string;
  chapter: number;
  verse: number;
  chapterLevel?: boolean;
}) {
  const marks = useStudy((state) => state.marks);
  const toggleBookmark = useStudy((state) => state.toggleBookmark);
  const saveNote = useStudy((state) => state.saveNote);
  const saved = !!findMark(marks, bookId, chapter, verse, "bookmark");
  const note = findMark(marks, bookId, chapter, verse, "note");
  const [draft, setDraft] = useState(note?.body ?? "");

  useEffect(() => {
    setDraft(note?.body ?? "");
  }, [note?.body, note?.updatedAt]);

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => toggleBookmark(bookId, chapter, verse)}
        className="min-h-11 rounded-full border border-gold px-4 text-gold"
      >
        {saved ? "Guardado" : chapterLevel ? "Guardar capítulo" : "Guardar"}
      </button>
      <label className="mt-4 block">
        <span className="text-sm text-muted">{chapterLevel ? "Nota deste capítulo" : "Nota"}</span>
        <textarea
          value={draft}
          maxLength={4000}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => saveNote(bookId, chapter, verse, draft)}
          rows={3}
          className="mt-2 w-full resize-y rounded-2xl border border-line bg-surface px-4 py-3"
        />
      </label>
    </div>
  );
}
