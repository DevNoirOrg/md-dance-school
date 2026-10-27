import { NextResponse } from "next/server";
import { buildContactEmail, emailPattern, validateContact } from "@/lib/contact";

// „Írj nekünk” űrlap → e-mail a stúdiónak Resenddel (ugyanaz a Resend fiók, mint a stúdióbérlés oldalon).
export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen kérésformátum." }, { status: 400 });
  }
  // Egyszerű spam-csapda: a rejtett mezőt ember nem tölti ki.
  const website = (input as { website?: unknown } | null)?.website;
  if (typeof website === "string" && website.trim()) {
    return NextResponse.json({ success: true });
  }
  const { contact, error } = validateContact(input);
  if (!contact) return NextResponse.json({ error }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const recipient = process.env.BOOKING_NOTIFICATION_EMAIL?.trim();
  if (!apiKey || !from || !recipient || !new RegExp(`^${emailPattern}$`).test(recipient)) {
    console.error("Contact email configuration missing.");
    return NextResponse.json(
      { error: "Az üzenetküldés még nincs beállítva. Kérjük, írj nekünk e-mailt vagy hívj minket." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [recipient], reply_to: contact.email, ...buildContactEmail(contact) }),
      signal: AbortSignal.timeout(15_000),
    });
    const result = (await response.json().catch(() => ({}))) as { id?: string; name?: string; message?: string };
    if (!response.ok || !result.id) {
      console.error("Resend rejected contact email.", { status: response.status, code: result.name, message: result.message });
      return NextResponse.json({ error: "Nem sikerült elküldeni az üzenetet. Kérjük, próbáld újra később." }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact email request failed.", { name: err instanceof Error ? err.name : "unknown" });
    return NextResponse.json({ error: "Nem sikerült elküldeni az üzenetet. Kérjük, próbáld újra később." }, { status: 502 });
  }
}
