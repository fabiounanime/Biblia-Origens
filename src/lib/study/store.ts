import { create } from "zustand";
import { syncStudy } from "@/lib/study/sync-api";
import type {
  FontScale,
  GuideProgress,
  GuideStatus,
  Mark,
  Position,
  Prefs,
  SyncPull,
  ThemeName,
} from "@/lib/study/types";

const KEY = "bo-study-v1";

type StudyState = {
  ready: boolean;
  theme: ThemeName;
  fontScale: FontScale;
  showNiqqud: boolean;
  prefsUpdatedAt: string;
  position: Position | null;
  marks: Mark[];
  guides: GuideProgress[];
  cursor: string | null;
  syncing: boolean;
  syncError: string | null;
  hydrate: () => void;
  setTheme: (theme: ThemeName) => void;
  setFontScale: (fontScale: FontScale) => void;
  setShowNiqqud: (showNiqqud: boolean) => void;
  setPosition: (bookId: string, chapter: number, verse: number) => void;
  toggleBookmark: (bookId: string, chapter: number, verse: number) => void;
  saveNote: (bookId: string, chapter: number, verse: number, body: string) => void;
  setGuideStatus: (guideId: string, status: GuideStatus) => void;
  sync: () => Promise<void>;
};

const SCALES: FontScale[] = ["sm", "md", "lg", "xl"];

function now(): string {
  return new Date().toISOString();
}

function stamp(): string {
  return now();
}

function prefsOf(state: StudyState): Prefs {
  return {
    theme: state.theme,
    fontScale: state.fontScale,
    showNiqqud: state.showNiqqud,
    updatedAt: state.prefsUpdatedAt,
  };
}

function persist(state: StudyState) {
  if (typeof window === "undefined") return;
  const blob = {
    theme: state.theme,
    fontScale: state.fontScale,
    showNiqqud: state.showNiqqud,
    prefsUpdatedAt: state.prefsUpdatedAt,
    position: state.position,
    marks: state.marks,
    guides: state.guides,
    cursor: state.cursor,
  };
  localStorage.setItem(KEY, JSON.stringify(blob));
}

function newer(a: string, b: string): boolean {
  return Date.parse(a) >= Date.parse(b);
}

function mergeMarks(local: Mark[], remote: Mark[]): Mark[] {
  const map = new Map(local.map((mark) => [mark.id, mark]));
  for (const mark of remote) {
    const current = map.get(mark.id);
    if (!current || newer(mark.updatedAt, current.updatedAt)) map.set(mark.id, mark);
  }
  return [...map.values()];
}

function mergeGuides(local: GuideProgress[], remote: GuideProgress[]): GuideProgress[] {
  const map = new Map(local.map((row) => [row.guideId, row]));
  for (const row of remote) {
    const current = map.get(row.guideId);
    if (!current || newer(row.updatedAt, current.updatedAt)) map.set(row.guideId, row);
  }
  return [...map.values()];
}

function applyRemote(local: StudyState, remote: SyncPull): Partial<StudyState> {
  const next: Partial<StudyState> = {
    marks: mergeMarks(local.marks, remote.marks),
    guides: mergeGuides(local.guides, remote.guides),
  };
  if (remote.prefs && newer(remote.prefs.updatedAt, local.prefsUpdatedAt)) {
    next.theme = remote.prefs.theme;
    next.fontScale = remote.prefs.fontScale;
    next.showNiqqud = remote.prefs.showNiqqud;
    next.prefsUpdatedAt = remote.prefs.updatedAt;
  }
  if (remote.position) {
    if (!local.position || newer(remote.position.updatedAt, local.position.updatedAt)) {
      next.position = remote.position;
    }
  }
  return next;
}

function isUnauthorized(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  const status = "status" in error ? error.status : undefined;
  return status === 401 || message === "Unauthorized";
}

export function activeMarks(marks: Mark[]): Mark[] {
  return marks.filter((mark) => !mark.deletedAt);
}

export function findMark(
  marks: Mark[],
  bookId: string,
  chapter: number,
  verse: number,
  kind: Mark["kind"],
): Mark | undefined {
  return marks.find(
    (mark) =>
      mark.bookId === bookId &&
      mark.chapter === chapter &&
      mark.verse === verse &&
      mark.kind === kind &&
      !mark.deletedAt,
  );
}

export const useStudy = create<StudyState>((set, get) => ({
  ready: false,
  theme: "dark",
  fontScale: "md",
  showNiqqud: true,
  prefsUpdatedAt: "1970-01-01T00:00:00.000Z",
  position: null,
  marks: [],
  guides: [],
  cursor: null,
  syncing: false,
  syncError: null,
  hydrate: () => {
    if (get().ready || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        set({ ready: true });
        return;
      }
      const data = JSON.parse(raw) as Partial<StudyState>;
      set({
        ready: true,
        theme: data.theme === "light" ? "light" : "dark",
        fontScale: data.fontScale && SCALES.includes(data.fontScale) ? data.fontScale : "md",
        showNiqqud: data.showNiqqud !== false,
        prefsUpdatedAt: typeof data.prefsUpdatedAt === "string" ? data.prefsUpdatedAt : stamp(),
        position: data.position ?? null,
        marks: Array.isArray(data.marks) ? data.marks : [],
        guides: Array.isArray(data.guides) ? data.guides : [],
        cursor: typeof data.cursor === "string" ? data.cursor : null,
      });
    } catch {
      set({ ready: true });
    }
  },
  setTheme: (theme) => {
    set({ theme, prefsUpdatedAt: stamp() });
    persist(get());
  },
  setFontScale: (fontScale) => {
    set({ fontScale, prefsUpdatedAt: stamp() });
    persist(get());
  },
  setShowNiqqud: (showNiqqud) => {
    set({ showNiqqud, prefsUpdatedAt: stamp() });
    persist(get());
  },
  setPosition: (bookId, chapter, verse) => {
    set({ position: { bookId, chapter, verse, updatedAt: stamp() } });
    persist(get());
  },
  toggleBookmark: (bookId, chapter, verse) => {
    const marks = get().marks.slice();
    const index = marks.findIndex(
      (mark) => mark.bookId === bookId && mark.chapter === chapter && mark.verse === verse && mark.kind === "bookmark",
    );
    const updatedAt = stamp();
    if (index === -1) {
      marks.push({
        id: crypto.randomUUID(),
        kind: "bookmark",
        bookId,
        chapter,
        verse,
        body: null,
        updatedAt,
        deletedAt: null,
      });
    } else {
      const current = marks[index];
      if (!current) return;
      marks[index] = {
        ...current,
        updatedAt,
        deletedAt: current.deletedAt ? null : updatedAt,
      };
    }
    set({ marks });
    persist(get());
  },
  saveNote: (bookId, chapter, verse, body) => {
    const text = body.trim();
    const marks = get().marks.slice();
    const index = marks.findIndex(
      (mark) => mark.bookId === bookId && mark.chapter === chapter && mark.verse === verse && mark.kind === "note",
    );
    const updatedAt = stamp();
    if (!text) {
      if (index === -1) return;
      const current = marks[index];
      if (!current || current.deletedAt) return;
      marks[index] = { ...current, body: null, deletedAt: updatedAt, updatedAt };
    } else if (index === -1) {
      marks.push({
        id: crypto.randomUUID(),
        kind: "note",
        bookId,
        chapter,
        verse,
        body: text.slice(0, 4000),
        updatedAt,
        deletedAt: null,
      });
    } else {
      const current = marks[index];
      if (!current) return;
      marks[index] = {
        ...current,
        body: text.slice(0, 4000),
        deletedAt: null,
        updatedAt,
      };
    }
    set({ marks });
    persist(get());
  },
  setGuideStatus: (guideId, status) => {
    const guides = get().guides.filter((row) => row.guideId !== guideId);
    guides.push({ guideId, status, updatedAt: stamp() });
    set({ guides });
    persist(get());
  },
  sync: async () => {
    const start = get();
    if (start.syncing) return;
    set({ syncing: true, syncError: null });
    try {
      const remote = await syncStudy({
        data: {
          cursor: start.cursor,
          prefs: prefsOf(start),
          position: start.position,
          marks: start.marks,
          guides: start.guides,
        },
      });
      const latest = get();
      set({
        ...applyRemote(latest, remote),
        cursor: remote.serverNow,
        syncing: false,
        syncError: null,
      });
      persist(get());
    } catch (error) {
      set({
        syncing: false,
        syncError: isUnauthorized(error)
          ? "Entre na conta para sincronizar este aparelho."
          : "A sincronização falhou. O que você guardou continua neste aparelho.",
      });
    }
  },
}));
