"use client";

import { useState } from "react";
import { saveCamp } from "@/app/actions/admin";
import ListEditor from "@/components/admin/ListEditor";
import MediaField from "@/components/admin/MediaField";
import { Card, Field, PageHeader, SaveBar, StringListEditor, inputCls, isSame, textareaCls, useSaver } from "@/components/admin/ui";
import type { EditInfo } from "@/lib/admin-data";
import type { CampContent } from "@/lib/content-types";

export default function CampEditor({ initial, teacherNames, info }: { initial: CampContent; teacherNames: string[]; info: EditInfo }) {
  const [saved, setSaved] = useState(initial);
  const [v, setV] = useState(initial);
  const { pending, status, save } = useSaver();
  const set = <K extends keyof CampContent>(k: K, val: CampContent[K]) => setV((p) => ({ ...p, [k]: val }));
  const setForm = (k: keyof CampContent["form"], val: string[]) => setV((p) => ({ ...p, form: { ...p.form, [k]: val } }));
  const input = (k: "badge" | "title" | "meetingText" | "meetingTime" | "locationName" | "locationAddress" | "teacherRole", label: string, hint?: string) => (
    <Field label={label} htmlFor={`camp-${k}`} hint={hint}>
      <input id={`camp-${k}`} className={inputCls} value={v[k]} onChange={(e) => set(k, e.target.value)} />
    </Field>
  );
  const area = (k: "lead" | "sub" | "priceIncludes" | "priceExcludes" | "endText" | "importantText" | "applyText", label: string, rows = 3) => (
    <Field label={label} htmlFor={`camp-${k}`}>
      <textarea id={`camp-${k}`} rows={rows} className={textareaCls} value={v[k]} onChange={(e) => set(k, e.target.value)} />
    </Field>
  );
  // a már nem létező tanárnevek is látszanak (áthúzva), hogy ki lehessen venni őket
  const allNames = [...teacherNames, ...v.teachers.filter((n) => !teacherNames.includes(n))];

  return (
    <div>
      <PageHeader title="Tánctábor" description="A /tanctabor oldal: fejléc, árak, turnusok, helyszín, tanárok és a jelentkezési űrlap opciói." />
      <div className="space-y-6">
        <Card title="Fejléc">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {input("badge", "Jelvény")}
                {input("title", "Cím")}
              </div>
              {area("lead", "Bevezető (fehér, félkövér)")}
              {area("sub", "Második bekezdés (halványabb)")}
            </div>
            <Field label="Álló reel-videó (9:16)" hint="Ha nincs, szaggatott keretes helyőrző látszik.">
              <MediaField kind="video" value={v.reelPath} onChange={(p) => set("reelPath", p)} aspectClass="aspect-[9/16] max-w-[200px]" />
            </Field>
          </div>
        </Card>

        <Card title="Árak" description="Jegytípusok emojival, árral és hogy meddig érhető el.">
          <ListEditor
            items={v.prices}
            onChange={(prices) => set("prices", prices)}
            newItem={() => ({ emoji: "", name: "", price: "", until: "" })}
            title={(p) => `${p.emoji} ${p.name || "Új jegy"}`}
            addLabel="+ Új jegytípus"
            max={10}
            render={(p, upd) => (
              <div className="grid gap-2 sm:grid-cols-[70px_1fr_140px_1fr]">
                <input aria-label="Emoji" className={`${inputCls} text-center`} value={p.emoji} onChange={(e) => upd({ emoji: e.target.value })} />
                <input aria-label="Jegytípus" className={inputCls} placeholder="Early Ticket" value={p.name} onChange={(e) => upd({ name: e.target.value })} />
                <input aria-label="Ár" className={inputCls} placeholder="84 990 Ft" value={p.price} onChange={(e) => upd({ price: e.target.value })} />
                <input aria-label="Elérhető" className={inputCls} placeholder="2026. május 31-ig" value={p.until} onChange={(e) => upd({ until: e.target.value })} />
              </div>
            )}
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {area("priceIncludes", "Az ár tartalmazza")}
            {area("priceExcludes", "Az ár nem tartalmazza (halványabban)")}
          </div>
        </Card>

        <Card
          title="Turnusok"
          description="A „Lezárva” turnus az űrlapon nem választható. Az állapot felirat (pl. „10 hely még elérhető”) a Szabad helyek résznél látszik."
        >
          <ListEditor
            items={v.turnusok}
            onChange={(turnusok) => set("turnusok", turnusok)}
            newItem={() => {
              let n = v.turnusok.length + 1;
              while (v.turnusok.some((t) => t.id === `T${n}`)) n++;
              return { id: `T${n}`, label: `${v.turnusok.length + 1}. turnus`, dates: "", days: "", closed: false, status: "" };
            }}
            title={(t) => t.label || "Új turnus"}
            addLabel="+ Új turnus"
            min={1}
            max={10}
            render={(t, upd) => (
              <div className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr]">
                  <input aria-label="Turnus neve" className={inputCls} placeholder="1. turnus" value={t.label} onChange={(e) => upd({ label: e.target.value })} />
                  <input aria-label="Dátum" className={inputCls} placeholder="2026.07.05–08." value={t.dates} onChange={(e) => upd({ dates: e.target.value })} />
                  <input aria-label="Napok" className={inputCls} placeholder="vasárnap–szerda" value={t.days} onChange={(e) => upd({ days: e.target.value })} />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <input aria-label="Állapot" className={`${inputCls} max-w-xs`} placeholder="10 hely még elérhető" value={t.status} onChange={(e) => upd({ status: e.target.value })} />
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
                    <input type="checkbox" className="h-4 w-4 accent-md-teal" checked={t.closed} onChange={(e) => upd({ closed: e.target.checked })} />
                    Lezárva
                  </label>
                  <span className="ml-auto text-xs text-slate-400">
                    Azonosító: <span className="font-mono">{t.id}</span>
                  </span>
                </div>
              </div>
            )}
          />
        </Card>

        <Card title="Befizetési módok" description="Egy sor = egy pont. „Cím: hosszabb szöveg” → a cím félkövér; a linkek kattinthatók; a sor végi [Hamarosan] szürke címke lesz.">
          <StringListEditor items={v.paymentMethods} onChange={(paymentMethods) => set("paymentMethods", paymentMethods)} addLabel="+ Új befizetési mód" max={10} />
        </Card>

        <Card title="Időpontok és helyszín">
          <div className="grid gap-4 md:grid-cols-2">
            {input("meetingText", "Találkozó szöveg")}
            {input("meetingTime", "Találkozó időpont", "Félkövérrel, pl. 14:00–15:00")}
            <div className="md:col-span-2">{area("endText", "Az utolsó nap")}</div>
            {input("locationName", "Helyszín neve")}
            {input("locationAddress", "Helyszín címe")}
            {area("importantText", "Fontos tudnivaló", 4)}
            {area("applyText", "Jelentkezési lehetőség", 4)}
          </div>
        </Card>

        <Card title="Tánctanáraink" description="Kattints a nevekre: a kiválasztottak jelennek meg (a kiválasztás sorrendjében). Fotó és videó link: Tanárok menüpont.">
          <div className="flex flex-wrap gap-2">
            {allNames.map((n) => {
              const i = v.teachers.indexOf(n);
              const missing = !teacherNames.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("teachers", i >= 0 ? v.teachers.filter((x) => x !== n) : [...v.teachers, n])}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    i >= 0 ? "bg-ink text-white" : "bg-slate-100 text-slate-500 hover:text-ink"
                  } ${missing ? "line-through" : ""}`}
                  title={missing ? "Ez a tanár már nincs a Tanárok listában" : undefined}
                >
                  {i >= 0 && <span className="mr-1.5 text-md-cyan">{i + 1}.</span>}
                  {n}
                </button>
              );
            })}
          </div>
          <div className="mt-4 max-w-sm">{input("teacherRole", "Felirat a kártyákon", "Pl. „MD Tánctanár”.")}</div>
        </Card>

        <Card title="Jelentkezési űrlap opciói" description="A választható „chipek” az űrlapon (az első az alapértelmezett).">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Pólóméretek">
              <StringListEditor items={v.form.shirtSizes} onChange={(x) => setForm("shirtSizes", x)} addLabel="+ Új méret" />
            </Field>
            <Field label="Fizetési módok">
              <StringListEditor items={v.form.payments} onChange={(x) => setForm("payments", x)} addLabel="+ Új fizetési mód" />
            </Field>
            <Field label="Honnan hallottál a táborról?">
              <StringListEditor items={v.form.sources} onChange={(x) => setForm("sources", x)} addLabel="+ Új opció" max={15} />
            </Field>
            <Field label="Ki tölti ki?">
              <StringListEditor items={v.form.fillers} onChange={(x) => setForm("fillers", x)} addLabel="+ Új opció" />
            </Field>
          </div>
        </Card>
      </div>
      <SaveBar
        dirty={!isSame(v, saved)}
        pending={pending}
        status={status}
        info={info}
        onReset={() => setV(saved)}
        onSave={() => save(() => saveCamp(v), undefined, () => setSaved(v))}
      />
    </div>
  );
}
