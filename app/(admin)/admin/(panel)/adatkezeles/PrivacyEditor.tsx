"use client";

import { Fragment, useMemo, useState } from "react";
import { savePrivacy } from "@/app/actions/admin";
import { Button, Card, PageHeader, SaveBar, textareaCls, useSaver } from "@/components/admin/ui";
import type { EditInfo } from "@/lib/admin-data";
import { parsePrivacyText } from "@/lib/privacy";

export default function PrivacyEditor({ initial, info }: { initial: string; info: EditInfo }) {
  const [saved, setSaved] = useState(initial);
  const [text, setText] = useState(initial);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const { pending, status, save } = useSaver();
  const parsed = useMemo(() => parsePrivacyText(text), [text]);

  return (
    <div>
      <PageHeader
        title="Adatkezelési tájékoztató"
        description="Sima szöveg. Üres sor = új bekezdés · „# ” kezdetű sor = fejezetcím (a tartalomjegyzék ebből készül) · „- ” kezdetű sorok = felsorolás. Az első fejezetcím előtti szöveg sárga dobozban jelenik meg."
      >
        <a href="/adatkezeles" target="_blank" rel="noopener">
          <Button>Megnézem az oldalon ↗</Button>
        </a>
      </PageHeader>

      <div className="mb-4 inline-flex rounded-xl bg-white p-1 shadow-sm">
        {(["edit", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-xs font-extrabold uppercase tracking-widest ${tab === t ? "bg-ink text-white" : "text-slate-500"}`}
          >
            {t === "edit" ? "Szerkesztés" : "Előnézet"}
          </button>
        ))}
      </div>

      {tab === "edit" ? (
        <textarea
          aria-label="A tájékoztató szövege"
          className={`${textareaCls} min-h-[65vh] font-mono text-[13px]`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck
        />
      ) : (
        <Card>
          {parsed.intro.length > 0 && (
            <div className="mb-6 rounded-2xl border-2 border-yellow-200 bg-yellow-50 px-5 py-4 text-sm font-semibold text-yellow-900">
              {parsed.intro.map((b, i) => (b.type === "p" ? <p key={i}>{b.lines.join(" ")}</p> : null))}
            </div>
          )}
          <article className="text-[15px] leading-relaxed text-slate-600">
            {parsed.sections.map((s, i) => (
              <section key={s.id}>
                <h2 className="mb-3 mt-8 text-2xl font-black text-ink">
                  {i + 1}. {s.title}
                </h2>
                {s.blocks.map((b, j) =>
                  b.type === "ul" ? (
                    <ul key={j} className="mb-4 list-disc space-y-1.5 pl-6 marker:text-md-teal">
                      {b.items.map((it, k) => (
                        <li key={k}>{it}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j} className="mb-4">
                      {b.lines.map((l, k) => (
                        <Fragment key={k}>
                          {k > 0 && <br />}
                          {l}
                        </Fragment>
                      ))}
                    </p>
                  ),
                )}
              </section>
            ))}
          </article>
        </Card>
      )}

      <SaveBar
        dirty={text !== saved}
        pending={pending}
        status={status}
        info={info}
        onReset={() => setText(saved)}
        onSave={() => save(() => savePrivacy({ text }), undefined, () => setSaved(text))}
      />
    </div>
  );
}
