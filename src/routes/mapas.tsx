import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Shell } from "@/components/shell";
import { GUIDES } from "@/lib/bible/guides";
import { PLACES, placeById } from "@/lib/bible/places";

type MapSearch = { lugar?: string };

export const Route = createFileRoute("/mapas")({
  validateSearch: (search: Record<string, unknown>): MapSearch => ({
    lugar: typeof search.lugar === "string" ? search.lugar : undefined,
  }),
  head: () => ({ meta: [{ title: "Mapas · Bíblia Origens" }] }),
  component: MapasPage,
});

function MapasPage() {
  const { lugar } = Route.useSearch();
  const selected = lugar ? placeById(lugar) : undefined;
  const related = selected ? GUIDES.filter((guide) => guide.placeId === selected.id) : [];

  return (
    <Shell>
      <Page kicker="Crescente Fértil" title="Mapas" wide>
        <p className="max-w-2xl text-muted">
          Mapa esquemático, não um levantamento. Os pinos marcam lugares do Tanakh. O relato de cada um entra com o acervo.
        </p>
        <div className="relative mt-6 overflow-hidden rounded-3xl border border-line">
          <img
            src="/map.jpg"
            alt="Mapa esquemático do Crescente Fértil, sem rótulos. Os nomes estão na lista."
            className="block w-full"
          />
          {PLACES.map((place) => {
            const active = place.id === selected?.id;
            return (
              <Link
                key={place.id}
                to="/mapas"
                search={{ lugar: place.id }}
                aria-label={place.namePt}
                className={`absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border ${
                  active ? "border-bg bg-gold text-bg" : "border-gold bg-bg/80 text-gold"
                }`}
                style={{ left: `${place.x}%`, top: `${place.y}%` }}
              >
                <span className="size-2 rounded-full bg-current" />
              </Link>
            );
          })}
        </div>

        {selected ? (
          <article className="mt-6 rounded-3xl border border-line bg-surface px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-gold">{selected.region}</p>
            <h2 className="mt-2 text-3xl">{selected.namePt}</h2>
            <p className="he text-gold" lang="he" dir="rtl">
              {selected.nameHe}
            </p>
            <p className="text-muted italic">{selected.nameTranslit}</p>
            <p className="mt-4 text-muted">O que aconteceu aqui, e os versos ligados, entram com o acervo.</p>
            {related.length > 0 ? (
              <ul className="mt-4">
                {related.map((guide) => (
                  <li key={guide.id}>
                    <Link to="/estudos/$guideId" params={{ guideId: guide.id }} className="text-gold">
                      Guia: {guide.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ) : null}

        <ul className="mt-6 divide-y divide-line border-y border-line">
          {PLACES.map((place) => (
            <li key={place.id}>
              <Link
                to="/mapas"
                search={{ lugar: place.id }}
                className={`flex min-h-14 items-baseline justify-between gap-4 py-3 ${
                  place.id === selected?.id ? "text-gold" : ""
                }`}
              >
                <span>
                  <span className="block text-xl">{place.namePt}</span>
                  <span className="text-sm text-muted italic">{place.nameTranslit}</span>
                </span>
                <span className="he" lang="he" dir="rtl">
                  {place.nameHe}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Page>
    </Shell>
  );
}
