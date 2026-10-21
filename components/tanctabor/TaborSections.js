'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, CalendarDays, Clock3 } from 'lucide-react'
import InstaCard from '../InstaCard'
import HalftoneDots from '../HalftoneDots'
import { teacherByName } from '@/lib/teachers'

/* ──────────────────────────────────────────────────────────────
   TARTALOM — itt szerkeszthető
   ────────────────────────────────────────────────────────────── */

export const prices = [
  { emoji: '🎊', name: 'New Year Deal', price: '78 990 Ft', until: '2026. február 28-ig' },
  { emoji: '⚡', name: 'Super Early Jegy', price: '81 990 Ft', until: '2026. április 30-ig' },
  { emoji: '⏰', name: 'Early Ticket', price: '84 990 Ft', until: '2026. május 31-ig' },
  { emoji: '🎫', name: 'Normal Ticket', price: '87 990 Ft', until: '2026. június 30-ig' },
  { emoji: '🚨', name: 'Late Ticket', price: '90 990 Ft', until: '2026. július 1-től' },
]

export const turnusok = [
  { id: 'I', label: '1. turnus', dates: '2026.07.05–08.', days: 'vasárnap–szerda', closed: true, status: 'Lezárva' },
  { id: 'II', label: '2. turnus', dates: '2026.07.09–12.', days: 'csütörtök–vasárnap', closed: false, status: '10 hely még elérhető' },
]

const MD_APP_URL = 'https://md.dancepass.app/workshops'

// A tábor tanárai — fotó és Insta-videó link a közös lib/teachers.js-ből
const campTeachers = [
  { name: 'Lili', role: 'MD Tánctanár', rotate: -2 },
  { name: 'Dalma', role: 'MD Tánctanár', rotate: 1.5 },
  { name: 'Jayson', role: 'MD Tánctanár', rotate: -1.5 },
  { name: 'Alex', role: 'MD Tánctanár', rotate: 2 },
  { name: 'Oliver', role: 'MD Tánctanár', rotate: -1 },
].map((t) => ({ ...teacherByName(t.name), ...t }))

/* ──────────────────────────────────────────────────────────────
   Segédek
   ────────────────────────────────────────────────────────────── */

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

// Oszlop-fejléc: kis, nagybetűs cím alatta vonallal (a régi oldal mintájára)
function PanelTitle({ children, tone = 'dark' }) {
  const color = tone === 'light' ? 'text-white border-white/30' : 'text-black border-black/80'
  return (
    <h2 className={`section-title text-2xl sm:text-3xl tracking-wide pb-3 mb-6 border-b-2 ${color}`}>{children}</h2>
  )
}

function SubTitle({ children, className = '' }) {
  return <h3 className={`font-extrabold text-[17px] mb-2 ${className}`}>{children}</h3>
}

/* ──────────────────────────────────────────────────────────────
   1) Fejléc — a Stúdió bérlés oldal mintájára
   ────────────────────────────────────────────────────────────── */

export function TaborHero() {
  return (
    <section
      className="relative flex min-h-[440px] items-center justify-center bg-black px-5 pb-24 pt-32 text-center sm:min-h-[500px] sm:pt-36"
      style={{
        backgroundImage:
          "linear-gradient(0deg, rgba(0,0,0,0.76), rgba(0,0,0,0.48)), url('/canva/hero-crowd.jpg')",
        backgroundPosition: 'center 42%',
        backgroundSize: 'cover',
        overflowX: 'clip',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent"
      />
      <HalftoneDots size={240} zIndex={1} style={{ bottom: -70, left: -90 }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        className="relative z-10 max-w-4xl"
      >
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#40CFD5] sm:text-sm">
          MD Dance School · Nyári tábor
        </p>
        <h1 className="section-title text-5xl text-white sm:text-7xl md:text-8xl">TÁNCTÁBOR 2026</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
          4 nap tánc, wellness, sport és közösség a Szigetszentmiklósi Oázis Wellness Parkban.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          {turnusok.map((t) => (
            <span
              key={t.id}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold ${
                t.closed ? 'bg-white/10 text-white/60 line-through decoration-white/40' : 'bg-[#40CFD5] text-black'
              }`}
            >
              {t.label} · {t.dates}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────
   2) Három oszlop: Árak (fehér) · Időpontok (fekete) · Helyszín (türkiz)
   ────────────────────────────────────────────────────────────── */

export function TaborInfo() {
  return (
    <section className="relative z-20 px-4 pb-20 sm:pb-28" style={{ overflowX: 'clip' }}>
      <HalftoneDots size={260} zIndex={0} style={{ bottom: 40, right: -130 }} />

      <FadeIn className="relative z-10 mx-auto -mt-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr_1fr] overflow-hidden rounded-[2rem] shadow-[0_24px_70px_rgba(0,0,0,0.18)] border border-gray-200">
          {/* ── Árak ── */}
          <div className="bg-white px-6 py-9 sm:px-10 sm:py-11">
            <PanelTitle>Árak</PanelTitle>

            <SubTitle>Tábor díja</SubTitle>
            <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50/60">
              {prices.map((p) => (
                <li key={p.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-4 py-3">
                  <span className="text-lg leading-none" aria-hidden="true">{p.emoji}</span>
                  <span className="font-semibold text-black">{p.name}</span>
                  <span className="ml-auto font-extrabold text-black whitespace-nowrap">{p.price}</span>
                  <span className="basis-full pl-8 text-[13px] text-gray-500">
                    Elérhető: <strong className="font-bold text-gray-700">{p.until}</strong>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-[15px] leading-relaxed text-gray-700">
              Az ár tartalmazza a 4 napos, 3 éjszakás szállást, a fürdő és a wellness használatot, a táncórákat, a
              sportolási lehetőségeket, a napi háromszori étkeztetést és a programokat.{' '}
              <span className="text-gray-500">Az ár nem tartalmazza az útiköltséget és a költőpénzt.</span>
            </p>

            <SubTitle className="mt-8">Szabad helyek</SubTitle>
            <ul className="space-y-2.5">
              {turnusok.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[15px] text-gray-800">
                  <span>
                    <strong className="text-black">{t.label}:</strong> {t.dates} ({t.days})
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${
                      t.closed ? 'bg-black text-white' : 'bg-[#40CFD5] text-black'
                    }`}
                  >
                    {t.status}
                  </span>
                </li>
              ))}
            </ul>

            <SubTitle className="mt-8">Befizetési módok</SubTitle>
            <ul className="space-y-2.5 text-[15px] leading-relaxed text-gray-800">
              <li className="flex gap-2.5"><Dot />Készpénz</li>
              <li className="flex gap-2.5"><Dot />Banki átutalás</li>
              <li className="flex gap-2.5">
                <Dot />
                <span>
                  MD APP:{' '}
                  <a href={MD_APP_URL} target="_blank" rel="noopener noreferrer"
                    className="font-semibold text-[#179da3] underline underline-offset-2 hover:text-black break-all">
                    md.dancepass.app/workshops
                  </a>
                </span>
              </li>
              <li className="flex gap-2.5">
                <Dot />
                <span>
                  <strong className="text-black">SZÉP kártya:</strong> MKB, OTP vagy K&amp;H SZÉP kártyával is van
                  lehetőségetek fizetni. Ebben az esetben az előleget továbbra is készpénzben vagy átutalással kell
                  befizetnetek, a fennmaradó összeget pedig a tábor első napján érkezéskor lehúzzuk a SZÉP kártyáról.
                  Kérjük, ezt a fontos tudnivalókban a jelentkezéskor jelezzétek nekünk!
                </span>
              </li>
              <li className="flex gap-2.5">
                <Dot />
                <span className="flex flex-wrap items-center gap-2.5">
                  Oneticket
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Hamarosan
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* ── Időpontok ── */}
          <div className="flex flex-col bg-black px-6 py-9 text-white sm:px-10 sm:py-11 lg:px-8">
            <PanelTitle tone="light">Időpontok</PanelTitle>

            <ul className="space-y-4">
              {turnusok.map((t) => (
                <li key={t.id} className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#40CFD5]" strokeWidth={1.8} />
                  <span className={`text-[15px] leading-relaxed ${t.closed ? 'text-white/50' : ''}`}>
                    <strong className="text-white">{t.label}:</strong> {t.dates}
                    <br />({t.days}){t.closed && ' – lezárva'}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#40CFD5]" strokeWidth={1.8} />
              <p className="text-[15px] leading-relaxed text-white/90">
                Találkozás a helyszínen az első nap:
                <br />
                <strong className="text-white">14:00–15:00</strong>
              </p>
            </div>

            <p className="mt-7 text-[15px] leading-relaxed text-white/75">
              A tábor utolsó napján a program <strong className="text-white">16:00</strong> órakor ér véget. Igény
              szerint <strong className="text-white">19:00</strong> óráig maradhattok strandolni és sportolni.
            </p>

            <a
              href="#jelentkezes"
              className="mt-10 lg:mt-auto block rounded-xl bg-[#40CFD5] px-6 py-4 text-center text-sm font-extrabold uppercase tracking-widest text-black transition-colors hover:bg-white"
            >
              Jelentkezek
            </a>
          </div>

          {/* ── Helyszín ── */}
          <div className="bg-[#40CFD5] px-6 py-9 text-black sm:px-10 sm:py-11 lg:px-8">
            <PanelTitle>Tábor helyszíne</PanelTitle>

            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} />
              <div>
                <p className="font-extrabold text-[17px] leading-snug">Szigetszentmiklós Oázis Wellness Park</p>
                <p className="mt-1 text-[15px]">2310 Szigetszentmiklós, Tököli út 184.</p>
              </div>
            </div>

            <SubTitle className="mt-8">Fontos tudnivaló</SubTitle>
            <p className="text-[15px] leading-relaxed text-black/80">
              A tábor limitált férőhelyes, ezért jelentkezési sorrend alapján regisztrálunk. Amennyiben a pénz
              határidőre vagy néhány nap késés után sem érkezik meg, a jelentkezést kénytelenek vagyunk törölni és a
              táborfoglalást más érdeklődőnek átadni.
            </p>

            <SubTitle className="mt-8">Jelentkezési lehetőség</SubTitle>
            <p className="text-[15px] leading-relaxed text-black/80">
              A beérkezett jelentkezéseket e-mail formájában visszaigazoljuk. Ezután értesítjük a jelentkezőket a
              befizetéssel kapcsolatos pontos információkról.
            </p>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}

function Dot() {
  return <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#40CFD5]" />
}

/* ──────────────────────────────────────────────────────────────
   3) Tánctanáraink — rács Insta-kártyákkal
   ────────────────────────────────────────────────────────────── */

const teacherDots = [
  { top: '6%', left: '-3%', size: 180, mobile: true },
  { top: '55%', left: '4%', size: 140 },
  { top: '-4%', left: '46%', size: 150 },
  { top: '10%', right: '8%', size: 200 },
  { top: '62%', right: '-4%', size: 230, mobile: true },
]

export function TaborTeachers() {
  return (
    <section id="tanarok" className="relative bg-black px-4 py-20 sm:py-28" style={{ overflowX: 'clip' }}>
      {teacherDots.map((d, i) => (
        <img
          key={i}
          src="/dots-cyan.png"
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute select-none ${d.mobile ? '' : 'hidden md:block'}`}
          style={{ top: d.top, left: d.left, right: d.right, width: d.size }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-7xl">
        <FadeIn>
          <h2 className="section-title mb-12 text-center text-5xl text-white sm:mb-16 sm:text-6xl">
            TÁNCTANÁRAINK
          </h2>
        </FadeIn>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-10">
          {campTeachers.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.08} className="w-full max-w-[280px] sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-1.2rem)]">
              {/* Kattintásra új lapon nyílik a tanár Insta-videója (mint a főoldalon) */}
              <motion.a
                href={t.video}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t.name} táncvideója az Instagramon`}
                className="block cursor-pointer rounded-2xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#40CFD5]"
                style={{ rotate: t.rotate }}
                whileHover={{ y: -8, rotate: 0, transition: { duration: 0.3 } }}
              >
                <InstaCard
                  src={t.src}
                  alt={`${t.name} — ${t.role}`}
                  width={280}
                  caption={{ name: t.name, style: t.role }}
                  video
                />
              </motion.a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
