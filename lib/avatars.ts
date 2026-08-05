/**
 * Which image hosts an avatar may come from.
 *
 * This list has to match `images.remotePatterns` in next.config.ts. A URL from
 * anywhere else is not merely untrusted — next/image refuses to optimise it and
 * returns a 400, so a single pasted link would break every page that renders
 * that advocate. Rejecting it at the point of entry keeps the failure in the
 * admin form, where someone can read the message and fix it.
 */
export const ALLOWED_AVATAR_HOSTS = [
  "randomuser.me",
  "img.clerk.com",
  "images.clerk.dev",
] as const;

/** Uploads are re-encoded to this square size before storing. */
export const AVATAR_PX = 256;

/**
 * Ceiling on a stored data URL. A 256px JPEG at quality 0.8 is normally
 * 10–25KB, so 200,000 characters is generous — it exists to stop a pathological
 * image becoming a database column that every listing query has to carry.
 */
export const AVATAR_MAX_CHARS = 200_000;

/**
 * An uploaded photo, stored inline rather than hosted. next/image bypasses its
 * optimiser for `data:` sources, so these need no host allowlist — there is no
 * host. The MIME type is pinned to real raster formats: `data:image/svg+xml`
 * would be a script execution vector, and nothing here needs SVG.
 */
export function isUploadedAvatar(value: string) {
  return (
    /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) &&
    value.length <= AVATAR_MAX_CHARS
  );
}

export function isAllowedAvatar(url: string) {
  if (url.startsWith("data:")) return isUploadedAvatar(url);

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return ALLOWED_AVATAR_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

/** The seeded catalog portraits, offered as one-click choices. */
export const AVATAR_PRESETS = [
  ...[11, 22, 32, 45, 51, 63, 75, 86].map(
    (n) => `https://randomuser.me/api/portraits/men/${n}.jpg`,
  ),
  ...[9, 16, 28, 33, 44, 57, 68, 79].map(
    (n) => `https://randomuser.me/api/portraits/women/${n}.jpg`,
  ),
];
