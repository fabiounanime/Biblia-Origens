/**
 * Sentido de uma palavra num versículo específico.
 *
 * O glossário (glosas.txt, nomes.txt, grego.txt) dá um significado por lema, e
 * o primeiro sentido é o que aparece embaixo da palavra no leitor. Quando, num
 * versículo, o lema tem outro sentido (ex.: תָּפַשׂ é "segurar" em geral, mas
 * "tocar" a harpa em Gn 4:21), o sentido certo vai em:
 *
 *   acervo/lexico/contexto/{livro}.txt
 *     4:21 | 8610 | tocar (instrumento), segurar
 *     6:15 | 504#2 | clã
 *
 * Formato: capítulo:versículo | lema | sentido. O lema é o mesmo do glossário
 * (número de Strong da OSHB no hebraico, lema da MorphGNT no grego). Com "#2",
 * vale só para a segunda vez que o lema aparece no versículo; sem número, vale
 * para todas. O sentido segue o formato do glossário: o primeiro aparece em
 * destaque, os outros (depois de vírgula) ficam como "Também".
 *
 * Com "@N" no lugar do lema, a linha vale para a N-ésima palavra do versículo
 * e substitui o significado inteiro dela, com prefixos e sufixos (para quando a
 * análise da OSHB erra um sufixo: מִמֶּנּוּ "de nós" onde é "dele"). Depois de
 * outra barra, pode vir a gramática que substitui a da análise:
 *     2:11 | @16 | de + ele (dele) | Preposição; com sufixo de 3ª pessoa masculino singular
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./livros.mjs";

/**
 * @typedef {{ lemma: string, nth: number, sense: string, where: string, used: boolean }} ContextSense
 */

/** @param {string} bookId */
export function readContext(bookId) {
  const path = join(ROOT, "acervo/lexico/contexto", `${bookId}.txt`);
  /** @type {Map<string, ContextSense[]>} */
  const byVerse = new Map();
  if (!existsSync(path)) return byVerse;
  readFileSync(path, "utf8")
    .split("\n")
    .forEach((raw, index) => {
      const line = raw.trim();
      if (!line || line.startsWith("#")) return;
      const match = /^(\d+:\d+)\s*\|\s*([^|#]+?)(?:#(\d+))?\s*\|\s*(.+)$/.exec(line);
      if (!match) throw new Error(`${path}:${index + 1}: linha fora do formato "c:v | lema | sentido"`);
      const list = byVerse.get(match[1]) ?? [];
      list.push({ lemma: match[2].trim(), nth: Number(match[3] ?? 0), sense: match[4].trim(), where: `${path}:${index + 1}`, used: false });
      byVerse.set(match[1], list);
    });
  return byVerse;
}

/**
 * Para cada palavra do versículo, o sentido de contexto que vale para ela (ou undefined).
 * @param {ContextSense[] | undefined} entries
 * @param {{ lemma: string }[]} words
 * @param {"he" | "gr"} lang
 */
export function contextFor(entries, words, lang) {
  if (!entries?.length) return words.map(() => undefined);
  /** @type {Map<string, number>} */
  const seen = new Map();
  return words.map((word, index) => {
    const whole = entries.find((e) => e.lemma === `@${index + 1}`);
    if (whole) {
      whole.used = true;
      return { lemma: whole.lemma, sense: whole.sense, whole: true };
    }
    const lemmas = lang === "he" ? word.lemma.split("/").map((l) => l.trim()) : [word.lemma];
    for (const lemma of lemmas) {
      if (lang === "he" && /^[a-z]$/.test(lemma)) continue;
      const count = (seen.get(lemma) ?? 0) + 1;
      seen.set(lemma, count);
      const entry = entries.find((e) => !e.lemma.startsWith("@") && e.lemma === lemma && (!e.nth || e.nth === count));
      if (entry) {
        entry.used = true;
        return { lemma, sense: entry.sense };
      }
    }
    return undefined;
  });
}

/** Linhas de contexto que não acharam a palavra no versículo. */
export function unusedContext(/** @type {Map<string, ContextSense[]>} */ byVerse, /** @type {(key: string) => boolean} */ inScope) {
  const out = [];
  for (const [key, list] of byVerse) {
    if (!inScope(key)) continue;
    for (const entry of list) if (!entry.used) out.push(`${entry.where}: ${key} não tem o lema ${entry.lemma}${entry.nth ? `#${entry.nth}` : ""}`);
  }
  return out;
}
