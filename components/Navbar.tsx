"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import LanguageSwitch from "./LanguageSwitch";
import { t, type Locale } from "@/lib/i18n";

// A stúdióbérlés ugyanezen a domainen, a /studio-berles alatt fut (a külön bérlés app szolgálja ki, lásd next.config.ts).
const STUDIO_RENTAL_URL = "/studio-berles";

const NAV_OFFSET = 104;

export default function Navbar({ locale = "hu", alternateHref }: { locale?: Locale; alternateHref?: string }) {
  const labels = t(locale).nav;
  const home = locale === "en" ? "/en" : "/";
  const navLinks = useMemo(() => [
    { label: labels.home, href: "#hero" },
    { label: labels.camp, href: locale === "en" ? "/en/camp" : "/tanctabor" },
    { label: labels.schedule, href: locale === "en" ? "/en/schedule" : "/orarend" },
    { label: labels.services, href: locale === "en" ? "/en/services" : "/szolgaltatasok" },
    { label: labels.studio, href: STUDIO_RENTAL_URL },
    { label: labels.news, href: locale === "en" ? "/en/news" : "/hirek" },
    { label: labels.contact, href: "#elerhetoseg" },
  ], [labels, locale]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollHref, setScrollHref] = useState(navLinks[0].href);
  const pathname = usePathname();
  const router = useRouter();
  // Aloldalon az útvonal szerinti menüpont aktív, a főoldalon a görgetés szerinti szekció.
  const activeHref =
    pathname === home ? scrollHref : navLinks.some((link) => link.href === pathname) ? pathname : "";

  useEffect(() => {
    if (pathname !== home) return;
    const sections = navLinks
      .filter((link) => link.href.startsWith("#"))
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((el): el is HTMLElement => !!el);

    function onScroll() {
      const scrollPos = window.scrollY + NAV_OFFSET + 1;
      let current = navLinks[0].href;
      for (const section of sections) {
        if (section.offsetTop <= scrollPos) current = `#${section.id}`;
      }
      setScrollHref(current);
    }

    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname, home, navLinks]);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/") || /^https?:\/\//.test(href)) {
      setMobileOpen(false);
      return;
    }

    e.preventDefault();
    if (pathname !== "/") {
      router.push(`${home}${href}`);
      setMobileOpen(false);
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setScrollHref(href);
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
          Fade: külön, abszolút pozicionált réteg, pontosan a fejléc
          magasságában, nem kattintható (pointer-events: none),
          és a nav tartalma (logó, linkek) mögött, de a lap háttere előtt van.
          Diszkrét blur is van rajta, ami lefelé a fade-del együtt elhalványul.
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
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            maskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 55%, transparent 100%)",
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
            href={pathname === home ? "#hero" : `${home}#hero`}
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
              const href =
                pathname !== home && link.href.startsWith("#")
                  ? `${home}${link.href}`
                  : link.href;
              return (
                <a
                  key={link.href}
                  href={href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    // Aktív menüpont: türkiz (primary) szöveg
                    color: isActive ? "#40CFD5" : "#111111",
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

          <div className="absolute right-20 top-1/2 -translate-y-1/2 text-black md:right-8">
            <LanguageSwitch locale={locale} alternateHref={alternateHref} />
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={locale === "en" ? "Menu" : "Menü"}
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
              const href =
                pathname !== home && link.href.startsWith("#")
                  ? `${home}${link.href}`
                  : link.href;
              return (
                <motion.a
                  key={link.href}
                  href={href}
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
