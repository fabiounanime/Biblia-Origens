export type ThemeName = "dark" | "light";
export type FontScale = "sm" | "md" | "lg" | "xl";
export type MarkKind = "bookmark" | "note";
export type GuideStatus = "reading" | "done";

export type Position = {
  bookId: string;
  chapter: number;
  verse: number;
  updatedAt: string;
};

export type Mark = {
  id: string;
  kind: MarkKind;
  bookId: string;
  chapter: number;
  verse: number;
  body: string | null;
  updatedAt: string;
  deletedAt: string | null;
};

export type GuideProgress = {
  guideId: string;
  status: GuideStatus;
  updatedAt: string;
};

export type Prefs = {
  theme: ThemeName;
  fontScale: FontScale;
  showNiqqud: boolean;
  updatedAt: string;
};

export type SyncPush = {
  cursor: string | null;
  prefs: Prefs;
  position: Position | null;
  marks: Mark[];
  guides: GuideProgress[];
};

export type SyncPull = {
  serverNow: string;
  prefs: Prefs | null;
  position: Position | null;
  marks: Mark[];
  guides: GuideProgress[];
};
