import "server-only";
import { db } from "./db";

/*
  Jelentkezések az adminban: órajelentkezések (mdschool.applications) és
  tánctábor-jelentkezések (mdschool.camp_applications). Mindkettő ugyanazt a
  státuszrendszert használja.
*/

export const STATUSES = [
  { id: "uj", label: "Új", badge: "bg-md-cyan text-ink" },
  { id: "felvettuk", label: "Felvettük", badge: "bg-emerald-100 text-emerald-800" },
  { id: "elutasitva", label: "Elutasítva", badge: "bg-red-100 text-red-700" },
  { id: "archivalt", label: "Archivált", badge: "bg-slate-200 text-slate-600" },
] as const;
export type StatusId = (typeof STATUSES)[number]["id"];
export type StatusFilter = StatusId | "osszes";

export const KINDS = [
  { id: "orak", label: "Órák" },
  { id: "tabor", label: "Tánctábor" },
] as const;
export type Kind = (typeof KINDS)[number]["id"];

export function parseStatus(v: string | undefined, fallback: StatusFilter = "uj"): StatusFilter {
  if (v === "osszes") return v;
  return STATUSES.some((s) => s.id === v) ? (v as StatusId) : fallback;
}
export const parseKind = (v: string | undefined): Kind => (v === "tabor" ? "tabor" : "orak");

type Meta = {
  id: string;
  createdAt: string;
  status: StatusId;
  adminNote: string;
  statusUpdatedAt: string | null;
  statusUpdatedBy: string | null;
};

type MetaRow = {
  id: string;
  created_at: Date;
  status: StatusId;
  admin_note: string;
  status_updated_at: Date | null;
  status_updated_by: string | null;
};

const meta = (r: MetaRow): Meta => ({
  id: r.id,
  createdAt: r.created_at.toISOString(),
  status: r.status,
  adminNote: r.admin_note,
  statusUpdatedAt: r.status_updated_at?.toISOString() ?? null,
  statusUpdatedBy: r.status_updated_by,
});

// ---------------------------------------------------------------------
//  Órajelentkezések
// ---------------------------------------------------------------------
export type ClassApplication = Meta & {
  vezeteknev: string;
  keresztnev: string;
  email: string;
  szuletes: string;
  szuloNev: string | null;
  szuloEmail: string | null;
  tapasztalat: string;
  kezdes: string;
  megjegyzes: string;
  classes: string[];
};

type ClassRow = MetaRow & {
  vezeteknev: string;
  keresztnev: string;
  email: string;
  szuletes: string;
  szulo_nev: string | null;
  szulo_email: string | null;
  tapasztalat: string;
  kezdes: string;
  megjegyzes: string;
  classes: string[];
};

const mapClass = (r: ClassRow): ClassApplication => ({
  ...meta(r),
  vezeteknev: r.vezeteknev,
  keresztnev: r.keresztnev,
  email: r.email,
  szuletes: r.szuletes,
  szuloNev: r.szulo_nev,
  szuloEmail: r.szulo_email,
  tapasztalat: r.tapasztalat,
  kezdes: r.kezdes,
  megjegyzes: r.megjegyzes,
  classes: r.classes,
});

export async function listClassApplications(status: StatusFilter): Promise<ClassApplication[]> {
  const rows =
    status === "osszes"
      ? await db()<ClassRow[]>`select * from mdschool.applications order by created_at desc limit 2000`
      : await db()<ClassRow[]>`select * from mdschool.applications where status = ${status} order by created_at desc limit 2000`;
  return rows.map(mapClass);
}

export async function getClassApplication(id: string): Promise<ClassApplication | null> {
  if (!isUuid(id)) return null;
  const rows = await db()<ClassRow[]>`select * from mdschool.applications where id = ${id}`;
  return rows[0] ? mapClass(rows[0]) : null;
}

// ---------------------------------------------------------------------
//  Tánctábor-jelentkezések
// ---------------------------------------------------------------------
export type CampApplication = Meta & {
  nev: string;
  email: string;
  telefon: string;
  szuletes: string;
  polo: string;
  tudnivalo: string;
  szuloNev: string;
  szuloTelefon: string;
  lakcim: string;
  turnus: string[];
  fizetes: string;
  honnan: string;
  kitolto: string;
};

type CampRow = MetaRow & {
  nev: string;
  email: string;
  telefon: string;
  szuletes: string;
  polo: string;
  tudnivalo: string;
  szulo_nev: string;
  szulo_telefon: string;
  lakcim: string;
  turnus: string[];
  fizetes: string;
  honnan: string;
  kitolto: string;
};

const mapCamp = (r: CampRow): CampApplication => ({
  ...meta(r),
  nev: r.nev,
  email: r.email,
  telefon: r.telefon,
  szuletes: r.szuletes,
  polo: r.polo,
  tudnivalo: r.tudnivalo,
  szuloNev: r.szulo_nev,
  szuloTelefon: r.szulo_telefon,
  lakcim: r.lakcim,
  turnus: r.turnus,
  fizetes: r.fizetes,
  honnan: r.honnan,
  kitolto: r.kitolto,
});

export async function listCampApplications(status: StatusFilter): Promise<CampApplication[]> {
  const rows =
    status === "osszes"
      ? await db()<CampRow[]>`select * from mdschool.camp_applications order by created_at desc limit 2000`
      : await db()<CampRow[]>`select * from mdschool.camp_applications where status = ${status} order by created_at desc limit 2000`;
  return rows.map(mapCamp);
}

export async function getCampApplication(id: string): Promise<CampApplication | null> {
  if (!isUuid(id)) return null;
  const rows = await db()<CampRow[]>`select * from mdschool.camp_applications where id = ${id}`;
  return rows[0] ? mapCamp(rows[0]) : null;
}

// ---------------------------------------------------------------------
//  Számlálók
// ---------------------------------------------------------------------
export async function countByStatus(kind: Kind): Promise<Record<string, number>> {
  const rows =
    kind === "tabor"
      ? await db()<{ status: string; n: number }[]>`
          select status, count(*)::int as n from mdschool.camp_applications group by status`
      : await db()<{ status: string; n: number }[]>`
          select status, count(*)::int as n from mdschool.applications group by status`;
  return Object.fromEntries(rows.map((r) => [r.status, r.n]));
}

export function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
