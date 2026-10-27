"use client";

import { useState } from "react";
import { saveNews } from "@/app/actions/admin";
import ListEditor from "@/components/admin/ListEditor";
import MediaField from "@/components/admin/MediaField";
import { Card, Field, PageHeader, SaveBar, inputCls, isSame, textareaCls, useSaver } from "@/components/admin/ui";
import type { EditInfo } from "@/lib/admin-data";
import type { NewsContent, NewsItem } from "@/lib/content-types";

type Draft = Omit<NewsItem, "imagePath"> & { imagePath: string | null };

export default function NewsEditor({ initial, info }: { initial: NewsContent; info: EditInfo }) {
  const [saved, setSaved] = useState<{ title: string; items: Draft[] }>(initial);
  const [v, setV] = useState<{ title: string; items: Draft[] }>(initial);
  const [error, setError] = useState<string | null>(null);
  const { pending, status, save } = useSaver();

  return (
    <div>
      <PageHeader
        title="Hírek és események"
        description="A főoldal plakátjai Insta-kártyákban (legfeljebb 4, balról jobbra ebben a sorrendben). Fekvő (16:9) és álló (4:5) plakát is lehet."
      />
      <div className="space-y-6">
        <Card title="Szekció címe">
          <Field label="Cím" htmlFor="n-title" hint="Új sorba törhető (Enter).">
            <textarea id="n-title" rows={2} className={`${textareaCls} max-w-sm`} value={v.title} onChange={(e) => setV((p) => ({ ...p, title: e.target.value }))} />
          </Field>
        </Card>
        <Card title="Plakátok">
          <ListEditor
            items={v.items}
            onChange={(items) => setV((p) => ({ ...p, items }))}
            newItem={(): Draft => ({ imagePath: null, alt: "", format: "portrait", link: "" })}
            title={(it) => it.alt || "Új plakát"}
            addLabel="+ Új plakát"
            max={4}
            render={(it, set) => (
              <div className="grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
                <MediaField
                  kind="image"
                  value={it.imagePath}
                  allowRemove={false}
                  onChange={(p) => set({ imagePath: p })}
                  aspectClass={it.format === "landscape" ? "aspect-video max-w-[200px]" : "aspect-[4/5] max-w-[200px]"}
                />
                <div className="space-y-3">
                  <Field label="Mi van a plakáton?" hint="Képernyőolvasóknak és a link feliratához.">
                    <input className={inputCls} value={it.alt} placeholder="Summer Camp 2026" onChange={(e) => set({ alt: e.target.value })} />
                  </Field>
                  <Field label="Formátum">
                    <div className="flex gap-2">
                      {(
                        [
                          ["portrait", "Álló (4:5)"],
                          ["landscape", "Fekvő (16:9)"],
                        ] as const
                      ).map(([f, label]) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => set({ format: f })}
                          className={`rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-widest ${
                            it.format === f ? "bg-ink text-white" : "bg-white text-slate-500 hover:text-ink"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Link (nem kötelező)" hint="Ha megadod, a plakátra kattintva ez nyílik meg (pl. Instagram-poszt, jegyvásárlás).">
                    <input className={inputCls} value={it.link} placeholder="https://…" onChange={(e) => set({ link: e.target.value })} />
                  </Field>
                </div>
              </div>
            )}
          />
        </Card>
      </div>
      {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
      <SaveBar
        dirty={!isSame(v, saved)}
        pending={pending}
        status={status}
        info={info}
        onReset={() => setV(saved)}
        onSave={() => {
          if (v.items.some((i) => !i.imagePath)) {
            setError("Minden plakáthoz tölts fel képet.");
            return;
          }
          setError(null);
          save(() => saveNews({ title: v.title, items: v.items.map((i) => ({ ...i, imagePath: i.imagePath! })) }), undefined, () => setSaved(v));
        }}
      />
    </div>
  );
}
