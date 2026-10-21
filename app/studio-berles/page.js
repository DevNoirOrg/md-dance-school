"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  DoorOpen,
  X,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BookingTimeline from "@/components/BookingTimeline";
import { rooms, emailPattern, bookingPrice, endHour, overlaps, formatBookingHour } from "@/lib/studio-booking";

const lessonTypes = [
  {
    id: "privat",
    title: "Privát óra",
    capacity: "3 fő",
    description: "Egyéni óra vagy személyre szabott gyakorlás.",
    Icon: UserRound,
  },
  {
    id: "kiscsoportos",
    title: "Kiscsoportos óra",
    capacity: "18 fő",
    description: "Közös tánc kisebb létszámú csoporttal.",
    Icon: UsersRound,
  },
  {
    id: "csoportos",
    title: "Csoportos óra",
    capacity: "36 fő",
    description: "Táncóra nagyobb csoport számára.",
    Icon: Users,
  },
];

const huCurrency = new Intl.NumberFormat("hu-HU", {
  style: "currency",
  currency: "HUF",
  maximumFractionDigits: 0,
});

// Egyórás kezdési lehetőségek félóránként, legkésőbb 21:00-kor.
const hours = Array.from({ length: 27 }, (_, index) => 8 + index / 2);
const weekdays = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
const views = [
  { id: "day", label: "Nap" },
  { id: "week", label: "Hét" },
  { id: "month", label: "Hónap" },
];
const huDate = new Intl.DateTimeFormat("hu-HU", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

// Helyi dátumkulcs: az UTC-re alakítás nem tolhatja el a foglalás napját.
function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekStart(date) {
  const weekday = date.getDay();
  return addDays(startOfDay(date), weekday === 0 ? -6 : 1 - weekday);
}

function isPastSlot(date, hour, now = new Date()) {
  const slotStart = new Date(date);
  slotStart.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0);
  return slotStart <= now;
}

// A havi összesítésből a foglalt, elmúlt és jóváhagyásra váró sávok is kimaradnak.
function getAvailableHourCount(room, date, now, pendingSlots, approvedSlots) {
  return hours.filter(
    (hour) =>
      !isPastSlot(date, hour, now) &&
      ![...pendingSlots, ...approvedSlots].some(
        (slot) =>
          overlaps(slot, { room, date: dateKey(date), hour, durationMinutes: 60 }),
      ),
  ).length;
}

// Hétfővel induló, hathetes rács, a szomszédos hónapok napjaival kiegészítve.
function getMonthDays(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = addDays(firstDay, -mondayOffset);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function formatHour(hour) {
  return formatBookingHour(hour);
}

function BookingDialog({ onClose, slots, lessonType }) {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const sendingRef = useRef(false);
  const totalPrice = slots.reduce((total, slot) => total + bookingPrice(slot), 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sendingRef.current || submitted) return;
    const form = event.currentTarget;
    const nameInput = form.elements.namedItem("name");
    const emailInput = form.elements.namedItem("email");
    const phoneInput = form.elements.namedItem("phone");
    // A formázó jelek megengedettek, az ellenőrzéshez csak az országkód és a szám marad.
    const normalizedPhone = phoneInput.value.replace(/[\s()-]/g, "");

    nameInput.setCustomValidity(
      nameInput.value.trim() ? "" : "Add meg a neved.",
    );
    // A böngésző e-mail-ellenőrzését a mező domainvégződést előíró mintája egészíti ki.
    emailInput.setCustomValidity(
      emailInput.validity.valueMissing
        ? "Add meg az e-mail címed."
        : emailInput.validity.typeMismatch || emailInput.validity.patternMismatch
          ? "Adj meg érvényes e-mail címet domainvégződéssel (például nev@example.hu)."
          : "",
    );
    phoneInput.setCustomValidity(
      /^\+[1-9]\d{6,14}$/.test(normalizedPhone) &&
        /^[+\d\s()-]+$/.test(phoneInput.value)
        ? ""
        : "Adj meg érvényes, + jellel és országkóddal kezdődő telefonszámot.",
    );

    if (!form.reportValidity()) return;
    sendingRef.current = true;
    setSending(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/studio-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonType,
          slots,
          customer: {
            name: nameInput.value.trim(),
            email: emailInput.value,
            phone: phoneInput.value,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        setSubmitError(result.error || "Nem sikerült elküldeni a foglalási igényt.");
        return;
      }
      // Csak a Resend által elfogadott e-mail után jelenik meg a sikerüzenet.
      setSubmitted(true);
    } catch (error) {
      console.error("Booking submission failed.", { name: error.name });
      setSubmitError("A küldés eredménye nem ellenőrizhető. Újraküldés előtt egyeztess a stúdióval, hogy elkerüld a dupla igényt.");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !sendingRef.current) onClose(submitted);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitted]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/65 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !sendingRef.current) onClose(submitted);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-dialog-title"
        aria-describedby="booking-dialog-description"
        className="relative my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          disabled={sending}
          onClick={() => onClose(submitted)}
          aria-label="Foglalási ablak bezárása"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
        >
          <X size={22} />
        </button>

        {submitted ? (
          <div className="py-5 text-center">
            <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#40CFD5] text-black">
              <Check size={30} />
            </span>
            <h2
              id="booking-dialog-title"
              className="section-title text-3xl text-black sm:text-4xl"
            >
              Köszönjük!
            </h2>
            <p
              id="booking-dialog-description"
              className="mt-3 text-sm leading-relaxed text-gray-600"
            >
              A foglalási igényről szóló e-mailt elküldtük a stúdiónak.
              A foglalási igény még nem jelent
              végleges foglalást.
            </p>
            <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold leading-relaxed text-amber-900">
              A foglalásod kizárólag a stúdió e-mailes vagy telefonos
              megerősítése után válik érvényessé és véglegessé.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              Az időpontokat jóváhagyásra váró igényként mentettük.
              A stúdió döntése után a naptár foglaltsága automatikusan frissül.
            </p>
            <button
              type="button"
              onClick={() => onClose(submitted)}
              className="mt-6 w-full rounded-xl bg-black px-5 py-3 font-bold text-white transition-colors hover:bg-[#40CFD5] hover:text-black"
            >
              Bezárás
            </button>
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#087c81]">
              Stúdió bérlés
            </p>
            <h2
              id="booking-dialog-title"
              className="section-title pr-8 text-3xl text-black sm:text-4xl"
            >
              Foglalási adatok
            </h2>
            <p
              id="booking-dialog-description"
              className="mb-6 mt-2 text-sm leading-relaxed text-gray-600"
            >
              Add meg az elérhetőségeidet a kiválasztott idősávokhoz.
              {" "}A foglalásod csak a stúdió e-mailes vagy telefonos
              megerősítése után válik véglegessé.
            </p>

            <form onSubmit={handleSubmit} noValidate aria-busy={sending} className="space-y-4">
              <div>
                <label htmlFor="booking-name" className="mb-1.5 block text-sm font-semibold text-gray-800">
                  Név
                </label>
                <input
                  id="booking-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  disabled={sending}
                  maxLength={200}
                  autoFocus
                  onInput={(event) => event.currentTarget.setCustomValidity("")}
                  className="md-input"
                />
              </div>
              <div>
                <label htmlFor="booking-email" className="mb-1.5 block text-sm font-semibold text-gray-800">
                  E-mail cím
                </label>
                <input
                  id="booking-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  pattern={emailPattern}
                  required
                  disabled={sending}
                  maxLength={254}
                  onInput={(event) => event.currentTarget.setCustomValidity("")}
                  className="md-input"
                />
              </div>
              <div>
                <label htmlFor="booking-phone" className="mb-1.5 block text-sm font-semibold text-gray-800">
                  Telefonszám
                </label>
                <input
                  id="booking-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+36 30 123 4567"
                  aria-describedby="booking-phone-hint"
                  required
                  disabled={sending}
                  maxLength={40}
                  onInput={(event) => event.currentTarget.setCustomValidity("")}
                  className="md-input"
                />
                <p id="booking-phone-hint" className="mt-1.5 text-xs text-gray-500">
                  Nemzetközi formátum, országkóddal (például +36).
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
                <span className="text-sm font-bold text-gray-700">Összesen</span>
                <span className="text-lg font-extrabold text-[#087c81]">
                  {huCurrency.format(totalPrice)}
                </span>
              </div>
              {submitError && (
                <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-[#40CFD5] px-5 py-3.5 font-extrabold text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#40CFD5]/40 disabled:cursor-wait disabled:opacity-60"
              >
                {sending ? "Küldés folyamatban…" : "Foglalási igény elküldése"}
              </button>
              <p className="text-center text-xs text-gray-500">
                A megadott adatokat és időpontokat e-mailben továbbítjuk a
                stúdiónak a foglalási igény feldolgozásához.
              </p>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function getCalendarTitle(view, date) {
  if (view === "day") {
    return new Intl.DateTimeFormat("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);
  }

  if (view === "week") {
    const weekStart = getWeekStart(date);
    const weekEnd = addDays(weekStart, 6);
    return `${huDate.format(weekStart)} – ${huDate.format(weekEnd)}`;
  }

  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
  }).format(date);
}

function StudioCalendar({ lessonType }) {
  const [view, setView] = useState("week");
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfDay(new Date()),
  );
  const [activeRoom, setActiveRoom] = useState(null);
  const calendarRef = useRef(null);
  const [scrollRequest, setScrollRequest] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const hasSelectedSlots = selectedSlots.length > 0;
  const hasMultipleSlots = selectedSlots.length > 1;
  const [storedSlots, setStoredSlots] = useState([]);
  const pendingSlots = storedSlots.filter((slot) => slot.status === "pending");
  const approvedSlots = storedSlots.filter((slot) => slot.status === "approved");
  const [availabilityError, setAvailabilityError] = useState("");
  const [loadedRange, setLoadedRange] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const rangeDays = getMonthDays(selectedDate);
  const rangeFrom = dateKey(rangeDays[0]);
  const rangeTo = dateKey(rangeDays[41]);
  const rangeKey = `${rangeFrom}/${rangeTo}`;
  const availabilityReady = loadedRange === rangeKey && !availabilityError;
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingSlots, setBookingSlots] = useState([]);

  useEffect(() => {
    if (!scrollRequest) return;
    const frame = window.requestAnimationFrame(() => {
      const calendar = calendarRef.current;
      const target = calendar?.querySelector(
        `[data-booking-hour="${scrollRequest.hour}"]`,
      ) || calendar;
      target?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start",
        inline: "nearest",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [scrollRequest]);

  // A szerver a közös adatbázisból adja vissza az állapotokat; fókuszkor is frissítünk.
  useEffect(() => {
    let active = true;
    let inFlight = false;
    const controller = new AbortController();
    const refresh = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await fetch(`/api/studio-bookings?from=${rangeFrom}&to=${rangeTo}`, {
          cache: "no-store", signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok || !Array.isArray(result.slots)) {
          throw new Error(result.error || "A foglaltság nem tölthető be.");
        }
        if (!active) return;
        setStoredSlots((current) => [
          ...current.filter((slot) => slot.date < rangeFrom || slot.date > rangeTo),
          ...result.slots,
        ]);
        setSelectedSlots((current) => current.filter((slot) =>
          !result.slots.some((saved) => overlaps(slot, saved)),
        ));
        setAvailabilityError("");
        setLoadedRange(rangeKey);
      } catch (error) {
        if (!active) return;
        console.error("Calendar availability refresh failed.", { name: error.name });
        setAvailabilityError(error.message || "A foglaltság nem tölthető be.");
      } finally {
        inFlight = false;
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 10_000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [rangeFrom, rangeTo, rangeKey, refreshVersion]);

  // Több kijelölésnél alapból csukott; további sávoknál megőrzi a kézi nyitást.
  useEffect(() => {
    setDrawerExpanded(!hasMultipleSlots);
  }, [hasMultipleSlots, hasSelectedSlots]);

  useEffect(() => {
    // Félpercenként frissítjük az időt, és töröljük a közben lejárt kijelöléseket.
    const timer = window.setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setSelectedSlots((current) =>
        current.filter(
          (slot) =>
            !isPastSlot(new Date(`${slot.date}T00:00:00`), slot.hour, now),
        ),
      );
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  // Az előző/következő gomb az aktív nézet szerint napot, hetet vagy hónapot léptet.
  const navigateDate = (direction) => {
    setSelectedDate((current) => {
      if (view === "month") {
        return new Date(
          current.getFullYear(),
          current.getMonth() + direction,
          1,
        );
      }
      return addDays(current, direction * (view === "week" ? 7 : 1));
    });
  };

  // Tiltott sávot nem választunk ki; ugyanarra kattintva megszüntetjük a kijelölést.
  const selectSlot = (slot) => {
    const slotDate = new Date(`${slot.date}T00:00:00`);
    if (
      !availabilityReady ||
      isPastSlot(slotDate, slot.hour) ||
      storedSlots.some((saved) => overlaps(slot, saved))
    ) {
      return;
    }

    setSelectedSlots((current) => {
      const alreadySelected = current.some(
        (selected) =>
          selected.room === slot.room &&
          selected.date === slot.date &&
          selected.hour === slot.hour,
      );
      if (alreadySelected) {
        return current.filter(
          (selected) =>
            selected.room !== slot.room ||
            selected.date !== slot.date ||
            selected.hour !== slot.hour,
        );
      }
      if (current.some((selected) => overlaps(slot, selected))) return current;
      return [...current, slot];
    });
  };
  const resizeSlot = (original, next) => {
    if (!availabilityReady || isPastSlot(new Date(`${next.date}T00:00:00`), next.hour) ||
        storedSlots.some((saved) => overlaps(next, saved))) return;
    setSelectedSlots((current) => {
      const sameStart = (slot) => slot.room === original.room &&
        slot.date === original.date && slot.hour === original.hour;
      if (current.some((slot) => !sameStart(slot) && overlaps(slot, next))) return current;
      return current.map((slot) => sameStart(slot) ? next : slot);
    });
  };
  const removeSlot = (slotToRemove) => {
    setSelectedSlots((current) =>
      current.filter(
        (slot) =>
          slot.room !== slotToRemove.room ||
          slot.date !== slotToRemove.date ||
          slot.hour !== slotToRemove.hour,
      ),
    );
  };
  // Sikeres űrlap után, az ablak bezárásakor kerülnek az időpontok függő állapotba.
  const closeBookingDialog = (submitted) => {
    if (submitted) {
      setSelectedSlots([]);
    }
    setBookingDialogOpen(false);
    setRefreshVersion((current) => current + 1);
  };
  const visibleWeekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(getWeekStart(selectedDate), index),
  );
  const monthDays = getMonthDays(selectedDate);
  // Félóránként időarányosan számoljuk a terem óradíját.
  const totalPrice = selectedSlots.reduce(
    (total, slot) => total + bookingPrice(slot),
    0,
  );

  return (
    <>
    <section className="mt-12" aria-labelledby="room-chooser-title">
      <div className="mb-8 text-center sm:mb-10">
        <h2 id="room-chooser-title" className="section-title text-4xl text-black sm:text-5xl">
          Melyik termet választanád?
        </h2>
        <p className="mt-3 text-sm text-gray-600 sm:text-base">
          Válassz termet az elérhető időpontok megtekintéséhez.
        </p>
        {lessonType === "csoportos" && (
          <p className="mt-2 text-sm font-semibold text-[#087c81]">
            Csoportos órához csak az Astoria - Nagy Terem választható.
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {rooms.map((room, index) => {
          const selected = activeRoom === room;
          const unavailable = lessonType === "csoportos" && room !== rooms[0];
          return (
            <motion.button
              key={room}
              id={`room-card-${index}`}
              type="button"
              aria-pressed={selected}
              aria-controls="room-calendar-panel"
              disabled={unavailable}
              onClick={() => {
                const now = new Date();
                const hour = now.getHours() + Math.floor(now.getMinutes() / 30) / 2;
                setActiveRoom(room);
                setScrollRequest({ hour: hour >= 8 && hour < 22 ? hour : 8 });
              }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              whileHover={unavailable ? undefined : { y: -5 }}
              whileTap={unavailable ? undefined : { scale: 0.99 }}
              className={`relative flex min-h-[220px] flex-col items-center justify-center rounded-3xl border-2 px-6 py-7 text-center shadow-[0_8px_28px_rgba(0,0,0,0.07)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#40CFD5]/40 disabled:cursor-not-allowed disabled:opacity-50 ${
                selected
                  ? "border-[#40CFD5] bg-[#40CFD5]/10"
                  : "border-white bg-white enabled:hover:border-[#40CFD5]"
              }`}
            >
              <span className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
                selected ? "bg-[#40CFD5] text-black" : "bg-black text-white"
              }`}>
                <DoorOpen size={32} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="text-xl font-extrabold text-black sm:text-2xl">{room}</span>
              {unavailable && (
                <span className="mt-3 text-sm text-gray-600">Ehhez az óratípushoz nem választható.</span>
              )}
              {selected && (
                <span aria-label="Kiválasztva"
                  className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#40CFD5] text-black">
                  <Check size={17} strokeWidth={3} />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
    {activeRoom && (
    <motion.section
      ref={calendarRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`mt-12 scroll-mt-28 rounded-3xl bg-white p-4 shadow-[0_10px_36px_rgba(0,0,0,0.09)] sm:p-7 ${
        selectedSlots.length ? "mb-52" : ""
      }`}
      aria-label="Teremfoglaltsági naptár"
    >
      {availabilityError ? (
        <div role="alert" className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {availabilityError} A foglaltság ellenőrzéséig nem választható új időpont.
          <button type="button" onClick={() => setRefreshVersion((current) => current + 1)}
            className="ml-2 underline">Újrapróbálás</button>
        </div>
      ) : !availabilityReady && (
        <p role="status" className="mb-5 text-sm text-gray-600">Foglaltság betöltése…</p>
      )}
      <div className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="section-title text-3xl text-black sm:text-4xl">
            Válassz időpontot
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Nézd meg a kiválasztott terem elérhető időpontjait.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-gray-100 p-1" aria-label="Naptár nézete">
            {views.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                onClick={() => setView(id)}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                  view === id
                    ? "bg-black text-white"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedDate(startOfDay(new Date()));
            }}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-black transition-colors hover:border-[#40CFD5]"
          >
            Ma
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f7f7f7] p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Előző időszak"
            onClick={() => navigateDate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-sm transition-colors hover:bg-[#40CFD5]"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Következő időszak"
            onClick={() => navigateDate(1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-sm transition-colors hover:bg-[#40CFD5]"
          >
            <ChevronRight size={20} />
          </button>
          <h3 className="ml-1 text-sm font-extrabold capitalize text-black sm:ml-3 sm:text-base">
            {getCalendarTitle(view, selectedDate)}
          </h3>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          <CalendarDays size={18} aria-hidden="true" />
          <span className="sr-only">Válassz dátumot</span>
          <input
            type="date"
            value={dateKey(selectedDate)}
            min={dateKey(new Date())}
            onChange={(event) => {
              if (event.target.value) {
                setSelectedDate(startOfDay(new Date(`${event.target.value}T00:00:00`)));
              }
            }}
            className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-black"
          />
        </label>
      </div>

      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-[#f7f7f7] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Clock3 size={18} aria-hidden="true" className="shrink-0 text-[#087c81]" />
          <p className="text-sm leading-relaxed text-gray-600">
            Kattintson egy szabad időpontra. A felső nyíllal fél órával korábbra
            hozhatja a kezdést, az alsóval fél órával későbbre tolhatja a befejezést.
            Minimum 1 óra foglalható. A kijelölt időszakra kattintva törölheti a kijelölést.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-600">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-white ring-1 ring-gray-300" />
            Szabad
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-gray-300" />
            Elmúlt időpont
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-amber-200 ring-1 ring-amber-400" />
            Igény elküldve, jóváhagyásra vár
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-blue-100 ring-1 ring-blue-400" />
            Foglalás alatt
          </span>
        </div>
      </div>

      <div
        id="room-calendar-panel"
        role="region"
        aria-labelledby={`room-card-${rooms.indexOf(activeRoom)}`}
        className="rounded-2xl border border-gray-200 bg-[#f7f7f7] p-3 sm:p-4"
      >
        <div className={`mb-4 flex gap-2 ${
          view === "day"
            ? "flex-col items-center text-center"
            : "flex-wrap items-center justify-between"
        }`}>
          <h3 className="text-lg font-extrabold text-black">{activeRoom}</h3>
          <span className="rounded-full bg-[#40CFD5]/20 px-3 py-1 text-xs font-bold text-[#087c81]">
            {view === "day" ? "Napi foglaltság" : view === "week" ? "Heti foglaltság" : "Havi foglaltság"}
          </span>
        </div>

      {view === "day" && (
        <div className="mx-auto max-w-xl">
          <BookingTimeline
            room={activeRoom}
            date={dateKey(selectedDate)}
            selectedSlots={selectedSlots}
            storedSlots={storedSlots}
            availabilityReady={availabilityReady}
            onSelect={selectSlot}
            onResize={resizeSlot}
            onRemove={removeSlot}
            now={currentTime}
          />
        </div>
      )}

      {view === "week" && (
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[980px] grid-cols-7">
            {visibleWeekDays.map((date) => (
              <div key={dateKey(date)}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(date);
                    setView("day");
                  }}
                  className={`flex min-h-[62px] w-full flex-col items-center justify-center border-r border-white/20 px-2 py-2 text-center transition-colors ${
                    dateKey(date) === dateKey(selectedDate)
                      ? "bg-[#40CFD5] text-black"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  <span className="text-xs font-bold">
                    {new Intl.DateTimeFormat("hu-HU", {
                      weekday: "short",
                    }).format(date)}
                  </span>
                  <span className="text-lg font-extrabold">{date.getDate()}.</span>
                </button>
                <BookingTimeline
                  room={activeRoom}
                  date={dateKey(date)}
                  selectedSlots={selectedSlots}
                  storedSlots={storedSlots}
                  availabilityReady={availabilityReady}
                  onSelect={selectSlot}
                  onResize={resizeSlot}
                  onRemove={removeSlot}
                  now={currentTime}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "month" && (
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekdays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-extrabold uppercase text-gray-500 sm:text-sm"
            >
              {day}
            </div>
          ))}
          {monthDays.map((date) => {
            const inMonth = date.getMonth() === selectedDate.getMonth();
            const inProgressCount = approvedSlots.filter(
              (slot) => slot.room === activeRoom && slot.date === dateKey(date),
            ).length;
            const available = availabilityReady ? getAvailableHourCount(
              activeRoom,
              date,
              currentTime,
              pendingSlots,
              approvedSlots,
            ) : 0;
            const pendingCount = pendingSlots.filter(
              (slot) =>
                slot.room === activeRoom && slot.date === dateKey(date),
            ).length;

            return (
              <button
                key={dateKey(date)}
                type="button"
                onClick={() => {
                  setSelectedDate(date);
                  setView("day");
                }}
                aria-label={`${huDate.format(date)}, ${available} szabad idősáv`}
                className={`flex min-h-[72px] flex-col items-center justify-center rounded-xl border text-sm transition-colors sm:min-h-[90px] ${
                  !inMonth
                    ? "border-transparent bg-gray-50 text-gray-300"
                    : dateKey(date) === dateKey(selectedDate)
                      ? "border-[#40CFD5] bg-[#40CFD5]/15 text-black"
                      : "border-gray-100 bg-white text-black hover:border-[#40CFD5] hover:bg-[#40CFD5]/10"
                }`}
              >
                <span className="font-bold">{date.getDate()}</span>
                {inMonth && (
                  <>
                    <span className="mt-1 hidden text-[10px] text-gray-500 sm:block">
                      {availabilityReady ? `${available} kezdés` : "Betöltés…"}
                    </span>
                    <span className="mt-1 flex gap-1" aria-hidden="true">
                      {available > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#40CFD5]" />
                      )}
                      {pendingCount > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                      {inProgressCount > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        A foglalások állapota 10 másodpercenként frissül.
      </p>
    </motion.section>
    )}
    {/* A fix összesítő az animált szakaszon kívül marad, így a képernyő aljához rögzül. */}
    {selectedSlots.length > 0 && (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#40CFD5]/60 bg-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.14)] backdrop-blur-md"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 sm:pt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#087c81]">
                Kiválasztott idősávok ({selectedSlots.length})
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Kijelölés – még nem végleges foglalás.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-expanded={drawerExpanded}
                aria-controls="selected-booking-slots"
                onClick={() => setDrawerExpanded((current) => !current)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-[#087c81] transition-colors hover:bg-[#40CFD5]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40CFD5]"
              >
                {drawerExpanded ? "Összecsukás" : "Időpontok megtekintése"}
                {drawerExpanded ? (
                  <ChevronDown size={18} aria-hidden="true" />
                ) : (
                  <ChevronUp size={18} aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelectedSlots([])}
                className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
              >
                Összes törlése
              </button>
            </div>
          </div>
          {/* Három 64 px-es sor és két 8 px-es térköz után a lista belül görgethető. */}
          <ul
            id="selected-booking-slots"
            hidden={!drawerExpanded}
            aria-label="Kiválasztott időpontok"
            tabIndex={0}
            className="max-h-[min(208px,30vh)] space-y-2 overflow-y-auto overscroll-contain rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#40CFD5]"
          >
            {selectedSlots.map((slot) => (
              <li
                key={`${slot.room}-${slot.date}-${slot.hour}`}
                className="flex h-16 items-center justify-between gap-3 rounded-xl border border-[#40CFD5]/50 bg-[#40CFD5]/10 px-3 py-2"
              >
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <p className="min-w-0 text-sm font-extrabold text-black">
                    <span className="block truncate">{slot.room}</span>
                    <span className="block truncate text-xs font-semibold text-gray-700">
                      {huDate.format(new Date(`${slot.date}T00:00:00`))} ·{" "}
                      {formatHour(slot.hour)}–{formatHour(endHour(slot))}
                    </span>
                  </p>
                  <span className="shrink-0 text-sm font-extrabold text-[#087c81]">
                    {huCurrency.format(bookingPrice(slot))}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSlot(slot)}
                  aria-label={`${slot.room}, ${slot.date}, ${formatHour(slot.hour)} kijelölésének törlése`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-white hover:text-black"
                >
                  <X size={18} />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 py-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-black">Összesen</span>
              <span className="text-lg font-extrabold text-[#087c81]">
                {huCurrency.format(totalPrice)}
              </span>
            </div>
            <button
              type="button"
              disabled={!availabilityReady}
              onClick={() => {
                // A nyitáskori lista marad az e-mail alapja az időzítő frissítései után is.
                setBookingSlots([...selectedSlots]);
                setBookingDialogOpen(true);
              }}
              className="rounded-xl bg-[#40CFD5] px-5 py-2.5 text-sm font-extrabold text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#40CFD5]/40"
            >
              Foglalás
            </button>
          </div>
        </div>
      </div>
    )}
    {bookingDialogOpen && (
      <BookingDialog
        onClose={closeBookingDialog}
        slots={bookingSlots}
        lessonType={lessonType}
      />
    )}
    </>
  );
}

export default function StudioBerlesPage() {
  const [selectedType, setSelectedType] = useState(null);

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <Navbar />
      <section
        className="relative flex min-h-[390px] items-center justify-center overflow-hidden bg-black px-5 pb-12 pt-32 text-center sm:min-h-[440px] sm:pt-36"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(0,0,0,0.76), rgba(0,0,0,0.48)), url('/canva/hero-crowd.jpg')",
          backgroundPosition: "center 42%",
          backgroundSize: "cover",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f7f7f7] to-transparent"
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="relative z-10 max-w-4xl"
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#40CFD5] sm:text-sm">
            MD Dance School
          </p>
          <h1 className="section-title text-5xl text-white sm:text-7xl md:text-8xl">
            STÚDIÓ BÉRLÉS
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
            Válaszd ki, milyen létszámú órát szeretnél tartani a stúdióban.
          </p>
        </motion.div>
      </section>

      <section className="relative px-4 pb-20 sm:px-6 sm:pb-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-16 h-40 w-40 opacity-[0.12] sm:left-8"
          style={{
            backgroundImage:
              "radial-gradient(circle, #000 1.5px, transparent 1.5px)",
            backgroundSize: "13px 13px",
          }}
        />

        <div className="relative mx-auto -mt-10 max-w-7xl sm:-mt-14">
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="section-title text-4xl text-black sm:text-5xl">
              Milyen órát tartanál?
            </h2>
            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Válassz egyet a három óratípus közül.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {lessonTypes.map(({ id, title, capacity, description, Icon }, index) => {
              const selected = selectedType === id;

              return (
                <motion.button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedType(id)}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative flex min-h-[220px] flex-col items-center rounded-3xl border-2 px-6 py-7 text-center shadow-[0_8px_28px_rgba(0,0,0,0.07)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#40CFD5]/40 ${
                    selected
                      ? "border-[#40CFD5] bg-[#40CFD5]/10"
                      : "border-white bg-white hover:border-[#40CFD5]"
                  }`}
                >
                  <span
                    className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
                      selected ? "bg-[#40CFD5] text-black" : "bg-black text-white"
                    }`}
                  >
                    <Icon size={32} strokeWidth={1.8} aria-hidden="true" />
                  </span>

                  <span className="text-xl font-extrabold text-black sm:text-2xl">
                    {title}
                  </span>
                  <span className="mt-2 font-bold text-[#179da3]">Max. {capacity}</span>
                  <span className="mt-3 max-w-xs text-sm leading-relaxed text-gray-600">
                    {description}
                  </span>

                  {selected && (
                    <span
                      aria-label="Kiválasztva"
                      className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#40CFD5] text-black"
                    >
                      <Check size={17} strokeWidth={3} />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Óratípusváltáskor új naptár indul; a mentett foglaltságot újra betöltjük. */}
          {selectedType && <StudioCalendar key={selectedType} lessonType={selectedType} />}
        </div>
      </section>
    </main>
  );
}
