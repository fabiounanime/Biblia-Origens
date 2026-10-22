import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CONTACT_EMAIL } from "@/components/legal-page";
import { BrandMark, Wordmark, cx } from "@/components/ui";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BOOKS, SECTIONS, SECTION_TONE } from "@/lib/bible/catalog";
import { loadWords, type WordInfo } from "@/lib/bible/corpus";
import { useAcervoIndex } from "@/lib/bible/use-acervo";

/** Título e descrição da página pública (início). */
export const LANDING_HEAD = {
  meta: [
    { title: "Bíblia Origens · A Bíblia em português, no original e transliterada" },
    {
      name: "description",
      content:
        "Aplicativo gratuito de leitura e estudo da Bíblia: cada versículo em português direto, no hebraico original e transliterado, com o significado de cada palavra, marcas, notas, guias e mapas.",
    },
  ],
};

/** Gênesis 1:1 nas três camadas: a capa da página é o próprio leitor. */
const VERSE = {
  he: ["בְּרֵאשִׁית", "בָּרָא", "אֱלֹהִים", "אֵת", "הַשָּׁמַיִם", "וְאֵת", "הָאָרֶץ"],
  tr: ["Bereshit", "bara", "Elohim", "et", "hashamayim", "ve'et", "ha'arets"],
  pt: "No princípio criou Deus os céus e a terra.",
};

/** Palavra que já aparece aberta, para mostrar o balão sem precisar tocar. */
const FIRST_WORD = 2;

/** *Asteriscos* nos significados viram itálico. */
function Gloss({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*[^*]+\*)/)
        .map((part, index) =>
          part.length > 2 && part.startsWith("*") && part.endsWith("*") ? (
            <em key={index}>{part.slice(1, -1)}</em>
          ) : (
            part
          ),
        )}
    </>
  );
}

/**
 * Página pública de apresentação (endereço principal): mostra o leitor de
 * verdade num versículo, explica a conta e leva à privacidade e aos termos.
 * Quem abre o app instalado vê a abertura em /abrir (start_url do manifesto).
 */
export function LandingPage() {
  const { user } = useCurrentUserState();
  const [words, setWords] = useState<WordInfo[] | null>(null);

  useEffect(() => {
    let cancel = false;
    void loadWords("gn", 1)
      .catch(() => null)
      .then((rows) => {
        if (!cancel) setWords(rows?.[0] ?? null);
      });
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div className="app-backdrop min-h-dvh font-app text-fg">
      <header className="glass sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark className="size-9" />
            <Wordmark className="text-[1.25rem] leading-none" />
          </Link>
          <Link
            to={user ? "/inicio" : "/login"}
            className="inline-flex h-11 items-center rounded-full px-4 font-semibold text-soft hover:bg-raised hover:text-fg"
          >
            {user ? "Abrir o app" : "Entrar"}
          </Link>
        </div>
      </header>

      <main>
        {/* Capa: o título, a promessa e o versículo que se pode tocar */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:pt-20 lg:pb-24">
          <div>
            <h1 className="text-[2.5rem] leading-[1.05] font-extrabold tracking-tight sm:text-[3.5rem]">
              A Bíblia como foi escrita, palavra por palavra.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-soft">
              A <strong className="font-semibold text-fg">Bíblia Origens</strong> é um aplicativo
              gratuito de leitura e estudo. Cada versículo vem em português direto, no hebraico
              original e transliterado, e cada palavra do original mostra o que significa.
              Experimente ao lado.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={user ? "/inicio" : "/login"}
                search={user ? undefined : { modo: "criar" }}
                className="inline-flex h-12 items-center rounded-full bg-tekhelet px-6 font-semibold text-on-accent"
              >
                {user ? "Continuar lendo" : "Criar conta e ler"}
              </Link>
              {user ? null : (
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center rounded-full px-5 font-semibold text-soft hover:text-fg"
                >
                  Já tenho conta
                </Link>
              )}
            </div>
          </div>

          <LiveVerse words={words} />
        </section>

        <ReaderTour words={words} />
        <AcervoProgress />

        {/* Conta e dados: exigido para o login com Google, e honesto com quem chega */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
            <h2 className="text-3xl font-bold tracking-tight">Por que pedimos uma conta</h2>
            <div className="max-w-2xl text-lg leading-relaxed text-soft">
              <p>
                A conta guarda suas marcas, notas e o ponto onde você parou, e leva tudo para os
                seus outros aparelhos. Você pode entrar com e-mail e senha ou com o Google. Do
                Google recebemos apenas nome, e-mail e foto do perfil. Não vendemos dados, não
                exibimos anúncios e não usamos rastreamento.
              </p>
              <p className="mt-4">
                Os detalhes estão na{" "}
                <Link
                  to="/privacidade"
                  className="font-semibold text-tekhelet underline underline-offset-4"
                >
                  Política de Privacidade
                </Link>{" "}
                e nos{" "}
                <Link
                  to="/termos"
                  className="font-semibold text-tekhelet underline underline-offset-4"
                >
                  Termos de Serviço
                </Link>
                .
              </p>
              <Link
                to={user ? "/inicio" : "/login"}
                search={user ? undefined : { modo: "criar" }}
                className="mt-8 inline-flex h-12 items-center rounded-full bg-tekhelet px-6 font-semibold text-on-accent"
              >
                {user ? "Abrir o app" : "Criar conta e ler"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-sunken">
        <div className="mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6">
          <Wordmark className="text-[2.5rem] leading-none sm:text-[3.5rem]" />
          <p className="mt-3 max-w-md text-soft">A Palavra, desde a origem.</p>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
            <p>Um projeto da Innovati Soluções Web</p>
            <nav className="flex flex-wrap gap-x-2" aria-label="Documentos">
              <Link to="/privacidade" className="inline-flex h-11 items-center px-2 hover:text-fg">
                Privacidade
              </Link>
              <Link to="/termos" className="inline-flex h-11 items-center px-2 hover:text-fg">
                Termos
              </Link>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex h-11 items-center px-2 hover:text-fg"
              >
                {CONTACT_EMAIL}
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Gênesis 1:1 com as palavras do hebraico e do transliterado tocáveis, e o balão do significado. */
function LiveVerse({ words }: { words: WordInfo[] | null }) {
  const [active, setActive] = useState(FIRST_WORD);
  const info = words?.[active];
  const count = VERSE.he.length;

  return (
    <figure
      className="rounded-[32px] bg-surface p-5 shadow-float sm:p-8"
      aria-label="Gênesis 1:1, palavra por palavra"
    >
      <figcaption className="flex items-baseline justify-between gap-3 text-sm text-muted">
        <span className="font-semibold text-soft">Gênesis 1:1</span>
        <span>Toque numa palavra</span>
      </figcaption>

      <p
        className="mt-6 flex flex-wrap justify-start gap-x-2 gap-y-1 font-hebrew text-[2.1rem] leading-snug text-zahav sm:text-[2.75rem]"
        lang="he"
        dir="rtl"
      >
        {VERSE.he.map((word, index) => (
          <button
            key={word + index}
            type="button"
            aria-pressed={active === index}
            aria-label={`${word}: ver o significado`}
            onClick={() => setActive(index)}
            className={cx("gloss-word", active === index && "gloss-word-on")}
          >
            {word}
          </button>
        ))}
      </p>
      <p className="read-tr mt-3 flex flex-wrap gap-x-1.5 text-[1.1rem]!">
        {VERSE.tr.map((word, index) => (
          <button
            key={word + index}
            type="button"
            aria-pressed={active === index}
            aria-label={`${word}: ver o significado`}
            onClick={() => setActive(index)}
            className={cx("gloss-word", active === index && "gloss-word-echo")}
          >
            {word}
          </button>
        ))}
      </p>

      {/* O balão, como no leitor */}
      <div className="mt-5 rounded-3xl bg-bg/70 p-5" aria-live="polite">
        <div className="flex items-center gap-3">
          <span className="font-hebrew text-[1.9rem] leading-none text-zahav" lang="he" dir="rtl">
            {VERSE.he[active]}
          </span>
          <span className="font-read text-tekhelet italic">{VERSE.tr[active]}</span>
          <span className="ms-auto flex gap-1.5" dir="rtl">
            <button
              type="button"
              onClick={() => setActive((active - 1 + count) % count)}
              aria-label="Palavra anterior"
              className="grid size-11 place-items-center rounded-full text-soft hover:bg-raised hover:text-fg"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setActive((active + 1) % count)}
              aria-label="Próxima palavra"
              className="grid size-11 place-items-center rounded-full text-soft hover:bg-raised hover:text-fg"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
          </span>
        </div>
        {info ? (
          <>
            <p className="gloss-meaning mt-2 text-[1.35rem]!">
              <Gloss text={info.g} />
            </p>
            {info.o ? (
              <p className="mt-0.5 text-soft">
                Também: <Gloss text={info.o} />
              </p>
            ) : null}
            <p className="mt-2 text-sm text-muted">{info.m}</p>
          </>
        ) : (
          <p className="mt-2 text-muted">{words === null ? "Abrindo o significado…" : ""}</p>
        )}
      </div>

      <p className="read-pt mt-5 text-soft">{VERSE.pt}</p>
    </figure>
  );
}

/** Nomes sobre a imagem esquemática (posições em % da figura). O mapa do app é o de satélite. */
const TOUR_PLACES = [
  { id: "ur", namePt: "Ur dos caldeus", x: 79, y: 73 },
  { id: "hara", namePt: "Harã", x: 55, y: 24 },
  { id: "jerusalen", namePt: "Jerusalém", x: 39, y: 51 },
  { id: "egito", namePt: "Egito", x: 16, y: 84 },
];

/** O que o leitor faz, mostrado com pedaços do próprio leitor em vez de ícones. */
function ReaderTour({ words }: { words: WordInfo[] | null }) {
  return (
    <section className="bg-sunken py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight">
          Um leitor feito para estudar o original
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-14">
          <div>
            <h3 className="text-xl font-semibold">Interlinear</h3>
            <p className="mt-2 max-w-md text-lg text-soft">
              Cada palavra do original com o transliterado e o significado embaixo, com prefixos e
              sufixos separados.
            </p>
            <ol
              className="mt-6 flex flex-wrap gap-2"
              dir="rtl"
              aria-label="Gênesis 1:1, palavra por palavra"
            >
              {VERSE.he.slice(0, 3).map((word, index) => (
                <li key={word} className="inter-word">
                  <span className="inter-original he" lang="he">
                    {word}
                  </span>
                  <span className="inter-tr" dir="ltr">
                    {VERSE.tr[index]}
                  </span>
                  <span className="inter-gloss" dir="ltr">
                    {words?.[index] ? <Gloss text={words[index].g} /> : "…"}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Notas do tradutor</h3>
            <p className="mt-2 max-w-md text-lg text-soft">
              A tradução é direta e fiel ao hebraico. Onde uma escolha pede explicação, uma letra
              leva à nota no fim do capítulo, como numa Bíblia impressa.
            </p>
            <div className="mt-6 rounded-3xl bg-surface p-5">
              <p className="read-pt">
                E a terra estava sem forma e{" "}
                <span className="whitespace-nowrap">
                  vazia<span className="note-call">d</span>,
                </span>{" "}
                e trevas <span className="added-word">havia</span> sobre a face do abismo.
              </p>
              <p className="mt-3 text-sm text-muted">
                Palavras em <span className="added-word">itálico claro</span> não estão no hebraico
                e foram acrescentadas pelo sentido.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Mapas</h3>
            <p className="mt-2 max-w-md text-lg text-soft">
              Mapa de satélite com os principais eventos, do Gênesis ao Apocalipse, os caminhos de
              patriarcas, profetas, apóstolos e de Jesus, e a distância entre os lugares.
            </p>
            <figure className="relative mt-6 overflow-hidden rounded-3xl">
              <img
                src="/map.jpg"
                alt="Mapa esquemático do Crescente Fértil"
                className="block w-full"
                loading="lazy"
              />
              {TOUR_PLACES.map((place) => (
                <span
                  key={place.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white"
                  style={{ left: `${place.x}%`, top: `${place.y}%` }}
                >
                  {place.namePt}
                </span>
              ))}
            </figure>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Seu estudo, em todo lugar</h3>
            <ul className="mt-4 space-y-4 text-lg text-soft">
              <li>
                <strong className="font-semibold text-fg">Guardados e notas.</strong> Guarde
                versículos e capítulos e escreva o que percebeu no texto.
              </li>
              <li>
                <strong className="font-semibold text-fg">Retome de onde parou.</strong> O leitor
                volta ao versículo exato, em qualquer aparelho.
              </li>
              <li>
                <strong className="font-semibold text-fg">Do seu jeito.</strong> Escolha as camadas,
                o tamanho da letra e os temas Escuro, Claro ou Pergaminho.
              </li>
              <li>
                <strong className="font-semibold text-fg">No celular.</strong> Funciona no navegador
                e pode ser adicionado à Tela de Início, como um aplicativo.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A tradução sai livro a livro: o andamento, lido do índice do acervo. */
function AcervoProgress() {
  const index = useAcervoIndex();
  if (index === "loading" || index === null) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Traduzida livro a livro</h2>
          <p className="mt-3 max-w-md text-lg text-soft">
            Cada livro é traduzido do original e conferido contra o hebraico antes de entrar no app.
            Este é o andamento de hoje.
          </p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2">
          {SECTIONS.map((section) => {
            const ids = BOOKS.filter((book) => book.section === section.id).map((book) => book.id);
            const done = ids.filter((id) => index[id]).length;
            const tone = SECTION_TONE[section.id];
            return (
              <li key={section.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-lg font-semibold">{section.title}</span>
                  <span className="text-soft tabular-nums">
                    {done} de {ids.length} livros
                  </span>
                </div>
                <span className="mt-2 block h-2 overflow-hidden rounded-full bg-raised">
                  <span
                    className={cx("block h-full origin-left rounded-full", tone.dot)}
                    style={{ transform: `scaleX(${done / ids.length})` }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
