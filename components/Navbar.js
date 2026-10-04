"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { label: "Kezdőlap", href: "#hero" },
  { label: "Tánctábor", href: "#tancabor" },
  { label: "Órarend", href: "#orarend" },
  { label: "Szolgáltatások", href: "#szolgaltatasok" },
  { label: "Studió bérlés", href: "#studio" },
  { label: "Elérhetőség", href: "#elerhetoseg" },
];

const NAV_OFFSET = 104;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHref, setActiveHref] = useState(navLinks[0].href);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.querySelector(link.href))
      .filter(Boolean);

    function onScroll() {
      const scrollPos = window.scrollY + NAV_OFFSET + 1;
      let current = navLinks[0].href;
      for (const section of sections) {
        if (section.offsetTop <= scrollPos) {
          current = `#${section.id}`;
        }
      }
      setActiveHref(current);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setActiveHref(href);
    setMobileOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 104,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/*
          Fade: külön, abszolút pozicionált réteg, ami a navbarnál
          magasabb (alánk is belóg), nem kattintható (pointer-events: none),
          és a nav tartalma (logó, linkek) mögött, de a lap háttere előtt van.
        */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 160,
            zIndex: -1,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, transparent 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 1366,
            margin: "0 auto",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Logo - balra igazítva, a középre igazított menün kívül */}
          <a
            href="#hero"
            style={{
              textDecoration: "none",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Image
              src="/canva/logo-md-black-trim.png"
              alt="MD Dance School"
              width={273}
              height={219}
              priority
              style={{ height: 80, width: "auto", objectFit: "contain" }}
            />
          </a>

          {/* Desktop nav links - a navbar közepén, a logótól függetlenül */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              gap: 0,
            }}
            className="hidden-mobile"
          >
            {navLinks.map((link) => {
              const isActive = activeHref === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: isActive ? "#ffffff" : "#111111",
                    textDecoration: "none",
                    padding: "0 28px",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                    transition: "color 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#111111";
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menü"
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#111111",
              marginLeft: "auto",
              padding: 8,
            }}
            className="show-mobile"
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "fixed",
              top: 104,
              left: 0,
              right: 0,
              zIndex: 49,
              background: "rgba(0,0,0,0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            {navLinks.map((link, i) => {
              const isActive = activeHref === link.href;
              return (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={(e) => handleNavClick(e, link.href)}
                  style={{
                    display: "block",
                    padding: "14px 32px",
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: isActive ? "#40CFD5" : "#fff",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {link.label}
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
