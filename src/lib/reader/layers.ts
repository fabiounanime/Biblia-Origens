import { create } from "zustand";

/**
 * Camadas visíveis no leitor (português, hebraico, transliterado).
 * Preferência só deste aparelho: não entra na sincronização da conta.
 */
export type LayerId = "pt" | "he" | "tr";

export const LAYERS: { id: LayerId; label: string; dot: string }[] = [
  { id: "pt", label: "Português", dot: "bg-fg" },
  { id: "he", label: "Hebraico", dot: "bg-zahav" },
  { id: "tr", label: "Transliterado", dot: "bg-tekhelet" },
];

const KEY = "bo-layers-v1";

type LayerState = {
  pt: boolean;
  he: boolean;
  tr: boolean;
  hydrated: boolean;
  hydrate: () => void;
  toggle: (id: LayerId) => void;
};

function save(state: Pick<LayerState, LayerId>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ pt: state.pt, he: state.he, tr: state.tr }));
  } catch {
    // Armazenamento indisponível: a preferência vale só nesta visita.
  }
}

export const useLayers = create<LayerState>((set, get) => ({
  pt: true,
  he: true,
  tr: true,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      const data = raw ? (JSON.parse(raw) as Partial<Record<LayerId, unknown>>) : {};
      set({
        hydrated: true,
        pt: data.pt !== false,
        he: data.he !== false,
        tr: data.tr !== false,
      });
    } catch {
      set({ hydrated: true });
    }
  },
  toggle: (id) => {
    const state = get();
    const next = { pt: state.pt, he: state.he, tr: state.tr, [id]: !state[id] };
    // Sempre ao menos uma camada visível.
    if (!next.pt && !next.he && !next.tr) return;
    set(next);
    save(next);
  },
}));
