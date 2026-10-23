import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MlMap, Marker, StyleSpecification } from "maplibre-gl";
import { getMapConfig } from "@/lib/atlas/map-config";

export type MapPin = {
  id: string;
  lon: number;
  lat: number;
  label: string;
  /** Número da parada ou do evento, dentro do pino. */
  badge?: string;
  tone: "active" | "pin" | "dot" | "region";
};

export type MapRoute = {
  coords: [number, number][];
  /** Distância de cada trecho, no meio dele (some quando o trecho fica curto na tela). */
  legs: { at: [number, number]; from: [number, number]; to: [number, number]; text: string }[];
  dashed?: boolean;
};

/** Do Egito à Mesopotâmia: a vista inicial. */
const HOME: [[number, number], [number, number]] = [
  [29, 27.5],
  [48.5, 38.5],
];

const esriTile = (key: string, z: number | string = "{z}", y: number | string = "{y}", x: number | string = "{x}") =>
  `https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}?token=${encodeURIComponent(key)}`;

/**
 * Uma chave recusada (endereço fora da lista, expirada) faz a Esri responder com
 * erro em vez de imagem, e o mapa ficaria preto: testa um quadro e cai para o Sentinel-2.
 */
async function usableKey(key: string | null): Promise<string | null> {
  if (!key) return null;
  try {
    const res = await fetch(esriTile(key, 0, 0, 0));
    return res.ok && (res.headers.get("content-type") ?? "").startsWith("image/") ? key : null;
  } catch {
    return null;
  }
}

function satelliteStyle(arcgisKey: string | null): StyleSpecification {
  const sat = arcgisKey
    ? {
        tiles: [esriTile(arcgisKey)],
        maxzoom: 19,
        attribution: "Powered by Esri · Esri, Maxar, Earthstar Geographics e a comunidade GIS",
      }
    : {
        // Reserva sem chave: Sentinel-2 cloudless 2016 (CC BY 4.0).
        tiles: ["https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg"],
        maxzoom: 14,
        attribution:
          '<a href="https://s2maps.eu">Sentinel-2 cloudless</a> por EOX (dados Copernicus Sentinel modificados, 2016)',
      };
  return {
    version: 8,
    sources: { sat: { type: "raster", tileSize: 256, ...sat } },
    layers: [
      {
        id: "sat",
        type: "raster",
        source: "sat",
        // Um pouco mais escuro, para os nomes e as rotas aparecerem por cima.
        paint: { "raster-brightness-max": 0.86, "raster-saturation": -0.12 },
      },
    ],
  };
}

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type PlacedPin = { marker: Marker; pin: MapPin };
type PlacedLeg = { marker: Marker; from: [number, number]; to: [number, number] };

/**
 * Esconde o que se sobrepõe na escala atual: o nome de um pino colado em outro
 * (o ativo e os primeiros números ganham) e a distância de trecho curto na tela.
 */
function declutter(map: MlMap, pins: PlacedPin[], legs: PlacedLeg[]) {
  type Box = { x1: number; y1: number; x2: number; y2: number };
  const taken: Box[] = [];
  // O nome da região também cede às distâncias que ficam visíveis.
  const legBoxes: Box[] = [];
  for (const { marker, from, to } of legs) {
    const a = map.project(from);
    const b = map.project(to);
    const hidden = Math.hypot(a.x - b.x, a.y - b.y) < 84;
    marker.getElement().style.visibility = hidden ? "hidden" : "";
    if (hidden) continue;
    const p = map.project(marker.getLngLat());
    const half = (marker.getElement().offsetWidth || 48) / 2;
    legBoxes.push({ x1: p.x - half, y1: p.y - 10, x2: p.x + half, y2: p.y + 10 });
  }
  const rank = { active: 0, pin: 1, dot: 2, region: 3 } as const;
  const order = [...pins].sort((a, b) => rank[a.pin.tone] - rank[b.pin.tone]);
  for (const { marker, pin } of order) {
    const p = map.project(marker.getLngLat());
    const label = marker.getElement().querySelector<HTMLElement>(".atlas-pin-label");
    const w = (label?.offsetWidth || pin.label.length * 7) + 4;
    // Nome do pino embaixo dele; nome do ponto à direita; nome da região no centro.
    const box: Box =
      pin.tone === "dot"
        ? { x1: p.x - 6, y1: p.y - 10, x2: p.x + 10 + w, y2: p.y + 10 }
        : pin.tone === "region"
          ? { x1: p.x - w / 2, y1: p.y - 10, x2: p.x + w / 2, y2: p.y + 10 }
          : { x1: p.x - w / 2, y1: p.y - 14, x2: p.x + w / 2, y2: p.y + 36 };
    const others = pin.tone === "region" ? [...taken, ...legBoxes] : taken;
    const clash = others.some((q) => box.x1 < q.x2 && box.x2 > q.x1 && box.y1 < q.y2 && box.y2 > q.y1);
    marker.getElement().classList.toggle("atlas-pin--quiet", clash && pin.tone !== "active");
    if (!clash || pin.tone === "active") taken.push(box);
  }
}

/** Ajusta um pino já no mapa: recriar o botão tiraria o foco de quem usa teclado. */
function paintPin(button: HTMLElement, pin: MapPin) {
  // classList, não className: o MapLibre põe no botão a classe que o posiciona no mapa.
  button.classList.remove("atlas-pin--active", "atlas-pin--pin", "atlas-pin--dot", "atlas-pin--region");
  button.classList.add("atlas-pin", `atlas-pin--${pin.tone}`);
  button.setAttribute("aria-label", pin.badge ? `${pin.badge}. ${pin.label}` : pin.label);
  // Os pontinhos da visão geral e as regiões ficam fora do Tab: a lista do painel tem todos.
  button.tabIndex = pin.tone === "dot" || pin.tone === "region" ? -1 : 0;
  const [dot, label] = button.children;
  if (dot) dot.textContent = pin.badge ?? "";
  if (label) label.textContent = pin.label;
}

function pinElement(pin: MapPin, onPick: (id: string) => void): HTMLElement {
  const button = document.createElement("button");
  button.type = "button";
  const dot = document.createElement("span");
  dot.className = "atlas-pin-dot";
  const label = document.createElement("span");
  label.className = "atlas-pin-label";
  button.append(dot, label);
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onPick(pin.id);
  });
  paintPin(button, pin);
  return button;
}

function legElement(text: string): HTMLElement {
  const span = document.createElement("span");
  span.className = "atlas-leg";
  span.textContent = text;
  span.setAttribute("aria-hidden", "true");
  return span;
}

export function AtlasMap({
  pins,
  route,
  focus,
  onPick,
  className,
}: {
  pins: MapPin[];
  route: MapRoute | null;
  /** Pontos que precisam caber na tela; vazio volta à vista inicial; null não mexe. */
  focus: [number, number][] | null;
  onPick: (id: string) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const libRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef = useRef<PlacedPin[]>([]);
  const legsRef = useRef<PlacedLeg[]>([]);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Fora do servidor de propósito: o MapLibre não entra no bundle do Worker.
    if (import.meta.env.SSR || !containerRef.current) return;
    let cancelled = false;
    let map: MlMap | null = null;
    void (async () => {
      try {
        const [lib, arcgisKey, worker] = await Promise.all([
          import("maplibre-gl"),
          getMapConfig()
            .then((config) => usableKey(config.arcgisKey))
            .catch(() => null),
          // O MapLibre monta o endereço do worker em tempo de execução; o Vite não o
          // acharia sozinho, então o arquivo entra como asset e o endereço vai explícito.
          import("maplibre-gl/dist/maplibre-gl-worker.mjs?url"),
          import("maplibre-gl/dist/maplibre-gl.css"),
        ]);
        if (cancelled || !containerRef.current) return;
        lib.setWorkerUrl(worker.default);
        libRef.current = lib;
        map = new lib.Map({
          container: containerRef.current,
          style: satelliteStyle(arcgisKey),
          bounds: HOME,
          maxZoom: arcgisKey ? 17 : 14,
          minZoom: 2,
          attributionControl: {
            compact: true,
            customAttribution: 'Lugares: <a href="https://www.openbible.info/geo/">OpenBible.info</a> (CC BY)',
          },
          dragRotate: false,
          pitchWithRotate: false,
        });
        map.touchZoomRotate.disableRotation();
        map.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new lib.ScaleControl({ unit: "metric" }), "bottom-left");
        map.on("load", () => {
          if (!map) return;
          map.addSource("route", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
          const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
          map.addLayer({
            id: "route-casing",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": token("--c-bg"), "line-width": 7, "line-opacity": 0.55 },
          });
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": token("--c-zahav"),
              "line-width": 3.5,
            },
          });
          map.on("moveend", () => {
            if (map) declutter(map, markersRef.current, legsRef.current);
          });
          // Os créditos começam recolhidos no botão (i): abertos, cobrem a base do mapa no celular.
          containerRef.current?.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
          mapRef.current = map;
          setReady(true);
        });
      } catch (err) {
        console.error("[mapa] não foi possível abrir o mapa:", err);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Pinos.
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!ready || !map || !lib) return;
    // Reaproveita os pinos pelo id (o foco do teclado fica onde estava).
    const old = new Map(markersRef.current.map((placed) => [placed.pin.id, placed]));
    markersRef.current = pins.map((pin) => {
      const kept = old.get(pin.id);
      old.delete(pin.id);
      if (kept) {
        paintPin(kept.marker.getElement(), pin);
        kept.marker.setLngLat([pin.lon, pin.lat]);
        return { pin, marker: kept.marker };
      }
      const element = pinElement(pin, (id) => onPickRef.current(id));
      return { pin, marker: new lib.Marker({ element, anchor: "center" }).setLngLat([pin.lon, pin.lat]).addTo(map) };
    });
    for (const { marker } of old.values()) marker.remove();
    declutter(map, markersRef.current, legsRef.current);
  }, [ready, pins]);

  // Rota e distâncias dos trechos.
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!ready || !map || !lib) return;
    void map.getSource<GeoJSONSource>("route")?.setData({
      type: "FeatureCollection",
      features:
        route && route.coords.length > 1
          ? [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route.coords } }]
          : [],
    });
    map.setPaintProperty("route", "line-dasharray", route?.dashed ? [1.5, 1.5] : undefined);
    for (const { marker } of legsRef.current) marker.remove();
    legsRef.current = (route?.legs ?? []).map((leg) => ({
      from: leg.from,
      to: leg.to,
      marker: new lib.Marker({ element: legElement(leg.text), anchor: "center" }).setLngLat(leg.at).addTo(map),
    }));
    declutter(map, markersRef.current, legsRef.current);
  }, [ready, route]);

  // Enquadramento.
  const focusKey = focus ? focus.map(([lon, lat]) => `${lon},${lat}`).join(";") : "parado";
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!ready || !map || !lib || !focus) return;
    const duration = reduceMotion() ? 0 : 900;
    const padding = { top: 56, bottom: 56, left: 48, right: 48 };
    if (focus.length === 0) {
      map.fitBounds(HOME, { padding, duration });
    } else if (focus.length === 1) {
      map.easeTo({ center: focus[0], zoom: Math.max(map.getZoom(), 6), duration });
    } else {
      const bounds = new lib.LngLatBounds(focus[0], focus[0]);
      for (const point of focus) bounds.extend(point);
      map.fitBounds(bounds, { padding, maxZoom: 11, duration });
    }
    // focusKey resume `focus`: o array muda de identidade a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, focusKey]);

  return (
    <div className={className}>
      <div ref={containerRef} className="atlas-map size-full" role="region" aria-label="Mapa de satélite" />
      {failed ? (
        <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted">
          Não foi possível abrir o mapa. Os lugares e as distâncias continuam na lista.
        </p>
      ) : null}
    </div>
  );
}
