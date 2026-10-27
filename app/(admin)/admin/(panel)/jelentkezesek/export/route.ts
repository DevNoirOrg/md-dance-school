import { listCampApplications, listClassApplications, parseKind, parseStatus, STATUSES } from "@/lib/applications";
import { getAdmin } from "@/lib/auth";

/* CSV export (Excelben is megnyitható: UTF-8 BOM + pontosvessző). ?tipus=orak|tabor&statusz=… */
export async function GET(request: Request) {
  const admin = await getAdmin();
  if (!admin) return new Response("Nincs jogosultság", { status: 401 });

  const params = new URL(request.url).searchParams;
  const kind = parseKind(params.get("tipus") ?? undefined);
  const status = parseStatus(params.get("statusz") ?? undefined, "osszes");
  const label = (id: string) => STATUSES.find((s) => s.id === id)?.label ?? id;
  const when = (iso: string) => new Date(iso).toLocaleString("hu-HU");

  let header: string[];
  let rows: (string | null)[][];
  if (kind === "tabor") {
    header = ["Beküldve", "Státusz", "Táborlakó", "E-mail", "Telefon", "Születési dátum", "Pólóméret", "Turnus", "Fizetési mód",
      "Szülő neve", "Szülő telefon", "Lakcím", "Fontos tudnivaló", "Honnan hallott", "Kitöltő", "Belső megjegyzés"];
    rows = (await listCampApplications(status)).map((a) => [
      when(a.createdAt), label(a.status), a.nev, a.email, a.telefon, a.szuletes, a.polo, a.turnus.join(" | "), a.fizetes,
      a.szuloNev, a.szuloTelefon, a.lakcim, a.tudnivalo, a.honnan, a.kitolto, a.adminNote,
    ]);
  } else {
    header = ["Beküldve", "Státusz", "Vezetéknév", "Keresztnév", "E-mail", "Születési dátum", "Szülő neve", "Szülő e-mail",
      "Tánctapasztalat", "Kezdés", "Órák", "Megjegyzés", "Belső megjegyzés"];
    rows = (await listClassApplications(status)).map((a) => [
      when(a.createdAt), label(a.status), a.vezeteknev, a.keresztnev, a.email, a.szuletes, a.szuloNev, a.szuloEmail,
      a.tapasztalat, a.kezdes, a.classes.join(" | "), a.megjegyzes, a.adminNote,
    ]);
  }

  const cell = (v: string | null | undefined) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jelentkezesek-${kind}-${status}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
