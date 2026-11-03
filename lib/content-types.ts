/*
  A szerkeszthető tartalom típusai. Az adatbázisban (mdschool séma) élnek,
  az admin felületen szerkeszthetők. Ha nincs adatbázis beállítva (pl. helyi
  fejlesztés), a lib/defaults.ts alapértékei jelennek meg.
*/

export type Mark = "" | "*" | "**";

export type HeroContent = {
  /** A nagy, Anton betűs cím (pl. „WELCOME TO MD”). */
  title: string;
  /** A cím alatti, fehér dobozos bemutatkozó mondat. */
  lead: string;
  /** Háttérkép: "/canva/hero-crowd.jpg" (public mappa) vagy Storage útvonal. */
  imagePath: string;
};

export type AboutContent = {
  titleLine1: string;
  titleLine2: string;
  /** Bekezdések, üres sorral elválasztva. */
  paragraphs: string;
  imagePath: string;
  imageAlt: string;
};

export type ServicesContent = {
  heroTitle: string;
  heroLead: string;
  kicker: string;
  title: string;
  text: string;
  highlights: string[];
  /** Az MD Dance Company oldal címe. */
  url: string;
  buttonLabel: string;
};

export type PriceItem = { name: string; price: string; note: Mark };
export type PriceNote = { mark: Mark; text: string };
export type PricesContent = { items: PriceItem[]; notes: PriceNote[] };

export type CoursesContent = {
  heroTitle: string;
  heroLead: string;
  title: string;
  intro: string;
  steps: { title: string; text: string }[];
  styles: { title: string; text: string; teachers: string[] }[];
};

export type ScheduleSettings = {
  /** Az órarend cím-dobozában lévő kis felirat. */
  hint: string;
};

export type NewsItem = {
  id: string;
  /** A hír saját oldala: /hirek/<slug>. */
  slug: string;
  /** "2026-05-12" */
  publishedOn: string;
  /** Pl. "2026. MÁJ 12" — a publishedOn-ból számolva. */
  dateLabel: string;
  /** A hírkártyán megjelenő kép leírása (nem a cikk címe — a poszter-kártya csak a képet mutatja). */
  imageAlt: string;
  /** Ha nincs kép, ez a felirat látszik a szürke dobozban. */
  placeholderLabel: string;
  imagePath: string | null;
  /** Képarány: "landscape" = 16:9, "portrait" = 4:5. */
  format: "landscape" | "portrait";
  /** A hír oldalának címe. */
  title: string;
  /** Rövid szöveg a hír oldalán, a cím alatt. */
  excerpt: string;
  /** A hír teljes szövege (szerveroldalon megtisztított HTML). */
  bodyHtml: string;
};
/** A hírek szekció címe a főoldalon (a hírek listája már a mdschool.news táblából jön). */
export type NewsContent = { title: string };

export type CampPrice = { emoji: string; name: string; price: string; until: string };
export type CampTurnus = { id: string; label: string; dates: string; days: string; closed: boolean; status: string };
export type CampContent = {
  badge: string;
  title: string;
  lead: string;
  sub: string;
  /** Álló (9:16) reel videó a fejlécben (Storage útvonal vagy "/..."), null = helyőrző. */
  reelPath: string | null;
  prices: CampPrice[];
  priceIncludes: string;
  priceExcludes: string;
  turnusok: CampTurnus[];
  /** Befizetési módok — egy sor = egy pont (a sor eleji „Cím:” rész félkövér). */
  paymentMethods: string[];
  meetingText: string;
  meetingTime: string;
  endText: string;
  locationName: string;
  locationAddress: string;
  importantText: string;
  applyText: string;
  /** A tábor tanárai — a Tanárok listából, név szerint. */
  teachers: string[];
  teacherRole: string;
  form: {
    shirtSizes: string[];
    payments: string[];
    sources: string[];
    fillers: string[];
  };
};

export type SocialLink = { label: "Instagram" | "Facebook" | "YouTube" | "TikTok"; href: string };
export type FooterContent = {
  email: string;
  phone: string;
  addressLabel: string;
  address: string;
  socials: SocialLink[];
};

export type FormOptions = {
  /** „Táncoltál már korábban?” */
  experience: string[];
  /** „Mikortól kezdenél?” */
  start: string[];
};

export type PrivacyContent = { text: string };

export type SettingsMap = {
  hero: HeroContent;
  about: AboutContent;
  services: ServicesContent;
  prices: PricesContent;
  courses: CoursesContent;
  schedule: ScheduleSettings;
  news: NewsContent;
  camp: CampContent;
  footer: FooterContent;
  form_options: FormOptions;
  privacy: PrivacyContent;
};
export type SettingsKey = keyof SettingsMap;

export type ClassItem = {
  id: string;
  time: string;
  title: string;
  /** Rövid felirat a kiválasztás-chipen (pl. „Nagy · Hétfő – Szerda 18:30”). */
  chip: string;
  /** A jelentkezésbe kerülő teljes leírás. */
  full: string;
};

export type Room = {
  id: string;
  name: string;
  shortName: string;
  /** 1–4 oszlop (pl. „Hétfő - Szerda”), mindegyikben az órák. */
  columns: { heading: string; classes: ClassItem[] }[];
};

export type Teacher = {
  id: string;
  name: string;
  style: string;
  imagePath: string;
  /** Instagram-videó linkje (a kártyára kattintva nyílik meg). */
  videoUrl: string;
};
