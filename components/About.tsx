"use client";
import { motion } from "motion/react";
import FadeIn from "./FadeIn";
import HalftoneDots from "./HalftoneDots";
import InstaCard from "./InstaCard";
import type { AboutContent } from "@/lib/content-types";
import { mediaUrl } from "@/lib/format";

export const paragraphsOf = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export default function About({ about }: { about: AboutContent }) {
  const paragraphs = paragraphsOf(about.paragraphs);
  return (
    <section id="rolunk" className="relative z-10">
      <HalftoneDots className="hidden md:block" size={300} style={{ top: -40, right: -170 }} zIndex={-1} />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 lg:gap-16">
          {/* Szöveg */}
          <div>
            <FadeIn distance={30} margin="-80px">
              <h2 className="section-title mb-6 text-5xl text-md-black sm:text-6xl">
                {about.titleLine1}
                {about.titleLine2 && (
                  <>
                    <br />
                    {about.titleLine2}
                  </>
                )}
              </h2>
            </FadeIn>
            {paragraphs.map((p, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.05} distance={30} margin="-80px">
                <p className={`text-base leading-relaxed text-md-black ${i < paragraphs.length - 1 ? "mb-4" : ""}`}>{p}</p>
              </FadeIn>
            ))}
          </div>

          {/* Instagram-kártya a csoportképpel */}
          <FadeIn
            delay={0.1}
            direction="left"
            distance={30}
            margin="-80px"
            className="flex justify-center md:justify-end md:pr-10 lg:pr-20"
          >
            <motion.div
              className="relative w-full"
              style={{ maxWidth: 380 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
            >
              <HalftoneDots style={{ bottom: -55, right: -55 }} zIndex={-1} size={170} />
              <InstaCard src={mediaUrl(about.imagePath)} alt={about.imageAlt} width={380} />
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
