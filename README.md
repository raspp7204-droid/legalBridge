# LawNest

Marketplace connecting Indian clients with verified advocates: pick a legal
matter, compare advocates at a fixed fee with the split shown before you pay,
book a slot, pay by UPI, then chat and video-consult.

**Stack: Next.js 15 (App Router) + TypeScript + Tailwind v4 + Prisma +
Postgres.** There is no Vite in this project and none can be added — `next
build` is the only build.

---

## Run the demo locally (this is the plan for the pitch)

```bash
pnpm install
pnpm db:up          # local embedded Postgres on :5433 — skip if DATABASE_URL points at Neon
pnpm db:reset       # prisma db push + seed (advocates, slots, the pre-seeded paid chat)
pnpm build
pnpm start          # production build on http://localhost:3000
```

Use `pnpm start`, not `pnpm dev` — the production build is faster and quieter
on stage.

### Two-window chat demo

The chat is a polled `Message` table: both sides read and write the same
booking thread, refreshed every 2 seconds. To show it live you need two
*separate* cookie jars — one normal window and one incognito window (or two
browser profiles).

1. **Window A (client)** — open `http://localhost:3000/login`, sign in as
   **Aarav Mehta**, then open the consultation from `/me`.
2. **Window B (advocate, incognito)** — open
   `http://localhost:3000/lawyer/login`, sign in as **Adv. Meera Nair**, then
   open the same thread from `/lawyer/inbox`.
3. Type in either window. The message appears in the other within ~2s, both
   directions.

Sign-in is demo-only: picking a name sets the `lb_session` cookie to
`ROLE:userId`. No passwords, by design.

### The 90-second walkthrough

Landing → **Property & land** → filter to Bengaluru → open a HIGH-tier
advocate → pause on the fee breakdown → pick a slot → UPI pay → confirmed →
open chat (already has a thread) → join video room → switch to Admin →
approve a pending advocate → open the assistant and ask a question in Hindi.

---

## Environment

`.env`

```
DATABASE_URL=            # local embedded Postgres, or a Neon *pooled* string
NEXT_PUBLIC_UPI_VPA=     # the VPA the payment QR pays to
NEXT_PUBLIC_UPI_NAME=    # payee name shown in the UPI app
```

`.env.local`

```
DEEPSEEK_API_KEY=        # the AI assistant; everything else works without it
```

---

## Optional: deploy to Vercel

1. Push to GitHub and import the repo in Vercel (framework preset: Next.js —
   it is detected automatically).
2. Set `DATABASE_URL` (Neon **pooled** connection string), `DEEPSEEK_API_KEY`,
   `NEXT_PUBLIC_UPI_VPA`, `NEXT_PUBLIC_UPI_NAME` in the project's env vars.
3. Deploy, then seed the Neon database once from your machine:
   `DATABASE_URL=<neon-pooled> pnpm db:reset`.

The polled chat works on serverless because the route handler is
`force-dynamic` with `no-store`, the client fetches relative URLs, and Prisma
is a `globalThis` singleton.

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm db:up` | starts the local embedded Postgres on port 5433 |
| `pnpm db:push` | pushes `prisma/schema.prisma` to the database |
| `pnpm db:seed` | seeds categories, 18 advocates, slots, the demo booking |
| `pnpm db:reset` | push + seed in one command — run this before the pitch |
| `pnpm db:studio` | Prisma Studio |
| `pnpm build` / `pnpm start` | production build and server |
