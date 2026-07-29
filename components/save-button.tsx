"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Check } from "lucide-react";

export function SaveButton({ label = "Save changes" }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="cta-brass flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-medium disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
          Saving…
        </>
      ) : (
        <>
          <Check className="size-4" strokeWidth={2.5} />
          {label}
        </>
      )}
    </button>
  );
}
