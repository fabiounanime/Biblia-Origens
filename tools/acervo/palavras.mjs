/**
 * Significado de cada palavra hebraica, para o balão do leitor.
 *
 * Para cada palavra da OSHB monta:
 *   g  significado em português, com os prefixos e o sufixo separados por "+"
 *      (ex.: "e + dizer", "em + princípio", "voz + dele");
 *   m  a análise gramatical em português simples;
 *   l  a forma de dicionário (lema) em hebraico;
 *   o  outros sentidos da palavra, quando há mais de um.
 *
 * Os significados vêm de acervo/lexico/glosas.txt (palavras) e
 * acervo/lexico/nomes.txt (nomes próprios); a forma de dicionário, do léxico
 * de Strong da Open Scriptures (HebrewStrong.xml, domínio público).
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** Graus do verbo (binyanim), códigos da OSHB. */
const STEMS_HE = {
  q: "qal", N: "nifal", p: "piel", P: "pual", h: "hifil", H: "hofal", t: "hitpael",
  o: "polel", O: "polal", r: "hitpolel", m: "poel", M: "poal", k: "palel", K: "pulal",
  Q: "qal passivo", l: "pilpel", L: "polpal", f: "hitpalpel", D: "nitpael", j: "pealal",
  i: "pilel", u: "hotpaal", c: "tifil", v: "histafel", w: "nitpalel", y: "nitpoel", z: "hitpoel",
};
const STEMS_AR = {
  q: "peal", Q: "peil", u: "hitpeel", p: "pael", P: "hitpaal", M: "hitpaal", a: "afel",
  h: "hafel", s: "safel", e: "shafel", H: "hofal", i: "itpeel", t: "hishtafal", v: "ishtafal",
  w: "hitpaal", o: "itpaal", z: "hitpoel",
};

const FORMS = {
  p: "perfeito (ação concluída)",
  q: "perfeito com vav (ação em sequência: \"e fará\")",
  i: "imperfeito (ação não concluída ou futura)",
  w: "imperfeito com vav (narrativa: \"e fez\")",
  h: "coortativo (\"que eu faça\")",
  j: "jussivo (\"que faça\")",
  v: "imperativo",
  r: "particípio",
  s: "particípio passivo",
  a: "infinitivo absoluto",
  c: "infinitivo construto",
};

const PERSON = { 1: "1ª", 2: "2ª", 3: "3ª" };
const GENDER = { m: "masculino", f: "feminino", c: "masculino ou feminino", b: "masculino ou feminino" };
const NUMBER = { s: "singular", p: "plural", d: "dual" };
const STATE = { a: "", c: ", ligado à palavra seguinte (construto)", d: ", determinado" };

/** Pronome de cada pessoa, para orientar a leitura ("ele", "vós"…). */
const SUBJECT = {
  "1cs": "eu", "1bs": "eu", "2ms": "tu", "2fs": "tu", "3ms": "ele", "3fs": "ela",
  "1cp": "nós", "1bp": "nós", "2mp": "vós", "2fp": "vós", "3mp": "eles", "3fp": "elas", "3cp": "eles",
};
/** Sufixo pronominal: posse (substantivos), objeto (verbos), pessoa (preposições). */
const POSSESSIVE = {
  "1cs": "meu", "2ms": "teu", "2fs": "teu", "3ms": "dele", "3fs": "dela",
  "1cp": "nosso", "2mp": "vosso", "2fp": "vosso", "3mp": "deles", "3fp": "delas",
};
const OBJECT = {
  "1cs": "me", "2ms": "te", "2fs": "te", "3ms": "o", "3fs": "a",
  "1cp": "nos", "2mp": "vos", "2fp": "vos", "3mp": "os", "3fp": "as",
};
const OBLIQUE = {
  "1cs": "mim", "2ms": "ti", "2fs": "ti", "3ms": "ele", "3fs": "ela",
  "1cp": "nós", "2mp": "vós", "2fp": "vós", "3mp": "eles", "3fp": "elas",
};

/** Prefixos de uma letra (lema da OSHB) e o seu sentido. */
function prefixGloss(letter, morph) {
  const article = morph === "Rd";
  switch (letter) {
    case "c": return "e";
    case "d": return "o";
    case "b": return article ? "em + o" : "em";
    case "l": return article ? "para + o" : "para";
    case "k": return article ? "como + o" : "como";
    case "m": return "de";
    case "i": return "(pergunta)";
    case "s": return "que";
    default: return "";
  }
}

const PARTICLES = {
  a: "partícula de afirmação", d: "artigo", e: "partícula de pedido", i: "partícula interrogativa",
  j: "interjeição", m: "partícula demonstrativa", n: "negação", o: "marca do objeto direto",
  r: "pronome relativo",
};
const PRONOUNS = { d: "pronome demonstrativo", f: "pronome indefinido", i: "pronome interrogativo", p: "pronome pessoal", r: "pronome relativo" };
const NOUNS = { c: "substantivo", g: "gentílico", p: "nome próprio" };
const ADJECTIVES = { a: "adjetivo", c: "numeral", g: "gentílico", o: "numeral ordinal" };

function pgn(code) {
  const [p, g, n] = code;
  const parts = [];
  if (PERSON[p]) parts.push(`${PERSON[p]} pessoa`);
  // Gênero "comum" (eu, nós) não precisa ser dito.
  if (GENDER[g] && g !== "c" && g !== "b") parts.push(GENDER[g]);
  if (NUMBER[n]) parts.push(NUMBER[n]);
  return parts.join(" ");
}

function genderNumber(g, n) {
  return [GENDER[g], NUMBER[n]].filter(Boolean).join(" ");
}

/** Análise gramatical de um segmento (sem o idioma na frente). */
export function describe(code, aramaic = false, suffixed = false) {
  // Com sufixo pronominal, a forma "construta" é só a base do sufixo.
  const state = (/** @type {string} */ c) => (suffixed && c === "c" ? "" : (STATE[c] ?? ""));
  const kind = code[0];
  const rest = code.slice(1);
  if (kind === "V") {
    const stem = (aramaic ? STEMS_AR : STEMS_HE)[rest[0]] ?? rest[0];
    const form = rest[1];
    let out = `verbo, ${stem}, ${FORMS[form] ?? form}`;
    if (form === "r" || form === "s") {
      const gn = genderNumber(rest[2], rest[3]);
      if (gn) out += `, ${gn}`;
    } else if (form !== "a" && form !== "c") {
      const who = SUBJECT[rest.slice(2, 5)];
      out += `, ${pgn(rest.slice(2, 5))}${who ? ` (${who})` : ""}`;
    }
    return out;
  }
  if (kind === "N") {
    if (rest[0] === "p") return "nome próprio";
    return `${NOUNS[rest[0]] ?? "substantivo"} ${genderNumber(rest[1], rest[2])}${state(rest[3])}`.trim();
  }
  if (kind === "A") return `${ADJECTIVES[rest[0]] ?? "adjetivo"} ${genderNumber(rest[1], rest[2])}${state(rest[3])}`.trim();
  if (kind === "P") {
    const base = PRONOUNS[rest[0]] ?? "pronome";
    const detail = rest.length > 1 ? pgn(rest.slice(1, 4)) : "";
    return detail ? `${base}, ${detail}` : base;
  }
  if (kind === "T" && rest[0] === "o") return "marca do objeto direto (não se traduz)";
  if (kind === "T") return PARTICLES[rest[0]] ?? "partícula";
  if (kind === "R") return rest[0] === "d" ? "preposição com artigo" : "preposição";
  if (kind === "C") return "conjunção";
  if (kind === "S" && rest[0] === "p") return `pronome, ${pgn(rest.slice(1, 4))}`;
  if (kind === "D") return "advérbio";
  return "";
}

/** Lê "lema | significado" (e "lema | nome | tipo"), ignorando comentários. */
/**
 * Lê "lema | significado" (e "lema | nome | tipo"), ignorando comentários.
 * Além do arquivo principal (glosas.txt), lê os acréscimos de cada livro em
 * glosas.d/*.txt. Um lema repetido no mesmo arquivo é erro; entre arquivos,
 * vale o primeiro (o principal, depois os livros em ordem alfabética).
 */
export function readTable(path) {
  /** @type {Map<string, string[]>} */
  const table = new Map();
  const extraDir = path.replace(/\.txt$/, ".d");
  const files = [path];
  if (existsSync(extraDir)) {
    for (const name of readdirSync(extraDir).sort()) if (name.endsWith(".txt")) files.push(join(extraDir, name));
  }
  for (const file of files) {
    if (!existsSync(file)) continue;
    /** @type {Set<string>} */
    const seen = new Set();
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((raw, index) => {
        const line = raw.trim();
        if (!line || line.startsWith("#")) return;
        const parts = line.split("|").map((part) => part.trim());
        if (parts.length < 2 || !parts[0] || !parts[1]) throw new Error(`${file}:${index + 1}: linha fora do formato`);
        if (seen.has(parts[0])) throw new Error(`${file}:${index + 1}: lema ${parts[0]} repetido`);
        seen.add(parts[0]);
        if (!table.has(parts[0])) table.set(parts[0], parts.slice(1));
      });
  }
  return table;
}

/** Significado de um verbo no grau certo: "sair | h: fazer sair". */
function pickSense(senses, stem) {
  let plain = "";
  /** @type {Record<string, string>} */
  const byStem = {};
  for (const sense of senses) {
    const match = /^([A-Za-z]): (.+)$/.exec(sense);
    if (match) byStem[match[1]] = match[2];
    else if (!plain) plain = sense;
  }
  if (stem && byStem[stem]) return byStem[stem];
  if (plain) return plain;
  return Object.values(byStem)[0] ?? "";
}

/**
 * @param {string} root raiz do repositório
 * @param {string} strongXml caminho do HebrewStrong.xml (ou "" para não mostrar o lema em hebraico)
 */
export function createGlosser(root, strongXml) {
  const glosses = readTable(join(root, "acervo/lexico/glosas.txt"));
  const names = readTable(join(root, "acervo/lexico/nomes.txt"));
  /** @type {Map<string, string>} */
  const lemmaHe = new Map();
  if (strongXml && existsSync(strongXml)) {
    const xml = readFileSync(strongXml, "utf8");
    for (const m of xml.matchAll(/<entry id="H(\d+)">\s*<w [^>]*>([^<]*)<\/w>/g)) lemmaHe.set(m[1], m[2]);
  }
  // O nome divino aparece só com as consoantes, como no resto do app.
  lemmaHe.set("3068", "יהוה");
  lemmaHe.set("3069", "יהוה");
  /** @type {Set<string>} */
  const missing = new Set();

  /** @param {import("./oshb.mjs").Word} word */
  function gloss(word) {
    const aramaic = word.morph.startsWith("A");
    const morphs = word.morph.slice(1).split("/");
    const lemmas = word.lemma.split("/");
    const parts = [];
    let main = "";
    let mainCode = "";
    let mainLemma = "";
    let others = "";
    lemmas.forEach((lemma, index) => {
      const code = morphs[index] ?? "";
      if (/^[a-z]$/.test(lemma)) {
        const prefix = prefixGloss(lemma, code);
        if (prefix) parts.push(prefix);
        // Preposição sozinha com sufixo (לְךָ, "para ti"): ela é a palavra principal.
        if (index === lemmas.length - 1 && !mainCode) mainCode = code;
        return;
      }
      const key = lemma.trim();
      const name = names.get(key);
      const senses = glosses.get(key);
      let sense = "";
      if (name) sense = name[0];
      else if (senses) sense = pickSense(senses, code[0] === "V" ? code[1] : "");
      else missing.add(`${key} (${code})`);
      // O primeiro sentido entra na conta com os prefixos; os outros ficam à parte.
      const [first, ...rest] = name ? [sense] : sense.split(/,\s(?![^(]*\))/);
      parts.push(first || "?");
      main = first ?? "";
      others = rest.join(", ");
      mainCode = code;
      mainLemma = key;
    });

    // Sufixos: pronome (posse, objeto ou pessoa) e he de direção.
    const extra = morphs.slice(lemmas.length);
    let suffixNote = "";
    for (const code of extra) {
      if (code.startsWith("Sp")) {
        const who = code.slice(2, 5);
        const kind = mainCode[0];
        const word = kind === "V" || mainCode === "To" ? OBJECT[who] : kind === "N" || kind === "A" ? POSSESSIVE[who] : OBLIQUE[who];
        if (word) parts.push(word);
        suffixNote = `; com sufixo de ${pgn(who)}`;
      } else if (code === "Sd") {
        parts.push("(para lá)");
        suffixNote = "; com terminação de direção (\"para…\")";
      }
    }

    const number = mainLemma.replace(/[^\d]/g, "");
    return {
      g: parts.join(" + ") || main,
      m: `${describe(mainCode, aramaic, extra.some((code) => code.startsWith("Sp")))}${suffixNote}`.replace(/^./, (c) => c.toUpperCase()),
      l: lemmaHe.get(number) ?? "",
      o: others,
    };
  }

  return { gloss, missing };
}
