"use client";
/* eslint-disable @next/next/no-img-element -- dekoratív pöttyképek */
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { Fragment, type ReactNode } from "react";
import FadeIn from "../FadeIn";
import HalftoneDots from "../HalftoneDots";
import InstaCard from "../InstaCard";
import type { CampContent, Teacher } from "@/lib/content-types";
import { mediaUrl } from "@/lib/format";

/* A tánctábor oldal szekciói — a tartalom az adminban szerkeszthető (Tánctábor menüpont). */

// Oszlop-fejléc: kis, nagybetűs cím alatta vonallal
function PanelTitle({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "light" }) {
  const color = tone === "light" ? "text-white border-white/30" : "text-black border-black/80";
  return <h2 className={`section-title mb-6 border-b-2 pb-3 text-2xl tracking-wide sm:text-3xl ${color}`}>{children}</h2>;
}

function SubTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`mb-2 text-[17px] font-extrabold ${className}`}>{children}</h3>;
}

function Dot() {
  return <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-md-cyan" />;
}

/** Szöveg, amiben a http(s) linkek kattinthatók. */
function Linkify({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/\S+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-md-deep underline underline-offset-2 hover:text-black">
        {p.replace(/^https?:\/\//, "")}
      </a>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

/**
 * Befizetési mód egy sora: „Cím: szöveg” → a cím félkövér (ha a szöveg hosszabb),
 * a „[Hamarosan]” szögletes zárójeles rész címkeként jelenik meg, a linkek kattinthatók.
 */
function PaymentLine({ line }: { line: string }) {
  const badge = line.match(/\[([^\]]+)\]\s*$/);
  const text = badge ? line.slice(0, badge.index).trim() : line;
  const m = text.match(/^([^:]{1,40}):\s+(.+)$/);
  const boldTitle = m && !/^https?:/.test(m[2]) && m[2].length > 40;
  return (
    <span className={badge ? "flex flex-wrap items-center gap-2.5" : undefined}>
      {m && boldTitle ? (
        <>
          <strong className="text-black">{m[1]}:</strong> <Linkify text={m[2]} />
        </>
      ) : (
        <Linkify text={text} />
      )}
      {badge && (
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">{badge[1]}</span>
      )}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   1) Fejléc
   ────────────────────────────────────────────────────────────── */

export function TaborHero({ camp }: { camp: CampContent }) {
  return (
    <section className="relative overflow-hidden bg-black px-5 pb-28 pt-32 sm:pt-36 lg:pb-32" style={{ overflowX: "clip" }}>
      {/* Halvány háttérkép + sötét átmenet */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover opacity-35"
        style={{ backgroundImage: "url('/canva/hero-crowd.jpg')", backgroundPosition: "center 42%" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />
      <HalftoneDots size={240} zIndex={1} style={{ bottom: -70, left: -90 }} />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        {/* ── Bal oszlop: kedvcsináló szöveg + gombok ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="text-center lg:text-left">
          {camp.badge && (
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-md-cyan">
              {camp.badge}
            </span>
          )}
          <h1 className="section-title mt-6 text-5xl text-white sm:text-7xl md:text-8xl">{camp.title}</h1>
          {camp.lead && <p className="mx-auto mt-6 max-w-xl text-lg font-semibold leading-relaxed text-white/90 lg:mx-0">{camp.lead}</p>}
          {camp.sub && <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/65 lg:mx-0">{camp.sub}</p>}
          <div className="mt-9 flex flex-wrap justify-center gap-4 lg:justify-start">
            <a
              href="#jelentkezes"
              className="rounded-full bg-md-cyan px-10 py-4 text-sm font-extrabold uppercase tracking-[0.2em] text-black shadow-xl transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              Jelentkezem
            </a>
            <a
              href="#info"
              className="rounded-full border border-white/40 px-10 py-4 text-sm font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10"
            >
              Árak és időpontok
            </a>
          </div>
        </motion.div>

        {/* ── Jobb oszlop: álló reel-videó (vagy helyőrző) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="justify-self-center lg:justify-self-end"
        >
          <div className="relative aspect-[9/16] w-[min(72vw,300px)] overflow-hidden rounded-[2rem] bg-black/60 backdrop-blur-sm sm:w-[min(60vw,320px)] lg:w-[340px]">
            {camp.reelPath ? (
              <video className="absolute inset-0 h-full w-full object-cover" src={mediaUrl(camp.reelPath)} autoPlay muted loop playsInline />
            ) : (
              <div className="absolute inset-0 grid place-items-center rounded-[2rem] border border-dashed border-white/25">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">Álló videó</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   2) Három oszlop: Árak (fehér) · Időpontok (fekete) · Helyszín (türkiz)
   ────────────────────────────────────────────────────────────── */

export function TaborInfo({ camp }: { camp: CampContent }) {
  return (
    <section id="info" className="relative z-20 scroll-mt-24 px-4 pb-20 sm:pb-28" style={{ overflowX: "clip" }}>
      <HalftoneDots size={260} zIndex={0} style={{ bottom: 40, right: -130 }} />

      <FadeIn className="relative z-10 mx-auto -mt-12 max-w-7xl">
        <div className="grid grid-cols-1 overflow-hidden rounded-[2rem] border border-gray-200 shadow-[0_24px_70px_rgba(0,0,0,0.18)] lg:grid-cols-[1.7fr_1fr_1fr]">
          {/* ── Árak ── */}
          <div className="bg-white px-6 py-9 sm:px-10 sm:py-11">
            <PanelTitle>Árak</PanelTitle>

            <SubTitle>Tábor díja</SubTitle>
            <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50/60">
              {camp.prices.map((p, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-4 py-3">
                  {p.emoji && (
                    <span className="text-lg leading-none" aria-hidden="true">
                      {p.emoji}
                    </span>
                  )}
                  <span className="font-semibold text-black">{p.name}</span>
                  <span className="ml-auto whitespace-nowrap font-extrabold text-black">{p.price}</span>
                  {p.until && (
                    <span className="basis-full pl-8 text-[13px] text-gray-500">
                      Elérhető: <strong className="font-bold text-gray-700">{p.until}</strong>
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-5 text-[15px] leading-relaxed text-gray-700">
              {camp.priceIncludes} {camp.priceExcludes && <span className="text-gray-500">{camp.priceExcludes}</span>}
            </p>

            <SubTitle className="mt-8">Szabad helyek</SubTitle>
            <ul className="space-y-2.5">
              {camp.turnusok.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[15px] text-gray-800">
                  <span>
                    <strong className="text-black">{t.label}:</strong> {t.dates} ({t.days})
                  </span>
                  {t.status && (
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${
                        t.closed ? "bg-black text-white" : "bg-md-cyan text-black"
                      }`}
                    >
                      {t.status}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {camp.paymentMethods.length > 0 && (
              <>
                <SubTitle className="mt-8">Befizetési módok</SubTitle>
                <ul className="space-y-2.5 text-[15px] leading-relaxed text-gray-800">
                  {camp.paymentMethods.map((line, i) => (
                    <li key={i} className="flex gap-2.5">
                      <Dot />
                      <PaymentLine line={line} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* ── Időpontok ── */}
          <div className="flex flex-col bg-black px-6 py-9 text-white sm:px-10 sm:py-11 lg:px-8">
            <PanelTitle tone="light">Időpontok</PanelTitle>

            <ul className="space-y-4">
              {camp.turnusok.map((t) => (
                <li key={t.id} className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-md-cyan" strokeWidth={1.8} />
                  <span className={`text-[15px] leading-relaxed ${t.closed ? "text-white/50" : ""}`}>
                    <strong className="text-white">{t.label}:</strong> {t.dates}
                    <br />({t.days}){t.closed && " – lezárva"}
                  </span>
                </li>
              ))}
            </ul>

            {(camp.meetingText || camp.meetingTime) && (
              <div className="mt-7 flex gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-md-cyan" strokeWidth={1.8} />
                <p className="text-[15px] leading-relaxed text-white/90">
                  {camp.meetingText}
                  {camp.meetingTime && (
                    <>
                      <br />
                      <strong className="text-white">{camp.meetingTime}</strong>
                    </>
                  )}
                </p>
              </div>
            )}

            {camp.endText && <p className="mt-7 text-[15px] leading-relaxed text-white/75">{camp.endText}</p>}

            <a
              href="#jelentkezes"
              className="mt-10 block rounded-xl bg-md-cyan px-6 py-4 text-center text-sm font-extrabold uppercase tracking-widest text-black transition-colors hover:bg-white lg:mt-auto"
            >
              Jelentkezek
            </a>
          </div>

          {/* ── Helyszín ── */}
          <div className="bg-md-cyan px-6 py-9 text-black sm:px-10 sm:py-11 lg:px-8">
            <PanelTitle>Tábor helyszíne</PanelTitle>

            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} />
              <div>
                <p className="text-[17px] font-extrabold leading-snug">{camp.locationName}</p>
                <p className="mt-1 text-[15px]">{camp.locationAddress}</p>
              </div>
            </div>

            {camp.importantText && (
              <>
                <SubTitle className="mt-8">Fontos tudnivaló</SubTitle>
                <p className="text-[15px] leading-relaxed text-black/80">{camp.importantText}</p>
              </>
            )}

            {camp.applyText && (
              <>
                <SubTitle className="mt-8">Jelentkezési lehetőség</SubTitle>
                <p className="text-[15px] leading-relaxed text-black/80">{camp.applyText}</p>
              </>
            )}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   3) Tánctanáraink — rács Insta-kártyákkal
   ────────────────────────────────────────────────────────────── */

const teacherDots = [
  { top: "6%", left: "-3%", size: 180, mobile: true },
  { top: "55%", left: "4%", size: 140 },
  { top: "-4%", left: "46%", size: 150 },
  { top: "10%", right: "8%", size: 200 },
  { top: "62%", right: "-4%", size: 230, mobile: true },
];
const ROTATE = [-2, 1.5, -1.5, 2, -1];

export function TaborTeachers({ camp, teachers }: { camp: CampContent; teachers: Teacher[] }) {
  // A tábor tanárai a Tanárok listából (fotó, Insta-videó link), a táborban megadott sorrendben.
  const list = camp.teachers.map((name) => teachers.find((t) => t.name === name)).filter((t): t is Teacher => !!t);
  if (list.length === 0) return null;

  return (
    <section id="tanarok" className="relative bg-black px-4 py-20 sm:py-28" style={{ overflowX: "clip" }}>
      {teacherDots.map((d, i) => (
        <img
          key={i}
          src="/dots-cyan.png"
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute select-none ${d.mobile ? "" : "hidden md:block"}`}
          style={{ top: d.top, left: d.left, right: d.right, width: d.size }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-7xl">
        <FadeIn>
          <h2 className="section-title mb-12 text-center text-5xl text-white sm:mb-16 sm:text-6xl">TÁNCTANÁRAINK</h2>
        </FadeIn>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-10">
          {list.map((t, i) => (
            <FadeIn
              key={t.id}
              delay={i * 0.08}
              className="w-full max-w-[280px] sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-1.2rem)]"
            >
              {/* Kattintásra új lapon nyílik a tanár Insta-videója (mint a főoldalon) */}
              <motion.a
                href={t.videoUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t.name} táncvideója az Instagramon`}
                className="block cursor-pointer rounded-2xl focus-visible:outline-4 focus-visible:outline-md-cyan"
                style={{ rotate: ROTATE[i % ROTATE.length] }}
                whileHover={{ y: -8, rotate: 0, transition: { duration: 0.3 } }}
              >
                <InstaCard
                  src={mediaUrl(t.imagePath)}
                  alt={`${t.name} — ${camp.teacherRole}`}
                  width={280}
                  caption={{ name: t.name, style: camp.teacherRole }}
                  video={!!t.videoUrl}
                />
              </motion.a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
