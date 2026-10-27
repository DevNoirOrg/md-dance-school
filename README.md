# MD Dance School

Next.js 16 (App Router, TypeScript, Cache Components) + Tailwind 4 + Supabase.
A közös stack leírása: [STACK.md](STACK.md).

## Helyi futtatás

```bash
nvm use        # Node 22 (.nvmrc)
npm ci
cp .env.example .env.local   # és töltsd ki
npm run dev
```

Adatbázis nélkül (üres `DATABASE_URL`) is elindul: ilyenkor a `lib/defaults.ts`
tartalma látszik, a jelentkezés és az admin nem működik.

Ellenőrzések: `npm run typecheck`, `npm run lint`, `npm test`.

## Beállítás (egyszer)

1. **Adatbázis** — a közös Supabase projekt SQL Editorában futtasd:
   1. `supabase/mdschool.sql` (séma, táblák, RLS, `mdschool` Storage bucket, 1 éves megőrzés)
   2. `supabase/mdschool-seed.sql` — a jelenlegi oldal tartalma (szövegek, árak, órarend,
      tanárok). **Előtte az utolsó sorban írd át az admin e-mail címet a sajátodra.**
      Csak üres táblákat / hiányzó beállításokat tölt fel, újrafuttatható.
   A seed fájlt a `lib/defaults.ts`-ből a `npm run seed:sql` generálja.
2. **pg_cron** (a jelentkezések 1 év utáni automatikus törléséhez):
   Supabase → Integrations → Cron → Enable, majd futtasd újra a `mdschool.sql`-t.
3. **Auth** — Supabase → Authentication:
   - Sign In / Providers → Email: bekapcsolva; „Allow new users to sign up”: **kikapcsolva**
     (az admin felhasználókat az app hozza létre a service role kulccsal).
   - Emails → Magic Link sablon: a `{{ .Token }}` (6 jegyű kód) legyen benne, pl.
     „A belépési kódod: {{ .Token }}”. (Ha linket küld, az is működik: `/admin/auth/callback`.)
   - URL Configuration → Redirect URLs: `https://<admin-cím>/admin/auth/callback`
4. **Környezeti változók** (Vercel → Settings → Environment Variables): lásd `.env.example`.
   Soha ne commitold a `.env.local`-t, ne oszd meg a kulcsokat, és a service role / Resend
   kulcs ne kapjon `NEXT_PUBLIC_` előtagot.
5. **Admin aldomain** (opcionális): `ADMIN_HOST=admin.mddanceschool.hu`, a domaint add hozzá
   a Vercel projekthez. Ekkor a fő domainen a `/admin` 404, az aldomainen minden az adminra
   kerül (`proxy.ts`).

## Admin (`/admin`)

Belépés e-mailes egyszer használatos kóddal; csak a `mdschool.admins` táblában szereplő
címek léphetnek be (Adminok menüpont). Menü:

- **Jelentkezések** — órajelentkezések és tánctábor-jelentkezések (státusz, belső megjegyzés,
  e-mail válasz, CSV export). Az 1 évnél régebbieket a pg_cron törli.
- **Órarend** — termek (fülek), oszlopok (napok), órák; húzással rendezhető.
- **Tanfolyamok**, **Árak**, **Tanárok**, **Hírek** (főoldali plakátok, max. 4),
  **Hero · Rólunk · Szolgáltatások**, **Tánctábor** (árak, turnusok, helyszín, tanárok,
  űrlap opciók), **Űrlap opciók**, **Lábléc**, **Adatkezelés**, **Adminok**.

Mentéskor a publikus oldal azonnal frissül (`updateTag("site-content")`). A feltöltött
képek böngészőben WebP-re alakulnak (max. 1600 px) és a `mdschool` bucketbe kerülnek.

## Jelentkezések

A főoldali / órarendi és a tánctábor űrlap Server Actionnel ment (`app/actions/applications.ts`):
szerveroldali validáció (`lib/application-input.ts`), rejtett csapdamező, IP-nkénti korlát
(5/óra), majd e-mail értesítés az `APPLICATION_NOTIFY_EMAIL` címre (Resend).

## „Írj nekünk” űrlap

`/api/contact` → e-mail a `BOOKING_NOTIFICATION_EMAIL` címre (Resend), a feladó a reply-to.
Adatbázisba nem kerül.

## Stúdióbérlés (`/studio-berles`, multi-zones)

A stúdióbérlés a **md-studio-rental** repóban él, de a látogató és a Google a
`hiphoptanciskola.com/studio-berles` címen látja: az iskola oldala a `/studio-berles` alatti
kéréseket a háttérben a bérlés appnak továbbítja (`next.config.ts` → `rewrites`, Next.js
„multi-zones”). Ez a **kanonikus** cím (a régi, jól rangsorolt SEO miatt); ugyanez a foglaló
a `mddancestudio.com` saját domainen is elérhető, a lapjai a hiphoptanciskola-s címet jelölik
kanonikusnak.

- `STUDIO_RENTAL_ORIGIN` — a bérlés app címe (pl. `https://mddancestudio.com`), build időben olvasva:
  változás után redeploy. Üresen a `/studio-berles` 404.
- Ugyanígy működnek a régi e-mailek jóváhagyó linkjei (`/studio-berles/dontes?…`) és a bérlés
  admin (`/studio-berles/admin`). Az iskola saját adminja a `/admin`.
- A menü „Stúdió bérlés” pontja sima `<a>` link (zónák között teljes oldalbetöltés kell).
