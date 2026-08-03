# LawNest

Marketplace connecting Indian clients with verified advocates: pick a legal
matter, compare advocates at a fixed fee with the split shown before you pay,
book a slot, pay by UPI, then chat and video-consult.

**Stack: Next.js 15 (App Router) + TypeScript + Tailwind v4 + Prisma +
Postgres + Clerk.** There is no Vite in this project and none can be added —
`next build` is the only build.

What is real: authentication (Clerk), the consultation chat, the advocate
dashboard, and paid placement. What is deliberately mock: the UPI payment
confirmation and the video room.

---

## Run it locally

```bash
pnpm install
pnpm db:up          # local embedded Postgres on :5433 — skip if DATABASE_URL points at Neon
pnpm db:reset       # schema + seed (8 matters, 18 catalog advocates, 3 live placements)
pnpm dev            # or: pnpm build && pnpm start
```

`pnpm db:reset` seeds **no** users, bookings or messages. Real people arrive
through Clerk sign-up; chat threads start empty and fill only with real
messages.

### Accounts

| Who | Sign up at | Becomes |
|---|---|---|
| Client | `/sign-up` | `User(role=CLIENT)` + a LawNest ID (`LB-2026-00001`) |
| Advocate | `/lawyer/sign-up` | `User(role=LAWYER)` + a `PENDING` profile to complete |
| Admin | any sign-up with an email listed in `ADMIN_EMAILS` | `User(role=ADMIN)` |

Verification is a one-time code sent to the email address — Clerk's built-in
email code. No SMS, and we never collect Aadhaar, PAN or any government ID.

A new advocate completes `/lawyer/profile` (court, years, enrolment number,
bio, practice areas), then an admin approves them at `/admin/verification`,
which sets their tier and fee and puts them in the public listing.

### Two-window chat check

1. Window A (normal): sign up/in as a client, book and pay for the advocate,
   open the consultation.
2. Window B (incognito): sign in as that advocate, open the same thread from
   `/lawyer/inbox`.
3. Messages appear in the other window within ~2s, both directions, and
   survive a refresh.

---

## Environment

```
DATABASE_URL=                        # Neon pooled connection string
DIRECT_URL=                          # Neon direct string (prisma db push / migrate)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # Clerk
CLERK_SECRET_KEY=                    # Clerk
ADMIN_EMAILS=                        # comma-separated; these become ADMIN
DEEPSEEK_API_KEY=                    # AI assistant (optional)
NEXT_PUBLIC_UPI_VPA=                 # mock UPI QR payee
NEXT_PUBLIC_UPI_NAME=
```

---

## Deploy to Vercel

1. Push to GitHub, import the repo in Vercel (framework preset: Next.js).
2. Add every variable above to **Production** and **Preview**. Use the Clerk
   **production** instance keys for Production.
3. Push the schema to Neon once, from your machine:
   `DATABASE_URL=<pooled> DIRECT_URL=<direct> pnpm db:deploy && pnpm db:seed`
4. In Clerk: add the Vercel domain to the production instance, enable
   **Email address** + **Password**, and set the verification strategy to
   **Email verification code**.
5. **Google sign-in, on production only.** The development instance uses
   Clerk's shared Google credentials, so "Continue with Google" appears on
   localhost with no setup. A production instance refuses shared credentials
   and simply does not render the button until you supply your own:
   - Google Cloud Console → APIs & Services → Credentials → **Create OAuth
     client ID** → *Web application*.
   - Clerk → **SSO connections** → Google → toggle **Use custom credentials**.
     Clerk then shows the exact **Authorized redirect URI** (of the form
     `https://clerk.<your-domain>/v1/oauth_callback`) — paste it into the
     Google client's *Authorized redirect URIs*.
   - Paste Google's **Client ID** and **Client Secret** back into Clerk, save,
     and add your domain to the Google client's *Authorized JavaScript
     origins*.
   - While the Google app is in *Testing*, only accounts listed under
     **Audience → Test users** can sign in. Publish it, or add the demo
     account, or the button will appear and then fail at Google's screen.
6. Deploy. `postinstall` runs `prisma generate`, so the build has a client.

### Demo-day shortcut: skip step 5

Step 5 is a Google Cloud project, an OAuth client and a consent screen —
maybe twenty minutes, and it fails closed if the app is still in *Testing*.
For a pitch that never takes a real account, put the **development** Clerk
keys (`pk_test_…` / `sk_test_…`, the pair already in your local `.env`) into
Vercel's Production environment instead of the `pk_live_…` pair, and redeploy.

Google sign-in then works immediately, because a development instance uses
Clerk's shared Google credentials. The cost is a small "Development mode"
line under the sign-in box, and dev instances are not for real users — fine
for a demo, not for launch. To go live properly, swap the live keys back in
and do step 5.

Live checks: client sign-up with the email code → book → pay → chat;
advocate sign-in → `/lawyer/inbox` → reply; messages both ways. If chat looks
frozen in production it is always one of: route handler not `force-dynamic`,
a poll without `cache: 'no-store'`, an absolute fetch URL, or the non-pooled
Neon string.

---

## Revenue: paid placement

Advocates can pay to rank above organic results. Basic ₹999/mo, Featured
₹2,499/mo, Spotlight ₹4,999/mo. `/admin/promotions` toggles a campaign live
and shows promotion MRR, active campaigns and slots filled.

Rules that keep it honest: every promoted card carries a `PROMOTED` label,
promoted advocates appear **only** when they match the client's active
filters, each appears once, and an expired `promotedUntil` silently falls
back to organic.

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm db:up` | local embedded Postgres on port 5433 |
| `pnpm db:push` / `pnpm db:deploy` | push `prisma/schema.prisma` to the database |
| `pnpm db:seed` | categories, catalog advocates, slots, launch placements |
| `pnpm db:reset` | push + seed in one command |
| `pnpm db:studio` | Prisma Studio |
| `pnpm build` / `pnpm start` | production build and server |

LawNest is a technology platform, not a law firm, and does not provide legal
advice. Paid ranking and the fee model sit in the Bar Council of India
advertising/solicitation grey area — get legal sign-off before charging real
advocates or pointing real users at it.
