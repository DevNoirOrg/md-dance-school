'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import HalftoneDots from './HalftoneDots'

/* ──────────────────────────────────────────────────────────────
   TARTALOM — itt szerkeszthető
   ────────────────────────────────────────────────────────────── */

// 1) Mielőtt jössz — rövid tájékoztatók új diákoknak
const elsoLepesek = [
  {
    title: 'Új vagy nálunk?',
    text: 'Nézd meg az órarendet, és válaszd ki a hozzád illő csoportot a szinted, a korod és a kedvenc stílusod alapján. Jelentkezés után e-mailben visszaigazoljuk, mikor jöhetsz az első órádra. Ha egy csoport épp betelt, segítünk másik időpontot találni, vagy felírunk a várólistára.',
  },
  {
    title: 'Az első órád',
    text: 'Hozz váltócipőt, kényelmes ruhát, amiben szabadon mozogsz, és egy üveg vizet — egy törölköző is jól jöhet. És ami a legfontosabb: legyél türelmes magaddal. Mindenki kezdte valahol, nálunk senki nem méreget, csak bulizunk és tanulunk együtt.',
  },
  {
    title: 'Így fejlődsz',
    text: 'A titok a rendszeresség. Ha kitartóan jársz, pár hónap alatt magad is észreveszed a változást a koordinációdban, a ritmusérzékedben és a magabiztosságodban. Lesznek könnyebb és nehezebb órák — ez így van rendjén. Ne másokhoz mérd magad, hanem a tegnapi önmagadhoz, és ha elakadsz, kérj visszajelzést a tanárodtól.',
  },
]

// 2) Stílusok
const stilusok = [
  {
    title: 'Koreográfia',
    text: 'Nem egy stílus, hanem egy élmény: a tanár saját mozgásvilágából épülő koreográfiák, mindig más zenére. Hip-hop, utcai táncok és sok más hatás keveredik benne — bemelegítés és technika után minden órán egy teljes koreót raksz össze.',
    teachers: ['Lili'],
  },
  {
    title: 'Hip-hop',
    text: 'Az alapok, amikre minden épül: groove, bounce, ritmus és a klasszikus lépések. Tréning és technika váltja egymást, a végén pedig tiszta hip-hop koreográfiában használod mindazt, amit az órán tanultál.',
    teachers: ['Dalma', 'Alex'],
  },
  {
    title: 'Girly / Commercial',
    text: 'Csajos energia és magabiztos kisugárzás: dögös, látványos koreográfiák a klipek és a színpad világából. Mindenkit szeretettel várunk, nemtől függetlenül — itt a hangulat és az önbizalom a lényeg.',
    teachers: ['Lili', 'Lia'],
  },
  {
    title: 'High heels',
    text: 'Táncolj magassarkúban! A gyors, energikus daraboktól a lassú, érzéki koreográfiákig mindent kipróbálsz, közben pedig megtanulod a sarokban való járás, forgás és tánc technikáját — és azt a tartást, amit az utcára is magaddal viszel.',
    teachers: ['Lia'],
  },
  {
    title: 'House',
    text: 'A klubok tánca: improvizatív, játékos és folyékony, gyors lábmunkával és rengeteg szabadsággal. Ha szereted a house zenét, itt a lépéseit is megismered — ha pedig valami teljesen újat próbálnál, ez remek választás.',
    teachers: ['Alex'],
  },
]

// 3) Szintek és csoportok
const csoportok = [
  {
    title: 'Kezdő',
    tag: 'Szint',
    text: 'Az első lépés — vagy a visszatérés a tánchoz. Nulláról indulunk, lépésről lépésre, egy lelkes, gyorsan fejlődő csapatban. Sokan itt kezdik, és az évzáró gálán már magabiztosan állnak színpadra.',
  },
  {
    title: 'Középhaladó',
    tag: 'Szint',
    text: 'Ha az alapok már mennek, és többre vágysz: összetettebb koreográfiák, gyorsabb tempó, nagyobb kihívás. Céltudatos, ambiciózus társaság, ahol mindenki húzza a másikat.',
  },
  {
    title: 'Haladó',
    tag: 'Szint · 14+',
    text: 'Azoknak, akiknek a tánc már az életük része. Régi, elhivatott tagok, magas tempó és igényes munka. 14 éves kortól várjuk azokat, akik régóta táncolnak és készen állnak a következő szintre.',
  },
  {
    title: 'Felnőtt csoport',
    tag: '18–36 év',
    text: 'Kezdőtől középhaladóig, kötetlen, jó hangulatú órákon. Levezetheted a hétköznapok stresszét, és végre megvalósíthatod a régi álmod: megtanulsz táncolni. Ha angolul tanulnál, nézd meg az International Classt!',
  },
  {
    title: 'International Class',
    tag: 'Angol nyelvű · 18+',
    text: 'Angol nyelvű órák nemzetközi társaságban, Zsolt vezetésével, kezdő és középhaladó szinten. A világ minden tájáról érkeznek ide diákok, de a magyarokat is szeretettel várjuk.',
  },
  {
    title: 'Open Class',
    tag: 'Bárkinek',
    text: 'Kipróbálnád magad? Az open classokon bárki beállhat — vendég és MD-s diák egyaránt —, és minden alkalommal más táncos koreográfiáját tanulhatod meg. Óradíjas alkalmak, bérlettel díjmentesen látogathatók.',
  },
]

/* ──────────────────────────────────────────────────────────────
   Megjelenés
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

function GroupTitle({ kicker, title }) {
  return (
    <div className="mb-8 flex items-end gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#179da3]">{kicker}</p>
        <h3 className="section-title mt-2 text-3xl text-black sm:text-4xl">{title}</h3>
      </div>
      <div className="mb-3 h-[2px] flex-1 bg-black/10" />
    </div>
  )
}

export function OrarendHero() {
  return (
    <section
      className="relative flex min-h-[380px] items-center justify-center bg-black px-5 pb-20 pt-32 text-center sm:min-h-[420px] sm:pt-36"
      style={{
        backgroundImage:
          "linear-gradient(0deg, rgba(0,0,0,0.76), rgba(0,0,0,0.48)), url('/canva/hero-crowd.jpg')",
        backgroundPosition: 'center 55%',
        backgroundSize: 'cover',
        overflowX: 'clip',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent"
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        className="relative z-10 max-w-4xl"
      >
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#40CFD5] sm:text-sm">MD Dance School</p>
        <h1 className="section-title text-5xl text-white sm:text-7xl md:text-8xl">ÓRAREND ÉS TANFOLYAMOK</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
          Válaszd ki az óráidat, ismerd meg a stílusokat, és jelentkezz pár kattintással.
        </p>
      </motion.div>
    </section>
  )
}

export default function Tanfolyamok() {
  return (
    <section id="tanfolyamok" className="relative z-20 bg-white px-4 pb-24 pt-8 sm:pb-32 scroll-mt-24" style={{ overflowX: 'clip' }}>
      <HalftoneDots className="hidden md:block" size={260} zIndex={0} style={{ top: '38%', left: -130 }} />
      <HalftoneDots className="hidden md:block" size={240} zIndex={0} style={{ bottom: 120, right: -120 }} />

      <div className="relative z-10 mx-auto max-w-6xl">
        <FadeIn className="mb-14 text-center sm:mb-20">
          <h2 className="section-title text-5xl text-black sm:text-6xl">TANFOLYAMOK</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Minden, amit tudnod érdemes, mielőtt beállsz hozzánk: mire számíts, milyen stílusokat tanítunk, és melyik
            csoport illik hozzád.
          </p>
        </FadeIn>

        {/* 1) Mielőtt jössz */}
        <GroupTitle kicker="Első lépések" title="Mielőtt jössz" />
        <div className="grid gap-5 md:grid-cols-3">
          {elsoLepesek.map((c, i) => (
            <FadeIn key={c.title} delay={i * 0.08}>
              <div className="h-full rounded-[1.75rem] bg-black p-7 text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                <span className="section-title text-4xl text-[#40CFD5]">{String(i + 1).padStart(2, '0')}</span>
                <h4 className="mt-3 text-xl font-extrabold">{c.title}</h4>
                <p className="mt-3 text-[15px] leading-relaxed text-white/75">{c.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* 2) Stílusok */}
        <div className="mt-20 sm:mt-24">
          <GroupTitle kicker="Amit tanítunk" title="Stílusok" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stilusok.map((c, i) => (
              <FadeIn key={c.title} delay={(i % 3) * 0.08}>
                <div className="group flex h-full flex-col rounded-[1.75rem] border border-gray-200 bg-white p-7 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-colors hover:border-[#40CFD5]">
                  <div className="mb-4 h-1.5 w-12 rounded-full bg-[#40CFD5] transition-all duration-300 group-hover:w-20" />
                  <h4 className="section-title text-3xl text-black">{c.title}</h4>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-gray-600">{c.text}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Tanár</span>
                    {c.teachers.map((t) => (
                      <span key={t} className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* 3) Szintek és csoportok */}
        <div className="mt-20 sm:mt-24">
          <GroupTitle kicker="Kinek szól" title="Szintek és csoportok" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {csoportok.map((c, i) => (
              <FadeIn key={c.title} delay={(i % 3) * 0.08}>
                <div className="h-full rounded-[1.75rem] bg-gray-50 p-7 ring-1 ring-black/5">
                  <span className="inline-block rounded-full bg-[#40CFD5] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-black">
                    {c.tag}
                  </span>
                  <h4 className="mt-4 text-2xl font-extrabold text-black">{c.title}</h4>
                  <p className="mt-3 text-[15px] leading-relaxed text-gray-600">{c.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* CTA */}
        <FadeIn className="mt-16 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="#jelentkezes"
            className="w-full rounded-xl bg-black px-7 py-4 text-center text-sm font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-[#40CFD5] hover:text-black sm:w-auto"
          >
            Jelentkezem egy tanfolyamra
          </a>
          <a
            href="#orarend"
            className="w-full rounded-xl border-[3px] border-black px-7 py-[13px] text-center text-sm font-extrabold uppercase tracking-widest text-black transition-colors hover:border-[#40CFD5] hover:bg-[#40CFD5] sm:w-auto"
          >
            Vissza az órarendhez
          </a>
        </FadeIn>
      </div>
    </section>
  )
}
