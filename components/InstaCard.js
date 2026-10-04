'use client'
import Image from 'next/image'
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react'

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
export default function InstaCard({
  src,
  alt = '',
  width = 340,
  ratio = 1, // fotó képaránya (szélesség / magasság); 1 = négyzet
  objectPosition = 'center',
  priority = false,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-xl overflow-hidden select-none ${className}`}
      style={{ width: '100%', maxWidth: width, ...style }}
    >
      {/* Fejléc: avatar + név-csíkok + ··· */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="w-8 h-8 rounded-full bg-[#40CFD5] ring-2 ring-[#ff7a45] ring-offset-1 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2 w-24 max-w-[60%] bg-gray-300 rounded-full" />
          <div className="h-2 w-16 max-w-[40%] bg-gray-200 rounded-full" />
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
      </div>

      {/* Akció ikonok */}
      <div className="flex items-center gap-4 px-3 py-3 text-gray-900">
        <Heart className="w-6 h-6" strokeWidth={1.6} />
        <MessageCircle className="w-6 h-6" strokeWidth={1.6} />
        <Send className="w-6 h-6" strokeWidth={1.6} />
        <Bookmark className="w-6 h-6 ml-auto" strokeWidth={1.6} />
      </div>

      {/* Caption-csíkok */}
      <div className="px-3 pb-4 space-y-2">
        <div className="h-2.5 w-1/3 bg-[#40CFD5] rounded-full" />
        <div className="h-2.5 w-3/4 bg-gray-200 rounded-full" />
        <div className="h-2.5 w-1/2 bg-gray-200 rounded-full" />
      </div>
    </div>
  )
}
