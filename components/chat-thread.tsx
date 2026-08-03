"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  SendHorizonal,
  ShieldCheck,
  Loader2,
  RotateCw,
  CheckCheck,
  Volume2,
  VolumeX,
  PhoneOff,
  Lock,
} from "lucide-react";
import type { SessionRole } from "@/lib/roles";
import { Avatar } from "@/components/avatar";
import { playReceive, playSend } from "@/lib/chat-sounds";

type ChatMessage = {
  id: string;
  senderRole: "CLIENT" | "LAWYER" | "ADMIN";
  body: string;
  createdAt: string;
};

/** A message we've sent but the server hasn't confirmed yet. */
type Pending = {
  tmpId: string;
  body: string;
  createdAt: string;
  failed: boolean;
};

const MUTE_KEY = "lawnest.chat.muted";

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

/** IST calendar day, so two messages either side of midnight never group. */
function dayKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(iso),
  );
}

/** "Today" / "Yesterday" / "3 Aug 2026" — the chip between days. */
function dayLabel(iso: string) {
  const key = dayKey(iso);
  const today = dayKey(new Date().toISOString());
  const yesterday = dayKey(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  );
  if (key === today) return "Today";
  if (key === yesterday) return "Yesterday";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

/** Consecutive messages from one sender inside this window read as one turn. */
const GROUP_WINDOW_MS = 5 * 60 * 1000;

/**
 * Chat wallpaper — the single strongest signal that a panel is a conversation
 * rather than a form. Legal glyphs instead of WhatsApp's doodles: scales, a
 * statute, a seal, a gavel, an open book.
 *
 * Inline <svg> with a <pattern>, not a CSS background data URI: the data-URI
 * form renders in some engines and silently not in others, and an invisible
 * wallpaper is indistinguishable from a broken one. It also sits outside the
 * scroller, so — like WhatsApp — the paper stays put while messages move.
 */
function ChatWallpaper() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full text-ink"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* patternTransform scales the tile down: at full size the glyphs read
            as illustrations competing with the bubbles, not as paper. */}
        <pattern
          id="lb-chat-paper"
          width="180"
          height="180"
          patternUnits="userSpaceOnUse"
          patternTransform="scale(0.62)"
        >
          {/* Scales */}
          <path d="M28 20v26M18 24h20M18 24l-6 11a6 6 0 0 0 12 0zM38 24l-6 11a6 6 0 0 0 12 0zM21 46h14" />
          {/* Statute */}
          <rect x="104" y="16" width="26" height="32" rx="2" />
          <path d="M110 26h14M110 33h14M110 40h9" />
          {/* Seal */}
          <circle cx="46" cy="106" r="13" />
          <circle cx="46" cy="106" r="8" />
          {/* Gavel */}
          <path d="M120 92l18 18M126 86l12 12" />
          <rect
            x="132"
            y="104"
            width="20"
            height="9"
            rx="2"
            transform="rotate(45 132 104)"
          />
          {/* Open book */}
          <path d="M76 142c6-5 14-5 18 0 4-5 12-5 18 0v20c-6-5-14-5-18 0-4-5-12-5-18 0zM94 142v20" />
          {/* Ruled marks */}
          <path d="M84 60h20M84 68h13" />
        </pattern>
      </defs>
      {/* 6% ink: reads as texture from a seat away, never fights a bubble */}
      <rect
        width="100%"
        height="100%"
        fill="url(#lb-chat-paper)"
        stroke="none"
        opacity="0.06"
      />
    </svg>
  );
}

/** Union by message id — the poll can never duplicate what we already hold. */
function mergeById(prev: ChatMessage[], incoming: ChatMessage[]) {
  const byId = new Map(prev.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) =>
    a.createdAt === b.createdAt
      ? a.id.localeCompare(b.id)
      : a.createdAt < b.createdAt
        ? -1
        : 1,
  );
}

export function ChatThread({
  bookingId,
  as,
  initialMessages,
  lawyerName,
  lawyerAvatar,
  clientName,
  clientAvatar,
  online,
  slotLabel,
  initialEndedAt,
  endAction,
}: {
  bookingId: string;
  as: SessionRole;
  initialMessages: ChatMessage[];
  lawyerName: string;
  lawyerAvatar: string;
  clientName: string;
  clientAvatar: string;
  online: boolean;
  slotLabel: string;
  initialEndedAt: string | null;
  endAction: (bookingId: string) => Promise<void>;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pending, setPending] = useState<Pending[]>([]);
  const [input, setInput] = useState("");
  const [muted, setMuted] = useState(false);
  const [endedAt, setEndedAt] = useState<string | null>(initialEndedAt);
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const [ending, startEnding] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinnedToBottom = useRef(true);
  const mutedRef = useRef(false);
  // Ids we've already rendered — anything new from the other side chimes.
  const seen = useRef(new Set(initialMessages.map((m) => m.id)));
  // Newest createdAt we hold; the poll asks the server for anything from here.
  const lastAt = useRef<string | null>(
    initialMessages.length
      ? initialMessages[initialMessages.length - 1].createdAt
      : null,
  );

  const myRole: "CLIENT" | "LAWYER" = as === "LAWYER" ? "LAWYER" : "CLIENT";

  const myName = myRole === "LAWYER" ? lawyerName : clientName;
  const myAvatar = myRole === "LAWYER" ? lawyerAvatar : clientAvatar;
  const otherName = myRole === "LAWYER" ? clientName : lawyerName;
  const otherAvatar = myRole === "LAWYER" ? clientAvatar : lawyerAvatar;

  useEffect(() => {
    const stored = window.localStorage.getItem(MUTE_KEY) === "1";
    setMuted(stored);
    mutedRef.current = stored;
  }, []);

  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      mutedRef.current = next;
      window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      return next;
    });
  }

  /* Poll for new messages.
   *
   * setTimeout chained after each response, not setInterval: the database is
   * in another region, so a poll can take longer than the interval. On an
   * interval the requests overlap and queue up behind each other, and the
   * thread gets slower the longer it stays open. Chaining guarantees exactly
   * one request in flight.
   *
   * `since` makes each poll a delta rather than a re-download of the whole
   * thread, and a hidden tab backs off to 10s — a demo laptop with the chat
   * open in a background window shouldn't keep hammering Neon. */
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const since = lastAt.current;
        const url = since
          ? `/api/chat/${bookingId}?since=${encodeURIComponent(since)}`
          : `/api/chat/${bookingId}`;
        const res = await fetch(url, {
          cache: "no-store",
          headers: { "cache-control": "no-cache" },
        });
        if (!res.ok || !alive) return;
        const data = (await res.json()) as {
          messages: ChatMessage[];
          endedAt: string | null;
          partial?: boolean;
        };
        if (!alive) return;

        const fresh = data.messages.filter((m) => !seen.current.has(m.id));
        for (const m of fresh) seen.current.add(m.id);
        // System lines don't chime — only a human on the other side does.
        if (
          fresh.some(
            (m) => m.senderRole !== myRole && m.senderRole !== "ADMIN",
          ) &&
          !mutedRef.current
        ) {
          playReceive();
        }

        for (const m of data.messages) {
          if (!lastAt.current || m.createdAt > lastAt.current) {
            lastAt.current = m.createdAt;
          }
        }

        // A delta merges into what we hold; a full read still merges, because
        // mergeById is a union either way.
        if (data.messages.length) {
          setMessages((prev) => mergeById(prev, data.messages));
        }
        setEndedAt(data.endedAt);
      } catch {
        /* transient network blip — next tick retries */
      } finally {
        if (alive) {
          const quiet =
            typeof document !== "undefined" && document.hidden ? 10000 : 2000;
          timer = setTimeout(tick, quiet);
        }
      }
    };

    void tick();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [bookingId, myRole]);

  useEffect(() => {
    if (pinnedToBottom.current) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [messages, pending]);

  /** POST one message; the row it returns is merged in straight away. */
  const deliver = useCallback(
    async (tmpId: string, text: string) => {
      setPending((p) =>
        p.map((x) => (x.tmpId === tmpId ? { ...x, failed: false } : x)),
      );
      try {
        const res = await fetch(`/api/chat/${bookingId}`, {
          method: "POST",
          cache: "no-store",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ body: text }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { message: ChatMessage };
        seen.current.add(data.message.id);
        if (!lastAt.current || data.message.createdAt > lastAt.current) {
          lastAt.current = data.message.createdAt;
        }
        setMessages((prev) => mergeById(prev, [data.message]));
        setPending((p) => p.filter((x) => x.tmpId !== tmpId));
        if (!mutedRef.current) playSend();
      } catch {
        setPending((p) =>
          p.map((x) => (x.tmpId === tmpId ? { ...x, failed: true } : x)),
        );
      }
    },
    [bookingId],
  );

  function endChat() {
    startEnding(async () => {
      await endAction(bookingId);
      setEndedAt(new Date().toISOString());
      setConfirmingEnd(false);
    });
  }

  function send() {
    const text = input.trim();
    if (!text || endedAt) return;
    const tmpId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setPending((p) => [
      ...p,
      { tmpId, body: text, createdAt: new Date().toISOString(), failed: false },
    ]);
    setInput("");
    pinnedToBottom.current = true;
    void deliver(tmpId, text);
  }

  /* Sent and received must never be mistakable for each other, so they differ
     on four axes at once: side, fill, corner tail, and the name above them.
     Mine is a solid oxblood bubble in white type; theirs is white paper. */
  const rows: {
    key: string;
    mine: boolean;
    system: boolean;
    body: string;
    at: string;
    time: string | null;
    state: "sent" | "sending" | "failed";
    tmpId?: string;
  }[] = [
    ...messages.map((m) => ({
      key: m.id,
      // ADMIN is the platform speaking, not a party — rendered as a centred
      // system line rather than a bubble on either side.
      mine: m.senderRole === myRole,
      system: m.senderRole === "ADMIN",
      body: m.body,
      at: m.createdAt,
      time: timeLabel(m.createdAt),
      state: "sent" as const,
    })),
    ...pending.map((p) => ({
      key: p.tmpId,
      mine: true,
      system: false,
      body: p.body,
      at: p.createdAt,
      time: null,
      state: p.failed ? ("failed" as const) : ("sending" as const),
      tmpId: p.tmpId,
    })),
  ];

  /* Turn the flat list into WhatsApp-shaped turns: a run of messages from one
     sender inside GROUP_WINDOW_MS is one turn, so only the first carries a
     name and only the last carries the avatar and the tail. Day boundaries
     break a turn and insert a date chip. */
  const laid = rows.map((r, i) => {
    const prev = rows[i - 1];
    const next = rows[i + 1];
    const newDay = !prev || dayKey(prev.at) !== dayKey(r.at);
    const near = (a?: (typeof rows)[number]) =>
      !!a &&
      !a.system &&
      !r.system &&
      a.mine === r.mine &&
      Math.abs(+new Date(a.at) - +new Date(r.at)) < GROUP_WINDOW_MS;

    return {
      ...r,
      dateChip: newDay ? dayLabel(r.at) : null,
      first: r.system || newDay || !near(prev),
      last:
        r.system || !near(next) || (!!next && dayKey(next.at) !== dayKey(r.at)),
    };
  });

  return (
    <div className="card flex h-[calc(100dvh-8.5rem)] min-h-0 flex-col overflow-hidden sm:h-[calc(100vh-13rem)] sm:min-h-[520px]">
      {/* Sticky header */}
      <header className="flex items-center gap-3 border-b border-rule bg-surface-2 px-4 py-3">
        <Avatar
          src={otherAvatar}
          name={otherName}
          size={40}
          ring={online ? "online" : "quiet"}
        />
        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-[0.95rem]">{otherName}</p>
          <p className="mono-label text-muted">
            {online ? (
              <span className="text-verified">● Online</span>
            ) : (
              slotLabel
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          title={muted ? "Turn message sounds on" : "Turn message sounds off"}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-rule bg-surface text-muted transition-colors hover:border-accent/40 hover:text-ink"
        >
          {muted ? (
            <VolumeX className="size-4" strokeWidth={2} />
          ) : (
            <Volume2 className="size-4" strokeWidth={2} />
          )}
          <span className="sr-only">
            {muted ? "Message sounds off" : "Message sounds on"}
          </span>
        </button>

        {/* End chat — two-step confirm in place, no browser dialog */}
        {!endedAt &&
          (confirmingEnd ? (
            <span className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={endChat}
                disabled={ending}
                className="mono-label flex items-center gap-1 rounded-full bg-danger px-3 py-2 text-white disabled:opacity-70"
              >
                {ending ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
                ) : (
                  <PhoneOff className="size-3.5" strokeWidth={2.5} />
                )}
                End
              </button>
              <button
                type="button"
                onClick={() => setConfirmingEnd(false)}
                className="mono-label rounded-full border border-rule px-3 py-2 text-slate"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingEnd(true)}
              title="End this consultation"
              className="mono-label flex shrink-0 items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-2 text-slate transition-colors hover:border-danger/50 hover:text-danger"
            >
              <PhoneOff className="size-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">End chat</span>
            </button>
          ))}

        {endedAt && (
          <span className="mono-label flex shrink-0 items-center gap-1.5 rounded-full border border-rule bg-surface-2 px-3 py-2 text-muted">
            <Lock className="size-3.5" strokeWidth={2.5} />
            Ended
          </span>
        )}
      </header>

      {/* Status banner */}
      {endedAt ? (
        <p className="flex items-center justify-center gap-1.5 border-b border-rule bg-surface-2 py-1.5">
          <Lock className="size-3.5 text-muted" strokeWidth={2.5} />
          <span className="mono-label text-muted">
            Consultation ended {timeLabel(endedAt)} · read-only
          </span>
        </p>
      ) : (
        <p className="flex items-center justify-center gap-1.5 border-b border-rule bg-verified/10 py-1.5">
          <ShieldCheck className="size-3.5 text-verified" strokeWidth={2.5} />
          <span className="mono-label text-verified">
            This consultation is paid · 30 min · you are{" "}
            {myRole === "LAWYER" ? "the advocate" : "the client"}
          </span>
        </p>
      )}

      {/* Transcript. The wallpaper is a sibling of the scroller, not its
          child, so the paper stays put while the messages move over it. */}
      <div className="relative min-h-0 flex-1 bg-surface-2">
        <ChatWallpaper />

        <div
          ref={scrollRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            pinnedToBottom.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 80;
          }}
          className="relative h-full overflow-y-auto px-4 py-4"
        >
        {/* Thread stays a readable 720px inside a wider pane */}
        <div className="mx-auto w-full max-w-[720px]">
          {laid.length === 0 && (
            <p className="mono-label py-10 text-center text-muted">
              New consultation · say hello to get started
            </p>
          )}

          {laid.map((r) => (
            <div key={r.key}>
              {/* Date chip — the run of messages under it is one day */}
              {r.dateChip && (
                <div className="flex justify-center py-3">
                  <span className="mono-label rounded-full border border-rule bg-surface/90 px-3 py-1 text-muted shadow-[0_1px_2px_rgb(23_35_58/0.05)] backdrop-blur-sm">
                    {r.dateChip}
                  </span>
                </div>
              )}

              {r.system ? (
                <div className="flex justify-center py-2">
                  <span className="mono-label max-w-[85%] rounded-lg border border-rule bg-surface/90 px-3 py-1.5 text-center leading-relaxed text-muted backdrop-blur-sm">
                    {r.body}
                  </span>
                </div>
              ) : (
                <div
                  className={`flex items-end gap-2 ${r.last ? "mb-3" : "mb-0.5"} ${
                    r.mine ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Chat head sits on the last message of a turn only — an
                      avatar beside every line makes a burst look like a crowd. */}
                  {r.last ? (
                    <Avatar
                      src={r.mine ? myAvatar : otherAvatar}
                      name={r.mine ? myName : otherName}
                      size={26}
                      className="shrink-0"
                    />
                  ) : (
                    <span className="size-[26px] shrink-0" aria-hidden="true" />
                  )}

                  <div className={`min-w-0 max-w-[78%] ${r.mine ? "ml-auto" : "mr-auto"}`}>
                    {r.first && (
                      <p
                        className={`mono-label mb-1 text-muted ${
                          r.mine ? "text-right" : "text-left"
                        }`}
                      >
                        {r.mine ? "You" : otherName.replace(/^Adv\.\s*/, "")}
                      </p>
                    )}

                    <div
                      className={[
                        "relative px-3.5 py-2 shadow-[0_1px_1.5px_rgb(23_35_58/0.10)]",
                        // Square off the tail corner only where the tail is
                        // drawn, so a grouped run reads as one shape.
                        r.mine
                          ? `rounded-2xl bg-accent text-white ${r.last ? "rounded-br-[3px]" : ""}`
                          : `rounded-2xl border border-rule bg-surface ${r.last ? "rounded-bl-[3px]" : ""}`,
                        r.state === "failed" ? "ring-2 ring-danger/50" : "",
                        r.state === "sending" ? "opacity-80" : "",
                      ].join(" ")}
                    >
                      {/* The tail itself — a clipped wedge in the bubble's own
                          fill, so it inherits colour and never seams. */}
                      {r.last && (
                        <span
                          aria-hidden="true"
                          className={`absolute bottom-0 size-3 ${
                            r.mine
                              ? "right-[-6px] bg-accent [clip-path:polygon(0_0,100%_100%,0_100%)]"
                              : "left-[-6px] border-b border-l border-rule bg-surface [clip-path:polygon(100%_0,100%_100%,0_100%)]"
                          }`}
                        />
                      )}

                      <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">
                        {r.body}
                      </p>

                      <div
                        className={`mono-label mt-0.5 flex items-center justify-end gap-1 ${
                          r.mine ? "text-white/70" : "text-muted"
                        }`}
                      >
                        {r.state === "sending" && (
                          <>
                            <Loader2
                              className="size-3 animate-spin"
                              strokeWidth={2.5}
                            />
                            Sending
                          </>
                        )}
                        {r.state === "failed" && (
                          <button
                            type="button"
                            onClick={() => r.tmpId && void deliver(r.tmpId, r.body)}
                            className="flex items-center gap-1 underline"
                          >
                            <RotateCw className="size-3" strokeWidth={2.5} />
                            Not sent — retry
                          </button>
                        )}
                        {r.state === "sent" && (
                          <>
                            {r.time}
                            {r.mine ? (
                              <CheckCheck className="size-3" strokeWidth={2.5} />
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Composer — replaced by a lock banner once the consultation ends */}
      {endedAt ? (
        <div className="border-t border-rule bg-surface-2 px-4 py-5">
          <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-3 text-center">
            <span className="flex size-9 items-center justify-center rounded-full border border-rule bg-surface text-muted">
              <Lock className="size-4" strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm">This consultation has ended</p>
              <p className="mono-label mt-1 text-muted">
                Ended {timeLabel(endedAt)} · the transcript stays available
              </p>
            </div>
            <Link
              href={myRole === "LAWYER" ? "/lawyer/inbox" : "/me"}
              className="mono-label rounded-full border border-rule bg-surface px-4 py-2 text-ink transition-colors hover:border-accent/40"
            >
              {myRole === "LAWYER"
                ? "Back to inbox"
                : "Back to my consultations"}
            </Link>
          </div>
        </div>
      ) : (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="border-t border-rule bg-surface-2 px-3 py-3"
      >
        <div className="mx-auto flex w-full max-w-[720px] items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Message ${otherName.split(" ").slice(0, 2).join(" ")}…`}
            aria-label="Your message"
            className="max-h-28 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-rule bg-surface px-3.5 py-2.5 text-[0.95rem] leading-snug placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
            className="btn-primary flex size-11 shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SendHorizonal className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
