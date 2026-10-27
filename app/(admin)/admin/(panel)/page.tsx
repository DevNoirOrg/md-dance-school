import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import PanelLoading from "@/components/admin/PanelLoading";
import { getEditLog } from "@/lib/admin-data";
import { adminNav } from "@/lib/admin-nav";
import { countByStatus } from "@/lib/applications";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Áttekintés" };

function NewCard({ href, label, n, total }: { href: string; label: string; n: number; total: number }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-6 rounded-[1.75rem] bg-md-cyan p-6 text-ink shadow-[0_20px_40px_-24px_rgba(13,13,13,0.5)] transition-transform hover:-translate-y-0.5 md:p-8"
    >
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink/60">{label}</p>
        <p className="mt-1 text-5xl font-black">{n}</p>
        <p className="mt-1 text-sm font-semibold text-ink/70">Összesen {total} az adatbázisban</p>
      </div>
      <span className="rounded-xl bg-ink px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-white">Megnézem →</span>
    </Link>
  );
}

async function DashboardPageContent() {
  const admin = await requireAdmin();
  const [classes, camp, log] = await Promise.all([countByStatus("orak"), countByStatus("tabor"), getEditLog()]);
  const sum = (c: Record<string, number>) => Object.values(c).reduce((a, b) => a + b, 0);

  return (
    <div className="pb-12">
      <h1 className="text-3xl font-black md:text-4xl">Szia!</h1>
      <p className="mt-2 text-sm text-slate-500">Bejelentkezve: {admin.email}</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <NewCard href="/admin/jelentkezesek" label="Új órajelentkezések" n={classes.uj ?? 0} total={sum(classes)} />
        <NewCard href="/admin/jelentkezesek?tipus=tabor" label="Új tánctábor-jelentkezések" n={camp.uj ?? 0} total={sum(camp)} />
      </div>

      <h2 className="mb-4 mt-10 text-lg font-extrabold">Tartalom szerkesztése</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {adminNav.map((n) => {
          if (!("section" in n)) return null;
          const info = log[n.section];
          return (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_-20px_rgba(13,13,13,0.35)] transition-colors hover:bg-md-pale"
            >
              <p className="font-extrabold">{n.label}</p>
              <p className="mt-1 text-xs text-slate-400">
                {info ? `Módosítva: ${new Date(info.updatedAt).toLocaleDateString("hu-HU")} · ${info.updatedBy}` : "Még nem módosították"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<PanelLoading />}>
      <DashboardPageContent />
    </Suspense>
  );
}
