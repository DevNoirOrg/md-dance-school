# MD Dance School

## Local preview

```bash
npm ci
npm run dev
```

Open http://localhost:3000/studio-berles.

## Booking notifications with Resend

1. Create a Resend account and verify a sender domain.
2. Create an API key with permission to send emails.
3. Copy `.env.example` to `.env.local` and set:
   - `RESEND_API_KEY`: your private Resend API key.
   - `RESEND_FROM_EMAIL`: a verified sender, e.g. `MD Dance School <booking@your-domain.hu>`.
   - `BOOKING_NOTIFICATION_EMAIL`: the recipient of booking notifications.
4. Restart the development server. In deployment, set the same server-side environment variables and redeploy.
5. Submit a booking request to test delivery, then check the Resend delivery log and the recipient's inbox/spam folder.

Never commit `.env.local`, share the API key in chat, or prefix it with `NEXT_PUBLIC_`.
Notifications go to `BOOKING_NOTIFICATION_EMAIL`; the customer's address is the reply-to address.
Missing or invalid recipient configuration prevents submission before a booking is saved.
Both HTML and plain-text notifications include the selected lesson type, contact details, individual slots and total price.
Resend's test sender can only send to the account owner's address; use a verified domain for production.

The API validates contact details and slots, and calculates prices from the shared room data.
Success means Resend accepted the email, not that delivery or approval has completed.
Availability is based exclusively on bookings stored in Supabase; no demo occupied slots remain.
The calendar refreshes pending and approved bookings every 10 seconds and when the window gains focus.
Pending slots are yellow. Email-approved slots are blue ("Foglalás alatt") and remain unavailable
for new requests, but are not final bookings yet. The database status stays `approved`;
no additional completion step is implemented yet. Past slots are gray and cannot be selected.
Rejected slots become available again.
The database prevents overlapping active requests, even when two users submit simultaneously.

## Supabase setup and email decisions

1. Create a Supabase project.
2. Run `supabase/studio-bookings.sql` once in its SQL Editor. This creates the tables, unique active-slot index and atomic decision functions.
3. Add these server-only settings to `.env.local`:
   - `SUPABASE_URL`: your project's URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: the project's service-role key. Never use this key in client code or commit it.
   - `APP_BASE_URL`: `http://localhost:3000` locally; your public HTTPS website URL in production.
4. Restart the preview. Set the same settings on the deployed server.

Email links contain an unguessable decision token; only its SHA-256 hash is stored.
Do not forward these links: possession grants permission to decide that request.
Opening a link does not change any booking. The destination requires an explicit confirmation via POST,
preventing mail link scanners from accidentally changing statuses.
Individual approval/rejection changes only a pending slot. Approve-all approves only pending slots,
and does not override rejected or already approved ones. Repeated clicks are harmless.
Older emails sent before this feature do not have working decision links; submit a new request to test it.
Localhost links work only on the machine running the preview; a public URL is required for other devices.
Public availability responses contain no customer data or tokens; RLS restricts direct table access.
If Resend explicitly rejects sending, the saved request is removed and its slots released.
If sending times out or its result is uncertain, the request stays pending to prevent double booking;
check Resend and the Supabase records before retrying. Such requests can be resolved by the studio
in Supabase if no notification arrives.
Before a public production launch, add abuse protection/rate limiting and define retention for customer data.

Do not run `npm run build` while `next dev` is running: both use `.next`.

## Booking tests

With Node.js 24, run `node --test tests/studio-booking*.test.mjs`.
The API tests use an in-memory PostgreSQL engine (PGlite) to execute the actual SQL schema and
transactions, while mocking Supabase's HTTP interface and Resend. They do not send real emails
or change the configured Supabase database.
