import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { supabaseEnv } from "./env";

/** Supabase kliens a bejelentkezett admin munkamenetéhez (sütikből). */
export async function supabaseServer() {
  // A munkamenet kérésenként más: jelezzük a Next.js-nek, hogy ez csak
  // kérés közben futhat (különben a Supabase kliens Date.now() hívása a
  // statikus előrenderelésbe kerülne).
  await connection();
  const { url, key } = supabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Componentből nem lehet sütit írni — a proxy frissíti a munkamenetet.
        }
      },
    },
  });
}
