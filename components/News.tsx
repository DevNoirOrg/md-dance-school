"use client";
import { motion, useInView } from "motion/react";
import { Fragment, useRef, useSyncExternalStore, type RefObject } from "react";
import HalftoneDots from "./HalftoneDots";
import InstaCard from "./InstaCard";
import type { NewsContent, NewsItem } from "@/lib/content-types";
import { mediaUrl } from "@/lib/format";

// A plakátok — ugyanaz az InstaCard, eltérő méret, képarány és döntés.
// Asztali nézetben a kártyák ezt a mintát követik (sorban, ismétlődve).
const RATIO = { landscape: 1.778, portrait: 0.8 } as const;
const LAYOUT = [
  { rotate: -3, y: 40, scale: 1 },
  { rotate: 2.5, y: 120, scale: 1 },
  { rotate: -2, y: 20, scale: 1.18 },
  { rotate: 3, y: 150, scale: 0.96 },
];
const BASE_WIDTH = { landscape: 330, portrait: 226 } as const;

// Animált halftone-pöttyök a sarkokban; átlóghatnak a szomszéd szekciókba.
const dots = [
  { top: -90, left: -60, size: 200, hideOnMobile: false },
  { top: "40%", right: -90, size: 220, hideOnMobile: true },
] as const;

const MOBILE_MQ = "(max-width: 767px)";
function subscribeMobile(cb: () => void) {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
/** Telefonos nézet? (szerveren mindig false — az asztali elrendezés renderelődik előre) */
function useIsMobile() {
  return useSyncExternalStore(subscribeMobile, () => window.matchMedia(MOBILE_MQ).matches, () => false);
}

function EventCard({ item, index, mobile }: { item: NewsItem; index: number; mobile: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const l = LAYOUT[index % LAYOUT.length];
  const width = Math.round(BASE_WIDTH[item.format] * l.scale);
  const rest = mobile ? { opacity: 1, y: 0, rotate: l.rotate * 0.7, scale: 1 } : { opacity: 1, y: l.y, rotate: l.rotate, scale: 1 };
  const card = <InstaCard src={mediaUrl(item.imagePath)} alt={item.alt} ratio={RATIO[item.format]} width={mobile ? 360 : width} />;
  return (
    <motion.div
      ref={ref}
      style={{ width: mobile ? undefined : width }}
      className={mobile ? "w-[86vw] max-w-[360px]" : "shrink-0"}
      initial={{ opacity: 0, y: mobile ? 30 : l.y + 40, rotate: 0, scale: 0.94 }}
      animate={inView ? rest : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={mobile ? {} : { y: l.y - 12, rotate: 0, zIndex: 40, transition: { duration: 0.3 } }}
    >
      {item.link ? (
        <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label={`${item.alt} — megnyitás új lapon`} className="block rounded-2xl">
          {card}
        </a>
      ) : (
        card
      )}
    </motion.div>
  );
}

function Title({
  title,
  titleRef,
  inView,
  className,
}: {
  title: string;
  titleRef: RefObject<HTMLHeadingElement | null>;
  inView: boolean;
  className: string;
}) {
  const lines = title.split("\n");
  return (
    <motion.h2
      ref={titleRef}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7 }}
      className={`section-title text-4xl leading-[0.92] text-black sm:text-6xl ${className}`}
    >
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </motion.h2>
  );
}

export default function News({ news }: { news: NewsContent }) {
  const mobile = useIsMobile();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const inView = useInView(titleRef, { once: true, margin: "-80px" });
  const items = news.items.slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section id="hirek" className="relative z-30 overflow-x-clip px-4 py-16 sm:py-24">
      {dots.map((d, i) => (
        <HalftoneDots
          key={i}
          size={d.size}
          zIndex={0}
          className={d.hideOnMobile ? "hidden md:block" : ""}
          style={{ top: d.top, left: "left" in d ? d.left : undefined, right: "right" in d ? d.right : undefined }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-7xl md:min-h-[640px]">
        {/* Cím — mobilon felül */}
        {mobile && <Title title={news.title} titleRef={titleRef} inView={inView} className="mb-8" />}

        <div className={mobile ? "flex flex-col items-center gap-8" : "flex items-start justify-center gap-3 pt-2 sm:gap-6"}>
          {items.map((item, i) => (
            <EventCard key={`${item.imagePath}-${i}`} item={item} index={i} mobile={mobile} />
          ))}
        </div>

        {/* Cím — desktopon balra lent */}
        {!mobile && <Title title={news.title} titleRef={titleRef} inView={inView} className="absolute bottom-2 left-1 sm:left-4" />}
      </div>
    </section>
  );
}
