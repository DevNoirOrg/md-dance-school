import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import PanelLoading from "@/components/admin/PanelLoading";
import { PageHeader } from "@/components/admin/ui";
import {
  countByStatus,
  KINDS,
  listCampApplications,
  listClassApplications,
  parseKind,
  parseStatus,
  STATUSES,
} from "@/lib/applications";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Jelentkezések" };

type SP = Promise<{ statusz?: string; tipus?: string }>;

const fmt = (iso: string) => new Date(iso).toLocaleString("hu-HU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

type Row = { id: string; href: string; createdAt: string; status: string; name: string; tag?: string; detail: string };

async function ApplicationsPageContent({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const kind = parseKind(sp.tipus);
  const status = parseStatus(sp.statusz);
  const counts = await countByStatus(kind);
  const rows: Row[] =
    kind === "tabor"
      ? (await listCampApplications(status)).map((a) => ({
          id: a.id,
          href: `/admin/jelentkezesek/tabor/${a.id}`,
          createdAt: a.createdAt,
          status: a.status,
          name: a.nev,
          detail: `${a.turnus.join(" · ")} · ${a.fizetes}`,
        }))
      : (await listClassApplications(status)).map((a) => ({
          id: a.id,
          href: `/admin/jelentkezesek/${a.id}`,
          createdAt: a.createdAt,
          status: a.status,
          name: `${a.vezeteknev} ${a.keresztnev}`,
          tag: a.szuloNev ? "16 év alatti" : undefined,
          detail: a.classes.join(" · "),
        }));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const tabs = [...STATUSES.map((s) => ({ id: s.id as string, label: s.label, n: counts[s.id] ?? 0 })), { id: "osszes", label: "Összes", n: total }];
  const badge = (id: string) => STATUSES.find((s) => s.id === id);
  const q = (k: string, s: string) => `/admin/jelentkezesek?tipus=${k}&statusz=${s}`;

  return (
    <div className="pb-12">
      <PageHeader
        title="Jelentkezések"
        description="A weboldalon beküldött órajelentkezések és tánctábor-jelentkezések. Az 1 évnél régebbieket a rendszer automatikusan törli (adatkezelési tájékoztató)."
      >
        <a
          href={`/admin/jelentkezesek/export?tipus=${kind}&statusz=${status}`}
          className="inline-flex items-center rounded-xl bg-md-pale px-4 py-2.5 text-xs font-extrabold uppercase tracking-widest text-md-teal hover:bg-md-cyan hover:text-ink"
        >
          CSV letöltése
        </a>
      </PageHeader>

      <div className="mb-4 inline-flex rounded-xl bg-white p-1 shadow-sm">
        {KINDS.map((k) => (
          <Link
            key={k.id}
            href={q(k.id, "uj")}
            className={`rounded-lg px-4 py-2 text-xs font-extrabold uppercase tracking-widest ${k.id === kind ? "bg-ink text-white" : "text-slate-500 hover:text-ink"}`}
          >
            {k.label}
          </Link>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={q(kind, t.id)}
            className={`rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-widest transition-colors ${
              t.id === status ? "bg-ink text-white" : "bg-white text-slate-500 hover:text-ink"
            }`}
          >
            {t.label} <span className="opacity-60">{t.n}</span>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-[1.75rem] bg-white p-8 text-center text-sm text-slate-500">Nincs jelentkezés ebben a nézetben.</p>
      ) : (
        <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_10px_30px_-18px_rgba(13,13,13,0.35)]">
          <ul className="divide-y divide-slate-100">
            {rows.map((a) => {
              const b = badge(a.status);
              return (
                <li key={a.id}>
                  <Link href={a.href} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 hover:bg-md-pale/50">
                    <span className="w-28 shrink-0 text-xs font-semibold text-slate-400">{fmt(a.createdAt)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">
                        {a.name}
                        {a.tag && <span className="ml-2 text-[10px] font-extrabold uppercase tracking-widest text-md-teal">{a.tag}</span>}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{a.detail}</span>
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${b?.badge}`}>{b?.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage(props: { searchParams: SP }) {
  return (
    <Suspense fallback={<PanelLoading />}>
      <ApplicationsPageContent {...props} />
    </Suspense>
  );
}
