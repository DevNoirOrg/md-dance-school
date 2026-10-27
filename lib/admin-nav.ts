/** Az admin menüpontjai (a sorrend a menü sorrendje). `section`: az edit_log kulcsa (Áttekintés). */
export const adminNav = [
  { href: "/admin", label: "Áttekintés" },
  { href: "/admin/jelentkezesek", label: "Jelentkezések" },
  { href: "/admin/orarend", label: "Órarend", section: "schedule" },
  { href: "/admin/tanfolyamok", label: "Tanfolyamok", section: "courses" },
  { href: "/admin/arak", label: "Árak", section: "prices" },
  { href: "/admin/tanarok", label: "Tanárok", section: "teachers" },
  { href: "/admin/hirek", label: "Hírek", section: "news" },
  { href: "/admin/szovegek", label: "Hero · Rólunk · Szolgáltatások", section: "texts" },
  { href: "/admin/tanctabor", label: "Tánctábor", section: "camp" },
  { href: "/admin/urlap", label: "Űrlap opciók", section: "form_options" },
  { href: "/admin/lablec", label: "Lábléc", section: "footer" },
  { href: "/admin/adatkezeles", label: "Adatkezelés", section: "privacy" },
  { href: "/admin/adminok", label: "Adminok" },
] as const;
