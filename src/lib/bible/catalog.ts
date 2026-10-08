export type SectionId = "torah" | "neviim" | "ketuvim";

export type Book = {
  id: string;
  section: SectionId;
  namePt: string;
  nameHe: string;
  nameTranslit: string;
  chapters: number;
};

export const SECTIONS: { id: SectionId; title: string; subtitle: string }[] = [
  { id: "torah", title: "Torá", subtitle: "Instrução" },
  { id: "neviim", title: "Neviim", subtitle: "Profetas" },
  { id: "ketuvim", title: "Ketuvim", subtitle: "Escritos" },
];

export const BOOKS: Book[] = [
  { id: "gn", section: "torah", namePt: "Gênesis", nameHe: "בְּרֵאשִׁית", nameTranslit: "Bereshit", chapters: 50 },
  { id: "ex", section: "torah", namePt: "Êxodo", nameHe: "שְׁמוֹת", nameTranslit: "Shemot", chapters: 40 },
  { id: "lv", section: "torah", namePt: "Levítico", nameHe: "וַיִּקְרָא", nameTranslit: "Vayikra", chapters: 27 },
  { id: "nm", section: "torah", namePt: "Números", nameHe: "בְּמִדְבַּר", nameTranslit: "Bamidbar", chapters: 36 },
  { id: "dt", section: "torah", namePt: "Deuteronômio", nameHe: "דְּבָרִים", nameTranslit: "Devarim", chapters: 34 },
  { id: "js", section: "neviim", namePt: "Josué", nameHe: "יְהוֹשֻׁעַ", nameTranslit: "Yehoshua", chapters: 24 },
  { id: "jz", section: "neviim", namePt: "Juízes", nameHe: "שֹׁפְטִים", nameTranslit: "Shoftim", chapters: 21 },
  { id: "1sm", section: "neviim", namePt: "1 Samuel", nameHe: "שְׁמוּאֵל א", nameTranslit: "Shemuel I", chapters: 31 },
  { id: "2sm", section: "neviim", namePt: "2 Samuel", nameHe: "שְׁמוּאֵל ב", nameTranslit: "Shemuel II", chapters: 24 },
  { id: "1rs", section: "neviim", namePt: "1 Reis", nameHe: "מְלָכִים א", nameTranslit: "Melakhim I", chapters: 22 },
  { id: "2rs", section: "neviim", namePt: "2 Reis", nameHe: "מְלָכִים ב", nameTranslit: "Melakhim II", chapters: 25 },
  { id: "is", section: "neviim", namePt: "Isaías", nameHe: "יְשַׁעְיָהוּ", nameTranslit: "Yeshayahu", chapters: 66 },
  { id: "jr", section: "neviim", namePt: "Jeremias", nameHe: "יִרְמְיָהוּ", nameTranslit: "Yirmeyahu", chapters: 52 },
  { id: "ez", section: "neviim", namePt: "Ezequiel", nameHe: "יְחֶזְקֵאל", nameTranslit: "Yechezkel", chapters: 48 },
  { id: "ho", section: "neviim", namePt: "Oséias", nameHe: "הוֹשֵׁעַ", nameTranslit: "Hoshea", chapters: 14 },
  { id: "jl", section: "neviim", namePt: "Joel", nameHe: "יוֹאֵל", nameTranslit: "Yoel", chapters: 3 },
  { id: "am", section: "neviim", namePt: "Amós", nameHe: "עָמוֹס", nameTranslit: "Amos", chapters: 9 },
  { id: "ob", section: "neviim", namePt: "Obadias", nameHe: "עֹבַדְיָה", nameTranslit: "Ovadyah", chapters: 1 },
  { id: "jn", section: "neviim", namePt: "Jonas", nameHe: "יוֹנָה", nameTranslit: "Yonah", chapters: 4 },
  { id: "mi", section: "neviim", namePt: "Miquéias", nameHe: "מִיכָה", nameTranslit: "Mikhah", chapters: 7 },
  { id: "na", section: "neviim", namePt: "Naum", nameHe: "נַחוּם", nameTranslit: "Nachum", chapters: 3 },
  { id: "hb", section: "neviim", namePt: "Habacuque", nameHe: "חֲבַקּוּק", nameTranslit: "Chavakuk", chapters: 3 },
  { id: "zp", section: "neviim", namePt: "Sofonias", nameHe: "צְפַנְיָה", nameTranslit: "Tsefanyah", chapters: 3 },
  { id: "hg", section: "neviim", namePt: "Ageu", nameHe: "חַגַּי", nameTranslit: "Chaggai", chapters: 2 },
  { id: "zc", section: "neviim", namePt: "Zacarias", nameHe: "זְכַרְיָה", nameTranslit: "Zekharyah", chapters: 14 },
  { id: "ml", section: "neviim", namePt: "Malaquias", nameHe: "מַלְאָכִי", nameTranslit: "Malakhi", chapters: 3 },
  { id: "ps", section: "ketuvim", namePt: "Salmos", nameHe: "תְּהִלִּים", nameTranslit: "Tehillim", chapters: 150 },
  { id: "pv", section: "ketuvim", namePt: "Provérbios", nameHe: "מִשְׁלֵי", nameTranslit: "Mishlei", chapters: 31 },
  { id: "job", section: "ketuvim", namePt: "Jó", nameHe: "אִיּוֹב", nameTranslit: "Iyov", chapters: 42 },
  { id: "ss", section: "ketuvim", namePt: "Cântico", nameHe: "שִׁיר הַשִּׁירִים", nameTranslit: "Shir HaShirim", chapters: 8 },
  { id: "rt", section: "ketuvim", namePt: "Rute", nameHe: "רוּת", nameTranslit: "Rut", chapters: 4 },
  { id: "lm", section: "ketuvim", namePt: "Lamentações", nameHe: "אֵיכָה", nameTranslit: "Eikhah", chapters: 5 },
  { id: "ec", section: "ketuvim", namePt: "Eclesiastes", nameHe: "קֹהֶלֶת", nameTranslit: "Kohelet", chapters: 12 },
  { id: "et", section: "ketuvim", namePt: "Ester", nameHe: "אֶסְתֵּר", nameTranslit: "Ester", chapters: 10 },
  { id: "dn", section: "ketuvim", namePt: "Daniel", nameHe: "דָּנִיֵּאל", nameTranslit: "Daniel", chapters: 12 },
  { id: "er", section: "ketuvim", namePt: "Esdras", nameHe: "עֶזְרָא", nameTranslit: "Ezra", chapters: 10 },
  { id: "ne", section: "ketuvim", namePt: "Neemias", nameHe: "נְחֶמְיָה", nameTranslit: "Nechemyah", chapters: 13 },
  { id: "1ch", section: "ketuvim", namePt: "1 Crônicas", nameHe: "דִּבְרֵי הַיָּמִים א", nameTranslit: "Divrei HaYamim I", chapters: 29 },
  { id: "2ch", section: "ketuvim", namePt: "2 Crônicas", nameHe: "דִּבְרֵי הַיָּמִים ב", nameTranslit: "Divrei HaYamim II", chapters: 36 },
];

export const BOOK_IDS = new Set(BOOKS.map((book) => book.id));

export function bookById(id: string): Book | undefined {
  return BOOKS.find((book) => book.id === id);
}
