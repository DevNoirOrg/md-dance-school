"use client";
import { motion } from "motion/react";
import HalftoneDots from "@/components/HalftoneDots";
import type { HeroContent } from "@/lib/content-types";
import { mediaUrl } from "@/lib/format";

export default function Hero({ hero }: { hero: HeroContent }) {
  return (
    <section
      id="hero"
      style={{ position: "relative", width: "100%", height: "100vh", minHeight: 600, overflow: "visible", background: "#000" }}
    >
      {/* ── Háttérkép ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${mediaUrl(hero.imagePath)})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* ── Felső fekete gradient (navbar area) ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 180,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* ── Alsó fehér gradient — a fehér Rólunk szekcióba olvad ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* ── Halftone pöttyök — bal alsó sarok ── */}
      <HalftoneDots size={260} style={{ bottom: -60, left: -100 }} />

      {/* ── Fő cím, alulról csúszik be ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 4vw",
          zIndex: 10,
        }}
      >
        <motion.h1
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontWeight: 400,
            fontSize: "clamp(32px, 10.8vw, 172px)",
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
            lineHeight: 0.9,
            margin: 0,
            padding: 0,
            textAlign: "center",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {hero.title}
        </motion.h1>
      </div>

      {/* ── Bemutatkozó mondat — a cím alatti rész kb. felénél, a színpadon ── */}
      {hero.lead && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "calc(75% + 100px)",
            transform: "translateY(-50%)",
            display: "flex",
            justifyContent: "center",
            padding: "0 6vw",
            zIndex: 10,
          }}
        >
          <motion.p
            className="lg:whitespace-nowrap"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              margin: 0,
              textAlign: "center",
              color: "#000000",
              fontWeight: 600,
              fontSize: "clamp(14px, 1.35vw, 22px)",
              lineHeight: 1.45,
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              borderRadius: 24,
              padding: "12px 28px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
            }}
          >
            {hero.lead}
          </motion.p>
        </div>
      )}
    </section>
  );
}
