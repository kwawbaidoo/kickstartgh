"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Trend = {
  value: string;
  direction: "up" | "down";
};

type StatisticCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: Trend;
  className?: string;
};

function StatisticCard({ title, value, icon, trend, className }: StatisticCardProps) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className={cn("gap-3", className)}>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground [&>svg]:size-4.5">
              {icon}
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className="font-heading text-2xl font-semibold text-foreground">{value}</p>
            {trend && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  trend.direction === "up" ? "text-emerald-600" : "text-destructive"
                )}
              >
                {trend.direction === "up" ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {trend.value}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export { StatisticCard };
