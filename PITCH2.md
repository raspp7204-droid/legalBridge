# LawNest — The Business Model, Explained Simply

**What this file is:** the money side of LawNest, written so that anyone can follow it — no business background needed. Every number here is taken from the actual working code, not made up. If you can do multiplication, you can check every line yourself.

**Who should read it:** anyone pitching LawNest, and any investor who wants to know exactly how this makes money.

> There is a longer document called `PITCH.md` that covers the problem, the market and the Q&A. **This file is about one thing: how the business earns.** Its heart is Section 4 — the advertising and promotion model. Section 4A covers the advocate subscription.

---

## 1. LawNest in one minute

India has a strange problem. There are lawyers everywhere, and almost nobody talks to one.

Not because people don't have legal problems. They do — a neighbour builds on their land, a cheque bounces, a landlord refuses to return a deposit, a job ends unfairly. They have the problem. They just never speak to a lawyer about it.

**Why? Because nobody knows what it will cost.**

If you walk into a lawyer's chamber, nothing on the wall tells you the price. You might be charged ₹500. You might be charged ₹15,000. You don't know until you're already sitting there, and by then it feels rude to walk out. So most people do the safest thing: they don't go at all. They ask a cousin. They Google it. They wait, and the problem gets worse.

**LawNest fixes exactly one thing: the price is written down before you talk.**

Pick your problem → see verified advocates → the fee is printed on the card (₹399, ₹549 or ₹799) → pick a time → pay → talk for 30 minutes by chat or video.

That's it. No haggling. No "we'll discuss fees later."

---

## 2. The one screen that explains the whole company

Before a client pays, they see this card on the advocate's page:

```
CONSULTATION                    ₹549
─────────────────────────────────────
Advocate receives               ₹440
Platform fee                    ₹109
─────────────────────────────────────
30 minutes · chat or video
```

Look at what that card does. It doesn't just show the price. **It shows our own cut.** We are telling the customer, before they pay, exactly how much we keep.

Almost no marketplace does this. Zomato doesn't tell you its commission on your pizza. Uber doesn't show the driver's share on the booking screen.

We show it, because our entire promise is "no surprises about money," and we would be liars if we hid our own fee while promising that. It costs us nothing and it buys enormous trust. **That card is the company in one picture.**

---

## 3. Way 1 to make money — Commission

This is the simple one. Every time someone books a consultation, **we keep 20% and the advocate keeps 80%.**

Three prices, decided by how experienced the advocate is:

| Experience | Client pays | Advocate gets | **LawNest gets** |
|---|---|---|---|
| Junior (2–5 years) | ₹399 | ₹320 | **₹79** |
| Middle (6–12 years) | ₹549 | ₹440 | **₹109** |
| Senior (13+ years) | ₹799 | ₹640 | **₹159** |

### Check the math yourself

Take the ₹549 one:

```
20% of 549  =  549 × 0.20  =  109.8
We round DOWN, so LawNest keeps  =  ₹109
Advocate gets the rest           =  549 − 109  =  ₹440
```

We round *down* on purpose. When there's a spare rupee, the advocate gets it, not us. It's one rupee — but the code does it that way on every booking, and it means the advocate is never short-changed by rounding.

### The problem with commission

Commission is real money, and it works today. But it has a weakness, and an investor will find it in about four seconds, so we say it first:

**Commission only exists when a booking happens.** No booking, no rupee. If bookings drop for a month, revenue drops that same month. There is no floor. It's like a shop that only earns when a customer walks in.

Also, ₹109 is small. To earn ₹1,00,000 in a month from commission alone, we need about **917 consultations**. That's 30 a day, every day. Possible — but it's a grind.

So commission alone is not the business. It's the *proof* that people want this. **The business is the next part.**

---

## 4. Way 2 to make money — Promotion (the advertising model)

### 4.1 The idea, using a shop

Walk into any supermarket. Look at the shelf at eye-level, right at the front. Then look at the bottom shelf in the last aisle.

Same shop. Same shoppers. Wildly different sales.

Here's the thing school textbooks don't mention: **the brands don't just get put there. They pay for it.** Companies pay supermarkets for eye-level shelf space, for the display at the entrance, for the stand near the till. It's called *slotting* or *placement*, and it is one of the most profitable things a supermarket does.

Why so profitable? Because **the shelf already exists.** The supermarket doesn't build a new shelf to sell the spot. It already has the shoppers, already has the shelf, and it sells the *position*. The cost of selling that position is almost zero, so almost all of the money is profit.

Newspapers do it. Google does it — search anything and the first results say "Sponsored." Amazon does it. Zomato does it.

**LawNest has a shelf too.** When a client clicks "Property & land," they see a list of advocates. Somebody is first. Somebody is fifth. And being first matters enormously — people read the top of a list far more than the bottom.

So we sell that position. That's the promotion business.

### 4.2 What exactly we sell

An advocate pays us, and their name goes to the **top of their own practice area**.

Meaning: if an advocate practises property law, and a client filters the list to "Property & land," that advocate is the first one they read. Their card carries a small grey label that says **PROMOTED**.

That's the product. It is live in the code right now — a placement is switched on from the admin console, and the advocate's position on the public listing changes immediately.

### 4.3 The three rules that stop this being a scam

This is the most important part of the whole section, and it's the part a serious investor will test hardest. An ad model in a legal marketplace can go wrong very fast — "the lawyer who paid the most appears first" sounds terrible, because it *would* be terrible.

So we wrote three hard rules into the code, not into a policy document:

**Rule 1 — Paying can never put an advocate in front of someone they don't match.**
Promotion only *re-orders* advocates who already fit what the client asked for. If a client wants a Hindi-speaking property advocate in Bengaluru, and a promoted advocate is a criminal lawyer in Kolkata, that advocate does not appear. Not higher up — *not at all*. Money moves you up the right list. It cannot move you onto the wrong list.

**Rule 2 — Every promoted card says so.**
A promoted listing carries a visible `PROMOTED` tag. We never disguise a paid position as an earned one. The label is deliberately plain and grey — it must be readable, and it must not look like a prize the advocate won.

**Rule 3 — An explicit choice by the client always wins.**
If the client sorts by "cheapest first," the cheapest advocate is first — promoted or not. If they sort by "most experienced," the most experienced is first. Promotion applies to the default view inside one practice area. **The moment a client tells us what they want, their instruction beats our advertiser's money.**

Say all three out loud in the pitch. Most people expect a marketplace to dodge this question. Answering it before it's asked is worth more than any slide.

### 4.4 The rate card

Three packages, billed monthly. Higher package, higher position.

| Package | Price per month | What it buys |
|---|---|---|
| Basic | ₹999 | Top of your practice area |
| Featured | ₹2,499 | Above Basic |
| Spotlight | ₹4,999 | First, above everyone |

There are only **12 slots**. That is deliberate, and it is the most important sentence in this section — see 4.6.

### 4.5 The maths, step by step

Take the Basic package at ₹999 a month, and ask what it is worth to an advocate.

```
Step 1 — What does one consultation earn the advocate?
         A senior advocate charges ₹799, and keeps 80%
         799 × 0.80 = ₹640

Step 2 — How many extra clients pay for one month of Basic?
         999 ÷ 640 = 1.56
         So: about 2 extra clients a month covers it

Step 3 — And across a whole year?
         999 × 12 = ₹11,988 a year
         11,988 ÷ 640 = 18.7
         So: about 19 extra clients a year
```

**Two extra clients a month.** That is the entire question an advocate has to answer. If being first in their practice area brings them two more consultations a month, Basic has paid for itself. Anything above that is profit for them.

### 4.6 Why only 12 slots?

Because scarcity is what makes an advertising slot worth anything.

If every advocate could be "first," nobody would be. The moment you sell 200 promoted positions, position 200 is worthless and nobody pays for it again. Capping the inventory keeps each slot valuable — and it means that as more advocates join, **demand for the same 12 slots rises, and the price can rise with it.**

That is the quiet power of this model. Commission per booking is fixed at 20%. But the price of a scarce advertising slot is set by how many people want it. **We are not stuck at ₹999.** Google's ad prices are not set by Google — they are set by how many advertisers want the same word.

### 4.7 Why promotion beats commission (the real argument)

This is the part that makes an investor lean forward. Compare the two income lines honestly:

| | Commission | Promotion |
|---|---|---|
| When do we earn? | Only when a booking happens | Every month, booking or not |
| Can we predict it? | No — it moves with demand | Yes — it's a signed-up amount |
| What does it cost us to deliver? | Advocate's time, support, disputes | **Almost nothing** |
| Does it grow when we grow? | Grows with bookings | Grows with bookings **and** with price |
| Is there a limit? | Limited by consultations | Limited by slots — which makes it scarce |

Read the third row twice. **Promotion revenue costs us almost nothing to deliver.**

When we earn ₹109 in commission, real things had to happen: an advocate spent 30 minutes, we ran a video room, someone might raise a complaint. There are real costs sitting behind that ₹109.

When we earn ₹999 in placement, what did we deliver? A different ordering of a list we were already showing. A database field changed from `false` to `true`. **The cost of delivering it is effectively zero, so nearly the whole amount is profit.**

That's why Google is one of the most profitable companies on earth. It isn't because search is expensive — it's because the ads are almost free to serve.

**The line to say in the pitch:**

> *"Commission proves people want this. Promotion is what makes it a business. One is money we work for. The other is money the shelf earns while we sleep."*

---

## 4A. Way 3 to make money — The advocate subscription

There is a third line, and it is the newest one.

**From their second year, every advocate pays ₹999 a year to stay listed.** The first year is free — that is the introductory offer, and it is how we get advocates onto the platform at all.

### What is actually free in year one

This matters, and getting it backwards is the fastest way to lose credibility with an investor:

| | Year 1 | Year 2 onwards |
|---|---|---|
| Subscription | **₹0** | **₹999 / year** |
| Commission on each consultation | 20% | 20% |

**The commission is never waived.** A new advocate pays 20% from their very first consultation. What they don't pay, for twelve months, is the yearly fee to be listed. Say it exactly that way — "no subscription fee for the first year," never "the first year is free."

### Why this shape is right

```
Step 1 — What does ₹999 a year come to per month?
         999 ÷ 12 = ₹83 per month

Step 2 — How many consultations cover it for a whole year?
         A senior advocate keeps ₹640 of a ₹799 consultation
         999 ÷ 640 = 1.56
         So: 2 consultations pay the entire year's subscription
```

**Two consultations a year.** Not two a month — two a *year*. If LawNest cannot bring an advocate two consultations in twelve months, they should leave, and the fee makes that decision easy and honest for them.

Three reasons this is a better instrument than it looks:

1. **It's recurring and it's predictable.** Like promotion revenue, it arrives whether or not anyone books that month. 200 advocates on subscription is ₹1,99,800 a year that does not depend on demand.
2. **It costs nothing to deliver.** Same argument as placement — the listing already exists.
3. **It quietly cleans the marketplace.** An advocate who won't pay ₹83 a month isn't taking the platform seriously, and a directory full of inactive advocates is worse than a smaller one where everyone answers. The fee removes them without us having to.

And the free first year is not generosity — it is the standard trade. We need advocates before we can have clients, so year one buys supply and year two starts earning from it.

### The honest weakness

**We have not collected a single rupee of subscription yet**, and we won't for twelve months after the first advocate joins. It is real revenue in the model and zero revenue today. Say that plainly if asked — the number is a projection with a date attached, not a result.

---

## 5. The full math, worked slowly

### 5.1 One advocate, one month

Take a mid-tier advocate, ₹549 per consultation, who does 8 consultations a month and also pays for Basic promotion.

```
COMMISSION
  8 consultations × ₹109 to LawNest  =  ₹872

PROMOTION
  Basic placement                     =  ₹999

TOTAL FROM ONE ADVOCATE               =  ₹1,871 per month
```

Notice something: **the ₹999 of placement is larger than the ₹872 of commission.** One advocate, doing a normal month of work, and the advertising line has already overtaken the commission line.

### 5.2 One hundred advocates

Now scale it. 100 verified advocates. Not every advocate advertises — realistically about 1 in 5 pays for placement.

```
COMMISSION
  100 advocates × 8 consultations   =  800 consultations
  800 × ₹109 average                =  ₹87,200

PROMOTION
  20 advocates paying ₹999          =  ₹19,980

MONTHLY TOTAL                       =  ₹1,07,180
YEARLY                              =  ₹12,86,160  (about ₹12.9 lakh)
```

### 5.3 One thousand advocates

```
COMMISSION
  1,000 × 8 = 8,000 consultations
  8,000 × ₹109                      =  ₹8,72,000

PROMOTION
  200 advocates × ₹999              =  ₹1,99,800
  (and some upgrade — say 40 move to Featured at ₹2,499
   instead of Basic, adding 40 × ₹1,500 = ₹60,000)

MONTHLY TOTAL                       =  about ₹11,31,800
YEARLY                              =  about ₹1.36 crore
```

### 5.4 The number that actually matters — profit, not revenue

Revenue is what comes in. **Profit is what's left.** They are very different, and mixing them up is the fastest way to lose credibility.

Roughly, from the ₹11.3 lakh month above:

```
Commission revenue        ₹8,72,000
  minus real costs behind it (support, disputes,
  video/chat infrastructure, refunds)
  — realistically we keep about 70%    →  about ₹6,10,000 profit

Promotion revenue         ₹2,59,800
  minus cost to deliver it
  — almost nothing                     →  about ₹2,55,000 profit
```

Now look at the ratio. Promotion is **23% of the revenue** but roughly **29% of the profit** — and it takes no extra staff to run.

Push it further. If placement prices rise as traffic grows — which is the whole logic of an ad business — commission stays flat while promotion multiplies. **This is a business whose profit grows faster than its revenue.** Investors care about that far more than the top-line number.

---

## 6. Who pays us, and why they're happy to

A business model only works if **both sides feel they won.** Here's each side's arithmetic.

### The client's arithmetic

| | Without LawNest | With LawNest |
|---|---|---|
| Knowing the price beforehand | No | Yes, printed |
| Travel to a chamber | Yes, often twice | No |
| Half a day off work | Yes | No |
| Cost of 30 minutes | Unknown, often ₹1,500+ | ₹399–₹799 |
| Risk of being overcharged | High | Zero — fee is fixed |

The client isn't paying us a fee. They're paying *less than they otherwise would*, and they know the number in advance. We're cheaper **and** more certain. That's a rare combination.

### The advocate's arithmetic

This is the one to rehearse, because advocates are the customer that actually pays us twice.

A junior advocate's real problem is not skill. It is that **nobody knows they exist.** They finished law school, they're enrolled with the Bar Council, they're sitting in a chamber waiting for a senior to hand them work.

Their options for getting clients:

| Option | Cost | Result |
|---|---|---|
| Wait for referrals | Free | Slow, unpredictable, years |
| Google/Facebook ads | ₹15,000+/month, needs skill | Some leads, mostly time-wasters |
| **LawNest placement** | **₹999/month** | Clients who have already paid |

That last row is the entire sales pitch to an advocate. And there's a detail that matters more than the price:

**Every person who reaches an advocate on LawNest has already paid.** They are not browsing. They are not "just asking." They booked a slot and their money is through. An advocate's inbox on LawNest contains zero time-wasters — and any advocate will tell you that time-wasters are the single most exhausting part of their week.

**Their return on ₹999 a month:**

```
One extra client from placement, at ₹799          =  ₹640 earned
                                                     (they keep 80%)
Placement cost for one month                      =  ₹999
Extra clients needed to break even  =  999 ÷ 640  =  1.56

So: about 2 extra clients a month pays for it.
```

Two clients a month. **An advocate who thinks being first in their practice area won't bring them two extra consultations a month doesn't believe in the platform at all** — and that's a fair thing for them to conclude, but almost nobody does.

---

## 7. What it costs us to run

Honesty here is worth more than optimism. The costs are small, and we can say exactly why.

| Cost | Roughly | Why it's low |
|---|---|---|
| Hosting the website | ₹0–₹2,000/month at this size | Serverless — we pay for what's used |
| Database | ₹0–₹1,500/month | Same |
| Payments | Close to ₹0 | UPI has no merchant fee in India |
| The AI assistant | Per question, small | Only runs when someone asks |
| Advocate verification | Staff time | The one genuinely manual job |
| Support and disputes | Staff time | Grows with bookings, not with advocates |

**The big one is verification** — a human checks each advocate's Bar Council enrolment before they go live. That is slow and it costs money, and we are keeping it that way on purpose. The verified badge is the only reason a stranger trusts an advocate on our site. The day we automate it badly is the day the badge is worth nothing.

---

## 8. Honest weaknesses (say these before you're asked)

Every pitch has holes. Naming them yourself turns a weakness into a display of judgement.

**1. Paid ads to find clients don't pay for themselves.**
We earn about ₹109 per consultation. Getting a client through Instagram or Google ads costs ₹80–₹250. At the top of that range we'd lose money on every booking. So growth cannot come from buying ads. It has to come from search, content, word of mouth, and advocates bringing their own clients onto the platform. We know this. It shapes the whole growth plan.

**2. Twelve slots is a small business until we are big.**
Even if all 12 slots sold at the top price, that is under ₹60,000 a month. The advertising line only becomes large when there is enough traffic to justify raising the price, or enough cities to justify more inventory. Today it is a proof, not a profit centre.

**3. Promotion revenue needs traffic first.**
Nobody pays for a good spot in an empty shop. The advertising business only becomes big *after* the client side is busy. Commission comes first in time; promotion comes first in profit.

**4. We are not a law firm and can never give advice.**
LawNest is a technology platform. Every page says so, and the AI assistant refuses to give legal advice and says it cannot replace a lawyer. Advocate advertising rules in India are strict — advocates cannot solicit clients. **This is why we, the platform, do the advertising, and the advocate simply appears in a directory.** That distinction is legally important and we should get it reviewed properly before scaling.

**5. Most of our numbers are projections.**
The product is real and working. The revenue at 1,000 advocates is arithmetic, not history. We say "projected" every single time, and never once say "we have."

---

## 9. What is actually built (the showcase)

This is what separates us from a team with slides. **The product exists and works.** Open it and click.

**Working right now:**

- Browse 8 legal categories, filter advocates by category, city, language, experience and price — every filter is shareable as a URL
- The fee breakdown card, showing our own cut, before payment
- Slot picking, checkout, and a confirmed booking
- Real chat between client and advocate, updating on both sides within about 2 seconds
- A video consultation room
- A client dashboard, and an advocate dashboard with earnings, payouts, slot use and practice mix
- An admin console: verify advocates, see bookings, see revenue
- **A working promotion system** — an advocate buys placement, and their position on the public listing changes immediately, labelled `PROMOTED`
- **A suggestion box** — anyone, signed in or not, can send us an idea, and it lands in an admin inbox
- An AI legal assistant that answers in simple language, replies in Hindi if you write Hindi, always says it is not legal advice, and can point you at a real advocate on the platform

**Deliberately faked, and we say so:**

- Payment is a realistic checkout screen, not a real gateway — no real money moves
- The video room shows your own camera and a static advocate tile
- Notifications are on-screen only, not SMS or email

### The 90-second demo, with the business model inside it

1. **Landing page** — the three prices, printed. *"You know the cost before you click."*
2. **Property & land → filter to Bengaluru** — the search works, results are real.
3. **Open a senior advocate → stop on the fee card.** *"₹799. The advocate gets ₹640. We keep ₹159. Shown before you pay — that's the whole company."*
4. **Pick a slot → pay → confirmed.** The booking is real, it's in the database.
5. **Open the chat** — a real conversation, already running.
6. **Join the video room** — your face appears.
7. **Switch to Admin → verification queue → approve an advocate** → they appear in the public listing instantly.
8. **The money moment.** Open `/admin/promotions`. *"Here's how we make money beyond commission. This advocate pays ₹999 a month to be first in their practice area. Watch."* Switch the campaign on, go to the listing filtered to that practice area, **their name has moved to the top with a PROMOTED label.** Then go back to the admin page and show the promotion MRR counting up.
9. **The AI assistant** — ask it in Hindi: *"मेरे पड़ोसी ने मेरी ज़मीन पर कब्ज़ा कर लिया है, क्या करूं?"* It answers in Hindi, refuses to give legal advice, and recommends the property category.

Step 8 is the one that wins. Everyone demos a booking. **Almost nobody demos their own revenue model working live.**

---

## 10. What we would do with investment

| Where the money goes | Why |
|---|---|
| Verifying advocates in 8 cities | Supply is everything. An empty marketplace is worth nothing. No advocates, no product. |
| Content and search | The only client acquisition that pays for itself at our price point. People search "cheque bounce case kya hota hai" — we should be the answer. |
| One support person | Disputes and refunds are the fastest way to lose trust, and right now nobody owns them. |
| Legal review | Bar Council advertising rules must be reviewed properly by a practising advocate before we scale the promotion business. |
| A real payment gateway | Currently simulated. Needed before a single real rupee moves. |

**What we are not spending it on:** paid advertising to find clients. The maths in Section 8 says it loses money at our price point. Saying that out loud tells an investor we can read our own numbers.

---

## 11. Numbers to memorise

If you remember nothing else, remember these. You will be asked.

| Number | What it is |
|---|---|
| **₹399 / ₹549 / ₹799** | The three consultation prices |
| **80 / 20** | Advocate keeps 80%, LawNest keeps 20% |
| **₹79 / ₹109 / ₹159** | What we earn per consultation at each tier |
| **₹999 / year** | Advocate subscription, from year two — free in year one |
| **2** | Consultations that cover a whole year's subscription |
| **₹999 / ₹2,499 / ₹4,999** | Monthly placement rate card |
| **12** | Placement slots in total — scarcity is what makes them worth buying |
| **2** | Extra clients a month an advocate needs to break even on Basic |
| **10%** | Discount on a client's first consultation |
| **~0** | What it costs us to deliver a placement — the reason this model works |

---

## 12. Small dictionary

Terms you'll hear, in plain words.

- **Marketplace** — a business that connects two groups (here: clients and advocates) and takes a cut.
- **Commission** — a percentage of each sale. Ours is 20%.
- **Placement / promotion** — paying to appear higher in a list. Same idea as a supermarket shelf or a "Sponsored" result on Google.
- **Organic** — the opposite of promoted. Ranked because you earned it, not because you paid.
- **Recurring revenue** — money that arrives every month without a new sale. Predictable. Investors value it highly.
- **Margin** — how much of the money you keep after the cost of delivering it. Placement has a very high margin.
- **Unit economics** — the profit on one single sale. If one sale loses money, a million sales lose a million times more.
- **Inventory** — the thing you have to sell. Ours is the 12 placement slots. Because there are only 12, each one stays worth paying for.
- **CAC** — Customer Acquisition Cost. What it costs to get one customer.
- **GMV** — Gross Merchandise Value. Everything customers paid, including the advocates' share. **Not our revenue** — never confuse the two in front of an investor.
- **MRR** — Monthly Recurring Revenue. The placement money that arrives every month.

---

## 13. The closing line

> *"Every legal marketplace says it connects people to lawyers. We do something narrower and harder: we put the price on the front of the door.*
>
> *That builds trust with clients, which brings advocates, which builds a place worth being seen in. And the moment a place is worth being seen in, being seen first becomes worth paying for.*
>
> *That's the business. Commission proves people want it. Advertising is what makes it worth owning."*

---

*Every figure in this document is derived from the live code — the fee split from `lib/money.ts`, the placement rate card from `lib/promotions.ts`, the first-consultation discount from `lib/offers.ts`.*

*Change a price in the code and this file must be updated to match. Projections at 100 and 1,000 advocates are arithmetic, not results, and must always be described that way.*

*A ₹2,999 three-year "founding placement" was built and then withdrawn before launch. Promotion is sold monthly only — do not quote the old figure.*
