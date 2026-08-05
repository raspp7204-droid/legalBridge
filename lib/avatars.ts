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

export function isAllowedAvatar(url: string) {
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
