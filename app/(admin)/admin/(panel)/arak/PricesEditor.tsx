"use client";

import { useState } from "react";
import { savePrices } from "@/app/actions/admin";
import ListEditor from "@/components/admin/ListEditor";
import { Card, PageHeader, SaveBar, inputCls, isSame, useSaver } from "@/components/admin/ui";
import type { EditInfo } from "@/lib/admin-data";
import type { Mark, PriceItem, PriceNote, PricesContent } from "@/lib/content-types";

function MarkSelect({ value, onChange }: { value: Mark; onChange: (v: Mark) => void }) {
  return (
    <select
      aria-label="Megjegyzés jel"
      className={`${inputCls} !w-[84px] shrink-0 !px-2`}
      value={value}
      onChange={(e) => onChange(e.target.value as Mark)}
    >
      <option value="">—</option>
      <option value="*">*</option>
      <option value="**">**</option>
    </select>
  );
}

export default function PricesEditor({ initial, info }: { initial: PricesContent; info: EditInfo }) {
  const [saved, setSaved] = useState(initial);
  const [v, setV] = useState(initial);
  const { pending, status, save } = useSaver();

  return (
    <div>
      <PageHeader
        title="Árak"
        description="A türkiz „Áraink” kártya a jelentkezési űrlap mellett (főoldal és Órarend oldal). A tételek húzással vagy a nyilakkal rendezhetők."
      />
      <div className="space-y-6">
        <Card title="Tételek" description="A * / ** jel a tétel neve után jelenik meg, és a lenti megjegyzésekre utal.">
          <ListEditor
            items={v.items}
            onChange={(items) => setV((p) => ({ ...p, items }))}
            newItem={(): PriceItem => ({ name: "", price: "", note: "" })}
            title={(it) => it.name || "Új tétel"}
            addLabel="+ Új tétel"
            max={40}
            render={(it, set) => (
              <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                <input aria-label="Megnevezés" className={`${inputCls} min-w-[180px] flex-1`} placeholder="Havi bérlet — 1 csoport"
                  value={it.name} onChange={(e) => set({ name: e.target.value })} />
                <input aria-label="Ár" className={`${inputCls} !w-[140px] shrink-0`} placeholder="20 000 Ft"
                  value={it.price} onChange={(e) => set({ price: e.target.value })} />
                <MarkSelect value={it.note} onChange={(note) => set({ note })} />
              </div>
            )}
          />
        </Card>

        <Card title="Megjegyzések" description="A lista alatti világosabb sávban jelennek meg. Jel nélküli sor is lehet (pl. fizetési módok).">
          <ListEditor
            items={v.notes}
            onChange={(notes) => setV((p) => ({ ...p, notes }))}
            newItem={(): PriceNote => ({ mark: "", text: "" })}
            title={(n) => n.mark || "Megjegyzés"}
            addLabel="+ Új megjegyzés"
            max={8}
            render={(n, set) => (
              <div className="flex gap-2">
                <MarkSelect value={n.mark} onChange={(mark) => set({ mark })} />
                <input aria-label="Megjegyzés" className={inputCls} value={n.text} onChange={(e) => set({ text: e.target.value })} />
              </div>
            )}
          />
        </Card>
      </div>
      <SaveBar
        dirty={!isSame(v, saved)}
        pending={pending}
        status={status}
        info={info}
        onReset={() => setV(saved)}
        onSave={() => save(() => savePrices(v), undefined, () => setSaved(v))}
      />
    </div>
  );
}
