'use client'
import { useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef } from 'react'

const HIPHOP = 'Hip-hop Dalmával'

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
  },
}

const tabs = [
  { id: 'nagy', label: 'Nagy terem' },
  { id: 'kis', label: 'Kis terem' },
]

function ScheduleItem({ time, title, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="mb-5"
    >
      <div className="font-bold text-lg sm:text-xl text-black">{time}</div>
      <div className="text-gray-600 text-base sm:text-lg mt-1 mb-4">{title}</div>
      <div className="h-[3px] w-full bg-black" />
    </motion.div>
  )
}

function DayColumn({ title, items }) {
  return (
    <div>
      {/* Fehér pill fejléc — Anton, kevert kis-nagybetű (nem uppercase) */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.06)] py-5 sm:py-6 mb-7 text-center">
        <h3
          className="text-3xl sm:text-4xl text-black"
          style={{ fontFamily: 'var(--font-anton), sans-serif' }}
        >
          {title}
        </h3>
      </div>
      <div className="px-1">
        {items.map((item, i) => (
          <ScheduleItem key={i} {...item} index={i} />
        ))}
      </div>
    </div>
  )
}

export default function Orarend() {
  const [activeTab, setActiveTab] = useState('nagy')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="orarend" className="relative bg-white py-16 sm:py-24 px-4 overflow-hidden">
      {/* dekoratív pöttyök — bal felül */}
      <div
        className="pointer-events-none absolute top-6 left-3 w-40 h-24 opacity-[0.13]"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
          backgroundSize: '13px 13px',
        }}
      />
      {/* dekoratív pöttyök — bal alul */}
      <div
        className="pointer-events-none absolute bottom-4 left-3 w-48 h-24 opacity-[0.10]"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
          backgroundSize: '13px 13px',
        }}
      />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto relative"
      >
        {/* Tabok + fekete cím-sáv */}
        <div className="relative">
          {/* Tabválasztó — szürke keretes szegmens (2px padding = disabled szín),
              pont a sáv fölött, átfedés/rés nélkül, alul nem kerekített */}
          <div className="pl-6 sm:pl-10 relative z-20">
            <div className="inline-flex gap-[2px] bg-[#a6a6a6] p-[2px] pb-0 rounded-t-[18px]">
              {tabs.map((tab) => {
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-t-[16px] px-7 sm:px-9 py-3 font-bold text-base sm:text-lg transition-colors duration-200 ${
                      active
                        ? 'bg-white text-black shadow-[0_3px_10px_rgba(0,0,0,0.22)]'
                        : 'text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fekete cím-sáv — pont a tabok alatt, átfedés nélkül */}
          <div className="relative z-0 bg-black rounded-[2rem] py-7 sm:py-9 px-6 shadow-2xl">
            <h2 className="section-title text-white text-4xl sm:text-6xl text-center tracking-wide">
              ÓRAREND
            </h2>
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 mt-10 sm:mt-12"
          >
            <DayColumn title="Hétfő - Szerda" items={schedule[activeTab].hetfo_szerda} />
            <DayColumn title="Kedd - Csütörtök" items={schedule[activeTab].kedd_csutortok} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
