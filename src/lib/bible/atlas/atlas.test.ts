import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { bookById } from "../catalog.ts";
import { PLACES, distanceKm, formatCoords, formatKm, googleMapsUrl, placeById } from "../places.ts";
import { EVENTS, PARTS } from "./events.ts";
import { JOURNEYS, ROLES } from "./journeys.ts";
import type { Ref } from "./ref.ts";
import { pathView } from "../../atlas/view.ts";

function assertRef(r: Ref, where: string) {
  const book = bookById(r.book);
  assert.ok(book, `${where}: livro "${r.book}" não existe`);
  assert.ok(r.chapter >= 1 && r.chapter <= book.chapters, `${where}: ${r.book} ${r.chapter} fora do livro`);
}

describe("atlas", () => {
  it("lugares têm id único e coordenadas no mapa", () => {
    assert.equal(new Set(PLACES.map((p) => p.id)).size, PLACES.length);
    for (const p of PLACES) {
      assert.ok(p.lon > -10 && p.lon < 60 && p.lat > 20 && p.lat < 45, `${p.id} fora da região`);
    }
  });

  it("eventos apontam para lugares, partes e capítulos que existem", () => {
    assert.deepEqual(EVENTS.map((e) => e.n), Array.from({ length: 50 }, (_, i) => i + 1));
    const parts = new Set(PARTS.map((p) => p.id));
    for (const e of EVENTS) {
      assert.ok(parts.has(e.part), `evento ${e.n}: parte ${e.part}`);
      assert.ok(e.placeIds.length > 0, `evento ${e.n} sem lugar`);
      for (const id of e.placeIds) assert.ok(placeById(id), `evento ${e.n}: lugar "${id}" não existe`);
      for (const r of e.refs) assertRef(r, `evento ${e.n}`);
    }
  });

  it("caminhos têm id único, papel válido e paradas em lugares que existem", () => {
    assert.equal(new Set(JOURNEYS.map((j) => j.id)).size, JOURNEYS.length);
    const roles = new Set(ROLES.map((r) => r.id));
    for (const j of JOURNEYS) {
      assert.ok(roles.has(j.role), `${j.id}: papel ${j.role}`);
      assert.ok(j.stops.length >= 2, `${j.id} precisa de duas paradas`);
      for (const s of j.stops) {
        assert.ok(placeById(s.placeId), `${j.id}: lugar "${s.placeId}" não existe`);
        assertRef(s.ref, j.id);
      }
    }
  });

  it("rota numerada junta lugares repetidos e não conta trecho parado", () => {
    const view = pathView(["betel", "egito", "betel", "betel", "manre"], undefined, { numbered: true });
    assert.deepEqual(
      view.pins.map((p) => [p.id, p.badge]),
      [["betel", "1·3·4"], ["egito", "2"], ["manre", "5"]],
    );
    assert.equal(view.legs.length, 3);
    assert.equal(view.route?.coords.length, 5);
    assert.ok(Math.abs(view.totalKm - view.legs.reduce((sum, leg) => sum + leg.km, 0)) < 1e-9);
    assert.equal(pathView(["jerusalen"], undefined).route, null);
  });

  it("distância em linha reta confere com valores conhecidos", () => {
    const km = (a: string, b: string) => distanceKm(placeById(a)!, placeById(b)!);
    assert.ok(Math.abs(km("jerusalen", "belem") - 8) < 2, `Jerusalém–Belém: ${km("jerusalen", "belem")}`);
    assert.ok(Math.abs(km("jerusalen", "roma") - 2290) < 40, `Jerusalém–Roma: ${km("jerusalen", "roma")}`);
    assert.equal(km("jerusalen", "jerusalen"), 0);
    assert.equal(formatKm(1234.4), "1.234 km");
    assert.equal(formatKm(8.26), "8,3 km");
  });

  it("coordenadas em português e link do Google Maps", () => {
    assert.equal(formatCoords({ lat: 32.2136, lon: 35.2819 }), "32,2136° N, 35,2819° L");
    assert.equal(formatCoords({ lat: -8.05, lon: -34.9 }), "8,05° S, 34,9° O");
    assert.equal(
      googleMapsUrl({ lat: 31.0, lon: 44.45 }),
      "https://www.google.com/maps/search/?api=1&query=31%2C44.45",
    );
  });
});
