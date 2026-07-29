import Link from "next/link";
import { Check } from "lucide-react";
import {
  toList,
  toggleHref,
  setHref,
  activeFilterCount,
  type RawSearchParams,
} from "@/lib/search-params";
import { EXPERIENCE_BANDS, SORTS } from "@/lib/lawyers";
import { TIER_FEE } from "@/lib/money";
import { formatRupees } from "@/lib/money";

const BASE = "/lawyers";

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-rule py-5 first:border-t-0 first:pt-0">
      <p className="mono-label text-muted">{title}</p>
      <div className="mt-3 space-y-1">{children}</div>
    </div>
  );
}

function Toggle({
  href,
  active,
  label,
  hint,
}: {
  href: string;
  active: boolean;
  label: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-pressed={active}
      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface-2"
    >
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded border ${
          active ? "border-brass bg-brass text-[#14100A]" : "border-rule"
        }`}
      >
        {active && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className={active ? "text-text" : "text-text/80"}>{label}</span>
      {hint && <span className="mono-label ml-auto text-muted">{hint}</span>}
    </Link>
  );
}

export function FilterRail({
  sp,
  categories,
  cities,
  languages,
}: {
  sp: RawSearchParams;
  categories: { slug: string; name: string }[];
  cities: string[];
  languages: string[];
}) {
  const selected = {
    category: toList(sp.category),
    tier: toList(sp.tier),
    exp: toList(sp.exp),
    lang: toList(sp.lang),
    city: toList(sp.city),
  };
  const online = toList(sp.online).includes("1");
  const sort = (toList(sp.sort)[0] ?? "rating") as keyof typeof SORTS;
  const count = activeFilterCount(sp);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg">Filters</p>
        {count > 0 && (
          <Link
            href={BASE}
            scroll={false}
            className="mono-label text-brass hover:underline"
          >
            Clear {count}
          </Link>
        )}
      </div>

      <div className="mt-4">
        <Group title="Practice area">
          {categories.map((c) => (
            <Toggle
              key={c.slug}
              label={c.name}
              active={selected.category.includes(c.slug)}
              href={toggleHref(BASE, sp, "category", c.slug)}
            />
          ))}
        </Group>

        <Group title="Price">
          {(["LOWER", "MIDDLE", "HIGH"] as const).map((t) => (
            <Toggle
              key={t}
              label={formatRupees(TIER_FEE[t])}
              hint={t}
              active={selected.tier.includes(t)}
              href={toggleHref(BASE, sp, "tier", t)}
            />
          ))}
        </Group>

        <Group title="Experience">
          {Object.entries(EXPERIENCE_BANDS).map(([key, band]) => (
            <Toggle
              key={key}
              label={band.label}
              active={selected.exp.includes(key)}
              href={toggleHref(BASE, sp, "exp", key)}
            />
          ))}
        </Group>

        <Group title="Language">
          {languages.map((l) => (
            <Toggle
              key={l}
              label={l}
              active={selected.lang.includes(l)}
              href={toggleHref(BASE, sp, "lang", l)}
            />
          ))}
        </Group>

        <Group title="City">
          {cities.map((c) => (
            <Toggle
              key={c}
              label={c}
              active={selected.city.includes(c)}
              href={toggleHref(BASE, sp, "city", c)}
            />
          ))}
        </Group>

        <Group title="Availability">
          <Toggle
            label="Online now"
            active={online}
            href={toggleHref(BASE, sp, "online", "1")}
          />
        </Group>

        <Group title="Sort">
          {Object.entries(SORTS).map(([key, label]) => (
            <Link
              key={key}
              href={setHref(BASE, sp, "sort", key)}
              scroll={false}
              aria-pressed={sort === key}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface-2"
            >
              <span
                className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                  sort === key ? "border-brass" : "border-rule"
                }`}
              >
                {sort === key && (
                  <span className="size-2 rounded-full bg-brass" />
                )}
              </span>
              <span className={sort === key ? "text-text" : "text-text/80"}>
                {label}
              </span>
            </Link>
          ))}
        </Group>
      </div>
    </div>
  );
}
