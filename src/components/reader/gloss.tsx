import { useEffect, useId, useRef, useState, type Ref } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cx } from "@/components/ui";
import { ORIGINAL, originalProps, type OriginalLang } from "@/lib/bible/catalog";
import { splitWords, type WordInfo } from "@/lib/bible/corpus";
import { PtText, NoteText } from "@/components/reader/chapter-text";

/** Linha tocada para ver a tradução num balão: hebraico ou transliterado. */
export type GlossLayer = "he" | "tr";

export type Gloss = { verse: number; layer: GlossLayer; word: number } | null;

/**
 * Linha em hebraico ou transliterada, palavra por palavra: um toque numa
 * palavra abre, logo abaixo da linha, um balão com o significado dela.
 */
export function GlossLine({
  layer,
  lang,
  text,
  he,
  tr,
  display,
  active,
  echo,
  onPick,
  onClose,
  reference,
  translation,
  words,
}: {
  layer: GlossLayer;
  /** Idioma do original do livro (hebraico ou grego). */
  lang: OriginalLang;
  /** Linha desta camada, como está no acervo. */
  text: string;
  /** As duas linhas completas, para mostrar a palavra nas duas escritas no balão. */
  he: string;
  tr: string;
  display: (word: string) => string;
  /** Palavra aberta nesta linha (índice), ou null. */
  active: number | null;
  /** Palavra aberta na outra linha: fica marcada aqui também. */
  echo: number | null;
  onPick: (index: number | null) => void;
  onClose: () => void;
  reference: string;
  translation: string;
  words: WordInfo[] | "loading" | null;
}) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const parts = splitWords(text, layer);
  const count = Math.ceil(parts.length / 2);

  useEffect(() => {
    if (active === null) return;
    const bubble = bubbleRef.current;
    if (!bubble) return;
    // A ponta do balão aponta para a palavra tocada.
    const target = bubble.parentElement?.querySelector<HTMLElement>(`[data-word="${active}"]`);
    if (target) {
      const center = target.offsetLeft + target.offsetWidth / 2 - bubble.offsetLeft;
      const tip = Math.min(Math.max(center, 18), bubble.offsetWidth - 18);
      bubble.style.setProperty("--tip", `${tip}px`);
    }
    // Se o balão abriu perto do fim da tela, rola só o necessário para vê-lo.
    const rect = bubble.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 16) {
      window.scrollBy({ top: rect.bottom - window.innerHeight + 24, behavior: "smooth" });
    }
  }, [active]);

  return (
    <div className="relative" data-gloss>
      <p
        className={cx(layer === "he" ? ORIGINAL[lang].read : "read-tr", "gloss-line")}
        {...(layer === "he" ? { lang: ORIGINAL[lang].lang, dir: ORIGINAL[lang].dir } : {})}
      >
        {parts.map((part, index) => {
          if (index % 2 === 1) return part === " " ? part : null;
          const word = index / 2;
          const on = active === word;
          const joiner = parts[index + 1];
          const button = (
            <button
              key={index}
              type="button"
              data-word={word}
              className={cx("gloss-word", on && "gloss-word-on", echo === word && "gloss-word-echo")}
              aria-expanded={on}
              aria-controls={on ? id : undefined}
              aria-label={`${display(part)}: ver o significado`}
              onClick={() => {
                if (window.getSelection()?.toString()) return;
                onPick(on ? null : word);
              }}
            >
              {display(part)}
            </button>
          );
          // O hífen (e o maqaf) fica colado à palavra anterior: a linha pode
          // quebrar depois dele, nunca antes.
          if (!joiner || joiner === " ") return button;
          return (
            <span key={index} className="whitespace-nowrap">
              {button}
              {joiner}
            </span>
          );
        })}
      </p>
      {/* Anuncia o significado para leitores de tela quando o balão abre ou muda de palavra. */}
      <span className="sr-only" aria-live="polite">
        {active !== null && Array.isArray(words) && words[active]
          ? `${display(parts[active * 2] ?? "")}: ${words[active].g.replace(/\*/g, "")}`
          : ""}
      </span>
      {active !== null ? (
        <WordBubble
          ref={bubbleRef}
          id={id}
          layer={layer}
          lang={lang}
          index={active}
          count={count}
          heWord={display(splitWords(he, "he")[active * 2] ?? "")}
          trWord={splitWords(tr, "tr")[active * 2]?.replace(/[.]$/, "") ?? ""}
          info={Array.isArray(words) ? words[active] : words}
          reference={reference}
          translation={translation}
          onMove={(step) => onPick((active + step + count) % count)}
          onClose={onClose}
        />
      ) : null}
    </div>
  );
}

/** Balão do significado de uma palavra, com a tradução do versículo a um toque. */
function WordBubble({
  ref,
  id,
  layer,
  lang,
  index,
  count,
  heWord,
  trWord,
  info,
  reference,
  translation,
  onMove,
  onClose,
}: {
  ref: Ref<HTMLDivElement>;
  id: string;
  layer: GlossLayer;
  lang: OriginalLang;
  index: number;
  count: number;
  heWord: string;
  trWord: string;
  info: WordInfo | "loading" | null | undefined;
  reference: string;
  translation: string;
  onMove: (step: 1 | -1) => void;
  onClose: () => void;
}) {
  const [showVerse, setShowVerse] = useState(false);
  // Só o hebraico corre da direita para a esquerda; o grego e o transliterado, não.
  const rtl = layer === "he" && ORIGINAL[lang].dir === "rtl";
  return (
    <div
      ref={ref}
      id={id}
      role="region"
      aria-label={`Significado de ${heWord}`}
      className={cx("gloss-bubble", rtl ? "gloss-bubble-he" : "gloss-bubble-tr")}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-tekhelet">Palavra</span>
        <span className="text-xs text-muted tabular-nums">
          {reference} · {index + 1} de {count}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="-my-1.5 -mr-3 ml-auto grid size-11 place-items-center rounded-full text-muted hover:bg-raised hover:text-fg"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span {...originalProps(lang, "text-[1.7rem] leading-snug text-zahav")}>{heWord}</span>
        <span className="font-read text-[0.95rem] text-tekhelet italic">{trWord}</span>
      </div>

      {info === "loading" ? (
        <p className="mt-2 text-sm text-muted" role="status">
          Abrindo o significado…
        </p>
      ) : !info ? (
        <p className="mt-2 text-sm text-muted">O significado desta palavra não pôde ser aberto agora.</p>
      ) : (
        <>
          <p className="gloss-meaning mt-1.5">
            <NoteText text={info.g} />
          </p>
          {info.o ? (
            <p className="mt-0.5 text-sm text-soft">
              Também: <NoteText text={info.o} />
            </p>
          ) : null}
          <p className="mt-2 text-[13px] leading-snug text-muted">{info.m}</p>
          {info.l ? (
            <p className="mt-1 text-[13px] text-muted">
              Dicionário:{" "}
              <span {...originalProps(lang, "text-base text-soft")}>{info.l}</span>
            </p>
          ) : null}
        </>
      )}

      {showVerse ? (
        <p className="gloss-text mt-3 border-t border-line pt-2.5">
          <PtText text={translation} />
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-1.5" dir={rtl ? "rtl" : "ltr"}>
        <button
          type="button"
          onClick={() => onMove(-1)}
          aria-label="Palavra anterior"
          className="grid size-11 place-items-center rounded-full border border-line text-soft hover:text-fg"
        >
          {rtl ? <ChevronRight className="size-4" aria-hidden /> : <ChevronLeft className="size-4" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          aria-label="Próxima palavra"
          className="grid size-11 place-items-center rounded-full border border-line text-soft hover:text-fg"
        >
          {rtl ? <ChevronLeft className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={() => setShowVerse(!showVerse)}
          aria-expanded={showVerse}
          className="ms-auto inline-flex h-11 items-center rounded-full px-3 text-sm font-semibold text-tekhelet hover:bg-raised"
        >
          {showVerse ? "Ocultar versículo" : "Versículo inteiro"}
        </button>
      </div>
    </div>
  );
}

/**
 * Versículo palavra por palavra: cada palavra do original com o transliterado
 * e o significado embaixo. Um toque mostra a gramática e a forma de dicionário.
 */
export function InterlinearLine({
  lang,
  he,
  tr,
  showTr,
  display,
  words,
}: {
  lang: OriginalLang;
  he: string;
  tr: string;
  showTr: boolean;
  display: (word: string) => string;
  words: WordInfo[] | "loading" | null;
}) {
  const [active, setActive] = useState<number | null>(null);
  const heWords = splitWords(he, "he").filter((_, index) => index % 2 === 0);
  const trWords = splitWords(tr, "tr").filter((_, index) => index % 2 === 0);
  const info = active === null || !Array.isArray(words) ? null : words[active];

  return (
    <div>
      <ol className="flex flex-wrap gap-2" dir={ORIGINAL[lang].dir} aria-label="Palavra por palavra">
        {heWords.map((word, index) => {
          const on = active === index;
          const gloss = Array.isArray(words) ? words[index]?.g : undefined;
          return (
            <li key={index}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setActive(on ? null : index)}
                className={cx("inter-word", on && "inter-word-on")}
              >
                <span {...originalProps(lang, "inter-original")}>{display(word)}</span>
                {showTr ? (
                  <span className="inter-tr" dir="ltr">
                    {(trWords[index] ?? "").replace(/[.,;:!?]+$/, "")}
                  </span>
                ) : null}
                <span className="inter-gloss" dir="ltr">
                  {words === "loading" ? "…" : gloss ? <NoteText text={gloss} /> : "—"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {active !== null ? (
        <div className="mt-3 rounded-2xl border border-line bg-sunken/60 px-4 py-3" aria-live="polite">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-semibold text-muted tabular-nums">
              Palavra {active + 1} de {heWords.length}
            </span>
            <span {...originalProps(lang, "text-2xl leading-tight text-zahav")}>{display(heWords[active] ?? "")}</span>
          </div>
          {info ? (
            <>
              <p className="gloss-meaning mt-1">
                <NoteText text={info.g} />
              </p>
              {info.o ? (
                <p className="mt-0.5 text-sm text-soft">
                  Também: <NoteText text={info.o} />
                </p>
              ) : null}
              <p className="mt-2 text-[13px] leading-snug text-muted">{info.m}</p>
              {info.l ? (
                <p className="mt-1 text-[13px] text-muted">
                  Dicionário: <span {...originalProps(lang, "text-base text-soft")}>{info.l}</span>
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">
              {words === "loading" ? "Abrindo o significado…" : "O significado desta palavra não pôde ser aberto agora."}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
