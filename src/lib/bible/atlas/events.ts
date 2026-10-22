import { ref, type Ref } from "./ref.ts";

export type PartId = "criacao" | "patriarcas" | "exodo" | "terra" | "reis" | "exilio" | "jesus" | "igreja";

export type Part = { id: PartId; n: string; title: string; period: string };

export const PARTS: Part[] = [
  { id: "criacao", n: "I", title: "Criação", period: "Gênesis 1–11" },
  { id: "patriarcas", n: "II", title: "A primeira aliança", period: "c. 2200–1800 a.C." },
  { id: "exodo", n: "III", title: "O êxodo", period: "c. 1400 a.C." },
  { id: "terra", n: "IV", title: "A terra prometida", period: "c. 1400–1050 a.C." },
  { id: "reis", n: "V", title: "A era dos reis", period: "c. 1050–722 a.C." },
  { id: "exilio", n: "VI", title: "Exílio e retorno", period: "722–432 a.C." },
  { id: "jesus", n: "VII", title: "Jesus", period: "c. 4 a.C.–30 d.C." },
  { id: "igreja", n: "VIII", title: "A igreja", period: "c. 30–95 d.C." },
];

export type BibleEvent = {
  n: number;
  part: PartId;
  title: string;
  refs: Ref[];
  /** Lugares no mapa, na ordem em que a história passa por eles. */
  placeIds: string[];
  text: string;
};

export const EVENTS: BibleEvent[] = [
  { n: 1, part: "criacao", title: "Criação", refs: [ref("gn", 1, 1, "Gn 1–2")], placeIds: ["eden"],
    text: "Deus cria os céus, a terra e o ser humano, e planta um jardim no Éden. O lugar é desconhecido; o texto cita o Tigre e o Eufrates." },
  { n: 2, part: "criacao", title: "A queda", refs: [ref("gn", 3, 1, "Gn 3")], placeIds: ["eden"],
    text: "Adão e Eva desobedecem e são mandados para fora do jardim." },
  { n: 3, part: "criacao", title: "Noé e o dilúvio", refs: [ref("gn", 6, 1, "Gn 6–9")], placeIds: ["ararat"],
    text: "Deus salva Noé e sua família do dilúvio. A arca para \"sobre os montes de Ararate\", a região de Urartu." },
  { n: 4, part: "criacao", title: "A torre de Babel", refs: [ref("gn", 11, 1, "Gn 11:1-9")], placeIds: ["babilonia"],
    text: "Na planície de Sinear, os homens constroem uma torre; Deus confunde a língua deles e os espalha." },

  { n: 5, part: "patriarcas", title: "O chamado de Abrão", refs: [ref("gn", 12, 1, "Gn 12:1-9")], placeIds: ["ur", "hara", "siquem", "betel"],
    text: "Deus chama Abrão a deixar a sua terra. Ele sai de Ur, passa por Harã e chega a Canaã, onde levanta altares em Siquém e perto de Betel." },
  { n: 6, part: "patriarcas", title: "As promessas a Abraão", refs: [ref("gn", 17, 1, "Gn 17:1–18:15")], placeIds: ["manre"],
    text: "Deus muda o nome de Abrão para Abraão e promete um filho de Sara. Junto aos carvalhos de Manre, três visitantes repetem a promessa." },
  { n: 7, part: "patriarcas", title: "O nascimento de Isaque", refs: [ref("gn", 21, 1, "Gn 21:1-21")], placeIds: ["gerar", "berseba"],
    text: "Nasce Isaque, o filho prometido. Hagar e Ismael vagueiam no deserto de Berseba." },
  { n: 8, part: "patriarcas", title: "Abraão é provado", refs: [ref("gn", 22, 1, "Gn 22:1-19")], placeIds: ["berseba", "moria"],
    text: "Deus pede Isaque em sacrifício na terra de Moriá e provê um carneiro no lugar dele." },
  { n: 9, part: "patriarcas", title: "Isaque e Rebeca", refs: [ref("gn", 24, 1, "Gn 24")], placeIds: ["hara", "berseba"],
    text: "O servo de Abraão vai à terra da família, em Arã-Naaraim, e volta com Rebeca para ser mulher de Isaque." },
  { n: 10, part: "patriarcas", title: "Jacó e Esaú", refs: [ref("gn", 25, 19, "Gn 25:19-34"), ref("gn", 27, 1, "Gn 27–28")], placeIds: ["berseba", "betel"],
    text: "Jacó compra a primogenitura e toma a bênção de Esaú. Fugindo, sonha com a escada em Betel." },
  { n: 11, part: "patriarcas", title: "As mulheres de Jacó", refs: [ref("gn", 29, 1, "Gn 29:1-30")], placeIds: ["hara"],
    text: "Na casa de Labão, Jacó trabalha sete anos por Raquel e recebe Lia; depois, mais sete por Raquel." },
  { n: 12, part: "patriarcas", title: "Jacó volta e encontra Esaú", refs: [ref("gn", 32, 1, "Gn 32–33")], placeIds: ["jaboque", "penuel", "sucote", "siquem"],
    text: "No vau do Jaboque, Jacó luta com Deus e passa a se chamar Israel. Esaú o recebe em paz." },
  { n: 13, part: "patriarcas", title: "A história de José", refs: [ref("gn", 37, 1, "Gn 37–50")], placeIds: ["hebrom", "dota", "egito", "gosen"],
    text: "Vendido pelos irmãos em Dotã, José sobe a governador do Egito, perdoa a família e a recebe na terra de Gósen." },

  { n: 14, part: "exodo", title: "Israel escravo no Egito", refs: [ref("ex", 1, 1, "Êx 1")], placeIds: ["gosen", "ramesses"],
    text: "Um novo faraó escraviza os israelitas, que constroem as cidades de Pitom e Ramessés." },
  { n: 15, part: "exodo", title: "O nascimento de Moisés", refs: [ref("ex", 2, 1, "Êx 2")], placeIds: ["egito", "midia"],
    text: "Moisés é salvo das águas e criado no palácio. Adulto, foge para Midiã." },
  { n: 16, part: "exodo", title: "A sarça ardente", refs: [ref("ex", 3, 1, "Êx 3")], placeIds: ["sinai"],
    text: "No Horebe, o monte de Deus, Moisés vê a sarça que não se consome e recebe a missão de libertar o povo." },
  { n: 17, part: "exodo", title: "As dez pragas", refs: [ref("ex", 6, 28, "Êx 6:28–12:42")], placeIds: ["ramesses"],
    text: "Faraó endurece o coração e o Egito sofre dez pragas. Na noite da Páscoa, o povo sai de Ramessés." },
  { n: 18, part: "exodo", title: "Os dez mandamentos", refs: [ref("ex", 19, 1, "Êx 19–20"), ref("dt", 5, 1, "Dt 5")], placeIds: ["sinai"],
    text: "Depois de atravessar o mar, o povo acampa diante do Sinai e recebe a aliança e os mandamentos." },
  { n: 19, part: "exodo", title: "O bezerro de ouro", refs: [ref("ex", 32, 1, "Êx 32")], placeIds: ["sinai"],
    text: "Enquanto Moisés está no monte, Arão faz um bezerro de ouro e o povo o adora." },

  { n: 20, part: "terra", title: "Israel entra na terra", refs: [ref("js", 1, 1, "Js 1–2")], placeIds: ["nebo", "jordao", "jerico"],
    text: "Moisés vê a terra do alto do Nebo. Josué assume, envia espias a Jericó e o povo atravessa o Jordão." },
  { n: 21, part: "terra", title: "O tempo dos juízes", refs: [ref("jz", 2, 1, "Jz 2"), ref("jz", 21, 25, "Jz 21:25")], placeIds: ["silo"],
    text: "Sem rei, o povo cai na idolatria e Deus levanta juízes para salvá-lo. A tenda do encontro fica em Siló." },
  { n: 22, part: "terra", title: "Rute e Boaz", refs: [ref("rt", 1, 1, "Rt 1–4")], placeIds: ["moabe", "belem"],
    text: "A moabita Rute segue Noemi até Belém e se casa com Boaz. Dela vem a família de Davi." },

  { n: 23, part: "reis", title: "Saul, o primeiro rei", refs: [ref("1sm", 9, 1, "1Sm 9–10")], placeIds: ["rama", "mispa", "gibea"],
    text: "Samuel unge Saul em segredo; depois o povo o aclama em Mispá, e Saul volta para Gibeá." },
  { n: 24, part: "reis", title: "Davi é ungido", refs: [ref("1sm", 16, 1, "1Sm 16")], placeIds: ["belem"],
    text: "Em Belém, Samuel unge o filho mais novo de Jessé." },
  { n: 25, part: "reis", title: "Davi e Golias", refs: [ref("1sm", 17, 1, "1Sm 17")], placeIds: ["soco", "azeca"],
    text: "No vale de Elá, entre Socó e Azeca, Davi vence o gigante filisteu." },
  { n: 26, part: "reis", title: "Davi se torna rei", refs: [ref("2sm", 5, 1, "2Sm 5")], placeIds: ["hebrom", "jerusalen"],
    text: "Ungido rei de todo Israel em Hebrom, Davi toma Jerusalém e faz dela a capital." },
  { n: 27, part: "reis", title: "Salomão se torna rei", refs: [ref("1rs", 2, 1, "1Rs 2")], placeIds: ["jerusalen"],
    text: "Davi morre e Salomão firma o reino em Jerusalém." },
  { n: 28, part: "reis", title: "O templo de Salomão", refs: [ref("1rs", 6, 1, "1Rs 6")], placeIds: ["jerusalen"],
    text: "Salomão constrói o templo no monte Moriá, como lembra 2 Crônicas 3:1." },
  { n: 29, part: "reis", title: "O reino se divide", refs: [ref("1rs", 11, 41, "1Rs 11:41–12:24")], placeIds: ["siquem", "jerusalen"],
    text: "Em Siquém, as tribos do norte rejeitam Roboão e fazem Jeroboão rei. Judá fica com Jerusalém." },

  { n: 30, part: "exilio", title: "Israel cai diante da Assíria", refs: [ref("2rs", 17, 1, "2Rs 17")], placeIds: ["samaria", "ninive"],
    text: "Depois de três anos de cerco, Samaria cai e o povo do norte é levado para a Assíria." },
  { n: 31, part: "exilio", title: "Josias reencontra a lei", refs: [ref("2rs", 22, 1, "2Rs 22–23")], placeIds: ["jerusalen", "betel", "megido"],
    text: "O livro da lei é achado no templo; Josias renova a aliança e derruba o altar de Betel. Morre em Megido." },
  { n: 32, part: "exilio", title: "Judá cai diante da Babilônia", refs: [ref("2rs", 25, 1, "2Rs 25")], placeIds: ["jerusalen", "babilonia"],
    text: "Nabucodonosor destrói Jerusalém e o templo e leva o povo para a Babilônia." },
  { n: 33, part: "exilio", title: "A volta do exílio", refs: [ref("er", 1, 1, "Ed 1")], placeIds: ["babilonia", "jerusalen"],
    text: "Ciro, rei da Pérsia, permite que os judeus voltem para reconstruir o templo." },
  { n: 34, part: "exilio", title: "O novo templo", refs: [ref("er", 6, 1, "Ed 6")], placeIds: ["jerusalen"],
    text: "O segundo templo é terminado e dedicado, e o povo celebra a Páscoa." },

  { n: 35, part: "jesus", title: "Jesus nasce", refs: [ref("mt", 1, 1, "Mt 1–2"), ref("lc", 1, 1, "Lc 1–2")], placeIds: ["nazare", "belem", "egito"],
    text: "José e Maria descem de Nazaré a Belém, onde Jesus nasce. Fogem para o Egito e voltam para Nazaré." },
  { n: 36, part: "jesus", title: "O batismo de Jesus", refs: [ref("mt", 3, 1, "Mt 3"), ref("jo", 1, 19, "Jo 1:19-34")], placeIds: ["betania-jordao"],
    text: "João batiza Jesus no Jordão, em Betânia, \"do outro lado do Jordão\"." },
  { n: 37, part: "jesus", title: "A tentação", refs: [ref("mt", 4, 1, "Mt 4:1-11"), ref("lc", 4, 1, "Lc 4:1-13")], placeIds: ["deserto"],
    text: "Jesus jejua quarenta dias no deserto e vence as tentações." },
  { n: 38, part: "jesus", title: "O sermão do monte", refs: [ref("mt", 5, 1, "Mt 5–7")], placeIds: ["bem-aventurancas", "cafarnaum"],
    text: "Num monte junto ao mar da Galileia, Jesus ensina as bem-aventuranças e a oração do Pai Nosso." },
  { n: 39, part: "jesus", title: "Os cinco mil alimentados", refs: [ref("mt", 14, 13, "Mt 14:13-21"), ref("lc", 9, 10, "Lc 9:10-17")], placeIds: ["betsaida"],
    text: "Perto de Betsaida, cinco pães e dois peixes alimentam uma multidão." },
  { n: 40, part: "jesus", title: "A transfiguração", refs: [ref("mt", 17, 1, "Mt 17:1-8")], placeIds: ["cesareia-filipe", "tabor"],
    text: "Depois de Cesareia de Filipe, Jesus sobe a um alto monte e aparece glorioso com Moisés e Elias." },
  { n: 41, part: "jesus", title: "Lázaro ressuscita", refs: [ref("jo", 11, 1, "Jo 11:1-46")], placeIds: ["betania"],
    text: "Em Betânia, perto de Jerusalém, Jesus chama Lázaro para fora do túmulo." },
  { n: 42, part: "jesus", title: "A entrada em Jerusalém", refs: [ref("mt", 21, 1, "Mt 21:1-11")], placeIds: ["betfage", "oliveiras", "jerusalen"],
    text: "De Betfagé, no monte das Oliveiras, Jesus entra em Jerusalém montado num jumentinho." },
  { n: 43, part: "jesus", title: "A última ceia", refs: [ref("mt", 26, 17, "Mt 26:17-35"), ref("jo", 13, 1, "Jo 13")], placeIds: ["jerusalen"],
    text: "Na Páscoa, Jesus ceia com os discípulos, lava os pés deles e institui a ceia." },
  { n: 44, part: "jesus", title: "Traição, julgamento e cruz", refs: [ref("mt", 26, 36, "Mt 26:36–27:66"), ref("jo", 18, 1, "Jo 18–19")], placeIds: ["getsemani", "golgota"],
    text: "Preso no Getsêmani, Jesus é julgado e crucificado no Gólgota, fora dos muros." },
  { n: 45, part: "jesus", title: "A ressurreição", refs: [ref("mt", 28, 1, "Mt 28"), ref("lc", 24, 1, "Lc 24")], placeIds: ["golgota", "emaus"],
    text: "No terceiro dia o túmulo está vazio. Jesus aparece às mulheres e a dois discípulos no caminho de Emaús." },
  { n: 46, part: "jesus", title: "A ascensão", refs: [ref("at", 1, 1, "At 1:1-11")], placeIds: ["oliveiras"],
    text: "Do monte das Oliveiras, Jesus é elevado ao céu diante dos discípulos." },

  { n: 47, part: "igreja", title: "Pentecostes", refs: [ref("at", 2, 1, "At 2")], placeIds: ["jerusalen"],
    text: "O Espírito Santo desce sobre os discípulos, e gente de muitas línguas os entende: o contrário de Babel." },
  { n: 48, part: "igreja", title: "Estêvão, o primeiro mártir", refs: [ref("at", 6, 8, "At 6:8–8:1")], placeIds: ["jerusalen"],
    text: "Estêvão é apedrejado em Jerusalém; Saulo aprova a morte dele." },
  { n: 49, part: "igreja", title: "A conversão de Saulo", refs: [ref("at", 9, 1, "At 9:1-31")], placeIds: ["jerusalen", "damasco", "tarso"],
    text: "No caminho de Damasco, Saulo encontra Jesus ressuscitado. Depois volta a Jerusalém e segue para Tarso." },
  { n: 50, part: "igreja", title: "O Apocalipse em Patmos", refs: [ref("ap", 1, 1, "Ap 1"), ref("ap", 21, 1, "Ap 21–22")],
    placeIds: ["patmos", "efeso", "esmirna", "pergamo", "tiatira", "sardes", "filadelfia", "laodiceia"],
    text: "Exilado em Patmos, João recebe a revelação e escreve às sete igrejas da Ásia. O livro termina com o novo céu e a nova terra." },
];
