export const locales = ["hu", "en"] as const;
export type Locale = (typeof locales)[number];

type Dictionary = {
  langName: string;
  switchLabel: string;
  nav: { home: string; camp: string; schedule: string; services: string; studio: string; contact: string; news: string };
  common: {
    apply: string; allNews: string; noNews: string; privacy: string; privacyOnly: string;
    cookieSettings: string; email: string; phone: string; open: string; contactUs: string; terms: string; contents: string; newsSoon: string;
  };
  schedule: Record<string, string>;
  courses: Record<string, string>;
  teachers: Record<string, string>;
  services: Record<string, string>;
  contact: Record<string, string>;
  camp: Record<string, string>;
  form: Record<string, string>;
};

const dictionaries: Record<Locale, Dictionary> = {
  hu: {
    langName: "Magyar",
    switchLabel: "Nyelvválasztás",
    nav: { home: "Kezdőlap", camp: "Tánctábor", schedule: "Órarend", services: "Szolgáltatások", studio: "Stúdió bérlés", contact: "Elérhetőség", news: "Hírek" },
    common: { apply: "Jelentkezem", allNews: "Összes hír", noNews: "Jelenleg nincs hír.", privacy: "Adatkezelési tájékoztató", privacyOnly: "", cookieSettings: "Cookie beállítások", email: "E-mail", phone: "Tel.", open: "Megnyitás", contactUs: "Lépj kapcsolatba velünk", terms: "ÁSZF", contents: "Tartalom", newsSoon: "Jelenleg nincs hír." },
    schedule: { title: "ÓRAREND", selectedNone: "Még nem választottál órát", selectPrompt: "Kattints egy órára az órarendben", selected: "óra kiválasztva", selectMore: "Többet is választhatsz, vagy távolítsd el a kijelölést", continue: "Tovább a jelentkezéshez" },
    courses: { stylesKicker: "Amit tanítunk", styles: "Stílusok", stepsKicker: "Első lépések", beforeYouCome: "Mielőtt jössz", apply: "Jelentkezem egy tanfolyamra", back: "Vissza az órarendhez", teacher: "Tanár" },
    teachers: { title: "Tanáraink", video: "Videó" },
    services: { open: "Megnyitás", preview: "Az MD Dance Company weboldalának megnyitása új lapon" },
    contact: { eyebrow: "Kapcsolat", title: "ÍRJ NEKÜNK", description: "Kérdésed van az órákkal, a táborral vagy a stúdióbérléssel kapcsolatban? Írj pár sort, és hamarosan válaszolunk e-mailben.", thanks: "Köszönjük az üzeneted!", sent: "Hamarosan válaszolunk a megadott e-mail címen.", reset: "Új üzenet írása", name: "Név", phone: "Telefonszám", email: "E-mail cím", message: "Üzenet", messagePlaceholder: "Miben segíthetünk?", send: "Üzenet küldése", errorName: "Add meg a neved.", errorEmail: "Add meg az e-mail címed.", errorPhone: "Ellenőrizd a telefonszámot.", errorMessage: "Írd meg az üzeneted.", submitError: "Nem sikerült elküldeni az üzenetet. Kérjük, próbáld újra később." },
    camp: { apply: "Jelentkezem", pricesAndDates: "Árak és időpontok", video: "Álló videó", prices: "Árak", campFee: "Tábor díja", available: "Elérhető:", spots: "Szabad helyek", payments: "Befizetési módok", dates: "Időpontok", closed: "lezárva", location: "Tábor helyszíne", important: "Fontos tudnivaló", signupInfo: "Jelentkezési lehetőség", teachers: "TÁNCTANÁRAINK", unavailable: "Nincs", heading: "JELENTKEZÉS", thanks: "Köszönjük a jelentkezést!", confirmation: "A jelentkezést e-mailben visszaigazoljuk, és megírjuk a befizetéssel kapcsolatos tudnivalókat.", restart: "Új jelentkezés indítása", turn: "Turnus időpont", resident: "Táborlakó neve", namePlaceholder: "Kovács Emma", contactEmail: "Kapcsolattartó e-mail", emailPlaceholder: "hello@valami.hu", phoneLabel: "Telefonszám", birth: "Születési dátum", shirt: "Pólóméret", importantNote: "Fontos tudnivaló", notePlaceholder: "pl. allergia, speciális étrend, SZÉP kártyás fizetés…", parent: "Szülő / gondviselő neve", parentPlaceholder: "Kovács Ákos", parentPhone: "Szülő telefonszáma", address: "Lakcím", billingAddress: "Számlázási cím", payment: "Fizetési mód", source: "Honnan hallottál a táborról?", filler: "Jelentkező lapot kitöltő személy", consentData: "Hozzájárulok a fenti adataim Adatkezelő által történő kezeléséhez.", privacyRead: "Elolvastam és elfogadom az", privacyLink: "Adatkezelési tájékoztatóban", privacyEnd: "foglaltakat.", submit: "Jelentkezem", sending: "Küldés…", required: "kötelező mező", genericError: "Egy mező még hiányzik vagy hibás.", genericErrorMany: "mező még hiányzik vagy hibás. A pirossal jelölt helyeket javítsd!", invalidEmail: "Adj meg egy érvényes e-mail címet.", sendError: "Nem sikerült elküldeni a jelentkezést. Ellenőrizd az internetkapcsolatot, és próbáld újra.", invalidFields: "Valamelyik mező hibás. Ellenőrizd az adatokat, és próbáld újra.", sessionUnavailable: "A választott turnus már nem elérhető. Töltsd újra az oldalt, és válassz újra.", optionUnavailable: "Valamelyik választott lehetőség már nem érvényes. Töltsd újra az oldalt.", parentPhoneCheck: "Ellenőrizd a szülő telefonszámát.", tooMany: "Túl sok jelentkezés érkezett innen rövid időn belül. Kérjük, próbáld újra később.", errName: "Add meg a táborlakó nevét.", errEmail: "Add meg a kapcsolattartó e-mail címet.", errPhone: "Add meg a táborlakó telefonszámát.", errDate: "Add meg a születési dátumot.", errFuture: "A dátum a jövőben van.", errTurn: "Válassz legalább egy turnust.", errPrivacy: "A jelentkezéshez el kell fogadnod az adatkezelési tájékoztatót.", errConsent: "A jelentkezéshez hozzá kell járulnod az adatkezeléshez.", phoneCheck: "Ellenőrizd a telefonszámot." },
    form: {
      title: "JELENTKEZÉS", selected: "Választott óráid", classCount: "óra", noSelection: "Még nincs kiválasztott órád — legalább egyet válassz az órarendből.",
      backSchedule: "Vissza az órarendhez", name: "Teljes név (Táncos)", email: "E-mail cím (Táncos)", phone: "Telefonszám",
      birth: "Mikor születtél? (Táncos)", parentName: "Szülő teljes neve", parentEmail: "Szülő e-mail címe",
      experience: "Táncoltál már korábban?", choose: "Válassz…", note: "Megjegyzés", notePlaceholder: "Bármi, amit tudnunk érdemes…",
      parentNotice: "év alatti vagy — kérjük, add meg a szülőd teljes nevét és e-mail címét!",
      required: "kötelező mező", send: "Küldés…", submit: "Jelentkezem", thanks: "Köszönjük a jelentkezést!",
      confirmation: "Hamarosan keresünk a megadott e-mail címen.", restart: "Új jelentkezés indítása",
      selectedNone: "Még nem választottál órát", selectPrompt: "Kattints egy órára az órarendben",
      selectMore: "Többet is választhatsz, vagy távolítsd el a kijelölést", continue: "Tovább a jelentkezéshez",
      noClass: "Válassz legalább egy órát az órarendből!", requiredError: "Ezt a mezőt kötelező kitölteni.",
      optionError: "Válassz egy lehetőséget.", emailError: "Adj meg egy érvényes e-mail címet.",
      dateError: "Adj meg egy érvényes dátumot.", futureDate: "A dátum a jövőben van.",
      dateCheck: "Ellenőrizd a megadott dátumot.", parentEmailError: "Adj meg egy érvényes e-mail címet, vagy hagyd üresen.",
      submitErrorOne: "Egy mező még hiányzik vagy hibás.", submitErrorMany: "mező még hiányzik vagy hibás. A pirossal jelölt helyeket javítsd!",
      sendError: "Nem sikerült elküldeni a jelentkezést. Ellenőrizd az internetkapcsolatot, és próbáld újra.",
      serverError: "A jelentkezés átmenetileg nem elérhető. Kérjük, próbáld újra később.",
      consentPrivacy: "Az elküldéshez el kell fogadnod az Adatkezelési tájékoztatót.",
      consentData: "Az elküldéshez hozzá kell járulnod az adataid kezeléséhez.",
      privacyRead: "Elolvastam és elfogadom az", privacyLink: "Adatkezelési tájékoztatóban", privacyEnd: "foglaltakat.",
      consentText: "Hozzájárulok a fenti adataim Adatkezelő által történő kezeléséhez.",
      summaryName: "Név", summaryEmail: "E-mail", summaryPhone: "Telefon", summaryBirth: "Születési dátum",
      summaryParent: "Szülő", summaryExperience: "Tánctapasztalat", summaryClasses: "Órák", summaryNote: "Megjegyzés",
      noSelectionError: "Még nincs kiválasztott órád — legalább egyet válassz az órarendből.",
      invalidFields: "Valamelyik mező hibás. Ellenőrizd az adatokat, és próbáld újra.",
      classChanged: "A kiválasztott órák időközben megváltoztak. Töltsd újra az oldalt, és válassz újra.",
      tooMany: "Túl sok jelentkezés érkezett innen rövid időn belül. Kérjük, próbáld újra később.",
    },
  },
  en: {
    langName: "English",
    switchLabel: "Choose language",
    nav: { home: "Home", camp: "Dance camp", schedule: "Schedule", services: "Services", studio: "Studio rental", contact: "Contact", news: "News" },
    common: { apply: "Join now", allNews: "All news", noNews: "There are no news at the moment.", privacy: "Privacy policy", privacyOnly: "This privacy policy is available in Hungarian only.", cookieSettings: "Cookie settings", email: "Email", phone: "Phone", open: "Open", contactUs: "Contact us", terms: "Terms and conditions", contents: "Contents", newsSoon: "News will be available here soon." },
    schedule: { title: "SCHEDULE", selectedNone: "No classes selected yet", selectPrompt: "Click a class in the schedule", selected: "classes selected", selectMore: "Choose more classes or remove a selection", continue: "Continue to sign-up" },
    courses: { stylesKicker: "What we teach", styles: "Styles", stepsKicker: "Getting started", beforeYouCome: "Before you come", apply: "Sign up for a class", back: "Back to schedule", teacher: "Teacher" },
    teachers: { title: "Our teachers", video: "Video" },
    services: { open: "Open", preview: "Open the MD Dance Company website in a new tab" },
    contact: { eyebrow: "Contact", title: "GET IN TOUCH", description: "Questions about classes, camp or studio rental? Send us a message and we'll get back to you by email.", thanks: "Thanks for your message!", sent: "We'll get back to you at the email address you provided.", reset: "Write another message", name: "Name", phone: "Phone number", email: "Email address", message: "Message", messagePlaceholder: "How can we help?", send: "Send message", errorName: "Please enter your name.", errorEmail: "Please enter your email address.", errorPhone: "Please check your phone number.", errorMessage: "Please write a message.", submitError: "We couldn't send your message. Please try again later." },
    camp: { apply: "Join now", pricesAndDates: "Prices and dates", video: "Vertical video", prices: "Prices", campFee: "Camp fee", available: "Available:", spots: "Available places", payments: "Payment methods", dates: "Dates", closed: "closed", location: "Camp location", important: "Important information", signupInfo: "How to sign up", teachers: "OUR DANCE TEACHERS", unavailable: "Unavailable", heading: "SIGN UP", thanks: "Thank you for signing up!", confirmation: "We'll confirm your application by email and send payment information.", restart: "Start a new application", turn: "Camp session", resident: "Camper's name", namePlaceholder: "Alex Smith", contactEmail: "Contact email", emailPlaceholder: "name@example.com", phoneLabel: "Phone number", birth: "Date of birth", shirt: "T-shirt size", importantNote: "Important information", notePlaceholder: "e.g. allergies, special diet, payment details…", parent: "Parent / guardian name", parentPlaceholder: "Jamie Smith", parentPhone: "Parent / guardian phone", address: "Address", billingAddress: "Billing address", payment: "Payment method", source: "How did you hear about the camp?", filler: "Person completing the application", consentData: "I consent to the controller processing the personal data provided above.", privacyRead: "I have read and agree to the", privacyLink: "Privacy Policy", privacyEnd: ".", submit: "Submit application", sending: "Sending…", required: "required field", genericError: "One field is missing or invalid.", genericErrorMany: "fields are missing or invalid. Please correct the fields marked in red!", invalidEmail: "Please enter a valid email address.", sendError: "We couldn't submit your application. Check your internet connection and try again.", invalidFields: "Some fields are invalid. Please check your information and try again.", sessionUnavailable: "The selected session is no longer available. Reload the page and choose again.", optionUnavailable: "One of the selected options is no longer available. Reload the page and try again.", parentPhoneCheck: "Please check the parent or guardian's phone number.", tooMany: "Too many applications have been sent from this connection. Please try again later.", errName: "Please enter the camper's name.", errEmail: "Please enter a contact email address.", errPhone: "Please enter the camper's phone number.", errDate: "Please enter a date of birth.", errFuture: "The date is in the future.", errTurn: "Choose at least one camp session.", errPrivacy: "Please accept the Privacy Policy to apply.", errConsent: "Please consent to the processing of your data.", phoneCheck: "Please check the phone number." },
    form: {
      title: "SIGN UP", selected: "Selected classes", classCount: "classes", noSelection: "You haven't selected a class yet — choose at least one from the schedule.",
      backSchedule: "Back to schedule", name: "Full name (Dancer)", email: "Email address (Dancer)", phone: "Phone number",
      birth: "Date of birth (Dancer)", parentName: "Parent's full name", parentEmail: "Parent's email address",
      experience: "Have you danced before?", choose: "Choose…", note: "Note", notePlaceholder: "Anything else we should know…",
      parentNotice: "years old — please provide your parent's full name and email address!",
      required: "required field", send: "Sending…", submit: "Join now", thanks: "Thank you for signing up!",
      confirmation: "We'll be in touch at the email address you provided.", restart: "Start a new application",
      selectedNone: "No classes selected yet", selectPrompt: "Click a class in the schedule",
      selectMore: "Choose more classes or remove a selection", continue: "Continue to sign-up",
      noClass: "Choose at least one class from the schedule!", requiredError: "This field is required.",
      optionError: "Please choose an option.", emailError: "Enter a valid email address.",
      dateError: "Enter a valid date.", futureDate: "The date is in the future.",
      dateCheck: "Please check the date you entered.", parentEmailError: "Enter a valid email address or leave this blank.",
      submitErrorOne: "One field is missing or invalid.", submitErrorMany: "fields are missing or invalid. Please correct the fields marked in red!",
      sendError: "We couldn't submit your application. Check your internet connection and try again.",
      serverError: "Applications are temporarily unavailable. Please try again later.",
      consentPrivacy: "Please accept the Privacy Policy before submitting.",
      consentData: "Please consent to the processing of your personal data.",
      privacyRead: "I have read and agree to the", privacyLink: "Privacy Policy", privacyEnd: ".",
      consentText: "I consent to the controller processing the personal data provided above.",
      summaryName: "Name", summaryEmail: "Email", summaryPhone: "Phone", summaryBirth: "Date of birth",
      summaryParent: "Parent", summaryExperience: "Dance experience", summaryClasses: "Classes", summaryNote: "Note",
      noSelectionError: "You haven't selected a class yet — choose at least one from the schedule.",
      invalidFields: "Some fields are invalid. Please check your information and try again.",
      classChanged: "The selected classes have changed. Reload the page and select them again.",
      tooMany: "Too many applications have been sent from this connection. Please try again later.",
    },
  },
};

export const t = (locale: Locale) => dictionaries[locale];

export function alternateLocalePath(pathname: string, locale: Locale): string {
  if (locale === "hu") {
    if (pathname === "/") return "/en";
    if (pathname === "/hirek") return "/en/news";
    if (pathname.startsWith("/hirek/")) return `/en/news${pathname.slice("/hirek".length)}`;
    if (pathname === "/adatkezeles") return "/en/privacy";
    if (pathname === "/orarend") return "/en/schedule";
    if (pathname === "/szolgaltatasok") return "/en/services";
    if (pathname === "/tanctabor") return "/en/camp";
    return `/en${pathname}`;
  }
  if (pathname === "/en") return "/";
  if (pathname === "/en/news") return "/hirek";
  if (pathname.startsWith("/en/news/")) return `/hirek${pathname.slice("/en/news".length)}`;
  if (pathname === "/en/privacy") return "/adatkezeles";
  if (pathname === "/en/schedule") return "/orarend";
  if (pathname === "/en/services") return "/szolgaltatasok";
  if (pathname === "/en/camp") return "/tanctabor";
  return pathname.replace(/^\/en(?=\/|$)/, "") || "/";
}

export function englishNewsPath(pathname: string, hasTranslation: boolean): string {
  return hasTranslation ? alternateLocalePath(pathname, "hu") : "/en/news";
}
