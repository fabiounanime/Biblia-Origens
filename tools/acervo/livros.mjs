/**
 * Os 66 livros: identificador do app → idioma e arquivo de origem.
 *   he: Open Scriptures Hebrew Bible (tools/acervo/.cache/morphhb/wlc/{arquivo}.xml)
 *   gr: MorphGNT / SBLGNT (tools/acervo/.cache/sblgnt/{arquivo}-morphgnt.txt)
 */

import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readBook } from "./oshb.mjs";
import { readGreekBook } from "./grego.mjs";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {Record<string, { lang: "he" | "gr", file: string }>} */
export const SOURCES = {
  gn: { lang: "he", file: "Gen" }, ex: { lang: "he", file: "Exod" }, lv: { lang: "he", file: "Lev" },
  nm: { lang: "he", file: "Num" }, dt: { lang: "he", file: "Deut" },
  js: { lang: "he", file: "Josh" }, jz: { lang: "he", file: "Judg" }, "1sm": { lang: "he", file: "1Sam" },
  "2sm": { lang: "he", file: "2Sam" }, "1rs": { lang: "he", file: "1Kgs" }, "2rs": { lang: "he", file: "2Kgs" },
  is: { lang: "he", file: "Isa" }, jr: { lang: "he", file: "Jer" }, ez: { lang: "he", file: "Ezek" },
  ho: { lang: "he", file: "Hos" }, jl: { lang: "he", file: "Joel" }, am: { lang: "he", file: "Amos" },
  ob: { lang: "he", file: "Obad" }, jn: { lang: "he", file: "Jonah" }, mi: { lang: "he", file: "Mic" },
  na: { lang: "he", file: "Nah" }, hb: { lang: "he", file: "Hab" }, zp: { lang: "he", file: "Zeph" },
  hg: { lang: "he", file: "Hag" }, zc: { lang: "he", file: "Zech" }, ml: { lang: "he", file: "Mal" },
  ps: { lang: "he", file: "Ps" }, pv: { lang: "he", file: "Prov" }, job: { lang: "he", file: "Job" },
  ss: { lang: "he", file: "Song" }, rt: { lang: "he", file: "Ruth" }, lm: { lang: "he", file: "Lam" },
  ec: { lang: "he", file: "Eccl" }, et: { lang: "he", file: "Esth" }, dn: { lang: "he", file: "Dan" },
  er: { lang: "he", file: "Ezra" }, ne: { lang: "he", file: "Neh" }, "1ch": { lang: "he", file: "1Chr" },
  "2ch": { lang: "he", file: "2Chr" },
  mt: { lang: "gr", file: "61-Mt" }, mc: { lang: "gr", file: "62-Mk" }, lc: { lang: "gr", file: "63-Lk" },
  jo: { lang: "gr", file: "64-Jn" }, at: { lang: "gr", file: "65-Ac" }, rm: { lang: "gr", file: "66-Ro" },
  "1co": { lang: "gr", file: "67-1Co" }, "2co": { lang: "gr", file: "68-2Co" }, gl: { lang: "gr", file: "69-Ga" },
  ef: { lang: "gr", file: "70-Eph" }, fp: { lang: "gr", file: "71-Php" }, cl: { lang: "gr", file: "72-Col" },
  "1ts": { lang: "gr", file: "73-1Th" }, "2ts": { lang: "gr", file: "74-2Th" }, "1tm": { lang: "gr", file: "75-1Ti" },
  "2tm": { lang: "gr", file: "76-2Ti" }, tt: { lang: "gr", file: "77-Tit" }, fm: { lang: "gr", file: "78-Phm" },
  heb: { lang: "gr", file: "79-Heb" }, tg: { lang: "gr", file: "80-Jas" }, "1pe": { lang: "gr", file: "81-1Pe" },
  "2pe": { lang: "gr", file: "82-2Pe" }, "1jo": { lang: "gr", file: "83-1Jn" }, "2jo": { lang: "gr", file: "84-2Jn" },
  "3jo": { lang: "gr", file: "85-3Jn" }, jd: { lang: "gr", file: "86-Jud" }, ap: { lang: "gr", file: "87-Re" },
};

/**
 * Lê o texto original de um livro: versículos com as palavras na ordem.
 * @param {string} bookId
 */
export function readSource(bookId) {
  const source = SOURCES[bookId];
  if (!source) throw new Error(`Livro desconhecido: ${bookId}`);
  if (source.lang === "he") {
    const dir = process.env.OSHB_DIR ?? join(ROOT, "tools/acervo/.cache/morphhb/wlc");
    const path = join(dir, `${source.file}.xml`);
    if (!existsSync(path)) {
      throw new Error(`Hebraico não encontrado em ${path}. Baixe com: git clone --depth 1 https://github.com/openscriptures/morphhb tools/acervo/.cache/morphhb`);
    }
    return { lang: source.lang, verses: readBook(path) };
  }
  const dir = process.env.MORPHGNT_DIR ?? join(ROOT, "tools/acervo/.cache/sblgnt");
  const path = join(dir, `${source.file}-morphgnt.txt`);
  if (!existsSync(path)) {
    throw new Error(`Grego não encontrado em ${path}. Baixe com: git clone --depth 1 https://github.com/morphgnt/sblgnt tools/acervo/.cache/sblgnt`);
  }
  return { lang: source.lang, verses: readGreekBook(path) };
}

/**
 * Arquivos de um livro numa pasta do acervo: {livro}.txt e, quando o livro é
 * traduzido em partes, {livro}.d/*.txt (em ordem alfabética).
 *   partFiles("acervo/traducao", "is") → [".../is.txt", ".../is.d/01-33.txt", ".../is.d/34-66.txt"]
 * @param {string} dir pasta relativa à raiz do repositório
 * @param {string} bookId
 */
export function partFiles(dir, bookId) {
  const base = join(ROOT, dir, bookId);
  const files = existsSync(`${base}.txt`) ? [`${base}.txt`] : [];
  if (existsSync(`${base}.d`)) {
    for (const name of readdirSync(`${base}.d`).filter((n) => n.endsWith(".txt")).sort()) files.push(join(`${base}.d`, name));
  }
  return files;
}

/** "3-9" → [3, 9]; "4" → [4, 4]; vazio → todos. */
export function parseRange(/** @type {string | undefined} */ range) {
  if (!range) return [1, 999];
  const [from, to] = range.split("-").map(Number);
  if (!from) throw new Error(`Capítulos inválidos: ${range} (use, por exemplo, 3-9)`);
  return [from, to || from];
}
