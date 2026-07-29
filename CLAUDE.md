# LegalBridge — Build Spec

> **How to use this file:** save it as `CLAUDE.md` in the repo root. Claude Code reads it automatically on every session. Then work through `TASKS` below one at a time — paste a single task number as your prompt (`Do Task 3.`). Do not paste the whole file as a prompt.

---

## 1. Context

LegalBridge is a marketplace connecting Indian clients with verified lawyers. Pick a legal category (divorce, property, criminal…), see matched lawyers with transparent fixed fees, book a slot, pay, then chat and video-consult.

**This build is a demo for a pitch competition.** It has 2 days of solo build time. It will be walked through live on a projector for ~90 seconds by a non-technical presenter. It will never take real money or real users.

That single fact drives every decision below. Optimize for: *looks finished, every click works, nothing 500s on stage.* Do not optimize for: security, scale, correctness under concurrency, real integrations.

---

## 2. Locked stack — do not propose alternatives

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Database | Neon Postgres (serverless) |
| ORM | Prisma |
| Icons | lucide-react |
| Fonts | `next/font/google` + `geist` package |
| AI chatbot | `@anthropic-ai/sdk` + `ai` (Vercel AI SDK) |
| Deploy | Vercel |

Package manager: `pnpm`.

---

## 3. Non-goals — actively refuse to build these

If a task seems to require one of these, build the **fake** listed instead and move on.

| Not building | Build instead |
|---|---|
| Real auth / OTP / passwords | Role-switcher: three buttons set a `lb_session` cookie holding a seeded user id |
| Razorpay / any payment gateway | `/book/[id]/pay` — a checkout-looking page, 1.8s spinner, always succeeds |
| WebRTC peer connection | Video room page with local `getUserMedia` self-preview + a static "lawyer" tile + working mute/camera/end buttons |
| WebSockets / Supabase Realtime | Chat polls `GET /api/chat/[bookingId]` every 2000ms |
| Email / SMS | Toast notification only |
| File upload | Static placeholder document cards |
| Search engine | Prisma `contains` on name + city, case-insensitive |
| i18n / multi-language | A language dropdown in the header that is visually present and does nothing |
| Tests | None. Zero test files. |

Do not add auth middleware, rate limiting, input sanitisation beyond Prisma's defaults, or error monitoring.

---

## 4. Design direction

The default AI look for this brief would be cream background + serif headline + terracotta accent. Do not build that.

Ground the design in the actual world of Indian legal practice: advocates' black-and-white court dress, judicial stamp paper, and the red cloth tape that binds court files.

### Tokens — define these in `app/globals.css` as CSS variables and use them everywhere

```css
--ink:    #1B2A41;  /* deep navy — headings, primary surfaces */
--paper:  #F7F6F3;  /* warm neutral page background */
--tape:   #C4302B;  /* file-binding crimson — accent, used sparingly */
--stamp:  #2F6F5E;  /* stamp-paper green — verified state only */
--slate:  #5C6B7A;  /* secondary text */
--rule:   #E2DFD8;  /* hairlines, borders */
```

No gradients. No glassmorphism. No purple. `--tape` appears on maybe four elements per page, never as a large fill.

### Type

| Role | Face | Use |
|---|---|---|
| Display | **Bricolage Grotesque** (700) | h1, h2, lawyer names, section heads |
| Body | **Newsreader** (400/500) | paragraphs, bios, descriptions |
| Utility | **Geist Mono** | ₹ amounts, BCI numbers, timestamps, tier labels |

This is deliberately inverted from the usual serif-display/sans-body pairing. Keep it.

Scale: `h1 clamp(2.5rem, 5vw, 4rem)`, `h2 2rem`, body `1.0625rem/1.65`, mono `0.8125rem` with `letter-spacing: 0.02em` and uppercase for labels.

### Signature element — the Fee Breakdown card

The pitch's whole claim is price transparency. So make the transparency literal and put it where nobody else does: **on the lawyer profile page, before booking.**

A bordered card, mono-set, showing:

```
CONSULTATION            ₹549
─────────────────────────────
Lawyer receives         ₹440
Platform fee            ₹109
─────────────────────────────
30 minutes · video or chat
```

Thin `--tape` rule across the top of this card. This is the one bold thing on the page — everything else stays quiet.

### Quality floor

Responsive to 375px. Visible `:focus-visible` rings in `--ink`. `prefers-reduced-motion` respected. Every list has a designed empty state. Every button has a loading state. Real Indian copy — no lorem ipsum, no "Lawyer One".

---

## 5. Directory structure

```
app/
  layout.tsx                    # fonts, header, footer
  page.tsx                      # landing
  globals.css
  categories/page.tsx           # all 8 categories
  lawyers/page.tsx              # listing + filters (searchParams driven)
  lawyers/[id]/page.tsx         # profile + fee card + slot picker
  book/[id]/pay/page.tsx        # mock checkout
  book/[id]/confirmed/page.tsx  # success
  consult/[bookingId]/page.tsx  # chat
  consult/[bookingId]/room/page.tsx  # video room
  me/page.tsx                   # client: my consultations
  lawyer/                       # lawyer dashboard (route group)
    page.tsx                    # today's bookings + earnings
    inbox/page.tsx
    profile/page.tsx
  admin/
    page.tsx                    # stats
    verification/page.tsx       # approve/reject queue
    lawyers/page.tsx
    bookings/page.tsx
  api/
    chat/[bookingId]/route.ts   # GET messages, POST message
    assistant/route.ts          # streaming AI chatbot
    session/route.ts            # POST role switch
components/
  ui/                           # shadcn
  site-header.tsx
  lawyer-card.tsx
  fee-breakdown.tsx             # the signature component
  slot-picker.tsx
  chat-thread.tsx
  assistant-widget.tsx          # floating chatbot
  verified-badge.tsx
  empty-state.tsx
lib/
  db.ts                         # prisma singleton
  session.ts                    # cookie read/write, getCurrentUser()
  money.ts                      # split calc, ₹ formatting
prisma/
  schema.prisma
  seed.ts
```

---

## 6. Database schema

Use exactly this. Do not add fields.

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Role   { CLIENT LAWYER ADMIN }
enum Tier   { LOWER MIDDLE HIGH }
enum Status { PENDING VERIFIED REJECTED }

model User {
  id       String  @id @default(cuid())
  name     String
  phone    String  @unique
  avatar   String
  role     Role    @default(CLIENT)
  lawyer   LawyerProfile?
  bookings Booking[]
}

model Category {
  id      String @id @default(cuid())
  slug    String @unique
  name    String
  icon    String          // lucide icon name
  blurb   String          // one sentence, plain language
  lawyers LawyerProfile[] @relation("LawyerCats")
}

model LawyerProfile {
  id          String @id @default(cuid())
  userId      String @unique
  user        User   @relation(fields: [userId], references: [id])
  bio         String
  city        String
  court       String          // e.g. "Delhi High Court"
  years       Int
  tier        Tier
  fee         Int             // 399 | 549 | 799
  bciNumber   String
  status      Status @default(PENDING)
  rating      Float  @default(4.6)
  reviewCount Int    @default(0)
  languages   String[]
  categories  Category[] @relation("LawyerCats")
  slots       Slot[]
  bookings    Booking[]
}

model Slot {
  id       String        @id @default(cuid())
  lawyerId String
  lawyer   LawyerProfile @relation(fields: [lawyerId], references: [id])
  startsAt DateTime
  booked   Boolean       @default(false)
}

model Booking {
  id          String        @id @default(cuid())
  clientId    String
  client      User          @relation(fields: [clientId], references: [id])
  lawyerId    String
  lawyer      LawyerProfile @relation(fields: [lawyerId], references: [id])
  slotAt      DateTime
  amount      Int
  lawyerCut   Int
  platformCut Int
  paid        Boolean       @default(false)
  createdAt   DateTime      @default(now())
  messages    Message[]
}

model Message {
  id         String   @id @default(cuid())
  bookingId  String
  booking    Booking  @relation(fields: [bookingId], references: [id])
  senderRole Role
  body       String
  createdAt  DateTime @default(now())
}
```

Split rule in `lib/money.ts`: `platformCut = Math.round(amount * 0.20)`, `lawyerCut = amount - platformCut`. Compute once at booking creation and store both.

---

## 7. Seed data spec

`prisma/seed.ts`, run via `pnpm db:seed`. Idempotent — delete all rows first.

**8 categories** with plain-language blurbs written for a scared first-time user, not for lawyers:
divorce & family, property & land, criminal defence, consumer complaint, employment & workplace, startup & company, cheque bounce & recovery, wills & inheritance.

**18 lawyers.** Realistic Indian names spread across regions. Avatars: `https://randomuser.me/api/portraits/{men|women}/{n}.jpg`. Cities: Delhi, Mumbai, Bengaluru, Pune, Jaipur, Lucknow, Hyderabad, Kolkata. Courts named properly ("Karnataka High Court", "Saket District Court").

Distribution:
- 14 `VERIFIED`, 3 `PENDING` (so the admin queue has something to approve on stage), 1 `REJECTED`
- Tier → fee is fixed: `LOWER → 399`, `MIDDLE → 549`, `HIGH → 799`. Roughly 6 / 7 / 5.
- `years`: LOWER 2–5, MIDDLE 6–12, HIGH 13–28
- Each lawyer gets 1–3 categories, 2–4 languages (Hindi, English, Marathi, Kannada, Tamil, Bengali, Gujarati)
- Bios: 2 sentences, specific — mention court, matter types, a real detail. No "passionate about justice".

**Slots:** for each verified lawyer, 8 slots across the next 3 days at 10:00, 11:30, 14:00, 16:30 IST. Mark ~30% `booked` so the picker isn't suspiciously empty.

**Users:** 1 admin (Riva Sharma), 3 clients. Client #1 = Aarav Mehta, the demo persona.

**Pre-seeded demo booking:** Aarav ↔ one HIGH tier lawyer, `paid: true`, slot 2 hours from now, with **6 messages** already in the thread — a realistic short exchange about a property mutation dispute, alternating client/lawyer. This is what gets shown on stage; it must not be an empty chat.

---

## 8. Route specs

Each route is done when its acceptance criteria pass.

### `/` Landing
Hero: headline stating the promise in plain words, one line of support copy, a category search input, and the price ladder (₹399 / ₹549 / ₹799) shown as three mono-set tiers with what each means. Below: the 8 category tiles, a "how it works" 3-step strip, 3 featured verified lawyers, and the free-AI-assistant band.
**Done when:** no placeholder text anywhere, renders clean at 375px, category tile → `/lawyers?category=slug`.

### `/lawyers`
Left rail filters (category, tier, city, language) driven by `searchParams` — server components, no client state. Cards show avatar, name, verified badge, years, court, categories, languages, rating, fee in mono, "View profile".
**Done when:** filters compose, URL is shareable, 0-result state is a designed empty state with a "clear filters" action.

### `/lawyers/[id]`
Two columns. Left: avatar, name, verified badge, court, years, bio, practice areas, languages, rating. Right (sticky): **the Fee Breakdown card**, then the slot picker, then "Book consultation".
**Done when:** the fee card shows the real split from `lib/money.ts`, unbooked slots are selectable, booked slots are visibly disabled, button is disabled until a slot is chosen.

### `/book/[id]/pay`
Creates the `Booking` on arrival (unpaid). Shows an order summary that mirrors the fee card. Fake UPI/card tabs. "Pay ₹X" → 1800ms spinner → sets `paid: true`, marks slot booked, redirects to confirmed.
**Done when:** it looks like a payment page, and refreshing mid-flow doesn't create duplicate bookings.

### `/book/[id]/confirmed`
Success state, booking reference in mono, slot time, lawyer, and two actions: "Open chat" and "Join video room".

### `/consult/[bookingId]`
Chat. Bubbles left/right by `senderRole`, avatar, timestamp, mono time labels. Composer at bottom, Enter to send, optimistic append. Polls every 2000ms. Header shows the lawyer, slot time, and a "Join video" button.
**Done when:** two browser windows (one as client, one as lawyer) exchange messages and both update within ~2s.

### `/consult/[bookingId]/room`
Video room. Local camera preview via `getUserMedia`, muted. A second tile showing the lawyer's avatar with a "connected" indicator. Working mute / camera-off / end-call buttons that change local UI state. End call → back to chat.
**Done when:** the presenter's face appears in the tile. Nothing else matters here.

### `/me`
Client's consultations: upcoming and past, each with lawyer, time, amount paid, and "Open chat".

### `/lawyer`
Earnings card (total received = sum of `lawyerCut` on paid bookings), today's bookings, unread-looking inbox preview, availability toggle (visual only).

### `/lawyer/inbox`
List of threads → opens the same chat component, rendered as `LAWYER`.

### `/lawyer/profile`
Editable bio, city, languages, categories. Saves via server action. Fee and tier shown read-only with the note "Set by LegalBridge during verification."

### `/admin`
Four stat tiles: total lawyers, pending verification, bookings, platform revenue (sum of `platformCut`). Recent bookings table.

### `/admin/verification`
The three `PENDING` lawyers as review cards: BCI number in mono, years, court, documents (static placeholder cards), and Approve / Reject with a tier selector on approve. Server actions, revalidate on submit.
**Done when:** approving a lawyer makes them appear in `/lawyers` immediately. This is the strongest admin moment in the demo — make it feel instant.

### AI assistant
Floating button bottom-right on every public page. Opens a panel. Streams from `/api/assistant` using the Vercel AI SDK with `claude-sonnet-4-6`.
System prompt must: answer basic Indian legal questions in simple language, mix in Hindi if the user writes Hindi, recommend a category and suggest booking, and **always state it is not legal advice and cannot replace a lawyer**. Three suggested starter questions in the empty state.
**Done when:** it streams token by token and the refusal/disclaimer behaviour is visible.

---

## 9. Task list — execute in this order

Commit after every task. Deploy to Vercel after Task 2 and keep deploying.

**Day 1**
1. Scaffold Next.js 15 + TS + Tailwind v4 + shadcn/ui. Install lucide-react, geist, prisma, @prisma/client, @anthropic-ai/sdk, ai. Add fonts, write `globals.css` with the tokens from §4, build `SiteHeader` and the root layout. Commit.
2. Neon project, `DATABASE_URL` in `.env`, paste schema from §6, `prisma db push`, `lib/db.ts`. Deploy to Vercel with the env var. Confirm the deployed URL loads.
3. Write `prisma/seed.ts` per §7 and run it. Verify row counts in Prisma Studio.
4. `lib/session.ts` + `/api/session` + a role-switcher in the header (Client / Lawyer / Admin / Sign out). Cookie-based, no auth.
5. Landing page per §8.
6. `/lawyers` listing with searchParams filters + `LawyerCard` + `VerifiedBadge` + `EmptyState`.
7. `/lawyers/[id]` with `FeeBreakdown` (the signature component — spend real time here) and `SlotPicker`.
8. Booking flow: `/book/[id]/pay` and `/book/[id]/confirmed`.
9. `/me`.

**Day 2**
10. `/api/chat/[bookingId]` GET + POST, then `ChatThread` component, then `/consult/[bookingId]`. Test with two windows.
11. `/consult/[bookingId]/room`.
12. `/lawyer`, `/lawyer/inbox`, `/lawyer/profile`.
13. `/admin`, `/admin/verification`, `/admin/lawyers`, `/admin/bookings`.
14. `/api/assistant` + `AssistantWidget`.
15. **Polish pass.** Walk every route at 375px and 1440px. Fix: overflow, missing loading states, unstyled empty states, any placeholder copy, any console error. Add `loading.tsx` and `error.tsx` at the app root.
16. **Demo rehearsal.** Re-run the seed on production. Walk §11 end to end three times. Fix anything that stutters.

---

## 10. Environment

```
DATABASE_URL=            # Neon pooled connection string
ANTHROPIC_API_KEY=
```

Scripts in `package.json`:
```json
"db:push":   "prisma db push",
"db:seed":   "tsx prisma/seed.ts",
"db:studio": "prisma studio",
"db:reset":  "prisma db push --force-reset && pnpm db:seed"
```

`pnpm db:reset` must work in one command — you will run it right before the pitch.

---

## 11. Demo script (build toward this)

Ninety seconds, one browser, no refreshes that show a blank page.

1. Landing — read the headline, point at the three-tier price ladder
2. Click **Property & land** → listing appears, filter to Bengaluru
3. Open a HIGH-tier lawyer → **pause on the Fee Breakdown card** — "₹799, lawyer gets ₹640, we take ₹159, shown before you pay"
4. Pick a slot → pay → confirmed
5. Open chat — the pre-seeded thread is already there, send one message
6. Join video room — presenter's face appears
7. Switch role to **Admin** → verification queue → approve a pending lawyer → switch back, they're now listed
8. Open the AI assistant, ask "मेरे पड़ोसी ने मेरी ज़मीन पर कब्ज़ा कर लिया है, क्या करूं?" — it streams, answers in Hindi, disclaims, recommends the property category

Anything not on this list is optional.

---

## 12. Working rules for Claude Code

- One task per session. Finish it, verify it in the browser, commit, then start the next.
- Server components by default. `"use client"` only for: slot picker, chat, video room, assistant widget, role switcher.
- Mutations are server actions. Data fetching is direct Prisma calls in server components. No client-side data fetching except the chat poll.
- Never install a library not listed in §2 without asking first.
- If something is ambiguous, pick the option that takes less time and note the choice in a comment. Do not stop to ask about styling details.
- If a task starts sprawling past ~90 minutes, stop and cut scope — the demo script in §11 is the only real requirement.
- Do not refactor working code. Do not write tests. Do not add TODO comments for the "real" version.
