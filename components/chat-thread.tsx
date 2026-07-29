"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Video, SendHorizonal, ShieldCheck } from "lucide-react";
import type { SessionRole } from "@/lib/roles";

type ChatMessage = {
  id: string;
  senderRole: "CLIENT" | "LAWYER" | "ADMIN";
  body: string;
  createdAt: string;
};

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
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
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinnedToBottom = useRef(true);

  // Poll every 2000ms — no websockets by design (PLAN.md §3)
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/chat/${bookingId}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { messages: ChatMessage[] };
        if (!alive) return;
        setMessages((prev) => {
          // Keep optimistic messages the server hasn't echoed back yet.
          const pending = prev.filter((m) => m.id.startsWith("tmp-"));
          const serverBodies = new Set(data.messages.map((m) => m.body));
          return [
            ...data.messages,
            ...pending.filter((p) => !serverBodies.has(p.body)),
          ];
        });
      } catch {
        /* transient network blip — next tick retries */
      }
    };
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
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      senderRole: as === "LAWYER" ? "LAWYER" : "CLIENT",
      body: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);

    try {
      await fetch(`/api/chat/${bookingId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: text, senderRole: optimistic.senderRole }),
      });
    } catch {
      /* the poll will reconcile */
    } finally {
      setSending(false);
    }
  }

  const otherName = as === "LAWYER" ? clientName : lawyerName;
  const otherAvatar = as === "LAWYER" ? clientAvatar : lawyerAvatar;

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
          This consultation is paid · 30 min
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
        {messages.map((m) => {
          const mine =
            as === "LAWYER" ? m.senderRole === "LAWYER" : m.senderRole === "CLIENT";
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
                className={[
                  "max-w-[78%] rounded-2xl px-3.5 py-2",
                  mine
                    ? "rounded-br-sm border border-accent/25 bg-accent-bg"
                    : "rounded-bl-sm border border-rule bg-surface-2",
                ].join(" ")}
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
        </div>
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
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
                void send();
              }
            }}
            placeholder={`Message ${otherName.split(" ").slice(0, 2).join(" ")}…`}
            aria-label="Your message"
            className="max-h-28 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-rule bg-surface px-3.5 py-2.5 text-[0.95rem] leading-snug placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
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
