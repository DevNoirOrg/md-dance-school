'use client'
import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const days = ['Hétfő – Szerda', 'Kedd – Csütörtök', 'Péntek']
const slots = ['17:00 – 18:00', '18:00 – 19:00', '19:00 – 20:00']

const fields = [
  { name: 'nev', label: 'Teljes név', type: 'text', full: true, required: true },
  { name: 'email', label: 'E-mail címed', type: 'email', required: true },
  { name: 'email2', label: 'E-mail címed (megerősítés)', type: 'email' },
  { name: 'tel', label: 'Telefonszám', type: 'tel' },
  { name: 'kor', label: 'Kor / évfolyam', type: 'text' },
  { name: 'szint', label: 'Szint (kezdő / haladó)', type: 'text', full: true },
]

export default function Jelentkezes() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [selected, setSelected] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const toggle = (day, slot) => {
    const key = `${day}-${slot}`
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="jelentkezes" className="relative bg-black px-4 pt-10 pb-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative bg-white rounded-[2rem] shadow-2xl px-5 sm:px-12 pt-16 pb-12 mt-10"
        >
          {/* Cím — kilóg a card tetejéből, fehér körvonallal (fekete háttéren is olvasható) */}
          <h2
            className="section-title absolute left-6 sm:left-12 text-4xl sm:text-5xl leading-none"
            style={{
              top: '-0.5em',
              color: '#000',
              WebkitTextStroke: '7px #fff',
              paintOrder: 'stroke',
            }}
          >
            JELENTKEZÉS
          </h2>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#40CFD5]/10 border border-[#40CFD5] rounded-xl p-10 text-center"
            >
              <div className="text-3xl mb-3">🎉</div>
              <h3 className="font-bold text-xl mb-2">Sikeres jelentkezés!</h3>
              <p className="text-gray-600 text-sm">
                Hamarosan felvesszük veled a kapcsolatot. Várunk szeretettel!
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mezők — címke felül */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {fields.map((f) => (
                  <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                    <label htmlFor={f.name} className="block text-[15px] text-gray-800 mb-2">
                      {f.label}
                    </label>
                    <input
                      id={f.name}
                      type={f.type}
                      required={f.required}
                      className="md-input"
                    />
                  </div>
                ))}
              </div>

              {/* Nap / időpont választó */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                {days.map((day) => (
                  <div key={day}>
                    <div className="font-bold text-sm sm:text-base text-black mb-3">{day}</div>
                    <div className="space-y-2.5">
                      {slots.map((slot) => {
                        const key = `${day}-${slot}`
                        const on = selected[key]
                        return (
                          <label
                            key={slot}
                            className="flex items-center gap-2.5 cursor-pointer group"
                          >
                            <span
                              onClick={() => toggle(day, slot)}
                              className={`w-5 h-5 rounded-[5px] flex items-center justify-center transition-colors duration-150 flex-shrink-0 ${
                                on
                                  ? 'bg-[#40CFD5]'
                                  : 'bg-gray-200 group-hover:bg-gray-300'
                              }`}
                            >
                              {on && (
                                <svg viewBox="0 0 12 10" className="w-3 h-2.5">
                                  <path
                                    d="M1 5l3 3 7-7"
                                    stroke="#0D0D0D"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                            <span className="text-sm text-gray-700">{slot}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Küldés */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 mt-2 bg-black text-white font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-[#40CFD5] hover:text-black transition-colors duration-200"
              >
                Jelentkezés elküldése
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
