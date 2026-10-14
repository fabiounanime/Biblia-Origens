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
  /<w ([^>]*)>([^<]*)<\/w>|<note type="variant">[\s\S]*?<rdg type="x-qere">([\s\S]*?)<\/rdg>[\s\S]*?<\/note>|<note[\s\S]*?<\/note>|<seg type="x-maqqef">/g;
const QERE_WORD_RE = /<w ([^>]*)>([^<]*)<\/w>(\s*<seg type="x-maqqef">)?/g;

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
        // Leitura (qere) da palavra escrita logo antes. Pode ter mais de uma
        // palavra (Gn 30:11: ketiv בגד, qere בָּא גָד).
        /** @type {Word[]} */
        const qere = [];
        for (const w of token[3].matchAll(QERE_WORD_RE)) {
          qere.push({ text: w[2], morph: attr(w[1], "morph"), lemma: attr(w[1], "lemma"), ketiv: null, maqaf: !!w[3] });
        }
        const last = words[words.length - 1];
        if (qere.length && last && last.ketiv !== null) {
          const ketiv = last.ketiv;
          words.pop();
          qere[0].ketiv = ketiv;
          qere[qere.length - 1].maqaf = last.maqaf || qere[qere.length - 1].maqaf;
          words.push(...qere);
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
