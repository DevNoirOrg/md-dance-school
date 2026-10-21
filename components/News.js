'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import InstaCard from './InstaCard'
import HalftoneDots from './HalftoneDots'

// A 4 esemény-plakát — ugyanaz az InstaCard, de eltérő méret és képarány.
const events = [
  { src: '/canva/event-aaron-quinn-workshop.jpg', alt: 'Aaron Quinn Workshop', ratio: 1.778, width: 330, rotate: -3, y: 40 },
  { src: '/canva/event-after-party.png', alt: '(Random) After Party', ratio: 0.8, width: 226, rotate: 2.5, y: 120 },
  { src: '/canva/event-summer-camp.png', alt: "Summer '26 Camp", ratio: 0.8, width: 266, rotate: -2, y: 20 },
  { src: '/canva/event-summer-classes.png', alt: "Summer Classes '26", ratio: 1.778, width: 316, rotate: 3, y: 150 },
]

// Animált halftone-pöttyök (ugyanaz, mint a heróban / órarendnél) a sarkokban.
// Átlóghatnak a szomszéd szekciókba (felfelé a jelentkezésbe, lefelé a láblécbe).
// Cikk-cakkban: bal felül (felnyúlik a jelentkezésbe) → jobb oldalt középen →
// a lábléc bal felső foltja (Footer.js) folytatja lent.
const dots = [
  { top: -90, left: -60, size: 200, hideOnMobile: false },
  { top: '40%', right: -90, size: 220, hideOnMobile: true },
]

function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const on = () => setM(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return m
}

function EventCard({ e, index, mobile }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const rest = mobile
    ? { opacity: 1, y: 0, rotate: e.rotate * 0.7, scale: 1 }
    : { opacity: 1, y: e.y, rotate: e.rotate, scale: 1 }
  return (
    <motion.div
      ref={ref}
      style={{ width: mobile ? undefined : e.width }}
      className={mobile ? 'w-[86vw] max-w-[360px]' : 'shrink-0'}
      initial={{ opacity: 0, y: mobile ? 30 : e.y + 40, rotate: 0, scale: 0.94 }}
      animate={inView ? rest : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={mobile ? {} : { y: e.y - 12, rotate: 0, zIndex: 40, transition: { duration: 0.3 } }}
    >
      <InstaCard src={e.src} alt={e.alt} ratio={e.ratio} width={mobile ? 360 : e.width} />
    </motion.div>
  )
}

function Title({ titleRef, inView, className }) {
  return (
    <motion.h2
      ref={titleRef}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7 }}
      className={`section-title text-4xl sm:text-6xl leading-[0.92] text-black ${className}`}
    >
      HÍREK ÉS<br />ESEMÉNYEK
    </motion.h2>
  )
}

export default function News() {
  const mobile = useIsMobile()
  const titleRef = useRef(null)
  const inView = useInView(titleRef, { once: true, margin: '-80px' })

  return (
    <section id="hirek" className="relative z-30 overflow-x-clip py-16 sm:py-24 px-4">
      {/* Animált halftone pöttyök */}
      {dots.map((d, i) => (
        <HalftoneDots
          key={i}
          size={d.size}
          zIndex={0}
          className={d.hideOnMobile ? 'hidden md:block' : ''}
          style={{ top: d.top, left: d.left, right: d.right, bottom: d.bottom }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto md:min-h-[640px]">
        {/* Cím — mobilon felül */}
        {mobile && <Title titleRef={titleRef} inView={inView} className="mb-8" />}

        {/* Kártyák */}
        <div
          className={
            mobile
              ? 'flex flex-col items-center gap-8'
              : 'flex justify-center items-start gap-3 sm:gap-6 pt-2'
          }
        >
          {events.map((e, i) => (
            <EventCard key={e.src} e={e} index={i} mobile={mobile} />
          ))}
        </div>

        {/* Cím — desktopon balra lent */}
        {!mobile && (
          <Title titleRef={titleRef} inView={inView} className="absolute left-1 sm:left-4 bottom-2" />
        )}
      </div>
    </section>
  )
}
