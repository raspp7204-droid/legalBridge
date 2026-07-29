"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Video,
  SendHorizonal,
  ShieldCheck,
  Loader2,
  RotateCw,
} from "lucide-react";
import type { SessionRole } from "@/lib/roles";

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
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pending, setPending] = useState<Pending[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinnedToBottom = useRef(true);

  const myRole: "CLIENT" | "LAWYER" = as === "LAWYER" ? "LAWYER" : "CLIENT";

  // Poll every 2000ms with no-store — relative URL so it works on Vercel too
  // (CHAT-AND-POLISH.md Task 2).
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/chat/${bookingId}`, {
          cache: "no-store",
          headers: { "cache-control": "no-cache" },
        });
        if (!res.ok || !alive) return;
        const data = (await res.json()) as { messages: ChatMessage[] };
        if (!alive) return;
        setMessages((prev) => mergeById(prev, data.messages));
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
  }, [bookingId]);

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
        setMessages((prev) => mergeById(prev, [data.message]));
        setPending((p) => p.filter((x) => x.tmpId !== tmpId));
      } catch {
        setPending((p) =>
          p.map((x) => (x.tmpId === tmpId ? { ...x, failed: true } : x)),
        );
      }
    },
    [bookingId],
  );

  function send() {
    const text = input.trim();
    if (!text) return;
    const tmpId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setPending((p) => [
      ...p,
      { tmpId, body: text, createdAt: new Date().toISOString(), failed: false },
    ]);
    setInput("");
    pinnedToBottom.current = true;
    void deliver(tmpId, text);
  }

  const otherName = as === "LAWYER" ? clientName : lawyerName;
  const otherAvatar = as === "LAWYER" ? clientAvatar : lawyerAvatar;

  const bubbleMine =
    "rounded-br-sm border border-accent/25 bg-accent-bg";
  const bubbleTheirs = "rounded-bl-sm border border-rule bg-surface-2";

  return (
    <div className="card flex h-[calc(100vh-13rem)] min-h-[520px] flex-col overflow-hidden">
      {/* Sticky header */}
      <header className="flex items-center gap-3 border-b border-rule bg-surface-2 px-4 py-3">
        <span
          className={`shrink-0 rounded-full p-[2px] ${
            online ? "bg-verified" : "bg-rule"
          }`}
        >
          <Image
            src={otherAvatar}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
        </span>
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
        <Link
          href={`/consult/${bookingId}/room`}
          className="btn-primary mono-label flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2"
        >
          <Video className="size-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Join video</span>
        </Link>
      </header>

      {/* Paid banner */}
      <p className="flex items-center justify-center gap-1.5 border-b border-rule bg-verified/10 py-1.5">
        <ShieldCheck className="size-3.5 text-verified" strokeWidth={2.5} />
        <span className="mono-label text-verified">
          This consultation is paid · 30 min · you are{" "}
          {myRole === "LAWYER" ? "the advocate" : "the client"}
        </span>
      </p>

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
        <div className="mx-auto w-full max-w-[720px] space-y-3">
          {messages.length === 0 && pending.length === 0 && (
            <p className="mono-label py-10 text-center text-muted">
              New consultation · say hello to get started
            </p>
          )}

          {messages.map((m) => {
            const mine = m.senderRole === myRole;
            return (
              <div
                key={m.id}
                className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
              >
                {!mine && (
                  <Image
                    src={otherAvatar}
                    alt=""
                    width={28}
                    height={28}
                    className="size-7 shrink-0 rounded-full object-cover"
                  />
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2 ${mine ? bubbleMine : bubbleTheirs}`}
                >
                  <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">
                    {m.body}
                  </p>
                  <p className="mono-label mt-1 text-right text-muted">
                    {timeLabel(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Optimistic — always mine, always last */}
          {pending.map((p) => (
            <div key={p.tmpId} className="flex items-end justify-end gap-2">
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 ${bubbleMine} ${
                  p.failed ? "border-danger/40" : "opacity-80"
                }`}
              >
                <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">
                  {p.body}
                </p>
                {p.failed ? (
                  <button
                    type="button"
                    onClick={() => void deliver(p.tmpId, p.body)}
                    className="mono-label mt-1 flex items-center gap-1 text-danger hover:underline"
                  >
                    <RotateCw className="size-3" strokeWidth={2.5} />
                    Not sent — retry
                  </button>
                ) : (
                  <p className="mono-label mt-1 flex items-center justify-end gap-1 text-muted">
                    <Loader2 className="size-3 animate-spin" strokeWidth={2.5} />
                    Sending
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Composer */}
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
    </div>
  );
}
