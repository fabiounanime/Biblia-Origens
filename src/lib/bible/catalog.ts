export type SectionId = "torah" | "neviim" | "ketuvim" | "brit";

/** Idioma do texto original: hebraico (Antigo Testamento) ou grego (Novo). */
export type OriginalLang = "he" | "gr";

export type Book = {
  id: string;
  section: SectionId;
  namePt: string;
  /** Nome no idioma original (hebraico no AT, grego no NT). */
  nameHe: string;
  nameTranslit: string;
  chapters: number;
};

export type Section = { id: SectionId; title: string; subtitle: string; nameHe: string; lang: OriginalLang };

export const SECTIONS: Section[] = [
  { id: "torah", title: "Torá", subtitle: "Instrução", nameHe: "תּוֹרָה", lang: "he" },
  { id: "neviim", title: "Neviim", subtitle: "Profetas", nameHe: "נְבִיאִים", lang: "he" },
  { id: "ketuvim", title: "Ketuvim", subtitle: "Escritos", nameHe: "כְּתוּבִים", lang: "he" },
  { id: "brit", title: "Novo Testamento", subtitle: "Evangelhos e cartas", nameHe: "Καινὴ Διαθήκη", lang: "gr" },
];

/** Como mostrar o texto original de cada idioma. */
export const ORIGINAL: Record<
  OriginalLang,
  { lang: string; dir: "rtl" | "ltr"; font: string; read: string; label: string; short: string; from: string }
> = {
  he: { lang: "he", dir: "rtl", font: "he", read: "read-he", label: "Hebraico", short: "HE", from: "do hebraico" },
  gr: { lang: "grc", dir: "ltr", font: "gr", read: "read-gr", label: "Grego", short: "GR", from: "do grego" },
};

export function bookLang(book: Book): OriginalLang {
  return book.section === "brit" ? "gr" : "he";
}

/** Atributos de um texto no idioma original: classe da fonte, lang e direção. */
export function originalProps(lang: OriginalLang, className = "") {
  const style = ORIGINAL[lang];
  return { className: `${style.font} ${className}`.trim(), lang: style.lang, dir: style.dir };
}

/**
 * Cor de cada parte da Bíblia. Classes literais para o Tailwind encontrar.
 * Torá = zahav (ouro), Neviim = tekhelet (azul), Ketuvim = argaman (púrpura),
 * Novo Testamento = shani (escarlate), as quatro cores do Tabernáculo.
 */
export const SECTION_TONE: Record<
  SectionId,
  { text: string; dot: string; soft: string; border: string; bar: string }
> = {
  torah: {
    text: "text-zahav",
    dot: "bg-zahav",
    soft: "bg-zahav/12",
    border: "border-zahav/35",
    bar: "from-zahav/30",
  },
  neviim: {
    text: "text-tekhelet",
    dot: "bg-tekhelet",
    soft: "bg-tekhelet/12",
    border: "border-tekhelet/35",
    bar: "from-tekhelet/30",
  },
  ketuvim: {
    text: "text-argaman",
    dot: "bg-argaman",
    soft: "bg-argaman/12",
    border: "border-argaman/35",
    bar: "from-argaman/30",
  },
  brit: {
    text: "text-shani",
    dot: "bg-shani",
    soft: "bg-shani/12",
    border: "border-shani/35",
    bar: "from-shani/30",
  },
};

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
  { id: "jl", section: "neviim", namePt: "Joel", nameHe: "יוֹאֵל", nameTranslit: "Yoel", chapters: 4 },
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
  { id: "mt", section: "brit", namePt: "Mateus", nameHe: "Κατὰ Μαθθαῖον", nameTranslit: "Kata Maththaion", chapters: 28 },
  { id: "mc", section: "brit", namePt: "Marcos", nameHe: "Κατὰ Μᾶρκον", nameTranslit: "Kata Markon", chapters: 16 },
  { id: "lc", section: "brit", namePt: "Lucas", nameHe: "Κατὰ Λουκᾶν", nameTranslit: "Kata Loukan", chapters: 24 },
  { id: "jo", section: "brit", namePt: "João", nameHe: "Κατὰ Ἰωάννην", nameTranslit: "Kata Ioannen", chapters: 21 },
  { id: "at", section: "brit", namePt: "Atos", nameHe: "Πράξεις", nameTranslit: "Praxeis", chapters: 28 },
  { id: "rm", section: "brit", namePt: "Romanos", nameHe: "Πρὸς Ῥωμαίους", nameTranslit: "Pros Rhomaious", chapters: 16 },
  { id: "1co", section: "brit", namePt: "1 Coríntios", nameHe: "Πρὸς Κορινθίους Α", nameTranslit: "Pros Korinthious A", chapters: 16 },
  { id: "2co", section: "brit", namePt: "2 Coríntios", nameHe: "Πρὸς Κορινθίους Β", nameTranslit: "Pros Korinthious B", chapters: 13 },
  { id: "gl", section: "brit", namePt: "Gálatas", nameHe: "Πρὸς Γαλάτας", nameTranslit: "Pros Galatas", chapters: 6 },
  { id: "ef", section: "brit", namePt: "Efésios", nameHe: "Πρὸς Ἐφεσίους", nameTranslit: "Pros Ephesious", chapters: 6 },
  { id: "fp", section: "brit", namePt: "Filipenses", nameHe: "Πρὸς Φιλιππησίους", nameTranslit: "Pros Philippesious", chapters: 4 },
  { id: "cl", section: "brit", namePt: "Colossenses", nameHe: "Πρὸς Κολοσσαεῖς", nameTranslit: "Pros Kolossaeis", chapters: 4 },
  { id: "1ts", section: "brit", namePt: "1 Tessalonicenses", nameHe: "Πρὸς Θεσσαλονικεῖς Α", nameTranslit: "Pros Thessalonikeis A", chapters: 5 },
  { id: "2ts", section: "brit", namePt: "2 Tessalonicenses", nameHe: "Πρὸς Θεσσαλονικεῖς Β", nameTranslit: "Pros Thessalonikeis B", chapters: 3 },
  { id: "1tm", section: "brit", namePt: "1 Timóteo", nameHe: "Πρὸς Τιμόθεον Α", nameTranslit: "Pros Timotheon A", chapters: 6 },
  { id: "2tm", section: "brit", namePt: "2 Timóteo", nameHe: "Πρὸς Τιμόθεον Β", nameTranslit: "Pros Timotheon B", chapters: 4 },
  { id: "tt", section: "brit", namePt: "Tito", nameHe: "Πρὸς Τίτον", nameTranslit: "Pros Titon", chapters: 3 },
  { id: "fm", section: "brit", namePt: "Filemom", nameHe: "Πρὸς Φιλήμονα", nameTranslit: "Pros Philemona", chapters: 1 },
  { id: "heb", section: "brit", namePt: "Hebreus", nameHe: "Πρὸς Ἑβραίους", nameTranslit: "Pros Hebraious", chapters: 13 },
  { id: "tg", section: "brit", namePt: "Tiago", nameHe: "Ἰακώβου", nameTranslit: "Iakobou", chapters: 5 },
  { id: "1pe", section: "brit", namePt: "1 Pedro", nameHe: "Πέτρου Α", nameTranslit: "Petrou A", chapters: 5 },
  { id: "2pe", section: "brit", namePt: "2 Pedro", nameHe: "Πέτρου Β", nameTranslit: "Petrou B", chapters: 3 },
  { id: "1jo", section: "brit", namePt: "1 João", nameHe: "Ἰωάννου Α", nameTranslit: "Ioannou A", chapters: 5 },
  { id: "2jo", section: "brit", namePt: "2 João", nameHe: "Ἰωάννου Β", nameTranslit: "Ioannou B", chapters: 1 },
  { id: "3jo", section: "brit", namePt: "3 João", nameHe: "Ἰωάννου Γ", nameTranslit: "Ioannou G", chapters: 1 },
  { id: "jd", section: "brit", namePt: "Judas", nameHe: "Ἰούδα", nameTranslit: "Iouda", chapters: 1 },
  { id: "ap", section: "brit", namePt: "Apocalipse", nameHe: "Ἀποκάλυψις Ἰωάννου", nameTranslit: "Apokalypsis Ioannou", chapters: 22 },
];

export const BOOK_IDS = new Set(BOOKS.map((book) => book.id));

export function bookById(id: string): Book | undefined {
  return BOOKS.find((book) => book.id === id);
}

/** Abreviações usuais nas bíblias em português (os ids são internos e às vezes em inglês). */
const ABBR: Record<string, string> = {
  gn: "Gn", ex: "Êx", lv: "Lv", nm: "Nm", dt: "Dt",
  js: "Js", jz: "Jz", "1sm": "1Sm", "2sm": "2Sm", "1rs": "1Rs", "2rs": "2Rs", is: "Is", jr: "Jr", ez: "Ez",
  ho: "Os", jl: "Jl", am: "Am", ob: "Ob", jn: "Jn", mi: "Mq", na: "Na", hb: "Hc", zp: "Sf", hg: "Ag", zc: "Zc", ml: "Ml",
  ps: "Sl", pv: "Pv", job: "Jó", ss: "Ct", rt: "Rt", lm: "Lm", ec: "Ec", et: "Et", dn: "Dn", er: "Ed", ne: "Ne",
  "1ch": "1Cr", "2ch": "2Cr",
  mt: "Mt", mc: "Mc", lc: "Lc", jo: "Jo", at: "At", rm: "Rm", "1co": "1Co", "2co": "2Co", gl: "Gl", ef: "Ef",
  fp: "Fp", cl: "Cl", "1ts": "1Ts", "2ts": "2Ts", "1tm": "1Tm", "2tm": "2Tm", tt: "Tt", fm: "Fm", heb: "Hb",
  tg: "Tg", "1pe": "1Pe", "2pe": "2Pe", "1jo": "1Jo", "2jo": "2Jo", "3jo": "3Jo", jd: "Jd", ap: "Ap",
};

/** Referência curta para mostrar, como "Gn 12:4" ou "Sl 23". */
export function bookRef(bookId: string, chapter: number, verse?: number): string {
  const abbr = ABBR[bookId] ?? bookId;
  return `${abbr} ${chapter}${verse && verse > 0 ? `:${verse}` : ""}`;
}

/**
 * Lê uma referência digitada ("Gn 12:3", "salmos 23", "1 Samuel") e devolve o
 * livro, o capítulo e o versículo. Aceita a abreviação, o nome em português ou
 * o transliterado, sem acento e sem caixa.
 */
export function parseRef(query: string): { book: Book; chapter?: number; verse?: number } | null {
  const match = foldText(query).match(/^(\d?\s*[a-z][a-z' ]*?)\s*(\d+)?(?:\s*[:.,]\s*(\d+))?$/);
  if (!match) return null;
  const name = match[1].replace(/\s+/g, "");
  const byAbbr = BOOKS.find((book) => foldText(ABBR[book.id] ?? "") === name);
  const book =
    byAbbr ??
    BOOKS.find((book) => foldText(book.namePt).replace(/\s+/g, "").startsWith(name)) ??
    BOOKS.find((book) => foldText(book.nameTranslit).replace(/\s+/g, "").startsWith(name));
  if (!book) return null;
  const chapter = match[2] ? Math.min(Number(match[2]), book.chapters) : undefined;
  const verse = match[3] ? Number(match[3]) : undefined;
  return { book, chapter, verse };
}

export function sectionById(id: SectionId): Section {
  return SECTIONS.find((section) => section.id === id) ?? SECTIONS[0]!;
}

export function isSectionId(value: unknown): value is SectionId {
  return value === "torah" || value === "neviim" || value === "ketuvim" || value === "brit";
}

export type ChapterRef = { book: Book; chapter: number };

/** Capítulo vizinho, atravessando a fronteira entre livros na ordem do cânon. */
export function neighborChapter(bookId: string, chapter: number, step: 1 | -1): ChapterRef | null {
  const index = BOOKS.findIndex((book) => book.id === bookId);
  const book = BOOKS[index];
  if (!book) return null;
  const target = chapter + step;
  if (target >= 1 && target <= book.chapters) return { book, chapter: target };
  const other = BOOKS[index + step];
  if (!other) return null;
  return { book: other, chapter: step === 1 ? 1 : other.chapters };
}

/** Busca sem acento e sem caixa: "genesis" encontra "Gênesis". */
export function foldText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
