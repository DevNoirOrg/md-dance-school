# MD Dance School

## Local preview

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

## Studio rental (moved)

Studio booking (`/studio-berles`, the email decision page and the `/admin` booking calendar)
now lives in the separate **md-studio-rental** repo/site, which uses the same Supabase project
and Resend account. In this repo only the menu link and redirects remain:

- `NEXT_PUBLIC_STUDIO_RENTAL_URL` — public URL of the rental site (e.g. `https://studio.example.hu`).
  The "Stúdió bérlés" menu item points there.
- With this variable set, `next.config.mjs` redirects `/studio-berles` → rental site,
  `/studio-berles/dontes?…` → `<rental>/dontes?…` (so approve/reject links in emails sent before
  the move keep working) and `/admin` → `<rental>/admin`.

The variable is read at build time: redeploy after changing it.

## "Írj nekünk" contact form (Resend)

`/api/contact` sends the form to `BOOKING_NOTIFICATION_EMAIL` with Resend
(`RESEND_API_KEY`, `RESEND_FROM_EMAIL`; the sender's address is the reply-to).
Copy `.env.example` to `.env.local` and fill it in. Never commit `.env.local`, share the API key
in chat, or prefix it with `NEXT_PUBLIC_`.

## Tests

`node --test tests/contact.test.mjs`
