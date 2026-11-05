"use client";

import { usePathname } from "next/navigation";
import { alternateLocalePath, t, type Locale } from "@/lib/i18n";

export default function LanguageSwitch({
  locale,
  alternateHref,
  className = "",
  variant = "dark",
}: {
  locale: Locale;
  alternateHref?: string;
  className?: string;
  /** "dark" (alapértelmezett): a szín a szülőtől öröklődik (text-current) — világos hátteren. "light": fehér/türkiz, sötét hátteren (pl. mobil menü). */
  variant?: "dark" | "light";
}) {
  const pathname = usePathname();
  const href = alternateHref ?? alternateLocalePath(pathname, locale);
  const active = variant === "light" ? "text-md-cyan" : "text-current";
  const idle = variant === "light" ? "text-white/55 hover:text-white" : "text-current/55 hover:text-current";
  return (
    <span role="group" aria-label={t(locale).switchLabel} className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.2em] ${className}`}>
      <a href={locale === "hu" ? undefined : href} lang="hu" hrefLang="hu" aria-current={locale === "hu" ? "true" : undefined}
        className={`${locale === "hu" ? active : idle} transition-colors`} title={t("hu").langName}>HU</a>
      <span aria-hidden="true" className="opacity-40">·</span>
      <a href={locale === "en" ? undefined : href} lang="en" hrefLang="en" aria-current={locale === "en" ? "true" : undefined}
        className={`${locale === "en" ? active : idle} transition-colors`} title={t("en").langName}>EN</a>
    </span>
  );
}
