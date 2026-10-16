/**
 * Folhas de trabalho para traduzir e revisar, direto do texto original.
 *
 *   node tools/acervo/folha.mjs dt 1-3             → tradução: original + palavra por palavra
 *   node tools/acervo/folha.mjs dt 1-3 --revisao   → revisão: original + palavra por palavra + português
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
for (const ptPath of flag === "--revisao" ? partFiles("acervo/traducao", bookId) : []) {
  for (const raw of readFileSync(ptPath, "utf8").split("\n")) {
    const match = /^(\d+:\d+)\s+(.+)$/.exec(raw.trim());
    if (match) pt[match[1]] = match[2];
  }
}

const out = [];
for (const verse of verses) {
  if (verse.chapter < from || verse.chapter > last) continue;
  const key = `${verse.chapter}:${verse.verse}`;
  const line = lang === "he" ? hebrewLine(/** @type {any} */ (verse.words)) : greekLine(/** @type {any} */ (verse.words));
  const words = verse.words.map((/** @type {any} */ word) => {
    const info = glosser.gloss(word);
    const code = lang === "he" ? word.morph : `${word.pos} ${word.parse}`;
    return `${info.g} [${code}]`;
  });
  out.push(`${key} ${line}`);
  out.push(`    ${words.join(" | ")}`);
  if (flag === "--revisao") out.push(`PT: ${pt[key] ?? "(falta)"}`);
}
console.log(out.join("\n"));
