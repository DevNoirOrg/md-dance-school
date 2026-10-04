'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import InstaCard from './InstaCard'

// A tánctanár IG-kártyák — ugyanaz az InstaCard, mint a Master Dance (About) szekcióban.
const teachers = [
  { src: '/canva/teacher-04-orangejersey.jpg', alt: 'Tánctanár' },
  { src: '/canva/teacher-03-redpants.jpg', alt: 'Tánctanár' },
  { src: '/canva/teacher-02-soxcap.jpg', alt: 'Tánctanár' },
  { src: '/canva/teacher-01-beanie.jpg', alt: 'Tánctanár' },
  { src: '/canva/teacher-05-stool.jpg', alt: 'Tánctanár' },
]

// Türkiz halftone-pöttyök — kisebbek, a szélekre húzva.
const dots = [
  { top: '5%', left: '-4%', size: 150 },
  { top: '34%', left: '-5%', size: 125 },
  { top: '66%', left: '-1%', size: 115 },
  { top: '8%', right: '-4%', size: 165 },
  { top: '40%', right: '-5%', size: 135 },
  { top: '68%', right: '0%', size: 115 },
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
  const cardH = CARD_W + 150 // közelítő kártyamagasság (négyzet fotó + chrome)
  // mobilon nagy sugár + kis szög = enyhe ív (a középső kártya áll, a szomszédok kicsit döntve/lejjebb)
  const RADIUS = mobile ? 2200 : 660
  const STEP = mobile ? 7.5 : 24 // fok két kártya között
  const TOP_Y = mobile ? 24 + cardH / 2 : 240 // a középső kártya középpontjának y-ja
  const AREA_H = mobile ? cardH + 130 : 610
  const centerX = w / 2
  const centerY = TOP_Y + RADIUS

  const onPointerDown = (e) => {
    cancelAnimationFrame(animRef.current)
    drag.current = { active: true, startX: e.clientX, startOffset: offsetRef.current }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
  }
  const onPointerMove = (e) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    const sensitivity = mobile ? 90 : 150 // px / kártya
    setBoth(drag.current.startOffset - dx / sensitivity)
  }
  const endDrag = () => {
    if (!drag.current.active) return
    drag.current.active = false
    animateTo(Math.round(offsetRef.current))
  }

  return (
    <section id="tanaraink" className="relative bg-black z-20" style={{ overflowX: 'clip' }}>
      {/* Felső fehér ragyogás */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-40"
        style={{ background: 'radial-gradient(130% 100% at 50% 0%, rgba(255,255,255,0.45), rgba(255,255,255,0) 62%)' }}
      />

      {/* Türkiz halftone pöttyök */}
      {dots.map((d, i) => (
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
        className="relative z-10 w-full select-none cursor-grab active:cursor-grabbing"
        style={{ height: AREA_H, touchAction: 'pan-y' }}
      >
        {teachers.map((t, i) => {
          const d = wrap(i - offset)
          const theta = d * STEP
          const rad = (theta * Math.PI) / 180
          const x = centerX + RADIUS * Math.sin(rad)
          const y = centerY - RADIUS * Math.cos(rad)
          const ad = Math.abs(d)
          const opacity = Math.max(0, Math.min(1, (N / 2 - ad) / 0.4))
          return (
            <div
              key={i}
              className="absolute left-0 top-0 pointer-events-none"
              style={{
                width: CARD_W,
                opacity,
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${theta}deg)`,
                zIndex: Math.round(30 - ad * 4),
              }}
            >
              <div className="pointer-events-none">
                <InstaCard src={t.src} alt={t.alt} width={CARD_W} />
              </div>
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
        className="absolute inset-x-0 z-30 flex justify-center pointer-events-none"
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
