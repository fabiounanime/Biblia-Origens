
export const HINT_KEY = "bo-dica-leitor-v1";

export const HINT_EVENT = "bo-dica-leitor";

/** Traz a dica de volta (botão nos ajustes de leitura). */
export function showReaderHint() {
  try {
    localStorage.removeItem(HINT_KEY);
  } catch {
    // Sem armazenamento: a dica aparece só nesta visita.
  }
  window.dispatchEvent(new Event(HINT_EVENT));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
