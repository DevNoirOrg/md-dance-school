import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PanelLoading from "@/components/admin/PanelLoading";
import { Card } from "@/components/admin/ui";
import { getClassApplication, STATUSES } from "@/lib/applications";
import { requireAdmin } from "@/lib/auth";
import ApplicationActions from "../ApplicationActions";
import DetailRow, { mailLink } from "../DetailRow";

export const metadata: Metadata = { title: "Órajelentkezés" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const a = await getClassApplication((await params).id);
  if (!a) notFound();
  const status = STATUSES.find((s) => s.id === a.status);

  return (
    <div className="pb-12">
      <Link href="/admin/jelentkezesek" className="text-xs font-extrabold uppercase tracking-widest text-slate-400 hover:text-ink">
        ← Vissza a listához
      </Link>
      <div className="mb-6 mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-black">
          {a.vezeteknev} {a.keresztnev}
        </h1>
        <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${status?.badge}`}>{status?.label}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Órajelentkezés</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="self-start">
          <dl className="divide-y divide-slate-100">
            <DetailRow k="Beküldve">{new Date(a.createdAt).toLocaleString("hu-HU")}</DetailRow>
            <DetailRow k="E-mail">{mailLink(a.email)}</DetailRow>
            <DetailRow k="Születési dátum">{a.szuletes}</DetailRow>
            {a.szuloNev && (
              <DetailRow k="Szülő">
                {a.szuloNev} · {a.szuloEmail && mailLink(a.szuloEmail)}
              </DetailRow>
            )}
            <DetailRow k="Tánctapasztalat">{a.tapasztalat}</DetailRow>
            <DetailRow k="Kezdés">{a.kezdes}</DetailRow>
            <DetailRow k="Órák">
              <ul className="space-y-1">
                {a.classes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </DetailRow>
            {a.megjegyzes && <DetailRow k="Megjegyzés">{a.megjegyzes}</DetailRow>}
            <DetailRow k="Adatkezelés">Elfogadta a tájékoztatót és hozzájárult az adatkezeléshez</DetailRow>
          </dl>
        </Card>
        <ApplicationActions
          kind="orak"
          id={a.id}
          status={a.status}
          note={a.adminNote}
          email={a.email}
          cc={a.szuloEmail}
          statusInfo={a.statusUpdatedAt ? { updatedAt: a.statusUpdatedAt, updatedBy: a.statusUpdatedBy ?? "" } : null}
        />
      </div>
    </div>
  );
}

export default function ClassApplicationPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PanelLoading />}>
      <Content {...props} />
    </Suspense>
  );
}
