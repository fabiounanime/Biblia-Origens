/**
 * Lugares do atlas. Coordenadas da base Bible Geocoding da OpenBible.info
 * (CC BY 4.0, https://www.openbible.info/geo/), com a certeza de cada
 * identificação; poucos pontos marcados como tradicionais são fixos aqui.
 */
export type Certainty = "alta" | "provável" | "incerta" | "tradicional" | "desconhecida";

export type Place = {
  id: string;
  namePt: string;
  region: string;
  /** Como o lugar (ou o sítio arqueológico) se chama hoje, com o país. */
  modern?: string;
  nameHe?: string;
  nameTranslit?: string;
  lon: number;
  lat: number;
  certainty: Certainty;
  /** Por que o ponto é aproximado, quando é. */
  note?: string;
};

export const PLACES: Place[] = [
  { id: "eden", namePt: "Éden", region: "Mesopotâmia (tradição)", nameHe: "עֵדֶן", lon: 44.45, lat: 31.0, certainty: "desconhecida", note: "Gênesis cita o Tigre e o Eufrates (Gn 2:14)" },
  { id: "ararat", namePt: "Montes de Ararate", region: "Urartu (Armênia)", modern: "Monte Ararat (Ağrı Dağı), Turquia", nameHe: "אֲרָרָט", lon: 44.3004, lat: 39.7028, certainty: "alta", note: "região, não um pico: \"sobre os montes de Ararate\" (Gn 8:4)" },
  { id: "babilonia", namePt: "Babilônia (Babel)", region: "Mesopotâmia", modern: "Babil, perto de Hila, Iraque", nameHe: "בָּבֶל", nameTranslit: "Bavel", lon: 44.4222, lat: 32.5433, certainty: "alta" },
  { id: "ur", namePt: "Ur dos caldeus", region: "Caldeia", modern: "Tell el-Muqayyar, perto de Nassíria, Iraque", nameHe: "אוּר", nameTranslit: "Ur", lon: 46.1044, lat: 30.9622, certainty: "provável" },
  { id: "hara", namePt: "Harã", region: "Norte da Mesopotâmia", modern: "Harran, Turquia", nameHe: "חָרָן", nameTranslit: "Haran", lon: 39.0328, lat: 36.8644, certainty: "alta" },
  { id: "siquem", namePt: "Siquém", region: "Samaria", modern: "Tell Balata, em Nablus, Cisjordânia", nameHe: "שְׁכֶם", lon: 35.2819, lat: 32.2136, certainty: "alta" },
  { id: "betel", namePt: "Betel", region: "Benjamim", modern: "Beitin, Cisjordânia", nameHe: "בֵּית־אֵל", lon: 35.2414, lat: 31.9228, certainty: "provável" },
  { id: "ai", namePt: "Ai", region: "Benjamim", modern: "Et-Tell, Cisjordânia", nameHe: "הָעַי", lon: 35.2611, lat: 31.9169, certainty: "provável" },
  { id: "egito", namePt: "Egito", region: "Vale do Nilo", modern: "Egito (Misr, em árabe)", nameHe: "מִצְרַיִם", nameTranslit: "Mitsrayim", lon: 31.3075, lat: 30.1294, certainty: "alta", note: "ponto de referência no sul do delta" },
  { id: "manre", namePt: "Manre", region: "Judá", modern: "Ramet el-Khalil, perto de Hebron, Cisjordânia", nameHe: "מַמְרֵא", lon: 35.1053, lat: 31.5565, certainty: "provável" },
  { id: "hebrom", namePt: "Hebrom", region: "Judá", modern: "Hebron (Al-Khalil), Cisjordânia", nameHe: "חֶבְרוֹן", lon: 35.1022, lat: 31.5251, certainty: "alta" },
  { id: "berseba", namePt: "Berseba", region: "Neguev", modern: "Tel Sheva, perto de Be'er Sheva, Israel", nameHe: "בְּאֵר שֶׁבַע", nameTranslit: "Beer Sheva", lon: 34.8408, lat: 31.2447, certainty: "alta" },
  { id: "gerar", namePt: "Gerar", region: "Neguev ocidental", modern: "Tel Haror, Israel", nameHe: "גְּרָר", lon: 34.6065, lat: 31.3821, certainty: "provável" },
  { id: "moria", namePt: "Monte Moriá", region: "Jerusalém", modern: "Monte do Templo (Esplanada das Mesquitas), Jerusalém", nameHe: "הַמֹּרִיָּה", lon: 35.2356, lat: 31.7778, certainty: "incerta", note: "tradição o liga ao monte do templo (2Cr 3:1)" },
  { id: "penuel", namePt: "Penuel", region: "Gileade", modern: "Tulul edh-Dhahab, Jordânia", nameHe: "פְּנוּאֵל", lon: 35.6921, lat: 32.187, certainty: "provável" },
  { id: "jaboque", namePt: "Rio Jaboque", region: "Gileade", modern: "Rio Zarqa, Jordânia", nameHe: "יַבֹּק", lon: 35.5431, lat: 32.1153, certainty: "alta" },
  { id: "sucote", namePt: "Sucote", region: "Vale do Jordão", modern: "Tell Deir Alla, Jordânia", nameHe: "סֻכֹּת", lon: 35.6212, lat: 32.1966, certainty: "provável" },
  { id: "dota", namePt: "Dotã", region: "Samaria", modern: "Tell Dothan, perto de Jenin, Cisjordânia", nameHe: "דֹּתָן", lon: 35.2399, lat: 32.4135, certainty: "alta" },
  { id: "gosen", namePt: "Gósen", region: "Delta do Nilo", modern: "Província de Sharqia, Egito", nameHe: "גֹּשֶׁן", lon: 31.95, lat: 30.6, certainty: "provável", note: "região no leste do delta; o ponto marca o meio dela" },
  { id: "ramesses", namePt: "Ramessés", region: "Delta do Nilo", modern: "Qantir, Egito", nameHe: "רַעְמְסֵס", lon: 31.8342, lat: 30.7994, certainty: "provável" },
  { id: "sucote-egito", namePt: "Sucote (Egito)", region: "Delta do Nilo", modern: "Tell el-Maskhuta, Egito", nameHe: "סֻכֹּת", lon: 32.099, lat: 30.5527, certainty: "incerta" },
  { id: "eta", namePt: "Etã", region: "Borda do deserto", modern: "Wadi Tumilat, Egito", nameHe: "אֵתָם", lon: 31.9636, lat: 30.5475, certainty: "incerta" },
  { id: "pi-hairote", namePt: "Pi-Hairote", region: "Junto ao mar", modern: "Perto de Tell Defenna, Egito", nameHe: "פִּי הַחִירֹת", lon: 32.1714, lat: 30.8606, certainty: "incerta" },
  { id: "mar-vermelho", namePt: "Travessia do mar", region: "Golfo de Suez (hipótese)", modern: "Golfo de Suez, perto de Suez, Egito", nameHe: "יַם־סוּף", lon: 32.55, lat: 30.0, certainty: "incerta", note: "o lugar da travessia é debatido" },
  { id: "mara", namePt: "Mara", region: "Deserto de Sur", modern: "Ain Hawara, Sinai (Egito)", nameHe: "מָרָה", lon: 32.9428, lat: 29.346, certainty: "incerta" },
  { id: "elim", namePt: "Elim", region: "Península do Sinai", modern: "Wadi Gharandal, Sinai (Egito)", nameHe: "אֵילִם", lon: 32.9158, lat: 29.2547, certainty: "provável" },
  { id: "refidim", namePt: "Refidim", region: "Península do Sinai", modern: "Sul do Sinai, Egito", nameHe: "רְפִידִים", lon: 33.8803, lat: 28.6231, certainty: "incerta" },
  { id: "sinai", namePt: "Monte Sinai (Horebe)", region: "Península do Sinai", modern: "Jebel Musa, Sinai (Egito)", nameHe: "סִינַי", nameTranslit: "Sinai", lon: 33.9733, lat: 28.5397, certainty: "incerta", note: "tradição: Jebel Musa" },
  { id: "midia", namePt: "Midiã", region: "Arábia", modern: "Al-Bad', Arábia Saudita", nameHe: "מִדְיָן", lon: 35.0122, lat: 28.4947, certainty: "alta" },
  { id: "cades", namePt: "Cades-Barneia", region: "Deserto de Zim", modern: "Tell el-Qudeirat, Sinai (Egito)", nameHe: "קָדֵשׁ בַּרְנֵעַ", lon: 34.4222, lat: 30.6483, certainty: "alta" },
  { id: "monte-hor", namePt: "Monte Hor", region: "Fronteira de Edom", nameHe: "הֹר הָהָר", lon: 35.0569, lat: 30.8321, certainty: "incerta" },
  { id: "nebo", namePt: "Monte Nebo", region: "Moabe", modern: "Monte Nebo (Jabal Nibu), Jordânia", nameHe: "נְבוֹ", lon: 35.75, lat: 31.7667, certainty: "incerta" },
  { id: "jordao", namePt: "Rio Jordão", region: "Vale do Jordão", modern: "Rio Jordão, divisa da Jordânia com a Cisjordânia", nameHe: "הַיַּרְדֵּן", lon: 35.5583, lat: 31.7614, certainty: "alta", note: "ponto da travessia, em frente a Jericó" },
  { id: "gilgal", namePt: "Gilgal", region: "Vale do Jordão", modern: "Perto de Jericó, Cisjordânia", nameHe: "הַגִּלְגָּל", lon: 35.46, lat: 31.8819, certainty: "provável" },
  { id: "jerico", namePt: "Jericó", region: "Vale do Jordão", modern: "Tell es-Sultan, em Jericó, Cisjordânia", nameHe: "יְרִיחוֹ", nameTranslit: "Yeriho", lon: 35.4446, lat: 31.8717, certainty: "alta" },
  { id: "silo", namePt: "Siló", region: "Efraim", modern: "Khirbet Seilun (Tel Shiloh), Cisjordânia", nameHe: "שִׁילֹה", lon: 35.2895, lat: 32.0557, certainty: "alta" },
  { id: "gibeom", namePt: "Gibeom", region: "Benjamim", modern: "Al-Jib, Cisjordânia", nameHe: "גִּבְעוֹן", lon: 35.1834, lat: 31.8475, certainty: "alta" },
  { id: "hazor", namePt: "Hazor", region: "Galileia", modern: "Tel Hazor, Israel", nameHe: "חָצוֹר", lon: 35.5692, lat: 33.0183, certainty: "alta" },
  { id: "belem", namePt: "Belém", region: "Judá", modern: "Belém, Cisjordânia", nameHe: "בֵּית לֶחֶם", lon: 35.2076, lat: 31.7043, certainty: "alta" },
  { id: "moabe", namePt: "Moabe", region: "Leste do mar Morto", modern: "Região de Karak, Jordânia", nameHe: "מוֹאָב", lon: 35.7014, lat: 31.1806, certainty: "alta" },
  { id: "gibea", namePt: "Gibeá", region: "Benjamim", modern: "Tell el-Ful, norte de Jerusalém", nameHe: "גִּבְעָה", lon: 35.2307, lat: 31.8231, certainty: "provável" },
  { id: "rama", namePt: "Ramá", region: "Benjamim", modern: "Er-Ram, Cisjordânia", nameHe: "הָרָמָה", lon: 35.2316, lat: 31.8543, certainty: "provável" },
  { id: "mispa", namePt: "Mispá", region: "Benjamim", modern: "Tell en-Nasbeh, perto de Ramallah, Cisjordânia", nameHe: "הַמִּצְפָּה", lon: 35.2164, lat: 31.8851, certainty: "provável" },
  { id: "soco", namePt: "Socó (vale de Elá)", region: "Sefelá", modern: "Khirbet Shuweikeh (Tel Socho), Israel", nameHe: "שׂוֹכֹה", lon: 34.9749, lat: 31.6822, certainty: "alta" },
  { id: "azeca", namePt: "Azeca", region: "Sefelá", modern: "Tel Azekah, Israel", nameHe: "עֲזֵקָה", lon: 34.9357, lat: 31.7002, certainty: "provável" },
  { id: "jerusalen", namePt: "Jerusalém", region: "Judá", modern: "Jerusalém", nameHe: "יְרוּשָׁלַיִם", nameTranslit: "Yerushalayim", lon: 35.2342, lat: 31.7767, certainty: "alta" },
  { id: "samaria", namePt: "Samaria", region: "Israel (Reino do Norte)", modern: "Sebastia, Cisjordânia", nameHe: "שֹׁמְרוֹן", nameTranslit: "Shomron", lon: 35.195, lat: 32.2761, certainty: "alta" },
  { id: "megido", namePt: "Megido", region: "Vale de Jezreel", modern: "Tel Megiddo, Israel", nameHe: "מְגִדּוֹ", lon: 35.1844, lat: 32.5853, certainty: "alta" },
  { id: "ninive", namePt: "Nínive", region: "Assíria", modern: "Mossul, Iraque", nameHe: "נִינְוֵה", nameTranslit: "Ninveh", lon: 43.1528, lat: 36.3594, certainty: "alta" },
  { id: "susa", namePt: "Susã", region: "Pérsia (Elão)", modern: "Shush, Irã", nameHe: "שׁוּשַׁן", lon: 48.2578, lat: 32.1892, certainty: "alta" },
  { id: "quebar", namePt: "Rio Quebar", region: "Babilônia", modern: "Perto de Nippur (Nuffar), Iraque", nameHe: "כְּבָר", lon: 45.2308, lat: 32.1269, certainty: "provável" },
  { id: "tisbe", namePt: "Tisbé", region: "Gileade", modern: "Listib (Mar Elias), Jordânia", nameHe: "תִּשְׁבֶּה", lon: 35.7333, lat: 32.3667, certainty: "tradicional", note: "Listib (Mar Elias), em Gileade (1Rs 17:1)" },
  { id: "querite", namePt: "Ribeiro de Querite", region: "Leste do Jordão", modern: "Wadi al-Yabis, Jordânia", nameHe: "כְּרִית", lon: 35.5914, lat: 32.3947, certainty: "incerta" },
  { id: "sarepta", namePt: "Sarepta", region: "Fenícia", modern: "Sarafand, Líbano", nameHe: "צָרְפַת", lon: 35.2951, lat: 33.4642, certainty: "alta" },
  { id: "carmelo", namePt: "Monte Carmelo", region: "Costa norte", modern: "Monte Carmelo, Israel", nameHe: "הַכַּרְמֶל", lon: 35.0233, lat: 32.6725, certainty: "alta" },
  { id: "jezreel", namePt: "Jezreel", region: "Vale de Jezreel", modern: "Tel Jezreel, Israel", nameHe: "יִזְרְעֶאל", lon: 35.328, lat: 32.5579, certainty: "alta" },
  { id: "abel-meola", namePt: "Abel-Meolá", region: "Vale do Jordão", modern: "Tell Abu Sus, vale do Jordão", nameHe: "אָבֵל מְחוֹלָה", lon: 35.5609, lat: 32.3743, certainty: "provável" },
  { id: "sunem", namePt: "Suném", region: "Vale de Jezreel", modern: "Sulam, Israel", nameHe: "שׁוּנֵם", lon: 35.3343, lat: 32.6056, certainty: "alta" },
  { id: "gate-hefer", namePt: "Gate-Hefer", region: "Galileia", modern: "Perto de Mashhad, Israel", nameHe: "גַּת הַחֵפֶר", lon: 35.3197, lat: 32.7381, certainty: "provável" },
  { id: "jope", namePt: "Jope", region: "Costa", modern: "Jafa (Tel Aviv-Jafa), Israel", nameHe: "יָפוֹ", lon: 34.753, lat: 32.0545, certainty: "alta" },
  { id: "anatote", namePt: "Anatote", region: "Benjamim", modern: "Perto de Anata, Cisjordânia", nameHe: "עֲנָתוֹת", lon: 35.2576, lat: 31.8075, certainty: "incerta" },
  { id: "tafnes", namePt: "Tafnes", region: "Delta do Nilo", modern: "Tell Defenna, Egito", nameHe: "תַּחְפַּנְחֵס", lon: 32.1714, lat: 30.8606, certainty: "alta" },
  { id: "damasco", namePt: "Damasco", region: "Arã (Síria)", modern: "Damasco, Síria", nameHe: "דַּמֶּשֶׂק", nameTranslit: "Damesek", lon: 36.3064, lat: 33.5111, certainty: "alta" },
  { id: "nazare", namePt: "Nazaré", region: "Galileia", modern: "Nazaré, Israel", lon: 35.2977, lat: 32.7021, certainty: "alta" },
  { id: "cana", namePt: "Caná", region: "Galileia", modern: "Khirbet Qana, Israel", lon: 35.3027, lat: 32.8222, certainty: "provável" },
  { id: "cafarnaum", namePt: "Cafarnaum", region: "Galileia", modern: "Tel Hum (Kfar Nahum), Israel", lon: 35.575, lat: 32.8811, certainty: "alta" },
  { id: "mar-galileia", namePt: "Mar da Galileia", region: "Galileia", modern: "Lago de Tiberíades (Kinneret), Israel", lon: 35.59, lat: 32.8189, certainty: "alta" },
  { id: "bem-aventurancas", namePt: "Monte das Bem-aventuranças", region: "Galileia", modern: "Monte das Bem-aventuranças, perto de Tabgha, Israel", lon: 35.5562, lat: 32.8811, certainty: "tradicional", note: "Mateus não dá o nome do monte" },
  { id: "betsaida", namePt: "Betsaida", region: "Galileia", modern: "Et-Tell, colinas de Golã", lon: 35.631, lat: 32.9104, certainty: "incerta" },
  { id: "gadara", namePt: "Gadara", region: "Decápolis", modern: "Umm Qais, Jordânia", lon: 35.6794, lat: 32.656, certainty: "alta" },
  { id: "naim", namePt: "Naim", region: "Galileia", modern: "Nein, Israel", lon: 35.3501, lat: 32.6307, certainty: "alta" },
  { id: "sicar", namePt: "Sicar (poço de Jacó)", region: "Samaria", modern: "Askar, perto de Nablus, Cisjordânia", lon: 35.289, lat: 32.2178, certainty: "provável" },
  { id: "tiro", namePt: "Tiro", region: "Fenícia", modern: "Tiro (Sur), Líbano", lon: 35.1961, lat: 33.2708, certainty: "alta" },
  { id: "sidom", namePt: "Sidom", region: "Fenícia", modern: "Saida, Líbano", lon: 35.3719, lat: 33.561, certainty: "alta" },
  { id: "cesareia-filipe", namePt: "Cesareia de Filipe", region: "Pé do Hermom", modern: "Banias, colinas de Golã", lon: 35.6933, lat: 33.2461, certainty: "alta" },
  { id: "tabor", namePt: "Monte Tabor", region: "Galileia", modern: "Monte Tabor, Israel", lon: 35.3929, lat: 32.6863, certainty: "tradicional", note: "o evangelho diz só \"um alto monte\"; outros pensam no Hermom" },
  { id: "betania-jordao", namePt: "Betânia além do Jordão", region: "Pereia", modern: "Al-Maghtas, Jordânia", lon: 35.5503, lat: 31.8371, certainty: "tradicional", note: "lugar do batismo (Jo 1:28)" },
  { id: "deserto", namePt: "Deserto da Judeia", region: "Judeia", modern: "Jabal al-Quruntul, perto de Jericó, Cisjordânia", lon: 35.4273, lat: 31.8697, certainty: "tradicional", note: "monte da Tentação, perto de Jericó" },
  { id: "betania", namePt: "Betânia", region: "Judeia", modern: "Al-Eizariya, Cisjordânia", lon: 35.2559, lat: 31.7717, certainty: "alta" },
  { id: "betfage", namePt: "Betfagé", region: "Monte das Oliveiras", modern: "Et-Tur, Jerusalém", lon: 35.2508, lat: 31.7776, certainty: "provável" },
  { id: "oliveiras", namePt: "Monte das Oliveiras", region: "Jerusalém", modern: "Monte das Oliveiras, Jerusalém", lon: 35.2457, lat: 31.7779, certainty: "alta" },
  { id: "getsemani", namePt: "Getsêmani", region: "Jerusalém", modern: "Jardim do Getsêmani, Jerusalém", lon: 35.2394, lat: 31.7794, certainty: "alta" },
  { id: "golgota", namePt: "Gólgota", region: "Jerusalém", modern: "Igreja do Santo Sepulcro, Jerusalém", lon: 35.2298, lat: 31.7784, certainty: "tradicional", note: "igreja do Santo Sepulcro" },
  { id: "emaus", namePt: "Emaús", region: "Judeia", modern: "Motza, perto de Jerusalém, Israel", lon: 35.1642, lat: 31.7929, certainty: "incerta", note: "há vários lugares propostos" },
  { id: "lida", namePt: "Lida", region: "Planície costeira", modern: "Lod, Israel", lon: 34.9, lat: 31.95, certainty: "alta" },
  { id: "cesareia", namePt: "Cesareia", region: "Costa", modern: "Cesareia, Israel", lon: 34.8917, lat: 32.5, certainty: "alta" },
  { id: "gaza", namePt: "Gaza", region: "Costa sul", modern: "Gaza, Faixa de Gaza", lon: 34.4644, lat: 31.504, certainty: "alta" },
  { id: "tarso", namePt: "Tarso", region: "Cilícia", modern: "Tarsus, Turquia", lon: 34.8921, lat: 36.913, certainty: "alta" },
  { id: "antioquia", namePt: "Antioquia da Síria", region: "Síria", modern: "Antáquia (Antakya), Turquia", lon: 36.1717, lat: 36.2267, certainty: "alta" },
  { id: "seleucia", namePt: "Selêucia", region: "Síria", modern: "Samandağ (Çevlik), Turquia", lon: 35.922, lat: 36.124, certainty: "alta" },
  { id: "salamina", namePt: "Salamina", region: "Chipre", modern: "Perto de Famagusta, Chipre", lon: 33.9019, lat: 35.1849, certainty: "alta" },
  { id: "pafos", namePt: "Pafos", region: "Chipre", modern: "Pafos, Chipre", lon: 32.4042, lat: 34.7557, certainty: "alta" },
  { id: "perge", namePt: "Perge", region: "Panfília", modern: "Aksu, perto de Antália, Turquia", lon: 30.8537, lat: 36.9604, certainty: "alta" },
  { id: "atalia", namePt: "Atália", region: "Panfília", modern: "Antália, Turquia", lon: 30.7036, lat: 36.8813, certainty: "alta" },
  { id: "antioquia-pisidia", namePt: "Antioquia da Pisídia", region: "Galácia", modern: "Yalvaç, Turquia", lon: 31.1892, lat: 38.3061, certainty: "alta" },
  { id: "iconio", namePt: "Icônio", region: "Galácia", modern: "Konya, Turquia", lon: 32.4923, lat: 37.8722, certainty: "alta" },
  { id: "listra", namePt: "Listra", region: "Galácia", modern: "Perto de Hatunsaray, Turquia", lon: 32.3384, lat: 37.6017, certainty: "alta" },
  { id: "derbe", namePt: "Derbe", region: "Galácia", modern: "Kerti Höyük, perto de Karaman, Turquia", lon: 33.3615, lat: 37.3486, certainty: "alta" },
  { id: "troade", namePt: "Trôade", region: "Mísia", modern: "Perto de Dalyan (Çanakkale), Turquia", lon: 26.1586, lat: 39.7519, certainty: "alta" },
  { id: "neapolis", namePt: "Neápolis", region: "Macedônia", modern: "Kavala, Grécia", lon: 24.415, lat: 40.935, certainty: "alta" },
  { id: "filipos", namePt: "Filipos", region: "Macedônia", modern: "Perto de Krinides, Grécia", lon: 24.2846, lat: 41.0121, certainty: "alta" },
  { id: "anfipolis", namePt: "Anfípolis", region: "Macedônia", modern: "Anfípoli, Grécia", lon: 23.8472, lat: 40.8202, certainty: "alta" },
  { id: "tessalonica", namePt: "Tessalônica", region: "Macedônia", modern: "Tessalônica (Salônica), Grécia", lon: 22.9458, lat: 40.6378, certainty: "alta" },
  { id: "bereia", namePt: "Bereia", region: "Macedônia", modern: "Véria, Grécia", lon: 22.2, lat: 40.5183, certainty: "alta" },
  { id: "atenas", namePt: "Atenas", region: "Acaia", modern: "Atenas, Grécia", lon: 23.7267, lat: 37.9719, certainty: "alta" },
  { id: "corinto", namePt: "Corinto", region: "Acaia", modern: "Antiga Corinto, Grécia", lon: 22.8787, lat: 37.9058, certainty: "alta" },
  { id: "cencreia", namePt: "Cencreia", region: "Acaia", modern: "Kechries, Grécia", lon: 22.9968, lat: 37.8843, certainty: "alta" },
  { id: "efeso", namePt: "Éfeso", region: "Ásia", modern: "Selçuk, Turquia", lon: 27.3407, lat: 37.9391, certainty: "alta" },
  { id: "assos", namePt: "Assôs", region: "Ásia", modern: "Behramkale, Turquia", lon: 26.3367, lat: 39.4906, certainty: "alta" },
  { id: "mitilene", namePt: "Mitilene", region: "Ilha de Lesbos", modern: "Mitilene, ilha de Lesbos, Grécia", lon: 26.547, lat: 39.1105, certainty: "alta" },
  { id: "mileto", namePt: "Mileto", region: "Ásia", modern: "Balat, Turquia", lon: 27.2756, lat: 37.5311, certainty: "alta" },
  { id: "cos", namePt: "Cós", region: "Ilha de Cós", modern: "Cós, Grécia", lon: 27.1103, lat: 36.8153, certainty: "alta" },
  { id: "rodes", namePt: "Rodes", region: "Ilha de Rodes", modern: "Rodes, Grécia", lon: 28.2275, lat: 36.4341, certainty: "alta" },
  { id: "patara", namePt: "Pátara", region: "Lícia", modern: "Gelemiş, Turquia", lon: 29.3142, lat: 36.2603, certainty: "alta" },
  { id: "mirra", namePt: "Mirra", region: "Lícia", modern: "Demre, Turquia", lon: 29.9853, lat: 36.2592, certainty: "alta" },
  { id: "ptolemaida", namePt: "Ptolemaida", region: "Fenícia", modern: "Acre (Akko), Israel", lon: 35.0692, lat: 32.9214, certainty: "alta" },
  { id: "bons-portos", namePt: "Bons Portos", region: "Creta", modern: "Kali Limenes, Creta (Grécia)", lon: 24.8003, lat: 34.9297, certainty: "alta" },
  { id: "malta", namePt: "Malta", region: "Mediterrâneo", modern: "Malta", lon: 14.4117, lat: 35.9335, certainty: "alta" },
  { id: "siracusa", namePt: "Siracusa", region: "Sicília", modern: "Siracusa, Itália", lon: 15.2931, lat: 37.0639, certainty: "alta" },
  { id: "regio", namePt: "Régio", region: "Itália", modern: "Reggio Calabria, Itália", lon: 15.6441, lat: 38.1088, certainty: "alta" },
  { id: "puteoli", namePt: "Putéoli", region: "Itália", modern: "Pozzuoli, Itália", lon: 14.1206, lat: 40.8261, certainty: "alta" },
  { id: "roma", namePt: "Roma", region: "Itália", modern: "Roma, Itália", lon: 12.4852, lat: 41.8922, certainty: "alta" },
  { id: "patmos", namePt: "Patmos", region: "Mar Egeu", modern: "Patmos, Grécia", lon: 26.5417, lat: 37.325, certainty: "alta" },
  { id: "esmirna", namePt: "Esmirna", region: "Ásia", modern: "Izmir, Turquia", lon: 27.1378, lat: 38.4189, certainty: "alta" },
  { id: "pergamo", namePt: "Pérgamo", region: "Ásia", modern: "Bergama, Turquia", lon: 27.1842, lat: 39.1322, certainty: "alta" },
  { id: "tiatira", namePt: "Tiatira", region: "Ásia", modern: "Akhisar, Turquia", lon: 27.8365, lat: 38.9202, certainty: "alta" },
  { id: "sardes", namePt: "Sardes", region: "Ásia", modern: "Sart, Turquia", lon: 28.0403, lat: 38.4883, certainty: "alta" },
  { id: "filadelfia", namePt: "Filadélfia", region: "Ásia", modern: "Alaşehir, Turquia", lon: 28.5167, lat: 38.35, certainty: "alta" },
  { id: "laodiceia", namePt: "Laodiceia", region: "Ásia", modern: "Perto de Denizli, Turquia", lon: 29.1075, lat: 37.8358, certainty: "alta" },
];

const BY_ID = new Map(PLACES.map((place) => [place.id, place]));

export function placeById(id: string): Place | undefined {
  return BY_ID.get(id);
}

/** Distância em linha reta (círculo máximo), em km. */
export function distanceKm(a: Pick<Place, "lon" | "lat">, b: Pick<Place, "lon" | "lat">): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const KM = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const KM_SHORT = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** "1.234 km"; abaixo de 10 km, com uma casa ("8,3 km"). */
export function formatKm(km: number): string {
  return `${(km < 10 ? KM_SHORT : KM).format(km)} km`;
}

// Sem casas fixas: "31° N" no Éden não finge uma precisão que o ponto não tem.
const DEG = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 4 });

/** "32,2136° N, 35,2819° L" (leste/oeste, como nos mapas em português). */
export function formatCoords(p: Pick<Place, "lon" | "lat">): string {
  return `${DEG.format(Math.abs(p.lat))}° ${p.lat < 0 ? "S" : "N"}, ${DEG.format(Math.abs(p.lon))}° ${p.lon < 0 ? "O" : "L"}`;
}

/** Abre o ponto no Google Maps: o app no celular, o site no computador. */
export function googleMapsUrl(p: Pick<Place, "lon" | "lat">): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.lat},${p.lon}`)}`;
}
