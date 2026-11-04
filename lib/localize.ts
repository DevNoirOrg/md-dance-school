import type { DeepPartial } from "./content-types";
import type { NewsItem, SettingsMap } from "./content-types";
import type { Room, Teacher } from "./content-types";
import type { Locale } from "./i18n";
import { classChip, classFull } from "./format.ts";

const OMIT_TRANSLATION_KEYS = /^(id|key|slug|imagePath|reelPath|videoUrl|url|href|email|phone|publishedOn|dateLabel|time|price|mark|note|emoji|teachers|closed|format)$/i;
const SOCIAL_LABELS = new Set(["Instagram", "Facebook", "YouTube", "TikTok"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function merge(base: unknown, translation: unknown): unknown {
  if (typeof base === "string") {
    return typeof translation === "string" && translation.trim() ? translation : base;
  }
  if (Array.isArray(base)) {
    return base.map((value, index) => merge(value, Array.isArray(translation) ? translation[index] : undefined));
  }
  if (isRecord(base)) {
    const translated = isRecord(translation) ? translation : {};
    return Object.fromEntries(
      Object.entries(base)
        .filter(([key]) => key !== "en")
        .map(([key, value]) => [key, merge(value, translated[key])]),
    );
  }
  return base;
}

export function localize<T extends { en?: DeepPartial<unknown> }>(value: T, locale: Locale): T {
  return locale === "en" ? (merge(value, value.en) as T) : value;
}

export function localizeSettings(settings: SettingsMap, locale: Locale): SettingsMap {
  if (locale === "hu") return settings;
  return Object.fromEntries(Object.entries(settings).map(([key, value]) => [key, localize(value, locale)])) as SettingsMap;
}

function plainText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
}

export function hasEnglishNews(item: NewsItem): boolean {
  const en = item.en;
  return !!en?.title?.trim() && (!!(en.bodyHtml && plainText(en.bodyHtml)) || !!en.excerpt?.trim());
}

function englishDateLabel(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.valueOf())
    ? date
    : new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(parsed);
}

export function localizeNews(news: NewsItem[], locale: Locale): NewsItem[] {
  if (locale === "hu") return news;
  return news.filter(hasEnglishNews).map((item) => ({
    ...localize(item, locale),
    dateLabel: englishDateLabel(item.publishedOn),
  }));
}

export function localizeRooms(rooms: Room[], locale: Locale): Room[] {
  if (locale === "hu") return rooms;
  return rooms.map((room) => {
    const localizedRoom = localize(room, locale);
    return {
      ...localizedRoom,
      columns: localizedRoom.columns.map((column) => ({
        ...column,
        classes: column.classes.map((item) => ({
          ...item,
          chip: classChip(localizedRoom.shortName, column.heading, item.time),
          full: classFull(localizedRoom.name, column.heading, item.time, item.title),
        })),
      })),
    };
  });
}

export function localizeTeachers(teachers: Teacher[], locale: Locale): Teacher[] {
  return locale === "hu" ? teachers : teachers.map((teacher) => localize(teacher, locale));
}

function countText(value: unknown, translation: unknown, key = ""): number {
  if (typeof value === "string") {
    if (!value.trim() || OMIT_TRANSLATION_KEYS.test(key) || (key === "label" && SOCIAL_LABELS.has(value))) return 0;
    return typeof translation === "string" && translation.trim() ? 0 : 1;
  }
  if (Array.isArray(value)) {
    return value.reduce((count, item, index) => count + countText(item, Array.isArray(translation) ? translation[index] : undefined, String(index)), 0);
  }
  if (isRecord(value)) {
    const translated = isRecord(translation) ? translation : {};
    return Object.entries(value).reduce(
      (count, [childKey, child]) =>
        childKey === "en" ? count : count + countText(child, translated[childKey], childKey),
      0,
    );
  }
  return 0;
}

export function missingTranslationCount(value: unknown): number {
  if (!isRecord(value)) return 0;
  return countText(value, value.en);
}

function getPath(value: unknown, path: (string | number)[]): unknown {
  return path.reduce<unknown>((current, key) => {
    if (Array.isArray(current) && typeof key === "number") return current[key];
    if (isRecord(current) && typeof key === "string") return current[key];
    return undefined;
  }, value);
}

function setPath(value: unknown, path: (string | number)[], next: string): unknown {
  if (path.length === 0) return next;
  const [key, ...rest] = path;
  if (typeof key === "number") {
    const array = Array.isArray(value) ? [...value] : [];
    array[key] = setPath(array[key], rest, next);
    return array;
  }
  const record = isRecord(value) ? { ...value } : {};
  record[key] = setPath(record[key], rest, next);
  return record;
}

export function translationValue(value: unknown, path: (string | number)[]): string {
  const root = isRecord(value) ? value.en : undefined;
  const found = getPath(root, path);
  return typeof found === "string" ? found : "";
}

export function updateTranslation<T>(value: T, path: (string | number)[], text: string): T {
  const record: Record<string, unknown> = isRecord(value) ? value : {};
  return { ...record, en: setPath(record.en, path, text) } as T;
}

function withoutTranslations(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutTranslations);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "en")
        .map(([key, child]) => [key, withoutTranslations(child)]),
    );
  }
  return value;
}

export function translationDraft<T>(value: T): T {
  let draft = withoutTranslations(value);
  for (const field of translationFields(value)) {
    draft = setPath(draft, field.path, translationValue(value, field.path));
  }
  return draft as T;
}

export function applyTranslationDraft<T>(value: T, draft: T): T {
  return translationFields(value).reduce((next, field) => {
    const translated = getPath(draft, field.path);
    return updateTranslation(next, field.path, typeof translated === "string" ? translated : "");
  }, value);
}

function collect(value: unknown, path: (string | number)[] = [], parentKey = ""): { path: (string | number)[]; label: string; value: string }[] {
  if (typeof value === "string") {
    if (!value.trim() || OMIT_TRANSLATION_KEYS.test(parentKey) || (parentKey === "label" && SOCIAL_LABELS.has(value))) return [];
    return [{ path, label: path.map(String).join(" / "), value }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collect(item, [...path, index], parentKey));
  }
  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, child]) =>
      key === "en" ? [] : collect(child, [...path, key], key),
    );
  }
  return [];
}

export function translationFields(value: unknown) {
  return collect(value);
}

export function readTranslation(value: unknown, path: (string | number)[]): string {
  return translationValue(value, path);
}
