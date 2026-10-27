import type { SettingsMap, Teacher } from "./content-types";
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
    lead: "Hip-hop, house és koreográfia kezdőtől haladóig – fejezd ki magad a tánccal, és éld át velünk az MD életérzést!",
    imagePath: "/canva/hero-crowd.jpg",
  },
  about: {
    titleLine1: "A MASTER DANCE",
    titleLine2: "TÁNCISKOLA",
    paragraphs: [
      "A tánctanítás több szinten folyik nálunk. Kezdőtől középhaladóig minden csoport elérhető. Tanáraink profin és elhivatottan adják át tudásukat diákjainknak.",
      "Master Dance az egyik legnépszerűbb tánciskola a belvárosban. Tánctanfolyamaink elérhetők gyerekeknek, tinédzsereknek és felnőtteknek egyaránt, angol és magyar nyelven is. Mindegy, hogy kezdő vagy haladóbb szinten szeretnél táncolni, nálunk minden csoportban minőségi táncoktatás folyik. Budapesten két tánc stúdióval rendelkezünk, igényes, jól felszerelt tánctermekkel.",
      "Ha egy igazán jó közösségben szeretnél táncolni, profi és őszinte elhivatottsággal oktató tanároktól szeretnél tanulni, akkor biztos, hogy nálunk a helyed.",
    ].join("\n\n"),
    imagePath: "/canva/about-group.jpg",
    imageAlt: "Master Dance csoportos tánc előadás",
  },
  services: {
    heroTitle: "SZOLGÁLTATÁSOK",
    heroLead: "Show, koreográfia és produkció — rendezvényekre, színpadra és kamera elé.",
    kicker: "MD Dance Company",
    title: "A tánciskola mögött egy show-csapat áll",
    text: "Koreográfiát, show-produkciót és teljes színpadi élményt készítünk sporteseményekre, koncertekre és márkáknak. Ha fellépőt, nyitóshow-t vagy egyedi koreográfiát keresel a rendezvényedre, nézz be hozzánk.",
    highlights: ["Sport ceremóniák és nyitóshow-k", "Élő show- és koncertprodukció", "Koreográfia és art design"],
    url: "https://www.mddancecompany.com/",
    buttonLabel: "Tovább az MD Dance Company oldalára",
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
        text: "Az alapok, amikre minden épül: groove, bounce, ritmus és a klasszikus lépések. Tréning és technika váltja egymást, a végén pedig tiszta hip-hop koreográfiában használod mindazt, amit az órán tanultál.",
        teachers: ["Dalma", "Alex"],
      },
      {
        title: "Girly / Commercial",
        text: "Csajos energia és magabiztos kisugárzás: dögös, látványos koreográfiák a klipek és a színpad világából. Mindenkit szeretettel várunk, nemtől függetlenül — itt a hangulat és az önbizalom a lényeg.",
        teachers: ["Lili", "Lia"],
      },
      {
        title: "High heels",
        text: "Táncolj magassarkúban! A gyors, energikus daraboktól a lassú, érzéki koreográfiákig mindent kipróbálsz, közben pedig megtanulod a sarokban való járás, forgás és tánc technikáját — és azt a tartást, amit az utcára is magaddal viszel.",
        teachers: ["Lia"],
      },
      {
        title: "House",
        text: "A klubok tánca: improvizatív, játékos és folyékony, gyors lábmunkával és rengeteg szabadsággal. Ha szereted a house zenét, itt a lépéseit is megismered — ha pedig valami teljesen újat próbálnál, ez remek választás.",
        teachers: ["Alex"],
      },
    ],
    groups: [
      {
        title: "Kezdő",
        tag: "Szint",
        text: "Az első lépés — vagy a visszatérés a tánchoz. Nulláról indulunk, lépésről lépésre, egy lelkes, gyorsan fejlődő csapatban. Sokan itt kezdik, és az évzáró gálán már magabiztosan állnak színpadra.",
      },
      {
        title: "Középhaladó",
        tag: "Szint",
        text: "Ha az alapok már mennek, és többre vágysz: összetettebb koreográfiák, gyorsabb tempó, nagyobb kihívás. Céltudatos, ambiciózus társaság, ahol mindenki húzza a másikat.",
      },
      {
        title: "Haladó",
        tag: "Szint · 14+",
        text: "Azoknak, akiknek a tánc már az életük része. Régi, elhivatott tagok, magas tempó és igényes munka. 14 éves kortól várjuk azokat, akik régóta táncolnak és készen állnak a következő szintre.",
      },
      {
        title: "Felnőtt csoport",
        tag: "18–36 év",
        text: "Kezdőtől középhaladóig, kötetlen, jó hangulatú órákon. Levezetheted a hétköznapok stresszét, és végre megvalósíthatod a régi álmod: megtanulsz táncolni. Ha angolul tanulnál, nézd meg az International Classt!",
      },
      {
        title: "International Class",
        tag: "Angol nyelvű · 18+",
        text: "Angol nyelvű órák nemzetközi társaságban, Zsolt vezetésével, kezdő és középhaladó szinten. A világ minden tájáról érkeznek ide diákok, de a magyarokat is szeretettel várjuk.",
      },
      {
        title: "Open Class",
        tag: "Bárkinek",
        text: "Kipróbálnád magad? Az open classokon bárki beállhat — vendég és MD-s diák egyaránt —, és minden alkalommal más táncos koreográfiáját tanulhatod meg. Óradíjas alkalmak, bérlettel díjmentesen látogathatók.",
      },
    ],
  },
  schedule: {
    hint: "Kattints az órákra, amikre jelentkeznél, akár többre is",
  },
  news: {
    title: "HÍREK ÉS\nESEMÉNYEK",
    items: [
      { imagePath: "/canva/event-aaron-quinn-workshop.jpg", alt: "Aaron Quinn Workshop", format: "landscape", link: "" },
      { imagePath: "/canva/event-after-party.png", alt: "(Random) After Party", format: "portrait", link: "" },
      { imagePath: "/canva/event-summer-camp.png", alt: "Summer '26 Camp", format: "portrait", link: "" },
      { imagePath: "/canva/event-summer-classes.png", alt: "Summer Classes '26", format: "landscape", link: "" },
    ],
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

/** Órarend nyers alapértéke (a chip/full feliratokat a lib/content.ts számolja). */
type RawRoom = { id: string; name: string; shortName: string; columns: { heading: string; classes: { id: string; time: string; title: string }[] }[] };

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
