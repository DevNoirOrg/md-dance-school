import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PanelLoading from "@/components/admin/PanelLoading";
import { Card } from "@/components/admin/ui";
import { getCampApplication, STATUSES } from "@/lib/applications";
import { requireAdmin } from "@/lib/auth";
import ApplicationActions from "../../ApplicationActions";
import DetailRow, { mailLink, telLink } from "../../DetailRow";

export const metadata: Metadata = { title: "Tánctábor-jelentkezés" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const a = await getCampApplication((await params).id);
  if (!a) notFound();
  const status = STATUSES.find((s) => s.id === a.status);

  return (
    <div className="pb-12">
      <Link href="/admin/jelentkezesek?tipus=tabor" className="text-xs font-extrabold uppercase tracking-widest text-slate-400 hover:text-ink">
        ← Vissza a listához
      </Link>
      <div className="mb-6 mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-black">{a.nev}</h1>
        <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${status?.badge}`}>{status?.label}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Tánctábor</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="self-start">
          <dl className="divide-y divide-slate-100">
            <DetailRow k="Beküldve">{new Date(a.createdAt).toLocaleString("hu-HU")}</DetailRow>
            <DetailRow k="Turnus">
              <ul className="space-y-1">
                {a.turnus.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </DetailRow>
            <DetailRow k="Kapcsolattartó e-mail">{mailLink(a.email)}</DetailRow>
            <DetailRow k="Telefon">{telLink(a.telefon)}</DetailRow>
            <DetailRow k="Születési dátum">{a.szuletes}</DetailRow>
            <DetailRow k="Pólóméret">{a.polo}</DetailRow>
            {(a.szuloNev || a.szuloTelefon) && (
              <DetailRow k="Szülő / gondviselő">
                {a.szuloNev}
                {a.szuloNev && a.szuloTelefon && " · "}
                {a.szuloTelefon && telLink(a.szuloTelefon)}
              </DetailRow>
            )}
            {a.lakcim && <DetailRow k="Lakcím">{a.lakcim}</DetailRow>}
            {a.tudnivalo && <DetailRow k="Fontos tudnivaló">{a.tudnivalo}</DetailRow>}
            <DetailRow k="Fizetési mód">{a.fizetes}</DetailRow>
            <DetailRow k="Honnan hallott róla">{a.honnan}</DetailRow>
            <DetailRow k="Kitöltő">{a.kitolto}</DetailRow>
            <DetailRow k="Adatkezelés">Elfogadta a tájékoztatót és hozzájárult az adatkezeléshez</DetailRow>
          </dl>
        </Card>
        <ApplicationActions
          kind="tabor"
          id={a.id}
          status={a.status}
          note={a.adminNote}
          email={a.email}
          cc={null}
          statusInfo={a.statusUpdatedAt ? { updatedAt: a.statusUpdatedAt, updatedBy: a.statusUpdatedBy ?? "" } : null}
        />
      </div>
    </div>
  );
}

export default function CampApplicationPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PanelLoading />}>
      <Content {...props} />
    </Suspense>
  );
}
