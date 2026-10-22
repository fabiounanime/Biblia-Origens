import { useEffect, useState } from "react";
import { neighborChapter, type ChapterRef } from "@/lib/bible/catalog";
import { loadIndex, type AcervoIndex } from "@/lib/bible/corpus";

/**
 * Índice do acervo (livros já publicados), para mostrar o andamento da tradução.
 * "loading" enquanto o `indice.json` chega; null se ele não pôde ser lido.
 */
export function useAcervoIndex(): AcervoIndex | null | "loading" {
  const [index, setIndex] = useState<AcervoIndex | null | "loading">("loading");
  useEffect(() => {
    let cancel = false;
    void loadIndex()
      .catch(() => null)
      .then((rows) => {
        if (!cancel) setIndex(rows);
      });
    return () => {
      cancel = true;
    };
  }, []);
  return index;
}

/** O livro já tem texto? Sem índice (carregando ou falhou), trata como publicado. */
export function isPublished(index: AcervoIndex | null | "loading", bookId: string): boolean {
  if (index === "loading" || index === null) return true;
  return Boolean(index[bookId]);
}

/**
 * O capítulo já foi publicado? O build só publica capítulos inteiros, em ordem,
 * então basta comparar com a contagem do índice. Sem índice, trata como publicado.
 */
export function isChapterPublished(
  index: AcervoIndex | null | "loading",
  bookId: string,
  chapter: number,
): boolean {
  if (index === "loading" || index === null) return true;
  const row = index[bookId];
  return Boolean(row && chapter <= row.capitulos);
}

/** Capítulo publicado mais próximo nesta direção (atravessando livros), ou null. */
export function publishedNeighbor(
  index: AcervoIndex | null | "loading",
  bookId: string,
  chapter: number,
  step: 1 | -1,
): ChapterRef | null {
  let ref = neighborChapter(bookId, chapter, step);
  while (ref && !isChapterPublished(index, ref.book.id, ref.chapter)) {
    ref = neighborChapter(ref.book.id, ref.chapter, step);
  }
  return ref;
}
