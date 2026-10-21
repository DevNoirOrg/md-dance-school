'use client'
import { useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { turnusok } from './TaborSections'

/*
  Tánctábor jelentkezési űrlap — a főoldali jelentkezés stílusában.
  DEMÓ: beküldéskor csak összegez és megköszöni, NEM küld el semmit.
  Valódi beküldésnél a handleSubmit-ben jelölt helyen kell a `data`-t elküldeni.
*/

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ADATKEZELESI_URL = 'https://hiphoptanciskola.com/adatkezelesi-tajekoztato/'

const poloMeretek = ['S', 'M', 'L', 'XL', '2XL', '3XL']
const fizetesiModok = ['Készpénz vagy bankkártya MD-ben', 'Banki átutalás', 'MD App', 'Oneticket', 'SZÉP kártya']
const honnan = [
  'Tánciskola diák vagyok',
  'Facebook',
  'Instagram',
  'TikTok',
  'Visszatérő táborlakó',
  'Gyerek-táborkeresőn',
  'Barát vagy rokon',
  'Egyéb',
]
const kitolto = ['Táborlakó', 'Édesanya', 'Édesapa', 'Gondviselő vagy családtag', 'Egyéb']

const empty = {
  nev: '',
  email: '',
  telefon: '',
  szuletes: '',
  polo: poloMeretek[0],
  tudnivalo: '',
  szulo_nev: '',
  szulo_telefon: '',
  lakcim: '',
  turnus: [],
  fizetes: fizetesiModok[0],
  honnan: honnan[0],
  kitolto: kitolto[0],
  adatkezeles: false,
  hozzajarulas: false,
}

function validate(v) {
  const e = {}
  if (!v.nev.trim()) e.nev = 'Add meg a táborlakó nevét.'
  if (!v.email.trim()) e.email = 'Add meg a kapcsolattartó e-mail címét.'
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Adj meg egy érvényes e-mail címet.'
  if (!v.telefon.trim()) e.telefon = 'Add meg a táborlakó telefonszámát.'
  else if (v.telefon.replace(/\D/g, '').length < 7) e.telefon = 'Ellenőrizd a telefonszámot.'
  if (!v.szuletes) e.szuletes = 'Add meg a születési dátumot.'
  else if (new Date(v.szuletes) > new Date()) e.szuletes = 'A dátum a jövőben van.'
  if (v.turnus.length === 0) e.turnus = 'Válassz legalább egy turnust.'
  if (!v.adatkezeles) e.adatkezeles = 'A jelentkezéshez el kell fogadnod az adatkezelési tájékoztatót.'
  if (!v.hozzajarulas) e.hozzajarulas = 'A jelentkezéshez hozzá kell járulnod az adatkezeléshez.'
  return e
}

const order = ['nev', 'email', 'telefon', 'szuletes', 'turnus', 'adatkezeles', 'hozzajarulas']

const inputBase =
  'w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 font-semibold text-black placeholder:text-gray-300 placeholder:font-medium focus:outline-none transition-colors'

function Label({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="block ml-3 mb-2.5 text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
      {children} {required && <span className="text-[#1a9ea3]">*</span>}
    </label>
  )
}

function ErrorText({ children }) {
  if (!children) return null
  return <p className="ml-3 mt-2 text-[13px] font-semibold text-red-600">{children}</p>
}

// Választható „chip”-ek (rádiógomb-csoport helyett)
function ChipGroup({ name, label, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="ml-3 mb-3 text-[11px] font-extrabold uppercase tracking-widest text-gray-400">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o
          return (
            <label
              key={o}
              className={`cursor-pointer select-none rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                on ? 'border-[#40CFD5] bg-[#40CFD5] text-black' : 'border-gray-200 bg-white text-gray-700 hover:border-black'
              }`}
            >
              <input type="radio" name={name} value={o} checked={on} onChange={() => onChange(o)} className="sr-only" />
              {o}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function CheckBox({ id, checked, onChange, children, error, disabled }) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`flex items-start gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <input id={id} type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="peer sr-only" />
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-[#40CFD5]/40 ${
            checked ? 'border-[#40CFD5] bg-[#40CFD5]' : error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
          }`}
        >
          {checked && (
            <svg viewBox="0 0 12 10" className="h-2.5 w-3">
              <path d="M1 5l3 3 7-7" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="text-[15px] font-semibold leading-snug text-black">{children}</span>
      </label>
    </div>
  )
}

export default function TaborJelentkezes() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [v, setV] = useState(empty)
  const [touched, setTouched] = useState({})
  const [submitTried, setSubmitTried] = useState(false)
  const [summary, setSummary] = useState(null)

  const errors = useMemo(() => validate(v), [v])
  const errorCount = Object.keys(errors).length
  const shown = (k) => (submitTried || touched[k] ? errors[k] : undefined)

  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }))
  const setVal = (k) => (val) => setV((p) => ({ ...p, [k]: val }))
  const touch = (k) => () => setTouched((p) => ({ ...p, [k]: true }))
  const cls = (k, extra = '') =>
    `${inputBase} ${shown(k) ? 'border-red-300 bg-red-50/60' : 'border-transparent focus:border-[#40CFD5]/60'} ${extra}`

  const toggleTurnus = (id) =>
    setV((p) => ({ ...p, turnus: p.turnus.includes(id) ? p.turnus.filter((x) => x !== id) : [...p.turnus, id] }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitTried(true)
    if (errorCount > 0) {
      const first = order.find((k) => errors[k])
      document.getElementById(`t-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const data = { ...v }
    // ---- DEMÓ BEKÜLDÉS ----
    // >>> VALÓDI BEKÜLDÉS HOOK: pl. await fetch('/api/tabor-jelentkezes', { method: 'POST',
    //       headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })

    const turnusText = turnusok
      .filter((t) => data.turnus.includes(t.id))
      .map((t) => `${t.label} (${t.dates})`)
      .join(', ')
    const rows = [
      ['Táborlakó', data.nev],
      ['E-mail', data.email],
      ['Telefon', data.telefon],
      ['Születési dátum', data.szuletes],
      ['Pólóméret', data.polo],
      ['Turnus', turnusText],
      ['Fizetési mód', data.fizetes],
    ]
    if (data.szulo_nev.trim() || data.szulo_telefon.trim())
      rows.push(['Szülő / gondviselő', [data.szulo_nev, data.szulo_telefon].filter(Boolean).join(' · ')])
    if (data.lakcim.trim()) rows.push(['Lakcím', data.lakcim])
    if (data.tudnivalo.trim()) rows.push(['Fontos tudnivaló', data.tudnivalo])
    rows.push(['Honnan hallottál róla', data.honnan])
    rows.push(['Kitöltő', data.kitolto])
    setSummary(rows)
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const restart = () => {
    setV(empty)
    setTouched({})
    setSubmitTried(false)
    setSummary(null)
  }

  return (
    <section id="jelentkezes" className="relative bg-black px-4 pt-16 sm:pt-20 pb-24 scroll-mt-12">
      <div className="mx-auto max-w-5xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative mt-6 rounded-[2.5rem] bg-white px-5 pb-10 pt-16 shadow-2xl sm:px-12 sm:pb-12 sm:pt-20 scroll-mt-28"
        >
          {/* Cím — kilóg a kártya tetejéből, fehér körvonallal (mint a főoldalon) */}
          <h2
            className="section-title absolute left-6 sm:left-12 text-4xl sm:text-5xl leading-none"
            style={{ top: '-0.5em', color: '#000', WebkitTextStroke: '7px #fff', paintOrder: 'stroke' }}
          >
            JELENTKEZÉS
          </h2>

          {summary ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#40CFD5]/20">
                <svg viewBox="0 0 24 24" className="h-10 w-10">
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#000" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="mt-6 text-3xl font-black text-black">Köszönjük a jelentkezést!</h3>
              <p className="mt-3 text-sm font-semibold text-gray-500">
                A jelentkezést e-mailben visszaigazoljuk, és megírjuk a befizetéssel kapcsolatos tudnivalókat.
              </p>
              <div className="mt-8 space-y-3 rounded-3xl bg-gray-50 p-6 text-left">
                {summary.map(([label, value]) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:gap-4">
                    <span className="shrink-0 pt-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 sm:w-44">
                      {label}
                    </span>
                    <span className="whitespace-pre-line text-sm font-bold text-black">{value}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={restart}
                className="mt-8 text-[11px] font-extrabold uppercase tracking-widest text-[#1a9ea3] transition-colors hover:text-black"
              >
                Új jelentkezés indítása
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-7">
              {/* ---- Turnus ---- */}
              <div
                id="t-turnus"
                className={`rounded-3xl border-2 p-6 transition-colors ${
                  submitTried && errors.turnus ? 'border-red-300 bg-red-50/60' : 'border-[#40CFD5]/40 bg-[#40CFD5]/10'
                }`}
              >
                <div className="mb-4 text-[11px] font-extrabold uppercase tracking-widest text-black">
                  Turnus időpont <span className="text-[#1a9ea3]">*</span>
                </div>
                <div className="space-y-3">
                  {turnusok.map((t) => (
                    <CheckBox
                      key={t.id}
                      id={`turnus-${t.id}`}
                      checked={v.turnus.includes(t.id)}
                      onChange={() => toggleTurnus(t.id)}
                      disabled={t.closed}
                    >
                      {t.label} · {t.dates} ({t.days})
                      {t.closed && <span className="ml-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Lezárva</span>}
                    </CheckBox>
                  ))}
                </div>
                {submitTried && <ErrorText>{errors.turnus}</ErrorText>}
              </div>

              <div>
                <Label htmlFor="t-nev" required>Táborlakó neve</Label>
                <input id="t-nev" type="text" autoComplete="name" placeholder="Kovács Emma"
                  value={v.nev} onChange={set('nev')} onBlur={touch('nev')} className={cls('nev')} />
                <ErrorText>{shown('nev')}</ErrorText>
              </div>

              <div>
                <Label htmlFor="t-email" required>Kapcsolattartó e-mail</Label>
                <input id="t-email" type="email" autoComplete="email" placeholder="hello@valami.hu"
                  value={v.email} onChange={set('email')} onBlur={touch('email')} className={cls('email')} />
                <ErrorText>{shown('email')}</ErrorText>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="t-telefon" required>Telefonszám</Label>
                  <input id="t-telefon" type="tel" autoComplete="tel" placeholder="+36 30 123 4567"
                    value={v.telefon} onChange={set('telefon')} onBlur={touch('telefon')} className={cls('telefon')} />
                  <ErrorText>{shown('telefon')}</ErrorText>
                </div>
                <div>
                  <Label htmlFor="t-szuletes" required>Születési dátum</Label>
                  <input id="t-szuletes" type="date"
                    value={v.szuletes} onChange={set('szuletes')} onBlur={touch('szuletes')} className={cls('szuletes')} />
                  <ErrorText>{shown('szuletes')}</ErrorText>
                </div>
              </div>

              <ChipGroup name="polo" label="Pólóméret" options={poloMeretek} value={v.polo} onChange={setVal('polo')} />

              <div>
                <Label htmlFor="t-tudnivalo">Fontos tudnivaló</Label>
                <textarea id="t-tudnivalo" rows={4} placeholder="pl. allergia, speciális étrend, SZÉP kártyás fizetés…"
                  value={v.tudnivalo} onChange={set('tudnivalo')} className={cls('tudnivalo', 'resize-none')} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="t-szulo_nev">Szülő / gondviselő neve</Label>
                  <input id="t-szulo_nev" type="text" placeholder="Kovács Ákos"
                    value={v.szulo_nev} onChange={set('szulo_nev')} className={cls('szulo_nev')} />
                </div>
                <div>
                  <Label htmlFor="t-szulo_telefon">Szülő telefonszáma</Label>
                  <input id="t-szulo_telefon" type="tel" placeholder="+36 30 123 4567"
                    value={v.szulo_telefon} onChange={set('szulo_telefon')} className={cls('szulo_telefon')} />
                </div>
              </div>

              <div>
                <Label htmlFor="t-lakcim">Lakcím</Label>
                <input id="t-lakcim" type="text" autoComplete="street-address" placeholder="Számlázási cím"
                  value={v.lakcim} onChange={set('lakcim')} className={cls('lakcim')} />
              </div>

              <ChipGroup name="fizetes" label="Fizetési mód" options={fizetesiModok} value={v.fizetes} onChange={setVal('fizetes')} />
              <ChipGroup name="honnan" label="Honnan hallottál a táborról?" options={honnan} value={v.honnan} onChange={setVal('honnan')} />
              <ChipGroup name="kitolto" label="Jelentkező lapot kitöltő személy" options={kitolto} value={v.kitolto} onChange={setVal('kitolto')} />

              <div className="space-y-4 rounded-3xl bg-gray-50 p-6">
                <div id="t-adatkezeles">
                  <CheckBox id="c-adatkezeles" checked={v.adatkezeles}
                    onChange={(e) => setVal('adatkezeles')(e.target.checked)} error={submitTried && errors.adatkezeles}>
                    Elolvastam és elfogadom az{' '}
                    <a href={ADATKEZELESI_URL} target="_blank" rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-[#179da3]">
                      Adatkezelési tájékoztatóban
                    </a>{' '}
                    foglaltakat. <span className="text-[#1a9ea3]">*</span>
                  </CheckBox>
                  {submitTried && <ErrorText>{errors.adatkezeles}</ErrorText>}
                </div>
                <div id="t-hozzajarulas">
                  <CheckBox id="c-hozzajarulas" checked={v.hozzajarulas}
                    onChange={(e) => setVal('hozzajarulas')(e.target.checked)} error={submitTried && errors.hozzajarulas}>
                    Hozzájárulok a fenti adataim Adatkezelő által történő kezeléséhez.{' '}
                    <span className="text-[#1a9ea3]">*</span>
                  </CheckBox>
                  {submitTried && <ErrorText>{errors.hozzajarulas}</ErrorText>}
                </div>
              </div>

              {submitTried && errorCount > 0 && (
                <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-6 py-4 text-sm font-bold text-red-700">
                  {errorCount === 1
                    ? 'Egy mező még hiányzik vagy hibás.'
                    : `${errorCount} mező még hiányzik vagy hibás. A pirossal jelölt helyeket javítsd!`}
                </p>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full rounded-2xl bg-black py-5 text-sm font-extrabold uppercase tracking-[0.3em] text-white shadow-xl transition-colors duration-200 hover:bg-[#40CFD5] hover:text-black"
              >
                Jelentkezek
              </motion.button>
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span className="text-[#1a9ea3]">*</span> kötelező mező
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
