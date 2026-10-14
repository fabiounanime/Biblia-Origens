/**
 * Transliteração simples do hebraico com nikud, para ler em voz alta:
 *
 *   בְּרֵאשִׁית בָּרָא אֱלֹהִים → Bereshit bara Elohim
 *
 * Convenções (iguais às da página inicial e do catálogo):
 *   ש sh / שׂ s · צ ts · ח ch · כ k / kh (sem dagesh) · ב b / v · פ p / f
 *   ו v · ט ת t · ק k · א e ע no meio da palavra: ' (apóstrofo)
 *   Vogais a e i o u; shva pronunciado vira "e". Sem consoantes dobradas.
 *   O nome divino יהוה é escrito YHWH, como na tradução.
 *
 * Regras de pronúncia que dependem do contexto:
 *   - shva pronunciado: no início da palavra, sob letra com dagesh forte, depois
 *     de outro shva, ou depois de vogal com meteg; nos demais casos é mudo.
 *   - qamats qatan ("o"): qamats seguido de shva mudo em substantivos
 *     (חָכְמָה chokhmah) e em כָּל־ (kol); em verbos é sempre "a" (הָיְתָה hayetah).
 *   - letras de apoio (matres lectionis): וֹ o, וּ u, יִ/יֵ/יֶ sem som próprio,
 *     ה final sem mappiq só depois de "a" (Torah), א quiescente.
 *   - patah furtivo: רוּחַ ruach.
 */

const SHVA = "ְ";
const HATAF_SEGOL = "ֱ";
const HATAF_PATAH = "ֲ";
const HATAF_QAMATS = "ֳ";
const HIRIQ = "ִ";
const TSERE = "ֵ";
const SEGOL = "ֶ";
const PATAH = "ַ";
const QAMATS = "ָ";
const HOLAM = "ֹ";
const HOLAM_HASER = "ֺ";
const QUBUTS = "ֻ";
const DAGESH = "ּ";
const METEG = "ֽ";
const SHIN_DOT = "ׁ";
const SIN_DOT = "ׂ";
const QAMATS_QATAN = "ׇ";

/** @type {Record<string, string>} */
const VOWEL_SOUND = {
  [HATAF_SEGOL]: "e",
  [HATAF_PATAH]: "a",
  [HATAF_QAMATS]: "o",
  [HIRIQ]: "i",
  [TSERE]: "e",
  [SEGOL]: "e",
  [PATAH]: "a",
  [QAMATS]: "a",
  [QAMATS_QATAN]: "o",
  [HOLAM]: "o",
  [HOLAM_HASER]: "o",
  [QUBUTS]: "u",
};

/** @type {Record<string, string>} */
const FINALS = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };

/** @type {Record<string, string>} */
const CONSONANT = {
  "ג": "g", "ד": "d", "ה": "h", "ו": "v", "ז": "z", "ח": "ch", "ט": "t", "י": "y",
  "ל": "l", "מ": "m", "נ": "n", "ס": "s", "צ": "ts", "ק": "k", "ר": "r", "ת": "t",
};

const BEGADKEFAT = new Set(["ב", "ג", "ד", "כ", "פ", "ת"]);
const GUTTURAL_FURTIVE = new Set(["ח", "ע", "ה"]);

/**
 * @typedef {{ base: string, letter: string, vowel: string | null, dagesh: boolean,
 *   meteg: boolean, shin: boolean, sin: boolean, holam: boolean }} Letter
 */

/** @param {string} text @returns {Letter[]} */
function parse(text) {
  /** @type {Letter[]} */
  const letters = [];
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x05d0 && code <= 0x05ea) {
      letters.push({
        base: FINALS[ch] ?? ch,
        letter: ch,
        vowel: null,
        dagesh: false,
        meteg: false,
        shin: false,
        sin: false,
        holam: false,
      });
      continue;
    }
    const last = letters[letters.length - 1];
    if (!last) continue;
    if (ch === DAGESH) last.dagesh = true;
    else if (ch === METEG) last.meteg = true;
    else if (ch === SHIN_DOT) last.shin = true;
    else if (ch === SIN_DOT) last.sin = true;
    else if (ch === HOLAM || ch === HOLAM_HASER) {
      // Holam pode vir junto de outra vogal na mesma letra (ex.: ש com holam e
      // qamats em alguns textos); guardamos à parte.
      if (last.vowel === null) last.vowel = HOLAM;
      else last.holam = true;
    } else if (ch === SHVA || VOWEL_SOUND[ch] !== undefined) {
      if (last.vowel === HOLAM && ch !== SHVA) {
        last.holam = true;
        last.vowel = ch;
      } else last.vowel = ch;
    }
  }
  return letters;
}

/** Vav de apoio: וּ (shuruk) ou וֹ (holam male), sem vogal própria. */
function isShuruk(/** @type {Letter} */ l) {
  return l.base === "ו" && l.dagesh && l.vowel === null;
}
function isHolamMale(/** @type {Letter} */ l) {
  return l.base === "ו" && l.vowel === HOLAM && !l.dagesh;
}

/**
 * @param {string} text palavra hebraica com nikud (pode conter "/" entre morfemas)
 * @param {{ verb?: boolean, kol?: boolean }} [hints]
 * @returns {{ out: string, starts: number[] }} texto e posição de saída do início de
 *   cada morfema (para pôr maiúscula em nomes próprios depois de prefixos)
 */
export function transliterateWord(text, hints = {}) {
  /** @type {number[]} */
  const morphemeAt = [];
  let count = 0;
  for (const ch of text) {
    if (ch === "/") morphemeAt.push(count);
    else if ((ch.codePointAt(0) ?? 0) >= 0x05d0 && (ch.codePointAt(0) ?? 0) <= 0x05ea) count++;
  }
  const letters = parse(text.replace(/\//g, ""));
  const n = letters.length;
  /** @type {string[]} */
  const piece = new Array(n).fill("");

  // Qual vogal cada letra pronuncia (null = nenhuma); resolve shva e qamats.
  /** @type {(string | null)[]} */
  const sound = new Array(n).fill(null);
  /** Shva mudo marcado: usado pela regra "depois de outro shva". */
  /** @type {boolean[]} */
  const silentShva = new Array(n).fill(false);

  for (let i = 0; i < n; i++) {
    const l = letters[i];
    const prev = letters[i - 1];
    if (l.vowel === SHVA) {
      const last = i === n - 1;
      const forte = l.dagesh && (!BEGADKEFAT.has(l.base) || (prev !== undefined && prev.vowel !== null && prev.vowel !== SHVA));
      const afterShva = i > 0 && silentShva[i - 1];
      // Meteg só torna o shva pronunciado depois de vogal longa (em וַֽיְהִי é mudo).
      const afterMeteg =
        prev !== undefined && prev.meteg && (prev.vowel === QAMATS || prev.vowel === TSERE || prev.vowel === HOLAM);
      const afterVerbQamats = hints.verb && prev !== undefined && prev.vowel === QAMATS;
      // Yod com shva depois de "a" fecha o ditongo (לָיְלָה laylah, הָיְתָה haytah).
      const diphthong = l.base === "י" && prev !== undefined && (prev.vowel === QAMATS || prev.vowel === PATAH);
      // Shva sob a primeira de duas consoantes iguais (הִנְנִי hineni, דְדָן Dedan).
      const beforeTwin = letters[i + 1] !== undefined && letters[i + 1].base === l.base;
      const vocal =
        !last && (i === 0 || forte || afterShva || beforeTwin || (!diphthong && (afterMeteg || afterVerbQamats)));
      if (vocal) sound[i] = "e";
      else silentShva[i] = true;
    } else if (l.vowel !== null) {
      sound[i] = VOWEL_SOUND[l.vowel] ?? null;
    }
  }

  // Qamats qatan.
  for (let i = 0; i < n; i++) {
    const l = letters[i];
    if (l.vowel !== QAMATS) continue;
    if (hints.kol && i === n - 2) {
      sound[i] = "o";
      continue;
    }
    if (l.meteg || hints.verb) continue;
    const next = letters[i + 1];
    // Antes de י/ו é ditongo (לָיְלָה laylah), não qamats qatan.
    if (next && next.vowel === SHVA && silentShva[i + 1] && next.base !== "י" && next.base !== "ו") sound[i] = "o";
  }

  for (let i = 0; i < n; i++) {
    const l = letters[i];
    const prev = letters[i - 1];
    const next = letters[i + 1];
    const last = i === n - 1;
    const prevSound = i > 0 ? sound[i - 1] : null;
    let vowel = sound[i] ?? "";
    let consonant = "";

    switch (l.base) {
      case "א":
      case "ע": {
        const carriesMater = next !== undefined && !vowel && (isHolamMale(next) || isShuruk(next));
        if (last && l.base === "ע") consonant = "";
        else if ((vowel || carriesMater) && i > 0) consonant = "'";
        else if (!vowel && l.base === "ע" && !last && i > 0) consonant = "'";
        break;
      }
      case "ב":
        consonant = l.dagesh ? "b" : "v";
        break;
      case "כ":
        consonant = l.dagesh ? "k" : "kh";
        break;
      case "פ":
        consonant = l.dagesh ? "p" : "f";
        break;
      case "ש":
        consonant = l.sin ? "s" : "sh";
        break;
      case "ה": {
        if (last && !l.dagesh && !vowel) consonant = prevSound === "a" ? "h" : "";
        else consonant = "h";
        break;
      }
      case "ו": {
        const prevHasVowel = prev !== undefined && sound[i - 1] !== null;
        if (isShuruk(l) && (i === 0 || !prevHasVowel)) {
          vowel = "u";
          consonant = "";
        } else if (isHolamMale(l) && i > 0 && !prevHasVowel) {
          vowel = "o";
          consonant = "";
        } else if (l.vowel === null && !l.dagesh && prevHasVowel && next?.base === "א" && i + 1 === n - 1) {
          // הִוא: o vav não se lê (hi).
          consonant = "";
        } else {
          consonant = "v";
        }
        break;
      }
      case "י": {
        const carriesMater = next !== undefined && (isHolamMale(next) || isShuruk(next));
        if (l.vowel === null && !l.dagesh && i > 0 && !carriesMater) {
          const finalVav = next && next.base === "ו" && next.vowel === null && !next.dagesh && i + 1 === n - 1;
          if (finalVav) consonant = "";
          else if (prevSound === "i") consonant = "";
          // י final depois de tsere: "ei" (פְּנֵי penei, מִשְׁלֵי Mishlei).
          else if (prevSound === "e") consonant = last && prev?.vowel === TSERE ? "i" : "";
          else if (prevSound) consonant = "i";
          else consonant = "y";
        } else consonant = "y";
        break;
      }
      default:
        consonant = CONSONANT[l.base] ?? "";
    }

    // Holam escrito na letra junto com outra vogal: o som do holam vem antes.
    if (l.holam && l.vowel !== HOLAM) vowel = `o${vowel}`;

    // Patah furtivo: lê-se antes da gutural final.
    if (last && l.vowel === PATAH && GUTTURAL_FURTIVE.has(l.base) && (l.base !== "ה" || l.dagesh)) {
      piece[i] = vowel + consonant;
      continue;
    }
    piece[i] = consonant + vowel;
  }

  /** Início de cada morfema na saída; -1 quando a primeira letra não soa (כֵּאלֹהִים). */
  /** @type {number[]} */
  const starts = [piece[0] ? 0 : -1];
  let out = "";
  for (let i = 0; i < n; i++) {
    if (morphemeAt.includes(i)) starts.push(piece[i] ? out.length : -1);
    out += piece[i];
  }
  return { out, starts };
}

const PROPER_SEGMENT = /^(?:H|A)?Np/;
/** Nomes de Deus que vão com maiúscula: Elohim, El, Adonai, Shaddai, Elyon. */
const DIVINE_LEMMAS = new Set(["430", "410", "136", "7706", "5945"]);

/** @param {string} s */
function capitalizeAt(s, index) {
  for (let i = index; i < s.length; i++) {
    const ch = s[i];
    if (/[a-z]/.test(ch)) return s.slice(0, i) + ch.toUpperCase() + s.slice(i + 1);
    if (ch !== "'") return s;
  }
  return s;
}

/**
 * Translitera um versículo.
 * @param {import("./oshb.mjs").Word[]} words
 */
export function transliterateVerse(words) {
  let line = "";
  for (const word of words) {
    const segments = word.text.split("/");
    const morphs = word.morph.replace(/^[HA]/, "").split("/");
    const lemmas = word.lemma.split("/");
    const consonants = word.text.replace(/[^א-ת]/g, "");
    const mainMorph = morphs[morphs.length - 1] ?? "";
    let text;

    if (consonants.endsWith("יהוה") && consonants.length - 4 <= 2) {
      // O nome divino: prefixo transliterado + YHWH.
      const prefix = segments.slice(0, -1).join("");
      text = (prefix ? transliterateWord(prefix).out : "") + "YHWH";
    } else {
      const lemmaMain = (lemmas[lemmas.length - 1] ?? "").replace(/[^\d]/g, "");
      const { out, starts } = transliterateWord(word.text, {
        verb: mainMorph.startsWith("V"),
        kol: lemmaMain === "3605" && word.maqaf,
      });
      text = out;
      segments.forEach((_, index) => {
        const morph = morphs[index] ?? "";
        const lemma = (lemmas[index] ?? "").replace(/[^\d]/g, "");
        if (PROPER_SEGMENT.test(morph) || (morph.startsWith("N") && DIVINE_LEMMAS.has(lemma))) {
          const at = starts[index] ?? 0;
          if (at >= 0) text = capitalizeAt(text, at);
        }
      });
    }
    line += text + (word.maqaf ? "-" : " ");
  }
  line = line.trim();
  if (!line) return line;
  return `${line[0].toUpperCase()}${line.slice(1)}.`;
}
