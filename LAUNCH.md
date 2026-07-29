# LegalBridge — LAUNCH.md (one file, full build)

> Turns the demo into a real, Vercel-deployed product for a Shark Tank showcase and public launch. Keep the **Daylight Chambers** theme, the **mock UPI** payment, and the **mock video** room exactly as they are. What becomes REAL: authentication, chat, the lawyer dashboard, and a paid advocate-ranking revenue system. Stack is **Next.js** — no Vite anywhere.
>
> Run the tasks in order. Tasks 1–3 are the real, live core; 4–5 are the commercial upgrades. Commit after each. Once Task 3 is set up, every push auto-deploys to Vercel.

---

## Ground rules (apply to every task)

- **Auth = Clerk** (`@clerk/nextjs`). Do NOT hand-roll passwords, sessions, or OTP.
- **OTP = email code only** (Clerk built-in). No SMS/phone OTP — Indian transactional SMS needs DLT registration, which can't be done same-day. Phone OTP is a later addition.
- **Do NOT collect Aadhaar or any government ID.** Identity is email + a generated LegalBridge id.
- **Payment stays mock** (UPI QR + "I've completed payment"). **Video stays mock.** Don't touch either.
- **Don't break the loop:** matter → filter → profile → pay → chat → video must keep working.
- **No Vite.** Do not add or reference it; it will break the Next.js build.
- **One compliance note:** paid advocate ranking and the fee model sit in the Bar Council of India advertising/solicitation grey area, and you'll be holding real, sensitive client data. Keep the "Promoted" labels honest, add a basic privacy policy, and have your legal advisor (Vishwajeet) sign off before charging real advocates or pointing real users at it. Not legal advice — just the thread most likely to get pulled in diligence.

---

## TASK 1 — Real authentication (Clerk): clients + advocates

Install `@clerk/nextjs`. Wrap the app in `<ClerkProvider>`, add Clerk middleware, and **remove the cookie role-switcher entirely.**

### Flows
- Client: `/sign-up`, `/sign-in`. Advocate: `/lawyer/sign-up`, `/lawyer/sign-in`. Same Clerk flow; the role is assigned on first authenticated visit.
- Clerk sends an **email verification code (OTP)** on sign-up — this satisfies the OTP requirement without SMS.
- On first authenticated visit, upsert a local `User` row keyed by Clerk id with the chosen `role`.

### Schema additions (only these)
```prisma
model User {
  // existing …
  clerkId    String? @unique   // null for seeded catalog advocates
  email      String? @unique
  clientCode String? @unique   // "LB-2026-00042", generated on client signup
}

model LawyerProfile {
  // existing …
  promoted      Boolean   @default(false)
  promotedRank  Int?                        // 1 = top; null if not promoted
  promotedUntil DateTime?                   // campaign end; past = treated as not promoted
  promotedTier  PromoTier @default(NONE)
}

enum PromoTier { NONE BASIC FEATURED SPOTLIGHT }
```
- Generate `clientCode` on client signup: `LB-<year>-<zero-padded sequence>`. Show it on the client's account page as their "LegalBridge ID". Non-sensitive.
- New **advocate** signup → `User(role=LAWYER)` + `LawyerProfile(status=PENDING)` they complete; admin verifies via existing `/admin/verification`. New **client** signup → `User(role=CLIENT)` + `clientCode`.
- Seeded catalog advocates keep `clerkId = null` — they're the browseable roster. **Only advocates with a real Clerk account can log in and reply in chat.** For launch, create 1–2 real advocate accounts (yours, or claim a seeded profile by setting its `clerkId`). If you want to avoid a client booking someone who can't reply, mark seeded-only advocates "consultations opening soon".

### Gating
- Replace every cookie `getCurrentUser()` with Clerk `auth()` / `currentUser()` → look up local `User` by `clerkId`.
- `/lawyer/*` → role LAWYER (else `/lawyer/sign-in`). `/me`, `/book/*`, `/consult/*` → signed-in client (else `/sign-in`). `/admin/*` → role ADMIN.
- Header: signed-out → "Sign in" + "For advocates"; signed-in → name, `clientCode` for clients, Clerk `<UserButton>` / sign-out.

**Stop after Task 1 and show:** client sign-up → email OTP → sign-in, and advocate sign-in, both working. List the env vars + Clerk dashboard settings you need.

---

## TASK 2 — Real chat (no dummy data, live across two tabs)

### Make it real
- **Delete all hardcoded/seeded messages.** No pre-baked conversations. Threads start empty and fill only with real messages.
- One thread per **paid booking** (mock UPI is fine — the booking is still real).
- `POST /api/chat/[bookingId]` derives the sender from the **Clerk session** (local `User` role + id), never from the request body. Guard: only that booking's client or assigned advocate may read/post (else 403).

### Make it work on Vercel (or chat looks frozen)
- Route handler: `export const dynamic = 'force-dynamic';` and `export const revalidate = 0;`
- Client poll: `fetch('/api/chat/'+bookingId, { cache: 'no-store' })` — **relative URL**, never `http://localhost`.
- Poll every 2000ms, merge by message id, optimistic send with retry-on-fail.
- `lib/db.ts` = Prisma global singleton; use the Neon **pooled** connection string on Vercel.

**Acceptance (must pass locally AND on Vercel):** two accounts, two tabs — client books+pays a real advocate account; advocate signs in and opens the thread from `/lawyer/inbox`. A message in either tab appears in the other within ~2s, both directions, persists across refresh. No hardcoded messages anywhere.

---

## TASK 3 — Deploy to Vercel + verify the real core is live

Do this as soon as Tasks 1–2 pass locally.

1. Push to GitHub; import the repo into Vercel.
2. Env vars (Production + Preview):
   - `DATABASE_URL` — Neon **pooled** string
   - `DIRECT_URL` — Neon direct string (for `prisma migrate deploy`)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — Clerk **production** instance
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_UPI_VPA`, `NEXT_PUBLIC_UPI_NAME`
3. Build: ensure `prisma generate` runs (postinstall or build script) and run `prisma migrate deploy` (or `db push`) against Neon.
4. Clerk: add the Vercel domain to allowed origins; configure the production instance.
5. **Verify on the live URL:** client sign-up with email OTP → book → pay → chat; advocate sign-in → inbox → reply; messages flow both ways. If chat looks frozen in prod, re-check Task 2's `force-dynamic` / `no-store` / relative-URL / pooled-connection items — that's always the cause.

Don't point real users at it until this live verification passes and the compliance sign-off is settled.

---

## TASK 4 — Lawyer dashboard as a real management console

Rebuild `/lawyer` into a management dashboard, **same Daylight Chambers theme** (ivory, white cards, oxblood accent, sage, Fraunces + Inter + Geist Mono). All figures from real data for the signed-in advocate.

Layout — KPI row, then two columns:
- **KPI tiles** (mono figures): Total earnings (Σ `lawyerCut` on paid bookings), This month, Pending payout, Consultations (count), Avg rating, Response rate (derived/placeholder %).
- **Earnings over time**: small line/bar chart, last 30 days, `recharts`, themed colours.
- **Consultations table**: date · client (name or `clientCode`) · matter · amount · your cut · platform fee · status.
- **Payout summary card**: available balance, next payout date (visual), 80/20 split reminder.
- **Upcoming consultations** with "Open chat" / "Join video".
- Availability toggle (visual).

Dense and business-like, no empty gutters, full-width container.

---

## TASK 5 — Promoted advocate listings (paid ranking = the revenue system)

The Google-Ads model: advocates pay to rank **above** organic results, always clearly labelled **Promoted**. Real, standard, defensible — and the live admin toggle is your Shark Tank "revenue system, ready to activate" moment.

### Ranking logic
In `/lawyers` and the home featured row:
1. **Promoted block first** — currently-promoted advocates **that match the active filters**, ordered by `promotedRank` asc (rating desc tiebreak). Cap 3 on listing, 3 on home.
2. **Organic block below** — everyone else by the user's chosen sort (default rating desc).

Honesty rules (these are also what keep it defensible):
- Promoted advocates only appear when they **match the active filters** — paid ranking reorders relevant results, never injects irrelevant ones.
- Each promoted advocate appears **once** (promoted block, not duplicated in organic).
- A profile counts as promoted only if `promoted == true` AND (`promotedUntil` null or future) — expired campaigns silently fall back to organic. Build that into the query.
- If no promoted advocate matches, show **no** promoted block (no empty header).

### UI
- Every promoted card carries a small mono `PROMOTED` tag. Non-negotiable — the label is the point.
- Subtle lift only: a `2px solid var(--accent)` top-border or a whisper of `--accent-bg`. Not garish.
- Listing dividers: "Promoted" above the paid block, "All advocates" above organic.
- Home: a "Featured advocates" strip (max 3 promoted), same labels.
- Label hover tooltip: "This advocate has paid for placement."

### Admin — the "ready to activate" panel (`/admin/promotions`)
- Table of all advocates: promote toggle, `promotedTier` selector (Basic/Featured/Spotlight), `promotedRank` input, `promotedUntil` date, implied monthly price (display).
- Summary card: active promotions, **promotion MRR** (Σ tier prices of active campaigns), slots filled vs available.
- Toggling a tier changes live ranking on the client site instantly — that's the demo: "watch me promote this advocate and see them jump to the top."
- Tier prices (align with your deck's ₹2,999 featured idea): Basic ₹999/mo, Featured ₹2,499/mo, Spotlight ₹4,999/mo.

### Launch state
- Seed **2–3 real advocates** as promoted across different tiers so the section and the MRR card aren't empty. Everyone else organic. Story: "inventory built, first placements live, rest available to sell."

---

## FINAL ACCEPTANCE (whole build)

- Clerk auth: client + advocate sign up with email + email-OTP, sign in/out; roles gate the right pages; clients get an `LB-…` id.
- Chat fully real: no hardcoded messages; live both directions across two accounts; persists; works on the Vercel URL.
- Deployed and verified on Vercel.
- Lawyer dashboard shows real earnings/consultations in a management layout, on-theme.
- Promoted listings rank above organic, labelled `PROMOTED`, filter-matched only; `/admin/promotions` toggles live and shows promotion MRR.
- Mock UPI + mock video unchanged. Loop intact. No Vite.

---

## HOW TO RUN IT (paste sequence for Claude Code)

Session 1:
```
Read LAUNCH.md in full. We're turning the demo into a real, Vercel-deployed
product today. Stack is Next.js — no Vite. Keep the Daylight Chambers theme, the
mock UPI payment, and the mock video exactly as they are; don't break the loop.
Auth MUST use Clerk; OTP is Clerk's email code only (no SMS); never collect
Aadhaar or any government ID.

Do TASK 1 only (real Clerk auth for clients and advocates, the schema additions,
the generated LB client id, and page gating). Then STOP and show me client
sign-up → email OTP → sign-in and advocate sign-in both working, and tell me
exactly which env vars and Clerk dashboard settings you need from me.
```

Then, one at a time, checking each before the next:
- `Do TASK 2 from LAUNCH.md.` — prove live two-account chat before continuing.
- `Do TASK 3 from LAUNCH.md.` — deploy and verify on the Vercel URL.
- `Do TASK 4 from LAUNCH.md.`
- `Do TASK 5 from LAUNCH.md.`

If it drifts (rewrites the loop, hand-rolls auth, reaches for Vite, or collects Aadhaar), stop it:
*"Follow LAUNCH.md exactly — Clerk for auth, email OTP only, no Vite, no Aadhaar, don't touch the mock payment/video or break the loop."*

Priority if time runs short: Tasks 1–3 are a real, live, usable product. 4–5 are the commercial upgrades and auto-deploy on push.
```
