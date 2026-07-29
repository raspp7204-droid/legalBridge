"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquareText, X, ArrowUp, Square, Scale } from "lucide-react";
import { STARTER_QUESTIONS } from "@/lib/assistant";

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/assistant" }),
  });

  const busy = status === "submitted" || status === "streaming";

  // Stick to the bottom as tokens arrive.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Esc closes the panel from anywhere inside it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function submit(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    setInput("");
    void sendMessage({ text: value });
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="lb-assistant-panel"
        aria-label={open ? "Close legal assistant" : "Open free legal assistant"}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 cta-brass rounded-full px-4 py-3 transition-transform hover:-translate-y-0.5 sm:bottom-6 sm:right-6"
      >
        {open ? (
          <X className="size-5" strokeWidth={2} />
        ) : (
          <MessageSquareText className="size-5" strokeWidth={2} />
        )}
        <span className="mono-label hidden sm:inline">
          {open ? "Close" : "Ask free"}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div
          id="lb-assistant-panel"
          role="dialog"
          aria-label="LegalBridge assistant"
          className="fixed inset-x-3 bottom-20 z-40 flex max-h-[min(78vh,640px)] flex-col overflow-hidden rounded-lg border border-rule bg-surface shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[400px]"
        >
          {/* Brass rule — the one accent in this component */}
          <div className="h-[3px] w-full bg-brass" aria-hidden="true" />

          <header className="flex items-start gap-3 border-b border-rule bg-surface-2 px-4 py-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm border border-brass/40 bg-brass/15 text-brass">
              <Scale className="size-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[0.95rem] leading-tight">
                LegalBridge Assistant
              </p>
              <p className="mono-label text-muted">Free · not legal advice</p>
            </div>
          </header>

          {/* Transcript */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-[0.95rem] leading-relaxed text-muted">
                  Describe your problem in your own words. I&apos;ll explain what
                  the law generally says and point you to the right kind of
                  advocate.
                </p>
                <div className="space-y-2">
                  <p className="mono-label text-muted">Try asking</p>
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => submit(q)}
                      className="block w-full rounded-sm border border-rule bg-surface-2 px-3 py-2 text-left text-[0.9rem] leading-snug text-text transition-colors hover:border-brass/50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="space-y-4">
                {messages.map((m) => {
                  const text = m.parts
                    .filter((p) => p.type === "text")
                    .map((p) => p.text)
                    .join("");
                  const mine = m.role === "user";
                  return (
                    <li
                      key={m.id}
                      className={mine ? "flex justify-end" : "flex justify-start"}
                    >
                      <div
                        className={[
                          "max-w-[85%] whitespace-pre-wrap rounded-md px-3 py-2 text-[0.95rem] leading-relaxed",
                          mine
                            ? "border border-brass/30 bg-brass/15 text-text"
                            : "border border-rule bg-surface-2 text-text",
                        ].join(" ")}
                      >
                        {text || (
                          <span className="mono-label text-muted">Thinking…</span>
                        )}
                      </div>
                    </li>
                  );
                })}
                {status === "submitted" && (
                  <li className="flex justify-start">
                    <div className="rounded-md border border-rule bg-surface-2 px-3 py-2">
                      <span className="mono-label text-muted">Thinking…</span>
                    </div>
                  </li>
                )}
              </ul>
            )}

            {error && (
              <p className="mt-4 rounded-sm border border-danger/40 bg-surface-2 px-3 py-2 text-[0.9rem] text-danger">
                Could not reach the assistant. Please try again.
              </p>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="border-t border-rule bg-surface-2 px-3 py-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(input);
                  }
                }}
                placeholder="Describe your problem"
                aria-label="Your question"
                className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-sm border border-rule bg-bg px-3 py-2 text-[0.95rem] leading-snug text-text placeholder:text-muted"
              />
              {busy ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  aria-label="Stop generating"
                  className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-rule bg-surface text-text"
                >
                  <Square className="size-4" strokeWidth={2} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send question"
                  className="flex size-10 shrink-0 items-center justify-center cta-brass rounded-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp className="size-4" strokeWidth={2.5} />
                </button>
              )}
            </div>
            <p className="mono-label mt-2 text-muted">
              General information only · not legal advice
            </p>
          </form>
        </div>
      )}
    </>
  );
}
