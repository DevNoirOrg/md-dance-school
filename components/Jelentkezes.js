'use client'
import { useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useClassSelection, SelectionChip } from './ClassSelection'
import Arak from './Arak'

/*
  Jelentkezési űrlap — az UC (Under Cover) oldal megoldása alapján, MD színekkel:
   - a kiválasztott órák az órarendből jönnek (chipek a form tetején)
   - 16 év alatt a szülő neve + e-mail címe kötelezővé válik
   - magyar nyelvű, mezőnkénti validáció (az első beküldés után élőben frissül)
   - DEMÓ: beküldéskor csak összegez és megköszöni, NEM küld el semmit.
     Valódi beküldésnél a handleSubmit-ben jelölt helyen kell a `data`-t
     elküldeni (pl. fetch('/api/jelentkezes', …)).
*/

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const empty = {
  vezeteknev: '',
  keresztnev: '',
  email: '',
  szuletes: '',
  szulo_nev: '',
  szulo_email: '',
  tapasztalat: '',
  kezdes: '',
  megjegyzes: '',
}

const tapasztalatOptions = ['Nem', 'Igen, kezdő szinten', 'Igen, 1-2 évet', 'Igen, versenyszerűen']
const kezdesOptions = ['Ma', 'Holnap', 'Jövő héten', 'Jövő hónapban']

function ageFrom(value) {
  if (!value) return null
  const d = new Date(value + 'T00:00:00')
  if (isNaN(d.getTime())) return null
  const now = new Date()
  let a = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--
  return a
}

function validate(values, minor, selectedCount) {
  const errors = {}
  if (selectedCount === 0) errors.orak = 'Válassz legalább egy órát az órarendből!'
  const required = ['vezeteknev', 'keresztnev', 'email', 'szuletes', 'tapasztalat', 'kezdes']
  if (minor) required.push('szulo_nev', 'szulo_email')
  required.forEach((k) => {
    const v = (values[k] || '').trim()
    if (!v) {
      errors[k] = k === 'tapasztalat' || k === 'kezdes' ? 'Válassz egy lehetőséget.' : 'Ezt a mezőt kötelező kitölteni.'
    } else if ((k === 'email' || k === 'szulo_email') && !EMAIL_RE.test(v)) {
      errors[k] = 'Adj meg egy érvényes e-mail címet.'
    } else if (k === 'szuletes') {
      const a = ageFrom(v)
      if (a === null) errors[k] = 'Adj meg egy érvényes dátumot.'
      else if (a < 0) errors[k] = 'A dátum a jövőben van.'
      else if (a > 100) errors[k] = 'Ellenőrizd a megadott dátumot.'
    }
  })
  return errors
}

const inputBase =
  'w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 font-semibold text-black placeholder:text-gray-300 focus:outline-none transition-colors'

function Field({ id, label, required, error, children }) {
  return (
    <div className="space-y-2.5">
      <label htmlFor={id} className="block ml-3 text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
        {label} {required && <span className="text-[#1a9ea3]">*</span>}
      </label>
      {children}
      {error && <p className="ml-3 text-[13px] font-semibold text-red-600">{error}</p>}
    </div>
  )
}

export default function Jelentkezes() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { selected, remove, clear } = useClassSelection()

  const [values, setValues] = useState(empty)
  const [touched, setTouched] = useState({})
  const [submitTried, setSubmitTried] = useState(false)
  const [summary, setSummary] = useState(null) // beküldés utáni összegzés

  const age = ageFrom(values.szuletes)
  const minor = age !== null && age >= 0 && age < 16

  const errors = useMemo(() => validate(values, minor, selected.length), [values, minor, selected.length])
  // Hibát csak akkor mutatunk, ha a mezőhöz már hozzányúltak, vagy próbált beküldeni
  const shown = (k) => (submitTried || touched[k] ? errors[k] : undefined)
  const errorCount = Object.keys(errors).length

  const set = (k) => (e) => {
    const v = e.target.value
    setValues((prev) => ({ ...prev, [k]: v }))
  }
  const touch = (k) => () => setTouched((prev) => ({ ...prev, [k]: true }))

  const cls = (k, extra = '') =>
    `${inputBase} ${shown(k) ? 'border-red-300 bg-red-50/60' : 'border-transparent focus:border-[#40CFD5]/60'} ${extra}`

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitTried(true)
    if (errorCount > 0) {
      // az első hibás helyre görgetünk
      const order = ['orak', 'vezeteknev', 'keresztnev', 'email', 'szuletes', 'szulo_nev', 'szulo_email', 'tapasztalat', 'kezdes']
      const first = order.find((k) => errors[k])
      const el = document.getElementById(first === 'orak' ? 'form-selection' : `f-${first}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const data = {
      ...values,
      valasztott_orak: selected.map((c) => c.full),
    }
    if (!minor) {
      delete data.szulo_nev
      delete data.szulo_email
    }

    // ---- DEMÓ BEKÜLDÉS ----
    // >>> VALÓDI BEKÜLDÉS HOOK: ide jön majd pl.
    //     await fetch('/api/jelentkezes', { method: 'POST',
    //       headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })

    const rows = [
      ['Név', `${data.vezeteknev} ${data.keresztnev}`],
      ['E-mail', data.email],
      ['Születési dátum', data.szuletes],
    ]
    if (minor) rows.push(['Szülő', `${data.szulo_nev} · ${data.szulo_email}`])
    rows.push(['Tánctapasztalat', data.tapasztalat])
    rows.push(['Kezdés', data.kezdes])
    rows.push(['Órák', data.valasztott_orak])
    if (data.megjegyzes.trim()) rows.push(['Megjegyzés', data.megjegyzes])
    setSummary(rows)
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const restart = () => {
    setValues(empty)
    setTouched({})
    setSubmitTried(false)
    setSummary(null)
    clear()
    document.getElementById('orarend')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="jelentkezes" className="relative bg-black px-4 pt-28 sm:pt-40 pb-24 scroll-mt-12">
      {/* Űrlap balra, árak jobbra (mobilon egymás alatt) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-x-8 gap-y-20 items-start">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative bg-white rounded-[2.5rem] shadow-2xl px-5 sm:px-12 pt-16 sm:pt-20 pb-10 sm:pb-12 scroll-mt-28"
        >
          {/* Cím — kilóg a kártya tetejéből, fehér körvonallal */}
          <h2
            className="section-title absolute left-6 sm:left-12 text-4xl sm:text-5xl leading-none"
            style={{ top: '-0.5em', color: '#000', WebkitTextStroke: '7px #fff', paintOrder: 'stroke' }}
          >
            JELENTKEZÉS
          </h2>

          {summary ? (
            /* ---- Köszönő állapot ---- */
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-[#40CFD5]/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10">
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#000" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-black text-3xl text-black mt-6">Köszönjük a jelentkezést!</h3>
              <p className="text-sm font-semibold text-gray-500 mt-3">Hamarosan keresünk a megadott e-mail címen.</p>
              <div className="text-left rounded-3xl bg-gray-50 p-6 mt-8 space-y-3">
                {summary.map(([label, value]) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:gap-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 sm:w-40 shrink-0 pt-1">
                      {label}
                    </span>
                    <span className="text-sm font-bold text-black whitespace-pre-line">
                      {Array.isArray(value) ? value.join('\n') : value}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={restart}
                className="mt-8 text-[11px] font-extrabold uppercase tracking-widest text-[#1a9ea3] hover:text-black transition-colors"
              >
                Új jelentkezés indítása
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-7">
              {/* ---- Választott óráid ---- */}
              <div
                id="form-selection"
                className={`rounded-3xl border-2 p-6 transition-colors ${
                  submitTried && errors.orak ? 'border-red-300 bg-red-50/60' : 'border-[#40CFD5]/40 bg-[#40CFD5]/10'
                }`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-black">
                    Választott óráid <span className="text-[#1a9ea3]">*</span>
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-black/50">
                    {selected.length} óra
                  </span>
                </div>
                {selected.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selected.map((c) => (
                      <SelectionChip key={c.id} item={c} onRemove={remove} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-500">
                      Még nincs kiválasztott órád — legalább egyet válassz az órarendből.
                    </p>
                    <a
                      href="#orarend"
                      className="inline-block mt-3 bg-black text-white px-5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-widest hover:bg-[#40CFD5] hover:text-black transition-colors"
                    >
                      Vissza az órarendhez
                    </a>
                  </div>
                )}
                {submitTried && errors.orak && <p className="mt-3 text-[13px] font-semibold text-red-600">{errors.orak}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Field id="f-vezeteknev" label="Vezetéknév" required error={shown('vezeteknev')}>
                  <input id="f-vezeteknev" type="text" autoComplete="family-name" placeholder="Kovács"
                    value={values.vezeteknev} onChange={set('vezeteknev')} onBlur={touch('vezeteknev')} className={cls('vezeteknev')} />
                </Field>
                <Field id="f-keresztnev" label="Keresztnév" required error={shown('keresztnev')}>
                  <input id="f-keresztnev" type="text" autoComplete="given-name" placeholder="Emma"
                    value={values.keresztnev} onChange={set('keresztnev')} onBlur={touch('keresztnev')} className={cls('keresztnev')} />
                </Field>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Field id="f-email" label="E-mail címed (Táncos)" required error={shown('email')}>
                  <input id="f-email" type="email" autoComplete="email" placeholder="hello@valami.hu"
                    value={values.email} onChange={set('email')} onBlur={touch('email')} className={cls('email')} />
                </Field>
                <Field id="f-szuletes" label="Mikor születtél? (Táncos)" required error={shown('szuletes')}>
                  <input id="f-szuletes" type="date"
                    value={values.szuletes} onChange={set('szuletes')} onBlur={touch('szuletes')} className={cls('szuletes')} />
                </Field>
              </div>

              {/* ---- 16 év alatt: szülő adatai ---- */}
              {minor && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="rounded-2xl bg-[#40CFD5]/10 border-2 border-[#40CFD5]/40 px-6 py-4">
                    <p className="text-sm font-bold text-black">
                      16 év alatti vagy — kérjük, add meg a szülőd teljes nevét és e-mail címét!
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Field id="f-szulo_nev" label="Szülő teljes neve" required error={shown('szulo_nev')}>
                      <input id="f-szulo_nev" type="text" placeholder="Kovács Ákos"
                        value={values.szulo_nev} onChange={set('szulo_nev')} onBlur={touch('szulo_nev')} className={cls('szulo_nev')} />
                    </Field>
                    <Field id="f-szulo_email" label="Szülő e-mail címe" required error={shown('szulo_email')}>
                      <input id="f-szulo_email" type="email" placeholder="szulo@valami.hu"
                        value={values.szulo_email} onChange={set('szulo_email')} onBlur={touch('szulo_email')} className={cls('szulo_email')} />
                    </Field>
                  </div>
                </motion.div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <Field id="f-tapasztalat" label="Táncoltál már korábban?" required error={shown('tapasztalat')}>
                  <Select id="f-tapasztalat" value={values.tapasztalat} onChange={set('tapasztalat')} onBlur={touch('tapasztalat')}
                    className={cls('tapasztalat')} options={tapasztalatOptions} />
                </Field>
                <Field id="f-kezdes" label="Mikortól kezdenél?" required error={shown('kezdes')}>
                  <Select id="f-kezdes" value={values.kezdes} onChange={set('kezdes')} onBlur={touch('kezdes')}
                    className={cls('kezdes')} options={kezdesOptions} />
                </Field>
              </div>

              <Field id="f-megjegyzes" label="Megjegyzés">
                <textarea id="f-megjegyzes" rows={4} placeholder="Bármi, amit tudnunk érdemes…"
                  value={values.megjegyzes} onChange={set('megjegyzes')} className={cls('megjegyzes', 'resize-none')} />
              </Field>

              {submitTried && errorCount > 0 && (
                <p className="rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-sm font-bold px-6 py-4">
                  {errorCount === 1
                    ? 'Egy mező még hiányzik vagy hibás.'
                    : `${errorCount} mező még hiányzik vagy hibás. A pirossal jelölt helyeket javítsd!`}
                </p>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-5 bg-black text-white font-extrabold text-sm uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:bg-[#40CFD5] hover:text-black transition-colors duration-200"
              >
                Jelentkezem
              </motion.button>
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span className="text-[#1a9ea3]">*</span> kötelező mező
              </p>
            </form>
          )}
        </motion.div>

        <Arak />
      </div>
    </section>
  )
}

function Select({ options, className, value, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        value={value}
        className={`${className} appearance-none cursor-pointer pr-12 ${value ? '' : 'text-gray-400'}`}
      >
        <option value="">Válassz…</option>
        {options.map((o) => (
          <option key={o} value={o} className="text-black">
            {o}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 20 20" className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500">
        <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
