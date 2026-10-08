import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { bookById } from "@/lib/bible/catalog";
import { useStudy } from "@/lib/study/store";

export const Route = createFileRoute("/inicio")({
  head: () => ({ meta: [{ title: "Menu · Bíblia Origens" }] }),
  component: Inicio,
});

const DOORS = [
  { to: "/ler", index: "01", title: "Ler", text: "Português, hebraico e transliterado, nesta ordem." },
  { to: "/estudos", index: "02", title: "Estudos", text: "Guias e referências, à espera do acervo." },
  { to: "/mapas", index: "03", title: "Mapas", text: "Onde os acontecimentos se situam." },
  { to: "/conta", index: "04", title: "Conta", text: "Entrar e sincronizar entre aparelhos." },
] as const;

function Inicio() {
  const ready = useStudy((state) => state.ready);
  const position = useStudy((state) => state.position);
  const book = position ? bookById(position.bookId) : undefined;

  return (
    <Shell>
      <main className="mx-auto w-full max-w-xl px-5 py-10">
        <p className="text-xs uppercase tracking-widest text-gold">Tanakh</p>
        <h1 className="mt-3 text-5xl">A Palavra, desde a origem.</h1>
        <p className="mt-4 text-xl text-muted">
          Uma leitura para estudo: o sentido em português, o hebraico e a transliteração. Sem versões no meio.
        </p>

        {ready && book && position ? (
          <Link
            to="/ler/$book/$chapter"
            params={{ book: book.id, chapter: String(position.chapter) }}
            className="mt-8 block rounded-3xl border border-line bg-surface px-5 py-4"
          >
            <p className="text-xs uppercase tracking-widest text-gold">Continuar</p>
            <p className="mt-2 text-2xl">
              {book.namePt} {position.chapter}
            </p>
            <p className="he text-gold" lang="he" dir="rtl">
              {book.nameHe}
            </p>
          </Link>
        ) : (
          <div className="mt-8 h-4" />
        )}

        <ul className="mt-6 divide-y divide-line border-y border-line">
          {DOORS.map((door) => (
            <li key={door.to}>
              <Link to={door.to} className="flex min-h-20 items-baseline gap-4 py-4">
                <span className="text-sm text-gold tabular-nums">{door.index}</span>
                <span>
                  <span className="block text-2xl">{door.title}</span>
                  <span className="text-muted">{door.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </Shell>
  );
}
