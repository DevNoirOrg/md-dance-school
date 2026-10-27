"use client";

import { useState } from "react";
import { saveTeachers } from "@/app/actions/admin";
import ListEditor from "@/components/admin/ListEditor";
import MediaField from "@/components/admin/MediaField";
import { Card, Field, PageHeader, SaveBar, inputCls, isSame, useSaver } from "@/components/admin/ui";
import type { EditInfo } from "@/lib/admin-data";
import type { Teacher } from "@/lib/content-types";

type Draft = Omit<Teacher, "id" | "imagePath"> & { id?: string; imagePath: string | null };

export default function TeachersEditor({ initial, info }: { initial: Teacher[]; info: EditInfo }) {
  const [saved, setSaved] = useState<Draft[]>(initial);
  const [v, setV] = useState<Draft[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const { pending, status, save } = useSaver();

  return (
    <div>
      <PageHeader
        title="Tanárok"
        description="A főoldal „Tanáraink” íve ebben a sorrendben jelenik meg (a középső kártya áll elöl). A tánctábor oldalon a Tánctábor menüpontban választhatod ki, kik szerepeljenek."
      />
      <Card>
        <ListEditor
          items={v}
          onChange={setV}
          newItem={() => ({ name: "", style: "", imagePath: null, videoUrl: "" })}
          title={(t) => t.name || "Új tanár"}
          addLabel="+ Új tanár"
          max={40}
          render={(t, set) => (
            <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
              <MediaField kind="image" value={t.imagePath} allowRemove={false} onChange={(p) => set({ imagePath: p })} aspectClass="aspect-square max-w-[180px]" />
              <div className="space-y-3">
                <Field label="Név">
                  <input className={inputCls} value={t.name} placeholder="Dalma" onChange={(e) => set({ name: e.target.value })} />
                </Field>
                <Field label="Stílus(ok)">
                  <input className={inputCls} value={t.style} placeholder="Hip-Hop, House" onChange={(e) => set({ style: e.target.value })} />
                </Field>
                <Field label="Instagram-videó link" hint="A kártyára kattintva ez nyílik meg új lapon. Üresen hagyva nincs „Videó” jelzés.">
                  <input className={inputCls} value={t.videoUrl} placeholder="https://www.instagram.com/reel/…" onChange={(e) => set({ videoUrl: e.target.value })} />
                </Field>
              </div>
            </div>
          )}
        />
      </Card>
      {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
      <SaveBar
        dirty={!isSame(v, saved)}
        pending={pending}
        status={status}
        info={info}
        onReset={() => setV(saved)}
        onSave={() => {
          if (v.some((t) => !t.imagePath)) {
            setError("Minden tanárhoz tölts fel fotót.");
            return;
          }
          setError(null);
          save(
            () => saveTeachers({ teachers: v.map((t) => ({ ...t, imagePath: t.imagePath! })) }),
            undefined,
            () => setSaved(v),
          );
        }}
      />
    </div>
  );
}
