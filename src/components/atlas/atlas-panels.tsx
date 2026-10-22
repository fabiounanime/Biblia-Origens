import { ArrowLeft, ArrowUpDown } from "lucide-react";
import { cx } from "@/components/ui";
import { EVENTS, PARTS, type BibleEvent, type PartId } from "@/lib/bible/atlas/events";
import { JOURNEYS, ROLES, type Journey } from "@/lib/bible/atlas/journeys";
import { PLACES, distanceKm, formatKm, placeById } from "@/lib/bible/places";
import { pathView } from "@/lib/atlas/view";
import { LegList, RefLink } from "./atlas-parts";

function BackButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-tekhelet hover:bg-tekhelet/10"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {children}
    </button>
  );
}

export function EventsPanel({
  part,
  event,
  onPart,
  onEvent,
}: {
  part: PartId | null;
  event: BibleEvent | null;
  onPart: (part: PartId | null) => void;
  onEvent: (n: number | null) => void;
}) {
  if (event) {
    const { legs } = pathView(event.placeIds);
    const partInfo = PARTS.find((p) => p.id === event.part);
    return (
      <article className="mt-5">
        <BackButton onClick={() => onEvent(null)}>Todos os eventos</BackButton>
        <p className="mt-2 text-sm font-medium text-zahav">
          {event.n} · Parte {partInfo?.n}: {partInfo?.title}
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">{event.title}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {event.refs.map((r) => (
            <RefLink key={r.label} r={r} />
          ))}
        </div>
        <p className="mt-4 leading-relaxed text-soft">{event.text}</p>
        {legs.length > 0 ? (
          <>
            <h3 className="mt-5 text-sm font-semibold text-soft">Distâncias</h3>
            <LegList legs={legs} />
          </>
        ) : null}
        <nav className="mt-6 flex justify-between gap-2" aria-label="Outros eventos">
          {event.n > 1 ? (
            <button type="button" onClick={() => onEvent(event.n - 1)} className="min-h-11 rounded-full px-3 text-sm font-medium text-muted hover:text-fg">
              ← {event.n - 1}
            </button>
          ) : (
            <span />
          )}
          {event.n < EVENTS.length ? (
            <button type="button" onClick={() => onEvent(event.n + 1)} className="min-h-11 rounded-full px-3 text-sm font-medium text-muted hover:text-fg">
              {event.n + 1} →
            </button>
          ) : null}
        </nav>
      </article>
    );
  }
  const list = part ? EVENTS.filter((e) => e.part === part) : EVENTS;
  return (
    <div className="mt-5">
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:-mx-5 md:px-5"
        role="group"
        aria-label="Partes da história"
      >
        {[{ id: null, n: "Todas", title: "" }, ...PARTS].map((p) => {
          const active = p.id === part;
          return (
            <button
              key={p.n}
              type="button"
              aria-pressed={active}
              title={p.title}
              onClick={() => onPart(p.id as PartId | null)}
              className={cx(
                "min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
                active ? "border-zahav bg-zahav/15 text-fg" : "border-line text-muted hover:text-fg",
              )}
            >
              {p.n}
            </button>
          );
        })}
      </div>
      {part ? (
        <p className="mt-3 text-sm text-muted">
          <span className="font-semibold text-fg">{PARTS.find((p) => p.id === part)?.title}</span> ·{" "}
          {PARTS.find((p) => p.id === part)?.period}
        </p>
      ) : null}
      <ol className="mt-3 overflow-hidden rounded-3xl border border-line bg-surface">
        {list.map((e) => (
          <li key={e.n} className="border-b border-line last:border-b-0">
            <button
              type="button"
              onClick={() => onEvent(e.n)}
              className="flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-raised/50"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tekhelet/14 text-xs font-bold text-tekhelet tabular-nums">
                {e.n}
              </span>
              <span className="min-w-0">
                <span className="block font-medium">{e.title}</span>
                <span className="block truncate text-xs text-muted">
                  {e.refs[0]?.label} · {e.placeIds.map((id) => placeById(id)?.namePt).join(", ")}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function journeyKm(j: Journey) {
  return pathView(j.stops.map((s) => s.placeId)).totalKm;
}

export function JourneysPanel({ journey, onJourney }: { journey: Journey | null; onJourney: (id: string | null) => void }) {
  if (journey) {
    const { legs, totalKm } = pathView(journey.stops.map((s) => s.placeId));
    return (
      <article className="mt-5">
        <BackButton onClick={() => onJourney(null)}>Todos os caminhos</BackButton>
        <p className="mt-2 text-sm font-medium text-zahav">{journey.person}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">{journey.title}</h2>
        <p className="mt-3 leading-relaxed text-soft">{journey.summary}</p>
        <p className="mt-4 rounded-2xl bg-sunken px-4 py-3 text-sm">
          <span className="text-2xl font-bold tabular-nums">≈ {formatKm(totalKm)}</span>
          <span className="block text-muted">
            somando {legs.length} trechos em linha reta; a pé o caminho era mais longo
          </span>
        </p>
        <ol className="mt-4">
          {journey.stops.map((stop, i) => {
            const place = placeById(stop.placeId);
            const next = journey.stops[i + 1];
            const nextPlace = next ? placeById(next.placeId) : undefined;
            const km = place && nextPlace && nextPlace.id !== place.id ? distanceKm(place, nextPlace) : null;
            return (
              <li key={i} className="relative pl-10">
                <span className="absolute top-2.5 left-0 grid size-7 place-items-center rounded-full bg-tekhelet text-xs font-bold text-white tabular-nums">
                  {i + 1}
                </span>
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2">
                  <span className="min-w-0">
                    <span className="block font-semibold">{place?.namePt}</span>
                    {stop.note ? <span className="block text-sm text-muted">{stop.note}</span> : null}
                  </span>
                  <RefLink r={stop.ref} className="min-h-8 px-2.5 text-xs" />
                </div>
                {km !== null ? (
                  <p className="border-l-2 border-dashed border-zahav/50 py-1 pl-3 text-xs font-semibold text-zahav tabular-nums -ml-[1.6rem]">
                    {formatKm(km)}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </article>
    );
  }
  return (
    <div className="mt-5 space-y-5">
      {ROLES.map((role) => (
        <section key={role.id}>
          <h2 className="text-sm font-semibold text-soft">{role.title}</h2>
          <ul className="mt-2 overflow-hidden rounded-3xl border border-line bg-surface">
            {JOURNEYS.filter((j) => j.role === role.id).map((j) => (
              <li key={j.id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  onClick={() => onJourney(j.id)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-raised/50"
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{j.person}</span>
                    <span className="block truncate text-xs text-muted">{j.title}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-muted tabular-nums">
                    <span className="block font-semibold text-fg">{formatKm(journeyKm(j))}</span>
                    {j.stops.length} paradas
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

const SORTED = [...PLACES].sort((a, b) => a.namePt.localeCompare(b.namePt, "pt-BR"));

function PlaceSelect({ label, value, onChange }: { label: string; value?: string; onChange: (id?: string) => void }) {
  return (
    <label className="block min-w-0 flex-1">
      <span className="text-sm font-medium text-soft">{label}</span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="mt-1 h-12 w-full rounded-2xl border border-field bg-surface px-3 text-base"
      >
        <option value="">Escolha um lugar</option>
        {SORTED.map((p) => (
          <option key={p.id} value={p.id}>
            {p.namePt}
          </option>
        ))}
      </select>
    </label>
  );
}

export function MeasurePanel({
  from,
  to,
  onChange,
}: {
  from?: string;
  to?: string;
  onChange: (from?: string, to?: string) => void;
}) {
  const a = from ? placeById(from) : undefined;
  const b = to ? placeById(to) : undefined;
  return (
    <div className="mt-5">
      <p className="text-sm text-muted">Escolha dois lugares aqui ou toque neles no mapa.</p>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-3">
        <PlaceSelect label="De" value={from} onChange={(id) => onChange(id, to)} />
        <button
          type="button"
          onClick={() => onChange(to, from)}
          aria-label="Trocar origem e destino"
          className="row-span-2 grid size-12 place-items-center rounded-2xl border border-line text-muted hover:text-fg"
        >
          <ArrowUpDown className="size-5" aria-hidden />
        </button>
        <PlaceSelect label="Para" value={to} onChange={(id) => onChange(from, id)} />
      </div>
      {a && b ? (
        <p className="mt-5 rounded-3xl border border-zahav/40 bg-gradient-to-br from-zahav/14 to-surface p-5" aria-live="polite">
          <span className="block text-sm text-muted">
            {a.namePt} → {b.namePt}
          </span>
          <span className="mt-1 block text-4xl font-bold tracking-tight tabular-nums">{formatKm(distanceKm(a, b))}</span>
          <span className="mt-1 block text-sm text-muted">em linha reta</span>
        </p>
      ) : null}
    </div>
  );
}
