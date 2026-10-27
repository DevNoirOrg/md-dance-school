import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "./db";
import { supabaseServer } from "./supabase/server";

/*
  Adat-hozzáférési réteg az adminhoz. Az admin = bejelentkezett Supabase
  felhasználó, AKINEK az e-mail címe szerepel az mdschool.admins táblában.
  (A Supabase projekt közös a többi MD oldallal és az Under Coverrel, ezért a belépés önmagában nem elég.)
*/

export type Admin = { email: string };

export const getAdmin = cache(async (): Promise<Admin | null> => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (error || !email) return null;
  return (await isAdminEmail(email)) ? { email } : null;
});

export async function isAdminEmail(email: string): Promise<boolean> {
  const rows = await db()`select 1 from mdschool.admins where email = ${email.toLowerCase()}`;
  return rows.length > 0;
}

/** Oldalakhoz: ha nincs jogosultság, a belépő oldalra irányít. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/belepes");
  return admin;
}

/** Server Actionökhöz: jogosultság nélkül hibát dob. */
export async function assertAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) throw new Error("Nincs jogosultságod ehhez a művelethez. Jelentkezz be újra.");
  return admin;
}
