/* eslint-disable @next/next/no-img-element -- Storage-beli kép, nem ismert build-időben */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getNewsPage, getSiteContent, readNews } from "@/lib/content";
import { mediaUrl } from "@/lib/format";
import { hasEnglishNews } from "@/lib/localize";

type Props = { params: Promise<{ slug: string }> };

/** Buildkor a meglévő hírek oldalai előre elkészülnek; az újak az első megnyitáskor. */
export async function generateStaticParams() {
  const news = await readNews();
  // legalább egy paraméter kell a build ellenőrzéséhez (üres lista esetén 404 lesz)
  return news.length > 0 ? news.map((n) => ({ slug: n.slug })) : [{ slug: "nincs-hir" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsPage(decodeURIComponent(slug));
  if (!item) return { title: "Hír nem található – MD Dance School" };
  return {
    title: `${item.title} – MD Dance School`,
    description: item.excerpt || item.title,
    alternates: {
      canonical: `/hirek/${slug}`,
      languages: hasEnglishNews(item)
        ? { hu: `/hirek/${slug}`, en: `/en/news/${slug}` }
        : { hu: `/hirek/${slug}` },
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const [item, { settings }] = await Promise.all([getNewsPage(decodeURIComponent(slug)), getSiteContent()]);
  if (!item) notFound();
  const alternateHref = hasEnglishNews(item) ? `/en/news/${slug}` : "/en/news";

  return (
    <main className="bg-white">
      <Navbar alternateHref={alternateHref} />
      <article className="px-5 pb-28 pt-36 sm:pt-40">
        <div className="mx-auto max-w-3xl">
          <Link href="/hirek" className="text-xs font-bold uppercase tracking-[0.3em] text-md-deep hover:text-black">
            ← Összes hír
          </Link>
          <p className="mt-6 font-mono text-[11px] font-bold text-md-deep">{item.dateLabel}</p>
          <h1 className="section-title mt-3 text-4xl text-black sm:text-5xl">{item.title}</h1>
          {item.excerpt && <p className="mt-6 text-lg font-semibold leading-relaxed text-gray-500">{item.excerpt}</p>}

          {item.imagePath && (
            <img src={mediaUrl(item.imagePath)} alt={item.imageAlt || item.title} className="mt-10 w-full rounded-[2rem] shadow-lg" />
          )}

          {/* A szöveget az admin WYSIWYG szerkesztője írja; mentéskor szerveroldalon megtisztítjuk. */}
          <div className="news-body mt-10" dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />

          <div className="mt-14 flex flex-wrap gap-4">
            <Link
              href="/orarend"
              className="bg-ink text-white px-8 py-5 rounded-2xl font-extrabold uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-md-teal transition-colors"
            >
              Jelentkezés órára
            </Link>
            <Link
              href="/hirek"
              className="border-2 border-black/10 text-black px-8 py-5 rounded-2xl font-extrabold uppercase tracking-[0.2em] text-xs hover:border-md-deep hover:text-md-deep transition-colors"
            >
              Összes hír
            </Link>
          </div>
        </div>
      </article>
      <Footer footer={settings.footer} alternateHref={alternateHref} />
    </main>
  );
}
