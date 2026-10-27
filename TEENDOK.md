# Hátralévő teendők (stack-egységesítés + adminok után)

Mind a négy repóra vonatkozik (md-dance-school, md_dance_company, md-studio-rental, under-cover-dance-school).

## Supabase (közös projekt)

- [ ] **MD Dance School:** SQL Editorban futtasd a `supabase/mdschool.sql`-t, majd a `supabase/mdschool-seed.sql`-t
      (előtte a seed utolsó sorában írd át az admin e-mail címet a sajátodra).
- [ ] **MD Dance Company:** `supabase/mdcompany.sql`, majd `supabase/mdcompany-seed.sql` (admin e-mail átírása!).
- [ ] **Stúdió bérlés:**
  - [ ] futtasd a frissített `supabase/studio-bookings.sql`-t (a régi `public` táblákat adatvesztés nélkül áthelyezi a `rental` sémába),
  - [ ] Project Settings → Data API → **Exposed schemas**: add hozzá a `rental` sémát (enélkül PGRST106 hiba, nem tölt be a naptár),
  - [ ] első admin: `insert into rental.admins (email) values ('te@pelda.hu');`
  - [ ] (az admin átalakítás után) futtasd újra a `supabase/studio-bookings.sql`-t: létrehozza a `rental.rooms` táblát
        (a 4 terem beállításai), a `rental` Storage bucketet (terem képek), és lazítja az időpont-korlátot
        (a nyitvatartás termenként állítható az admin → Termek menüben). Újrafuttatható, foglalást nem töröl.
  - [ ] Admin → Termek: a valódi fotók feltöltése, méretek, árak óratípusonként és nyitvatartás beállítása termenként.
- [ ] **pg_cron** bekapcsolása (Integrations → Cron), utána a `mdschool.sql` és `mdcompany.sql` újrafuttatása (1 éves automatikus törlés).
- [ ] **Authentication:** e-mailes belépés be, „Allow new users to sign up” KI, a Magic Link sablonban legyen `{{ .Token }}`,
      Redirect URL-ek: `https://<iskola>/admin/auth/callback`, `https://<company>/admin/auth/callback`, `https://<bérlés>/admin/auth/callback`.

## Környezeti változók (Vercel + .env.local) — lásd az egyes repók `.env.example` fájlját

- [ ] School: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
      `APPLICATION_NOTIFY_EMAIL`, `IP_HASH_SALT`, `NEXT_PUBLIC_SITE_URL`, `STUDIO_RENTAL_ORIGIN` (+ a meglévő Resend).
- [ ] Company: `DATABASE_URL`, Supabase kulcsok, `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (vagy a régi `CONTACT_FROM_EMAIL`), `CONTACT_TO_EMAIL`.
- [ ] Bérlés: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (a meglévő `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` mellé);
      az `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` törölhető.
- [ ] Opcionális: `ADMIN_HOST` (admin aldomain) a Schoolnál és a Companynál.

## Stúdió bérlés — két domain (kanonikus: hiphoptanciskola.com/studio-berles)

- [ ] `mddancestudio.com` megvásárlása, DNS a Vercelre (a Vercel megmutatja a szükséges A / CNAME bejegyzést).
- [ ] Vercel → bérlés projekt → Domains: `mddancestudio.com` (és `www.mddancestudio.com`).
- [ ] Bérlés projekt env: `APP_BASE_URL=https://www.hiphoptanciskola.com` (csak a domain, útvonal nélkül).
- [ ] Iskola projekt env: `STUDIO_RENTAL_ORIGIN=https://mddancestudio.com` (a régi `NEXT_PUBLIC_STUDIO_RENTAL_URL` törölhető), majd redeploy.
- [ ] Supabase → Authentication → Redirect URLs: `https://www.hiphoptanciskola.com/studio-berles/admin/auth/callback`
      és `https://mddancestudio.com/studio-berles/admin/auth/callback`.
- [ ] Élesítés után ellenőrizni: a `hiphoptanciskola.com/studio-berles` betölt, a lap forrásában
      `<link rel="canonical" href="https://www.hiphoptanciskola.com/studio-berles">` van, és a naptár betölt.
- [ ] Ha a régi élő oldal címe (title) / leírása más volt, azt átvenni (SEO).
- [ ] Google Search Console: `hiphoptanciskola.com` tulajdonba vétele, ha még nincs; a `/studio-berles` URL-ellenőrzése.

## MD Dance Company

- [ ] Sanity tartalom átköltöztetése: `npm run migrate:sanity -- --dry`, majd `npm run migrate:sanity`, utána redeploy.
- [ ] ⚠️ A régi `.env.example`-ben valódi Sanity API token volt — vond vissza a Sanity felületén (migrációhoz új, csak olvasási token kell).
- [ ] Adatkezelési tájékoztató hiányzik, pedig a „Contact us” üzenetek már adatbázisba kerülnek.

## Tartalom (adminban)

- [ ] Tánctábor álló reel-videója (Tánctábor menü).
- [ ] Tanárok valódi Instagram-videó linkjei (Tanárok menü).
- [ ] Órarend péntek: valódi órák (Órarend menü).
- [ ] Lábléc közösségi linkjei (Lábléc menü).

## Élesítés után kipróbálni

- [ ] E-mailes kódos belépés mindhárom adminban.
- [ ] Képfeltöltés (School, Company) — helyben nem lehetett tesztelni.
- [ ] Egy-egy próba jelentkezés / üzenet → megjön-e az értesítő e-mail.

## Git

- [ ] A változások commitolása mind a négy repóban.
