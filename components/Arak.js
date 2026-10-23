'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/* Áraink — a jelentkezési űrlap mellett (főoldal és /orarend oldal). Itt szerkeszthető. */
const prices = [
  { name: 'Órajegy', price: '4 000 Ft' },
  { name: 'Havi bérlet — 1 csoport', price: '20 000 Ft', note: '*' },
  { name: 'Havi bérlet — 2 csoport', price: '30 000 Ft', note: '*' },
  { name: 'Korlátlan havi bérlet', price: '36 000 Ft', note: '*' },
  { name: '1 pénteki csoport', price: '14 000 Ft', note: '*' },
  { name: '1 csoport + 1 pénteki', price: '26 000 Ft', note: '*' },
  { name: '4 alkalmas bérlet', price: '14 000 Ft', note: '**' },
  { name: '8 alkalmas bérlet', price: '22 000 Ft', note: '**' },
]

export default function Arak() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.aside
      ref={ref}
      id="arak"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="relative rounded-[2.5rem] bg-[#40CFD5] px-6 pb-8 pt-16 shadow-2xl sm:px-8 sm:pt-20"
    >
      {/* Cím — kilóg a kártya tetejéből, mint a JELENTKEZÉS, de türkiz körvonallal (a kártya színe) */}
      <h2
        className="section-title absolute left-6 sm:left-8 text-4xl sm:text-5xl leading-none"
        style={{ top: '-0.5em', color: '#000', WebkitTextStroke: '7px #40CFD5', paintOrder: 'stroke' }}
      >
        ÁRAINK
      </h2>

      <ul className="divide-y divide-black/10">
        {prices.map((p) => (
          <li key={p.name} className="flex items-baseline justify-between gap-4 py-3.5">
            <span className="text-[15px] font-semibold text-black">
              {p.name}
              {p.note && <span className="ml-0.5 text-black/50">{p.note}</span>}
            </span>
            <span className="whitespace-nowrap text-[15px] font-extrabold text-black">{p.price}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 rounded-2xl bg-white/45 p-4 text-[13px] leading-relaxed text-black/75">
        <p>
          <strong className="text-black">*</strong> A havi bérletek az adott naptári hónapra érvényesek.
        </p>
        <p>
          <strong className="text-black">**</strong> A 4 és 8 alkalmas bérlet az aktiválástól számított 30 napon belül
          használható fel.
        </p>
        <p>Fizethetsz készpénzzel, bankkártyával, átutalással vagy az MD appban.</p>
      </div>
    </motion.aside>
  )
}
