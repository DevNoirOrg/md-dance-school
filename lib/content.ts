import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Room, SettingsKey, SettingsMap, Teacher } from "./content-types";
import { db, hasDb } from "./db";
import { defaultRawRooms, defaultSettings, defaultTeachers, type RawRoom } from "./defaults";
import { classChip, classFull } from "./format";

/*
  A publikus oldal tartalma — gyorsítótárazva. Az oldal statikus marad; az
  admin mentéskor az updateTag(CONTENT_TAG) hívással azonnal frissíti.
  Adatbázis nélkül (nincs DATABASE_URL) a lib/defaults.ts tartalma látszik.
*/
export const CONTENT_TAG = "site-content";

const SETTINGS_KEYS = Object.keys(defaultSettings) as SettingsKey[];

export async function readSettings(): Promise<SettingsMap> {
  if (!hasDb()) return defaultSettings;
  const rows = await db()<{ key: SettingsKey; value: unknown }[]>`select key, value from mdschool.settings`;
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<SettingsMap>;
  // Hiányzó kulcs (pl. egy később hozzáadott rész) → alapérték, hogy az oldal ne álljon le.
  // Meglévő kulcsnál az alapértékkel egészítjük ki az új mezőket.
  const out = {} as Record<SettingsKey, unknown>;
  for (const k of SETTINGS_KEYS) {
    const v = stored[k];
    out[k] = v && typeof v === "object" ? { ...defaultSettings[k], ...v } : defaultSettings[k];
  }
  return out as SettingsMap;
}

export function buildRooms(raw: RawRoom[]): Room[] {
  return raw.map((r) => ({
    id: r.id,
    name: r.name,
    shortName: r.shortName,
    columns: r.columns.map((col) => ({
      heading: col.heading,
      classes: col.classes.map((c) => ({
        id: c.id,
        time: c.time,
        title: c.title,
        chip: classChip(r.shortName, col.heading, c.time),
        full: classFull(r.name, col.heading, c.time, c.title),
      })),
    })),
  }));
}

export async function readRooms(): Promise<Room[]> {
  if (!hasDb()) return buildRooms(defaultRawRooms);
  const rooms = await db()<{ id: string; name: string; short_name: string; column_headings: string[] }[]>`
    select id, name, short_name, column_headings from mdschool.rooms order by sort, name`;
  const classes = await db()<{ id: string; room_id: string; col: number; time: string; title: string }[]>`
    select id, room_id, col, time, title from mdschool.classes order by col, sort`;
  return buildRooms(
    rooms.map((r) => ({
      id: r.id,
      name: r.name,
      shortName: r.short_name,
      columns: r.column_headings.map((heading, col) => ({
        heading,
        classes: classes.filter((c) => c.room_id === r.id && c.col === col),
      })),
    })),
  );
}

export async function readTeachers(): Promise<Teacher[]> {
  if (!hasDb()) return defaultTeachers;
  const rows = await db()<{ id: string; name: string; style: string; image_path: string; video_url: string }[]>`
    select id, name, style, image_path, video_url from mdschool.teachers order by sort, name`;
  return rows.map((r) => ({ id: r.id, name: r.name, style: r.style, imagePath: r.image_path, videoUrl: r.video_url }));
}

export type SiteContent = {
  settings: SettingsMap;
  rooms: Room[];
  teachers: Teacher[];
};

/** A teljes publikus tartalom egy gyorsítótárazott lekérdezésben. */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  const [settings, rooms, teachers] = await Promise.all([readSettings(), readRooms(), readTeachers()]);
  return { settings, rooms, teachers };
}
