import { distanceKm, formatKm, placeById, type Place } from "../bible/places.ts";

export type Pin = { id: string; lon: number; lat: number; label: string; badge?: string; tone: "active" | "pin" | "dot" };
export type Leg = { from: Place; to: Place; km: number };
export type View = {
  pins: Pin[];
  route: {
    coords: [number, number][];
    legs: { at: [number, number]; from: [number, number]; to: [number, number]; text: string }[];
    dashed?: boolean;
  } | null;
  /** null: o mapa fica onde está. */
  focus: [number, number][] | null;
  legs: Leg[];
  totalKm: number;
};

/** Trechos menores que isso não ganham rótulo no mapa (o mapa ainda esconde os que ficam curtos na tela). */
const MIN_LABEL_KM = 8;

const point = (p: Place): [number, number] => [p.lon, p.lat];

function places(ids: string[]): Place[] {
  return ids.map((id) => placeById(id)).filter((p): p is Place => Boolean(p));
}

/**
 * Uma sequência de lugares vira rota numerada. Lugares repetidos ganham um pino só,
 * com todos os números ("3·6"); o lugar ativo fica destacado.
 */
export function pathView(ids: string[], activeId?: string, opts: { numbered?: boolean; dashed?: boolean } = {}): View {
  const seq = places(ids);
  const numbers = new Map<string, number[]>();
  seq.forEach((p, i) => numbers.set(p.id, [...(numbers.get(p.id) ?? []), i + 1]));
  const pins: Pin[] = [...numbers.entries()].map(([id, ns]) => {
    const p = placeById(id) as Place;
    return {
      id,
      lon: p.lon,
      lat: p.lat,
      label: p.namePt,
      badge: opts.numbered ? (ns.length > 3 ? `${ns.slice(0, 2).join("·")}…` : ns.join("·")) : undefined,
      tone: id === activeId ? "active" : "pin",
    };
  });
  const legs: Leg[] = [];
  for (let i = 1; i < seq.length; i += 1) {
    const from = seq[i - 1];
    const to = seq[i];
    if (from.id !== to.id) legs.push({ from, to, km: distanceKm(from, to) });
  }
  const route =
    seq.length > 1
      ? {
          coords: seq.map(point),
          legs: legs
            .filter((leg) => leg.km >= MIN_LABEL_KM)
            .map((leg) => ({
              at: [(leg.from.lon + leg.to.lon) / 2, (leg.from.lat + leg.to.lat) / 2] as [number, number],
              from: point(leg.from),
              to: point(leg.to),
              text: formatKm(leg.km),
            })),
          dashed: opts.dashed,
        }
      : null;
  const active = activeId ? placeById(activeId) : undefined;
  return {
    pins,
    route,
    focus: active ? [point(active)] : seq.map(point),
    legs,
    totalKm: legs.reduce((sum, leg) => sum + leg.km, 0),
  };
}

/** Lugares soltos, em pontos pequenos (visão geral de uma parte ou de tudo). */
export function dotsView(ids: string[], activeId?: string): View {
  const unique = [...new Set(ids)];
  const pins = places(unique).map(
    (p): Pin => ({ id: p.id, lon: p.lon, lat: p.lat, label: p.namePt, tone: p.id === activeId ? "active" : "dot" }),
  );
  const active = activeId ? placeById(activeId) : undefined;
  return { pins, route: null, focus: active ? [point(active)] : [], legs: [], totalKm: 0 };
}
