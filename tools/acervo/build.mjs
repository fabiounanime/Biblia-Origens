/**
 * Monta o JSON de um livro para o leitor:
 *
 *   node tools/acervo/build.mjs gn            → public/content/bible/gn.json
 *   node tools/acervo/build.mjs gn --estudo 3 → folha de estudo do capítulo 3
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
 * Só entram no JSON os capítulos com todos os versículos traduzidos. A
 * versificação é a do texto hebraico.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hebrewLine, readBook } from "./oshb.mjs";
import { transliterateVerse } from "./translit.mjs";
import { createGlosser } from "./palavras.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** Identificador do app → arquivo da OSHB. */
const OSHB_FILE = {
  gn: "Gen", ex: "Exod", lv: "Lev", nm: "Num", dt: "Deut",
  js: "Josh", jz: "Judg", "1sm": "1Sam", "2sm": "2Sam", "1rs": "1Kgs", "2rs": "2Kgs",
  is: "Isa", jr: "Jer", ez: "Ezek", ho: "Hos", jl: "Joel", am: "Amos", ob: "Obad",
  jn: "Jonah", mi: "Mic", na: "Nah", hb: "Hab", zp: "Zeph", hg: "Hag", zc: "Zech", ml: "Mal",
  ps: "Ps", pv: "Prov", job: "Job", ss: "Song", rt: "Ruth", lm: "Lam", ec: "Eccl", et: "Esth",
  dn: "Dan", er: "Ezra", ne: "Neh", "1ch": "1Chr", "2ch": "2Chr",
};

const [bookId, flag, chapterArg] = process.argv.slice(2);
const file = bookId ? OSHB_FILE[/** @type {keyof typeof OSHB_FILE} */ (bookId)] : undefined;
if (!bookId || !file) {
  console.error("Uso: node tools/acervo/build.mjs <livro> [--estudo <capítulo>]");
  process.exit(1);
}

const oshbDir = process.env.OSHB_DIR ?? join(ROOT, "tools/acervo/.cache/morphhb/wlc");
const xmlPath = join(oshbDir, `${file}.xml`);
if (!existsSync(xmlPath)) {
  console.error(`Texto hebraico não encontrado em ${xmlPath}.`);
  console.error("Baixe com: git clone --depth 1 https://github.com/openscriptures/morphhb tools/acervo/.cache/morphhb");
  process.exit(1);
}

const source = readBook(xmlPath);

if (flag === "--estudo") {
  // Folha de estudo: cada palavra com a raiz (Strong) e a análise gramatical,
  // para traduzir direto do hebraico.
  const chapter = Number(chapterArg);
  for (const verse of source.filter((v) => v.chapter === chapter)) {
    console.log(`\n${verse.chapter}:${verse.verse}  ${hebrewLine(verse.words)}`);
    for (const word of verse.words) {
      console.log(`   ${word.text.replace(/[֑-ֽ֯]/g, "").padEnd(16)} ${word.lemma.padEnd(14)} ${word.morph}`);
    }
  }
  process.exit(0);
}

const ptPath = join(ROOT, "acervo/traducao", `${bookId}.txt`);
/** @type {Record<string, Record<string, string>>} */
const pt = {};
if (existsSync(ptPath)) {
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

/** @type {Map<string, { at: string; t: string; line: number }[]>} */
const notes = new Map();
const notesPath = join(ROOT, "acervo/notas", `${bookId}.txt`);
if (existsSync(notesPath)) {
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
      list.push({ at: match[3], t: match[4], line: index + 1 });
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
    const where = `${notesPath}:${note.line} (${chapter}:${verse})`;
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

const glosser = createGlosser(
  ROOT,
  process.env.STRONG_XML ?? join(ROOT, "tools/acervo/.cache/HebrewLexicon/HebrewStrong.xml"),
);
/** @type {Map<number, { g: string; m: string; l: string; o: string }[][]>} */
const wordFiles = new Map();

const chapters = [];
let noteCount = 0;
for (const [n, verses] of byChapter) {
  const translated = pt[String(n)];
  if (!translated) continue;
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
      const he = hebrewLine(v.words);
      const tr = transliterateVerse(v.words);
      // O leitor separa as palavras por espaço e maqaf: as contas têm de bater.
      const heCount = he.split(/[ ־]/).length;
      const trCount = tr.split(/[ -]/).length;
      if (heCount !== v.words.length || trCount !== v.words.length) {
        problems.push(`${bookId} ${n}:${v.verse}: ${v.words.length} palavras, ${heCount} no hebraico, ${trCount} no transliterado`);
      }
      const list = wordFiles.get(n) ?? [];
      list.push(v.words.map((word) => glosser.gloss(word)));
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
  for (const note of list) problems.push(`${notesPath}:${note.line}: ${key} não existe ou não foi traduzido`);
}

if (glosser.missing.size) {
  problems.push(`Sem significado em acervo/lexico: ${[...glosser.missing].join(", ")}`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
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
