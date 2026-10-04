'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { Instagram, Facebook, Youtube } from 'lucide-react'

export default function Footer() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <footer id="elerhetoseg" className="relative bg-white overflow-hidden pt-16 pb-8 px-4">
      {/* Fekete halftone pöttyök — bal felül */}
      <img
        src="/dots-black.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute select-none opacity-70"
        style={{ top: -20, left: -20, width: 180 }}
      />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="relative max-w-3xl mx-auto flex flex-col items-center text-center gap-8"
      >
        {/* Nagy logó középen */}
        <Image
          src="/canva/logo-md-black-trim.png"
          alt="MD Dance School"
          width={273}
          height={219}
          className="w-auto"
          style={{ height: 140 }}
        />

        {/* Elérhetőség */}
        <div className="space-y-4 text-lg sm:text-xl text-gray-900">
          <p>
            <span className="font-bold">E-mail:</span>{' '}
            <a
              href="mailto:masterdancetanciskola@gmail.com"
              className="underline underline-offset-2 hover:text-[#40CFD5] transition-colors"
            >
              masterdancetanciskola@gmail.com
            </a>
          </p>
          <p>
            <span className="font-bold">Tel.:</span>{' '}
            <a
              href="tel:+36306336682"
              className="underline underline-offset-2 hover:text-[#40CFD5] transition-colors"
            >
              +36 (30) 633-6682
            </a>
          </p>
        </div>

        {/* Cím */}
        <p className="text-lg sm:text-xl text-gray-900 leading-relaxed max-w-xl">
          <span className="font-bold">Astoria Stúdió:</span> 5. Kerület, Semmelweis u. 1-3, – (Astoria metró megállótól 3 percnyi sétára van. MD Dance Stúdió a Magyarok házában a második emeleten van
        </p>

        {/* Közösségi ikonok — fekete kör */}
        <div className="flex items-center gap-5">
          {[
            { Icon: Instagram, href: '#', label: 'Instagram' },
            { Icon: Facebook, href: '#', label: 'Facebook' },
            { Icon: Youtube, href: '#', label: 'YouTube' },
          ].map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white hover:bg-[#40CFD5] hover:text-black transition-colors duration-200"
            >
              <Icon size={22} />
            </a>
          ))}
        </div>

        {/* Fizetési módok — kép */}
        <Image
          src="/canva/payment-methods.png"
          alt="Elfogadott fizetési módok: Barion, VISA, VISA Electron, Mastercard, Maestro, American Express"
          width={413}
          height={50}
          className="h-auto w-full max-w-[420px]"
        />
      </motion.div>

      {/* Jogi linkek — szétosztva a szélekre */}
      <div className="relative max-w-6xl mx-auto mt-14 flex flex-wrap justify-between gap-4 text-base sm:text-lg text-gray-600">
        <a href="#" className="hover:text-black transition-colors">Adatkezelési tájékoztató</a>
        <a href="#" className="hover:text-black transition-colors">ÁSZF</a>
        <a href="#" className="hover:text-black transition-colors">Cookie beállítások</a>
      </div>
    </footer>
  )
}
