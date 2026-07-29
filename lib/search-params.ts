/** Filters are pure URL state — no client store (PLAN.md §3 FilterRail). */

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function toList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function toParams(sp: RawSearchParams): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    for (const v of toList(value)) params.append(key, v);
  }
  return params;
}

/** Href with `value` added to / removed from the `key` list. */
export function toggleHref(
  base: string,
  sp: RawSearchParams,
  key: string,
  value: string,
): string {
  const params = toParams(sp);
  const current = params.getAll(key);
  params.delete(key);
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  for (const v of next) params.append(key, v);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Href with `key` set to a single value (or cleared when null). */
export function setHref(
  base: string,
  sp: RawSearchParams,
  key: string,
  value: string | null,
): string {
  const params = toParams(sp);
  params.delete(key);
  if (value !== null) params.set(key, value);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function activeFilterCount(sp: RawSearchParams): number {
  const keys = ["category", "tier", "exp", "lang", "city", "online"];
  return keys.reduce((n, k) => n + toList(sp[k]).length, 0);
}
