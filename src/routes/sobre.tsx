import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Bookmark, Map as MapIcon, ScrollText, Smartphone } from "lucide-react";
import { CONTACT_EMAIL } from "@/components/legal-page";
import { BrandMark, Wordmark } from "@/components/ui";

/**
 * Página pública que apresenta o app (página inicial informada ao Google).
 * Abre sem login: explica a finalidade do app e leva à privacidade e aos termos.
 */
export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Bíblia Origens · Tanakh em português, hebraico e transliterado" },
      {
        name: "description",
        content:
          "Aplicativo gratuito de leitura e estudo do Tanakh: cada versículo em português direto, no hebraico original e transliterado, com marcas, notas, guias e mapas.",
      },
    ],
  }),
  component: SobrePage,
});

const FEATURES: { icon: typeof BookOpen; title: string; text: string }[] = [
  {
    icon: BookOpen,
    title: "Leitor em três camadas",
    text: "Português, hebraico com sinais vocálicos e transliterado, nesta ordem. Mostre só as camadas que quiser e ajuste o tamanho da letra com dois dedos.",
  },
  {
    icon: Bookmark,
    title: "Marcas e notas",
    text: "Guarde versículos e capítulos, escreva notas e retome a leitura do ponto onde parou, em qualquer aparelho.",
  },
  {
    icon: ScrollText,
    title: "Guias de estudo",
    text: "Percursos que ligam um capítulo âncora aos temas da Torá, dos Profetas e dos Escritos.",
  },
  {
    icon: MapIcon,
    title: "Mapas",
    text: "Os lugares do Tanakh no Crescente Fértil, com o nome em hebraico e transliterado.",
  },
  {
    icon: Smartphone,
    title: "Instale no celular",
    text: "Funciona no navegador e pode ser adicionado à Tela de Início, como um aplicativo.",
  },
];

function SobrePage() {
  return (
    <div className="app-backdrop min-h-dvh text-fg">
      <header className="glass sticky top-0 z-30 border-b border-line/70">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/sobre" className="flex items-center gap-2.5">
            <BrandMark className="size-8" />
            <Wordmark className="text-[1.2rem] leading-none" />
          </Link>
          <Link
            to="/login"
            className="inline-flex h-9 items-center rounded-full bg-tekhelet px-4 text-sm font-semibold text-on-accent"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        {/* Apresentação */}
        <section className="grid items-center gap-10 pt-10 pb-12 md:grid-cols-[1.1fr_1fr] md:pt-16 md:pb-16">
          <div>
            <img src="/icons/logo-360.png" alt="" width={96} height={96} className="splash-logo size-24" />
            <h1 className="mt-6 text-[2.25rem] leading-[1.1] font-bold tracking-tight sm:text-[3rem]">
              O Tanakh lido em três camadas, versículo por versículo.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-soft">
              A <strong className="text-fg">Bíblia Origens</strong> é um aplicativo gratuito de leitura e estudo das Escrituras
              Hebraicas. Cada versículo aparece em português direto, no hebraico original e transliterado, sem versões no meio.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex h-12 items-center rounded-full bg-tekhelet px-6 font-semibold text-on-accent"
              >
                Começar a ler
              </Link>
              <a href="#recursos" className="inline-flex h-12 items-center rounded-full border border-line px-6 font-semibold text-soft">
                Ver recursos
              </a>
            </div>
          </div>

          {/* Exemplo do leitor */}
          <figure className="rounded-[28px] border border-line bg-surface p-5 shadow-float sm:p-6" aria-label="Exemplo do leitor">
            <figcaption className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">Gênesis 1:1</span>
              <span className="he text-xl text-zahav" lang="he" dir="rtl">
                בְּרֵאשִׁית
              </span>
            </figcaption>
            <div className="mt-5 flex gap-3.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-raised text-sm font-bold text-soft">1</span>
              <div className="min-w-0 space-y-3">
                <p className="read-pt">No princípio criou Deus os céus e a terra.</p>
                <p className="read-he" lang="he" dir="rtl">
                  בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ
                </p>
                <p className="read-tr">Bereshit bara Elohim et hashamayim ve&#39;et ha&#39;arets.</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2 text-xs font-semibold text-muted">
              <Layer dot="bg-fg">Português</Layer>
              <Layer dot="bg-zahav">Hebraico</Layer>
              <Layer dot="bg-tekhelet">Transliterado</Layer>
            </div>
          </figure>
        </section>

        {/* Recursos */}
        <section id="recursos" className="scroll-mt-20 border-t border-line/70 py-12">
          <h2 className="text-2xl font-bold tracking-tight">O que o app oferece</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-3xl border border-line bg-surface p-5">
                <span className="grid size-10 place-items-center rounded-2xl bg-tekhelet/14 text-tekhelet">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Conta e dados */}
        <section className="border-t border-line/70 py-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight">Por que pedimos uma conta</h2>
            <p className="mt-3 text-soft">
              A conta serve para guardar suas marcas, notas e o ponto de leitura e sincronizá-los entre seus aparelhos. Você pode
              entrar com e-mail e senha ou com o Google. Do Google recebemos apenas nome, e-mail e foto do perfil. Não vendemos
              dados, não exibimos anúncios e não usamos rastreamento.
            </p>
            <p className="mt-3 text-soft">
              Os detalhes estão na{" "}
              <Link to="/privacidade" className="font-medium text-tekhelet underline underline-offset-2">
                Política de Privacidade
              </Link>{" "}
              e nos{" "}
              <Link to="/termos" className="font-medium text-tekhelet underline underline-offset-2">
                Termos de Serviço
              </Link>
              .
            </p>
            <Link
              to="/login"
              className="mt-7 inline-flex h-12 items-center rounded-full bg-tekhelet px-6 font-semibold text-on-accent"
            >
              Criar conta ou entrar
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line/70">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:px-6">
          <p>Bíblia Origens · um projeto da Innovati Soluções Web</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Documentos">
            <Link to="/privacidade" className="hover:text-fg">
              Privacidade
            </Link>
            <Link to="/termos" className="hover:text-fg">
              Termos
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-fg">
              {CONTACT_EMAIL}
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function Layer({ dot, children }: { dot: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-raised px-2.5 py-1">
      <span className={`size-2 rounded-full ${dot}`} aria-hidden />
      {children}
    </span>
  );
}
