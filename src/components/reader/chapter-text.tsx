import type { ReactNode } from "react";
import { ORIGINAL, type OriginalLang } from "@/lib/bible/catalog";
import type { LetteredNote } from "@/lib/bible/corpus";

/** Palavras [entre colchetes] não existem no original: aparecem mais claras e em itálico. */
export function PtText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("[") && part.endsWith("]") ? (
          <span key={index} className="added-word" title="Acrescentado pelo sentido; não está no original">
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** Texto do versículo com as chamadas das notas do tradutor (a, b, c…) nos lugares certos. */
export function PtWithNotes({ text, notes }: { text: string; notes: LetteredNote[] }) {
  if (notes.length === 0) return <PtText text={text} />;
  const parts: ReactNode[] = [];
  let from = 0;
  for (const note of notes) {
    // A última palavra, a chamada e a pontuação logo depois ficam na mesma linha.
    const before = text.slice(Math.min(from, note.at), note.at);
    const openBracket = (before.match(/\[/g)?.length ?? 0) > (before.match(/\]/g)?.length ?? 0);
    const lastWord = openBracket ? "" : (before.match(/\S+$/)?.[0] ?? "");
    const punct = text.slice(Math.max(from, note.at)).match(/^[,.;:!?)»”]+/)?.[0] ?? "";
    parts.push(<PtText key={`t${note.letter}`} text={before.slice(0, before.length - lastWord.length)} />);
    const call = (
      <button
        key={note.letter}
        id={`chamada-${note.letter}`}
        type="button"
        className="note-call"
        aria-label={`Nota ${note.letter}`}
        onClick={() => focusById(`nota-${note.letter}`)}
      >
        {note.letter}
      </button>
    );
    parts.push(
      <span key={`n${note.letter}`} className="whitespace-nowrap">
        <PtText text={lastWord} />
        {call}
        {punct}
      </span>,
    );
    from = Math.max(from, note.at) + punct.length;
  }
  parts.push(<PtText key="fim" text={text.slice(from)} />);
  return <>{parts}</>;
}

/** Leva até um elemento e o destaca por um instante. */
function focusById(id: string) {
  const node = document.getElementById(id);
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "center" });
  node.classList.remove("note-flash");
  void node.offsetWidth;
  node.classList.add("note-flash");
}

/** *Asteriscos* no texto da nota viram itálico (palavras hebraicas transliteradas). */
export function NoteText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/);
  return (
    <>
      {parts.map((part, index) =>
        part.length > 2 && part.startsWith("*") && part.endsWith("*") ? <em key={index}>{part.slice(1, -1)}</em> : part,
      )}
    </>
  );
}

/** Notas do tradutor ao fim do capítulo, como no rodapé de uma Bíblia impressa. */
export function ChapterNotes({ chapter, notes }: { chapter: number; notes: LetteredNote[] }) {
  if (notes.length === 0) return null;
  return (
    <section aria-labelledby="notas-titulo" className="mt-10 border-t border-line pt-6">
      <h2 id="notas-titulo" className="text-base font-semibold text-soft">
        Notas do tradutor
      </h2>
      <ol className="mt-3 max-w-[38rem] space-y-2.5">
        {notes.map((note) => (
          <li key={note.letter} id={`nota-${note.letter}`} className="note-item rounded-xl px-2 py-1 -mx-2 text-[0.94rem] leading-relaxed text-soft">
            <button
              type="button"
              onClick={() => focusById(`chamada-${note.letter}`)}
              aria-label={`Voltar ao versículo ${chapter}:${note.verse}`}
              className="mr-1 font-semibold text-fg tabular-nums hover:text-tekhelet"
            >
              <sup className="mr-0.5 text-tekhelet">{note.letter}</sup>
              {chapter}:{note.verse}
            </button>{" "}
            <NoteText text={note.t} />
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Como ler a tradução, ao fim de cada capítulo publicado. */
export function SourceNote({ lang }: { lang: OriginalLang }) {
  const original = ORIGINAL[lang].label.toLowerCase();
  return (
    <aside className="mt-8 rounded-2xl border border-line bg-surface/60 px-4 py-3.5 text-[13px] leading-relaxed text-muted">
      <p>
        <span className="font-semibold text-soft">Tradução direta {ORIGINAL[lang].from}.</span> Palavras em{" "}
        <span className="added-word">itálico claro</span> não estão no {original} e foram acrescentadas pelo sentido.
        {lang === "he" ? (
          <>
            {" "}
            O nome divino{" "}
            <span lang="he" dir="rtl" className="he">
              יהוה
            </span>{" "}
            aparece como YHWH.
          </>
        ) : null}
      </p>
    </aside>
  );
}
