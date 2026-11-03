"use client";

import { useState } from "react";
import { deleteNews, saveNews, saveNewsTitle } from "@/app/actions/admin";
import MediaField from "@/components/admin/MediaField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Button, Card, EditInfoLine, Field, PageHeader, StatusText, inputCls, isSame, textareaCls, useSaver } from "@/components/admin/ui";
import type { EditInfo } from "@/lib/admin-data";
import type { NewsItem } from "@/lib/content-types";
import { mediaUrl } from "@/lib/format";

/* eslint-disable @next/next/no-img-element -- admin előnézet */

type Draft = {
  id?: string;
  publishedOn: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  imagePath: string | null;
  imageAlt: string;
  placeholderLabel: string;
  format: "landscape" | "portrait";
};

const toDraft = (n: NewsItem): Draft => ({
  id: n.id,
  publishedOn: n.publishedOn,
  slug: n.slug,
  title: n.title,
  excerpt: n.excerpt,
  bodyHtml: n.bodyHtml,
  imagePath: n.imagePath,
  imageAlt: n.imageAlt,
  placeholderLabel: n.placeholderLabel,
  format: n.format,
});

const today = () => new Date().toISOString().slice(0, 10);

/** A hírek szekció címe a főoldalon (a HÍREK ÉS\nESEMÉNYEK felirat). */
function TitleCard({ initial, info }: { initial: string; info: EditInfo }) {
  const [saved, setSaved] = useState(initial);
  const [v, setV] = useState(initial);
  const { pending, status, save } = useSaver();
  const dirty = v !== saved;

  return (
    <Card title="Szekció címe">
      <Field label="Cím" htmlFor="n-title" hint="Új sorba törhető (Enter).">
        <textarea id="n-title" rows={2} className={`${textareaCls} max-w-sm`} value={v} onChange={(e) => setV(e.target.value)} />
      </Field>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="primary" disabled={pending || !dirty} onClick={() => save(() => saveNewsTitle({ title: v }), undefined, () => setSaved(v))}>
          {pending ? "Mentés…" : "Mentés"}
        </Button>
        {dirty && !pending && !status && <span className="text-sm font-bold text-amber-600">Mentetlen változások</span>}
        <StatusText status={status} />
        {!status && !dirty && <EditInfoLine info={info} />}
      </div>
    </Card>
  );
}

function NewsForm({ initial, onDone, isNew }: { initial: Draft; onDone: () => void; isNew?: boolean }) {
  const [saved, setSaved] = useState(initial);
  const [d, setD] = useState(initial);
  const { pending, status, save } = useSaver();
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const dirty = !isSame(d, saved);
  const fid = (x: string) => `${x}-${d.id ?? "new"}`;

  return (
    <div className="grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
      <div className="space-y-4">
        <MediaField
          kind="image"
          value={d.imagePath}
          onChange={(p) => set("imagePath", p)}
          aspectClass={d.format === "landscape" ? "aspect-video max-w-[200px]" : "aspect-[4/5] max-w-[200px]"}
          emptyLabel={d.placeholderLabel || "Nincs kép"}
        />
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
                onClick={() => set("format", f)}
                className={`rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-widest ${
                  d.format === f ? "bg-ink text-white" : "bg-white text-slate-500 hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <Field label="Dátum" htmlFor={fid("d")}>
            <input id={fid("d")} type="date" className={inputCls} value={d.publishedOn} onChange={(e) => set("publishedOn", e.target.value)} />
          </Field>
          <Field
            label="Webcím"
            htmlFor={fid("s")}
            hint={
              <>
                A hír oldala: <span className="font-mono">/hirek/{d.slug || "…"}</span>. Üresen hagyva a címből készül. Csak kisbetű, szám, kötőjel.
                {!isNew && saved.slug && (
                  <>
                    {" "}
                    <a href={`/hirek/${saved.slug}`} target="_blank" rel="noopener" className="font-bold text-md-teal underline">
                      Megnyitom ↗
                    </a>
                  </>
                )}
              </>
            }
          >
            <input
              id={fid("s")}
              className={`${inputCls} font-mono`}
              value={d.slug}
              placeholder="pl. lia-visszater-girly-class"
              onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            />
          </Field>
        </div>
        <Field label="Cím" htmlFor={fid("t")}>
          <input id={fid("t")} className={inputCls} value={d.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Rövid szöveg" htmlFor={fid("e")} hint="A hírkártya alatti bevezető mondat a hír saját oldalán.">
          <textarea id={fid("e")} rows={3} className={textareaCls} value={d.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kép leírása" htmlFor={fid("a")} hint="Képernyőolvasóknak és a plakát feliratához.">
            <input id={fid("a")} className={inputCls} value={d.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} />
          </Field>
          <Field label="Felirat kép helyett" htmlFor={fid("p")} hint="Ha nincs kép, ez látszik a szürke dobozban.">
            <input id={fid("p")} className={inputCls} value={d.placeholderLabel} onChange={(e) => set("placeholderLabel", e.target.value)} />
          </Field>
        </div>
      </div>
      <div className="sm:col-span-2">
        <Field label="A hír teljes szövege" htmlFor={fid("b")} hint="Úgy szerkeszd, mint egy Word dokumentumot. Wordből vagy weboldalról is bemásolhatod a szöveget.">
          <RichTextEditor id={fid("b")} value={d.bodyHtml} onChange={(html) => set("bodyHtml", html)} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="primary"
            disabled={pending || (!dirty && !isNew)}
            onClick={() =>
              save(
                () => saveNews(d),
                isNew ? "Hír közzétéve." : undefined,
                (r) => {
                  const next = r.ok ? { ...d, id: r.id ?? d.id, slug: r.slug ?? d.slug } : d;
                  setD(next);
                  setSaved(next);
                  if (isNew) onDone();
                },
              )
            }
          >
            {pending ? "Mentés…" : isNew ? "Közzététel" : "Mentés"}
          </Button>
          {isNew ? (
            <Button variant="ghost" onClick={onDone}>
              Mégse
            </Button>
          ) : (
            <Button
              variant="danger"
              disabled={pending}
              onClick={() => {
                if (d.id && window.confirm(`Biztosan törlöd: „${saved.title}”?`)) save(() => deleteNews(d.id!), "Hír törölve.", onDone);
              }}
            >
              Törlés
            </Button>
          )}
          {dirty && !pending && !status && <span className="text-sm font-bold text-amber-600">Mentetlen változások</span>}
          <StatusText status={status} />
        </div>
      </div>
    </div>
  );
}

export default function NewsEditor({ news, title, info }: { news: NewsItem[]; title: string; info: EditInfo }) {
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="pb-12">
      <PageHeader
        title="Hírek és események"
        description="A főoldalon mindig a legfrissebb 4 hír jelenik meg (dátum szerint), mindegyik a saját oldalára visz. Az összes hír a /hirek oldalon van. Mentéskor azonnal frissül."
      >
        {!creating && (
          <Button variant="primary" onClick={() => setCreating(true)}>
            + Új hír
          </Button>
        )}
      </PageHeader>

      <div className="mb-6">
        <TitleCard initial={title} info={info} />
      </div>

      <div className="space-y-4">
        {creating && (
          <Card title="Új hír">
            <NewsForm
              isNew
              initial={{
                publishedOn: today(),
                slug: "",
                title: "",
                excerpt: "",
                bodyHtml: "",
                imagePath: null,
                imageAlt: "",
                placeholderLabel: "",
                format: "landscape",
              }}
              onDone={() => setCreating(false)}
            />
          </Card>
        )}

        {news.map((n) => {
          const open = openId === n.id;
          return (
            <Card key={n.id} className="!p-0 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : n.id)}
                className="flex w-full items-center gap-4 p-4 text-left hover:bg-slate-50 md:p-5"
                aria-expanded={open}
              >
                <div className="grid h-16 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100">
                  {n.imagePath ? (
                    <img src={mediaUrl(n.imagePath)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="px-1 text-center font-mono text-[8px] uppercase text-slate-300">{n.placeholderLabel}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] font-bold text-md-teal">{n.dateLabel}</p>
                  <p className="truncate font-bold">{n.title}</p>
                  <p className="truncate text-xs text-slate-400">{n.excerpt}</p>
                </div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">{open ? "Bezár" : "Szerkeszt"}</span>
              </button>
              {open && (
                <div className="border-t border-slate-100 p-4 md:p-6">
                  <NewsForm initial={toDraft(n)} onDone={() => setOpenId(null)} />
                </div>
              )}
            </Card>
          );
        })}
        {news.length === 0 && !creating && <p className="text-sm text-slate-500">Még nincs hír.</p>}
      </div>
    </div>
  );
}
