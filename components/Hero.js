"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import HalftoneDots from "@/components/HalftoneDots";

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: 600,
        overflow: "visible",
        background: "#000",
      }}
    >
      {/* ── Háttérkép ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/canva/hero-crowd.jpg)",
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
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* ── Alsó fehér gradient — a fehér About szekcióba olvad ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background:
            "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* ── Halftone dot pattern — bal alsó sarok, kisebb, alig lóg ki ── */}
      <HalftoneDots size={260} style={{ bottom: -30, left: -20 }} />

      {/* ── WELCOME TO MD — fő cím, alulról csúszik be ── */}
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
          transition={{
            duration: 0.85,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
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
          WELCOME TO MD
        </motion.h1>
      </div>
    </section>
  );
}
