# LegalBridge — Working Chat + Lawyer Login + Realism (Demo Tomorrow)

> Restyle/behaviour pass on the existing working build. Do NOT change the Prisma schema (except the one addition noted), the seed's core structure, or break the consultation loop. Deadline is tomorrow — favour reliability over cleverness.
>
> **Deployment reality — read first:** this is a **Next.js** app. It does **NOT** use Vite and cannot be deployed with Vite. Do not add Vite, do not touch `vite.config`, do not suggest it. The only valid targets are (a) running it locally for the demo, or (b) Vercel. Both are covered in Task 4. The chat works on both.
>
> Order: Task 1 (lawyer login) → Task 2 (chat 100% working) → Task 3 (fill the empty sides) → Task 4 (deploy). Commit after each. Show me before moving on.

---

## Task 1 — Lawyer login + a real lawyer portal

Today auth is a role-switcher. Give lawyers a proper, separate sign-in and area so a lawyer can log in and see their consultations.

**`/lawyer/login`** (public):
- A clean sign-in page: heading "Advocate sign-in", and a **selectable list of the seeded advocates** ("Sign in as Adv. Meera Nair — Karnataka High Court"). Picking one calls a server action that sets the session cookie to `{ role: LAWYER, userId: <that lawyer's user id> }` and redirects to `/lawyer`.
- This is demo auth — no passwords. Keep it that way; it's reliable and fast. A one-line note on the page: "Demo sign-in."
- Also add a matching **`/login`** for clients that signs in as the seeded demo client (Aarav Mehta) the same way, so the two sides are clearly separate identities in the demo.

**Lawyer area** (all require `role === LAWYER`; if not, redirect to `/lawyer/login`):
- `/lawyer` — dashboard: earnings (Σ lawyerCut on this lawyer's paid bookings), today's consultations, an inbox preview, availability toggle (visual).
- `/lawyer/inbox` — **lists every PAID booking assigned to this logged-in lawyer**, most recent first, including ones with zero messages yet (label those "New consultation · no messages yet"). Each row → opens that thread's chat rendered as LAWYER.
- `/lawyer/profile` — editable bio/city/languages/categories; fee + tier read-only.

The nav should show the lawyer's name + "Sign out" when signed in as a lawyer, and a "For advocates" link to `/lawyer/login` when not.

**Seed check:** make sure the pre-seeded paid booking's lawyer is one you can sign in as, and that Aarav↔that lawyer booking shows in both that lawyer's `/lawyer/inbox` and Aarav's `/me`. That single booking is the ready-made demo thread.

---

## Task 2 — Make the text chat 100% working, both directions

The chat is table + polling. That genuinely works for a two-window demo — a client in one window and the lawyer in another both read/write the same `Message` table. Two bugs make it *look* frozen; fix both.

### Bug 1 — Next.js caching (this is the usual culprit)
App Router caches route handlers and `fetch` by default, so new messages never appear.
- In `app/api/chat/[bookingId]/route.ts` add `export const dynamic = 'force-dynamic';` and `export const revalidate = 0;`
- Every client-side poll fetch must use `{ cache: 'no-store' }`.

### Bug 2 — absolute URLs
Any `fetch("http://localhost:3000/api/...")` breaks when deployed. Use **relative** paths only: `fetch("/api/chat/" + bookingId, { cache: 'no-store' })`.

### The contract
- `GET /api/chat/[bookingId]` → messages for that booking, ordered `createdAt asc`. Returns `[]` for a new thread, never 404s on an empty thread.
- `POST /api/chat/[bookingId]` `{ body }` → reads `senderRole` from the **session** (LAWYER or CLIENT), inserts the message, returns the created row. Never trust a role from the request body.
- Guard: only the booking's client or its assigned lawyer (by session) may GET/POST. Reject others with 403. Keep the check simple (cookie role + id match) — don't over-engineer.

### `ChatThread` component
- Polls `GET` every **2000ms** with `no-store`; merges by message id (no duplicates).
- Send: optimistic append, POST, reconcile on response; on failure show a small "not sent — retry" state, don't lose the text.
- Bubbles: current user's messages right (oxblood-tint), the other party left (`--surface-2`), avatar + mono timestamp.
- Sticky header: other party's name + online dot + "Join video". Paid banner. Composer pinned bottom, Enter sends.
- Same component renders for both roles — side is decided by `senderRole === session.role`.

### Prisma on serverless
Ensure `lib/db.ts` is the standard global singleton so Vercel doesn't exhaust connections. (`globalThis.prisma ??= new PrismaClient()`.)

### Acceptance for chat (must pass)
Open two browsers. Window A: sign in at `/login` (client), open the paid consultation. Window B: sign in at `/lawyer/login` as that lawyer, open the same thread from `/lawyer/inbox`. A message sent in either window appears in the other within ~2 seconds. This must work both directions. Prove it before calling Task 2 done.

---

## Task 3 — Fill the empty sides, make it feel real

It still reads sparse. Fix with width, full-bleed rhythm, brand texture, and a bit more content — not by stretching text.

**Width & rhythm**
- Main container `--maxw: 1240px`; listing `1320px`. Side gutters `clamp(20px, 5vw, 64px)`.
- Alternate **full-bleed section bands**: page is `--paper`; every other section gets a full-width `--surface-2` band (edge to edge, content still in `.container`). This gives vertical rhythm so the eye stops reading the side gutters as "empty".

**Brand texture in the gutters** (this directly kills the empty feeling)
- Add a faint engraved motif anchored behind the hero and the footer: thin concentric rings and/or a line-art scales-of-justice, `--ink` at `opacity: .04–.06`, positioned to bleed off one edge. It fills negative space with intentional brand instead of blank ivory. Pure CSS/SVG, `prefers-reduced-motion` safe (static).

**Verify the two-column layouts actually applied**
- Hero: two columns — text left, a live "Advocates online now" panel (2 stacked real lawyer cards + pulsing count) right.
- Payment: two columns — QR/pay left, order summary + "what happens next" right.
- Chat: two-pane — thread left, a consultation side panel right (lawyer mini-profile, slot time, visual session timer, matter, 2 document placeholders).
If any of these are still single-column, that's why they look empty — implement them.

**Add realism content (fills horizontal space, reads legit)**
- A **stats band** under the hero: "180 verified advocates · 12 high courts · 2,400 consultations booked" (from seeded/faked counts), 3–4 across.
- A **testimonials row** (3 cards, real Indian names + cities, believable quotes about fixed fees / getting a real advocate).
- A **"How it works"** 3-step strip if not already present.
- A richer **footer**: 4 columns (Legal matters, For clients, For advocates, Company) with real links to existing routes. A full footer makes every page end complete instead of trailing off.

**Centered single-column pages** (confirmed, /me empty states): cap width ~720px and wrap in a bordered "document" card on a `--surface-2` band so being centered looks deliberate, like a filed document, not marooned.

---

## Task 4 — Ship it for tomorrow (Next.js, not Vite)

**Primary plan — present from localhost (most reliable, zero deploy risk):**
1. `pnpm db:reset` (clean seed: advocates, the pre-seeded paid chat).
2. `pnpm build && pnpm start` → serves the production build on `http://localhost:3000`. Use this for the demo, not `pnpm dev` (dev is slower and noisier).
3. For the two-window chat demo, use two browser profiles or one normal + one incognito window so the sessions are separate.

**Optional — put it online on Vercel (only if you want a public URL):**
1. Push to GitHub, import the repo in Vercel.
2. Set env vars in Vercel: `DATABASE_URL` (Neon **pooled** string), `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_UPI_VPA`, `NEXT_PUBLIC_UPI_NAME`.
3. Deploy. The polling chat + all routes work on Vercel serverless — provided Task 2's `dynamic = 'force-dynamic'`, `no-store`, relative URLs, and the Prisma singleton are done. Verify those first or chat will look frozen in production.

Do **not** introduce Vite, `vite.config`, or any Vite tooling — it does not apply to a Next.js app and will break the build.

---

## Final acceptance (before you call it done)

- A lawyer can sign in at `/lawyer/login`, land on `/lawyer`, open `/lawyer/inbox`, and see their paid consultations (including new ones with no messages).
- Two-window test: client and lawyer exchange messages live, both directions, updating within ~2s — on `pnpm start`, and on Vercel if deployed.
- No page has large empty side gutters: hero, payment, and chat are two-region; sections alternate bands; the footer is full; brand texture fills the hero/footer gutters.
- The full loop still works: matter → filter → profile → UPI pay → chat → video.
- No Vite anywhere. Stack is Next.js.

---

## Paste this into Claude Code

```
Read CHAT-AND-POLISH.md in full. This is our final pass before a demo tomorrow.
Stack is Next.js — do NOT add or mention Vite; it doesn't apply and will break
the build. Don't break the existing consultation loop.

Do Task 1: build /lawyer/login (demo sign-in by selecting a seeded advocate) and
a matching /login for the demo client, gate the /lawyer area to role LAWYER, and
make /lawyer/inbox list every PAID booking for the signed-in lawyer including
ones with no messages yet. Confirm the pre-seeded paid booking shows in both that
lawyer's inbox and the client's /me. Show me, then stop.
```

Then: `Do Task 2` (prove the two-window chat live before continuing) → `Do Task 3` → `Do Task 4`.

The one that matters most is Task 2 — do not let it be called done until two windows actually exchange messages both ways.
