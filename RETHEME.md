# LawNest — Re-theme + Layout Fix (Daylight Chambers)

> This is a **restyle pass on the existing, working build.** Do NOT rebuild the consultation loop, the schema, the seed, the AI assistant, or any routing. Every page must keep working exactly as it does now. You are only changing: (1) the colour tokens, (2) the fonts, (3) the container/layout system, (4) filling the empty left/right space on pages that currently look sparse.
>
> Work in this order: Task 1 (theme) → Task 2 (layout system) → Task 3 (per-page space fixes) → Task 4 (sweep). Commit after each. Show me the result before the next.

---

## The two problems we're fixing

1. **Theme.** Current gold-on-black reads generic. Switch to "Daylight Chambers": a light, editorial, trust-first identity — warm ivory, deep ink-navy, one restrained oxblood accent, sage-green for online/verified.
2. **Layout.** Content sits in a too-narrow centred column, so most pages have large empty gutters left and right and feel unfinished. Widen the container and give the sparse pages (hero, payment, chat, video) content that actually uses the horizontal space.

---

## Task 1 — Replace the colour tokens

Wipe the current dark tokens in `app/globals.css` and replace with these. Then find every hardcoded gold/dark value across the codebase and map it over (see the sweep list at the bottom).

```css
:root {
  --paper:      #F4EFE4;   /* page background — warm ivory */
  --surface:    #FFFFFF;   /* cards */
  --surface-2:  #FBF8F1;   /* hover / elevated / subtle fills */
  --ink:        #17233A;   /* headings + primary text — deep navy */
  --slate:      #55606E;   /* secondary text on white */
  --muted:      #6E6A5F;   /* tertiary / captions on ivory */
  --accent:     #9E2B25;   /* oxblood — the ONE accent */
  --accent-dim: #7F211C;   /* pressed / hover-darken */
  --accent-bg:  #F3E7E5;   /* oxblood tint — chips, badges */
  --verified:   #2C6E5B;   /* sage/forest green — online + verified only */
  --rule:       #E4DDCE;   /* hairlines, card borders */
  --danger:     #B23A31;   /* errors */
  --star:       #C8962E;   /* rating stars ONLY (optional, universal gold star) */
}
```

Usage rules:
- Page background is `--paper` everywhere. Cards are `--surface` with `1px solid --rule`.
- `--accent` (oxblood) is the single accent: primary buttons, the two-tone hero word, price figures, active states. Never large oxblood fills except the one hero word and primary buttons.
- `--verified` (sage) is only for the online dot and the verified badge. Nothing else.
- Text: headings `--ink`, body `--slate`, captions/labels `--muted`.
- Kill every trace of the old gold `#EBBF73 / #D4A24E / mustard` and every near-black bg. There should be no dark surfaces left **except** the video tiles (see Task 3).

### Buttons
- Primary: `background: var(--accent)`, text `#FFF`, pill radius, hover → `--accent-dim`.
- Secondary: transparent, `1px solid var(--ink)`, text `--ink`, hover → `--surface-2`.
- Focus-visible ring: `2px solid var(--accent)` with a 2px offset.

### Cards
`background: var(--surface); border: 1px solid var(--rule); border-radius: 16px; box-shadow: 0 1px 3px rgba(23,35,58,.06);` Hover: lift 2px, border → `#D8CFBC`, shadow → `0 4px 14px rgba(23,35,58,.08)`.

### Chips / tags / states
- Tier chip: text `--accent`, `1px solid` at ~35% oxblood, transparent bg, mono uppercase.
- Practice-area tag: bg `--surface-2`, text `--slate`.
- Online: sage dot + `--verified` text. Offline: muted "Next slot …".

---

## Fonts

Load via `next/font/google`:

| Role | Face | Weights | Use |
|---|---|---|---|
| Display | **Fraunces** (opsz 72) | 500, 600 | h1/h2, lawyer names, hero, section heads |
| Body | **Inter** | 400, 500, 600 | all UI text, paragraphs, forms |
| Mono | **Geist Mono** | 400, 500 | ₹ amounts, BCI numbers, ratings, timestamps, tier labels (uppercase, `letter-spacing:.04em`) |

Hero keeps the two-tone trick: base words `--ink`, one word `--accent`. Set headings tight: `h1` leading ~1.05.

---

## Task 2 — Fix the container so the sides stop feeling empty

The core layout bug: content is centred in a container that's far narrower than the viewport, leaving big empty gutters. Introduce one container system and widen it.

```css
:root { --maxw: 1200px; --gutter: clamp(20px, 5vw, 64px); }
.container { width: 100%; max-width: var(--maxw); margin-inline: auto; padding-inline: var(--gutter); }
```

- Every page section wraps its content in `.container`. Listing pages may use `--maxw: 1280px`.
- Section vertical rhythm: `padding-block: clamp(48px, 8vh, 96px)`.
- The header/nav content also sits in `.container` so the logo and nav align with page content, not floating at the far edges.

This alone removes most of the emptiness. Task 3 handles the pages that need actual content added to the sides.

---

## Task 3 — Fill the sparse pages

These four pages look marooned today. Give each a real two-region layout so it uses the width. All collapse to a single column below 900px.

### Landing hero → two columns
Right now the headline is left-aligned with a dead right half. Make the hero a 2-column grid: `grid-template-columns: 1.05fr 0.95fr; gap: 48px; align-items: center;`

- **Left:** LIVE strip → two-tone h1 → sub → two CTAs (`Find an advocate` primary, `Browse legal matters` secondary) → the ₹399/549/799 price ladder as a 3-across row.
- **Right (this is the space you're missing):** a "Advocates online now" panel — a titled card containing 2 stacked compact `LawyerCard`s pulled from real seeded online lawyers, plus a small pulsing "8 online" line. It reinforces the marketplace and fills the right column. On mobile it drops below the CTAs.

### Lawyers listing → 3 cards per row
Today it shows 2 wide cards and lots of right gutter. Fix:
- Page grid: `grid-template-columns: 264px 1fr; gap: 32px;` (filter rail + results).
- Results grid: `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;` → 3 columns on desktop, 2 on tablet, 1 on mobile.
- Container `--maxw: 1280px`. On mobile the filter rail becomes a collapsible "Filters" button opening a sheet.

### Payment → two columns
The lone narrow card feels stranded. Make it `grid-template-columns: 1.1fr 0.9fr; gap: 32px;` inside a `max-width: 980px` container.
- **Left:** the UPI QR + "Pay via UPI app" + "I've completed the payment".
- **Right:** the order summary (fee split) **plus** a short "What happens next" reassurance list — three lines: chat unlocks the moment payment lands · 30-minute session · switch to video anytime. Keep the top step indicator ("Step 2 of 3").

### Consultation chat → two-pane app layout
A single centred thread with empty sides looks unfinished. Make it a real chat app: `grid-template-columns: 1fr 300px; gap: 24px;` in a `--maxw: 1160px` container.
- **Left:** the message thread (max-width 720 inside its pane), sticky header (lawyer + online dot + Join video), the paid banner, composer pinned bottom.
- **Right side panel:** consultation details — lawyer mini-profile, slot date/time, a visual "28:41 left" session timer, the matter category, and 2 placeholder document cards. Collapses below the thread on mobile.

### Video room → bigger tiles
Center is fine for video, but enlarge it. Two tiles in `grid-template-columns: 1fr 1fr; gap: 20px;`, each ≥ 360px tall, inside a `--maxw: 1080px` container, controls bar centred below. **Video tiles stay dark** (`#14181F`) — video reads better on dark; they're the one dark element allowed on the light page, framed by the ivory background. Label chips + "connected" state restyled to the new palette.

---

## Task 4 — Sweep (find every stray old value)

Grep the whole `app/` and `components/` tree and replace:
- Old gold hexes (`#EBBF73`, `#D4A24E`, any mustard/amber accent) → `--accent` (or `--star` for rating stars only).
- Old dark backgrounds (`#0D1017`, `#0B0E14`, `#151A22`, near-black) → `--paper` / `--surface` / `--surface-2` as appropriate. Exception: video tiles.
- Any Tailwind `bg-black`, `bg-neutral-900`, `text-white`-on-dark-card patterns → the token equivalents.
- The AssistantWidget: light panel on white, oxblood launcher button, `FREE · NOT LEGAL ADVICE` label in `--muted`. Streaming text in `--slate`.
- Header/nav + footer: ivory/white, ink text, oxblood `Consult now` CTA.

Then walk **every** route at 1440px and 375px. Nothing should have a dark card, mustard accent, empty side gutters, or overflow. Every card white on ivory, one oxblood accent, sage online dots.

---

## Acceptance check (do this before calling it done)

- Home, listing, profile, payment, confirmed, chat, video room, /me, /lawyer, /admin all render on the ivory theme with zero dark surfaces (except video tiles) and zero mustard.
- No page has large empty left/right gutters — hero, payment, and chat all use two-region layouts.
- Listing shows 3 cards per row on a wide screen.
- Fraunces on headings and lawyer names; Inter body; mono on every ₹ figure.
- The whole consultation loop still works end to end (pick matter → filter → profile → UPI pay → chat → video). You did not break it.

---

## Paste this into Claude Code

```
Read RETHEME.md in full. This is a restyle-only pass on the existing working
build — do NOT touch the schema, seed, AI assistant, or the consultation loop's
logic; every page must keep working. We're switching to the light "Daylight
Chambers" theme and fixing the empty left/right gutters.

Do Task 1: replace the colour tokens in globals.css with the Daylight Chambers
palette, swap the fonts to Fraunces + Inter + Geist Mono, and restyle buttons,
cards, and chips per the spec. Then re-theme the header, footer, and landing
hero so I can see the new look. Show me before moving to Task 2.
```

Then, one line each: `Do Task 2 from RETHEME.md.` → check the browser → `Do Task 3.` → `Do Task 4.`

If it starts rewriting logic or rebuilding pages, stop it: *"Restyle only. Keep every page's behaviour identical — you're changing colour, fonts, and layout width, nothing else."*
