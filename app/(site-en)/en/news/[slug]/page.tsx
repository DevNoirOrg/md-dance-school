/* eslint-disable @next/next/no-img-element -- Storage-beli kép, nem ismert build-időben */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import LanguageSwitch from "@/components/LanguageSwitch";
import Navbar from "@/components/Navbar";
import { getNewsPage, getSiteContent, readNews } from "@/lib/content";
import { hasEnglishNews, localize, localizeSettings } from "@/lib/localize";
import { mediaUrl } from "@/lib/format";
import { alternateLocalePath } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const news = await readNews();
  const translatedNews = news.filter(hasEnglishNews);
  return translatedNews.length > 0 ? translatedNews.map((item) => ({ slug: item.slug })) : [{ slug: "no-english-news" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsPage(decodeURIComponent(slug));
  if (!item || !hasEnglishNews(item)) return { title: "News not found – MD Dance School" };
  const en = localize(item, "en");
  return {
    title: `${en.title} – MD Dance School`,
    description: en.excerpt || en.title,
    alternates: { canonical: `/en/news/${slug}`, languages: { hu: `/hirek/${slug}`, en: `/en/news/${slug}` } },
  };
}

export default async function EnglishNewsArticle({ params }: Props) {
  const { slug } = await params;
  const [item, { settings: rawSettings }] = await Promise.all([
    getNewsPage(decodeURIComponent(slug)),
    getSiteContent(),
  ]);
  if (!item || !hasEnglishNews(item)) notFound();
  const article = localize(item, "en");
  const settings = localizeSettings(rawSettings, "en");
  const copy = t("en").common;
  return (
    <main className="bg-white">
      <Navbar locale="en" />
      <article className="px-5 pb-28 pt-36 sm:pt-40">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <Link href="/en/news" className="text-xs font-bold uppercase tracking-[0.2em] text-md-deep hover:text-black">← {copy.allNews}</Link>
            <LanguageSwitch locale="en" alternateHref={alternateLocalePath(`/en/news/${slug}`, "en")} />
          </div>
          <p className="mt-6 font-mono text-[11px] font-bold text-md-deep">{article.dateLabel}</p>
          <h1 className="section-title mt-3 text-4xl text-black sm:text-5xl">{article.title}</h1>
          {article.excerpt && <p className="mt-6 text-lg font-semibold leading-relaxed text-gray-500">{article.excerpt}</p>}
          <div className="news-body mt-10" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
          {/* The image comes after the text; at most 80% of the screen height, full size on click. */}
          {article.imagePath && (
            <a href={mediaUrl(article.imagePath)} target="_blank" rel="noopener noreferrer" title="Open image in full size" className="mt-12 block">
              <img src={mediaUrl(article.imagePath)} alt={article.imageAlt || article.title} className="mx-auto block h-auto max-h-[80vh] w-auto max-w-full rounded-[2rem] shadow-lg" />
            </a>
          )}
          <div className="mt-14 flex flex-wrap gap-4">
            <Link href="/en/schedule" className="rounded-2xl bg-ink px-8 py-5 text-xs font-extrabold uppercase tracking-[0.2em] text-white shadow-xl transition-colors hover:bg-md-teal">{copy.apply}</Link>
            <Link href="/en/news" className="rounded-2xl border-2 border-black/10 px-8 py-5 text-xs font-extrabold uppercase tracking-[0.2em] text-black transition-colors hover:border-md-deep hover:text-md-deep">{copy.allNews}</Link>
          </div>
        </div>
      </article>
      <Footer footer={settings.footer} locale="en" />
    </main>
  );
}
