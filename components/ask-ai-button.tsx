"use client";

import { Sparkles } from "lucide-react";

/**
 * "Experience LawNest AI" — opens the floating assistant from anywhere on the
 * page. The widget owns its own open state, so this fires a window event it
 * listens for rather than lifting that state up into a provider.
 */
export function AskAiButton({
  className = "",
  children = "Experience LawNest AI",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new CustomEvent("lawnest:open-assistant"))
      }
      className={className}
    >
      <Sparkles className="size-4" strokeWidth={2} />
      {children}
    </button>
  );
}
