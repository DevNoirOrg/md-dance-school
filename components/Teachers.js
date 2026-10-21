'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import InstaCard from './InstaCard'
import { teachers } from '@/lib/teachers'

// A tánctanár IG-kártyák — ugyanaz az InstaCard, mint a Master Dance (About) szekcióban.
// A tanárok adatai (név, stílus, fotó, Insta-videó link): lib/teachers.js

// Türkiz halftone-pöttyök — szórtan kitöltik a tanárok mögötti teret
// (a kártyák mögött, a TANÁRAINK felirat környékét szabadon hagyva).
// size: px-ben (asztali nézet; mobilon a lenti mobileDots lista érvényes).
const dots = [
  { top: '3%', left: '-4%', size: 170 },
  { top: '42%', left: '1%', size: 230 },
  { top: '78%', left: '-5%', size: 150 },
  { top: '14%', left: '17%', size: 120 },
  { top: '58%', left: '20%', size: 180 },
  { top: '-2%', left: '36%', size: 150 },
  { top: '30%', left: '44%', size: 110 },
  { top: '8%', left: '58%', size: 200 },
  { top: '52%', left: '68%', size: 150 },
  { top: '2%', right: '10%', size: 190 },
  { top: '38%', right: '-6%', size: 250 },
  { top: '76%', right: '3%', size: 130 },
]

// Mobilon kevesebb, de nagyobb folt — a kártyák körül, egymást nem takarva.
const mobileDots = [
  { top: '-2%', left: '-12%', size: 160 },
  { top: '2%', right: '-10%', size: 140 },
  { top: '83%', left: '-14%', size: 130 },
  { top: '79%', right: '-12%', size: 140 },
]

const N = teachers.length
// a relatív pozíciót a [-N/2, N/2] tartományba írja (végtelen körforgás)
const wrap = (x) => x - N * Math.round(x / N)

export default function Teachers() {
  const [offset, setOffset] = useState((N - 1) / 2) // középső kártya
  const [w, setW] = useState(1200)
  const offsetRef = useRef((N - 1) / 2)
  const animRef = useRef(0)
  const drag = useRef({ active: false, startX: 0, startOffset: 0 })
  const areaRef = useRef(null)

  const titleRef = useRef(null)
  const inView = useInView(titleRef, { once: true, margin: '-80px' })

  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    const measure = () => setW(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  const setBoth = (v) => {
    offsetRef.current = v
    setOffset(v)
  }

  // JS-vezérelt snap az integer pozícióra (nincs CSS transition, így a körbeugrás nem látszik)
  const animateTo = (target) => {
    cancelAnimationFrame(animRef.current)
    const start = offsetRef.current
    const t0 = performance.now()
    const dur = 480
    const ease = (t) => 1 - Math.pow(1 - t, 3)
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur)
      setBoth(start + (target - start) * ease(p))
      if (p < 1) animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
  }

  // reszponzív ív-paraméterek
  const mobile = w < 768
  const CARD_W = mobile ? Math.round(Math.min(w * 0.72, 300)) : 236
  const cardH = CARD_W + 167 // kártyamagasság (négyzet fotó + fejléc, ikonok, név/stílus)
  // a középső kártya fölötti hely = a jelentkezési szekció alsó paddingja (pb-24 = 96px)
  const PAD_TOP = 96
  // mobilon nagy sugár + kis szög = enyhe ív (a középső kártya áll, a szomszédok kicsit döntve/lejjebb)
  const RADIUS = mobile ? 2200 : 660
  const STEP = mobile ? 7.5 : 24 // fok két kártya között
  const TOP_Y = PAD_TOP + cardH / 2 // a középső kártya középpontjának y-ja
  const AREA_H = mobile ? TOP_Y + cardH / 2 + 106 : TOP_Y + 370
  const centerX = w / 2
  const centerY = TOP_Y + RADIUS

  const onPointerDown = (e) => {
    cancelAnimationFrame(animRef.current)
    // melyik kártyán kezdődött a mozdulat (kattintás = nem húzás)
    const card = e.target.closest ? e.target.closest('[data-video]') : null
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startOffset: offsetRef.current,
      video: card ? card.dataset.video : null,
    }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
  }
  const onPointerMove = (e) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    const sensitivity = mobile ? 90 : 150 // px / kártya
    setBoth(drag.current.startOffset - dx / sensitivity)
  }
  const endDrag = (e) => {
    if (!drag.current.active) return
    drag.current.active = false
    const moved = e && e.type === 'pointerup'
      ? Math.hypot(e.clientX - drag.current.startX, e.clientY - drag.current.startY)
      : Infinity
    // Egy kattintás (alig mozdult) → megnyitjuk a tanár Insta-videóját új lapon
    if (moved < 6 && drag.current.video) {
      window.open(drag.current.video, '_blank', 'noopener,noreferrer')
      setBoth(Math.round(offsetRef.current))
      return
    }
    animateTo(Math.round(offsetRef.current))
  }

  return (
    <section id="tanaraink" className="relative bg-black" style={{ overflowX: 'clip' }}>
      {/* Nincs z-index a szekción: így az órarend pöttyei a fekete háttér fölé lóghatnak, de a kártyák (z-40) mindig a pöttyök fölött maradnak */}
      {/* Türkiz halftone pöttyök */}
      {(mobile ? mobileDots : dots).map((d, i) => (
        <img
          key={i}
          src="/dots-cyan.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute select-none"
          style={{ top: d.top, left: d.left, right: d.right, width: d.size }}
        />
      ))}

      {/* Végtelen ív-carousel — húzható (egér + touch), swipe-olható */}
      <div
        ref={areaRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDragStart={(e) => e.preventDefault()}
        className="relative z-40 w-full select-none cursor-grab active:cursor-grabbing"
        style={{ height: AREA_H, touchAction: 'pan-y' }}
      >
        {teachers.map((t, i) => {
          const d = wrap(i - offset)
          const theta = d * STEP
          const rad = (theta * Math.PI) / 180
          // 2 tizedesre kerekítve, hogy a szerver és a böngésző ugyanazt a style-t számolja (hydration)
          const x = Math.round((centerX + RADIUS * Math.sin(rad)) * 100) / 100
          const y = Math.round((centerY - RADIUS * Math.cos(rad)) * 100) / 100
          const ad = Math.abs(d)
          const opacity = Math.max(0, Math.min(1, (N / 2 - ad) / 0.4))
          return (
            <div
              key={i}
              className="absolute left-0 top-0"
              style={{
                width: CARD_W,
                opacity,
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${theta}deg)`,
                zIndex: Math.round(30 - ad * 4),
                pointerEvents: opacity > 0.3 ? 'auto' : 'none',
              }}
            >
              {/* Link a billentyűzetes / képernyőolvasós használathoz; egérrel a
                  pointer-kezelő nyitja meg (húzásnál nem nyílik meg). */}
              <a
                href={t.video}
                target="_blank"
                rel="noopener noreferrer"
                data-video={t.video}
                draggable={false}
                aria-label={`${t.name} (${t.style}) táncvideója az Instagramon`}
                onClick={(e) => {
                  // egér/touch kattintást a pointerup kezeli; csak billentyűs aktiválás (detail 0) mehet át
                  if (e.detail !== 0) e.preventDefault()
                }}
                className="block rounded-2xl cursor-pointer focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#40CFD5]"
              >
                <InstaCard
                  src={t.src}
                  alt={`${t.name} — ${t.style} tánctanár`}
                  width={CARD_W}
                  caption={{ name: t.name, style: t.style }}
                  video
                />
              </a>
            </div>
          )
        })}
      </div>

      {/* Ívelt TANÁRAINK felirat */}
      <motion.div
        ref={titleRef}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="absolute inset-x-0 z-40 flex justify-center pointer-events-none"
        style={{ bottom: mobile ? 6 : 14 }}
      >
        <svg viewBox="0 0 640 140" className="w-[80%] max-w-[560px]">
          <defs>
            <path id="tanarArc" d="M 25 125 Q 320 28 615 125" fill="none" />
          </defs>
          <text
            fill="#ffffff"
            style={{ fontFamily: 'var(--font-anton), sans-serif', fontSize: 76, letterSpacing: 2 }}
          >
            <textPath href="#tanarArc" startOffset="50%" textAnchor="middle">
              TANÁRAINK
            </textPath>
          </text>
        </svg>
      </motion.div>
    </section>
  )
}
