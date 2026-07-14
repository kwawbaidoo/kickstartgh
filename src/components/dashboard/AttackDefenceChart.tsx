"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { MonthlyGoals } from "@/lib/matches";

const GOALS_FOR_COLOR = "#10b981";
const GOALS_AGAINST_COLOR = "#ef4444";

function AttackDefenceChart({ data }: { data: MonthlyGoals[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Not enough completed matches yet to show a trend.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          width={24}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--foreground)" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          iconType="circle"
          formatter={(value) => <span style={{ color: "var(--foreground)" }}>{value}</span>}
        />
        <Bar
          dataKey="goalsFor"
          name="Goals Scored"
          fill={GOALS_FOR_COLOR}
          radius={[4, 4, 0, 0]}
          maxBarSize={20}
          isAnimationActive={false}
        />
        <Bar
          dataKey="goalsAgainst"
          name="Goals Conceded"
          fill={GOALS_AGAINST_COLOR}
          radius={[4, 4, 0, 0]}
          maxBarSize={20}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export { AttackDefenceChart };
