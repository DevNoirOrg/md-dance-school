"use client";

import { useState } from "react";
import { saveFormOptions } from "@/app/actions/admin";
import { Card, PageHeader, SaveBar, StringListEditor, isSame, useSaver } from "@/components/admin/ui";
import type { EditInfo } from "@/lib/admin-data";
import type { FormOptions } from "@/lib/content-types";

export default function FormOptionsEditor({ initial, info }: { initial: FormOptions; info: EditInfo }) {
  const [saved, setSaved] = useState(initial);
  const [v, setV] = useState(initial);
  const { pending, status, save } = useSaver();

  return (
    <div>
      <PageHeader
        title="Űrlap opciók"
        description="Az órajelentkezési űrlap legördülő listái. (A tánctábor űrlap opciói a Tánctábor menüpontban vannak.)"
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="„Táncoltál már korábban?”">
          <StringListEditor items={v.experience} onChange={(experience) => setV((p) => ({ ...p, experience }))} addLabel="+ Új opció" />
        </Card>
        <Card title="„Mikortól kezdenél?”">
          <StringListEditor items={v.start} onChange={(start) => setV((p) => ({ ...p, start }))} addLabel="+ Új opció" />
        </Card>
      </div>
      <SaveBar
        dirty={!isSame(v, saved)}
        pending={pending}
        status={status}
        info={info}
        onReset={() => setV(saved)}
        onSave={() => save(() => saveFormOptions(v), undefined, () => setSaved(v))}
      />
    </div>
  );
}
