"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Trophy, Users } from "lucide-react";
import { format } from "date-fns";

import type { Season } from "@/mock/seasons";
import { seasonStatusBadgeClasses, seasonStatusLabels } from "@/config/seasons";
import type { SeasonStats } from "@/lib/seasons";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

type SeasonCardProps = {
  season: Season;
  stats: SeasonStats;
};

function SeasonCard({ season, stats }: SeasonCardProps) {
  return (
    <motion.div variants={fadeInUp}>
      <Link
        href={`/seasons/${season.id}`}
        className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_8px_20px_rgba(15,23,42,0.08)] dark:shadow-none dark:ring-foreground/10 dark:hover:ring-foreground/20"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-heading text-base font-semibold text-foreground">
              {season.name}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5 shrink-0" />
              {format(new Date(season.start_date), "d MMM yyyy")} –{" "}
              {format(new Date(season.end_date), "d MMM yyyy")}
            </span>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
              seasonStatusBadgeClasses[season.status]
            )}
          >
            {seasonStatusLabels[season.status]}
          </span>
        </div>

        {season.competition_category && (
          <span className="text-xs text-muted-foreground">{season.competition_category}</span>
        )}

        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
          <div className="flex flex-col items-center gap-0.5">
            <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
              <Users className="size-3.5 text-muted-foreground" />
              {stats.registeredPlayers}
            </span>
            <span className="text-[10px] text-muted-foreground">Players</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
              <Trophy className="size-3.5 text-muted-foreground" />
              {stats.played}
            </span>
            <span className="text-[10px] text-muted-foreground">Matches</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-semibold text-foreground">{stats.winPercentage}%</span>
            <span className="text-[10px] text-muted-foreground">Win Rate</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export { SeasonCard };
