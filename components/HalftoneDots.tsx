"use client";
import { motion } from "motion/react";
import type { CSSProperties } from "react";

/** Animált (lélegző, fekete ↔ türkiz) halftone pöttyfolt — a design visszatérő díszítőeleme. */
export default function HalftoneDots({
  size = 420,
  scaleAmount = 1.03,
  scaleDuration = 7,
  fadeDuration = 4,
  zIndex = 3,
  className = "",
  style = {},
}: {
  size?: number;
  scaleAmount?: number;
  scaleDuration?: number;
  fadeDuration?: number;
  zIndex?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const layer: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundSize: "contain",
    backgroundPosition: "bottom left",
    backgroundRepeat: "no-repeat",
  };
  return (
    <motion.div
      className={className}
      animate={{ scale: [1, scaleAmount, 1] }}
      transition={{ duration: scaleDuration, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        width: size,
        height: size,
        zIndex,
        pointerEvents: "none",
        transformOrigin: "center",
        ...style,
      }}
    >
      <motion.div
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: fadeDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ ...layer, backgroundImage: "url(/dots-black.png)" }}
      />
      <motion.div
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: fadeDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ ...layer, backgroundImage: "url(/dots-cyan.png)" }}
      />
    </motion.div>
  );
}
