export const rooms = [
  "Astoria - Nagy Terem",
  "Astoria - Kis Terem",
  "Opera - Nagy Terem",
  "Opera - Közepes Terem",
];

export const roomPrices = {
  "Astoria - Nagy Terem": 1000,
  "Astoria - Kis Terem": 2000,
  "Opera - Nagy Terem": 3000,
  "Opera - Közepes Terem": 4000,
};

export const emailPattern = "[A-Za-z0-9.!#$%&'*+\\/=?^_`\\{\\|\\}~\\-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9\\-]*[A-Za-z0-9])?\\.)+[A-Za-z]{2,}";

export function endHour(slot) {
  return slot.hour + (slot.durationMinutes ?? 60) / 60;
}

export function overlaps(a, b) {
  return a.room === b.room && a.date === b.date &&
    a.hour < endHour(b) && b.hour < endHour(a);
}

export function bookingPrice(slot) {
  return roomPrices[slot.room] * (slot.durationMinutes ?? 60) / 60;
}

export function formatBookingHour(hour) {
  const minutes = Math.round(hour * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function validateBookingTime({ date, hour, durationMinutes }, now = new Date()) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      typeof hour !== "number" || !Number.isInteger(hour * 2) || hour < 8 ||
      !Number.isInteger(durationMinutes) || durationMinutes < 60 ||
      durationMinutes % 30 !== 0 || hour + durationMinutes / 60 > 22) {
    return "Érvénytelen terem vagy idősáv.";
  }
  const parsedDate = new Date(`${date}T00:00:00Z`);
  // Budapest helyi idejéhez hasonlítunk, függetlenül a szerver időzónájától.
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Budapest", year: "numeric", month: "2-digit",
    day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now).map(({ type, value }) => [type, value]));
  const current = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date ||
      `${date}T${formatBookingHour(hour)}` <= current) {
    return "Az egyik időpont érvénytelen vagy már elmúlt. Válassz másik idősávot.";
  }
  return null;
}

export function canRescheduleBooking(booking, target, slots, now = new Date()) {
  return target.room === booking.room && target.durationMinutes === booking.durationMinutes &&
    !validateBookingTime(target, now) &&
    !slots.some((slot) => slot.id !== booking.id && overlaps(slot, target));
}

export function validateBooking(input, now = new Date()) {
  if (!input || typeof input !== "object") {
    return { error: "Hiányzó foglalási adatok." };
  }
  const { customer, slots, lessonType } = input;
  if (!customer || typeof customer.name !== "string" ||
      !customer.name.trim() || customer.name.length > 200) {
    return { error: "Adj meg érvényes nevet (legfeljebb 200 karakter)." };
  }
  if (typeof customer.email !== "string" || customer.email.length > 254 ||
      !new RegExp(`^${emailPattern}$`).test(customer.email)) {
    return { error: "Adj meg érvényes e-mail címet domainvégződéssel." };
  }
  if (typeof customer.phone !== "string" || customer.phone.length > 40 ||
      !/^[+\d\s()-]+$/.test(customer.phone) ||
      !/^\+[1-9]\d{6,14}$/.test(customer.phone.replace(/[\s()-]/g, ""))) {
    return { error: "Adj meg országkóddal kezdődő, érvényes telefonszámot." };
  }
  if (!["privat", "kiscsoportos", "csoportos"].includes(lessonType) ||
      !Array.isArray(slots) || slots.length === 0 || slots.length > 100) {
    return { error: "Válassz óratípust és 1–100 idősávot." };
  }

  const seen = new Set();
  const bookings = [];
  for (const slot of slots) {
    const durationMinutes = slot?.durationMinutes ?? 60;
    if (!slot || !rooms.includes(slot.room) ||
        (lessonType === "csoportos" && slot.room !== rooms[0])) {
      return { error: "Érvénytelen terem vagy idősáv." };
    }
    const timeError = validateBookingTime({ ...slot, durationMinutes }, now);
    if (timeError) return { error: timeError };
    const key = `${slot.room}/${slot.date}/${slot.hour}`;
    if (seen.has(key)) return { error: "Ugyanaz az idősáv többször szerepel." };
    seen.add(key);
    if (bookings.some((existing) => overlaps(existing, { ...slot, durationMinutes }))) {
      return { error: "A kiválasztott időszakok átfedik egymást." };
    }
    bookings.push({ room: slot.room, date: slot.date, hour: slot.hour,
      durationMinutes, price: bookingPrice({ ...slot, durationMinutes }) });
  }
  return {
    booking: {
      lessonType,
      customer: { name: customer.name.trim(), email: customer.email, phone: customer.phone.trim() },
      slots: bookings,
      total: bookings.reduce((sum, slot) => sum + slot.price, 0),
    },
  };
}
