"use client";

import { useState } from "react";
import { saveTexts } from "@/app/actions/admin";
import MediaField from "@/components/admin/MediaField";
import { Card, Field, PageHeader, SaveBar, StringListEditor, inputCls, isSame, textareaCls, useSaver } from "@/components/admin/ui";
import type { EditInfo } from "@/lib/admin-data";
import type { AboutContent, HeroContent, ServicesContent } from "@/lib/content-types";

type Texts = { hero: HeroContent; about: AboutContent; services: ServicesContent };

export default function TextsEditor({ initial, info }: { initial: Texts; info: EditInfo }) {
  const [saved, setSaved] = useState(initial);
  const [v, setV] = useState(initial);
  const { pending, status, save } = useSaver();
  const setHero = (p: Partial<HeroContent>) => setV((x) => ({ ...x, hero: { ...x.hero, ...p } }));
  const setAbout = (p: Partial<AboutContent>) => setV((x) => ({ ...x, about: { ...x.about, ...p } }));
  const setServices = (p: Partial<ServicesContent>) => setV((x) => ({ ...x, services: { ...x.services, ...p } }));

  return (
    <div>
      <PageHeader title="Hero · Rólunk · Szolgáltatások" description="A főoldal teteje, a „Master Dance Tánciskola” bemutatkozás és a Szolgáltatások oldal szövegei." />
      <div className="space-y-6">
        <Card title="Hero (a főoldal teteje)">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-5">
              <Field label="Nagy cím" htmlFor="h-title" hint="Anton betűvel, egy sorban — maradjon rövid.">
                <input id="h-title" className={inputCls} value={v.hero.title} onChange={(e) => setHero({ title: e.target.value })} />
              </Field>
              <Field label="Bemutatkozó mondat" htmlFor="h-lead" hint="A fehér dobozban, a cím alatt. Üresen hagyva a doboz eltűnik.">
                <textarea id="h-lead" rows={3} className={textareaCls} value={v.hero.lead} onChange={(e) => setHero({ lead: e.target.value })} />
              </Field>
            </div>
            <Field label="Háttérkép">
              <MediaField kind="image" value={v.hero.imagePath} allowRemove={false} onChange={(p) => p && setHero({ imagePath: p })} aspectClass="aspect-[16/10]" />
            </Field>
          </div>
        </Card>

        <Card title="Rólunk (A Master Dance Tánciskola)">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Cím 1. sor" htmlFor="a-t1">
                  <input id="a-t1" className={inputCls} value={v.about.titleLine1} onChange={(e) => setAbout({ titleLine1: e.target.value })} />
                </Field>
                <Field label="Cím 2. sor" htmlFor="a-t2">
                  <input id="a-t2" className={inputCls} value={v.about.titleLine2} onChange={(e) => setAbout({ titleLine2: e.target.value })} />
                </Field>
              </div>
              <Field label="Bekezdések" htmlFor="a-p" hint="Üres sorral válaszd el a bekezdéseket.">
                <textarea id="a-p" rows={10} className={textareaCls} value={v.about.paragraphs} onChange={(e) => setAbout({ paragraphs: e.target.value })} />
              </Field>
            </div>
            <div className="space-y-4">
              <Field label="Kép (Insta-kártyában)">
                <MediaField kind="image" value={v.about.imagePath} allowRemove={false} onChange={(p) => p && setAbout({ imagePath: p })} aspectClass="aspect-square" />
              </Field>
              <Field label="Kép leírása" htmlFor="a-alt" hint="Képernyőolvasóknak.">
                <input id="a-alt" className={inputCls} value={v.about.imageAlt} onChange={(e) => setAbout({ imageAlt: e.target.value })} />
              </Field>
            </div>
          </div>
        </Card>

        <Card title="Szolgáltatások oldal" description="Az MD Dance Company előnézet és az átterelő szöveg.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Fejléc cím" htmlFor="s-ht">
              <input id="s-ht" className={inputCls} value={v.services.heroTitle} onChange={(e) => setServices({ heroTitle: e.target.value })} />
            </Field>
            <Field label="Fejléc szöveg" htmlFor="s-hl">
              <input id="s-hl" className={inputCls} value={v.services.heroLead} onChange={(e) => setServices({ heroLead: e.target.value })} />
            </Field>
            <Field label="Felső kis felirat" htmlFor="s-k">
              <input id="s-k" className={inputCls} value={v.services.kicker} onChange={(e) => setServices({ kicker: e.target.value })} />
            </Field>
            <Field label="Cím" htmlFor="s-t">
              <input id="s-t" className={inputCls} value={v.services.title} onChange={(e) => setServices({ title: e.target.value })} />
            </Field>
            <Field label="Szöveg" htmlFor="s-x" className="md:col-span-2">
              <textarea id="s-x" rows={4} className={textareaCls} value={v.services.text} onChange={(e) => setServices({ text: e.target.value })} />
            </Field>
            <Field label="Kiemelések (címkék)" className="md:col-span-2">
              <StringListEditor items={v.services.highlights} onChange={(highlights) => setServices({ highlights })} addLabel="+ Új kiemelés" max={8} />
            </Field>
            <Field label="MD Dance Company oldal címe" htmlFor="s-u">
              <input id="s-u" className={inputCls} value={v.services.url} onChange={(e) => setServices({ url: e.target.value })} />
            </Field>
            <Field label="Gomb felirata" htmlFor="s-b">
              <input id="s-b" className={inputCls} value={v.services.buttonLabel} onChange={(e) => setServices({ buttonLabel: e.target.value })} />
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
        onSave={() => save(() => saveTexts(v), undefined, () => setSaved(v))}
      />
    </div>
  );
}
