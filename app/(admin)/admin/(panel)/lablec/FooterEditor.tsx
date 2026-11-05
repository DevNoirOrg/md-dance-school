"use client";

import { useState } from "react";
import { saveFooter } from "@/app/actions/admin";
import LanguageEditor from "@/components/admin/LanguageEditor";
import { Card, Field, PageHeader, SaveBar, inputCls, isSame, textareaCls, useSaver } from "@/components/admin/ui";
import type { EditInfo } from "@/lib/admin-data";
import type { FooterContent, SocialLink } from "@/lib/content-types";

const NETWORKS: SocialLink["label"][] = ["Instagram", "Facebook", "YouTube", "TikTok"];

export default function FooterEditor({ initial, info }: { initial: FooterContent; info: EditInfo }) {
  const [saved, setSaved] = useState(initial);
  const [v, setV] = useState(initial);
  const { pending, status, save } = useSaver();
  return (
    <div>
      <PageHeader title="Lábléc" description="Az oldalak alján lévő elérhetőségek, cím és közösségi ikonok." />
      <LanguageEditor value={v} onChange={setV}>
      {(x, setX, locale) => {
        const set = <K extends keyof FooterContent>(key: K, val: FooterContent[K]) => setX({ ...x, [key]: val });
        const hrefOf = (label: SocialLink["label"]) => x.socials.find((social) => social.label === label);
        const setSocial = (label: SocialLink["label"], on: boolean, href?: string) => {
          const map = new Map(x.socials.map((social) => [social.label, social.href]));
          if (on) map.set(label, href ?? map.get(label) ?? "");
          else map.delete(label);
          setX({ ...x, socials: NETWORKS.filter((network) => map.has(network)).map((network) => ({ label: network, href: map.get(network)! })) });
        };
        return (
      <div className="space-y-6">
        <Card title="Elérhetőség">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="E-mail" htmlFor="f-email">
              <input id="f-email" className={inputCls} value={x.email} disabled={locale === "en"} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Telefon" htmlFor="f-phone">
              <input id="f-phone" className={inputCls} value={x.phone} disabled={locale === "en"} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field label="Cím felirata" htmlFor="f-al" hint="Félkövérrel a cím előtt, pl. „Astoria Stúdió”.">
              <input id="f-al" className={inputCls} value={x.addressLabel} onChange={(e) => set("addressLabel", e.target.value)} />
            </Field>
            <Field label="Cím" htmlFor="f-addr" className="md:col-span-2">
              <textarea id="f-addr" rows={3} className={textareaCls} value={x.address} onChange={(e) => set("address", e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card title="Közösségi ikonok" description="A bekapcsolt ikonok fekete körben látszanak. Link nélkül az ikon látszik, de nem kattintható.">
          <div className="space-y-3">
            {NETWORKS.map((n) => {
              const s = hrefOf(n);
              return (
                <div key={n} className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                  <label className="flex w-36 shrink-0 cursor-pointer items-center gap-2 text-sm font-bold">
                    <input type="checkbox" checked={!!s} disabled={locale === "en"} onChange={(e) => setSocial(n, e.target.checked)} className="h-4 w-4 accent-md-teal" />
                    {n}
                  </label>
                  <input
                    aria-label={`${n} link`}
                    className={inputCls}
                    disabled={!s || locale === "en"}
                    placeholder="https://…"
                    value={s?.href ?? ""}
                    onChange={(e) => setSocial(n, true, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
        );
      }}
      </LanguageEditor>
      <SaveBar
        dirty={!isSame(v, saved)}
        pending={pending}
        status={status}
        info={info}
        onReset={() => setV(saved)}
        onSave={() => save(() => saveFooter(v), undefined, () => setSaved(v))}
      />
    </div>
  );
}
