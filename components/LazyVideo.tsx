"use client";

import { useEffect, useRef, useState } from "react";

/*
  Háttérvideó, ami csak akkor töltődik le, ha a képernyőre ér (addig a poszterkép látszik).
  Adatforgalom-takarékos módban, nagyon lassú (2G) netnél és „kevesebb mozgás” beállításnál
  egyáltalán nem töltődik le — ilyenkor csak a poszter látszik. Így a Supabase forgalma is kisebb.
*/
type Connection = { saveData?: boolean; effectiveType?: string };

export default function LazyVideo({ src, poster, className }: { src: string; poster?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setActive(true);
      observer.disconnect();
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={active ? src : undefined}
      poster={poster}
      autoPlay={active}
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
