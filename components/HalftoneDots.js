"use client";
import { motion } from "framer-motion";

export default function HalftoneDots({
  size = 420,
  scaleAmount = 1.03,
  scaleDuration = 7,
  fadeDuration = 4,
  zIndex = 3,
  className = "",
  style = {},
}) {
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
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/dots-black.png)",
          backgroundSize: "contain",
          backgroundPosition: "bottom left",
          backgroundRepeat: "no-repeat",
        }}
      />
      <motion.div
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: fadeDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/dots-cyan.png)",
          backgroundSize: "contain",
          backgroundPosition: "bottom left",
          backgroundRepeat: "no-repeat",
        }}
      />
    </motion.div>
  );
}
