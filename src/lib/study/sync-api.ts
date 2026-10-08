import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { BOOK_IDS } from "@/lib/bible/catalog";
import { GUIDE_IDS } from "@/lib/bible/guides";
import type {
  FontScale,
  GuideProgress,
  GuideStatus,
  Mark,
  Position,
  Prefs,
  SyncPull,
  SyncPush,
  ThemeName,
} from "@/lib/study/types";

const SCALES = new Set<FontScale>(["sm", "md", "lg", "xl"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asObject(input: unknown): Record<string, unknown> | null {
  if (!input || typeof input !== "object") return null;
  return input as Record<string, unknown>;
}

function clampTime(value: unknown, serverNow: string): string | null {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return null;
  const max = Date.parse(serverNow);
  return new Date(Math.min(Date.parse(value), max)).toISOString();
}

function cleanPrefs(value: unknown, serverNow: string): Prefs | null {
  const row = asObject(value);
  if (!row) return null;
  const theme: ThemeName | null = row.theme === "light" || row.theme === "dark" ? row.theme : null;
  const fontScale = SCALES.has(row.fontScale as FontScale) ? (row.fontScale as FontScale) : null;
  const updatedAt = clampTime(row.updatedAt, serverNow);
  if (!theme || !fontScale || !updatedAt) return null;
  return { theme, fontScale, showNiqqud: row.showNiqqud !== false, updatedAt };
}

function cleanPosition(value: unknown, serverNow: string): Position | null {
  const row = asObject(value);
  if (!row || typeof row.bookId !== "string" || !BOOK_IDS.has(row.bookId)) return null;
  const chapter = typeof row.chapter === "number" ? Math.floor(row.chapter) : 0;
  const verse = typeof row.verse === "number" ? Math.floor(row.verse) : -1;
  const updatedAt = clampTime(row.updatedAt, serverNow);
  if (!updatedAt || chapter < 1 || chapter > 200 || verse < 0 || verse > 200) return null;
  return { bookId: row.bookId, chapter, verse, updatedAt };
}

function cleanMark(value: unknown, serverNow: string): Mark | null {
  const row = asObject(value);
  if (!row || typeof row.id !== "string" || !UUID.test(row.id)) return null;
  if (row.kind !== "bookmark" && row.kind !== "note") return null;
  if (typeof row.bookId !== "string" || !BOOK_IDS.has(row.bookId)) return null;
  const chapter = typeof row.chapter === "number" ? Math.floor(row.chapter) : 0;
  const verse = typeof row.verse === "number" ? Math.floor(row.verse) : -1;
  const updatedAt = clampTime(row.updatedAt, serverNow);
  if (!updatedAt || chapter < 1 || chapter > 200 || verse < 0 || verse > 200) return null;
  const deletedAt = row.deletedAt == null ? null : clampTime(row.deletedAt, serverNow);
  if (row.deletedAt != null && !deletedAt) return null;
  const body = typeof row.body === "string" ? row.body.slice(0, 4000) : null;
  return { id: row.id, kind: row.kind, bookId: row.bookId, chapter, verse, body, updatedAt, deletedAt };
}

function cleanGuide(value: unknown, serverNow: string): GuideProgress | null {
  const row = asObject(value);
  if (!row || typeof row.guideId !== "string" || !GUIDE_IDS.has(row.guideId)) return null;
  const status: GuideStatus | null = row.status === "done" || row.status === "reading" ? row.status : null;
  const updatedAt = clampTime(row.updatedAt, serverNow);
  if (!status || !updatedAt) return null;
  return { guideId: row.guideId, status, updatedAt };
}

export const syncStudy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: SyncPush) => input)
  .handler(async ({ context, data }): Promise<SyncPull> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const userId = context.userId;
    const clock = await sql<{ server_now: string }>`
      select to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as server_now
    `;
    const serverNow = clock[0]?.server_now ?? new Date().toISOString();
    const payload = asObject(data) ?? {};
    const prefs = cleanPrefs(payload.prefs, serverNow);
    const position = cleanPosition(payload.position, serverNow);
    const marks = Array.isArray(payload.marks)
      ? payload.marks.map((mark) => cleanMark(mark, serverNow)).filter((mark): mark is Mark => !!mark).slice(0, 1000)
      : [];
    const guides = Array.isArray(payload.guides)
      ? payload.guides.map((guide) => cleanGuide(guide, serverNow)).filter((guide): guide is GuideProgress => !!guide)
      : [];

    if (prefs) {
      await sql`
        insert into user_prefs (user_id, theme, font_scale, show_niqqud, updated_at)
        values (${userId}, ${prefs.theme}, ${prefs.fontScale}, ${prefs.showNiqqud}, ${prefs.updatedAt}::timestamptz)
        on conflict (user_id) do update set
          theme = excluded.theme,
          font_scale = excluded.font_scale,
          show_niqqud = excluded.show_niqqud,
          updated_at = excluded.updated_at
        where user_prefs.updated_at <= excluded.updated_at
      `;
    }
    if (position) {
      await sql`
        insert into reading_position (user_id, book_id, chapter, verse, updated_at)
        values (${userId}, ${position.bookId}, ${position.chapter}, ${position.verse}, ${position.updatedAt}::timestamptz)
        on conflict (user_id) do update set
          book_id = excluded.book_id,
          chapter = excluded.chapter,
          verse = excluded.verse,
          updated_at = excluded.updated_at
        where reading_position.updated_at <= excluded.updated_at
      `;
    }
    for (const mark of marks) {
      await sql`
        insert into marks (id, user_id, kind, book_id, chapter, verse, body, updated_at, deleted_at)
        values (
          ${mark.id}, ${userId}, ${mark.kind}, ${mark.bookId}, ${mark.chapter}, ${mark.verse},
          ${mark.body}, ${mark.updatedAt}::timestamptz, ${mark.deletedAt}::timestamptz
        )
        on conflict (id) do update set
          kind = excluded.kind,
          book_id = excluded.book_id,
          chapter = excluded.chapter,
          verse = excluded.verse,
          body = excluded.body,
          updated_at = excluded.updated_at,
          deleted_at = excluded.deleted_at
        where marks.user_id = ${userId}
          and marks.updated_at <= excluded.updated_at
      `;
    }
    for (const guide of guides) {
      await sql`
        insert into guide_progress (user_id, guide_id, status, updated_at)
        values (${userId}, ${guide.guideId}, ${guide.status}, ${guide.updatedAt}::timestamptz)
        on conflict (user_id, guide_id) do update set
          status = excluded.status,
          updated_at = excluded.updated_at
        where guide_progress.updated_at <= excluded.updated_at
      `;
    }

    const since = clampTime(payload.cursor, serverNow) ?? "1970-01-01T00:00:00.000Z";
    const prefRows = await sql<PrefRow>`
      select theme, font_scale,
        case when show_niqqud then 'true' else 'false' end as show_niqqud,
        to_char(updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at
      from user_prefs
      where user_id = ${userId}
        and updated_at > ${since}::timestamptz
        and updated_at <= ${serverNow}::timestamptz
    `;

    return pullSince(sql, userId, since, serverNow, prefRows);
  });

type PrefRow = {
  theme: string;
  font_scale: string;
  show_niqqud: string;
  updated_at: string;
};

async function pullSince(
  sql: Awaited<ReturnType<typeof import("@/lib/db").getSql>>,
  userId: string,
  since: string,
  serverNow: string,
  prefRows: PrefRow[],
): Promise<SyncPull> {
  const pref = prefRows[0];
  const positionRows = await sql<{
    book_id: string;
    chapter: number;
    verse: number;
    updated_at: string;
  }>`
    select book_id, chapter, verse,
      to_char(updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at
    from reading_position
    where user_id = ${userId}
      and updated_at > ${since}::timestamptz
      and updated_at <= ${serverNow}::timestamptz
  `;
  const markRows = await sql<{
    id: string;
    kind: string;
    book_id: string;
    chapter: number;
    verse: number;
    body: string | null;
    updated_at: string;
    deleted_at: string | null;
  }>`
    select id, kind, book_id, chapter, verse, body,
      to_char(updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at,
      to_char(deleted_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as deleted_at
    from marks
    where user_id = ${userId}
      and updated_at > ${since}::timestamptz
      and updated_at <= ${serverNow}::timestamptz
  `;
  const guideRows = await sql<{
    guide_id: string;
    status: string;
    updated_at: string;
  }>`
    select guide_id, status,
      to_char(updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at
    from guide_progress
    where user_id = ${userId}
      and updated_at > ${since}::timestamptz
      and updated_at <= ${serverNow}::timestamptz
  `;
  const position = positionRows[0];
  return {
    serverNow,
    prefs: pref
      ? {
          theme: pref.theme === "light" ? "light" : "dark",
          fontScale: SCALES.has(pref.font_scale as FontScale) ? (pref.font_scale as FontScale) : "md",
          showNiqqud: pref.show_niqqud === "true",
          updatedAt: pref.updated_at,
        }
      : null,
    position: position
      ? {
          bookId: position.book_id,
          chapter: position.chapter,
          verse: position.verse,
          updatedAt: position.updated_at,
        }
      : null,
    marks: markRows
      .filter((row) => row.kind === "bookmark" || row.kind === "note")
      .map((row) => ({
        id: row.id,
        kind: row.kind as Mark["kind"],
        bookId: row.book_id,
        chapter: row.chapter,
        verse: row.verse,
        body: row.body,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
      })),
    guides: guideRows
      .filter((row) => row.status === "reading" || row.status === "done")
      .map((row) => ({
        guideId: row.guide_id,
        status: row.status as GuideStatus,
        updatedAt: row.updated_at,
      })),
  };
}
