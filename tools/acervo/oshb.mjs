/**
 * Leitura do texto hebraico da Open Scriptures Hebrew Bible (OSHB), que é o
 * Westminster Leningrad Codex com análise gramatical palavra por palavra.
 *
 * Fonte: https://github.com/openscriptures/morphhb (pasta wlc/), CC BY 4.0.
 * O texto do Códice de Leningrado é de domínio público.
 *
 * Sem dependências: o XML da OSHB é regular o bastante para ser lido por
 * expressões regulares, um versículo por vez.
 */

import { readFileSync } from "node:fs";

/** @typedef {{ text: string, morph: string, lemma: string, ketiv: string | null, maqaf: boolean }} Word */
/** @typedef {{ chapter: number, verse: number, words: Word[] }} SourceVerse */

const VERSE_RE = /<verse osisID="[^".]+\.(\d+)\.(\d+)">([\s\S]*?)<\/verse>/g;
const TOKEN_RE =
  /<w ([^>]*)>([^<]*)<\/w>|<note type="variant">[\s\S]*?<rdg type="x-qere">\s*<w ([^>]*)>([^<]*)<\/w>[\s\S]*?<\/note>|<note[\s\S]*?<\/note>|<seg type="x-maqqef">/g;

/** @param {string} attrs @param {string} name */
function attr(attrs, name) {
  const match = new RegExp(`${name}="([^"]*)"`).exec(attrs);
  return match ? match[1] : "";
}

/**
 * Lê um livro inteiro. Onde há ketiv/qere (o texto escrito difere da leitura
 * tradicional), a palavra fica com a leitura (qere), que tem os sinais vocálicos,
 * e guarda a forma escrita em `ketiv`.
 *
 * @param {string} xmlPath caminho de um arquivo da pasta wlc/ (ex.: Gen.xml)
 * @returns {SourceVerse[]}
 */
export function readBook(xmlPath) {
  const xml = readFileSync(xmlPath, "utf8");
  /** @type {SourceVerse[]} */
  const verses = [];
  for (const match of xml.matchAll(VERSE_RE)) {
    /** @type {Word[]} */
    const words = [];
    for (const token of match[3].matchAll(TOKEN_RE)) {
      if (token[1] !== undefined) {
        const attrs = token[1];
        words.push({
          text: token[2],
          morph: attr(attrs, "morph"),
          lemma: attr(attrs, "lemma"),
          ketiv: attr(attrs, "type") === "x-ketiv" ? token[2] : null,
          maqaf: false,
        });
      } else if (token[3] !== undefined) {
        // Leitura (qere) da palavra escrita logo antes.
        const last = words[words.length - 1];
        if (last && last.ketiv !== null) {
          last.text = token[4];
          last.morph = attr(token[3], "morph") || last.morph;
          last.lemma = attr(token[3], "lemma") || last.lemma;
        }
      } else if (token[0].startsWith("<seg")) {
        const last = words[words.length - 1];
        if (last) last.maqaf = true;
      }
    }
    verses.push({ chapter: Number(match[1]), verse: Number(match[2]), words });
  }
  return verses;
}

/** Acentos de cantilação, meteg, paseq, sof pasuq e pontos extraordinários. */
const NOT_SHOWN = /[֑-ֽ֯׀׃-׆/]/g;

/**
 * Hebraico para a tela: consoantes e sinais vocálicos (nikud), sem os acentos de
 * cantilação, com o maqaf ligando as palavras.
 * @param {Word[]} words
 */
export function hebrewLine(words) {
  let out = "";
  for (const word of words) {
    out += word.text.replace(NOT_SHOWN, "");
    out += word.maqaf ? "־" : " ";
  }
  return out.trim();
}
