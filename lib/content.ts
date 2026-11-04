import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { NewsItem, Room, SettingsKey, SettingsMap, Teacher } from "./content-types";
import { db, hasDb } from "./db";
import { defaultNews, defaultRawRooms, defaultSettings, defaultTeachers, type RawRoom } from "./defaults";
import { classChip, classFull, newsDateLabel } from "./format";

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
    en: r.en,
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
  const rooms = await db()<{ id: string; name: string; short_name: string; column_headings: string[]; translations: Room["en"] }[]>`
    select id, name, short_name, column_headings, translations from mdschool.rooms order by sort, name`;
  const classes = await db()<{ id: string; room_id: string; col: number; time: string; title: string }[]>`
    select id, room_id, col, time, title from mdschool.classes order by col, sort`;
  return buildRooms(
    rooms.map((r) => ({
      id: r.id,
      name: r.name,
      shortName: r.short_name,
      en: r.translations,
      columns: r.column_headings.map((heading, col) => ({
        heading,
        classes: classes.filter((c) => c.room_id === r.id && c.col === col),
      })),
    })),
  );
}

export async function readTeachers(): Promise<Teacher[]> {
  if (!hasDb()) return defaultTeachers;
  const rows = await db()<{ id: string; name: string; style: string; image_path: string; video_url: string; translations: Teacher["en"] }[]>`
    select id, name, style, image_path, video_url, translations from mdschool.teachers order by sort, name`;
  return rows.map((r) => ({ id: r.id, name: r.name, style: r.style, imagePath: r.image_path, videoUrl: r.video_url, en: r.translations }));
}

export async function readNews(): Promise<NewsItem[]> {
  if (!hasDb()) return defaultNews;
  const rows = await db()<
    {
      id: string;
      published_on: string;
      slug: string;
      title: string;
      excerpt: string;
      body_html: string;
      image_path: string | null;
      image_alt: string | null;
      placeholder_label: string;
      format: "landscape" | "portrait";
      translations: NewsItem["en"];
    }[]
  >`
    select id, published_on, slug, title, excerpt, body_html, image_path, image_alt, placeholder_label, format, translations
    from mdschool.news order by published_on desc, created_at desc`;
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    publishedOn: r.published_on,
    dateLabel: newsDateLabel(r.published_on),
    title: r.title,
    excerpt: r.excerpt,
    bodyHtml: r.body_html,
    imagePath: r.image_path,
    imageAlt: r.image_alt ?? "",
    placeholderLabel: r.placeholder_label,
    format: r.format,
    en: r.translations,
  }));
}

// Cache-elt hírlista a slug szerinti kereséshez — NEM admin-olvasás (ahhoz
// a sima, mindig friss readNews() kell). Szándékosan nem vesz át argumentumot:
// a "use cache" függvénybe adott kérés-specifikus érték (pl. a route params-ból
// jövő slug) prerenderelés közben "A `use cache` function took too long..."
// hibát okoz — ezért a slug szerinti szűrés a cache-határon KÍVÜL történik.
async function cachedNewsList(): Promise<NewsItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  return readNews();
}

/** Egy hír a saját oldalához (slug alapján) — adatbázis nélkül a helyőrzők közül keres. */
export async function getNewsPage(slug: string): Promise<NewsItem | null> {
  const news = await cachedNewsList();
  return news.find((n) => n.slug === slug) ?? null;
}

export type SiteContent = {
  settings: SettingsMap;
  rooms: Room[];
  teachers: Teacher[];
  news: NewsItem[];
};

/** A teljes publikus tartalom egy gyorsítótárazott lekérdezésben. */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  const [settings, rooms, teachers, news] = await Promise.all([readSettings(), readRooms(), readTeachers(), readNews()]);
  return { settings, rooms, teachers, news };
}
