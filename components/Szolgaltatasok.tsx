"use client";
import { ArrowUpRight } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import HalftoneDots from "./HalftoneDots";
import PageHero from "./PageHero";
import type { ServicesContent } from "@/lib/content-types";

/* ──────────────────────────────────────────────────────────────
   Szolgáltatások oldal — az MD Dance Company oldal nagy előnézete
   és egy rövid szöveg, ami átterel oda. A szövegek az adminban szerkeszthetők.
   ────────────────────────────────────────────────────────────── */

// Az MD Dance Company oldal hero-videója (tömörítve, hang nélkül) + állókép a betöltésig,
// és a logójuk — ezekből rakjuk össze az „igazi oldal” tetejét a böngészőkeretben.
const VIDEO_SRC = "/mdcompany-hero.mp4";
const POSTER_SRC = "/mdcompany-hero-poster.jpg";
const COMPANY_LOGO = "/mdcompany-logo.png";

const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export function SzolgaltatasokHero({ services }: { services: ServicesContent }) {
  return (
    <PageHero
      title={services.heroTitle}
      lead={services.heroLead}
      image="/canva/about-group.jpg"
      position="center 40%"
      overlay="linear-gradient(0deg, rgba(0,0,0,0.78), rgba(0,0,0,0.5))"
      className="min-h-[420px] pb-28 sm:min-h-[480px]"
      dots
    />
  );
}

export function CompanyPreview({ services }: { services: ServicesContent }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="relative z-20 px-4 pb-24 sm:pb-32" style={{ overflowX: 'clip' }}>
      <HalftoneDots className="hidden md:block" size={260} zIndex={0} style={{ top: '45%', right: -130 }} />

      <div className="relative z-10 mx-auto -mt-16 max-w-6xl sm:-mt-20">
        {/* ── Nagy előnézet böngésző-keretben ── */}
        <motion.a
          ref={ref}
          href={services.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Az MD Dance Company weboldalának megnyitása új lapon"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6 }}
          className="company-preview group block overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#1b1b1b] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#40CFD5]"
        >
          {/* Böngésző-fejléc */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-[#1b1b1b] px-4 py-3 sm:px-5">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="mx-auto flex min-w-0 max-w-md flex-1 items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs text-white/70 sm:text-sm">
              <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0 fill-white/50" aria-hidden="true">
                <path d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-.5V4.5A3.5 3.5 0 0 0 8 1Zm2 6H6V4.5a2 2 0 1 1 4 0V7Z" />
              </svg>
              <span className="truncate">{hostOf(services.url)}</span>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-white/40 transition-colors group-hover:text-[#40CFD5]" />
          </div>

          {/* Az MD Dance Company oldal teteje: hero-videó + az igazi oldal fejléce és felirata */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-black sm:aspect-[16/10]">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={VIDEO_SRC}
              poster={POSTER_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-black/40" />

            {/* Fejléc: logó balra, „Contact us” jobbra (mint az éles oldalon) */}
            <div aria-hidden="true" className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={COMPANY_LOGO} alt="" className="h-7 w-auto sm:h-10" />
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm sm:px-7 sm:py-2 sm:text-sm">
                Contact us
              </span>
            </div>

            {/* Középen a felirat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <span className="mb-3 text-[9px] font-bold uppercase tracking-[0.5em] text-white/70 sm:mb-5 sm:text-xs">
                MD Dance Company
              </span>
              <span
                className="font-bold leading-[0.9] tracking-tighter text-white"
                style={{ fontSize: 'clamp(28px, 6.2vw, 92px)', fontFamily: 'var(--font-inter), Inter, sans-serif' }}
              >
                We Turn Movement
                <br />
                Into Moments
              </span>
            </div>

            {/* Hover-felirat */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:p-7">
              <span className="flex items-center gap-2 rounded-full bg-[#40CFD5] px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest text-black shadow-xl">
                Megnyitás <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </div>
          </div>
        </motion.a>

        {/* ── Rövid átterelő szöveg ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-14 max-w-2xl text-center sm:mt-16"
        >
          {services.kicker && (
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-md-deep sm:text-sm">{services.kicker}</p>
          )}
          <h2 className="section-title mt-3 text-4xl text-black sm:text-5xl">{services.title}</h2>
          <p className="mt-5 text-base leading-relaxed text-gray-600 sm:text-lg">{services.text}</p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {services.highlights.map((h) => (
              <span key={h} className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
                {h}
              </span>
            ))}
          </div>

          <a
            href={services.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-flex items-center gap-2 rounded-xl bg-black px-7 py-4 text-sm font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-[#40CFD5] hover:text-black"
          >
            {services.buttonLabel}
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
