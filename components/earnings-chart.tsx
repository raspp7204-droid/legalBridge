"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Last 30 days of earnings, Daylight Chambers palette (LAUNCH.md Task 4). */
export function EarningsChart({
  data,
}: {
  data: { label: string; amount: number }[];
}) {
  const empty = data.every((d) => d.amount === 0);

  return (
    <div className="h-[220px] w-full">
      {empty ? (
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-rule bg-surface-2">
          <p className="mono-label text-muted">
            No earnings in the last 30 days yet
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid
              vertical={false}
              stroke="var(--rule)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "var(--rule)" }}
              interval="preserveStartEnd"
              minTickGap={24}
              tick={{
                fill: "var(--muted)",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{
                fill: "var(--muted)",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
              }}
              tickFormatter={(v: number) => `₹${v}`}
            />
            <Tooltip
              cursor={{ fill: "var(--accent-bg)" }}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--rule)",
                borderRadius: 12,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--ink)",
              }}
              formatter={(v) => [`₹${Number(v ?? 0)}`, "Your share"]}
            />
            <Bar dataKey="amount" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
