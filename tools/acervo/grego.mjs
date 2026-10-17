/**
 * Novo Testamento em grego: texto da SBL Greek New Testament (SBLGNT, CC BY 4.0)
 * com a análise de cada palavra da MorphGNT (CC BY-SA 3.0).
 *
 * Fonte: https://github.com/morphgnt/sblgnt, um arquivo por livro, uma palavra
 * por linha: "livro-capítulo-versículo  classe  análise  texto  palavra  normal  lema".
 *
 * Aqui ficam a leitura do texto, a linha grega para a tela, a transliteração
 * simples (Biblos geneseos Iesou Christou) e a análise gramatical em português.
 */

import { readFileSync } from "node:fs";

/**
 * @typedef {{ text: string, word: string, lemma: string, pos: string, parse: string }} GreekWord
 * @typedef {{ chapter: number, verse: number, words: GreekWord[] }} GreekVerse
 */

/** Sinais de crítica textual da SBLGNT (remetem ao aparato): não aparecem na tela. */
const CRITICAL_SIGNS = /[⸀-⸅]/g;

/** @param {string} path @returns {GreekVerse[]} */
export function readGreekBook(path) {
  /** @type {GreekVerse[]} */
  const verses = [];
  /** @type {GreekVerse | undefined} */
  let current;
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const [bcv, pos, parse, text, word, , lemma] = line.split(" ");
    const chapter = Number(bcv.slice(2, 4));
    const verse = Number(bcv.slice(4, 6));
    if (!current || current.chapter !== chapter || current.verse !== verse) {
      current = { chapter, verse, words: [] };
      verses.push(current);
    }
    current.words.push({ text: text.replace(CRITICAL_SIGNS, ""), word, lemma, pos, parse });
  }
  return verses;
}

/** Linha grega para a tela: as palavras com a pontuação, separadas por espaço. */
export function greekLine(/** @type {GreekWord[]} */ words) {
  return words.map((word) => word.text).join(" ");
}

// ---------- Transliteração simples ----------

/** @type {Record<string, string>} */
const LETTER = {
  α: "a", β: "b", γ: "g", δ: "d", ε: "e", ζ: "z", η: "e", θ: "th", ι: "i", κ: "k", λ: "l",
  μ: "m", ν: "n", ξ: "x", ο: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", φ: "ph",
  χ: "ch", ψ: "ps", ω: "o",
};
const DIPHTHONG = new Set(["αι", "ει", "οι", "υι", "αυ", "ευ", "ηυ", "ου"]);
const VOWELS = new Set(["α", "ε", "η", "ι", "ο", "υ", "ω"]);
const ROUGH = "̔";
const DIAERESIS = "̈";

/** Uma palavra grega → letras latinas, sem acentos ("Ἰησοῦ" → "Iesou"). */
export function transliterateGreekWord(/** @type {string} */ text) {
  // Letra base + marcas que interessam (aspiração e trema), na ordem.
  /** @type {{ base: string, upper: boolean, rough: boolean, diaeresis: boolean }[]} */
  const letters = [];
  /** @type {string[]} */
  const out = [];
  const flush = () => {
    out.push(spell(letters.splice(0)));
  };
  for (const ch of text.normalize("NFD")) {
    const lower = ch.toLowerCase();
    if (LETTER[lower] !== undefined) {
      letters.push({ base: lower, upper: ch !== lower, rough: false, diaeresis: false });
    } else if (ch === ROUGH || ch === DIAERESIS) {
      const last = letters[letters.length - 1];
      if (last && ch === ROUGH) last.rough = true;
      if (last && ch === DIAERESIS) last.diaeresis = true;
    } else if (/\p{M}/u.test(ch)) {
      // acentos, aspiração suave e iota subscrito: não se transliteram
    } else {
      flush();
      out.push(ch === ";" ? "?" : ch === "·" ? ";" : ch === "’" ? "'" : ch);
    }
  }
  flush();
  return out.join("");
}

/** @param {{ base: string, upper: boolean, rough: boolean, diaeresis: boolean }[]} letters */
function spell(letters) {
  if (!letters.length) return "";
  let result = "";
  let rough = letters.some((letter, index) => letter.rough && index <= 1);
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    const next = letters[i + 1];
    const pair = next ? letter.base + next.base : "";
    if (letter.base === "ρ" && i === 0 && letter.rough) {
      result += "rh";
      rough = false;
      continue;
    }
    if (DIPHTHONG.has(pair) && !next.diaeresis) {
      result += (letter.base === "υ" ? "u" : LETTER[letter.base]) + (next.base === "υ" ? "u" : "i");
      i++;
      continue;
    }
    if (letter.base === "γ" && next && ["γ", "κ", "ξ", "χ"].includes(next.base)) {
      result += "n";
      continue;
    }
    result += LETTER[letter.base];
  }
  if (rough && VOWELS.has(letters[0].base)) result = `h${result}`;
  if (letters[0].upper) result = result.charAt(0).toUpperCase() + result.slice(1);
  return result;
}

export function transliterateGreekVerse(/** @type {GreekWord[]} */ words) {
  return words.map((word) => transliterateGreekWord(word.text)).join(" ");
}

// ---------- Análise gramatical em português ----------

const PERSON = { 1: "1ª pessoa", 2: "2ª pessoa", 3: "3ª pessoa" };
const TENSE = {
  P: "presente", I: "imperfeito", F: "futuro", A: "aoristo", X: "perfeito", Y: "mais-que-perfeito",
};
const VOICE = { A: "ativo", M: "médio", P: "passivo" };
const MOOD = {
  I: "indicativo", D: "imperativo", S: "subjuntivo", O: "optativo", N: "infinitivo", P: "particípio",
};
const CASE = { N: "nominativo", G: "genitivo", D: "dativo", A: "acusativo", V: "vocativo" };
const NUMBER = { S: "singular", P: "plural" };
const GENDER = { M: "masculino", F: "feminino", N: "neutro" };
const DEGREE = { C: "comparativo", S: "superlativo" };
const SUBJECT = { "1S": "eu", "2S": "tu", "3S": "ele, ela", "1P": "nós", "2P": "vós", "3P": "eles, elas" };

const POS = {
  "A-": "adjetivo", "C-": "conjunção", "D-": "advérbio", "I-": "interjeição", "N-": "substantivo",
  "P-": "preposição", RA: "artigo", RD: "pronome demonstrativo", RI: "pronome interrogativo ou indefinido",
  RP: "pronome pessoal", RR: "pronome relativo", "V-": "verbo", "X-": "partícula",
};

/** "ASM" → "acusativo masculino singular". */
function caseNumberGender(/** @type {string} */ parse) {
  return [CASE[parse[4]], GENDER[parse[6]], NUMBER[parse[5]]].filter(Boolean).join(" ");
}

/** @param {string} pos @param {string} parse */
export function describeGreek(pos, parse) {
  const kind = POS[pos] ?? "palavra";
  if (pos === "V-") {
    const parts = ["verbo", TENSE[parse[1]], VOICE[parse[2]], MOOD[parse[3]]].filter(Boolean);
    if (parse[3] === "P") {
      const cng = caseNumberGender(parse);
      if (cng) parts.push(cng);
    } else if (parse[3] !== "N") {
      const who = `${parse[0]}${parse[5]}`;
      parts.push(`${PERSON[parse[0]]} ${NUMBER[parse[5]]}${SUBJECT[who] ? ` (${SUBJECT[who]})` : ""}`);
    }
    return cap(parts.join(", "));
  }
  const cng = caseNumberGender(parse);
  const degree = DEGREE[parse[7]];
  return cap([kind, cng, degree].filter(Boolean).join(", "));
}

function cap(/** @type {string} */ text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** O artigo grego, traduzido pelo caso: o, do, ao… */
function articleGloss(/** @type {string} */ parse) {
  const plural = parse[5] === "P";
  const feminine = parse[6] === "F";
  const base = feminine ? (plural ? "as" : "a") : plural ? "os" : "o";
  if (parse[4] === "G") return `d${base}`;
  if (parse[4] === "D") return feminine ? (plural ? "às" : "à") : plural ? "aos" : "ao";
  return base;
}

/**
 * Significado de cada palavra grega, de acervo/lexico/grego.txt (e grego.d/*.txt):
 *   λόγος | palavra, discurso, relato
 *   Ἰησοῦς | Jesus
 * @param {(path: string) => Map<string, string[]>} readTable
 * @param {string} root
 */
export function createGreekGlosser(readTable, root) {
  const table = readTable(`${root}/acervo/lexico/grego.txt`);
  /** @type {Set<string>} */
  const missing = new Set();

  /**
   * @param {GreekWord} word
   * @param {{ lemma: string, sense: string }} [context] sentido deste versículo (acervo/lexico/contexto)
   */
  function gloss(word, context) {
    const m = describeGreek(word.pos, word.parse);
    if (word.pos === "RA") return { g: articleGloss(word.parse), m: "Artigo, " + caseNumberGender(word.parse), l: word.lemma, o: "" };
    const row = context?.lemma === word.lemma ? [context.sense] : table.get(word.lemma);
    if (!row) {
      missing.add(`${word.lemma} (${word.pos})`);
      return { g: "?", m, l: word.lemma, o: "" };
    }
    const isName = /^\p{Lu}/u.test(word.lemma) && !context;
    const [first, ...rest] = isName ? [row[0]] : row[0].split(/,\s(?![^(]*\))/);
    return { g: first, m, l: word.lemma, o: rest.join(", ") };
  }

  return { gloss, missing };
}
