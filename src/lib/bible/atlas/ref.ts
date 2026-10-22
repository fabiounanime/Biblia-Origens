/** Referência que abre o leitor no capítulo (e no versículo, quando há). */
export type Ref = { book: string; chapter: number; verse?: number; label: string };

export function ref(book: string, chapter: number, verse: number | undefined, label: string): Ref {
  return { book, chapter, verse, label };
}
