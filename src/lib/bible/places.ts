export type Place = {
  id: string;
  namePt: string;
  nameHe: string;
  nameTranslit: string;
  region: string;
  x: number;
  y: number;
};

/** Posições em porcentagem sobre o mapa esquemático (não é levantamento geodésico). */
export const PLACES: Place[] = [
  { id: "egito", namePt: "Egito", nameHe: "מִצְרַיִם", nameTranslit: "Mitsrayim", region: "Vale do Nilo", x: 16, y: 84 },
  { id: "sinai", namePt: "Sinai", nameHe: "סִינַי", nameTranslit: "Sinai", region: "Península", x: 27, y: 70 },
  { id: "samaria", namePt: "Samaria", nameHe: "שֹׁמְרוֹן", nameTranslit: "Shomron", region: "Levante", x: 37, y: 43 },
  { id: "jerusalen", namePt: "Jerusalém", nameHe: "יְרוּשָׁלַיִם", nameTranslit: "Yerushalayim", region: "Judá", x: 39, y: 51 },
  { id: "jerico", namePt: "Jericó", nameHe: "יְרִיחוֹ", nameTranslit: "Yeriho", region: "Vale do Jordão", x: 43, y: 55 },
  { id: "berseba", namePt: "Berseba", nameHe: "בְּאֵר שֶׁבַע", nameTranslit: "Beer Sheva", region: "Neguev", x: 35, y: 62 },
  { id: "damasco", namePt: "Damasco", nameHe: "דַּמֶּשֶׂק", nameTranslit: "Damesek", region: "Aram", x: 48, y: 31 },
  { id: "hara", namePt: "Harã", nameHe: "חָרָן", nameTranslit: "Haran", region: "Norte da Mesopotâmia", x: 55, y: 24 },
  { id: "ninive", namePt: "Nínive", nameHe: "נִינְוֵה", nameTranslit: "Ninveh", region: "Assíria", x: 64, y: 27 },
  { id: "babilonia", namePt: "Babilônia", nameHe: "בָּבֶל", nameTranslit: "Bavel", region: "Mesopotâmia", x: 70, y: 58 },
  { id: "ur", namePt: "Ur", nameHe: "אוּר", nameTranslit: "Ur", region: "Caldeia", x: 79, y: 73 },
];

export function placeById(id: string): Place | undefined {
  return PLACES.find((place) => place.id === id);
}
