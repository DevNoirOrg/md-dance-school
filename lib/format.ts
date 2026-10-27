/** A Supabase Storage bucket, amibe az admin a képeket / videókat tölti. */
export const MEDIA_BUCKET = "mdschool";

/** Kép/videó címe: "/..." = a public mappából, "http…" = külső, egyébként a Supabase Storage-ból. */
export function mediaUrl(path: string): string {
  if (path.startsWith("/") || path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

/** "Hétfő - Szerda" → "Hétfő – Szerda" (a feliratokban nagykötőjellel). */
export const dashed = (s: string) => s.replace(/ - /g, " – ");

/** Kiválasztás-chip felirata: „Nagy · Hétfő – Szerda 18:30”. */
export function classChip(roomShort: string, heading: string, time: string): string {
  return `${roomShort} · ${dashed(heading)} ${time.split("-")[0].trim()}`.trim();
}

/** A jelentkezésbe kerülő teljes óraleírás: „Nagy terem · Hétfő – Szerda · 18:30-20:00 · Hip-hop Dalmával”. */
export function classFull(roomName: string, heading: string, time: string, title: string): string {
  return [roomName, dashed(heading), time, title].filter((x) => x.trim()).join(" · ");
}

/** Életkor a születési dátumból ("2010-05-12"); érvénytelen dátumnál null. */
export function ageFrom(value: string, today?: Date): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(value + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  // a mai dátumot csak érvényes bemenetnél kérjük le (üres űrlap előrenderelésekor ne)
  const now = today ?? new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

/** Ennyi éves kor alatt kell a szülő neve és e-mail címe az órajelentkezésben. */
export const PARENT_REQUIRED_UNDER_AGE = 16;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
