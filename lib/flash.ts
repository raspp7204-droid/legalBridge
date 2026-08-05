/**
 * One-shot confirmations, carried across a server action's redirect.
 *
 * A server action that redirects loses any state it wanted to report, so the
 * message travels as a short key in the query string and is looked up here.
 * Keys rather than the message text itself: the wording stays in one place, it
 * cannot drift between two actions that mean the same thing, and nothing a
 * user types into the URL can put words on the screen.
 */

export const FLASH = {
  "advocate-approved": {
    tone: "success",
    text: "Advocate approved — they are live on the listing now",
  },
  "advocate-rejected": {
    tone: "info",
    text: "Advocate rejected. They can correct their details and reapply.",
  },
  "advocate-saved": { tone: "success", text: "Changes saved and live" },
  "advocate-deleted": {
    tone: "success",
    text: "Advocate deleted, along with their bookings and account",
  },
  "photo-saved": { tone: "success", text: "Photo updated" },
  "photo-rejected": {
    tone: "error",
    text: "That photo was not accepted — check the format or the image host",
  },
  "promo-saved": { tone: "success", text: "Promotion updated" },
  "promo-on": { tone: "success", text: "Promotion live — ranking updated" },
  "promo-off": { tone: "info", text: "Promotion stopped — back to organic order" },
  "feedback-read": { tone: "info", text: "Marked as read" },
  "feedback-unread": { tone: "info", text: "Moved back to unread" },
  "profile-saved": { tone: "success", text: "Your profile has been updated" },
  "action-failed": {
    tone: "error",
    text: "That did not go through. Try again.",
  },
} as const;

export type FlashKey = keyof typeof FLASH;
export type FlashTone = (typeof FLASH)[FlashKey]["tone"];

export function isFlashKey(value: unknown): value is FlashKey {
  return typeof value === "string" && value in FLASH;
}

/** `/admin/lawyers?flash=advocate-deleted` — the only way to raise one. */
export function withFlash(path: string, key: FlashKey) {
  return `${path}${path.includes("?") ? "&" : "?"}flash=${key}`;
}
