'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Send, Bookmark, Play } from 'lucide-react'

/**
 * Instagram-poszt stílusú kártya — a design központi, visszatérő eleme.
 * Használat: About (1 nagy), Tanáraink (több, döntött), Hírek (több, döntött).
 *
 * props:
 *  - src, alt: a kártya fotója (a /public-ból, pl. "/canva/about-group.jpg")
 *  - width: kártyaszélesség px-ben
 *  - objectPosition: a fotó igazítása (pl. "center", "top")
 *  - priority: next/image priority (a hajtás feletti képekhez)
 *  - className, style: extra stílus (pl. forgatás a klaszterben)
 */
// Az animációk (globals.css, .ig-*) MINDEN kártyán egyszerre mennek: a közös
// óraként a lap betöltése óta eltelt időt használjuk, és ennyivel „előretekerjük”
// a kártya animációit. Így egy később megjelenő (újra mountolt) kártya is szinkronban lesz.
// 90 mp = a 4,5 / 6 / 10 mp-es ciklusok közös többszöröse.
const SYNC_CYCLE_MS = 90000

export default function InstaCard({
  src,
  alt = '',
  width = 340,
  ratio = 1, // fotó képaránya (szélesség / magasság); 1 = négyzet
  objectPosition = 'center',
  priority = false,
  caption = null, // { name, style } — a caption helyére írt szöveg
  video = false, // „Videó” jelzés a fotón
  className = '',
  style = {},
}) {
  const cardRef = useRef(null)
  useEffect(() => {
    const t = performance.now() % SYNC_CYCLE_MS
    cardRef.current?.style.setProperty('--ig-d', `${-t / 1000}s`)
  }, [])

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-2xl shadow-xl overflow-hidden select-none ${className}`}
      style={{ width: '100%', maxWidth: width, ...style }}
    >
      {/* Fejléc: avatar + név-csíkok + ··· */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="ig-avatar w-8 h-8 rounded-full bg-[#40CFD5] ring-2 ring-[#ff7a45] ring-offset-1 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="ig-bar h-2 w-24 max-w-[60%] bg-gray-300 rounded-full" />
          <div className="ig-bar ig-bar-2 h-2 w-16 max-w-[40%] bg-gray-200 rounded-full" />
        </div>
        <span className="text-gray-400 tracking-[0.15em] text-lg leading-none -mt-2">···</span>
      </div>

      {/* Fotó */}
      <div className="relative w-full bg-gray-200" style={{ aspectRatio: ratio }}>
        {src && (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 90vw, 400px"
            className="object-cover"
            style={{ objectPosition }}
          />
        )}
        {/* Videó-jelzés (tanárkártyák): kattintásra Instán nyílik a videó */}
        {video && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-sm pl-2 pr-3 py-1.5 text-white text-[11px] font-bold uppercase tracking-wider">
            <Play className="w-3.5 h-3.5 fill-white" strokeWidth={0} />
            Videó
          </div>
        )}
      </div>

      {/* Akció ikonok — sorban felvillannak (animáció: globals.css, .ig-icon) */}
      <div className="flex items-center gap-4 px-3 py-3 text-gray-900">
        <Heart className="ig-icon ig-icon-heart ig-icon-1 w-6 h-6" fill="#ef4444" strokeWidth={1.6} />
        <MessageCircle className="ig-icon ig-icon-2 w-6 h-6" fill="#111827" strokeWidth={1.6} />
        <Send className="ig-icon ig-icon-3 w-6 h-6" fill="#111827" strokeWidth={1.6} />
        <Bookmark className="ig-icon ig-icon-4 w-6 h-6 ml-auto" fill="#111827" strokeWidth={1.6} />
      </div>

      {/* Caption: ha van név/stílus, azt írjuk ki, különben díszítő csíkok */}
      {caption ? (
        <div className="px-3 pb-4 min-h-[66px]">
          <div className="font-extrabold text-[17px] leading-tight text-black">{caption.name}</div>
          <div className="text-[13px] font-semibold text-[#1a9ea3] mt-1 leading-snug">{caption.style}</div>
        </div>
      ) : (
        <div className="px-3 pb-4 space-y-2">
          <div className="h-2.5 w-1/3 bg-[#40CFD5] rounded-full" />
          <div className="h-2.5 w-3/4 bg-gray-200 rounded-full" />
          <div className="h-2.5 w-1/2 bg-gray-200 rounded-full" />
        </div>
      )}
    </div>
  )
}
