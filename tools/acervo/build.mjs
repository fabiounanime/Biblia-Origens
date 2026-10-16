/**
 * Monta o JSON de um livro para o leitor:
 *
 *   node tools/acervo/build.mjs gn   → public/content/bible/gn.json
 *
 * Antigo Testamento a partir do hebraico (OSHB); Novo Testamento a partir do
 * grego (SBLGNT com a análise da MorphGNT). Os livros e as fontes estão em
 * livros.mjs; folha.mjs e lemas.mjs ajudam a traduzir.
 *
 * Entradas:
 *   - hebraico: Open Scriptures Hebrew Bible (Westminster Leningrad Codex), em
 *     tools/acervo/.cache/morphhb/wlc ou na pasta indicada por OSHB_DIR. Para
 *     baixar: git clone --depth 1 https://github.com/openscriptures/morphhb tools/acervo/.cache/morphhb
 *   - português: acervo/traducao/{livro}.txt, uma linha por versículo:
 *       1:1 No princípio criou Deus os céus e a terra.
 *     Linhas vazias e linhas começadas por # são ignoradas. Palavras entre
 *     colchetes [assim] não existem no hebraico e foram acrescentadas pelo sentido.
 *
 *   - notas do tradutor (opcional): acervo/notas/{livro}.txt, uma por linha:
 *       37:3 | túnica longa | Em hebraico, *ketonet passim*. O sentido exato é incerto.
 *     O trecho do meio precisa existir no versículo: a chamada da nota (a, b, c…)
 *     aparece logo depois dele. *Asteriscos* marcam itálico no texto da nota.
 *   - significado de cada palavra: acervo/lexico/glosas.txt e nomes.txt, mais a
 *     forma de dicionário do léxico de Strong da Open Scriptures
 *     (STRONG_XML ou tools/acervo/.cache/HebrewLexicon/HebrewStrong.xml). Sai em
 *     public/content/bible/palavras/{livro}/{capítulo}.json, um arquivo por
 *     capítulo, carregado só quando o leitor toca numa palavra.
 *
 * Livros traduzidos em partes: acervo/traducao/{livro}.d/*.txt e
 * acervo/notas/{livro}.d/*.txt valem como continuação de {livro}.txt.
 *
 * Para conferir só alguns capítulos, sem gravar nada:
 *   node tools/acervo/build.mjs is --verificar 1-33
 *
 * Só entram no JSON os capítulos com todos os versículos traduzidos. A
 * versificação é a do texto original (hebraico no AT, SBLGNT no NT). No NT o
 * significado de cada palavra vem de acervo/lexico/grego.txt (e grego.d/).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { writeIndex } from "./indice.mjs";
import { dirname, join } from "node:path";
import { hebrewLine } from "./oshb.mjs";
import { transliterateVerse } from "./translit.mjs";
import { createGlosser, readTable } from "./palavras.mjs";
import { createGreekGlosser, greekLine, transliterateGreekVerse } from "./grego.mjs";
import { ROOT, SOURCES, parseRange, partFiles, readSource } from "./livros.mjs";

const [bookId, flag, range] = process.argv.slice(2);
if (!bookId || !SOURCES[bookId] || (flag && flag !== "--verificar")) {
  console.error("Uso: node tools/acervo/build.mjs <livro> [--verificar 1-10]   (folha de tradução: node tools/acervo/folha.mjs)");
  process.exit(1);
}
/** Com --verificar, confere só esses capítulos e não grava nada. */
const checkOnly = flag === "--verificar";
const [firstChapter, lastChapter] = checkOnly ? parseRange(range) : [1, 999];
const inRange = (/** @type {number} */ n) => n >= firstChapter && n <= lastChapter;

const { lang, verses: source } = readSource(bookId);
/** Linha original, transliteração e separador de palavras de cada idioma. */
const ORIGINAL =
  lang === "he"
    ? { line: hebrewLine, translit: transliterateVerse, split: /[ ־]/ }
    : { line: greekLine, translit: transliterateGreekVerse, split: / / };

/** @type {Record<string, Record<string, string>>} */
const pt = {};
for (const ptPath of partFiles("acervo/traducao", bookId)) {
  readFileSync(ptPath, "utf8")
    .split("\n")
    .forEach((raw, index) => {
      const line = raw.trim();
      if (!line || line.startsWith("#")) return;
      const match = /^(\d+):(\d+)\s+(.+)$/.exec(line);
      if (!match) throw new Error(`${ptPath}:${index + 1}: linha fora do formato "capítulo:versículo texto"`);
      const chapter = (pt[match[1]] ??= {});
      if (chapter[match[2]]) throw new Error(`${ptPath}:${index + 1}: ${match[1]}:${match[2]} repetido`);
      chapter[match[2]] = match[3];
    });
}

const problems = [];

/** @type {Map<string, { at: string; t: string; line: string }[]>} */
const notes = new Map();
for (const notesPath of partFiles("acervo/notas", bookId)) {
  readFileSync(notesPath, "utf8")
    .split("\n")
    .forEach((raw, index) => {
      const line = raw.trim();
      if (!line || line.startsWith("#")) return;
      const match = /^(\d+):(\d+)\s*\|\s*(.+?)\s*\|\s*(.+)$/.exec(line);
      if (!match) {
        problems.push(`${notesPath}:${index + 1}: linha fora do formato "c:v | trecho | nota"`);
        return;
      }
      const key = `${match[1]}:${match[2]}`;
      const list = notes.get(key) ?? [];
      list.push({ at: match[3], t: match[4], line: `${notesPath}:${index + 1}` });
      notes.set(key, list);
    });
}

/** Notas de um versículo: posição (logo depois do trecho) e texto, em ordem de leitura. */
function notesFor(chapter, verse, text) {
  const list = notes.get(`${chapter}:${verse}`);
  if (!list) return undefined;
  notes.delete(`${chapter}:${verse}`);
  const out = [];
  for (const note of list) {
    const start = text.indexOf(note.at);
    const where = `${note.line} (${chapter}:${verse})`;
    if (start < 0) {
      problems.push(`${where}: "${note.at}" não está no versículo`);
      continue;
    }
    if (text.indexOf(note.at, start + 1) >= 0) {
      problems.push(`${where}: "${note.at}" aparece mais de uma vez; use um trecho mais longo`);
      continue;
    }
    const end = start + note.at.length;
    if (/\p{L}/u.test(text[start - 1] ?? "") || /\p{L}/u.test(text[end] ?? "")) {
      problems.push(`${where}: "${note.at}" corta uma palavra ao meio`);
      continue;
    }
    if ((text.slice(0, end).match(/\[/g) ?? []).length > (text.slice(0, end).match(/\]/g) ?? []).length) {
      problems.push(`${where}: "${note.at}" termina dentro de [colchetes]`);
      continue;
    }
    out.push({ at: end, t: note.t });
  }
  return out.sort((a, b) => a.at - b.at);
}

/** @type {Map<number, typeof source>} */
const byChapter = new Map();
for (const verse of source) {
  const list = byChapter.get(verse.chapter) ?? [];
  list.push(verse);
  byChapter.set(verse.chapter, list);
}

const glosser =
  lang === "he"
    ? createGlosser(ROOT, process.env.STRONG_XML ?? join(ROOT, "tools/acervo/.cache/HebrewLexicon/HebrewStrong.xml"))
    : createGreekGlosser(readTable, ROOT);
/** @type {Map<number, { g: string; m: string; l: string; o: string }[][]>} */
const wordFiles = new Map();

const chapters = [];
let noteCount = 0;
for (const [n, verses] of byChapter) {
  const translated = pt[String(n)];
  if (!translated || !inRange(n)) continue;
  const missing = verses.filter((v) => !translated[String(v.verse)]?.trim()).map((v) => v.verse);
  const extra = Object.keys(translated).filter((v) => !verses.some((s) => String(s.verse) === v));
  if (missing.length || extra.length) {
    problems.push(`${bookId} ${n}: faltam ${missing.join(", ") || "-"}; sobram ${extra.join(", ") || "-"}`);
    continue;
  }
  chapters.push({
    n,
    verses: verses.map((v) => {
      const text = translated[String(v.verse)].trim();
      const verseNotes = notesFor(n, v.verse, text);
      noteCount += verseNotes?.length ?? 0;
      // "he" guarda a linha no idioma original: hebraico (AT) ou grego (NT).
      const he = ORIGINAL.line(v.words);
      const tr = ORIGINAL.translit(v.words);
      // O leitor separa as palavras por espaço (e maqaf): as contas têm de bater.
      const heCount = he.split(ORIGINAL.split).length;
      const trCount = tr.split(/[ -]/).length;
      if (heCount !== v.words.length || trCount !== v.words.length) {
        problems.push(`${bookId} ${n}:${v.verse}: ${v.words.length} palavras, ${heCount} no original, ${trCount} no transliterado`);
      }
      const list = wordFiles.get(n) ?? [];
      list.push(v.words.map((word) => glosser.gloss(/** @type {any} */ (word))));
      wordFiles.set(n, list);
      return {
        v: v.verse,
        pt: text,
        he,
        tr,
        ...(verseNotes?.length ? { n: verseNotes } : {}),
      };
    }),
  });
}

for (const [key, list] of notes) {
  if (!inRange(Number(key.split(":")[0]))) continue;
  for (const note of list) problems.push(`${note.line}: ${key} não existe ou não foi traduzido`);
}

if (glosser.missing.size) {
  problems.push(`Sem significado em acervo/lexico: ${[...glosser.missing].join(", ")}  (veja: node tools/acervo/lemas.mjs ${bookId})`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

if (checkOnly) {
  const count = chapters.reduce((sum, c) => sum + c.verses.length, 0);
  const done = chapters.map((c) => c.n);
  const pending = [...byChapter.keys()].filter((n) => inRange(n) && !done.includes(n));
  console.log(`OK: ${chapters.length} capítulos, ${count} versículos, ${noteCount} notas.${pending.length ? ` Ainda sem tradução: ${pending.join(", ")}.` : ""}`);
  process.exit(0);
}

const outPath = join(ROOT, "public/content/bible", `${bookId}.json`);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify({ bookId, chapters })}\n`);
const wordsDir = join(ROOT, "public/content/bible/palavras", bookId);
mkdirSync(wordsDir, { recursive: true });
for (const chapter of chapters) {
  // Por versículo, cada palavra como [significado, gramática, forma de dicionário, outros sentidos].
  const rows = (wordFiles.get(chapter.n) ?? []).map((verse) =>
    verse.map((w) => (w.o ? [w.g, w.m, w.l, w.o] : [w.g, w.m, w.l])),
  );
  writeFileSync(join(wordsDir, `${chapter.n}.json`), `${JSON.stringify(rows)}\n`);
}
const count = chapters.reduce((sum, c) => sum + c.verses.length, 0);
console.log(`${outPath}: ${chapters.length} capítulos, ${count} versículos, ${noteCount} notas.`);
// Índice do acervo (o Início mostra quanto de cada parte já chegou).
writeIndex(ROOT);
