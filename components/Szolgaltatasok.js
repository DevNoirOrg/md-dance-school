'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import HalftoneDots from './HalftoneDots'

/* ──────────────────────────────────────────────────────────────
   Szolgáltatások oldal — az MD Dance Company oldal nagy előnézete
   és egy rövid szöveg, ami átterel oda.
   ────────────────────────────────────────────────────────────── */

const COMPANY_URL = 'https://www.mddancecompany.com/'
const COMPANY_HOST = 'mddancecompany.com'
// Teljes oldalas képernyőkép az MD Dance Company oldaláról (álló, hosszú kép).
// A kép a /public mappában van; ha cseréled, elég ugyanezen a néven felülírni.
const PREVIEW_SRC = '/mddancecompany-preview-2.jpg'

const highlights = ['Sport ceremóniák és nyitóshow-k', 'Élő show- és koncertprodukció', 'Koreográfia és art design']

export function SzolgaltatasokHero() {
  return (
    <section
      className="relative flex min-h-[420px] items-center justify-center bg-black px-5 pb-28 pt-32 text-center sm:min-h-[480px] sm:pt-36"
      style={{
        backgroundImage:
          "linear-gradient(0deg, rgba(0,0,0,0.78), rgba(0,0,0,0.5)), url('/canva/about-group.jpg')",
        backgroundPosition: 'center 40%',
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
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#40CFD5] sm:text-sm">MD Dance School</p>
        <h1 className="section-title text-5xl text-white sm:text-7xl md:text-8xl">SZOLGÁLTATÁSOK</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
          Show, koreográfia és produkció — rendezvényekre, színpadra és kamera elé.
        </p>
      </motion.div>
    </section>
  )
}

export function CompanyPreview() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="relative z-20 px-4 pb-24 sm:pb-32" style={{ overflowX: 'clip' }}>
      <HalftoneDots className="hidden md:block" size={260} zIndex={0} style={{ top: '45%', right: -130 }} />

      <div className="relative z-10 mx-auto -mt-16 max-w-6xl sm:-mt-20">
        {/* ── Nagy előnézet böngésző-keretben ── */}
        <motion.a
          ref={ref}
          href={COMPANY_URL}
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
              <span className="truncate">{COMPANY_HOST}</span>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-white/40 transition-colors group-hover:text-[#40CFD5]" />
          </div>

          {/* Az oldal képe — ráhúzott egérnél lassan végiggörget (globals.css: .company-preview-shot) */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-black sm:aspect-[16/10]">
            <div
              className="company-preview-shot absolute inset-0"
              style={{ backgroundImage: `url('${PREVIEW_SRC}')` }}
              role="img"
              aria-label="Az MD Dance Company weboldala"
            />
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
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#179da3] sm:text-sm">MD Dance Company</p>
          <h2 className="section-title mt-3 text-4xl text-black sm:text-5xl">A tánciskola mögött egy show-csapat áll</h2>
          <p className="mt-5 text-base leading-relaxed text-gray-600 sm:text-lg">
            Koreográfiát, show-produkciót és teljes színpadi élményt készítünk sporteseményekre, koncertekre és
            márkáknak. Ha fellépőt, nyitóshow-t vagy egyedi koreográfiát keresel a rendezvényedre, nézz be hozzánk.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {highlights.map((h) => (
              <span key={h} className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
                {h}
              </span>
            ))}
          </div>

          <a
            href={COMPANY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-flex items-center gap-2 rounded-xl bg-black px-7 py-4 text-sm font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-[#40CFD5] hover:text-black"
          >
            Tovább az MD Dance Company oldalára
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
