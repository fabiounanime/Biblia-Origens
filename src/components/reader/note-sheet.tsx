import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui";
import { findMark, useStudy } from "@/lib/study/store";

/** Rascunhos não salvos, por versículo: fechar a gaveta sem salvar não perde o texto. */
const noteDrafts = new Map<string, string>();

export function NoteSheet({
  bookId,
  bookName,
  chapter,
  verse,
  onClose,
}: {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number | null;
  onClose: () => void;
}) {
  const marks = useStudy((state) => state.marks);
  const saveNote = useStudy((state) => state.saveNote);
  const note = verse === null ? undefined : findMark(marks, bookId, chapter, verse, "note");
  const [draft, setDraft] = useState("");
  const draftKey = `${bookId}/${chapter}/${verse}`;

  useEffect(() => {
    if (verse !== null) setDraft(noteDrafts.get(draftKey) ?? note?.body ?? "");
    // Só ao abrir: não sobrescreve o que está sendo digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse]);

  const close = (saved: boolean) => {
    if (saved || draft === (note?.body ?? "")) noteDrafts.delete(draftKey);
    else noteDrafts.set(draftKey, draft);
    onClose();
  };

  const ref = verse === null ? "" : verse === 0 ? `${bookName} ${chapter}` : `${bookName} ${chapter}:${verse}`;

  return (
    <Sheet
      open={verse !== null}
      onOpenChange={(open) => {
        if (!open) close(false);
      }}
      title={verse === 0 ? "Nota do capítulo" : "Nota"}
      description={ref}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (verse === null) return;
          saveNote(bookId, chapter, verse, draft);
          close(true);
        }}
      >
        <label className="block">
          <span className="sr-only">Texto da nota</span>
          <textarea
            value={draft}
            maxLength={4000}
            onChange={(event) => setDraft(event.target.value)}
            rows={6}
            placeholder="Escreva o que você percebeu neste texto…"
            className="w-full resize-y rounded-2xl border border-field bg-bg px-4 py-3 text-base leading-relaxed placeholder:text-muted focus:border-tekhelet/60 focus:outline-none"
          />
        </label>
        <p className="mt-1 text-right text-xs text-muted tabular-nums">{draft.length}/4000</p>
        <div className="mt-4 flex gap-2">
          {note ? (
            <button
              type="button"
              onClick={() => {
                if (verse === null || !note) return;
                const body = note.body ?? "";
                saveNote(bookId, chapter, verse, "");
                close(true);
                toast("Nota apagada", {
                  description: ref,
                  action: { label: "Desfazer", onClick: () => saveNote(bookId, chapter, verse, body) },
                });
              }}
              className="h-12 rounded-full border border-line px-5 font-semibold text-shani"
            >
              Apagar nota
            </button>
          ) : null}
          <button type="submit" className="h-12 flex-1 rounded-full bg-tekhelet font-semibold text-on-accent">
            Salvar nota
          </button>
        </div>
      </form>
    </Sheet>
  );
}
