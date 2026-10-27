"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isAdminEmail } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

/*
  Admin belépés egyszer használatos e-mailes kóddal (Supabase Auth OTP).
  Kódot CSAK az mdschool.admins táblában szereplő címek kapnak; másoknak
  ugyanazt az üzenetet mutatjuk, hogy ne lehessen kitalálgatni az admin
  címeket.
*/

export type LoginState = { step: "email" | "code"; email: string; message?: string; error?: string };

const emailSchema = z.string().trim().toLowerCase().email();

/** A kérés eredeti címe (pl. http://localhost:3000 vagy https://admin.<domain>). */
async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Létrehozza a Supabase Auth felhasználót, ha még nincs (a "már létezik" hibát elnyeljük). */
async function ensureAuthUser(email: string) {
  const { error } = await supabaseAdmin().auth.admin.createUser({ email, email_confirm: true });
  if (error && !/already|registered|exists/i.test(error.message)) {
    console.error("[login] felhasználó létrehozása sikertelen:", error.message);
  }
}

async function requestLoginCode(formData: FormData): Promise<LoginState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { step: "email", email: String(formData.get("email") ?? ""), error: "Adj meg egy érvényes e-mail címet." };
  const email = parsed.data;

  if (await isAdminEmail(email)) {
    // Az admin felhasználót mi hozzuk létre (service role), így a közös Supabase
    // projektben a nyilvános regisztráció kikapcsolva maradhat.
    await ensureAuthUser(email);
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        // Ha az e-mail sablon kód helyett linket küld (pl. a Supabase alap
        // sablonja), a link ide tér vissza — lásd app/(admin)/admin/auth/callback.
        emailRedirectTo: `${await requestOrigin()}/admin/auth/callback`,
      },
    });
    if (error) {
      console.error("[login] OTP küldési hiba:", error.message);
      const tooMany = error.status === 429 || /rate|seconds/i.test(error.message);
      return {
        step: "email",
        email,
        error: tooMany
          ? "Túl sok kódot kértél rövid idő alatt. Várj egy percet, és próbáld újra."
          : "Nem sikerült elküldeni a kódot. Próbáld újra pár perc múlva.",
      };
    }
  }
  return {
    step: "code",
    email,
    message: "Ha ez a cím admin jogosultságú, elküldtük rá a belépési kódot (vagy linket). Írd be a kódot, vagy kattints a levélben lévő linkre ugyanebben a böngészőben.",
  };
}

async function verifyLoginCode(formData: FormData): Promise<LoginState> {
  const email = emailSchema.safeParse(formData.get("email"));
  const token = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!email.success) return { step: "email", email: "", error: "Kezdd újra az e-mail cím megadásával." };
  if (!/^\d{6,10}$/.test(token)) return { step: "code", email: email.data, error: "A kód 6 számjegyből áll." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.verifyOtp({ email: email.data, token, type: "email" });
  if (error) return { step: "code", email: email.data, error: "Hibás vagy lejárt kód. Kérj újat, ha kell." };

  if (!(await isAdminEmail(email.data))) {
    await supabase.auth.signOut();
    return { step: "email", email: "", error: "Ehhez a címhez nincs admin jogosultság." };
  }
  redirect("/admin");
}

/** Egyetlen belépési action: kódkérés, vagy (ha van "code" mező) a kód ellenőrzése. */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  return formData.has("code") ? verifyLoginCode(formData) : requestLoginCode(formData);
}
