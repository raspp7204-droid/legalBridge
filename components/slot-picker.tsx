"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Zap } from "lucide-react";

type SlotDTO = {
  id: string;
  startsAt: string; // ISO
  booked: boolean;
  day: string;
  time: string;
};

export function SlotPicker({
  lawyerId,
  slots,
  fee,
  instantTime,
}: {
  lawyerId: string;
  slots: SlotDTO[];
  fee: number;
  /** IST start time if the advocate is reachable now, else null. */
  instantTime: string | null;
}) {
  // "instant" is a selection like any other slot id, so one button submits both.
  const [selected, setSelected] = useState<string | null>(
    instantTime ? "instant" : null,
  );
  const [going, setGoing] = useState(false);
  const router = useRouter();

  const days = useMemo(() => {
    const map = new Map<string, SlotDTO[]>();
    for (const s of slots) {
      const list = map.get(s.day) ?? [];
      list.push(s);
      map.set(s.day, list);
    }
    return [...map.entries()];
  }, [slots]);

  function proceed() {
    if (!selected) return;
    setGoing(true);
    router.push(
      selected === "instant"
        ? `/book/${lawyerId}/pay?instant=1`
        : `/book/${lawyerId}/pay?slot=${selected}`,
    );
  }

  const instantCard = instantTime ? (
    <button
      type="button"
      onClick={() => setSelected("instant")}
      aria-pressed={selected === "instant"}
      className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
        selected === "instant"
          ? "border-accent bg-accent-bg"
          : "border-rule bg-surface-2 hover:border-accent/40"
      }`}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-verified/15 text-verified">
        <Zap className="size-4" strokeWidth={2.5} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm text-ink">Start now</span>
          <span className="mono-label flex items-center gap-1 text-verified">
            <span className="animate-pulse-dot size-1.5 rounded-full bg-verified" />
            Online
          </span>
        </span>
        <span className="mono-label mt-0.5 block text-muted">
          Today {instantTime} · chat opens as soon as you pay
        </span>
      </span>
    </button>
  ) : null;

  const submitButton = () => (
    <>
      <button
        type="button"
        onClick={proceed}
        disabled={!selected || going}
        className="btn-primary mt-5 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-45"
      >
        {going ? (
          <>
            <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
            Opening payment…
          </>
        ) : (
          <>
            {selected === "instant" ? `Consult now · ₹${fee}` : `Consult ₹${fee}`}
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </>
        )}
      </button>

      {!selected && (
        <p className="mono-label mt-3 text-center text-muted">
          Choose a time to continue
        </p>
      )}
    </>
  );

  if (slots.length === 0) {
    if (instantCard) {
      return (
        <div className="card p-5">
          <p className="mono-label text-muted">Availability</p>
          <div className="mt-4">{instantCard}</div>
          <p className="mono-label mt-3 text-muted">
            No scheduled slots open — but this advocate is online now.
          </p>
          {submitButton()}
        </div>
      );
    }
    return (
      <div className="card p-5">
        <p className="mono-label text-muted">Availability</p>
        <p className="mt-3 text-sm text-muted">
          No open slots in the next three days. This advocate takes matters by
          appointment — start a chat and they will confirm a time.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <p className="mono-label text-muted">Pick a slot</p>

      {instantCard && <div className="mt-4">{instantCard}</div>}

      <div className="mt-4 space-y-4">
        {days.map(([day, daySlots]) => (
          <div key={day}>
            <p className="mono-label text-slate">{day}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {daySlots.map((s) => {
                const active = selected === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={s.booked}
                    onClick={() => setSelected(s.id)}
                    aria-pressed={active}
                    className={[
                      "font-mono-num rounded-lg border px-3 py-2 text-sm transition-colors",
                      s.booked
                        ? "cursor-not-allowed border-rule bg-surface-2/50 text-muted line-through"
                        : active
                          ? "border-accent bg-accent-bg text-ink"
                          : "border-rule bg-surface-2 text-ink hover:border-accent/40",
                    ].join(" ")}
                  >
                    {s.time}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {submitButton()}
    </div>
  );
}
