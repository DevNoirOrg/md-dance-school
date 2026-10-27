"use client";
import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";

/** Görgetésre egyszer beúszó blokk (a szekciókban közös). */
export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  distance = 24,
  margin = "-60px",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  margin?: `${number}px`;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin });
  const hidden = {
    opacity: 0,
    y: direction === "up" ? distance : direction === "down" ? -distance : 0,
    x: direction === "left" ? distance : direction === "right" ? -distance : 0,
  };
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={hidden}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : hidden}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
