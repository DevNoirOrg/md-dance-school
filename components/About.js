"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import InstaCard from "./InstaCard";
import HalftoneDots from "./HalftoneDots";

function FadeIn({ children, delay = 0, direction = "up", className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 30 : direction === "down" ? -30 : 0,
      x: direction === "left" ? 30 : direction === "right" ? -30 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  return (
    <section id="rolunk" className="relative z-10">
      <HalftoneDots className="hidden md:block" size={300} style={{ top: -40, right: -170 }} zIndex={-1} />

      <div className="py-20 sm:py-28 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Szöveg */}
          <div>
            <FadeIn delay={0}>
              <h2 className="section-title text-5xl sm:text-6xl mb-6 text-md-black">
                A MASTER DANCE
                <br />
                TÁNCISKOLA
              </h2>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="text-md-black text-base leading-relaxed mb-4">
                A tánctanítás több szinten folyik nálunk. Kezdőtől középhaladóig
                minden csoport elérhető. Tanáraink profin és elhivatottan adják
                át tudásukat diákjainknak.
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="text-md-black text-base leading-relaxed mb-4">
                Master Dance az egyik legnépszerűbb tánciskola a belvárosban.
                Tánctanfolyamaink elérhetők gyerekeknek, tinédzsereknek és
                felnőtteknek egyaránt, angol és magyar nyelven is. Mindegy, hogy
                kezdő vagy haladóbb szinten szeretnél táncolni, nálunk minden
                csoportban minőségi táncoktatás folyik. Budapesten két tánc
                stúdióval rendelkezünk, igényes, jól felszerelt tánctermekkel.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-md-black text-base leading-relaxed">
                Ha egy igazán jó közösségben szeretnél táncolni, profi és
                őszinte elhivatottsággal oktató tanároktól szeretnél tanulni,
                akkor biztos, hogy nálunk a helyed.
              </p>
            </FadeIn>
          </div>

          {/* Instagram-kártya a valódi csoportképpel */}
          <FadeIn
            delay={0.1}
            direction="left"
            className="flex justify-center md:justify-end"
          >
            <motion.div
              className="relative w-full"
              style={{ maxWidth: 380 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
            >
              <HalftoneDots
                style={{ bottom: -55, right: -55 }}
                zIndex={-1}
                size={170}
              />
              <InstaCard
                src="/canva/about-group.jpg"
                alt="Master Dance csoportos tánc előadás"
                width={380}
              />
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
