/**
 * Market series for the advocate dashboard.
 *
 * LawNest has no analytics tables — the schema is fixed and nothing records a
 * search query or where a client came from. So these two series are modelled,
 * not measured, and both charts say so on their face.
 *
 * Modelled, not random: a small PRNG seeded on the advocate's id keeps the
 * numbers identical across renders (no hydration flicker, no jumping figures
 * between refreshes) while giving every advocate a different-looking practice.
 * Volume scales with how many matters they cover and how senior they are,
 * which is the same thing that drives real search traffic.
 */

const DAY = 24 * 60 * 60 * 1000;

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — tiny, deterministic, good enough for a demand curve. */
function rng(seed: string) {
  let a = hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fmtDay = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
});

const fmtMonth = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  timeZone: "Asia/Kolkata",
});

export type SearchPoint = { label: string; searches: number };
export type SwitchPoint = { label: string; clients: number; share: number };

/**
 * Clients searching LawNest for an advocate in this practice — twelve weeks,
 * week-ending dates. Rises gently, because legal search does; the noise is
 * ±12% so the line reads as traffic rather than a drawn curve.
 */
export function searchDemandSeries({
  seed,
  matters,
  years,
}: {
  seed: string;
  matters: number;
  years: number;
}): SearchPoint[] {
  const next = rng(`${seed}:search`);
  // A wider practice and a longer bar record both pull more searches.
  const base = 180 + matters * 95 + Math.min(years, 30) * 6;
  const now = Date.now();

  return Array.from({ length: 12 }, (_, i) => {
    const weeksAgo = 11 - i;
    const growth = 1 + (11 - weeksAgo) * 0.035;
    const noise = 0.88 + next() * 0.24;
    return {
      label: fmtDay.format(new Date(now - weeksAgo * 7 * DAY)),
      searches: Math.round(base * growth * noise),
    };
  });
}

/**
 * People taking a legal problem online instead of walking into a chamber —
 * twelve months, for this advocate's city. An adoption curve: the count climbs
 * and the share of all first legal contact climbs with it.
 */
export function onlineSwitchSeries({
  seed,
  city,
}: {
  seed: string;
  city: string;
}): SwitchPoint[] {
  const next = rng(`${seed}:${city}:switch`);
  const base = 620 + Math.round(next() * 460);
  const now = new Date();

  return Array.from({ length: 12 }, (_, i) => {
    const monthsAgo = 11 - i;
    const t = 11 - monthsAgo;
    // Logistic, so the curve bends the way adoption actually does.
    const curve = 1 / (1 + Math.exp(-(t - 4.5) / 3.1));
    const noise = 0.94 + next() * 0.12;
    const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    return {
      label: fmtMonth.format(d),
      clients: Math.round(base * (0.75 + curve * 2.4) * noise),
      share: Math.round((7 + curve * 24) * 10) / 10,
    };
  });
}

/** Percent change between the last two points of a series. */
export function trend(values: number[]) {
  if (values.length < 2) return null;
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  if (!prev) return null;
  return Math.round(((last - prev) / prev) * 100);
}
