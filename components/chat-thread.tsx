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

  // Poll every 2000ms with no-store — relative URL so it works on Vercel too
  // (LAUNCH.md Task 2).
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/chat/${bookingId}`, {
          cache: "no-store",
          headers: { "cache-control": "no-cache" },
        });
        if (!res.ok || !alive) return;
        const data = (await res.json()) as {
          messages: ChatMessage[];
          endedAt: string | null;
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

        setMessages((prev) => mergeById(prev, data.messages));
        setEndedAt(data.endedAt);
      } catch {
        /* transient network blip — next tick retries */
      }
    };
    void tick();
    const timer = setInterval(tick, 2000);
    return () => {
      alive = false;
      clearInterval(timer);
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
      time: timeLabel(m.createdAt),
      state: "sent" as const,
    })),
    ...pending.map((p) => ({
      key: p.tmpId,
      mine: true,
      system: false,
      body: p.body,
      time: null,
      state: p.failed ? ("failed" as const) : ("sending" as const),
      tmpId: p.tmpId,
    })),
  ];

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

      {/* Transcript */}
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          pinnedToBottom.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {/* Thread stays a readable 720px inside a wider pane */}
        <div className="mx-auto w-full max-w-[720px] space-y-4">
          {rows.length === 0 && (
            <p className="mono-label py-10 text-center text-muted">
              New consultation · say hello to get started
            </p>
          )}

          {rows.map((r) =>
            r.system ? (
              <div key={r.key} className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-rule" aria-hidden="true" />
                <span className="mono-label rounded-full border border-rule bg-surface-2 px-3 py-1.5 text-center text-muted">
                  {r.body}
                </span>
                <span className="h-px flex-1 bg-rule" aria-hidden="true" />
              </div>
            ) : (
            <div
              key={r.key}
              className={`flex items-end gap-2 ${
                r.mine ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Chat head on both sides, so it always reads as a conversation */}
              <Avatar
                src={r.mine ? myAvatar : otherAvatar}
                name={r.mine ? myName : otherName}
                size={28}
                className="mb-4"
              />

              <div className={`min-w-0 ${r.mine ? "items-end" : "items-start"}`}>
                <p
                  className={`mono-label mb-1 text-muted ${
                    r.mine ? "text-right" : "text-left"
                  }`}
                >
                  {r.mine ? "You" : otherName.replace(/^Adv\.\s*/, "")}
                </p>

                <div
                  className={[
                    "max-w-[78%] px-3.5 py-2",
                    r.mine
                      ? "ml-auto rounded-2xl rounded-br-sm bg-accent text-white"
                      : "mr-auto rounded-2xl rounded-bl-sm border border-rule bg-surface",
                    r.state === "failed" ? "ring-2 ring-danger/50" : "",
                    r.state === "sending" ? "opacity-80" : "",
                  ].join(" ")}
                >
                  <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">
                    {r.body}
                  </p>

                  <div
                    className={`mono-label mt-1 flex items-center justify-end gap-1 ${
                      r.mine ? "text-white/70" : "text-muted"
                    }`}
                  >
                    {r.state === "sending" && (
                      <>
                        <Loader2 className="size-3 animate-spin" strokeWidth={2.5} />
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
            ),
          )}
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
