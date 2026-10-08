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

export type Verse = {
  v: number;
  pt: string;
  he: string;
  tr: string;
};

const NIQUD = /[\u0591-\u05C7]/g;

export function displayHebrew(text: string, niqqud: boolean): string {
  return niqqud ? text : text.replace(NIQUD, "");
}

function isVerse(value: unknown): value is Verse {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.v === "number" &&
    typeof row.pt === "string" &&
    typeof row.he === "string" &&
    typeof row.tr === "string"
  );
}

export async function loadChapter(bookId: string, chapter: number): Promise<Verse[] | null> {
  const response = await fetch(`/content/bible/${bookId}.json`);
  if (!response.ok) return null;
  const data: unknown = await response.json();
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
