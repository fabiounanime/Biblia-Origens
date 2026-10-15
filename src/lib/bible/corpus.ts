/**
 * Contrato do acervo (Grok Expert). Um JSON por livro em
 * `public/content/bible/{bookId}.json`:
 *
 * {
 *   "bookId": "gn",
 *   "chapters": [
 *     { "n": 1, "verses": [
 *       { "v": 1, "pt": "…", "he": "…", "tr": "…" }
 *     ] }
 *   ]
 * }
 *
 * Ordem de leitura na tela: pt, he, tr. Este módulo não inventa versículos.
 */

/** Nota do tradutor: `at` é a posição no texto em português logo depois do trecho comentado. */
export type TranslatorNote = { at: number; t: string };

export type Verse = {
  v: number;
  pt: string;
  he: string;
  tr: string;
  n?: TranslatorNote[];
};

/** Nota com o versículo e a letra da chamada (a, b, c… z, aa, ab…), contada por capítulo. */
export type LetteredNote = TranslatorNote & { verse: number; letter: string };

function noteLetter(index: number): string {
  let n = index;
  let out = "";
  do {
    out = String.fromCharCode(97 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

export function chapterNotes(verses: Verse[]): LetteredNote[] {
  const out: LetteredNote[] = [];
  for (const verse of verses) {
    for (const note of verse.n ?? []) out.push({ ...note, verse: verse.v, letter: noteLetter(out.length) });
  }
  return out;
}

/** Sinais vocálicos e de cantilação; o maqaf (U+05BE), que liga palavras, fica. */
const NIQUD = /[\u0591-\u05BD\u05BF-\u05C7]/g;

export function displayHebrew(text: string, niqqud: boolean): string {
  return niqqud ? text : text.replace(NIQUD, "");
}

function isNote(value: unknown): value is TranslatorNote {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.at === "number" && typeof row.t === "string";
}

function isVerse(value: unknown): value is Verse {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.v === "number" &&
    typeof row.pt === "string" &&
    typeof row.he === "string" &&
    typeof row.tr === "string" &&
    (row.n === undefined || (Array.isArray(row.n) && row.n.every(isNote)))
  );
}

/** Um livro inteiro vem num arquivo; guarda-se na memória para trocar de capítulo sem baixar de novo. */
const books = new Map<string, Promise<unknown>>();

function loadBook(bookId: string): Promise<unknown> {
  const cached = books.get(bookId);
  if (cached) return cached;
  const request = fetch(`/content/bible/${bookId}.json`).then((response) => (response.ok ? response.json() : null));
  books.set(bookId, request);
  // Falha de rede não fica guardada: a próxima abertura tenta outra vez.
  request.catch(() => books.delete(bookId));
  return request;
}

export async function loadChapter(bookId: string, chapter: number): Promise<Verse[] | null> {
  const data: unknown = await loadBook(bookId);
  if (!data || typeof data !== "object") return null;
  const chapters = (data as { chapters?: unknown }).chapters;
  if (!Array.isArray(chapters)) return null;
  const found = chapters.find(
    (item) => !!item && typeof item === "object" && (item as { n?: unknown }).n === chapter,
  );
  if (!found || typeof found !== "object") return [];
  const verses = (found as { verses?: unknown }).verses;
  if (!Array.isArray(verses)) return [];
  return verses.filter(isVerse).sort((a, b) => a.v - b.v);
}

/** Uma palavra hebraica explicada: significado, gramática, forma de dicionário e outros sentidos. */
export type WordInfo = { g: string; m: string; l: string; o?: string };

/** Separa uma linha em palavras e separadores (espaço, maqaf ou hífen), na ordem. */
export function splitWords(text: string, layer: "he" | "tr"): string[] {
  return text.split(layer === "he" ? /([ \u05BE])/ : /([ -])/);
}

const wordFiles = new Map<string, Promise<WordInfo[][] | null>>();

function isWordRow(value: unknown): value is [string, string, string, string?] {
  return (
    Array.isArray(value) &&
    value.length >= 3 &&
    typeof value[0] === "string" &&
    typeof value[1] === "string" &&
    typeof value[2] === "string" &&
    (value[3] === undefined || typeof value[3] === "string")
  );
}

/** Significado de cada palavra de um capítulo: um arquivo pequeno, baixado na primeira vez. */
export function loadWords(bookId: string, chapter: number): Promise<WordInfo[][] | null> {
  const key = `${bookId}/${chapter}`;
  const cached = wordFiles.get(key);
  if (cached) return cached;
  const request = fetch(`/content/bible/palavras/${bookId}/${chapter}.json`)
    .then((response) => (response.ok ? response.json() : null))
    .then((data: unknown) => {
      if (!Array.isArray(data)) return null;
      return data.map((verse: unknown) =>
        Array.isArray(verse)
          ? verse.filter(isWordRow).map(([g, m, l, o]) => ({ g, m, l, ...(o ? { o } : {}) }))
          : [],
      );
    });
  wordFiles.set(key, request);
  request.catch(() => wordFiles.delete(key));
  return request;
}
