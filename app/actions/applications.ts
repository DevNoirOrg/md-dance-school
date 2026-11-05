"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import {
  checkCampApplication,
  checkClassApplication,
  type CampApplicationInput,
  type ClassApplicationInput,
} from "@/lib/application-input";
import { readRooms, readSettings } from "@/lib/content";
import { db, hasDb } from "@/lib/db";
import { renderEmail, sendEmail } from "@/lib/email";
import { adminBaseUrl } from "@/lib/urls";
import { localize, localizeRooms } from "@/lib/localize";
import { t, type Locale } from "@/lib/i18n";

/*
  A két publikus jelentkezés beküldése (órák és tánctábor):
   - szerveroldali validáció (lib/application-input.ts)
   - spamvédelem: rejtett csapdamező + IP-nkénti korlát (5 / óra)
   - mentés az adatbázisba (admin → Jelentkezések), majd a válasz UTÁN
     e-mail értesítés (after) — a látogatónak nem kell rá várnia
*/

const RATE_LIMIT_PER_HOUR = 5;

export type ApplicationResult = { ok: true } | { ok: false; error: string };

const notConfigured = (locale: Locale): ApplicationResult => ({ ok: false, error: t(locale).form.serverError });

async function clientIpHash(): Promise<string | null> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT || "mdschool";
  return createHash("sha256").update(salt + ":" + ip).digest("hex");
}

async function rateLimited(table: "applications" | "camp_applications", ipHash: string | null) {
  if (!ipHash) return false;
  const [{ n }] =
    table === "applications"
      ? await db()<{ n: number }[]>`select count(*)::int as n from mdschool.applications
          where ip_hash = ${ipHash} and created_at > now() - interval '1 hour'`
      : await db()<{ n: number }[]>`select count(*)::int as n from mdschool.camp_applications
          where ip_hash = ${ipHash} and created_at > now() - interval '1 hour'`;
  return n >= RATE_LIMIT_PER_HOUR;
}

const notifyList = () =>
  (process.env.APPLICATION_NOTIFY_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Értesítés a stúdiónak + (ha be van kapcsolva) visszaigazolás a jelentkezőnek. */
function notify(opts: {
  subject: string;
  name: string;
  email: string;
  cc?: string;
  rows: [string, string][];
  confirmRows?: [string, string][];
  adminPath: string;
  confirmIntro: string;
  locale?: Locale;
}) {
  after(async () => {
    const to = notifyList();
    if (to.length) {
      const mail = renderEmail({
        title: opts.subject,
        rows: opts.rows,
        button: { label: "Megnyitom az adminban", href: `${adminBaseUrl()}${opts.adminPath}` },
      });
      await sendEmail({ to, replyTo: opts.email, subject: opts.subject, ...mail });
    }
    if (process.env.APPLICANT_CONFIRMATION_ENABLED === "true") {
      const mail = renderEmail({
        title: opts.locale === "en" ? "Thank you for signing up!" : "Köszönjük a jelentkezést!",
        intro: opts.confirmIntro,
        rows: opts.confirmRows ?? opts.rows,
        outro: opts.locale === "en" ? "If you need to make any changes, simply reply to this email." : "Ha valamit módosítanál, egyszerűen válaszolj erre az e-mailre.",
      });
      await sendEmail({
        to: opts.email,
        cc: opts.cc ? [opts.cc] : undefined,
        replyTo: to[0],
        subject: opts.locale === "en" ? "We've received your application — MD Dance School" : "Megkaptuk a jelentkezésedet — MD Dance School",
        ...mail,
      });
    }
  });
}

// ---------------------------------------------------------------------
//  Órajelentkezés
// ---------------------------------------------------------------------
export async function submitClassApplication(raw: ClassApplicationInput): Promise<ApplicationResult> {
  const locale: Locale = raw.locale === "en" ? "en" : "hu";
  if (!hasDb()) return notConfigured(locale);
  const settings = await readSettings();
  const experience = raw.tapasztalat;
  const englishOptions = settings.form_options.en?.experience;
  const englishIndex = locale === "en" && englishOptions ? englishOptions.indexOf(experience) : -1;
  const normalizedRaw = {
    ...raw,
    tapasztalat: englishIndex >= 0 ? settings.form_options.experience[englishIndex] : experience,
  };
  const checked = checkClassApplication(normalizedRaw, settings.form_options);
  if (!checked.ok) return checked;
  const input = checked.data;
  // Csapdamező kitöltve → bot. Úgy teszünk, mintha sikerült volna.
  if (input.website) return { ok: true };

  // Az órák leírását a szerver állítja össze az adatbázisból (nem bízunk a böngészőben).
  const rooms = await readRooms();
  const classLabels = rooms.flatMap((r) =>
    r.columns.flatMap((col) => col.classes.filter((c) => input.classIds.includes(c.id)).map((c) => c.full)),
  );
  if (classLabels.length === 0) {
    return { ok: false, error: t(locale).form.classChanged };
  }

  const ipHash = await clientIpHash();
  if (await rateLimited("applications", ipHash)) return { ok: false, error: t(locale).form.tooMany };

  const [row] = await db()<{ id: string }[]>`
    insert into mdschool.applications
      (nev, email, telefon, szuletes, szulo_nev, szulo_email, language,
       tapasztalat, megjegyzes, classes, consent_at, ip_hash)
    values
      (${input.nev}, ${input.email.toLowerCase()}, ${input.telefon}, ${input.szuletes},
       ${input.szulo_nev || null}, ${input.szulo_email ? input.szulo_email.toLowerCase() : null}, ${locale},
       ${input.tapasztalat}, ${input.megjegyzes}, ${classLabels}, now(), ${ipHash})
    returning id`;

  const name = input.nev;
  const rows: [string, string][] = [
    ["Név", name],
    ["E-mail", input.email],
    ["Telefon", input.telefon],
    ["Születési dátum", input.szuletes],
  ];
  if (input.szulo_nev || input.szulo_email) rows.push(["Szülő", [input.szulo_nev, input.szulo_email].filter(Boolean).join(" · ")]);
  rows.push(["Nyelv", locale === "en" ? "angol" : "magyar"]);
  rows.push(["Tánctapasztalat", input.tapasztalat], ["Órák", classLabels.join("\n")]);
  if (input.megjegyzes) rows.push(["Megjegyzés", input.megjegyzes]);

  const englishRooms = localizeRooms(rooms, "en");
  const englishClasses = englishRooms.flatMap((room) => room.columns.flatMap((column) =>
    column.classes.filter((item) => input.classIds.includes(item.id)).map((item) => item.full),
  ));
  const confirmRows: [string, string][] = [
    ["Name", input.nev], ["Email", input.email], ["Phone", input.telefon], ["Date of birth", input.szuletes],
  ];
  if (input.szulo_nev || input.szulo_email) confirmRows.push(["Parent", [input.szulo_nev, input.szulo_email].filter(Boolean).join(" · ")]);
  confirmRows.push(["Dance experience", experience], ["Classes", englishClasses.join("\n")]);
  if (input.megjegyzes) confirmRows.push(["Note", input.megjegyzes]);

  notify({
    subject: `Új órajelentkezés: ${name}`,
    name,
    email: input.email,
    cc: input.szulo_email || undefined,
    rows,
    confirmRows,
    adminPath: `/jelentkezesek/${row.id}`,
    confirmIntro: locale === "en"
      ? `Hi ${input.nev}, we have received your application and will contact you soon.`
      : `Kedves ${input.nev}! Megkaptuk a jelentkezésedet, hamarosan keresünk a megadott e-mail címen.`,
    locale,
  });
  return { ok: true };
}

// ---------------------------------------------------------------------
//  Tánctábor-jelentkezés
// ---------------------------------------------------------------------
export async function submitCampApplication(raw: CampApplicationInput): Promise<ApplicationResult> {
  const locale: Locale = raw.locale === "en" ? "en" : "hu";
  if (!hasDb()) return notConfigured(locale);
  const { camp } = await readSettings();
  const englishCamp = localize(camp, "en");
  const englishForm = camp.en?.form;
  const mapValue = (value: string, english: string[] | undefined, hungarian: string[]) => {
    const index = english?.indexOf(value) ?? -1;
    return index >= 0 ? hungarian[index] : value;
  };
  const normalizedRaw = {
    ...raw,
    polo: mapValue(raw.polo, englishForm?.shirtSizes, camp.form.shirtSizes),
    fizetes: mapValue(raw.fizetes, englishForm?.payments, camp.form.payments),
    honnan: mapValue(raw.honnan, englishForm?.sources, camp.form.sources),
    kitolto: mapValue(raw.kitolto, englishForm?.fillers, camp.form.fillers),
  };
  const checked = checkCampApplication(normalizedRaw, camp);
  if (!checked.ok) return checked;
  const input = checked.data;
  if (input.website) return { ok: true };

  const turnusLabels = camp.turnusok.filter((t) => input.turnus.includes(t.id)).map((t) => `${t.label} (${t.dates})`);
  const englishTurnusLabels = englishCamp.turnusok
    .filter((t) => input.turnus.includes(t.id))
    .map((t) => `${t.label} (${t.dates})`);

  const ipHash = await clientIpHash();
  if (await rateLimited("camp_applications", ipHash)) return { ok: false, error: t(locale).camp.tooMany };

  const [row] = await db()<{ id: string }[]>`
    insert into mdschool.camp_applications
      (nev, email, telefon, szuletes, polo, tudnivalo, szulo_nev, szulo_telefon, lakcim,
       turnus, fizetes, honnan, kitolto, language, consent_at, ip_hash)
    values
      (${input.nev}, ${input.email.toLowerCase()}, ${input.telefon}, ${input.szuletes}, ${input.polo},
       ${input.tudnivalo}, ${input.szulo_nev}, ${input.szulo_telefon}, ${input.lakcim},
       ${turnusLabels}, ${input.fizetes}, ${input.honnan}, ${input.kitolto}, ${locale}, now(), ${ipHash})
    returning id`;

  const rows: [string, string][] = [
    ["Táborlakó", input.nev],
    ["E-mail", input.email],
    ["Telefon", input.telefon],
    ["Születési dátum", input.szuletes],
    ["Pólóméret", input.polo],
    ["Turnus", turnusLabels.join("\n")],
    ["Fizetési mód", input.fizetes],
  ];
  if (input.szulo_nev || input.szulo_telefon) {
    rows.push(["Szülő / gondviselő", [input.szulo_nev, input.szulo_telefon].filter(Boolean).join(" · ")]);
  }
  if (input.lakcim) rows.push(["Lakcím", input.lakcim]);
  if (input.tudnivalo) rows.push(["Fontos tudnivaló", input.tudnivalo]);
  rows.push(["Honnan hallott róla", input.honnan], ["Kitöltő", input.kitolto]);
  if (locale === "en") rows.push(["Nyelv", "angol"]);

  const confirmRows: [string, string][] = [
    ["Camper", input.nev], ["Email", input.email], ["Phone", input.telefon], ["Date of birth", input.szuletes],
    ["T-shirt size", raw.polo], ["Session", englishTurnusLabels.join("\n")], ["Payment method", raw.fizetes],
  ];
  if (input.szulo_nev || input.szulo_telefon) confirmRows.push(["Parent / guardian", [input.szulo_nev, input.szulo_telefon].filter(Boolean).join(" · ")]);
  if (input.lakcim) confirmRows.push(["Address", input.lakcim]);
  if (input.tudnivalo) confirmRows.push(["Important information", input.tudnivalo]);
  confirmRows.push(["How did you hear about us?", raw.honnan], ["Form completed by", raw.kitolto]);

  notify({
    subject: `Új tánctábor-jelentkezés: ${input.nev}`,
    name: input.nev,
    email: input.email,
    rows,
    confirmRows,
    adminPath: `/jelentkezesek/tabor/${row.id}`,
    confirmIntro: locale === "en"
      ? "We have received your dance camp application. We will confirm it by email and send payment information."
      : "Megkaptuk a tánctábor-jelentkezést! Hamarosan e-mailben visszaigazoljuk, és megírjuk a befizetéssel kapcsolatos tudnivalókat.",
    locale,
  });
  return { ok: true };
}
