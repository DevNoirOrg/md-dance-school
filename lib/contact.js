// E-mail-cím minta (korábban a stúdióbérlés könyvtárából jött; az a md-studio-rental repóba költözött).
export const emailPattern = "[A-Za-z0-9.!#$%&'*+\\/=?^_`\\{\\|\\}~\\-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9\\-]*[A-Za-z0-9])?\\.)+[A-Za-z]{2,}";

// „Írj nekünk” űrlap: ellenőrzés és e-mail összeállítás (a szerver és a tesztek is ezt használják).

const LIMITS = { name: 200, email: 254, phone: 40, message: 5000 };

export function validateContact(input) {
  if (!input || typeof input !== "object") return { error: "Hiányzó adatok." };
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";

  if (!name || name.length > LIMITS.name) return { error: "Add meg a neved (legfeljebb 200 karakter)." };
  if (!email || email.length > LIMITS.email || !new RegExp(`^${emailPattern}$`).test(email)) {
    return { error: "Adj meg egy érvényes e-mail címet." };
  }
  if (phone && (phone.length > LIMITS.phone || !/^[+\d\s()-]{6,}$/.test(phone))) {
    return { error: "Ellenőrizd a telefonszámot." };
  }
  if (!message || message.length > LIMITS.message) {
    return { error: "Írd meg az üzeneted (legfeljebb 5000 karakter)." };
  }
  if (input.consents?.tajekoztato !== true || input.consents?.adatkezeles !== true) {
    return { error: "Az elküldéshez el kell fogadnod az adatkezelési tájékoztatót és hozzá kell járulnod az adatkezeléshez." };
  }
  return { contact: { name, email, phone, message } };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

export function buildContactEmail({ name, email, phone, message }) {
  const lines = [`Név: ${name}`, `E-mail: ${email}`, phone && `Telefon: ${phone}`].filter(Boolean);
  return {
    subject: `Új üzenet a weboldalról – ${name}`,
    text: ["Új üzenet érkezett az „Írj nekünk” űrlapon.", "", ...lines, "", "Üzenet:", message, "",
      "Válaszolj erre az e-mailre: a válasz közvetlenül a feladónak megy."].join("\n"),
    html: `<!doctype html><html lang="hu"><body style="margin:0;background:#f7f7f7;font-family:Arial,sans-serif;color:#111">
      <div style="max-width:640px;margin:24px auto;padding:24px;background:white;border-radius:16px">
        <h1 style="border-bottom:4px solid #40CFD5;padding-bottom:16px;font-size:22px">Új üzenet a weboldalról</h1>
        <p><strong>Név:</strong> ${escapeHtml(name)}<br>
        <strong>E-mail:</strong> ${escapeHtml(email)}${phone ? `<br><strong>Telefon:</strong> ${escapeHtml(phone)}` : ""}</p>
        <h2 style="font-size:16px">Üzenet</h2>
        <p style="white-space:pre-wrap;background:#f7f7f7;border-radius:12px;padding:16px">${escapeHtml(message)}</p>
        <p style="font-size:12px;color:#666">Válaszolj erre az e-mailre: a válasz közvetlenül a feladónak megy.</p>
      </div></body></html>`,
  };
}
