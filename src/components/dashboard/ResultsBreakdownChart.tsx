"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS: Record<string, string> = {
  Wins: "#10b981",
  Draws: "#a1a1aa",
  Losses: "#ef4444",
};

type ResultsBreakdownChartProps = {
  wins: number;
  draws: number;
  losses: number;
};

function ResultsBreakdownChart({ wins, draws, losses }: ResultsBreakdownChartProps) {
  const total = wins + draws + losses;

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">Not enough completed matches yet to show a breakdown.</p>;
  }

  const data = [
    { name: "Wins", value: wins },
    { name: "Draws", value: draws },
    { name: "Losses", value: losses },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis hide allowDecimals={false} />
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
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={false}>
          <LabelList
            dataKey="value"
            position="top"
            style={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 600 }}
          />
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export { ResultsBreakdownChart };
