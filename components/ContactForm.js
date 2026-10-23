'use client'
import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Send } from 'lucide-react'
import ConsentChecks, { emptyConsents } from './ConsentChecks'

/* „Írj nekünk” űrlap — minden oldalon a lábléc fölött. Resenddel e-mailben megy a stúdiónak (/api/contact). */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const empty = { name: '', phone: '', email: '', message: '', website: '' }

const inputBase =
  'w-full rounded-2xl border-2 bg-gray-50 px-5 py-4 font-semibold text-black placeholder:font-medium placeholder:text-gray-300 transition-colors focus:outline-none'

function validate(v) {
  const e = {}
  if (!v.name.trim()) e.name = 'Add meg a neved.'
  if (!v.email.trim()) e.email = 'Add meg az e-mail címed.'
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Adj meg egy érvényes e-mail címet.'
  if (v.phone.trim() && !/^[+\d\s()-]{6,}$/.test(v.phone.trim())) e.phone = 'Ellenőrizd a telefonszámot.'
  if (!v.message.trim()) e.message = 'Írd meg az üzeneted.'
  return e
}

export default function ContactForm() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [v, setV] = useState(empty)
  const [consents, setConsents] = useState(emptyConsents)
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState('')

  const errors = validate(v)
  const consentsOk = consents.tajekoztato && consents.adatkezeles
  const shown = (k) => (tried ? errors[k] : undefined)
  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }))
  const cls = (k, extra = '') =>
    `${inputBase} ${shown(k) ? 'border-red-300 bg-red-50/60' : 'border-transparent focus:border-[#40CFD5]/60'} ${extra}`

  const submit = async (e) => {
    e.preventDefault()
    setTried(true)
    setServerError('')
    if (Object.keys(errors).length || !consentsOk || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, consents }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || !result.success) {
        setServerError(result.error || 'Nem sikerült elküldeni az üzenetet. Kérjük, próbáld újra később.')
        return
      }
      setSent(true)
    } catch {
      setServerError('Nem sikerült elküldeni az üzenetet. Ellenőrizd az internetkapcsolatot, és próbáld újra.')
    } finally {
      setSending(false)
    }
  }

  const reset = () => {
    setV(empty)
    setConsents(emptyConsents)
    setTried(false)
    setSent(false)
  }

  return (
    <section id="irj-nekunk" className="relative z-20 bg-white px-4 pb-6 pt-20 sm:pt-24 scroll-mt-24">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14"
      >
        <div className="lg:pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#179da3]">Kapcsolat</p>
          <h2 className="section-title mt-3 text-5xl text-black sm:text-6xl">ÍRJ NEKÜNK</h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-gray-600">
            Kérdésed van az órákkal, a táborral vagy a stúdióbérléssel kapcsolatban? Írj pár sort, és hamarosan
            válaszolunk e-mailben.
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.12)] ring-1 ring-black/5 sm:p-9">
          {sent ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#40CFD5]/20">
                <svg viewBox="0 0 24 24" className="h-8 w-8">
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#000" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-black text-black">Köszönjük az üzeneted!</h3>
              <p className="mt-2 text-sm font-semibold text-gray-500">Hamarosan válaszolunk a megadott e-mail címen.</p>
              <button type="button" onClick={reset}
                className="mt-6 text-[11px] font-extrabold uppercase tracking-widest text-[#1a9ea3] transition-colors hover:text-black">
                Új üzenet írása
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-5" aria-busy={sending}>
              {/* spam-csapda: ember nem látja, nem tölti ki */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={v.website} onChange={set('website')}
                className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="c-name" label="Név" required error={shown('name')}>
                  <input id="c-name" type="text" autoComplete="name" placeholder="Kovács Emma" maxLength={200}
                    value={v.name} onChange={set('name')} className={cls('name')} />
                </Field>
                <Field id="c-phone" label="Telefonszám" error={shown('phone')}>
                  <input id="c-phone" type="tel" autoComplete="tel" placeholder="+36 30 123 4567" maxLength={40}
                    value={v.phone} onChange={set('phone')} className={cls('phone')} />
                </Field>
              </div>
              <Field id="c-email" label="E-mail cím" required error={shown('email')}>
                <input id="c-email" type="email" autoComplete="email" placeholder="hello@valami.hu" maxLength={254}
                  value={v.email} onChange={set('email')} className={cls('email')} />
              </Field>
              <Field id="c-message" label="Üzenet" required error={shown('message')}>
                <textarea id="c-message" rows={5} placeholder="Miben segíthetünk?" maxLength={5000}
                  value={v.message} onChange={set('message')} className={cls('message', 'resize-none')} />
              </Field>

              <ConsentChecks idPrefix="contact" values={consents} showErrors={tried}
                onChange={(k, val) => setConsents((p) => ({ ...p, [k]: val }))} />

              {serverError && (
                <p role="alert" className="rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700">
                  {serverError}
                </p>
              )}

              <button type="submit" disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-sm font-extrabold uppercase tracking-[0.25em] text-white shadow-xl transition-colors hover:bg-[#40CFD5] hover:text-black disabled:cursor-wait disabled:opacity-60">
                <Send size={16} strokeWidth={2.4} aria-hidden="true" />
                {sending ? 'Küldés…' : 'Üzenet küldése'}
              </button>
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span className="text-[#1a9ea3]">*</span> kötelező mező
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  )
}

function Field({ id, label, required, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2.5 ml-3 block text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
        {label} {required && <span className="text-[#1a9ea3]">*</span>}
      </label>
      {children}
      {error && <p className="ml-3 mt-2 text-[13px] font-semibold text-red-600">{error}</p>}
    </div>
  )
}
