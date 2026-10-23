import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, ExternalLink, Route as RouteIcon, ScrollText, X } from "lucide-react";
import { cx } from "@/components/ui";
import { EVENTS } from "@/lib/bible/atlas/events";
import { JOURNEYS } from "@/lib/bible/atlas/journeys";
import { GUIDES } from "@/lib/bible/guides";
import type { Ref } from "@/lib/bible/atlas/ref";
import { formatCoords, formatKm, googleMapsUrl, type Certainty, type Place } from "@/lib/bible/places";
import type { Leg } from "@/lib/atlas/view";

export function RefLink({ r, className }: { r: Ref; className?: string }) {
  return (
    <Link
      to="/ler/$book/$chapter"
      params={{ book: r.book, chapter: String(r.chapter) }}
      hash={r.verse && r.verse > 1 ? `v${r.verse}` : undefined}
      className={cx(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full bg-tekhelet/12 px-3 text-sm font-semibold text-tekhelet tabular-nums hover:bg-tekhelet/20",
        className,
      )}
    >
      <BookOpen className="size-3.5" aria-hidden />
      {r.label}
    </Link>
  );
}

const CERTAINTY: Record<Exclude<Certainty, "alta">, string> = {
  provável: "local provável",
  incerta: "local incerto",
  tradicional: "local tradicional",
  desconhecida: "local desconhecido",
};

export function CertaintyBadge({ place }: { place: Place }) {
  if (place.certainty === "alta") return null;
  return (
    <span
      className="inline-flex h-6 items-center rounded-full border border-zahav/40 px-2 text-xs font-medium text-zahav"
      title={place.note}
    >
      {CERTAINTY[place.certainty]}
    </span>
  );
}

export function LegList({ legs }: { legs: Leg[] }) {
  if (legs.length === 0) return null;
  return (
    <ul className="mt-3 space-y-1 text-sm">
      {legs.map((leg, i) => (
        <li key={i} className="flex items-baseline justify-between gap-3 border-b border-line/60 py-1.5 last:border-b-0">
          <span className="min-w-0 truncate text-soft">
            {leg.from.namePt} → {leg.to.namePt}
          </span>
          <span className="shrink-0 font-semibold tabular-nums">{formatKm(leg.km)}</span>
        </li>
      ))}
    </ul>
  );
}

export function PlaceCard({
  place,
  onClose,
  onEvent,
  onJourney,
}: {
  place: Place;
  onClose: () => void;
  onEvent: (n: number) => void;
  onJourney: (id: string) => void;
}) {
  const events = EVENTS.filter((e) => e.placeIds.includes(place.id));
  const journeys = JOURNEYS.filter((j) => j.stops.some((s) => s.placeId === place.id));
  const guides = GUIDES.filter((g) => g.placeId === place.id);
  const ref = useRef<HTMLElement>(null);
  // No celular o card pode abrir fora da vista (o painel rola sob o mapa fixo).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [place.id]);
  return (
    <article
      ref={ref}
      className="mt-5 scroll-mt-[calc(46dvh+4.5rem)] rounded-3xl border border-zahav/40 bg-gradient-to-br from-zahav/14 to-surface p-5 md:scroll-mt-6"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zahav">{place.region}</p>
          <h2 className="mt-0.5 text-2xl font-bold tracking-tight">{place.namePt}</h2>
          {place.nameTranslit ? <p className="text-sm text-muted italic">{place.nameTranslit}</p> : null}
        </div>
        <div className="flex shrink-0 items-start gap-2">
          {place.nameHe ? (
            <p className="he text-3xl text-zahav" lang="he" dir="rtl">
              {place.nameHe}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar lugar"
            className="-mt-1 -mr-2 grid size-11 place-items-center rounded-full text-muted hover:bg-raised hover:text-fg"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </div>
      {place.certainty !== "alta" || place.note ? (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
          <CertaintyBadge place={place} />
          {place.note}
        </p>
      ) : null}
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <span className="text-soft tabular-nums">{formatCoords(place)}</span>
        <a
          href={googleMapsUrl(place)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-tekhelet/12 px-3 font-semibold text-tekhelet hover:bg-tekhelet/20"
        >
          <ExternalLink className="size-3.5" aria-hidden />
          Abrir no Google Maps
          <span className="sr-only"> (abre fora do app)</span>
        </a>
      </p>
      {events.length > 0 ? (
        <>
          <h3 className="mt-4 text-sm font-semibold text-soft">Aconteceu aqui</h3>
          <ul className="mt-1.5 space-y-1">
            {events.map((e) => (
              <li key={e.n}>
                <button
                  type="button"
                  onClick={() => onEvent(e.n)}
                  className="flex min-h-11 w-full items-center gap-3 rounded-2xl bg-bg/60 px-3 text-left font-medium hover:bg-bg"
                >
                  <span className="text-xs font-semibold text-zahav tabular-nums">{e.n}</span>
                  {e.title}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {guides.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {guides.map((guide) => (
            <li key={guide.id}>
              <Link
                to="/estudos/$guideId"
                params={{ guideId: guide.id }}
                className="flex min-h-11 items-center gap-2 rounded-2xl bg-bg/60 px-3 font-medium text-tekhelet hover:bg-bg"
              >
                <ScrollText className="size-4" aria-hidden />
                Guia: {guide.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {journeys.length > 0 ? (
        <>
          <h3 className="mt-4 text-sm font-semibold text-soft">Passaram por aqui</h3>
          <ul className="mt-1.5 flex flex-wrap gap-2">
            {journeys.map((j) => (
              <li key={j.id}>
                <button
                  type="button"
                  onClick={() => onJourney(j.id)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-bg/60 px-3 text-sm font-medium hover:border-tekhelet/50"
                >
                  <RouteIcon className="size-4 text-tekhelet" aria-hidden />
                  {j.person}
                  {j.person === "Paulo" ? <span className="text-muted">· {j.title}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
}
