"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { Position } from "@/mock/players";
import type { PositionBreakdown } from "@/lib/players";

const POSITION_COLORS: Record<Position, string> = {
  Goalkeeper: "#f59e0b",
  Defender: "#3b82f6",
  Midfielder: "#10b981",
  Forward: "#8b5cf6",
};

function SquadCompositionChart({ data }: { data: PositionBreakdown[] }) {
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">Add players to see your squad composition.</p>;
  }

  const chartData = data.filter((entry) => entry.count > 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="position"
          innerRadius={45}
          outerRadius={70}
          paddingAngle={2}
          strokeWidth={2}
          stroke="var(--card)"
          label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
          labelLine={false}
          isAnimationActive={false}
        >
          {chartData.map((entry) => (
            <Cell key={entry.position} fill={POSITION_COLORS[entry.position]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--foreground)" }}
        />
        <Legend
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => <span style={{ color: "var(--foreground)" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export { SquadCompositionChart };
