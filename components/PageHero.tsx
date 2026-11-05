"use client";
import { motion } from "motion/react";
import HalftoneDots from "./HalftoneDots";
import LanguageSwitch from "./LanguageSwitch";
import type { Locale } from "@/lib/i18n";

/** Aloldalak fekete, fotós fejléce (Órarend, Szolgáltatások). */
export default function PageHero({
  title,
  lead,
  image,
  position = "center",
  dots = false,
  overlay = "linear-gradient(0deg, rgba(0,0,0,0.76), rgba(0,0,0,0.48))",
  className = "min-h-[380px] pb-20 sm:min-h-[420px]",
  locale = "hu",
}: {
  title: string;
  lead?: string;
  image: string;
  position?: string;
  dots?: boolean;
  overlay?: string;
  className?: string;
  locale?: Locale;
}) {
  return (
    <section
      className={`relative flex items-center justify-center bg-black px-5 pt-32 text-center sm:pt-36 ${className}`}
      style={{ backgroundImage: `${overlay}, url('${image}')`, backgroundPosition: position, backgroundSize: "cover", overflowX: "clip" }}
    >
      <div className="absolute right-5 top-6 z-20 rounded-full bg-black/35 px-4 py-2 text-white backdrop-blur-sm sm:right-8 sm:top-8">
        <LanguageSwitch locale={locale} />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />
      {dots && <HalftoneDots size={240} zIndex={1} style={{ bottom: -70, left: -90 }} />}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        className="relative z-10 max-w-4xl"
      >
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-md-cyan sm:text-sm">MD Dance School</p>
        <h1 className="section-title text-5xl text-white sm:text-7xl md:text-8xl">{title}</h1>
        {lead && <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">{lead}</p>}
      </motion.div>
    </section>
  );
}
