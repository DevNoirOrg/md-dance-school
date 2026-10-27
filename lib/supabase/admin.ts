import "server-only";
import { createClient } from "@supabase/supabase-js";

/*
  Szerveroldali, teljes jogú Supabase kliens (service role) — CSAK a
  fájltárolóhoz (feltöltési link, törlés). Soha ne kerüljön böngészőbe.
*/
export { MEDIA_BUCKET } from "../format";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Hiányzik a SUPABASE_SERVICE_ROLE_KEY (lásd README → Beállítás).");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
