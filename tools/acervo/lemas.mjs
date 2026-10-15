/**
 * Lemas de um livro que ainda não têm significado em acervo/lexico.
 *
 *   node tools/acervo/lemas.mjs dt
 *
 * Hebraico: lista por lema de Strong (como na OSHB), com a forma de dicionário,
 * a classe, quantas vezes aparece, um exemplo e a definição do léxico de Strong
 * (inglês, para orientar). Os nomes próprios vêm à parte. Escreva os
 * significados em acervo/lexico/glosas.d/{livro}.txt e nomes.d/{livro}.txt.
 *
 * Grego: lista por lema da MorphGNT, com a definição de Strong quando há.
 * Escreva os significados em acervo/lexico/grego.d/{livro}.txt.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readTable } from "./palavras.mjs";
import { ROOT, SOURCES, readSource } from "./livros.mjs";

const [bookId] = process.argv.slice(2);
if (!bookId || !SOURCES[bookId]) {
  console.error("Uso: node tools/acervo/lemas.mjs <livro>");
  process.exit(1);
}
const { lang, verses } = readSource(bookId);

if (lang === "he") {
  const glosses = readTable(join(ROOT, "acervo/lexico/glosas.txt"));
  const names = readTable(join(ROOT, "acervo/lexico/nomes.txt"));
  const xml = readFileSync(join(ROOT, "tools/acervo/.cache/HebrewLexicon/HebrewStrong.xml"), "utf8");
  /** @type {Map<string, { he: string, pos: string, def: string }>} */
  const strong = new Map();
  for (const m of xml.matchAll(/<entry id="H(\d+)">([\s\S]*?)<\/entry>/g)) {
    const w = /<w pos="([^"]*)"[^>]*>([^<]*)<\/w>/.exec(m[2]);
    const defs = [...m[2].matchAll(/<def>([^<]*)<\/def>/g)].map((d) => d[1]).slice(0, 4).join("; ");
    const usage = (/<usage>([\s\S]*?)<\/usage>/.exec(m[2])?.[1] ?? "").replace(/<[^>]+>/g, "").slice(0, 100);
    strong.set(m[1], { he: w?.[2] ?? "", pos: w?.[1] ?? "", def: defs || usage });
  }
  /** @type {Map<string, { n: number, codes: Set<string>, ref: string, name: boolean }>} */
  const missing = new Map();
  for (const verse of verses) {
    for (const word of /** @type {any[]} */ (verse.words)) {
      const lemmas = word.lemma.split("/");
      const codes = word.morph.slice(1).split("/");
      lemmas.forEach((/** @type {string} */ lemma, /** @type {number} */ i) => {
        const key = lemma.trim();
        if (/^[a-z]$/.test(key) || glosses.has(key) || names.has(key)) return;
        const row = missing.get(key) ?? { n: 0, codes: new Set(), ref: `${verse.chapter}:${verse.verse}`, name: false };
        row.n++;
        row.codes.add((codes[i] ?? "").slice(0, 2));
        if ((codes[i] ?? "").startsWith("Np")) row.name = true;
        missing.set(key, row);
      });
    }
  }
  const rows = [...missing].sort((a, b) => b[1].n - a[1].n);
  for (const [title, isName, target] of /** @type {const} */ ([
    ["PALAVRAS", false, `acervo/lexico/glosas.d/${bookId}.txt  (lema | significado | grau: sentido…)`],
    ["NOMES", true, `acervo/lexico/nomes.d/${bookId}.txt  (lema | forma em português | p/l/g/d/r/o)`],
  ])) {
    const list = rows.filter(([, row]) => row.name === isName);
    console.log(`\n## ${title}: ${list.length} → ${target}`);
    for (const [key, row] of list) {
      const s = strong.get(key.replace(/[^\d]/g, "")) ?? { he: "", pos: "", def: "" };
      console.log(`${key}\t${s.he}\t${s.pos}\t${[...row.codes].join(",")}\t${row.n}x\t${row.ref}\t${s.def}`);
    }
  }
} else {
  const table = readTable(join(ROOT, "acervo/lexico/grego.txt"));
  const js = readFileSync(join(ROOT, "tools/acervo/.cache/strongs/greek/strongs-greek-dictionary.js"), "utf8");
  const dict = JSON.parse(js.slice(js.indexOf("{", js.indexOf("strongsGreekDictionary")), js.lastIndexOf("}") + 1));
  const fold = (/** @type {string} */ text) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  /** @type {Map<string, string>} */
  const strong = new Map();
  for (const entry of Object.values(dict)) {
    const e = /** @type {any} */ (entry);
    if (e.lemma && !strong.has(fold(e.lemma))) strong.set(fold(e.lemma), `${e.strongs_def ?? ""} | ${e.kjv_def ?? ""}`.trim());
  }
  /** @type {Map<string, { n: number, pos: string, ref: string }>} */
  const missing = new Map();
  for (const verse of verses) {
    for (const word of /** @type {any[]} */ (verse.words)) {
      if (word.pos === "RA" || table.has(word.lemma)) continue;
      const row = missing.get(word.lemma) ?? { n: 0, pos: word.pos, ref: `${verse.chapter}:${verse.verse}` };
      row.n++;
      missing.set(word.lemma, row);
    }
  }
  const rows = [...missing].sort((a, b) => b[1].n - a[1].n);
  console.log(`## ${rows.length} lemas → acervo/lexico/grego.d/${bookId}.txt  (lema | significado)`);
  for (const [lemma, row] of rows) {
    console.log(`${lemma}\t${row.pos}\t${row.n}x\t${row.ref}\t${(strong.get(fold(lemma.replace(/\(.*?\)/g, ""))) ?? "").slice(0, 140)}`);
  }
}
