"use client";

import { useState } from "react";
import { saveCourses } from "@/app/actions/admin";
import ListEditor from "@/components/admin/ListEditor";
import { Card, Field, PageHeader, SaveBar, inputCls, isSame, textareaCls, useSaver } from "@/components/admin/ui";
import type { EditInfo } from "@/lib/admin-data";
import type { CoursesContent } from "@/lib/content-types";

/** Vesszővel elválasztott nevek ↔ lista. */
const splitNames = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export default function CoursesEditor({ initial, info }: { initial: CoursesContent; info: EditInfo }) {
  const [saved, setSaved] = useState(initial);
  const [v, setV] = useState(initial);
  // a tanárok mezőt szövegként szerkesztjük (vesszővel), mentéskor bontjuk listára
  const [teacherText, setTeacherText] = useState(() => initial.styles.map((s) => s.teachers.join(", ")));
  const { pending, status, save } = useSaver();
  const set = <K extends keyof CoursesContent>(k: K, val: CoursesContent[K]) => setV((p) => ({ ...p, [k]: val }));
  const current = { ...v, styles: v.styles.map((s, i) => ({ ...s, teachers: splitNames(teacherText[i] ?? "") })) };

  return (
    <div>
      <PageHeader title="Tanfolyamok" description="Az Órarend oldal fejléce és a „Tanfolyamok” szekció: első lépések, stílusok, szintek és csoportok." />
      <div className="space-y-6">
        <Card title="Fejléc és bevezető">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Oldal fejléc címe" htmlFor="c-ht">
              <input id="c-ht" className={inputCls} value={v.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
            </Field>
            <Field label="Fejléc szöveg" htmlFor="c-hl">
              <input id="c-hl" className={inputCls} value={v.heroLead} onChange={(e) => set("heroLead", e.target.value)} />
            </Field>
            <Field label="Szekció címe" htmlFor="c-t">
              <input id="c-t" className={inputCls} value={v.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Bevezető" htmlFor="c-i" className="md:col-span-2">
              <textarea id="c-i" rows={2} className={textareaCls} value={v.intro} onChange={(e) => set("intro", e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card title="Mielőtt jössz" description="Fekete, számozott kártyák (legfeljebb 6).">
          <ListEditor
            items={v.steps}
            onChange={(steps) => set("steps", steps)}
            newItem={() => ({ title: "", text: "" })}
            title={(s, i) => `${String(i + 1).padStart(2, "0")} · ${s.title || "Új kártya"}`}
            addLabel="+ Új kártya"
            max={6}
            render={(s, upd) => (
              <div className="space-y-2">
                <input aria-label="Cím" className={inputCls} value={s.title} onChange={(e) => upd({ title: e.target.value })} />
                <textarea aria-label="Szöveg" rows={3} className={textareaCls} value={s.text} onChange={(e) => upd({ text: e.target.value })} />
              </div>
            )}
          />
        </Card>

        <Card title="Stílusok" description="A „Tanár” mezőbe vesszővel elválasztva írd a neveket.">
          <ListEditor
            items={v.styles.map((s, i) => ({ ...s, teachersText: teacherText[i] ?? "" }))}
            onChange={(items) => {
              set("styles", items.map(({ teachersText, ...s }) => ({ ...s, teachers: splitNames(teachersText) })));
              setTeacherText(items.map((x) => x.teachersText));
            }}
            newItem={() => ({ title: "", text: "", teachers: [], teachersText: "" })}
            title={(s) => s.title || "Új stílus"}
            addLabel="+ Új stílus"
            max={20}
            render={(s, upd) => (
              <div className="space-y-2">
                <input aria-label="Stílus neve" className={inputCls} placeholder="Hip-hop" value={s.title} onChange={(e) => upd({ title: e.target.value })} />
                <textarea aria-label="Leírás" rows={3} className={textareaCls} value={s.text} onChange={(e) => upd({ text: e.target.value })} />
                <input aria-label="Tanár(ok)" className={inputCls} placeholder="Tanár(ok), pl. Dalma, Alex" value={s.teachersText}
                  onChange={(e) => upd({ teachersText: e.target.value })} />
              </div>
            )}
          />
        </Card>

        <Card title="Szintek és csoportok">
          <ListEditor
            items={v.groups}
            onChange={(groups) => set("groups", groups)}
            newItem={() => ({ title: "", tag: "", text: "" })}
            title={(g) => g.title || "Új csoport"}
            addLabel="+ Új csoport"
            max={20}
            render={(g, upd) => (
              <div className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-[1fr_220px]">
                  <input aria-label="Csoport neve" className={inputCls} placeholder="Kezdő" value={g.title} onChange={(e) => upd({ title: e.target.value })} />
                  <input aria-label="Címke" className={inputCls} placeholder="Címke, pl. Szint · 14+" value={g.tag} onChange={(e) => upd({ tag: e.target.value })} />
                </div>
                <textarea aria-label="Leírás" rows={3} className={textareaCls} value={g.text} onChange={(e) => upd({ text: e.target.value })} />
              </div>
            )}
          />
        </Card>
      </div>
      <SaveBar
        dirty={!isSame(current, saved)}
        pending={pending}
        status={status}
        info={info}
        onReset={() => {
          setV(saved);
          setTeacherText(saved.styles.map((s) => s.teachers.join(", ")));
        }}
        onSave={() =>
          save(() => saveCourses(current), undefined, () => {
            setV(current);
            setSaved(current);
          })
        }
      />
    </div>
  );
}
