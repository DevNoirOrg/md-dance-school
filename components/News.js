'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import InstaCard from './InstaCard'

// A 4 esemény-plakát — ugyanaz az InstaCard, de eltérő méret és képarány.
const events = [
  { src: '/canva/event-aaron-quinn-workshop.jpg', alt: 'Aaron Quinn Workshop', ratio: 1.778, width: 330, rotate: -3, y: 40 },
  { src: '/canva/event-after-party.png', alt: '(Random) After Party', ratio: 0.8, width: 226, rotate: 2.5, y: 120 },
  { src: '/canva/event-summer-camp.png', alt: "Summer '26 Camp", ratio: 0.8, width: 266, rotate: -2, y: 20 },
  { src: '/canva/event-summer-classes.png', alt: "Summer Classes '26", ratio: 1.778, width: 316, rotate: 3, y: 150 },
]

// Fekete halftone-pöttyök a sarkokban (fehér háttéren) — kisebbek, sarokba húzva.
const dots = [
  { top: '0%', left: '-3%', size: 150, hideOnMobile: false },
  { top: '-2%', right: '-3%', size: 160, hideOnMobile: true },
  { bottom: '2%', right: '2%', size: 120, hideOnMobile: true },
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
    <section id="hirek" className="relative bg-white overflow-x-clip py-16 sm:py-24 px-4">
      {/* Fekete halftone pöttyök */}
      {dots.map((d, i) => (
        <img
          key={i}
          src="/dots-black.png"
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute select-none opacity-70 ${d.hideOnMobile ? 'hidden md:block' : ''}`}
          style={{ top: d.top, left: d.left, right: d.right, bottom: d.bottom, width: d.size }}
        />
      ))}

      <div className="relative max-w-7xl mx-auto md:min-h-[640px]">
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
