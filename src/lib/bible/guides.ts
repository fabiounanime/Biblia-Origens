export type Guide = {
  id: string;
  title: string;
  kicker: string;
  placeId: string | null;
  bookId: string;
  chapter: number;
};

/** Estrutura dos guias. O texto de estudo entra com o acervo, não aqui. */
export const GUIDES: Guide[] = [
  { id: "criacao", title: "Criação", kicker: "Torá", placeId: null, bookId: "gn", chapter: 1 },
  { id: "alianca", title: "A aliança", kicker: "Torá", placeId: "ur", bookId: "gn", chapter: 12 },
  { id: "exodo", title: "O êxodo", kicker: "Torá", placeId: "egito", bookId: "ex", chapter: 14 },
  { id: "sinai", title: "O Sinai", kicker: "Torá", placeId: "sinai", bookId: "ex", chapter: 19 },
  { id: "terra", title: "A terra", kicker: "Neviim", placeId: "jerico", bookId: "js", chapter: 1 },
  { id: "exilio", title: "O exílio", kicker: "Neviim", placeId: "babilonia", bookId: "2rs", chapter: 25 },
  { id: "retorno", title: "O retorno", kicker: "Ketuvim", placeId: "jerusalen", bookId: "er", chapter: 1 },
];

export const GUIDE_IDS = new Set(GUIDES.map((guide) => guide.id));

export function guideById(id: string): Guide | undefined {
  return GUIDES.find((guide) => guide.id === id);
}
