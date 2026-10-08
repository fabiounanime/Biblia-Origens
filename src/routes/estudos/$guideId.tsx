import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Shell } from "@/components/shell";
import { bookById } from "@/lib/bible/catalog";
import { guideById } from "@/lib/bible/guides";
import { placeById } from "@/lib/bible/places";
import { useStudy } from "@/lib/study/store";

export const Route = createFileRoute("/estudos/$guideId")({
  component: GuidePage,
});

function GuidePage() {
  const { guideId } = Route.useParams();
  const guide = guideById(guideId);
  const progress = useStudy((state) => state.guides.find((row) => row.guideId === guideId));
  const setGuideStatus = useStudy((state) => state.setGuideStatus);

  if (!guide) {
    return (
      <Shell>
        <Page title="Guia não encontrado">
          <Link to="/estudos" className="text-gold">
            Voltar aos estudos
          </Link>
        </Page>
      </Shell>
    );
  }

  const book = bookById(guide.bookId);
  const place = guide.placeId ? placeById(guide.placeId) : undefined;
  const done = progress?.status === "done";

  return (
    <Shell>
      <Page kicker={guide.kicker} title={guide.title}>
        <p className="text-lg text-muted">
          Este guia reserva o lugar do estudo. O texto — raízes hebraicas, versos e referências cruzadas — entra quando o acervo for publicado.
        </p>
        {book ? (
          <Link
            to="/ler/$book/$chapter"
            params={{ book: book.id, chapter: String(guide.chapter) }}
            className="mt-8 block rounded-3xl border border-line bg-surface px-5 py-4"
          >
            <p className="text-xs uppercase tracking-widest text-gold">Capítulo âncora</p>
            <p className="mt-2 text-2xl">
              {book.namePt} {guide.chapter}
            </p>
            <p className="he text-gold" lang="he" dir="rtl">
              {book.nameHe}
            </p>
          </Link>
        ) : null}
        {place ? (
          <Link
            to="/mapas"
            search={{ lugar: place.id }}
            className="mt-4 block rounded-3xl border border-line px-5 py-4"
          >
            <p className="text-xs uppercase tracking-widest text-gold">No mapa</p>
            <p className="mt-2 text-2xl">{place.namePt}</p>
            <p className="text-muted italic">{place.nameTranslit}</p>
          </Link>
        ) : (
          <p className="mt-6 text-muted">Este guia não aponta um lugar no mapa.</p>
        )}
        <button
          type="button"
          onClick={() => setGuideStatus(guide.id, done ? "reading" : "done")}
          className="mt-8 min-h-11 rounded-full border border-gold px-5 text-gold"
        >
          {done ? "Marcar como em leitura" : "Marcar como lido"}
        </button>
      </Page>
    </Shell>
  );
}
