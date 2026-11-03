/* eslint-disable @next/next/no-img-element -- Storage-beli kép, nem ismert build-időben */
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getSiteContent } from "@/lib/content";
import { mediaUrl } from "@/lib/format";

export const metadata: Metadata = {
  title: "Hírek – MD Dance School",
  description: "Az MD Dance School hírei és eseményei: workshopok, buli, új órák.",
};

export default async function HirekPage() {
  const { news, settings } = await getSiteContent();
  return (
    <main className="bg-white">
      <Navbar />
      <section className="px-5 pb-24 pt-36 sm:pt-40">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-md-deep">MD Dance School</p>
          <h1 className="section-title mt-3 mb-14 text-5xl text-black sm:text-6xl">Hírek és események</h1>

          {news.length > 0 ? (
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-3">
              {news.map((item) => (
                <Link key={item.id} href={`/hirek/${item.slug}`} className="group block">
                  <div className="mb-4 aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-gray-100">
                    {item.imagePath ? (
                      <img
                        src={mediaUrl(item.imagePath)}
                        alt={item.imageAlt || item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-center font-mono text-[10px] uppercase tracking-widest text-gray-300">
                        {item.placeholderLabel}
                      </div>
                    )}
                  </div>
                  <p className="font-mono text-[11px] font-bold text-md-deep">{item.dateLabel}</p>
                  <h2 className="mt-1 mb-2 text-lg font-bold leading-tight text-black group-hover:text-md-deep transition-colors">{item.title}</h2>
                  <p className="text-sm leading-relaxed text-gray-500">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="font-semibold text-gray-500">Jelenleg nincs hír.</p>
          )}
        </div>
      </section>
      <Footer footer={settings.footer} />
    </main>
  );
}
