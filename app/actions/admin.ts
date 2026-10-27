"use server";

import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSetting, removeMedia, saveSetting, touch } from "@/lib/admin-data";
import { assertAdmin } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/content";
import { db } from "@/lib/db";
import { MEDIA_BUCKET, supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

/*
  Az admin felület összes írási művelete. Mindegyik:
    1) ellenőrzi, hogy admin hívja (assertAdmin),
    2) zod-dal validálja a bemenetet,
    3) ment, naplózza ki módosított (edit_log),
    4) azonnal frissíti a publikus oldalt (updateTag).
*/

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const fail = (error: string): ActionResult => ({ ok: false, error });

async function run(fn: (email: string) => Promise<ActionResult | void>): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const res = await fn(admin.email);
    return res ?? { ok: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.issues[0];
      return fail(first?.message && !first.message.startsWith("Invalid") ? first.message : "Hiányzó vagy hibás mező.");
    }
    console.error("[admin action]", err);
    return fail(err instanceof Error ? err.message : "Ismeretlen hiba történt.");
  }
}

const text = (max = 500, label = "Mező") => z.string().trim().max(max, `${label}: legfeljebb ${max} karakter.`);
const required = (max = 500, label = "Mező") => text(max, label).min(1, `${label}: nem lehet üres.`);
const mediaPath = z
  .string()
  .regex(/^(\/[\w./-]+|(images|videos)\/[\w./-]+)$/, "Érvénytelen fájl.")
  .max(300);
const url = (label = "Link") =>
  z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^https?:\/\//.test(v), `${label}: http(s)://-sel kezdődjön.`);
const mark = z.enum(["", "*", "**"]);
const lines = (maxItems: number, maxLen = 120, label = "Sor") => z.array(required(maxLen, label)).max(maxItems);

// ---------------------------------------------------------------------
//  Feltöltés: egyszer használatos, közvetlen feltöltési link a Storage-ba
// ---------------------------------------------------------------------
const uploadSchema = z.object({
  kind: z.enum(["image", "video"]),
  contentType: z.enum(["image/webp", "image/jpeg", "image/png", "video/mp4"]),
});

export async function createUploadTarget(
  input: z.input<typeof uploadSchema>,
): Promise<{ ok: true; path: string; token: string } | { ok: false; error: string }> {
  try {
    await assertAdmin();
    const { kind, contentType } = uploadSchema.parse(input);
    if (kind === "video" && contentType !== "video/mp4") return { ok: false, error: "Csak MP4 videó tölthető fel." };
    if (kind === "image" && contentType === "video/mp4") return { ok: false, error: "Ez nem kép." };
    const ext = contentType.split("/")[1];
    const path = `${kind}s/${new Date().getFullYear()}/${randomUUID()}.${ext}`;
    const { data, error } = await supabaseAdmin().storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
    if (error || !data) return { ok: false, error: "Nem sikerült feltöltési linket kérni: " + (error?.message ?? "") };
    return { ok: true, path: data.path, token: data.token };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Hiba a feltöltés előkészítésekor." };
  }
}

// ---------------------------------------------------------------------
//  Hero · Rólunk · Szolgáltatások (egy oldalon, egyben mentődik)
// ---------------------------------------------------------------------
const heroSchema = z.object({
  title: required(40, "Cím"),
  lead: text(300, "Bemutatkozó mondat"),
  imagePath: mediaPath,
});
const aboutSchema = z.object({
  titleLine1: required(60, "Cím 1. sor"),
  titleLine2: text(60, "Cím 2. sor"),
  paragraphs: text(5000, "Bekezdések"),
  imagePath: mediaPath,
  imageAlt: text(200, "Kép leírása"),
});
const servicesSchema = z.object({
  heroTitle: required(40, "Fejléc cím"),
  heroLead: text(300, "Fejléc szöveg"),
  kicker: text(60, "Felső felirat"),
  title: required(120, "Cím"),
  text: text(2000, "Szöveg"),
  highlights: lines(8, 80, "Kiemelés"),
  url: url("Az MD Dance Company oldal címe").refine((v) => v !== "", "Add meg az MD Dance Company oldal címét."),
  buttonLabel: required(60, "Gomb felirata"),
});
const textsSchema = z.object({ hero: heroSchema, about: aboutSchema, services: servicesSchema });

export async function saveTexts(input: z.input<typeof textsSchema>) {
  return run(async (email) => {
    const { hero, about, services } = textsSchema.parse(input);
    const [oldHero, oldAbout] = await Promise.all([getSetting("hero"), getSetting("about")]);
    await saveSetting("hero", hero, email);
    await saveSetting("about", about, email);
    await saveSetting("services", services, email);
    await touch("texts", email);
    if (oldHero.imagePath !== hero.imagePath) await removeMedia(oldHero.imagePath);
    if (oldAbout.imagePath !== about.imagePath) await removeMedia(oldAbout.imagePath);
    updateTag(CONTENT_TAG);
  });
}

// ---------------------------------------------------------------------
//  Árak
// ---------------------------------------------------------------------
const pricesSchema = z.object({
  items: z.array(z.object({ name: required(80, "Megnevezés"), price: required(30, "Ár"), note: mark })).max(40),
  notes: z.array(z.object({ mark, text: required(300, "Megjegyzés") })).max(8),
});

export async function savePrices(input: z.input<typeof pricesSchema>) {
  return run(async (email) => {
    await saveSetting("prices", pricesSchema.parse(input), email);
    await touch("prices", email);
    updateTag(CONTENT_TAG);
  });
}

// ---------------------------------------------------------------------
//  Tanfolyamok
// ---------------------------------------------------------------------
const coursesSchema = z.object({
  heroTitle: required(60, "Fejléc cím"),
  heroLead: text(300, "Fejléc szöveg"),
  title: required(60, "Cím"),
  intro: text(600, "Bevezető"),
  steps: z.array(z.object({ title: required(80, "Cím"), text: text(1500, "Szöveg") })).max(6),
  styles: z
    .array(z.object({ title: required(60, "Stílus neve"), text: text(1500, "Szöveg"), teachers: lines(8, 40, "Tanár") }))
    .max(20),
  groups: z.array(z.object({ title: required(60, "Csoport neve"), tag: text(40, "Címke"), text: text(1500, "Szöveg") })).max(20),
});

export async function saveCourses(input: z.input<typeof coursesSchema>) {
  return run(async (email) => {
    await saveSetting("courses", coursesSchema.parse(input), email);
    await touch("courses", email);
    updateTag(CONTENT_TAG);
  });
}

// ---------------------------------------------------------------------
//  Órarend (termek + órák) — az egész órarend egyben mentődik
// ---------------------------------------------------------------------
const classSchema = z.object({
  id: z.string().uuid().optional(),
  time: required(40, "Időpont"),
  title: required(80, "Óra neve"),
});
const roomSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: required(40, "Terem neve"),
    shortName: required(20, "Terem rövid neve"),
    headings: z.array(required(40, "Oszlopcím")).min(1, "Legalább egy oszlop kell.").max(4, "Legfeljebb 4 oszlop lehet."),
    columns: z.array(z.array(classSchema).max(20)).min(1).max(4),
  })
  .refine((r) => r.headings.length === r.columns.length, "Az oszlopok száma nem egyezik.");
const scheduleSchema = z.object({
  hint: text(160, "Felirat"),
  rooms: z.array(roomSchema).min(1, "Legalább egy terem kell.").max(6),
});

export async function saveSchedule(input: z.input<typeof scheduleSchema>) {
  return run(async (email) => {
    const { hint, rooms } = scheduleSchema.parse(input);
    await db().begin(async (tx) => {
      const keepIds = rooms.map((r) => r.id).filter((id): id is string => !!id);
      if (keepIds.length) await tx`delete from mdschool.rooms where id <> all(${keepIds}::uuid[])`;
      else await tx`delete from mdschool.rooms`;
      for (const [sort, room] of rooms.entries()) {
        const id = room.id ?? randomUUID();
        await tx`
          insert into mdschool.rooms (id, name, short_name, column_headings, sort, updated_at, updated_by)
          values (${id}, ${room.name}, ${room.shortName}, ${room.headings}, ${sort}, now(), ${email})
          on conflict (id) do update set name = excluded.name, short_name = excluded.short_name,
            column_headings = excluded.column_headings, sort = excluded.sort,
            updated_at = now(), updated_by = excluded.updated_by`;
        // Az órák azonosítója megmarad (a böngészőben épp kiválasztott órák így érvényesek maradnak).
        await tx`delete from mdschool.classes where room_id = ${id}`;
        for (const [col, classes] of room.columns.entries()) {
          for (const [i, c] of classes.entries()) {
            await tx`insert into mdschool.classes (id, room_id, col, sort, time, title)
                     values (${c.id ?? randomUUID()}, ${id}, ${col}, ${i}, ${c.time}, ${c.title})`;
          }
        }
      }
    });
    const old = await getSetting("schedule");
    await saveSetting("schedule", { ...old, hint }, email);
    await touch("schedule", email);
    updateTag(CONTENT_TAG);
  });
}

// ---------------------------------------------------------------------
//  Tanárok
// ---------------------------------------------------------------------
const teachersSchema = z.object({
  teachers: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        name: required(40, "Név"),
        style: text(80, "Stílus"),
        imagePath: mediaPath,
        videoUrl: url("Instagram-videó link"),
      }),
    )
    .max(40),
});

export async function saveTeachers(input: z.input<typeof teachersSchema>) {
  return run(async (email) => {
    const { teachers } = teachersSchema.parse(input);
    const names = teachers.map((t) => t.name.toLowerCase());
    if (new Set(names).size !== names.length) return fail("Két tanárnak nem lehet ugyanaz a neve.");
    const old = await db()<{ id: string; name: string; image_path: string }[]>`select id, name, image_path from mdschool.teachers`;
    await db().begin(async (tx) => {
      await tx`delete from mdschool.teachers`;
      for (const [sort, t] of teachers.entries()) {
        await tx`insert into mdschool.teachers (id, name, style, image_path, video_url, sort)
                 values (${t.id ?? randomUUID()}, ${t.name}, ${t.style}, ${t.imagePath}, ${t.videoUrl}, ${sort})`;
      }
    });
    // Átnevezett tanár: a tánctábor tanárlistájában is átírjuk a nevét.
    const renamed = new Map(
      old.flatMap((o) => {
        const now = teachers.find((t) => t.id === o.id);
        return now && now.name !== o.name ? [[o.name, now.name] as const] : [];
      }),
    );
    if (renamed.size) {
      const camp = await getSetting("camp");
      await saveSetting("camp", { ...camp, teachers: camp.teachers.map((n) => renamed.get(n) ?? n) }, email);
    }
    const kept = new Set(teachers.map((t) => t.imagePath));
    await removeMedia(...old.map((o) => o.image_path).filter((p) => !kept.has(p)));
    await touch("teachers", email);
    updateTag(CONTENT_TAG);
  });
}

// ---------------------------------------------------------------------
//  Hírek és események (plakátok a főoldalon)
// ---------------------------------------------------------------------
const newsSchema = z.object({
  title: required(60, "Cím"),
  items: z
    .array(
      z.object({
        imagePath: mediaPath,
        alt: required(120, "Kép leírása"),
        format: z.enum(["landscape", "portrait"]),
        link: url(),
      }),
    )
    .max(4, "Legfeljebb 4 plakát lehet."),
});

export async function saveNews(input: z.input<typeof newsSchema>) {
  return run(async (email) => {
    const value = newsSchema.parse(input);
    const old = await getSetting("news");
    await saveSetting("news", value, email);
    await touch("news", email);
    const kept = new Set(value.items.map((i) => i.imagePath));
    await removeMedia(...old.items.map((i) => i.imagePath).filter((p) => !kept.has(p)));
    updateTag(CONTENT_TAG);
  });
}

// ---------------------------------------------------------------------
//  Tánctábor
// ---------------------------------------------------------------------
const campSchema = z.object({
  badge: text(80, "Jelvény"),
  title: required(60, "Cím"),
  lead: text(600, "Bevezető"),
  sub: text(600, "Második bekezdés"),
  reelPath: mediaPath.nullable(),
  prices: z
    .array(z.object({ emoji: text(8, "Emoji"), name: required(60, "Jegytípus"), price: required(30, "Ár"), until: text(60, "Elérhető") }))
    .max(10),
  priceIncludes: text(1000, "Az ár tartalmazza"),
  priceExcludes: text(500, "Az ár nem tartalmazza"),
  turnusok: z
    .array(
      z.object({
        id: required(20, "Turnus azonosító").regex(/^[\w-]+$/, "Turnus azonosító: csak betű, szám, kötőjel."),
        label: required(40, "Turnus neve"),
        dates: required(40, "Dátum"),
        days: text(60, "Napok"),
        closed: z.boolean(),
        status: text(60, "Állapot"),
      }),
    )
    .min(1, "Legalább egy turnus kell.")
    .max(10),
  paymentMethods: lines(10, 800, "Befizetési mód"),
  meetingText: text(200, "Találkozó szöveg"),
  meetingTime: text(40, "Találkozó időpont"),
  endText: text(600, "Zárás"),
  locationName: text(120, "Helyszín"),
  locationAddress: text(160, "Cím"),
  importantText: text(1500, "Fontos tudnivaló"),
  applyText: text(1500, "Jelentkezési lehetőség"),
  teachers: lines(20, 40, "Tanár"),
  teacherRole: text(40, "Tanárok felirata"),
  form: z.object({
    shirtSizes: lines(12, 20, "Pólóméret").min(1, "Legalább egy pólóméret kell."),
    payments: lines(12, 80, "Fizetési mód").min(1, "Legalább egy fizetési mód kell."),
    sources: lines(15, 80, "Honnan hallott").min(1, "Legalább egy „honnan hallott” opció kell."),
    fillers: lines(10, 80, "Kitöltő").min(1, "Legalább egy kitöltő opció kell."),
  }),
});

export async function saveCamp(input: z.input<typeof campSchema>) {
  return run(async (email) => {
    const value = campSchema.parse(input);
    const ids = value.turnusok.map((t) => t.id);
    if (new Set(ids).size !== ids.length) return fail("Két turnusnak nem lehet ugyanaz az azonosítója.");
    const old = await getSetting("camp");
    await saveSetting("camp", value, email);
    await touch("camp", email);
    if (old.reelPath !== value.reelPath) await removeMedia(old.reelPath);
    updateTag(CONTENT_TAG);
  });
}

// ---------------------------------------------------------------------
//  Jelentkezési űrlap opciói
// ---------------------------------------------------------------------
const formOptionsSchema = z.object({
  experience: lines(12, 80, "Opció").min(1, "Legalább egy „Táncoltál már?” opció kell."),
  start: lines(12, 80, "Opció").min(1, "Legalább egy „Mikortól kezdenél?” opció kell."),
});

export async function saveFormOptions(input: z.input<typeof formOptionsSchema>) {
  return run(async (email) => {
    await saveSetting("form_options", formOptionsSchema.parse(input), email);
    await touch("form_options", email);
    updateTag(CONTENT_TAG);
  });
}

// ---------------------------------------------------------------------
//  Lábléc
// ---------------------------------------------------------------------
const footerSchema = z.object({
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "Érvénytelen e-mail cím."),
  phone: text(40, "Telefonszám"),
  addressLabel: text(60, "Cím felirata"),
  address: text(400, "Cím"),
  socials: z.array(z.object({ label: z.enum(["Instagram", "Facebook", "YouTube", "TikTok"]), href: url() })).max(4),
});

export async function saveFooter(input: z.input<typeof footerSchema>) {
  return run(async (email) => {
    await saveSetting("footer", footerSchema.parse(input), email);
    await touch("footer", email);
    updateTag(CONTENT_TAG);
  });
}

// ---------------------------------------------------------------------
//  Adatkezelési tájékoztató
// ---------------------------------------------------------------------
export async function savePrivacy(input: { text: string }) {
  return run(async (email) => {
    const value = z.object({ text: text(50000, "Szöveg") }).parse(input);
    await saveSetting("privacy", value, email);
    await touch("privacy", email);
    updateTag(CONTENT_TAG);
  });
}

// ---------------------------------------------------------------------
//  Jelentkezések (órák és tánctábor)
// ---------------------------------------------------------------------
const kindSchema = z.enum(["orak", "tabor"]);
const statusSchema = z.enum(["uj", "felvettuk", "elutasitva", "archivalt"]);

export async function setApplicationStatus(kind: "orak" | "tabor", id: string, status: z.input<typeof statusSchema>) {
  return run(async (email) => {
    const s = statusSchema.parse(status);
    const appId = z.string().uuid().parse(id);
    if (kindSchema.parse(kind) === "tabor") {
      await db()`update mdschool.camp_applications set status = ${s}, status_updated_at = now(), status_updated_by = ${email} where id = ${appId}`;
    } else {
      await db()`update mdschool.applications set status = ${s}, status_updated_at = now(), status_updated_by = ${email} where id = ${appId}`;
    }
  });
}

export async function saveApplicationNote(kind: "orak" | "tabor", id: string, note: string) {
  return run(async () => {
    const n = text(2000, "Megjegyzés").parse(note);
    const appId = z.string().uuid().parse(id);
    if (kindSchema.parse(kind) === "tabor") {
      await db()`update mdschool.camp_applications set admin_note = ${n} where id = ${appId}`;
    } else {
      await db()`update mdschool.applications set admin_note = ${n} where id = ${appId}`;
    }
  });
}

export async function deleteApplication(kind: "orak" | "tabor", id: string) {
  return run(async () => {
    const appId = z.string().uuid().parse(id);
    if (kindSchema.parse(kind) === "tabor") await db()`delete from mdschool.camp_applications where id = ${appId}`;
    else await db()`delete from mdschool.applications where id = ${appId}`;
  });
}

// ---------------------------------------------------------------------
//  Adminok
// ---------------------------------------------------------------------
export async function addAdmin(emailInput: string) {
  return run(async () => {
    const email = z.string().trim().toLowerCase().email("Érvénytelen e-mail cím.").parse(emailInput);
    await db()`insert into mdschool.admins (email) values (${email}) on conflict do nothing`;
  });
}

export async function removeAdmin(emailInput: string) {
  return run(async (me) => {
    const email = z.string().trim().toLowerCase().parse(emailInput);
    if (email === me) return fail("Saját magadat nem tudod eltávolítani.");
    const [{ n }] = await db()<{ n: number }[]>`select count(*)::int as n from mdschool.admins`;
    if (n <= 1) return fail("Az utolsó admint nem lehet eltávolítani.");
    await db()`delete from mdschool.admins where email = ${email}`;
  });
}

// ---------------------------------------------------------------------
//  Kijelentkezés
// ---------------------------------------------------------------------
export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/belepes");
}
