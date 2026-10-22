import { createFileRoute, Link } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { Page, Shell } from "@/components/shell";
import { cx } from "@/components/ui";
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
      <Page title="Mapas" lead="O Crescente Fértil em mapa esquemático. Toque num ponto para ver o lugar.">
        {/* Mesma coluna das outras telas: o mapa em cima, o lugar e a lista embaixo. */}
        <div className="grid gap-5">
          <figure className="relative overflow-hidden rounded-[28px] border border-line shadow-float">
            <img
              src="/map.jpg"
              alt="Mapa esquemático do Crescente Fértil, sem rótulos. Os nomes estão na lista."
              className="block w-full"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/50 via-transparent to-transparent" aria-hidden />
            {PLACES.map((place) => {
              const active = place.id === selected?.id;
              return (
                <Link
                  key={place.id}
                  to="/mapas"
                  search={{ lugar: place.id }}
                  replace
                  resetScroll={false}
                  aria-label={place.namePt}
                  aria-current={active ? "true" : undefined}
                  className={cx(
                    "group absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center",
                    active && "z-10",
                  )}
                  style={{ left: `${place.x}%`, top: `${place.y}%` }}
                >
                  <span
                    className={cx(
                      "grid size-6 place-items-center rounded-full border-2 transition-transform duration-150 ease-out",
                      active
                        ? "pin-active border-white bg-zahav"
                        : "scale-[0.6] border-white/90 bg-tekhelet group-hover:scale-[0.85] sm:scale-[0.7]",
                    )}
                  />
                  <span
                    className={cx(
                      "pointer-events-none absolute rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
                      place.label === "left"
                        ? "right-full top-1/2 -mr-1 -translate-y-1/2"
                        : place.label === "right"
                          ? "left-full top-1/2 -ml-1 -translate-y-1/2"
                          : "top-full -mt-1",
                      active ? "bg-zahav text-[#1a1306]" : "hidden bg-black/55 text-white sm:block",
                    )}
                  >
                    {place.namePt}
                  </span>
                </Link>
              );
            })}
          </figure>

          <div className="grid items-start gap-4 sm:grid-cols-2">
            {selected ? (
              <article className="rounded-3xl border border-zahav/40 bg-gradient-to-br from-zahav/14 to-surface p-5 sm:sticky sm:top-20 md:top-6">
                <p className="text-sm font-medium text-zahav">{selected.region}</p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">{selected.namePt}</h2>
                    <p className="text-sm text-muted italic">{selected.nameTranslit}</p>
                  </div>
                  <p className="he text-3xl text-zahav" lang="he" dir="rtl">
                    {selected.nameHe}
                  </p>
                </div>
                <p className="mt-4 text-sm text-muted">O que aconteceu aqui, e os versos ligados, entram com o acervo.</p>
                {related.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {related.map((guide) => (
                      <li key={guide.id}>
                        <Link
                          to="/estudos/$guideId"
                          params={{ guideId: guide.id }}
                          className="flex h-11 items-center gap-2 rounded-2xl bg-bg/60 px-3 font-medium text-tekhelet hover:bg-bg"
                        >
                          <ScrollText className="size-4" aria-hidden />
                          Guia: {guide.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ) : (
              <div className="rounded-3xl border border-dashed border-line p-5 text-muted sm:sticky sm:top-20 md:top-6">
                Escolha um lugar no mapa ou na lista para ver o nome em hebraico e os guias ligados a ele.
              </div>
            )}

            <ul className="overflow-hidden rounded-3xl border border-line bg-surface">
              {PLACES.map((place) => {
                const active = place.id === selected?.id;
                return (
                  <li key={place.id} className="border-b border-line last:border-b-0">
                    <Link
                      to="/mapas"
                      search={{ lugar: place.id }}
                      replace
                      resetScroll={false}
                      className={cx(
                        "flex min-h-14 items-center justify-between gap-4 px-4 py-2.5 transition-colors",
                        active ? "bg-zahav/12" : "hover:bg-raised/50",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className={cx("size-2.5 rounded-full", active ? "bg-zahav" : "bg-tekhelet")} aria-hidden />
                        <span>
                          <span className="block font-medium">{place.namePt}</span>
                          <span className="block text-xs text-muted">{place.region}</span>
                        </span>
                      </span>
                      <span className={cx("he text-lg", active ? "text-zahav" : "text-soft")} lang="he" dir="rtl">
                        {place.nameHe}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Page>
    </Shell>
  );
}
