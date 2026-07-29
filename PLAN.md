# LegalBridge — Astrotalk-grade Build (v2)

> **This file supersedes the design and task sections of CLAUDE.md.** Keep CLAUDE.md's schema (§6), seed spec (§7), and non-goals (§3). Replace its design (§4) and task list (§9) with everything below.
>
> **How to use:** save as `PLAN.md` next to `CLAUDE.md`. Then paste tasks one at a time. Start with the message in §9.

---

## 0. What went wrong last time — read this first

Claude Code built the landing page + AI assistant and stopped. The product is the **consultation loop**, not the landing page:

```
choose legal matter → see ranked lawyers → filter → open lawyer
→ pay by UPI → chat unlocks → consult
```

**Rule for this build: the landing page is the LAST thing polished, not the first thing shipped.** Build the loop first, top to bottom, every page reachable by clicking. Do not spend a second polishing the hero until a client can pay a lawyer and chat.

If any single task runs past ~75 minutes, cut its scope and move to the next — a reachable ugly page beats a perfect dead end.

---

## 1. The reference

We are cloning the *structure and feel* of Astrotalk, not its brand. Take from it:

- **Dark, premium, card-dense** layout with a warm metallic accent and a faint starfield
- A **"LIVE NOW · N online"** status strip that makes the marketplace feel alive
- **Practitioner cards**: avatar with an online ring, name + verified check, experience, language row, specialty tags, rating + order count, live "Online" state, price, and a glowing primary CTA
- A **category grid** with icons and counts
- A **horizontal services/specialty strip**
- **Testimonials** and a **"Featured on" press row**
- Direct **Chat / Call** affordance straight off the card

Translate every astrology concept to law: astrologers → advocates, per-minute → fixed per-consultation, "Vedic/Tarot" tags → "Divorce/Property/Criminal" practice areas, horoscope band → "Know your rights" band.

---

## 2. Design system — dark, legal, premium

Do **not** reuse the light navy/paper theme already in the repo. Replace `app/globals.css` tokens entirely.

We are not copying Astrotalk's lemon-yellow — that would read as a clone. The accent is **aged brass** (the gold of the scales of justice and gilded law-book spines): warm and premium, but its own hue. If the founder wants it more yellow later, it's one hex swap.

```css
:root {
  --bg:        #0D1017;   /* near-black, faint blue-ink */
  --surface:   #151A22;   /* cards */
  --surface-2: #1B222C;   /* hover / elevated */
  --brass:     #D4A24E;   /* primary accent — aged brass/gold */
  --brass-dim: #A87F35;   /* pressed / borders on brass */
  --verified:  #34D399;   /* verified badge + online dot */
  --live:      #F59E0B;   /* LIVE pulse */
  --danger:    #E5484D;   /* few slots left / errors */
  --text:      #F4F1EA;   /* warm white */
  --muted:     #8B95A3;   /* secondary text */
  --rule:      #242C37;   /* hairlines, card borders */
}
```

Rules: dark background everywhere. Cards are `--surface` with a `1px solid --rule` border and a soft shadow, lifting to `--surface-2` on hover with a subtle brass border glow. `--brass` is the accent for one primary CTA per view, price figures, and the LIVE dot — never large fills. `--verified` only on verified/online states. A faint starfield (tiny low-opacity dots, CSS radial-gradients or an SVG, `prefers-reduced-motion` disables any twinkle) sits behind the hero and category sections.

### Type

| Role | Face (`next/font/google`) | Use |
|---|---|---|
| Display | **Fraunces** (opsz 72, wght 600) | hero, section heads, lawyer names — two-tone: white base, one brass word |
| Body | **Inter** (400/500) | paragraphs, bios, UI text |
| Mono | **Geist Mono** | ₹ amounts, BCI numbers, ratings, order counts, timestamps, tier labels (uppercase, `letter-spacing: .04em`) |

Hero headline uses the Astrotalk two-tone trick: most words in `--text`, one word in `--brass`. Example: "Know what the law says, **before** you pay." Scale: `h1 clamp(2.75rem, 6vw, 5rem)`, tight leading (1.02), display font.

### Motion

Card hover lift (2px, 120ms). CTA has a resting brass glow that intensifies on hover. Hero + category tiles fade/slide up on load in a short stagger. LIVE dot pulses. All motion gated behind `prefers-reduced-motion`.

### Quality floor

Responsive to 375px (cards stack, filters become a bottom sheet or collapsible). Visible `:focus-visible` rings in `--brass`. Every list has a designed empty state. Every button has a loading state. Real Indian copy throughout — no lorem, no "Lawyer One".

---

## 3. Component specs (build these as real components in `components/`)

### `LawyerCard` — the workhorse, mirror Astrotalk's card exactly

```
┌────────────────────────────────────────────┐
│ ◉avatar  Adv. Meera Nair  ✓verified   [HIGH]│  ← name Fraunces, tier chip mono
│          13 yrs · Karnataka High Court       │
│  ┌Divorce┐ ┌Property┐ ┌Custody┐              │  ← practice-area tags
│  Kannada · English · Hindi                   │
│  ★ 4.9  · 320 consults          ● Online     │  ← rating mono, online = --verified dot
│  ─────────────────────────────────────────   │
│  ₹799 / consult              [ Consult → ]   │  ← price mono brass, CTA glowing brass
└────────────────────────────────────────────┘
```

- Avatar: circular, `--verified` ring if online, greyscale ring if offline
- Verified check: `--verified` badge next to name; only for `VERIFIED` status
- Tier chip: mono uppercase, brass border — `LOWER / MIDDLE / HIGH`
- "Consult →" → lawyer profile (or straight to pay if the card is on the profile itself)
- Offline lawyers show "Next slot 4:30 PM" instead of the online dot
- Hover: lift + brass border glow

### `CategoryTile` — Astrotalk's category grid

Icon in a tinted square (lucide), category name (Fraunces), `"142 advocates"` count in muted mono, arrow. Tile links to `/lawyers?category=slug`. Grid: 2 cols mobile, 4 cols desktop.

### `LiveStrip`

`● LIVE NOW · 86 advocates online` — brass pulsing dot, mono uppercase. Number is a seeded count. Sits above the hero headline.

### `FeeBreakdown` — keep this from v1, restyled dark

The signature transparency card, on the profile before booking. Mono-set, brass rule across the top:

```
CONSULTATION            ₹799
──────────────────────────────
Advocate receives       ₹640
Platform fee            ₹159
──────────────────────────────
30 min · chat + video · UPI
```

### `FilterRail`

Sticky left rail on desktop, bottom-sheet on mobile. Controls (all drive `searchParams`, server-rendered results):
- Practice area (checkbox list)
- Price: ₹399 / ₹549 / ₹799 (tier)
- Experience: 0–5 / 6–12 / 13+ yrs
- Language (multi)
- City (multi)
- Online now (toggle)
- Sort: rating / price low→high / experience

### `ChatThread` — Astrotalk-style consultation chat

WhatsApp/Astrotalk bubble layout. Client bubbles right (brass-tinted), lawyer bubbles left (`--surface-2`), avatars, mono timestamps. Sticky header: lawyer avatar + name + online dot + "Join video" button. Composer pinned bottom, Enter to send, optimistic append. Polls `GET /api/chat/[bookingId]` every 2000ms. A thin "This consultation is paid · 30 min" banner at top.

### `PaymentSheet` — see §4

### `AssistantWidget`

Already built and working — keep it. Just restyle to the dark theme: brass launcher button bottom-right, dark panel, `FREE · NOT LEGAL ADVICE` label, streaming from `/api/assistant`.

---

## 4. UPI payment — functional, honest, demo-grade

The founder wants "UPI, functional." Real auto-verification needs a payment processor (Razorpay/Cashfree), a registered business, and webhooks — impossible and unnecessary in 2 days. Here is what *is* genuinely functional and looks completely real on stage:

**Generate a real, scannable UPI QR + deep link.** A `upi://pay?...` link opens GPay/PhonePe/Paytm on any phone showing the correct payee and amount. That's real UPI at the interaction level. Auto-confirmation is the only mocked part.

### Build

Install `qrcode.react`. Add `NEXT_PUBLIC_UPI_VPA` and `NEXT_PUBLIC_UPI_NAME` to `.env` (founder puts their own UPI ID, e.g. `founder@okhdfcbank`).

`/book/[id]/pay` shows a `PaymentSheet`:

```
┌───────────────────────────────────────┐
│  Pay ₹799 to LegalBridge              │
│  Consultation with Adv. Meera Nair     │
│                                        │
│   [ QR code ]      Scan with any UPI   │
│                    app to pay ₹799     │
│                                        │
│   or  [ Pay via GPay / PhonePe / Paytm ]│  ← the upi:// intent link (opens app on mobile)
│                                        │
│   Order summary (mirrors fee card)     │
│   ─────────────────────────────────    │
│   [ I've completed the payment → ]     │  ← confirm button
└───────────────────────────────────────┘
```

- QR value: `upi://pay?pa=${VPA}&pn=${NAME}&am=${amount}&cu=INR&tn=LegalBridge-${bookingId}`
- Render it with `<QRCodeSVG value={upiLink} />`, brass on dark
- "Pay via UPI app" button is an `<a href={upiLink}>` — on a phone it launches the UPI app for real
- "I've completed the payment" → server action sets `booking.paid = true`, marks slot booked, redirects to `/book/[id]/confirmed`. This is the mocked step — a 1.5s "Verifying payment…" spinner first so it reads as real.

Note for the founder in a comment: *this shows a real, payable QR but does not auto-verify. For real payments post-demo, swap the confirm step for Razorpay UPI Collect + webhook.* Do not build that now.

Optional stretch only if everything else is done and there's time left: Razorpay test mode checkout as a second tab. Skip otherwise.

---

## 5. Pages — every one must be reachable and non-empty

Acceptance criterion for the whole build: **starting from `/`, a person can reach every screen below by clicking, with zero dead links and zero empty lists.**

| Route | Must contain | Done when |
|---|---|---|
| `/` | LiveStrip, two-tone hero, price ladder (₹399/549/799), category grid, "how it works" 3-step, 4 featured online lawyers (LawyerCard), free-assistant band, testimonials, "featured on" press row, footer | Dark, no placeholder text, clean at 375px, every tile/CTA links somewhere real |
| `/categories` | all 8 CategoryTiles with counts | tile → `/lawyers?category=slug` |
| `/lawyers` | FilterRail + responsive grid of LawyerCards | filters compose via searchParams, URL shareable, designed 0-result state |
| `/lawyers/[id]` | left: profile (avatar, verified, court, years, bio, practice areas, languages, rating, recent-consults count); right sticky: FeeBreakdown → SlotPicker → "Consult ₹X" | fee split real, booked slots disabled, CTA disabled until slot chosen → `/book/[id]/pay` |
| `/book/[id]/pay` | PaymentSheet with real UPI QR (§4) | creates unpaid Booking on arrival; refresh doesn't duplicate; confirm → paid |
| `/book/[id]/confirmed` | success, booking ref (mono), slot, lawyer, "Open chat" + "Join video" | both actions work |
| `/consult/[bookingId]` | ChatThread, pre-seeded thread already populated | two windows (client + lawyer) exchange msgs, update ≤2s |
| `/consult/[bookingId]/room` | local `getUserMedia` self-tile + static lawyer tile + mute/cam/end | presenter's face appears; end → back to chat |
| `/me` | client's upcoming + past consultations | each → its chat |
| `/lawyer` | earnings (Σ lawyerCut on paid), today's bookings, inbox preview, availability toggle (visual) | |
| `/lawyer/inbox` | thread list → ChatThread as LAWYER | |
| `/lawyer/profile` | editable bio/city/languages/categories (server action); fee+tier read-only | saves persist |
| `/admin` | 4 stat tiles (lawyers, pending, bookings, platform revenue = Σ platformCut), recent bookings table | |
| `/admin/verification` | 3 PENDING lawyers as review cards, BCI mono, Approve (with tier) / Reject | approve → lawyer appears in `/lawyers` immediately |
| `/admin/lawyers`, `/admin/bookings` | tables | |

Assistant widget floats on all public pages.

---

## 6. Data & seed — reuse CLAUDE.md §6/§7, with these emphases

- Seed must run clean: `pnpm db:reset` = wipe + push + seed in one command.
- **18 lawyers**, 14 VERIFIED / 3 PENDING / 1 REJECTED, spread across the 8 categories. Tier→fee fixed: LOWER 399 / MIDDLE 549 / HIGH 799. Real names, real courts, `randomuser.me` avatars, 2-sentence specific bios.
- Mark ~40% of lawyers `online` (seed a boolean or derive from a seeded field) so the LIVE strip and online dots aren't empty. If `online` isn't in the schema, add it to `LawyerProfile` as `online Boolean @default(false)` — this is the one schema addition allowed.
- **Pre-seeded paid demo booking** (Aarav Mehta ↔ a HIGH lawyer, `paid:true`, 6 realistic messages about a property mutation dispute). This is what's shown on stage — the chat must not be empty.
- Categories include criminal defence (covers the "murder" case the founder keeps citing) with a plain-language blurb.

---

## 7. Working rules for Claude Code

- **Build the loop before the landing.** Order in §8 is deliberate — obey it.
- Server components by default. `"use client"` only for: FilterRail interactions, SlotPicker, PaymentSheet, ChatThread, video room, AssistantWidget, role switcher.
- Mutations = server actions. Data = direct Prisma in server components. Only the chat poll fetches client-side.
- After each task: run it in the browser, click through it, `git commit`, then next. Deploy to Vercel after the DB is seeded and keep deploying.
- Never install a package outside the locked list + `qrcode.react` without asking.
- Don't refactor working code. No tests. No TODO-for-later comments. No real auth, no real payment gateway.
- Ambiguous? Pick the faster option, leave a one-line comment, keep moving.

---

## 8. Task list — execute top to bottom

Assumes the repo already has: Next.js + Tailwind + shadcn + Prisma + Neon + working assistant.

1. **Re-theme.** Replace `globals.css` tokens with §2. Add Fraunces + Inter + Geist Mono. Rebuild `SiteHeader` (dark, role switcher, brass CTA) and footer. Add the starfield background component. Restyle the existing landing hero to dark two-tone. Commit.
2. **Seed for real.** Add `online` to LawyerProfile, extend `seed.ts` per §6, `pnpm db:reset`, verify counts in Studio. Redeploy.
3. `LawyerCard`, `CategoryTile`, `VerifiedBadge`, `LiveStrip`, `EmptyState` components — built and visible on a scratch page.
4. `/categories` + `/lawyers` listing with `FilterRail` (searchParams-driven) using LawyerCard. **This is the heart — spend real time here.**
5. `/lawyers/[id]` profile + `FeeBreakdown` + `SlotPicker`.
6. **UPI:** install `qrcode.react`, build `/book/[id]/pay` `PaymentSheet` (§4) + `/book/[id]/confirmed`.
7. `/consult/[bookingId]`: `/api/chat/[bookingId]` GET+POST, `ChatThread`, poll. Test two windows.
8. `/consult/[bookingId]/room` video room.
9. `/me`.
10. `/lawyer`, `/lawyer/inbox`, `/lawyer/profile`.
11. `/admin`, `/admin/verification`, `/admin/lawyers`, `/admin/bookings`.
12. **Landing polish pass** — now make `/` beautiful: LiveStrip, featured lawyers, testimonials, press row, how-it-works, assistant band. Restyle assistant widget to dark.
13. **Full-site polish** — walk every route at 375px and 1440px. Fix overflow, missing loading/empty states, placeholder copy, console errors. Add root `loading.tsx` + `error.tsx`.
14. **Rehearsal** — `pnpm db:reset` on prod, walk the demo script (CLAUDE.md §11 + the UPI QR step) three times, fix any stutter.

---

## 9. Exactly what to paste into Claude Code

Session 1:

```
Read CLAUDE.md and PLAN.md. We are pivoting to the dark Astrotalk-grade
design in PLAN.md §2 and building the full consultation loop — the current
build only has a landing page. Do Task 1 from PLAN.md §8: re-theme to dark,
add the fonts, rebuild the header/footer, add the starfield, restyle the
hero to dark two-tone. Show me the result before moving on.
```

Then, each subsequent session, one line: `Do Task N from PLAN.md.` — check it in the browser, then the next.

If Claude Code tries to jump ahead to polishing the landing or building auth/Razorpay, stop it: *"Follow PLAN.md §8 order. Build the loop first. UPI is the QR method in §4, not a real gateway."*
