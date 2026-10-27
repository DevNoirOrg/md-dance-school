"use client";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import type { PricesContent } from "@/lib/content-types";

/* Áraink — a jelentkezési űrlap mellett (főoldal és /orarend oldal). Az adminban szerkeszthető. */
export default function Arak({ prices }: { prices: PricesContent }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.aside
      ref={ref}
      id="arak"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="relative rounded-[2.5rem] bg-md-cyan px-6 pb-8 pt-16 shadow-2xl sm:px-8 sm:pt-20"
    >
      {/* Cím — kilóg a kártya tetejéből, türkiz körvonallal (a kártya színe) */}
      <h2
        className="section-title absolute left-6 text-4xl leading-none sm:left-8 sm:text-5xl"
        style={{ top: "-0.5em", color: "#000", WebkitTextStroke: "7px #40CFD5", paintOrder: "stroke" }}
      >
        ÁRAINK
      </h2>

      <ul className="divide-y divide-black/10">
        {prices.items.map((p, i) => (
          <li key={i} className="flex items-baseline justify-between gap-4 py-3.5">
            <span className="text-[15px] font-semibold text-black">
              {p.name}
              {p.note && <span className="ml-0.5 text-black/50">{p.note}</span>}
            </span>
            <span className="whitespace-nowrap text-[15px] font-extrabold text-black">{p.price}</span>
          </li>
        ))}
      </ul>

      {prices.notes.length > 0 && (
        <div className="mt-6 space-y-2 rounded-2xl bg-white/45 p-4 text-[13px] leading-relaxed text-black/75">
          {prices.notes.map((n, i) => (
            <p key={i}>
              {n.mark && <strong className="text-black">{n.mark}</strong>} {n.text}
            </p>
          ))}
        </div>
      )}
    </motion.aside>
  );
}
