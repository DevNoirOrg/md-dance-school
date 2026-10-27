"use client";
import { motion } from "motion/react";
import HalftoneDots from "./HalftoneDots";

/** Aloldalak fekete, fotós fejléce (Órarend, Szolgáltatások). */
export default function PageHero({
  title,
  lead,
  image,
  position = "center",
  dots = false,
  overlay = "linear-gradient(0deg, rgba(0,0,0,0.76), rgba(0,0,0,0.48))",
  className = "min-h-[380px] pb-20 sm:min-h-[420px]",
}: {
  title: string;
  lead?: string;
  image: string;
  position?: string;
  dots?: boolean;
  overlay?: string;
  className?: string;
}) {
  return (
    <section
      className={`relative flex items-center justify-center bg-black px-5 pt-32 text-center sm:pt-36 ${className}`}
      style={{ backgroundImage: `${overlay}, url('${image}')`, backgroundPosition: position, backgroundSize: "cover", overflowX: "clip" }}
    >
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
