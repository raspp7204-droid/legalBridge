"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SearchPoint, SwitchPoint } from "@/lib/demand";

/* Shared axis/tooltip chrome — same treatment as EarningsChart so the three
   charts on the dashboard read as one instrument panel. */
const axis = {
  tickLine: false,
  tick: {
    fill: "var(--muted)",
    fontSize: 11,
    fontFamily: "var(--font-mono)",
  },
} as const;

const tooltip = {
  background: "var(--surface)",
  border: "1px solid var(--rule)",
  borderRadius: 12,
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--ink)",
};

/** Twelve weeks of clients searching for an advocate in this practice. */
export function SearchDemandChart({ data }: { data: SearchPoint[] }) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
          <CartesianGrid vertical={false} stroke="var(--rule)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            axisLine={{ stroke: "var(--rule)" }}
            interval="preserveStartEnd"
            minTickGap={28}
            {...axis}
          />
          <YAxis axisLine={false} width={52} {...axis} />
          <Tooltip
            cursor={{ stroke: "var(--rule)" }}
            contentStyle={tooltip}
            formatter={(v) => [`${Number(v ?? 0)}`, "Searches"]}
          />
          {/* Flat tint under the line — the palette rules out gradients. */}
          <Area
            type="monotone"
            dataKey="searches"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="var(--accent-bg)"
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 4, fill: "var(--accent)", stroke: "var(--surface)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Twelve months of people taking a legal problem online in this city. */
export function OnlineSwitchChart({ data }: { data: SwitchPoint[] }) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
          <CartesianGrid vertical={false} stroke="var(--rule)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            axisLine={{ stroke: "var(--rule)" }}
            interval="preserveStartEnd"
            minTickGap={16}
            {...axis}
          />
          <YAxis axisLine={false} width={52} {...axis} />
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            contentStyle={tooltip}
            formatter={(v, _n, item) => [
              `${Number(v ?? 0)} · ${item?.payload?.share ?? 0}% of first contact`,
              "Went online",
            ]}
          />
          <Bar dataKey="clients" fill="var(--ink)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
