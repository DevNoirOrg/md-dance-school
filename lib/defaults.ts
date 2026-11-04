import type { DeepPartial, NewsItem, SettingsMap, Teacher } from "./content-types";
import { defaultPrivacyText } from "./privacy-default.ts";

/*
  A tartalom kezdeti értékei — pontosan az, ami az admin előtt a kódban volt.
  Két helyen használjuk:
    1) ha nincs DATABASE_URL (helyi fejlesztés adatbázis nélkül), ez jelenik meg;
    2) ebből készül a supabase/mdschool-seed.sql (npm run seed:sql).
  Az éles oldal tartalmát az adminban kell szerkeszteni, nem itt.
*/

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const defaultSettings: SettingsMap = {
  hero: {
    title: "WELCOME TO MD",
    lead: "Számunkra a street dance több mint mozgás. Kultúra, zene, közösség és önkifejezés. Hiszünk az autentikus oktatásban, valamint a táncosok szakmai és emberi fejlődésében.",
    imagePath: "/canva/hero-crowd.jpg",
  },
  about: {
    titleLine1: "AZ MD ÉLETÉRZÉS",
    titleLine2: "",
    paragraphs: [
      "Az MD-ben hiszünk abban, hogy a tánc nemcsak a mozdulatokról szól, hanem a mögöttük rejlő kultúráról, értékekről és az önkifejezés szabadságáról is.",
      "Tánciskolánk célja a street dance stílusok autentikus oktatása, a biztos technikai alapok átadása és a tehetségek tudatos fejlesztése. Fontos számunkra, hogy tanítványaink ne csak táncosként, hanem emberként is fejlődjenek: önbizalmat, kitartást, kreativitást és egymás iránti tiszteletet tanuljanak.",
      "Az MD azonban több mint egy tánciskola. Az MD Dance Studio bérelhető tánctermeivel biztosít helyszínt táncórákhoz, próbákhoz, workshopokhoz és kreatív projektekhez, míg az MD Dance Company professzionális fellépésekkel, koreográfiákkal és táncos produkciókkal képviseli a márkát.",
      "Együtt egy olyan közösséget építünk, ahol a tudás, a szenvedély és a fejlődés találkozik.",
      "Együtt tanulunk. Együtt fejlődünk. Együtt alkotunk.",
    ].join("\n\n"),
    imagePath: "/canva/about-group.jpg",
    imageAlt: "Master Dance csoportos tánc előadás",
  },
  services: {
    heroTitle: "SZOLGÁLTATÁSOK",
    heroLead: "Show, koreográfia és produkció — rendezvényekre, színpadra és kamera elé.",
    kicker: "",
    title: "Ismerd meg az MD professzionális világát!",
    text: "Az MD Dance Company a tánciskolán túlmutató, professzionális produkcióink otthona. Egyedi koreográfiákkal, látványos show-műsorokkal és színpadi produkciókkal tesszük emlékezetessé a sporteseményeket, koncerteket és márkák rendezvényeit.\n\nVan egy ötleted vagy projekted? Örömmel dolgozunk együtt veled! Keress minket elképzeléseiddel, és keltsük közösen életre az ötleteidet!",
    highlights: [],
    url: "https://www.mddancecompany.com/",
    buttonLabel: "Fedezd fel az MD Dance Company-t!",
  },
  prices: {
    items: [
      { name: "Órajegy", price: "4 000 Ft", note: "" },
      { name: "Havi bérlet — 1 csoport", price: "20 000 Ft", note: "*" },
      { name: "Havi bérlet — 2 csoport", price: "30 000 Ft", note: "*" },
      { name: "Korlátlan havi bérlet", price: "36 000 Ft", note: "*" },
      { name: "1 pénteki csoport", price: "14 000 Ft", note: "*" },
      { name: "1 csoport + 1 pénteki", price: "26 000 Ft", note: "*" },
      { name: "4 alkalmas bérlet", price: "14 000 Ft", note: "**" },
      { name: "8 alkalmas bérlet", price: "22 000 Ft", note: "**" },
    ],
    notes: [
      { mark: "*", text: "A havi bérletek az adott naptári hónapra érvényesek." },
      { mark: "**", text: "A 4 és 8 alkalmas bérlet az aktiválástól számított 30 napon belül használható fel." },
      { mark: "", text: "Fizethetsz készpénzzel, bankkártyával, átutalással vagy az MD appban." },
    ],
  },
  courses: {
    heroTitle: "ÓRAREND ÉS TANFOLYAMOK",
    heroLead: "Válaszd ki az óráidat, ismerd meg a stílusokat, és jelentkezz pár kattintással.",
    title: "TANFOLYAMOK",
    intro:
      "Minden, amit tudnod érdemes, mielőtt beállsz hozzánk: mire számíts, milyen stílusokat tanítunk, és melyik csoport illik hozzád.",
    steps: [
      {
        title: "Új vagy nálunk?",
        text: "Nézd meg az órarendet, és válaszd ki a hozzád illő csoportot a szinted, a korod és a kedvenc stílusod alapján. Jelentkezés után e-mailben visszaigazoljuk, mikor jöhetsz az első órádra. Ha egy csoport épp betelt, segítünk másik időpontot találni, vagy felírunk a várólistára.",
      },
      {
        title: "Az első órád",
        text: "Hozz váltócipőt, kényelmes ruhát, amiben szabadon mozogsz, és egy üveg vizet — egy törölköző is jól jöhet. És ami a legfontosabb: legyél türelmes magaddal. Mindenki kezdte valahol, nálunk senki nem méreget, csak bulizunk és tanulunk együtt.",
      },
      {
        title: "Így fejlődsz",
        text: "A titok a rendszeresség. Ha kitartóan jársz, pár hónap alatt magad is észreveszed a változást a koordinációdban, a ritmusérzékedben és a magabiztosságodban. Lesznek könnyebb és nehezebb órák — ez így van rendjén. Ne másokhoz mérd magad, hanem a tegnapi önmagadhoz, és ha elakadsz, kérj visszajelzést a tanárodtól.",
      },
    ],
    styles: [
      {
        title: "Koreográfia",
        text: "Nem egy stílus, hanem egy élmény: a tanár saját mozgásvilágából épülő koreográfiák, mindig más zenére. Hip-hop, utcai táncok és sok más hatás keveredik benne — bemelegítés és technika után minden órán egy teljes koreót raksz össze.",
        teachers: ["Lili"],
      },
      {
        title: "Hip-hop",
        text: "A hip-hop alapja a groove, a bounce, a ritmus és a klasszikus lépések elsajátítása. Az órákon alapgyakorlatok, különböző rutinok és freestyle feladatok segítségével fejlesztjük a technikát, a zeneiséget és az egyéni mozgásvilágot. A tanultakat koreográfiákban is alkalmazzuk, miközben teret adunk a kreativitásnak és az önkifejezésnek.",
        teachers: ["Dalma", "Alex"],
      },
      {
        title: "Girly",
        text: "Csajos, energikus és látványos koreográfiák, amelyek a nőies mozdulatokra, a magabiztos kisugárzásra és az előadásmódra épülnek. Az órákon a koreográfiák elsajátítása mellett a mozgáskoordinációt, a zeneiséget és az önkifejezést is fejlesztjük. Nemtől függetlenül mindenkit várunk, aki szeretné felfedezni ezt a stílust!",
        teachers: ["Lili", "Lia"],
      },
      {
        title: "High heels",
        text: "A magassarkúban táncolás a technika, az elegancia és a magabiztos előadásmód találkozása. Az órákon járásgyakorlatokkal, forgásokkal, földelemekkel és különböző mozgástechnikákkal fejlesztjük az egyensúlyt, a testtudatot és a mozgáskontrollt. A tanultakat dinamikus és érzéki koreográfiákban alkalmazzuk, nagy hangsúlyt fektetve az önkifejezésre.",
        teachers: ["Lia"],
      },
      {
        title: "House",
        text: "A klubkultúrából született, energikus és szabad táncstílus, amelynek alapja a zeneiség, a groove és a folyamatos mozgás. Az órákon jacking, footwork, alaplépések és freestyle gyakorlatok segítségével fejlesztjük a ritmusérzéket, a koordinációt és az egyéni mozgásvilágot. A hangsúly a zene megélésén, az improvizáción és a kreatív önkifejezésen van.",
        teachers: ["Alex"],
      },
      {
        title: "Afro Fusion",
        text: "Különböző afrikai táncstílusok és mozgáskultúrák találkozása, tele energiával, ritmussal és lendülettel. Az órákon alaplépések, groove-ok, izolációk és koreográfiák segítségével ismerkedünk a különböző stílusok mozgásvilágával. Nagy hangsúlyt fektetünk a zeneiségre, a testtudatra és a szabad önkifejezésre, miközben megismerjük a mozdulatok kulturális hátterét is.",
        teachers: ["Jayson"],
      },
    ],
  },
  schedule: {
    hint: "Kattints az órákra, amikre jelentkeznél, akár többre is",
  },
  news: {
    title: "HÍREK ÉS\nESEMÉNYEK",
  },
  camp: {
    badge: "MD Dance School · Nyári tábor",
    title: "TÁNCTÁBOR 2026",
    lead: "Négy nap, ami csak a táncról szól: reggeltől estig órák az MD tanáraival, közben strand, wellness, sport és esti programok egy szuper csapattal.",
    sub: "Kezdőként és haladóként is megtalálod a helyed — gyere, és éld át velünk az MD életérzést a Szigetszentmiklósi Oázis Wellness Parkban!",
    reelPath: null,
    prices: [
      { emoji: "🎊", name: "New Year Deal", price: "78 990 Ft", until: "2026. február 28-ig" },
      { emoji: "⚡", name: "Super Early Jegy", price: "81 990 Ft", until: "2026. április 30-ig" },
      { emoji: "⏰", name: "Early Ticket", price: "84 990 Ft", until: "2026. május 31-ig" },
      { emoji: "🎫", name: "Normal Ticket", price: "87 990 Ft", until: "2026. június 30-ig" },
      { emoji: "🚨", name: "Late Ticket", price: "90 990 Ft", until: "2026. július 1-től" },
    ],
    priceIncludes:
      "Az ár tartalmazza a 4 napos, 3 éjszakás szállást, a fürdő és a wellness használatot, a táncórákat, a sportolási lehetőségeket, a napi háromszori étkeztetést és a programokat.",
    priceExcludes: "Az ár nem tartalmazza az útiköltséget és a költőpénzt.",
    turnusok: [
      { id: "I", label: "1. turnus", dates: "2026.07.05–08.", days: "vasárnap–szerda", closed: true, status: "Lezárva" },
      { id: "II", label: "2. turnus", dates: "2026.07.09–12.", days: "csütörtök–vasárnap", closed: false, status: "10 hely még elérhető" },
    ],
    paymentMethods: [
      "Készpénz",
      "Banki átutalás",
      "MD APP: https://md.dancepass.app/workshops",
      "SZÉP kártya: MKB, OTP vagy K&H SZÉP kártyával is van lehetőségetek fizetni. Ebben az esetben az előleget továbbra is készpénzben vagy átutalással kell befizetnetek, a fennmaradó összeget pedig a tábor első napján érkezéskor lehúzzuk a SZÉP kártyáról. Kérjük, ezt a fontos tudnivalókban a jelentkezéskor jelezzétek nekünk!",
      "Oneticket [Hamarosan]",
    ],
    meetingText: "Találkozás a helyszínen az első nap:",
    meetingTime: "14:00–15:00",
    endText:
      "A tábor utolsó napján a program 16:00 órakor ér véget. Igény szerint 19:00 óráig maradhattok strandolni és sportolni.",
    locationName: "Szigetszentmiklós Oázis Wellness Park",
    locationAddress: "2310 Szigetszentmiklós, Tököli út 184.",
    importantText:
      "A tábor limitált férőhelyes, ezért jelentkezési sorrend alapján regisztrálunk. Amennyiben a pénz határidőre vagy néhány nap késés után sem érkezik meg, a jelentkezést kénytelenek vagyunk törölni és a táborfoglalást más érdeklődőnek átadni.",
    applyText:
      "A beérkezett jelentkezéseket e-mail formájában visszaigazoljuk. Ezután értesítjük a jelentkezőket a befizetéssel kapcsolatos pontos információkról.",
    teachers: ["Lili", "Dalma", "Jayson", "Alex", "Oliver"],
    teacherRole: "MD Tánctanár",
    form: {
      shirtSizes: ["S", "M", "L", "XL", "2XL", "3XL"],
      payments: ["Készpénz vagy bankkártya MD-ben", "Banki átutalás", "MD App", "Oneticket", "SZÉP kártya"],
      sources: [
        "Tánciskola diák vagyok",
        "Facebook",
        "Instagram",
        "TikTok",
        "Visszatérő táborlakó",
        "Gyerek-táborkeresőn",
        "Barát vagy rokon",
        "Egyéb",
      ],
      fillers: ["Táborlakó", "Édesanya", "Édesapa", "Gondviselő vagy családtag", "Egyéb"],
    },
  },
  footer: {
    email: "masterdancetanciskola@gmail.com",
    phone: "+36 (30) 633-6682",
    addressLabel: "Astoria Stúdió",
    address:
      "5. Kerület, Semmelweis u. 1-3, – (Astoria metró megállótól 3 percnyi sétára van. MD Dance Stúdió a Magyarok házában a második emeleten van",
    socials: [
      { label: "Instagram", href: "" },
      { label: "Facebook", href: "" },
      { label: "YouTube", href: "" },
    ],
  },
  form_options: {
    experience: ["Nem", "Igen, kezdő szinten", "Igen, 1-2 évet", "Igen, versenyszerűen"],
    start: ["Ma", "Holnap", "Jövő héten", "Jövő hónapban"],
  },
  privacy: { text: defaultPrivacyText },
};

// FIGYELEM: a `videoUrl` linkek még helyőrzők — az adminban cseréld a valódi Insta-videók linkjére.
const INSTA = "https://www.instagram.com/";
export const defaultTeachers: Teacher[] = [
  { id: id(101), name: "Jayson", style: "Afro", imagePath: "/canva/teacher-04-orangejersey.jpg", videoUrl: INSTA },
  { id: id(102), name: "Lili", style: "Koreo, Girly", imagePath: "/canva/teacher-03-redpants.jpg", videoUrl: INSTA },
  { id: id(103), name: "Dalma", style: "Hip-Hop", imagePath: "/canva/teacher-02-soxcap.jpg", videoUrl: INSTA },
  { id: id(104), name: "Alex", style: "Hip-Hop, House", imagePath: "/canva/teacher-01-beanie.jpg", videoUrl: INSTA },
  { id: id(105), name: "Oliver", style: "Hip-Hop", imagePath: "/canva/teacher-05-stool.jpg", videoUrl: INSTA },
];

// Adatbázis nélkül (helyi fejlesztés) ez a 4 helyőrző plakát jelenik meg a főoldalon.
export const defaultNews: NewsItem[] = [
  {
    id: id(301),
    slug: "aaron-quinn-workshop",
    publishedOn: "2026-01-01",
    dateLabel: "2026. JAN 1",
    imageAlt: "Aaron Quinn Workshop",
    placeholderLabel: "Aaron Quinn Workshop",
    imagePath: "/canva/event-aaron-quinn-workshop.jpg",
    format: "landscape",
    title: "Aaron Quinn Workshop",
    excerpt: "",
    bodyHtml: "",
  },
  {
    id: id(302),
    slug: "random-after-party",
    publishedOn: "2026-01-02",
    dateLabel: "2026. JAN 2",
    imageAlt: "(Random) After Party",
    placeholderLabel: "(Random) After Party",
    imagePath: "/canva/event-after-party.png",
    format: "portrait",
    title: "(Random) After Party",
    excerpt: "",
    bodyHtml: "",
  },
  {
    id: id(303),
    slug: "summer-26-camp",
    publishedOn: "2026-01-03",
    dateLabel: "2026. JAN 3",
    imageAlt: "Summer '26 Camp",
    placeholderLabel: "Summer '26 Camp",
    imagePath: "/canva/event-summer-camp.png",
    format: "portrait",
    title: "Summer '26 Camp",
    excerpt: "",
    bodyHtml: "",
  },
  {
    id: id(304),
    slug: "summer-classes-26",
    publishedOn: "2026-01-04",
    dateLabel: "2026. JAN 4",
    imageAlt: "Summer Classes '26",
    placeholderLabel: "Summer Classes '26",
    imagePath: "/canva/event-summer-classes.png",
    format: "landscape",
    title: "Summer Classes '26",
    excerpt: "",
    bodyHtml: "",
  },
];

/** Órarend nyers alapértéke (a chip/full feliratokat a lib/content.ts számolja). */
type RawRoom = {
  id: string;
  name: string;
  shortName: string;
  en?: DeepPartial<{ name: string; shortName: string; columns: { heading: string; classes: { title: string }[] }[] }>;
  columns: { heading: string; classes: { id: string; time: string; title: string }[] }[];
};

const HIPHOP = "Hip-hop Dalmával";
let classSeq = 200;
const cls = (time: string, title = HIPHOP) => ({ id: id(++classSeq), time, title });
const big = () => [cls("18:30-20:00"), cls("18:30-20:00"), cls("18:30-20:00")];
const small = () => [cls("16:00-17:30"), cls("17:30-19:00")];

// FIGYELEM: a péntek még helyőrző, az adminban kell a valódi órákra cserélni.
export const defaultRawRooms: RawRoom[] = [
  {
    id: id(1),
    name: "Nagy terem",
    shortName: "Nagy",
    columns: [
      { heading: "Hétfő - Szerda", classes: big() },
      { heading: "Kedd - Csütörtök", classes: big() },
      { heading: "Péntek", classes: big() },
    ],
  },
  {
    id: id(2),
    name: "Kis terem",
    shortName: "Kis",
    columns: [
      { heading: "Hétfő - Szerda", classes: small() },
      { heading: "Kedd - Csütörtök", classes: small() },
      { heading: "Péntek", classes: small() },
    ],
  },
];

export type { RawRoom };
