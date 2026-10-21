'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useClassSelection, SelectionChip } from './ClassSelection'
import HalftoneDots from './HalftoneDots'

const HIPHOP = 'Hip-hop Dalmával'

// Napcsoportok (oszlopok) — sorrendben
const days = [
  { key: 'hetfo_szerda', label: 'Hétfő - Szerda' },
  { key: 'kedd_csutortok', label: 'Kedd - Csütörtök' },
  { key: 'pentek', label: 'Péntek' },
]

// FIGYELEM: a péntek még helyőrző, a valódi órákra kell cserélni.
const schedule = {
  nagy: {
    hetfo_szerda: [
      { time: '18:30-20:00', title: HIPHOP },
      { time: '18:30-20:00', title: HIPHOP },
      { time: '18:30-20:00', title: HIPHOP },
    ],
    kedd_csutortok: [
      { time: '18:30-20:00', title: HIPHOP },
      { time: '18:30-20:00', title: HIPHOP },
      { time: '18:30-20:00', title: HIPHOP },
    ],
    pentek: [
      { time: '18:30-20:00', title: HIPHOP },
      { time: '18:30-20:00', title: HIPHOP },
      { time: '18:30-20:00', title: HIPHOP },
    ],
  },
  kis: {
    hetfo_szerda: [
      { time: '16:00-17:30', title: HIPHOP },
      { time: '17:30-19:00', title: HIPHOP },
    ],
    kedd_csutortok: [
      { time: '16:00-17:30', title: HIPHOP },
      { time: '17:30-19:00', title: HIPHOP },
    ],
    pentek: [
      { time: '16:00-17:30', title: HIPHOP },
      { time: '17:30-19:00', title: HIPHOP },
    ],
  },
}

const tabs = [
  { id: 'nagy', label: 'Nagy terem', short: 'Nagy' },
  { id: 'kis', label: 'Kis terem', short: 'Kis' },
]

// Egy óra „kiválasztható” objektuma — ez kerül a chipekbe és az űrlapba
function toClass(room, day, item, index) {
  const tab = tabs.find((t) => t.id === room)
  const dayText = day.label.replace(' - ', ' – ')
  return {
    id: `${room}-${day.key}-${index}`,
    room: tab.label,
    day: dayText,
    time: item.time,
    title: item.title,
    chip: `${tab.short} · ${dayText} ${item.time.split('-')[0]}`,
    full: `${tab.label} · ${dayText} · ${item.time} · ${item.title}`,
  }
}

function ScheduleItem({ cls, index }) {
  const { isSelected, toggle } = useClassSelection()
  const on = isSelected(cls.id)
  return (
    <motion.button
      type="button"
      onClick={() => toggle(cls)}
      aria-pressed={on}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`group relative block w-full text-left mb-4 rounded-2xl px-4 pt-4 pb-0 transition-colors duration-200 ${
        on ? 'bg-[#40CFD5]/15' : 'hover:bg-gray-50'
      }`}
    >
      {/* Kiválasztás-jelző pipa */}
      <span
        aria-hidden="true"
        className={`absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
          on ? 'bg-[#40CFD5] scale-100' : 'border-2 border-gray-300 group-hover:border-black scale-90'
        }`}
      >
        {on && (
          <svg viewBox="0 0 12 10" className="w-3.5 h-3">
            <path d="M1 5l3 3 7-7" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <div className="font-bold text-lg sm:text-xl text-black pr-10">{cls.time}</div>
      <div className="text-gray-600 text-base sm:text-lg mt-1 mb-4 pr-10">{cls.title}</div>
      <div className={`h-[3px] w-full transition-colors ${on ? 'bg-[#40CFD5]' : 'bg-black'}`} />
    </motion.button>
  )
}

function DayColumn({ room, day }) {
  const items = schedule[room][day.key]
  return (
    <div>
      {/* Fekete nap-fejléc, fehér betűvel */}
      <div className="bg-black rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.18)] py-4 sm:py-5 mb-6 text-center">
        <h3 className="text-2xl sm:text-3xl text-white" style={{ fontFamily: 'var(--font-anton), sans-serif' }}>
          {day.label}
        </h3>
      </div>
      <div>
        {items.map((item, i) => (
          <ScheduleItem key={i} cls={toClass(room, day, item, i)} index={i} />
        ))}
      </div>
    </div>
  )
}

export default function Orarend() {
  const [activeTab, setActiveTab] = useState('nagy')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { selected, remove } = useClassSelection()
  const countFor = (label) => selected.filter((c) => c.room === label).length

  return (
    <section
      id="orarend"
      className="relative z-30 bg-white py-16 sm:py-24 px-4 scroll-mt-24"
      // oldalra levágjuk (nincs vízszintes görgetés), de felfelé/lefelé a pöttyök átlóghatnak a szomszéd szekciókba
      style={{ overflowX: 'clip', overflowY: 'visible' }}
    >
      {/* dekoratív pöttyök — átlósan: bal felső és jobb alsó sarok, a szélre tolva */}
      {/* ugyanaz az animált halftone-minta, mint a heróban */}
      <HalftoneDots size={260} zIndex={0} style={{ top: -110, left: -120 }} />
      <HalftoneDots size={260} zIndex={0} style={{ bottom: 20, right: -120 }} />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto relative z-10"
      >
        {/* Tabok + cím-doboz */}
        <div className="relative">
          <div className="pl-6 sm:pl-10 relative z-20">
            <div className="inline-flex gap-[2px] bg-[#a6a6a6] p-[2px] pb-0 rounded-t-[18px]">
              {tabs.map((tab) => {
                const active = activeTab === tab.id
                const n = countFor(tab.label)
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-t-[16px] px-6 sm:px-8 py-2.5 font-bold text-sm sm:text-base transition-colors duration-200 inline-flex items-center gap-2 ${
                      active ? 'bg-white text-black shadow-[0_3px_10px_rgba(0,0,0,0.22)]' : 'text-white'
                    }`}
                  >
                    {tab.label}
                    {n > 0 && (
                      <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#40CFD5] text-black text-[11px] font-extrabold flex items-center justify-center">
                        {n}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fehér cím-doboz, fekete felirattal */}
          <div className="relative z-0 bg-white border border-gray-200 rounded-[1.75rem] py-5 sm:py-6 px-6 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
            <h2 className="section-title text-black text-3xl sm:text-4xl text-center tracking-wide">ÓRAREND</h2>
            <p className="text-center text-gray-500 text-xs sm:text-sm font-semibold uppercase tracking-widest mt-2">
              Kattints az órákra, amikre jelentkeznél, akár többre is
            </p>
          </div>
        </div>

        {/* Nap-oszlopok */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 mt-10 sm:mt-12"
          >
            {days.map((day) => (
              <DayColumn key={day.key} room={activeTab} day={day} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Kiválasztás-összegző */}
        <div
          id="selection-bar"
          className="mt-10 rounded-[1.75rem] bg-black text-white px-6 sm:px-8 py-6 flex flex-col md:flex-row md:items-center gap-5"
        >
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base">
              {selected.length === 0 ? 'Még nem választottál órát' : `${selected.length} óra kiválasztva`}
            </div>
            <div className="text-white/60 text-sm mt-1">
              {selected.length === 0
                ? 'Kattints egy órára az órarendben'
                : 'Többet is választhatsz, vagy vedd le a chipről'}
            </div>
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selected.map((c) => (
                  <SelectionChip key={c.id} item={c} dark onRemove={remove} />
                ))}
              </div>
            )}
          </div>
          <a
            href="#jelentkezes"
            className="shrink-0 text-center bg-[#40CFD5] text-black px-6 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-white transition-colors"
          >
            Tovább a jelentkezéshez
          </a>
        </div>
      </motion.div>
    </section>
  )
}
