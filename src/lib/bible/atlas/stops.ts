import { ref, type Ref } from "./ref.ts";

export type RoleId = "patriarcas" | "lideres" | "profetas" | "sacerdotes" | "jesus" | "apostolos";

export type Stop = { placeId: string; ref: Ref; note?: string };

export type Journey = {
  id: string;
  role: RoleId;
  person: string;
  title: string;
  summary: string;
  stops: Stop[];
};

export const s = (placeId: string, book: string, chapter: number, verse: number, label: string, note?: string): Stop => ({
  placeId,
  ref: ref(book, chapter, verse, label),
  note,
});
