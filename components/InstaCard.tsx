"use client";
import { Bookmark, Heart, MessageCircle, Play, Send } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Instagram-poszt stílusú kártya — a design központi, visszatérő eleme.
 * Használat: Rólunk (1 nagy), Tanáraink (több, ívben), Hírek (több, döntött), Tánctábor.
 *
 * Az animációk (globals.css, .ig-*) MINDEN kártyán egyszerre mennek: közös
 * óraként a lap betöltése óta eltelt időt használjuk, és ennyivel „előretekerjük”
 * a kártya animációit. Így egy később megjelenő kártya is szinkronban lesz.
 * 90 mp = a 4,5 / 6 / 10 mp-es ciklusok közös többszöröse.
 */
const SYNC_CYCLE_MS = 90000;

export default function InstaCard({
  src,
  alt = "",
  width = 340,
  ratio = 1,
  objectPosition = "center",
  priority = false,
  caption = null,
  video = false,
  className = "",
  style = {},
}: {
  /** A kártya fotója: "/canva/…" vagy teljes (Storage) URL. */
  src: string;
  alt?: string;
  /** Kártyaszélesség px-ben. */
  width?: number;
  /** A fotó képaránya (szélesség / magasság); 1 = négyzet. */
  ratio?: number;
  objectPosition?: string;
  priority?: boolean;
  /** A caption helyére írt név és stílus (tanárkártyák). */
  caption?: { name: string; style: string } | null;
  /** „Videó” jelzés a fotón. */
  video?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = performance.now() % SYNC_CYCLE_MS;
    cardRef.current?.style.setProperty("--ig-d", `${-t / 1000}s`);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`select-none overflow-hidden rounded-2xl bg-white shadow-xl ${className}`}
      style={{ width: "100%", maxWidth: width, ...style }}
    >
      {/* Fejléc: avatar + név-csíkok + ··· */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="ig-avatar h-8 w-8 shrink-0 rounded-full bg-md-cyan ring-2 ring-[#ff7a45] ring-offset-1" />
        <div className="flex-1 space-y-1.5">
          <div className="ig-bar h-2 w-24 max-w-[60%] rounded-full bg-gray-300" />
          <div className="ig-bar ig-bar-2 h-2 w-16 max-w-[40%] rounded-full bg-gray-200" />
        </div>
        <span className="-mt-2 text-lg leading-none tracking-[0.15em] text-gray-400">···</span>
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
        {video && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-black/70 py-1.5 pl-2 pr-3 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            <Play className="h-3.5 w-3.5 fill-white" strokeWidth={0} />
            Videó
          </div>
        )}
      </div>

      {/* Akció ikonok — sorban felvillannak (globals.css, .ig-icon) */}
      <div className="flex items-center gap-4 px-3 py-3 text-gray-900">
        <Heart className="ig-icon ig-icon-heart ig-icon-1 h-6 w-6" fill="#ef4444" strokeWidth={1.6} />
        <MessageCircle className="ig-icon ig-icon-2 h-6 w-6" fill="#111827" strokeWidth={1.6} />
        <Send className="ig-icon ig-icon-3 h-6 w-6" fill="#111827" strokeWidth={1.6} />
        <Bookmark className="ig-icon ig-icon-4 ml-auto h-6 w-6" fill="#111827" strokeWidth={1.6} />
      </div>

      {caption ? (
        <div className="min-h-[66px] px-3 pb-4">
          <div className="text-[17px] font-extrabold leading-tight text-black">{caption.name}</div>
          <div className="mt-1 text-[13px] font-semibold leading-snug text-[#1a9ea3]">{caption.style}</div>
        </div>
      ) : (
        <div className="space-y-2 px-3 pb-4">
          <div className="h-2.5 w-1/3 rounded-full bg-md-cyan" />
          <div className="h-2.5 w-3/4 rounded-full bg-gray-200" />
          <div className="h-2.5 w-1/2 rounded-full bg-gray-200" />
        </div>
      )}
    </div>
  );
}
