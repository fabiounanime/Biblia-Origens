import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Segmented } from "@/components/ui";
import { AtlasMap } from "@/components/atlas/atlas-map";
import { EventsPanel, JourneysPanel, MeasurePanel } from "@/components/atlas/atlas-panels";
import { PlaceCard } from "@/components/atlas/atlas-parts";
import { EVENTS, PARTS, type PartId } from "@/lib/bible/atlas/events";
import { JOURNEYS } from "@/lib/bible/atlas/journeys";
import { PLACES, placeById } from "@/lib/bible/places";
import { dotsView, pathView, withRegions } from "@/lib/atlas/view";

type Mode = "eventos" | "caminhos" | "medir";

type MapSearch = {
  modo?: Mode;
  parte?: PartId;
  evento?: number;
  caminho?: string;
  /** Lugar aberto no card (também vem dos guias: /mapas?lugar=ur). */
  lugar?: string;
  de?: string;
  para?: string;
};

const MODES: Mode[] = ["eventos", "caminhos", "medir"];
const str = (value: unknown) => (typeof value === "string" && value ? value : undefined);

export const Route = createFileRoute("/mapas")({
  validateSearch: (search: Record<string, unknown>): MapSearch => {
    const evento = Number(search.evento);
    const parte = str(search.parte);
    const modo = str(search.modo);
    return {
      modo: MODES.includes(modo as Mode) ? (modo as Mode) : undefined,
      parte: PARTS.some((p) => p.id === parte) ? (parte as PartId) : undefined,
      evento: EVENTS.some((e) => e.n === evento) ? evento : undefined,
      caminho: JOURNEYS.some((j) => j.id === search.caminho) ? str(search.caminho) : undefined,
      lugar: placeById(str(search.lugar) ?? "") ? str(search.lugar) : undefined,
      de: placeById(str(search.de) ?? "") ? str(search.de) : undefined,
      para: placeById(str(search.para) ?? "") ? str(search.para) : undefined,
    };
  },
  head: () => ({ meta: [{ title: "Mapas · Bíblia Origens" }] }),
  component: MapasPage,
});

const EVENT_PLACES = EVENTS.flatMap((e) => e.placeIds);
const JOURNEY_PLACES = JOURNEYS.flatMap((j) => j.stops.map((s) => s.placeId));
const ALL_PLACES = PLACES.map((p) => p.id);

function MapasPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const mode: Mode = search.modo ?? (search.caminho ? "caminhos" : search.de ? "medir" : "eventos");
  const event = EVENTS.find((e) => e.n === search.evento) ?? null;
  const journey = JOURNEYS.find((j) => j.id === search.caminho) ?? null;
  const part = event?.part ?? search.parte ?? null;
  const place = search.lugar ? placeById(search.lugar) : undefined;

  const set = (next: Partial<MapSearch>) =>
    void navigate({ search: (prev) => ({ ...prev, ...next }), replace: true, resetScroll: false });

  const view = useMemo(() => {
    if (mode === "medir") {
      const ids = [search.de, search.para].filter((id): id is string => Boolean(id));
      // Com um lugar só, o mapa fica parado: o próximo toque escolhe o outro.
      if (ids.length < 2) return dotsView(ALL_PLACES, ids[0]);
      // Os outros lugares continuam no mapa, para tocar e medir de novo.
      const measured = pathView(ids, undefined, { dashed: true });
      const others = dotsView(ALL_PLACES.filter((id) => !ids.includes(id))).pins;
      return { ...measured, pins: [...others, ...measured.pins.map((pin) => ({ ...pin, tone: "active" as const }))] };
    }
    if (mode === "caminhos") {
      return journey
        ? pathView(journey.stops.map((s) => s.placeId), search.lugar, { numbered: true })
        : dotsView(JOURNEY_PLACES, search.lugar);
    }
    if (event) return pathView(event.placeIds, search.lugar, { numbered: event.placeIds.length > 1 });
    const ids = part ? EVENTS.filter((e) => e.part === part).flatMap((e) => e.placeIds) : EVENT_PLACES;
    return part ? dotsViewWithFocus(ids, search.lugar) : dotsView(ids, search.lugar);
  }, [mode, journey, event, part, search.lugar, search.de, search.para]);
  const pins = useMemo(() => withRegions(view.pins, search.lugar), [view.pins, search.lugar]);

  const pick = (id: string) => {
    if (mode === "medir") {
      const { de, para } = search;
      if ((de && para) || (!de && !para)) set({ de: id, para: undefined });
      else if (de && id !== de) set({ para: id });
      else if (para && id !== para) set({ de: id });
      return;
    }
    set({ lugar: search.lugar === id ? undefined : id });
  };

  return (
    <Shell>
      <div className="md:grid md:h-dvh md:grid-cols-[minmax(0,1fr)_24rem] lg:grid-cols-[minmax(0,1fr)_26rem]">
        <AtlasMap
          className="sticky top-14 z-10 h-[46dvh] border-b border-line md:relative md:top-0 md:h-dvh md:border-b-0"
          pins={pins}
          route={view.route}
          focus={view.focus}
          onPick={pick}
        />
        <section className="px-4 pt-5 pb-10 sm:px-6 md:h-dvh md:overflow-y-auto md:border-l md:border-line md:px-5 md:pt-8">
          <h1 className="text-[2rem] leading-tight font-bold tracking-tight">Mapas</h1>
          <p className="mt-1 text-muted">Os lugares da Bíblia em satélite, do Gênesis ao Apocalipse.</p>
          <div className="mt-5">
            <Segmented
              label="O que ver no mapa"
              value={mode}
              options={[
                { id: "eventos", label: "Eventos" },
                { id: "caminhos", label: "Caminhos" },
                { id: "medir", label: "Medir" },
              ]}
              onChange={(modo) => set({ modo, lugar: undefined })}
            />
          </div>

          {place && mode !== "medir" ? (
            <PlaceCard
              place={place}
              onClose={() => set({ lugar: undefined })}
              onEvent={(n) => set({ modo: "eventos", evento: n, caminho: undefined, lugar: undefined })}
              onJourney={(id) => set({ modo: "caminhos", caminho: id, evento: undefined, lugar: undefined })}
            />
          ) : null}

          {mode === "eventos" ? (
            <EventsPanel
              part={part}
              event={event}
              onPart={(parte) => set({ parte: parte ?? undefined, evento: undefined, lugar: undefined })}
              onEvent={(n) => set({ evento: n ?? undefined, parte: n ? undefined : part ?? undefined, lugar: undefined })}
            />
          ) : mode === "caminhos" ? (
            <JourneysPanel journey={journey} onJourney={(id) => set({ caminho: id ?? undefined, lugar: undefined })} />
          ) : (
            <MeasurePanel from={search.de} to={search.para} onChange={(de, para) => set({ de, para })} />
          )}

          <p className="mt-8 text-xs leading-relaxed text-muted">
            Distâncias em linha reta entre os pontos. Lugares antigos têm identificação aproximada; o selo
            no card diz quando o local é provável, incerto ou só tradicional. Coordenadas da OpenBible.info.
          </p>
        </section>
      </div>
    </Shell>
  );
}

/** Pontos de uma parte da história, já enquadrados no mapa. */
function dotsViewWithFocus(ids: string[], activeId?: string) {
  const view = dotsView(ids, activeId);
  return activeId ? view : { ...view, focus: view.pins.map((p) => [p.lon, p.lat] as [number, number]) };
}
