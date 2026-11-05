import type { Metadata } from "next";
import { Fragment } from "react";
import Footer from "@/components/Footer";
import LanguageSwitch from "@/components/LanguageSwitch";
import Navbar from "@/components/Navbar";
import { getSiteContent } from "@/lib/content";
import { localizeSettings } from "@/lib/localize";
import { parsePrivacyText, type PrivacyBlock } from "@/lib/privacy";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "MD Dance School privacy policy. Available in Hungarian only.",
  alternates: { canonical: "/en/privacy", languages: { hu: "/adatkezeles", en: "/en/privacy" } },
};

function Blocks({ blocks }: { blocks: PrivacyBlock[] }) {
  return blocks.map((block, index) => block.type === "ul" ? (
    <ul key={index} className="my-4 list-disc space-y-1.5 pl-6 marker:text-md-deep">
      {block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
    </ul>
  ) : (
    <p key={index} className="my-4">
      {block.lines.map((line, lineIndex) => <Fragment key={lineIndex}>{lineIndex > 0 && <br />}{line}</Fragment>)}
    </p>
  ));
}

export default async function EnglishPrivacyPage() {
  const { settings: raw } = await getSiteContent();
  const settings = localizeSettings(raw, "hu");
  const { intro, sections } = parsePrivacyText(settings.privacy.text);
  return (
    <main className="bg-white">
      <Navbar locale="en" />
      <section className="px-5 pb-24 pt-36 sm:pt-40">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-md-deep">MD Dance School</p>
            <LanguageSwitch locale="en" />
          </div>
          <h1 className="section-title mt-3 text-5xl text-black sm:text-6xl">Privacy policy</h1>
          <p className="mt-6 rounded-[1.75rem] border-2 border-yellow-200 bg-yellow-50 px-6 py-5 text-sm font-semibold text-yellow-900">
            {t("en").common.privacyOnly}
          </p>
          {intro.length > 0 && <div className="mt-8 space-y-2 rounded-[1.75rem] border-2 border-yellow-200 bg-yellow-50 px-6 py-5 text-sm font-semibold text-yellow-900">{intro.map((block, index) => block.type === "ul" ? <ul key={index} className="list-disc pl-5">{block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul> : <p key={index}>{block.lines.join(" ")}</p>)}</div>}
          <nav className="mt-10 rounded-[2rem] bg-gray-50 p-6 ring-1 ring-black/5 md:p-8">
            <p className="mb-4 text-[11px] font-extrabold uppercase tracking-widest text-gray-400">{t("en").common.contents}</p>
            <ol className="grid list-decimal gap-x-8 gap-y-2 pl-5 text-sm font-semibold text-gray-600 marker:text-md-deep sm:grid-cols-2">
              {sections.map((section) => <li key={section.id}><a className="hover:text-md-deep" href={`#${section.id}`}>{section.title}</a></li>)}
            </ol>
          </nav>
          <article className="mt-12 text-[15px] leading-relaxed text-gray-700">
            {sections.map((section, index) => <section key={section.id} className="mt-10 first:mt-0"><h2 id={section.id} className="scroll-mt-32 text-2xl font-extrabold text-black">{index + 1}. {section.title}</h2><Blocks blocks={section.blocks} /></section>)}
          </article>
        </div>
      </section>
      <Footer footer={settings.footer} locale="en" />
    </main>
  );
}
