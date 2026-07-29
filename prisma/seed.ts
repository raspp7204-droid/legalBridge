import { PrismaClient, Role, Status, Tier } from "@prisma/client";
import { splitFee, TIER_FEE } from "../lib/money";

const db = new PrismaClient();

/* ------------------------------------------------------------------ */
/* Categories — blurbs written for a scared first-time user (§7)        */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  {
    slug: "divorce-family",
    name: "Divorce & family",
    icon: "HeartCrack",
    blurb:
      "Separation, maintenance, child custody or a troubled marriage — sort out what happens to your family and your money.",
  },
  {
    slug: "property-land",
    name: "Property & land",
    icon: "LandPlot",
    blurb:
      "Someone occupying your land, a builder delaying possession, or names not matching in the records.",
  },
  {
    slug: "criminal-defence",
    name: "Criminal defence",
    icon: "Gavel",
    blurb:
      "An FIR, a police notice, a bail hearing or a serious charge against you or someone in your family.",
  },
  {
    slug: "consumer-complaint",
    name: "Consumer complaint",
    icon: "ShoppingBag",
    blurb:
      "A product that broke, a service you paid for and never got, or a refund nobody will give you.",
  },
  {
    slug: "employment-workplace",
    name: "Employment & workplace",
    icon: "Briefcase",
    blurb:
      "Fired without notice, salary not paid, a forced resignation, or harassment at work.",
  },
  {
    slug: "startup-company",
    name: "Startup & company",
    icon: "Rocket",
    blurb:
      "Registering a company, founder agreements, contracts with clients, or a co-founder falling out.",
  },
  {
    slug: "cheque-bounce-recovery",
    name: "Cheque bounce & recovery",
    icon: "ReceiptIndianRupee",
    blurb:
      "A cheque that bounced, or money someone owes you and keeps refusing to return.",
  },
  {
    slug: "wills-inheritance",
    name: "Wills & inheritance",
    icon: "ScrollText",
    blurb:
      "Writing a will, claiming your share of family property, or a succession certificate after a death.",
  },
] as const;

type CategorySlug = (typeof CATEGORIES)[number]["slug"];

/* ------------------------------------------------------------------ */
/* 18 advocates — 14 VERIFIED / 3 PENDING / 1 REJECTED (§7, PLAN §6)    */
/* Tier→fee fixed. 5 HIGH / 7 MIDDLE / 6 LOWER.                         */
/* ------------------------------------------------------------------ */

type LawyerSeed = {
  name: string;
  phone: string;
  avatar: string;
  city: string;
  court: string;
  years: number;
  tier: Tier;
  bciNumber: string;
  status: Status;
  rating: number;
  reviewCount: number;
  online: boolean;
  languages: string[];
  categories: CategorySlug[];
  bio: string;
};

const men = (n: number) => `https://randomuser.me/api/portraits/men/${n}.jpg`;
const women = (n: number) =>
  `https://randomuser.me/api/portraits/women/${n}.jpg`;

const LAWYERS: LawyerSeed[] = [
  /* ---------------------------- HIGH (5) ---------------------------- */
  {
    name: "Adv. Meera Nair",
    phone: "+919845012001",
    avatar: women(44),
    city: "Bengaluru",
    court: "Karnataka High Court",
    years: 13,
    tier: Tier.HIGH,
    bciNumber: "KAR/2913/2012",
    status: Status.VERIFIED,
    rating: 4.9,
    reviewCount: 320,
    online: true,
    languages: ["Kannada", "English", "Hindi"],
    categories: ["property-land", "divorce-family", "wills-inheritance"],
    bio: "Meera argues property and matrimonial matters before the Karnataka High Court and the family courts at Bengaluru. She has handled a long run of khata transfer and mutation disputes for families splitting ancestral property.",
  },
  {
    name: "Adv. Rajat Khanna",
    phone: "+919810012002",
    avatar: men(32),
    city: "Delhi",
    court: "Delhi High Court",
    years: 21,
    tier: Tier.HIGH,
    bciNumber: "D/1187/2004",
    status: Status.VERIFIED,
    rating: 4.8,
    reviewCount: 412,
    online: true,
    languages: ["Hindi", "English", "Punjabi"],
    categories: ["criminal-defence"],
    bio: "Rajat defends economic offence and NDPS matters at the Delhi High Court and Tis Hazari. He handles bail from the remand stage and has appeared in several PMLA proceedings.",
  },
  {
    name: "Adv. Shalini Deshpande",
    phone: "+919820012003",
    avatar: women(68),
    city: "Mumbai",
    court: "Bombay High Court",
    years: 18,
    tier: Tier.HIGH,
    bciNumber: "MAH/4402/2007",
    status: Status.VERIFIED,
    rating: 4.9,
    reviewCount: 287,
    online: false,
    languages: ["Marathi", "Hindi", "English"],
    categories: ["startup-company", "employment-workplace"],
    bio: "Shalini advises founders on shareholder agreements and ESOP disputes, and appears in commercial suits before the Bombay High Court. She spent six years in-house at a listed NBFC before returning to practice.",
  },
  {
    name: "Adv. Prakash Iyer",
    phone: "+919840012004",
    avatar: men(76),
    city: "Hyderabad",
    court: "Telangana High Court",
    years: 26,
    tier: Tier.HIGH,
    bciNumber: "AP/0912/1999",
    status: Status.VERIFIED,
    rating: 4.7,
    reviewCount: 198,
    online: false,
    languages: ["Telugu", "Tamil", "English"],
    categories: ["property-land", "wills-inheritance"],
    bio: "Prakash handles partition suits and succession certificates across Telangana and coastal Andhra. Much of his work involves agricultural land where the revenue records and the sale deeds disagree.",
  },
  {
    name: "Adv. Ananya Bose",
    phone: "+919830012005",
    avatar: women(21),
    city: "Kolkata",
    court: "Calcutta High Court",
    years: 15,
    tier: Tier.HIGH,
    bciNumber: "WB/2210/2010",
    status: Status.VERIFIED,
    rating: 4.8,
    reviewCount: 241,
    online: true,
    languages: ["Bengali", "Hindi", "English"],
    categories: ["divorce-family", "employment-workplace"],
    bio: "Ananya practises matrimonial and service law before the Calcutta High Court. She has represented women in contested maintenance matters where the husband under-declares income.",
  },

  /* --------------------------- MIDDLE (7) --------------------------- */
  {
    name: "Adv. Vikram Solanki",
    phone: "+919829012006",
    avatar: men(11),
    city: "Jaipur",
    court: "Rajasthan High Court",
    years: 11,
    tier: Tier.MIDDLE,
    bciNumber: "RAJ/3318/2014",
    status: Status.VERIFIED,
    rating: 4.6,
    reviewCount: 156,
    online: true,
    languages: ["Hindi", "English"],
    categories: ["cheque-bounce-recovery", "consumer-complaint"],
    bio: "Vikram files and defends Section 138 cheque bounce complaints across Jaipur's magistrate courts. He also appears before the Rajasthan State Consumer Commission.",
  },
  {
    name: "Adv. Fatima Sheikh",
    phone: "+919821012007",
    avatar: women(90),
    city: "Mumbai",
    court: "Dindoshi Sessions Court",
    years: 9,
    tier: Tier.MIDDLE,
    bciNumber: "MAH/5521/2016",
    status: Status.VERIFIED,
    rating: 4.7,
    reviewCount: 203,
    online: true,
    languages: ["Urdu", "Hindi", "Marathi", "English"],
    categories: ["criminal-defence", "divorce-family"],
    bio: "Fatima appears in sessions trials and domestic violence matters across the Mumbai suburbs. She takes a large share of her briefs from legal aid referrals.",
  },
  {
    name: "Adv. Harpreet Singh Gill",
    phone: "+919811012008",
    avatar: men(52),
    city: "Delhi",
    court: "Saket District Court",
    years: 8,
    tier: Tier.MIDDLE,
    bciNumber: "D/6640/2017",
    status: Status.VERIFIED,
    rating: 4.5,
    reviewCount: 121,
    online: false,
    languages: ["Punjabi", "Hindi", "English"],
    categories: ["property-land", "cheque-bounce-recovery"],
    bio: "Harpreet handles landlord–tenant eviction and rent recovery in South Delhi. He has run a steady docket of builder-buyer delay complaints before the RERA authority.",
  },
  {
    name: "Adv. Divya Menon",
    phone: "+919846012009",
    avatar: women(33),
    city: "Bengaluru",
    court: "Bengaluru City Civil Court",
    years: 7,
    tier: Tier.MIDDLE,
    bciNumber: "KAR/7712/2018",
    status: Status.VERIFIED,
    rating: 4.7,
    reviewCount: 178,
    online: true,
    languages: ["Malayalam", "Kannada", "English"],
    categories: ["employment-workplace", "startup-company"],
    bio: "Divya advises salaried employees on wrongful termination and unpaid dues at Bengaluru tech companies. She drafts and contests employment bonds and non-compete clauses.",
  },
  {
    name: "Adv. Sanjay Patil",
    phone: "+919822012010",
    avatar: men(94),
    city: "Pune",
    court: "Pune District Court",
    years: 12,
    tier: Tier.MIDDLE,
    bciNumber: "MAH/2288/2013",
    status: Status.VERIFIED,
    rating: 4.6,
    reviewCount: 142,
    online: false,
    languages: ["Marathi", "Hindi", "English"],
    categories: ["property-land", "wills-inheritance"],
    bio: "Sanjay works on redevelopment agreements and society disputes across Pune's older housing societies. He regularly handles partition of jointly held flats between siblings.",
  },
  {
    name: "Adv. Neha Tripathi",
    phone: "+919839012011",
    avatar: women(57),
    city: "Lucknow",
    court: "Allahabad High Court, Lucknow Bench",
    years: 10,
    tier: Tier.MIDDLE,
    bciNumber: "UP/4419/2015",
    status: Status.VERIFIED,
    rating: 4.5,
    reviewCount: 97,
    online: false,
    languages: ["Hindi", "English"],
    categories: ["consumer-complaint", "cheque-bounce-recovery"],
    bio: "Neha represents consumers against insurers and builders before the UP State Commission. She has argued a number of mediclaim repudiation matters.",
  },
  {
    name: "Adv. Arjun Reddy",
    phone: "+919848012012",
    avatar: men(19),
    city: "Hyderabad",
    court: "Ranga Reddy District Court",
    years: 6,
    tier: Tier.MIDDLE,
    bciNumber: "TS/8830/2019",
    status: Status.VERIFIED,
    rating: 4.4,
    reviewCount: 84,
    online: false,
    languages: ["Telugu", "Hindi", "English"],
    categories: ["criminal-defence", "consumer-complaint"],
    bio: "Arjun handles bail applications and cheating complaints in the Ranga Reddy courts. He has acted in several online investment fraud matters reported through the cybercrime portal.",
  },

  /* --------------------------- LOWER (6) ---------------------------- */
  {
    name: "Adv. Kavya Rao",
    phone: "+919847012013",
    avatar: women(12),
    city: "Bengaluru",
    court: "Bengaluru Rural District Court",
    years: 4,
    tier: Tier.LOWER,
    bciNumber: "KAR/9921/2021",
    status: Status.VERIFIED,
    rating: 4.5,
    reviewCount: 62,
    online: true,
    languages: ["Kannada", "English"],
    categories: ["consumer-complaint"],
    bio: "Kavya files consumer complaints against e-commerce sellers and appliance brands. She keeps her fees low for small-value refund matters that lawyers usually turn away.",
  },
  {
    name: "Adv. Snehal Joshi",
    phone: "+919823012015",
    avatar: women(76),
    city: "Pune",
    court: "Pune District Court",
    years: 5,
    tier: Tier.LOWER,
    bciNumber: "MAH/6614/2020",
    status: Status.VERIFIED,
    rating: 4.6,
    reviewCount: 73,
    online: true,
    languages: ["Marathi", "Hindi", "English"],
    categories: ["employment-workplace", "consumer-complaint"],
    bio: "Snehal advises workers on unpaid wages and provident fund claims across Pune's industrial belt. She has settled several matters before the labour commissioner without going to trial.",
  },
  {
    name: "Adv. Rohit Barman",
    phone: "+919831012016",
    avatar: men(41),
    city: "Kolkata",
    court: "Alipore Judges Court",
    years: 4,
    tier: Tier.LOWER,
    bciNumber: "WB/7745/2021",
    status: Status.PENDING,
    rating: 4.4,
    reviewCount: 0,
    online: false,
    languages: ["Bengali", "Hindi", "English"],
    categories: ["divorce-family", "wills-inheritance"],
    bio: "Rohit handles mutual consent divorce and succession certificate applications at Alipore. He drafts wills for families with property split across West Bengal and Assam.",
  },
  {
    name: "Adv. Priyanka Chauhan",
    phone: "+919838012017",
    avatar: women(29),
    city: "Lucknow",
    court: "Lucknow District Court",
    years: 2,
    tier: Tier.LOWER,
    bciNumber: "UP/9903/2023",
    status: Status.PENDING,
    rating: 4.2,
    reviewCount: 0,
    online: false,
    languages: ["Hindi", "English"],
    categories: ["consumer-complaint", "employment-workplace"],
    bio: "Priyanka assists first-time litigants with consumer forum filings in Lucknow. She previously worked at a district legal services authority helpdesk.",
  },
  {
    name: "Adv. Mohit Agarwal",
    phone: "+919828012018",
    avatar: men(64),
    city: "Jaipur",
    court: "Jaipur District Court",
    years: 3,
    tier: Tier.LOWER,
    bciNumber: "RAJ/8817/2022",
    status: Status.PENDING,
    rating: 4.1,
    reviewCount: 0,
    online: false,
    languages: ["Hindi", "English", "Marwari"],
    categories: ["startup-company", "cheque-bounce-recovery"],
    bio: "Mohit registers private limited companies and drafts vendor contracts for Jaipur traders. He handles GST notice replies alongside his litigation work.",
  },
  {
    name: "Adv. Deepak Yadav",
    phone: "+919837012019",
    avatar: men(28),
    city: "Lucknow",
    court: "Lucknow District Court",
    years: 2,
    tier: Tier.LOWER,
    bciNumber: "UP/0000/2024",
    status: Status.REJECTED,
    rating: 4.0,
    reviewCount: 0,
    online: false,
    languages: ["Hindi"],
    categories: ["criminal-defence"],
    bio: "Deepak applied to practise criminal matters at the Lucknow district courts. His enrolment number could not be matched against the Bar Council register.",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** A Date for an IST wall-clock time N days out (IST = UTC+5:30). */
function istSlot(daysFromNow: number, hour: number, minute: number): Date {
  const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const y = istNow.getUTCFullYear();
  const m = istNow.getUTCMonth();
  const d = istNow.getUTCDate() + daysFromNow;
  return new Date(Date.UTC(y, m, d, hour, minute) - 5.5 * 60 * 60 * 1000);
}

const SLOT_TIMES: ReadonlyArray<readonly [number, number]> = [
  [10, 0],
  [11, 30],
  [14, 0],
  [16, 30],
];

async function main() {
  /* Idempotent — clear everything first, FK-safe order (§7) */
  await db.message.deleteMany();
  await db.booking.deleteMany();
  await db.slot.deleteMany();
  await db.lawyerProfile.deleteMany();
  await db.category.deleteMany();
  await db.user.deleteMany();

  await db.category.createMany({ data: [...CATEGORIES] });
  const categories = await db.category.findMany();
  const catId = (slug: string) => {
    const found = categories.find((c) => c.slug === slug);
    if (!found) throw new Error(`Unknown category slug: ${slug}`);
    return found.id;
  };

  /* Advocates — one User (role LAWYER) + one LawyerProfile each */
  const profiles: { id: string; fee: number; seed: LawyerSeed }[] = [];
  for (const l of LAWYERS) {
    const user = await db.user.create({
      data: {
        name: l.name,
        phone: l.phone,
        avatar: l.avatar,
        role: Role.LAWYER,
      },
    });

    const profile = await db.lawyerProfile.create({
      data: {
        userId: user.id,
        bio: l.bio,
        city: l.city,
        court: l.court,
        years: l.years,
        tier: l.tier,
        fee: TIER_FEE[l.tier],
        bciNumber: l.bciNumber,
        status: l.status,
        rating: l.rating,
        reviewCount: l.reviewCount,
        online: l.online,
        languages: l.languages,
        categories: {
          connect: l.categories.map((slug) => ({ id: catId(slug) })),
        },
      },
    });

    profiles.push({ id: profile.id, fee: profile.fee, seed: l });
  }

  /* Slots — verified advocates only, 8 over the next 3 days, ~30% booked */
  let slotCounter = 0;
  for (const p of profiles) {
    if (p.seed.status !== Status.VERIFIED) continue;

    const starts: Date[] = [];
    for (let day = 1; day <= 3 && starts.length < 8; day++) {
      for (const [h, m] of SLOT_TIMES) {
        if (starts.length >= 8) break;
        starts.push(istSlot(day, h, m));
      }
    }

    await db.slot.createMany({
      data: starts.map((startsAt) => ({
        lawyerId: p.id,
        startsAt,
        booked: slotCounter++ % 3 === 0, // deterministic ~30%
      })),
    });
  }

  /* Platform users — 1 admin + 3 clients, Aarav is the demo persona (§7) */
  const admin = await db.user.create({
    data: {
      name: "Riva Sharma",
      phone: "+919900000001",
      avatar: women(65),
      role: Role.ADMIN,
    },
  });

  const aarav = await db.user.create({
    data: {
      name: "Aarav Mehta",
      phone: "+919900000002",
      avatar: men(3),
      role: Role.CLIENT,
    },
  });

  await db.user.create({
    data: {
      name: "Ishita Verma",
      phone: "+919900000003",
      avatar: women(8),
      role: Role.CLIENT,
    },
  });

  await db.user.create({
    data: {
      name: "Karan Malhotra",
      phone: "+919900000004",
      avatar: men(15),
      role: Role.CLIENT,
    },
  });

  /* Pre-seeded paid demo booking: Aarav ↔ Meera Nair (HIGH), slot 2h out.
     This is the thread shown on stage — it must not be empty (PLAN §6). */
  const meera = profiles.find((p) => p.seed.name === "Adv. Meera Nair");
  if (!meera) throw new Error("Demo lawyer Meera Nair missing from seed");

  const split = splitFee(meera.fee);
  const booking = await db.booking.create({
    data: {
      clientId: aarav.id,
      lawyerId: meera.id,
      slotAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      amount: split.amount,
      lawyerCut: split.lawyerCut,
      platformCut: split.platformCut,
      paid: true,
    },
  });

  const thread: { role: Role; body: string }[] = [
    {
      role: Role.CLIENT,
      body: "Namaste ma'am. My father passed away last year and the property in Jayanagar is still in his name. My brother has applied for mutation without telling me.",
    },
    {
      role: Role.LAWYER,
      body: "Sorry for your loss. Two things decide this — whether your father left a will, and whether the khata application has already been approved by the BBMP. Do you know either?",
    },
    {
      role: Role.CLIENT,
      body: "There is no will. I checked at the BBMP office and they said the application is still under process, filed about three weeks ago.",
    },
    {
      role: Role.LAWYER,
      body: "Good, it is not too late. With no will, you and your brother inherit equally under the Hindu Succession Act. File a written objection with the Assistant Revenue Officer stating your share, and insist on an acknowledgement.",
    },
    {
      role: Role.CLIENT,
      body: "What documents will I need for that objection?",
    },
    {
      role: Role.LAWYER,
      body: "Death certificate, the original sale deed in your father's name, your Aadhaar, and an affidavit of legal heirship. Bring them to our call and I will draft the objection with you.",
    },
  ];

  const base = Date.now() - 40 * 60 * 1000;
  for (const [i, m] of thread.entries()) {
    await db.message.create({
      data: {
        bookingId: booking.id,
        senderRole: m.role,
        body: m.body,
        createdAt: new Date(base + i * 5 * 60 * 1000),
      },
    });
  }

  const [lawyers, verified, pending, rejected, online, slots, booked] =
    await Promise.all([
      db.lawyerProfile.count(),
      db.lawyerProfile.count({ where: { status: Status.VERIFIED } }),
      db.lawyerProfile.count({ where: { status: Status.PENDING } }),
      db.lawyerProfile.count({ where: { status: Status.REJECTED } }),
      db.lawyerProfile.count({ where: { online: true } }),
      db.slot.count(),
      db.slot.count({ where: { booked: true } }),
    ]);

  console.log(
    [
      `categories  ${categories.length}`,
      `advocates   ${lawyers} (${verified} verified / ${pending} pending / ${rejected} rejected)`,
      `online      ${online}`,
      `slots       ${slots} (${booked} booked)`,
      `users       ${await db.user.count()} · admin ${admin.name}`,
      `bookings    ${await db.booking.count()} · messages ${await db.message.count()}`,
    ].join("\n"),
  );
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
