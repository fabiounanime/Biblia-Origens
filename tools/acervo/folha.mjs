/**
 * Folhas de trabalho para traduzir e revisar, direto do texto original.
 *
 *   node tools/acervo/folha.mjs dt 1-3             → tradução: original + palavra por palavra
 *   node tools/acervo/folha.mjs dt 1-3 --revisao   → revisão: original + palavra por palavra + português
 *   node tools/acervo/folha.mjs dt 1-3 --glosas    → conferir o sentido mostrado: português + só as palavras
 *                                                    com mais de um sentido no glossário (o 1º em destaque)
 *
 * Cada versículo:
 *   1:1 <linha no original>
 *       significado [análise] | significado [análise] | …
 *   PT: <tradução>                 (só na revisão)
 * A análise é o código da OSHB (hebraico) ou da MorphGNT (grego); "?" indica
 * palavra ainda sem significado em acervo/lexico.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hebrewLine } from "./oshb.mjs";
import { createGlosser, readTable } from "./palavras.mjs";
import { createGreekGlosser, greekLine } from "./grego.mjs";
import { ROOT, SOURCES, parseRange, partFiles, readSource } from "./livros.mjs";
import { contextFor, readContext } from "./contexto.mjs";

const [bookId, range = "", flag] = process.argv.slice(2);
if (!bookId || !SOURCES[bookId]) {
  console.error("Uso: node tools/acervo/folha.mjs <livro> <capítulos, ex.: 1-3> [--revisao]");
  process.exit(1);
}
const [from, last] = parseRange(range);

const { lang, verses } = readSource(bookId);
const glosser =
  lang === "he"
    ? createGlosser(ROOT, join(ROOT, "tools/acervo/.cache/HebrewLexicon/HebrewStrong.xml"))
    : createGreekGlosser(readTable, ROOT);

/** @type {Record<string, string>} */
const pt = {};
const withPt = flag === "--revisao" || flag === "--glosas";
for (const ptPath of withPt ? partFiles("acervo/traducao", bookId) : []) {
  for (const raw of readFileSync(ptPath, "utf8").split("\n")) {
    const match = /^(\d+:\d+)\s+(.+)$/.exec(raw.trim());
    if (match) pt[match[1]] = match[2];
  }
}

const context = readContext(bookId);
const out = [];
for (const verse of verses) {
  if (verse.chapter < from || verse.chapter > last) continue;
  const key = `${verse.chapter}:${verse.verse}`;
  const line = lang === "he" ? hebrewLine(/** @type {any} */ (verse.words)) : greekLine(/** @type {any} */ (verse.words));
  const senses = contextFor(context.get(key), /** @type {any} */ (verse.words), lang);
  const words = verse.words.map((/** @type {any} */ word, /** @type {number} */ i) => {
    const info = senses[i]?.whole ? { g: senses[i].sense.split(/\s*\|\s*/)[0] } : glosser.gloss(word, senses[i]);
    const code = lang === "he" ? word.morph : `${word.pos} ${word.parse}`;
    return `${info.g} [${code}]`;
  });
  if (flag === "--glosas") {
    // Só as palavras cujo lema tem mais de um sentido: "nº. palavra-original → sentido em destaque {outros}".
    const ambiguous = verse.words
      .map((/** @type {any} */ word, /** @type {number} */ i) => ({ word, i, info: glosser.gloss(word, senses[i]) }))
      .filter(({ info, i }) => info.o && !senses[i] && !appears(lastPart(info.g), pt[key] ?? ""))
      .map(({ word, i, info }) => {
        const hint = info.o.split(/,\s(?![^(]*\))/).find((other) => appears(other, pt[key] ?? ""));
        return `${i + 1}. ${word.text ?? ""} [${word.lemma}] → ${info.g} {${info.o}}${hint ? `  ⟵ no PT parece: "${hint}"` : ""}`;
      });
    if (!ambiguous.length) continue;
    out.push(`${key} PT: ${pt[key] ?? "(falta)"}`);
    for (const row of ambiguous) out.push(`    ${row}`);
    continue;
  }
  out.push(`${key} ${line}`);
  out.push(`    ${words.join(" | ")}`);
  if (flag === "--revisao") out.push(`PT: ${pt[key] ?? "(falta)"}`);
}
console.log(out.join("\n"));

/** "e + o + homem" → "homem". */
function lastPart(/** @type {string} */ gloss) {
  return gloss.split(" + ").filter((part) => !/^\(.*\)$/.test(part)).pop() ?? gloss;
}

/** Algum radical (5 primeiras letras) das palavras do sentido aparece no português do versículo? */
function appears(/** @type {string} */ sense, /** @type {string} */ text) {
  const fold = (/** @type {string} */ t) => t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const words = fold(text).split(/[^a-z]+/);
  const stems = fold(sense.replace(/\(.*?\)/g, ""))
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 3 && !["que", "com", "por", "para", "dos", "das", "uma", "ser"].includes(w))
    .map((w) => w.slice(0, Math.min(5, w.length - (w.length > 4 ? 1 : 0))));
  if (!stems.length) return true;
  return stems.some((stem) => words.some((w) => w.startsWith(stem)));
}
