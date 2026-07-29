"use client";

import { useState } from "react";

/**
 * A chat head that always renders something. Clerk-hosted images can fail
 * (blocked host, deleted image, offline), and a broken <img> icon in a
 * conversation is worse than initials — so we fall back to initials on ink.
 */
function initials(name: string) {
  return (
    name
      .replace(/^Adv\.\s*/i, "")
      .split(/[\s.@_+-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function Avatar({
  src,
  name,
  size = 40,
  ring,
  className = "",
}: {
  src: string;
  name: string;
  size?: number;
  /** "online" draws a sage ring, "quiet" a hairline, undefined draws none. */
  ring?: "online" | "quiet";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const px = { width: size, height: size };

  const inner =
    failed || !src ? (
      <span
        aria-hidden="true"
        style={{ ...px, fontSize: Math.max(10, Math.round(size * 0.36)) }}
        className="font-mono-num flex items-center justify-center rounded-full bg-ink text-white"
      >
        {initials(name)}
      </span>
    ) : (
      /* eslint-disable-next-line @next/next/no-img-element --
         needs onError to fall back to initials; next/image swallows it */
      <img
        src={src}
        alt=""
        style={px}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="rounded-full object-cover"
      />
    );

  if (!ring) return <span className={`shrink-0 ${className}`}>{inner}</span>;

  return (
    <span
      title={name}
      className={`shrink-0 rounded-full p-[2px] ${
        ring === "online" ? "bg-verified" : "bg-rule"
      } ${className}`}
    >
      {inner}
    </span>
  );
}
