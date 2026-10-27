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

/*
  A két publikus jelentkezés beküldése (órák és tánctábor):
   - szerveroldali validáció (lib/application-input.ts)
   - spamvédelem: rejtett csapdamező + IP-nkénti korlát (5 / óra)
   - mentés az adatbázisba (admin → Jelentkezések), majd a válasz UTÁN
     e-mail értesítés (after) — a látogatónak nem kell rá várnia
*/

const RATE_LIMIT_PER_HOUR = 5;

export type ApplicationResult = { ok: true } | { ok: false; error: string };

const NOT_CONFIGURED: ApplicationResult = {
  ok: false,
  error: "Az online jelentkezés átmenetileg nem elérhető. Kérjük, írj nekünk e-mailt vagy hívj minket.",
};
const TOO_MANY: ApplicationResult = {
  ok: false,
  error: "Túl sok jelentkezés érkezett innen rövid időn belül. Kérjük, próbáld újra később.",
};

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
  adminPath: string;
  confirmIntro: string;
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
        title: "Köszönjük a jelentkezést!",
        intro: opts.confirmIntro,
        rows: opts.rows,
        outro: "Ha valamit módosítanál, egyszerűen válaszolj erre az e-mailre.",
      });
      await sendEmail({
        to: opts.email,
        cc: opts.cc ? [opts.cc] : undefined,
        replyTo: to[0],
        subject: "Megkaptuk a jelentkezésedet — MD Dance School",
        ...mail,
      });
    }
  });
}

// ---------------------------------------------------------------------
//  Órajelentkezés
// ---------------------------------------------------------------------
export async function submitClassApplication(raw: ClassApplicationInput): Promise<ApplicationResult> {
  if (!hasDb()) return NOT_CONFIGURED;
  const settings = await readSettings();
  const checked = checkClassApplication(raw, settings.form_options);
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
    return { ok: false, error: "A kiválasztott órák időközben megváltoztak. Töltsd újra az oldalt, és válassz újra." };
  }

  const ipHash = await clientIpHash();
  if (await rateLimited("applications", ipHash)) return TOO_MANY;

  const [row] = await db()<{ id: string }[]>`
    insert into mdschool.applications
      (vezeteknev, keresztnev, email, szuletes, szulo_nev, szulo_email,
       tapasztalat, kezdes, megjegyzes, classes, consent_at, ip_hash)
    values
      (${input.vezeteknev}, ${input.keresztnev}, ${input.email.toLowerCase()}, ${input.szuletes},
       ${input.minor ? input.szulo_nev : null}, ${input.minor ? input.szulo_email.toLowerCase() : null},
       ${input.tapasztalat}, ${input.kezdes}, ${input.megjegyzes}, ${classLabels}, now(), ${ipHash})
    returning id`;

  const name = `${input.vezeteknev} ${input.keresztnev}`;
  const rows: [string, string][] = [
    ["Név", name],
    ["E-mail", input.email],
    ["Születési dátum", input.szuletes],
  ];
  if (input.minor) rows.push(["Szülő", `${input.szulo_nev} · ${input.szulo_email}`]);
  rows.push(["Tánctapasztalat", input.tapasztalat], ["Kezdés", input.kezdes], ["Órák", classLabels.join("\n")]);
  if (input.megjegyzes) rows.push(["Megjegyzés", input.megjegyzes]);

  notify({
    subject: `Új órajelentkezés: ${name}`,
    name,
    email: input.email,
    cc: input.minor ? input.szulo_email : undefined,
    rows,
    adminPath: `/jelentkezesek/${row.id}`,
    confirmIntro: `Kedves ${input.keresztnev}! Megkaptuk a jelentkezésedet, hamarosan keresünk a megadott e-mail címen.`,
  });
  return { ok: true };
}

// ---------------------------------------------------------------------
//  Tánctábor-jelentkezés
// ---------------------------------------------------------------------
export async function submitCampApplication(raw: CampApplicationInput): Promise<ApplicationResult> {
  if (!hasDb()) return NOT_CONFIGURED;
  const { camp } = await readSettings();
  const checked = checkCampApplication(raw, camp);
  if (!checked.ok) return checked;
  const input = checked.data;
  if (input.website) return { ok: true };

  const turnusLabels = camp.turnusok.filter((t) => input.turnus.includes(t.id)).map((t) => `${t.label} (${t.dates})`);

  const ipHash = await clientIpHash();
  if (await rateLimited("camp_applications", ipHash)) return TOO_MANY;

  const [row] = await db()<{ id: string }[]>`
    insert into mdschool.camp_applications
      (nev, email, telefon, szuletes, polo, tudnivalo, szulo_nev, szulo_telefon, lakcim,
       turnus, fizetes, honnan, kitolto, consent_at, ip_hash)
    values
      (${input.nev}, ${input.email.toLowerCase()}, ${input.telefon}, ${input.szuletes}, ${input.polo},
       ${input.tudnivalo}, ${input.szulo_nev}, ${input.szulo_telefon}, ${input.lakcim},
       ${turnusLabels}, ${input.fizetes}, ${input.honnan}, ${input.kitolto}, now(), ${ipHash})
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

  notify({
    subject: `Új tánctábor-jelentkezés: ${input.nev}`,
    name: input.nev,
    email: input.email,
    rows,
    adminPath: `/jelentkezesek/tabor/${row.id}`,
    confirmIntro:
      "Megkaptuk a tánctábor-jelentkezést! Hamarosan e-mailben visszaigazoljuk, és megírjuk a befizetéssel kapcsolatos tudnivalókat.",
  });
  return { ok: true };
}
