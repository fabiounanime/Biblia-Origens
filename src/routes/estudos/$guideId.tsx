import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CircleCheck, MapPin, RotateCcw } from "lucide-react";
import { BackLabel, Page, Shell } from "@/components/shell";
import { cx } from "@/components/ui";
import { SECTION_TONE, bookById } from "@/lib/bible/catalog";
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
        <Page title="Guia não encontrado" lead="Este endereço não corresponde a nenhum guia.">
          <Link to="/estudos" className="font-medium text-tekhelet">
            Ver os guias
          </Link>
        </Page>
      </Shell>
    );
  }

  const book = bookById(guide.bookId);
  const place = guide.placeId ? placeById(guide.placeId) : undefined;
  const tone = SECTION_TONE[book?.section ?? "torah"];
  const done = progress?.status === "done";

  return (
    <Shell>
      <Page
        top={
          <Link to="/estudos">
            <BackLabel>Estudos</BackLabel>
          </Link>
        }
        title={guide.title}
        lead="Este guia reserva o lugar do estudo. Raízes hebraicas, versos e referências cruzadas entram quando o acervo for publicado."
        action={
          <span className={cx("rounded-full px-3 py-1 text-sm font-semibold", tone.soft, tone.text)}>{guide.kicker}</span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {book ? (
            <Link
              to="/ler/$book/$chapter"
              params={{ book: book.id, chapter: String(guide.chapter) }}
              className={cx(
                "group relative overflow-hidden rounded-3xl border bg-surface p-5 transition-colors hover:bg-raised/50",
                tone.border,
              )}
            >
              <span className="flex items-center gap-2 text-sm text-muted">
                <BookOpen className="size-4" aria-hidden /> Capítulo âncora
              </span>
              <span className="mt-6 flex items-end justify-between gap-3">
                <span className="text-2xl font-bold tracking-tight">
                  {book.namePt} {guide.chapter}
                </span>
                <span className={cx("he text-3xl", tone.text)} lang="he" dir="rtl">
                  {book.nameHe}
                </span>
              </span>
            </Link>
          ) : null}
          {place ? (
            <Link
              to="/mapas"
              search={{ lugar: place.id }}
              className="rounded-3xl border border-line bg-surface p-5 transition-colors hover:bg-raised/50"
            >
              <span className="flex items-center gap-2 text-sm text-muted">
                <MapPin className="size-4" aria-hidden /> No mapa
              </span>
              <span className="mt-6 flex items-end justify-between gap-3">
                <span>
                  <span className="block text-2xl font-bold tracking-tight">{place.namePt}</span>
                  <span className="block text-sm text-muted italic">{place.nameTranslit}</span>
                </span>
                <span className="he text-3xl text-zahav" lang="he" dir="rtl">
                  {place.nameHe}
                </span>
              </span>
            </Link>
          ) : (
            <div className="grid place-items-center rounded-3xl border border-dashed border-line p-5 text-center text-muted">
              Este guia não aponta um lugar no mapa.
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setGuideStatus(guide.id, done ? "reading" : "done")}
          className={cx(
            "mt-8 inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold transition-colors",
            done ? "border border-line text-soft hover:border-muted" : "bg-tekhelet text-on-accent",
          )}
        >
          {done ? <RotateCcw className="size-5" aria-hidden /> : <CircleCheck className="size-5" aria-hidden />}
          {done ? "Voltar para em leitura" : "Marcar como lido"}
        </button>
        {done ? <p className="mt-3 text-sm text-tekhelet">Você marcou este guia como lido.</p> : null}
      </Page>
    </Shell>
  );
}
