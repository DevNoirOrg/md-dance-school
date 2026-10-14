export const rooms = [
  "Astoria - Nagy Terem",
  "Astoria - Kis Terem",
  "Opera - Nagy Terem",
  "Opera - Kis Terem",
];

export const roomPrices = {
  "Astoria - Nagy Terem": 1000,
  "Astoria - Kis Terem": 2000,
  "Opera - Nagy Terem": 3000,
  "Opera - Kis Terem": 4000,
};

export const emailPattern = "[A-Za-z0-9.!#$%&'*+\\/=?^_`\\{\\|\\}~\\-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9\\-]*[A-Za-z0-9])?\\.)+[A-Za-z]{2,}";

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

  // Budapest helyi idejéhez hasonlítunk, függetlenül a szerver időzónájától.
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Budapest", year: "numeric", month: "2-digit",
    day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now).map(({ type, value }) => [type, value]));
  const current = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  const seen = new Set();
  const bookings = [];
  for (const slot of slots) {
    if (!slot || !rooms.includes(slot.room) ||
        (lessonType === "csoportos" && slot.room !== rooms[0]) ||
        typeof slot.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(slot.date) ||
        !Number.isInteger(slot.hour) || slot.hour < 8 || slot.hour > 21) {
      return { error: "Érvénytelen terem vagy idősáv." };
    }
    const date = new Date(`${slot.date}T00:00:00Z`);
    const start = `${slot.date}T${String(slot.hour).padStart(2, "0")}:00`;
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== slot.date ||
        start <= current) {
      return { error: "Az egyik időpont érvénytelen vagy már elmúlt. Válassz másik idősávot." };
    }
    const key = `${slot.room}/${slot.date}/${slot.hour}`;
    if (seen.has(key)) return { error: "Ugyanaz az idősáv többször szerepel." };
    seen.add(key);
    bookings.push({ room: slot.room, date: slot.date, hour: slot.hour, price: roomPrices[slot.room] });
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
