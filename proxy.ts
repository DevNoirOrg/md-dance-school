import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/*
  1) Admin subdomain: ha be van állítva az ADMIN_HOST (pl. "admin.mddanceschool.hu"),
     akkor
       - azon a címen minden kérés az /admin útvonalakra kerül
         (admin.mddanceschool.hu/orarend → /admin/orarend),
       - a fő domainen az /admin nem érhető el (404).
     ADMIN_HOST nélkül (fejlesztés, Vercel előnézet) az admin a /admin úton van.
  2) Az admin útvonalakon frissíti a Supabase munkamenetet, és a be nem
     jelentkezett látogatót a belépő oldalra küldi. (A tényleges admin-
     jogosultságot az oldalak és a Server Actionök ellenőrzik: lib/auth.ts.)
*/

const LOGIN_PATH = "/admin/belepes";

export async function proxy(request: NextRequest) {
  const adminHost = process.env.ADMIN_HOST?.toLowerCase();
  const host = (request.headers.get("host") ?? "").toLowerCase().split(":")[0];
  const { pathname, search } = request.nextUrl;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  let rewriteTo: string | null = null;
  if (adminHost) {
    if (host === adminHost) {
      if (!isAdminPath) rewriteTo = pathname === "/" ? "/admin" : `/admin${pathname}`;
    } else if (isAdminPath) {
      return new NextResponse("Not Found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
    }
  }

  const effectivePath = rewriteTo ?? pathname;
  const effectiveIsAdmin = effectivePath === "/admin" || effectivePath.startsWith("/admin/");
  if (!effectiveIsAdmin) return NextResponse.next();

  const makeResponse = () =>
    rewriteTo
      ? NextResponse.rewrite(new URL(rewriteTo + search, request.url), { request })
      : NextResponse.next({ request });

  let response = makeResponse();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let signedIn = false;
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = makeResponse();
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    signedIn = !!data.user;
  }

  const isLogin = effectivePath === LOGIN_PATH || effectivePath === "/admin/auth/callback";
  if (!signedIn && !isLogin) {
    const login = new URL(LOGIN_PATH, request.url);
    const redirect = NextResponse.redirect(login);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    redirect.headers.set("X-Robots-Tag", "noindex");
    return redirect;
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  // statikus fájlok és képek kihagyása
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico|mp4|woff2?)$).*)"],
};
