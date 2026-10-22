import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleCheck, MapPin } from "lucide-react";
import { Page, Shell } from "@/components/shell";
import { cx } from "@/components/ui";
import { SECTION_TONE, bookById } from "@/lib/bible/catalog";
import { GUIDES } from "@/lib/bible/guides";
import { placeById } from "@/lib/bible/places";
import { isChapterPublished, useAcervoIndex } from "@/lib/bible/use-acervo";
import { useStudy } from "@/lib/study/store";

export const Route = createFileRoute("/estudos/")({
  head: () => ({ meta: [{ title: "Estudos · Bíblia Origens" }] }),
  component: EstudosPage,
});

function EstudosPage() {
  const guides = useStudy((state) => state.guides);
  const doneCount = GUIDES.filter((guide) => guides.some((row) => row.guideId === guide.id && row.status === "done")).length;
  const acervo = useAcervoIndex();

  return (
    <Shell>
      <Page title="Estudos" lead="Guias que ligam um capítulo âncora a um lugar no mapa. O texto de cada guia entra com o acervo.">
        <div className="rounded-3xl border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-semibold">Seu percurso</p>
            <p className="text-sm text-muted tabular-nums">
              {doneCount} de {GUIDES.length} guias lidos
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-sunken">
            {/* scaleX em vez de width: anima sem recalcular o layout. */}
            <div
              className="h-full origin-left rounded-full bg-gradient-to-r from-tekhelet to-argaman transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${doneCount / GUIDES.length})` }}
            />
          </div>
        </div>

        {/* Os guias seguem a ordem da narrativa, por isso a numeração. */}
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {GUIDES.map((guide, index) => {
            const book = bookById(guide.bookId);
            const place = guide.placeId ? placeById(guide.placeId) : undefined;
            const progress = guides.find((row) => row.guideId === guide.id);
            const tone = SECTION_TONE[book?.section ?? "torah"];
            const done = progress?.status === "done";
            const published = isChapterPublished(acervo, guide.bookId, guide.chapter);
            return (
              <li key={guide.id}>
                <Link
                  to="/estudos/$guideId"
                  params={{ guideId: guide.id }}
                  className="pressable-card group flex h-full gap-4 rounded-3xl border border-line bg-surface p-4 hover:border-muted/60 hover:bg-raised/50"
                >
                  <span
                    className={cx(
                      "grid size-11 shrink-0 place-items-center rounded-2xl text-lg font-bold tabular-nums",
                      done ? "bg-tekhelet text-on-accent" : cx(tone.soft, tone.text),
                    )}
                  >
                    {done ? <CircleCheck className="size-5" aria-label="Lido" /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cx("text-sm font-medium", tone.text)}>{guide.kicker}</span>
                    <span className="block text-xl leading-snug font-semibold">{guide.title}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                      <span>{book ? `${book.namePt} ${guide.chapter}` : "Capítulo"}</span>
                      {place ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" aria-hidden /> {place.namePt}
                        </span>
                      ) : null}
                      {progress?.status === "reading" ? <span className="text-tekhelet">Em leitura</span> : null}
                      {!published ? <span className="text-soft">Capítulo em tradução</span> : null}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </Page>
    </Shell>
  );
}
