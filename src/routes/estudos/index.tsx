import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Shell } from "@/components/shell";
import { bookById } from "@/lib/bible/catalog";
import { GUIDES } from "@/lib/bible/guides";
import { placeById } from "@/lib/bible/places";
import { useStudy } from "@/lib/study/store";

export const Route = createFileRoute("/estudos/")({
  head: () => ({ meta: [{ title: "Estudos · Bíblia Origens" }] }),
  component: EstudosPage,
});

function EstudosPage() {
  const guides = useStudy((state) => state.guides);

  return (
    <Shell>
      <Page kicker="Referências" title="Estudos">
        <p className="text-muted">
          A estrutura dos guias já está aqui. O vocabulário, os versos âncora e as notas entram com o acervo — sem texto inventado no lugar.
        </p>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {GUIDES.map((guide) => {
            const book = bookById(guide.bookId);
            const place = guide.placeId ? placeById(guide.placeId) : undefined;
            const progress = guides.find((row) => row.guideId === guide.id);
            return (
              <li key={guide.id}>
                <Link to="/estudos/$guideId" params={{ guideId: guide.id }} className="block min-h-20 py-4">
                  <p className="text-xs uppercase tracking-widest text-gold">{guide.kicker}</p>
                  <p className="mt-1 text-2xl">{guide.title}</p>
                  <p className="text-muted">
                    {book ? `${book.namePt} ${guide.chapter}` : "Capítulo"}
                    {place ? ` · ${place.namePt}` : ""}
                    {progress?.status === "done" ? " · lido" : ""}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Page>
    </Shell>
  );
}
