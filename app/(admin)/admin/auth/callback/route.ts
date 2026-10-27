import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

/*
  Belépés e-mailben kapott LINKKEL (a kód beírása helyett). Két formát kezel:
    ?code=…                    — a Supabase alap "Magic Link" sablonja (PKCE);
                                 ugyanabban a böngészőben kell megnyitni,
                                 ahol a kódot kérték
    ?token_hash=…&type=email   — saját sablonnal készített link
  Siker után csak akkor enged be, ha a cím szerepel az mdschool.admins táblában.
*/
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = (url.searchParams.get("type") ?? "email") as EmailOtpType;

  const fail = (reason: string) => {
    const to = new URL("/admin/belepes", request.url);
    to.searchParams.set("hiba", reason);
    return NextResponse.redirect(to);
  };

  const supabase = await supabaseServer();
  let error: { message: string } | null = null;
  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else {
    return fail("link");
  }
  if (error) {
    console.error("[login] link hiba:", error.message);
    return fail("link");
  }

  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email || !(await isAdminEmail(email))) {
    await supabase.auth.signOut();
    return fail("jog");
  }
  return NextResponse.redirect(new URL("/admin", request.url));
}
