"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, UserRound, UsersRound, Users } from "lucide-react";
import Navbar from "@/components/Navbar";

const lessonTypes = [
  {
    id: "privat",
    title: "Privát óra",
    capacity: "3 fő",
    description: "Egyéni óra vagy személyre szabott gyakorlás.",
    Icon: UserRound,
  },
  {
    id: "kiscsoportos",
    title: "Kiscsoportos óra",
    capacity: "18 fő",
    description: "Közös tánc kisebb létszámú csoporttal.",
    Icon: UsersRound,
  },
  {
    id: "csoportos",
    title: "Csoportos óra",
    capacity: "36 fő",
    description: "Táncóra nagyobb csoport számára.",
    Icon: Users,
  },
];

export default function StudioBerlesPage() {
  const [selectedType, setSelectedType] = useState(null);

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Navbar />
      <section
        className="relative flex min-h-[390px] items-center justify-center overflow-hidden bg-black px-5 pb-12 pt-32 text-center sm:min-h-[440px] sm:pt-36"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(0,0,0,0.76), rgba(0,0,0,0.48)), url('/canva/hero-crowd.jpg')",
          backgroundPosition: "center 42%",
          backgroundSize: "cover",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f7f7f7] to-transparent"
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="relative z-10 max-w-4xl"
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#40CFD5] sm:text-sm">
            MD Dance School
          </p>
          <h1 className="section-title text-5xl text-white sm:text-7xl md:text-8xl">
            STÚDIÓ BÉRLÉS
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
            Válaszd ki, milyen létszámú órát szeretnél tartani a stúdióban.
          </p>
        </motion.div>
      </section>

      <section className="relative px-4 pb-20 sm:px-6 sm:pb-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-16 h-40 w-40 opacity-[0.12] sm:left-8"
          style={{
            backgroundImage:
              "radial-gradient(circle, #000 1.5px, transparent 1.5px)",
            backgroundSize: "13px 13px",
          }}
        />

        <div className="relative mx-auto -mt-10 max-w-6xl sm:-mt-14">
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="section-title text-4xl text-black sm:text-5xl">
              Milyen órát tartanál?
            </h2>
            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Válassz egyet a három óratípus közül.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {lessonTypes.map(({ id, title, capacity, description, Icon }, index) => {
              const selected = selectedType === id;

              return (
                <motion.button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedType(id)}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative flex min-h-[250px] flex-col items-center rounded-3xl border-2 px-6 py-8 text-center shadow-[0_8px_28px_rgba(0,0,0,0.07)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#40CFD5]/40 ${
                    selected
                      ? "border-[#40CFD5] bg-[#40CFD5]/10"
                      : "border-white bg-white hover:border-[#40CFD5]"
                  }`}
                >
                  <span
                    className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
                      selected ? "bg-[#40CFD5] text-black" : "bg-black text-white"
                    }`}
                  >
                    <Icon size={32} strokeWidth={1.8} aria-hidden="true" />
                  </span>

                  <span className="text-xl font-extrabold text-black sm:text-2xl">
                    {title}
                  </span>
                  <span className="mt-2 font-bold text-[#179da3]">Max. {capacity}</span>
                  <span className="mt-3 max-w-xs text-sm leading-relaxed text-gray-600">
                    {description}
                  </span>

                  {selected && (
                    <span
                      aria-label="Kiválasztva"
                      className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#40CFD5] text-black"
                    >
                      <Check size={17} strokeWidth={3} />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
