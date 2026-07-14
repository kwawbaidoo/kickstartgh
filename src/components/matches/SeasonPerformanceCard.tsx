"use client";

import { motion } from "framer-motion";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SeasonPerformance, TrendDirection } from "@/lib/matches";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

function TrendIcon({ direction }: { direction: TrendDirection }) {
  if (direction === "up") return <TrendingUp className="size-3.5 text-emerald-600" />;
  if (direction === "down") return <TrendingDown className="size-3.5 text-destructive" />;
  return <Minus className="size-3.5 text-muted-foreground" />;
}

type Stat = {
  label: string;
  value: number;
  sublabel: string;
  trend: TrendDirection;
  colorClass: string;
};

function SeasonPerformanceCard({ performance }: { performance: SeasonPerformance }) {
  const stats: Stat[] = [
    {
      label: "Wins",
      value: performance.wins,
      sublabel: `${performance.winsPercentage}% of ${performance.played}`,
      trend: performance.winsTrend,
      colorClass: "text-emerald-600",
    },
    {
      label: "Losses",
      value: performance.losses,
      sublabel: `${performance.lossesPercentage}% of ${performance.played}`,
      trend: performance.lossesTrend,
      colorClass: "text-destructive",
    },
    {
      label: "Draws",
      value: performance.draws,
      sublabel: `${performance.drawsPercentage}% of ${performance.played}`,
      trend: performance.drawsTrend,
      colorClass: "text-amber-600",
    },
    {
      label: "Goals Scored",
      value: performance.goalsFor,
      sublabel: `${performance.goalsForAvg} avg/match`,
      trend: performance.goalsForTrend,
      colorClass: "text-emerald-600",
    },
    {
      label: "Goals Conceded",
      value: performance.goalsAgainst,
      sublabel: `${performance.goalsAgainstAvg} avg/match`,
      trend: performance.goalsAgainstTrend,
      colorClass: "text-destructive",
    },
  ];

  return (
    <motion.div variants={fadeInUp}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <h3 className="font-heading text-base font-semibold text-foreground">Season Performance</h3>
          <span className="text-xs text-muted-foreground">
            {performance.season} Season · {performance.played} matches played
          </span>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2 rounded-lg p-3 ring-1 ring-foreground/10">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <div className="flex items-center justify-between gap-1">
                <span className={cn("font-heading text-2xl font-bold", stat.colorClass)}>{stat.value}</span>
                <TrendIcon direction={stat.trend} />
              </div>
              <span className="text-xs text-muted-foreground">{stat.sublabel}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export { SeasonPerformanceCard };
